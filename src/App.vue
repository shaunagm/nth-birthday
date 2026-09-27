<script setup>
import { computed, ref, watch } from 'vue'
import { MILESTONES, milestoneDate, formatWhen, unitMs } from './lib/milestones.js'

const params = new URLSearchParams(window.location.search)
const initialBorn = params.get('born') || ''

const bornInput = ref(normalizeDatetimeLocal(initialBorn))
const now = ref(new Date())

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
      when: formatWhen(at),
      relative: formatRelative(ms),
    }
  }).sort((a, b) => a.at - b.at)
})

const nextUp = computed(() => rows.value.find((r) => !r.past) || null)

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

watch(bornInput, (value) => {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set('born', toQueryBorn(value))
  else url.searchParams.delete('born')
  window.history.replaceState({}, '', url)
})

function onSubmit(e) {
  e.preventDefault()
}

function formatLabel(m) {
  const n = m.n.toLocaleString('en-US')
  const unit = m.n === 1 ? m.unit.replace(/s$/, '') : m.unit
  return `${n} ${unit} old`
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

function parseBorn(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizeDatetimeLocal(raw) {
  if (!raw) return ''
  // Accept YYYY-MM-DD or full ISO; datetime-local wants YYYY-MM-DDTHH:mm
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
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="page">
    <div class="sky" aria-hidden="true"></div>

    <header class="hero">
      <p class="brand">nth.</p>
      <h1>When do you hit the weird birthdays?</h1>
      <p class="lede">
        Not candles — milestones. 10,000 days. A billion seconds. Put in when you showed up;
        we’ll spool out the moments.
      </p>

      <form class="birth-form" @submit="onSubmit">
        <label class="field">
          <span>Birth date &amp; time</span>
          <input v-model="bornInput" type="datetime-local" name="born" required />
        </label>
        <p class="hint">Time optional-ish — leave midnight if you only know the day. Shareable via the URL.</p>
      </form>

      <div v-if="ageLive" class="live" aria-live="polite">
        <span>You’ve been here</span>
        <strong>{{ ageLive.days.toLocaleString('en-US') }}</strong>
        <span>days ·</span>
        <strong>{{ ageLive.seconds.toLocaleString('en-US') }}</strong>
        <span>seconds</span>
      </div>
    </header>

    <section v-if="nextUp" class="next">
      <p class="eyebrow">Next up</p>
      <p class="next-label">{{ nextUp.label }}</p>
      <p class="next-when">{{ nextUp.when }} · {{ nextUp.relative }}</p>
    </section>

    <section v-if="rows.length" class="timeline" aria-label="Milestones">
      <div class="timeline-head">
        <h2>Milestone strip</h2>
        <button type="button" class="linkish" @click="copyLink">Copy share link</button>
      </div>
      <ol>
        <li
          v-for="row in rows"
          :key="row.id"
          :class="{ past: row.past, next: nextUp && row.id === nextUp.id }"
        >
          <div class="tick" aria-hidden="true"></div>
          <div class="row-body">
            <p class="row-label">{{ row.label }}</p>
            <p class="row-meta">{{ row.when }}</p>
            <p class="row-rel">{{ row.past ? 'already happened' : row.relative }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>
