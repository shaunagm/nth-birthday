<script setup>
import { computed, ref, watch } from 'vue'
import {
  MILESTONES,
  FILTER_GROUPS,
  milestoneDate,
  formatWhen,
  formatLabel,
  formatShort,
  unitMs,
} from './lib/milestones.js'
import { buildIcs, buildShareUrl, downloadIcs, isMidnightLocal } from './lib/ics.js'

const params = new URLSearchParams(window.location.search)
const initialBorn = params.get('born') || ''
const initialParts = partsFromNormalized(normalizeDatetimeLocal(initialBorn))

const birthYear = ref(initialParts.year)
const birthMonth = ref(initialParts.month)
const birthDay = ref(initialParts.day)
/** Empty string means midnight (time optional). */
const birthTime = ref(initialParts.time)

const thisYear = new Date().getFullYear()
const yearOptions = Array.from({ length: thisYear - 1850 + 1 }, (_, i) => thisYear - i)
const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const daysInSelectedMonth = computed(() => {
  const y = Number(birthYear.value)
  const m = Number(birthMonth.value)
  if (!y || !m) return 31
  return new Date(y, m, 0).getDate()
})

const dayOptions = computed(() =>
  Array.from({ length: daysInSelectedMonth.value }, (_, i) => String(i + 1).padStart(2, '0'))
)

const bornInput = computed(() => {
  if (!birthYear.value || !birthMonth.value || !birthDay.value) return ''
  const time = birthTime.value || '00:00'
  return `${birthYear.value}-${birthMonth.value}-${birthDay.value}T${time}`
})

const now = ref(new Date())
const selectedId = ref(null)
const hoveredId = ref(null)
const copied = ref(false)
/** Hide past milestones by default to keep the rail readable. */
const showPast = ref(false)
/** Which filter groups are on. */
const enabledGroups = ref(
  Object.fromEntries(FILTER_GROUPS.map((g) => [g.id, g.defaultOn !== false]))
)
/** 'equal' = even spacing; 'time' = log(age) so early events separate without a giant empty right side. */
const spacingMode = ref('time')

setInterval(() => {
  now.value = new Date()
}, 1000)

const birthDate = computed(() => parseBorn(bornInput.value))

const rows = computed(() => {
  const born = birthDate.value
  if (!born) return []

  return MILESTONES.map((m) => {
    const at = milestoneDate(born, m)
    const ms = at.getTime() - now.value.getTime()
    return {
      ...m,
      at,
      ms,
      past: ms < 0,
      label: formatLabel(m),
      short: formatShort(m),
      when: formatWhen(at),
      relative: formatRelative(ms),
    }
  }).sort((a, b) => a.at - b.at)
})

const visibleRows = computed(() =>
  rows.value.filter((r) => {
    if (!enabledGroups.value[r.group]) return false
    if (!showPast.value && r.past) return false
    return true
  })
)

const upcoming = computed(() =>
  rows.value.filter((r) => !r.past && enabledGroups.value[r.group])
)

const activeCategoryCount = computed(
  () => FILTER_GROUPS.filter((g) => enabledGroups.value[g.id]).length
)

const nextUp = computed(() => upcoming.value[0] || null)

const selected = computed(() => visibleRows.value.find((r) => r.id === selectedId.value) || null)

const activeId = computed(
  () =>
    (hoveredId.value && visibleRows.value.some((r) => r.id === hoveredId.value) && hoveredId.value) ||
    selectedId.value ||
    nextUp.value?.id ||
    visibleRows.value[0]?.id ||
    null
)

const active = computed(() => visibleRows.value.find((r) => r.id === activeId.value) || null)

/**
 * Rail positions (0–100) for visible milestones + optional "now".
 * Time mode uses log(age from birth) so early cluster spreads out.
 * Upcoming-only: domain starts at "now" so a lone future birthday isn't stacked on the now marker.
 */
