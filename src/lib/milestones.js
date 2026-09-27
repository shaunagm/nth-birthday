export { MILESTONES, FILTER_GROUPS } from '../../data/milestones.js'

export const unitMs = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
}

/** Mean Gregorian year — used for fractional ages like π years. */
export const MEAN_YEAR_MS = 365.2425 * unitMs.days

/** Calendar anniversary: same month/day, n years later (Feb 29 → Feb 28 in non-leap years). */
export function addCalendarYears(born, years) {
  const result = new Date(born.getTime())
  const month = born.getMonth()
  const day = born.getDate()
  const targetYear = born.getFullYear() + years
  result.setFullYear(targetYear, month, day)
  if (result.getMonth() !== month) {
    result.setFullYear(targetYear, month + 1, 0)
  }
  return result
}

export function milestoneDate(born, m) {
  if (m.kind === 'years') return addCalendarYears(born, m.n)
  if (m.kind === 'year-fraction') {
    return new Date(born.getTime() + m.years * MEAN_YEAR_MS)
  }
  return new Date(born.getTime() + m.n * unitMs[m.unit])
}

export function formatLabel(m) {
  if (m.label) return m.label
  const n = m.n.toLocaleString('en-US')
  const unit = m.n === 1 ? m.unit.replace(/s$/, '') : m.unit
  return `${n} ${unit} old`
}

export function formatShort(m) {
  if (m.short) return m.short
  const n =
    m.n >= 1_000_000_000
      ? `${m.n / 1_000_000_000}B`
      : m.n >= 1_000_000
        ? `${m.n / 1_000_000}M`
        : m.n >= 1000
          ? `${m.n / 1000}k`
          : String(m.n)
  if (m.kind === 'years') return `${n}y`
  const u = { days: 'd', weeks: 'w', hours: 'h', minutes: 'm', seconds: 's' }[m.unit]
  return `${n}${u}`
}

export function formatBlurb(m) {
  if (m.blurb) return m.blurb
  if (m.kind === 'years') {
    return `The day you turn ${m.n.toLocaleString('en-US')} years old.`
  }
  const n = m.n.toLocaleString('en-US')
  return `The moment you turn ${n} ${m.unit} old — counted from your birth date/time.`
}

export function formatWhen(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
