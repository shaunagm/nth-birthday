export const unitMs = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
}

/** Fun “nth birthday” style milestones (alive for N units). */
export const MILESTONES = [
  { id: '100d', n: 100, unit: 'days' },
  { id: '1000d', n: 1000, unit: 'days' },
  { id: '5000d', n: 5000, unit: 'days' },
  { id: '10000d', n: 10000, unit: 'days' },
  { id: '15000d', n: 15000, unit: 'days' },
  { id: '20000d', n: 20000, unit: 'days' },
  { id: '1000w', n: 1000, unit: 'weeks' },
  { id: '2000w', n: 2000, unit: 'weeks' },
  { id: '10000h', n: 10000, unit: 'hours' },
  { id: '100000h', n: 100000, unit: 'hours' },
  { id: '1e6m', n: 1_000_000, unit: 'minutes' },
  { id: '1e7m', n: 10_000_000, unit: 'minutes' },
  { id: '1e9s', n: 1_000_000_000, unit: 'seconds' },
  { id: '2e9s', n: 2_000_000_000, unit: 'seconds' },
]

export function milestoneDate(born, { n, unit }) {
  return new Date(born.getTime() + n * unitMs[unit])
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