const railLayout = computed(() => {
  const list = visibleRows.value
  const born = birthDate.value
  if (!list.length || !born) {
    return { pctById: {}, nowPct: null }
  }

  if (spacingMode.value === 'equal') {
    const raw = list.map((row, i) => ({
      id: row.id,
      pct: list.length === 1 ? 50 : (i / (list.length - 1)) * 100,
    }))
    const spaced = applyMinGap(raw, 2.4)
    return {
      pctById: Object.fromEntries(spaced.map((p) => [p.id, p.pct])),
      nowPct: null,
    }
  }

  const ages = list.map((row) => Math.max(1, row.at.getTime() - born.getTime()))
  const nowAge = Math.max(1, now.value.getTime() - born.getTime())
  // Always include "now" in the domain so a lone future milestone isn't stacked on the now marker.
  const minAge = Math.min(...ages, nowAge)
  const maxAge = Math.max(...ages, nowAge)

  let pctById = {}
  let nowPct = 0

  if (maxAge <= minAge * 1.0000001) {
    // Degenerate: everything at the same age — park now at 0, milestones toward the right.
    nowPct = 0
    pctById = Object.fromEntries(
      list.map((row, i) => [row.id, list.length === 1 ? 85 : ((i + 1) / (list.length + 1)) * 100])
    )
  } else {
    const minLog = Math.log(minAge)
    const maxLog = Math.log(maxAge)
    const span = maxLog - minLog
    const toPct = (age) => clamp(((Math.log(age) - minLog) / span) * 100, 0, 100)
    const raw = list.map((row, i) => ({ id: row.id, pct: toPct(ages[i]) }))
    const spaced = applyMinGap(raw, 2.4)
    pctById = Object.fromEntries(spaced.map((p) => [p.id, p.pct]))
    nowPct = toPct(nowAge)
  }

  return { pctById, nowPct }
})

const ageLive = computed(() => {
  const born = birthDate.value
  if (!born) return null
  const ms = Math.max(0, now.value - born)
  return {
    days: Math.floor(ms / unitMs.days),
    hours: Math.floor(ms / unitMs.hours),
    minutes: Math.floor(ms / unitMs.minutes),
    seconds: Math.floor(ms / unitMs.seconds),
  }
})

watch([birthYear, birthMonth, daysInSelectedMonth], () => {
  if (!birthDay.value) return
  const max = daysInSelectedMonth.value
  if (Number(birthDay.value) > max) {
    birthDay.value = String(max).padStart(2, '0')
  }
})

watch(bornInput, (value) => {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set('born', toQueryBorn(value))
  else url.searchParams.delete('born')
  window.history.replaceState({}, '', url)
  selectedId.value = null
  hoveredId.value = null
})

watch([nextUp, visibleRows], () => {
  if (selectedId.value && !visibleRows.value.some((r) => r.id === selectedId.value)) {
    selectedId.value = nextUp.value?.id || visibleRows.value[0]?.id || null
  } else if (!selectedId.value && nextUp.value) {
    selectedId.value = nextUp.value.id
  }
})

function pctFor(row) {
  const pct = railLayout.value.pctById[row.id]
  return pct == null ? 50 : pct
}

function applyMinGap(points, minGap) {
  const sorted = [...points].sort((a, b) => a.pct - b.pct)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].pct - sorted[i - 1].pct < minGap) {
      sorted[i] = { ...sorted[i], pct: sorted[i - 1].pct + minGap }
    }
  }
  const last = sorted[sorted.length - 1]
  if (last && last.pct > 100) {
    const scale = 100 / last.pct
    return sorted.map((p) => ({ ...p, pct: p.pct * scale }))
  }
  return sorted
}

function select(row) {
  selectedId.value = row.id
}

