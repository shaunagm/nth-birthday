/**
 * Build and download .ics calendars for nth. milestones.
 * Spec-ish subset: VCALENDAR / VEVENT with SUMMARY, DESCRIPTION, URL, DTSTART/DTEND.
 */

function pad(n) {
  return String(n).padStart(2, '0')
}

/** UTC timestamp for DTSTAMP / timed DTSTART: 20260115T183000Z */
export function formatUtcStamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

/** Floating local date for all-day events: 20260115 */
export function formatDateOnly(date) {
  return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate())
}

/** Add one calendar day (for exclusive DTEND on all-day events). */
export function addOneDay(date) {
  const d = new Date(date.getTime())
  d.setDate(d.getDate() + 1)
  return d
}

/** ICS text escaping for SUMMARY / DESCRIPTION. */
export function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n')
}

/**
 * Fold lines to ~75 octets (ICS recommendation).
 * Keeps it simple: split on character length, which is fine for ASCII URLs/text.
 */
export function foldLine(line) {
  const max = 75
  if (line.length <= max) return line
  let out = line.slice(0, max)
  let rest = line.slice(max)
  while (rest.length) {
    out += '\r\n ' + rest.slice(0, max - 1)
    rest = rest.slice(max - 1)
  }
  return out
}

export function buildShareUrl(bornQuery) {
  const url = new URL(window.location.href)
  url.search = ''
  if (bornQuery) url.searchParams.set('born', bornQuery)
  return url.toString()
}

import { formatBlurb } from './milestones.js'

export function eventDescription(row, shareUrl) {
  return [formatBlurb(row), '', `Open your milestones: ${shareUrl}`].join('\n')
}

/**
 * @param {object} opts
 * @param {Array} opts.events - rows with id, label, at, n, unit
 * @param {string} opts.shareUrl
 * @param {boolean} opts.allDay - use DATE values (when birth time was midnight)
 */
export function buildIcs({ events, shareUrl, allDay }) {
  const stamp = formatUtcStamp(new Date())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//nth.//birthday milestones//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const row of events) {
    const uid = `nth-${row.id}-${row.at.getTime()}@nth-birthday`
    const summary = row.label
    const description = eventDescription(row, shareUrl)

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${stamp}`)

    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(row.at)}`)
      lines.push(`DTEND;VALUE=DATE:${formatDateOnly(addOneDay(row.at))}`)
    } else {
      const start = formatUtcStamp(row.at)
      const end = formatUtcStamp(new Date(row.at.getTime() + 60 * 60 * 1000))
      lines.push(`DTSTART:${start}`)
      lines.push(`DTEND:${end}`)
    }

    lines.push(foldLine(`SUMMARY:${escapeIcsText(summary)}`))
    lines.push(foldLine(`DESCRIPTION:${escapeIcsText(description)}`))
    lines.push(foldLine(`URL:${shareUrl}`))
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

export function downloadIcs(filename, icsText) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

export function isMidnightLocal(date) {
  return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0
}
