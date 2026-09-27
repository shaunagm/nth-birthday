import { describe, expect, it } from 'vitest'
import {
  MEAN_YEAR_MS,
  MILESTONES,
  addCalendarYears,
  milestoneDate,
  unitMs,
} from './milestones.js'

function localDate(y, monthIndex, day, hour = 0, minute = 0) {
  return new Date(y, monthIndex, day, hour, minute, 0, 0)
}

function findMilestone(id) {
  const m = MILESTONES.find((row) => row.id === id)
  if (!m) throw new Error(`Missing milestone ${id}`)
  return m
}

describe('addCalendarYears', () => {
  it('lands on the same month and day N years later', () => {
    const born = localDate(1990, 4, 15, 14, 30) // May 15
    const at = addCalendarYears(born, 27)
    expect(at.getFullYear()).toBe(2017)
    expect(at.getMonth()).toBe(4)
    expect(at.getDate()).toBe(15)
    expect(at.getHours()).toBe(14)
    expect(at.getMinutes()).toBe(30)
  })

  it('clamps Feb 29 births to Feb 28 in non-leap years', () => {
    const born = localDate(2000, 1, 29) // leap day
    const at = addCalendarYears(born, 1)
    expect(at.getFullYear()).toBe(2001)
    expect(at.getMonth()).toBe(1)
    expect(at.getDate()).toBe(28)
  })

  it('keeps Feb 29 when the target year is also a leap year', () => {
    const born = localDate(2000, 1, 29)
    const at = addCalendarYears(born, 4)
    expect(at.getFullYear()).toBe(2004)
    expect(at.getMonth()).toBe(1)
    expect(at.getDate()).toBe(29)
  })
})

describe('milestoneDate — duration', () => {
  const born = localDate(1990, 0, 1, 12, 0)

  it('adds exact day counts', () => {
    const at = milestoneDate(born, { kind: 'duration', n: 100, unit: 'days' })
    expect(at.getTime() - born.getTime()).toBe(100 * unitMs.days)
  })

  it('adds exact week / hour / minute / second counts', () => {
    expect(
      milestoneDate(born, { kind: 'duration', n: 2, unit: 'weeks' }).getTime() - born.getTime()
    ).toBe(2 * unitMs.weeks)
    expect(
      milestoneDate(born, { kind: 'duration', n: 10, unit: 'hours' }).getTime() - born.getTime()
    ).toBe(10 * unitMs.hours)
    expect(
      milestoneDate(born, { kind: 'duration', n: 90, unit: 'minutes' }).getTime() - born.getTime()
    ).toBe(90 * unitMs.minutes)
    expect(
      milestoneDate(born, { kind: 'duration', n: 1_000_000_000, unit: 'seconds' }).getTime() -
        born.getTime()
    ).toBe(1_000_000_000 * unitMs.seconds)
  })

  it('matches catalog round-number milestones', () => {
    const tenThousandDays = findMilestone('10000d')
    const billionSeconds = findMilestone('1e9s')
    expect(milestoneDate(born, tenThousandDays).getTime() - born.getTime()).toBe(
      10000 * unitMs.days
    )
    expect(milestoneDate(born, billionSeconds).getTime() - born.getTime()).toBe(
      1_000_000_000 * unitMs.seconds
    )
  })
})

describe('milestoneDate — calendar years', () => {
  const born = localDate(1990, 4, 15) // May 15, 1990

  it('computes cube year birthdays on the anniversary', () => {
    const cube27 = findMilestone('cube-y-3')
    const at = milestoneDate(born, cube27)
    expect(cube27.n).toBe(27)
    expect(at.getFullYear()).toBe(2017)
    expect(at.getMonth()).toBe(4)
    expect(at.getDate()).toBe(15)
  })

  it('computes legal and fiction ages on the anniversary', () => {
    expect(milestoneDate(born, findMilestone('legal-18')).getFullYear()).toBe(2008)
    expect(milestoneDate(born, findMilestone('legal-21')).getFullYear()).toBe(2011)
    expect(milestoneDate(born, findMilestone('fiction-33-hobbit')).getFullYear()).toBe(2023)
    expect(milestoneDate(born, findMilestone('fiction-111-bilbo')).getFullYear()).toBe(2101)
    expect(milestoneDate(born, findMilestone('song-64-beatles')).getFullYear()).toBe(2054)
  })
})

describe('milestoneDate — year-fraction constants', () => {
  const born = localDate(1990, 4, 15, 0, 0)

  it('places π years at birth + π mean Gregorian years', () => {
    const pi = findMilestone('pi-years')
    const at = milestoneDate(born, pi)
    const ageYears = (at.getTime() - born.getTime()) / MEAN_YEAR_MS
    expect(ageYears).toBeCloseTo(Math.PI, 10)
  })

  it('places Avogadro and Faraday significands at the configured year fractions', () => {
    const avo = findMilestone('avogadro-years')
    const faraday = findMilestone('faraday-years')
    expect(
      (milestoneDate(born, avo).getTime() - born.getTime()) / MEAN_YEAR_MS
    ).toBeCloseTo(6.02214076, 8)
    expect(
      (milestoneDate(born, faraday).getTime() - born.getTime()) / MEAN_YEAR_MS
    ).toBeCloseTo(9.648533212, 8)
  })
})

describe('MILESTONES catalog integrity', () => {
  it('has unique ids', () => {
    const ids = MILESTONES.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every milestone a known kind and group', () => {
    for (const m of MILESTONES) {
      expect(['duration', 'years', 'year-fraction']).toContain(m.kind)
      expect(m.group).toBeTruthy()
      expect(Number.isFinite(milestoneDate(localDate(2000, 0, 1), m).getTime())).toBe(true)
    }
  })
})