function toggleGroup(id) {
  enabledGroups.value = {
    ...enabledGroups.value,
    [id]: !enabledGroups.value[id],
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function onSubmit(e) {
  e.preventDefault()
}

function formatRelative(ms) {
  const abs = Math.abs(ms)
  const days = abs / unitMs.days
  if (days >= 365.25) {
    const y = days / 365.25
    return `${y.toFixed(1)} years ${ms < 0 ? 'ago' : 'from now'}`
  }
  if (days >= 1) {
    return `${Math.floor(days).toLocaleString('en-US')} days ${ms < 0 ? 'ago' : 'from now'}`
  }
  const hours = abs / unitMs.hours
  if (hours >= 1) {
    return `${Math.floor(hours)} hours ${ms < 0 ? 'ago' : 'from now'}`
  }
  const mins = abs / unitMs.minutes
  return `${Math.max(1, Math.floor(mins))} min ${ms < 0 ? 'ago' : 'from now'}`
}

function partsFromNormalized(normalized) {
  if (!normalized) return { year: '', month: '', day: '', time: '' }
  const [date, time = '00:00'] = normalized.split('T')
  const [year = '', month = '', day = ''] = date.split('-')
  return {
    year,
    month,
    day,
    time: time === '00:00' ? '' : time.slice(0, 5),
  }
}

function parseBorn(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizeDatetimeLocal(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00`
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return raw.slice(0, 16)
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toQueryBorn(value) {
  if (/T00:00$/.test(value)) return value.slice(0, 10)
  return value
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    // ignore
  }
}

function shareUrl() {
  return buildShareUrl(bornInput.value ? toQueryBorn(bornInput.value) : '')
}

function exportEvents(events, filename) {
  const born = birthDate.value
  if (!born || !events.length) return
  const ics = buildIcs({
    events,
    shareUrl: shareUrl(),
    allDay: isMidnightLocal(born),
  })
  downloadIcs(filename, ics)
}

function downloadUpcoming() {
  exportEvents(upcoming.value, 'nth-upcoming-birthdays.ics')
}

function downloadSelected() {
  if (!selected.value) return
  exportEvents([selected.value], `nth-${selected.value.id}.ics`)
}
</script>

<template>
  <div class="page">
    <div class="sky" aria-hidden="true"></div>

    <header class="hero">
      <h1 class="brand" aria-label="nth.">
        <span class="c1">n</span><span class="c2">t</span><span class="c3">h</span><span class="c1">.</span>
      </h1>
      <p class="lede">
        Enter your birthday and see a bunch of fun birthdays and landmark ages.
      </p>

      <form class="birth-form" @submit="onSubmit">
        <div class="date-fields" role="group" aria-label="Birth date and time">
          <label class="field">
            <span>Year</span>
            <select v-model="birthYear" name="year" required>
              <option disabled value="">Year</option>
              <option v-for="y in yearOptions" :key="y" :value="String(y)">{{ y }}</option>
            </select>
          </label>
          <label class="field">
            <span>Month</span>
            <select v-model="birthMonth" name="month" required>
              <option disabled value="">Month</option>
              <option v-for="m in MONTHS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </label>
          <label class="field">
            <span>Day</span>
            <select v-model="birthDay" name="day" required>
              <option disabled value="">Day</option>
              <option v-for="d in dayOptions" :key="d" :value="d">{{ Number(d) }}</option>
            </select>
          </label>
          <label class="field field-time">
            <span>Time</span>
            <input v-model="birthTime" type="time" name="time" />
          </label>
        </div>
        <p class="hint">Time is optional — default is midnight.</p>
      </form>

      <div v-if="ageLive" class="live" aria-live="polite">
        <span>So far:</span>
        <strong>{{ ageLive.days.toLocaleString('en-US') }}</strong>
        <span>days ·</span>
        <strong>{{ ageLive.seconds.toLocaleString('en-US') }}</strong>
        <span>seconds</span>
      </div>

      <div v-if="rows.length" class="hero-actions">
        <button
          type="button"
          class="linkish"
          :disabled="!upcoming.length"
          @click="downloadUpcoming"
        >
          Download upcoming (.ics)
        </button>
        <button type="button" class="linkish" @click="copyLink">
          {{ copied ? 'Copied' : 'Copy share link' }}
        </button>
      </div>
    </header>

    <section v-if="rows.length" class="map" aria-label="Birthday milestones">
      <div class="map-head">
        <h2 class="map-title">Timeline</h2>
        <div class="map-tools">
          <div class="segmented" role="radiogroup" aria-label="How milestones are spaced">
            <button
              type="button"
              role="radio"
              :aria-checked="spacingMode === 'equal'"
              :class="{ on: spacingMode === 'equal' }"
              @click="spacingMode = 'equal'"
            >
              Even
            </button>
            <button
              type="button"
              role="radio"
              :aria-checked="spacingMode === 'time'"
              :class="{ on: spacingMode === 'time' }"
              @click="spacingMode = 'time'"
            >
              By age
            </button>
          </div>
          <button
            type="button"
            class="tool-toggle"
            :aria-pressed="showPast"
            @click="showPast = !showPast"
          >
            Past
          </button>
        </div>
      </div>

      <details class="filter-drawer">
        <summary>
          What to include
          <span class="filter-count">{{ activeCategoryCount }} on</span>
        </summary>
        <div class="filters" role="group" aria-label="Milestone categories">
          <button
            v-for="g in FILTER_GROUPS"
            :key="g.id"
            type="button"
            class="chip"
            :aria-pressed="enabledGroups[g.id]"
            @click="toggleGroup(g.id)"
          >
            {{ g.label }}
          </button>
        </div>
      </details>

      <div v-if="!visibleRows.length" class="empty-rail">
        Nothing to show with these filters. Open “What to include” and turn a category on, or include Past.
      </div>

      <div v-else class="rail-wrap">
        <div class="rail" role="list">
          <div class="rail-track" aria-hidden="true"></div>
          <div
            v-if="railLayout.nowPct != null"
            class="now-marker"
            :style="{ left: railLayout.nowPct + '%' }"
            aria-hidden="true"
            title="Now"
          >
            <span class="now-label">now</span>
          </div>

          <button
            v-for="(row, i) in visibleRows"
            :key="row.id"
            type="button"
            role="listitem"
            class="beat"
            :class="{
              past: row.past,
              next: nextUp && row.id === nextUp.id,
              selected: selectedId === row.id,
              peek: activeId === row.id,
              edgeStart: i === 0,
              edgeEnd: i === visibleRows.length - 1,
            }"
            :style="{ left: pctFor(row) + '%' }"
            :aria-pressed="selectedId === row.id"
            :aria-label="row.label"
            @mouseenter="hoveredId = row.id"
            @mouseleave="hoveredId = null"
            @focus="hoveredId = row.id"
            @blur="hoveredId = null"
            @click="select(row)"
          >
            <span class="beat-dot"></span>
            <span class="beat-tip">{{ row.label }}</span>
          </button>
        </div>
      </div>

      <div v-if="active" class="detail" :class="{ past: active.past, locked: !!selectedId && !hoveredId }">
        <p class="eyebrow">{{ hoveredId && hoveredId !== selectedId ? 'Hovering' : active.past ? 'Past' : nextUp && active.id === nextUp.id ? 'Coming up' : 'Selected' }}</p>
        <p class="detail-label">{{ active.label }}</p>
        <p class="detail-when">{{ active.when }}</p>
        <p class="detail-rel">{{ active.past ? `Already happened · ${active.relative}` : active.relative }}</p>
        <p v-if="active.blurb" class="detail-blurb">{{ active.blurb }}</p>
        <div class="detail-actions">
          <button
            v-if="selected"
            type="button"
            class="linkish"
            @click="downloadSelected"
          >
            Download this one (.ics)
          </button>
          <p v-else class="detail-hint">Click a dot to keep it selected.</p>
        </div>
      </div>
    </section>
  </div>
</template>
