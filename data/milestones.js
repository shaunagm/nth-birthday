/**
 * Milestone catalog for nth.
 *
 * Add new dates here — you usually do not need to touch any other file.
 * See README.md → “Adding a milestone” for field docs and PR tips.
 *
 * Kinds:
 * - duration      — alive for `n` of `unit` (seconds|minutes|hours|days|weeks)
 * - years         — calendar age `n` (same month/day as birth)
 * - year-fraction — continuous age of `years` mean Gregorian years from birth
 *
 * Categories (UI filters): math | legal | fiction | songs
 * Groups must also appear in FILTER_GROUPS below (or reuse an existing group id).
 */

function cubeYearMilestones(roots) {
  return roots.map((root) => {
    const n = root ** 3
    return {
      id: `cube-y-${root}`,
      kind: 'years',
      category: 'math',
      group: 'cubes',
      n,
      root,
      tag: 'cube',
      label: `${n.toLocaleString('en-US')} years old (${root}³)`,
      short: `${root}³y`,
      blurb: `A cube birthday — you turn ${n} (${root}³) years old.`,
    }
  })
}

export const MILESTONES = [
  // Round duration ages
  { id: '100d', kind: 'duration', category: 'math', group: 'round', n: 100, unit: 'days' },
  { id: '1000d', kind: 'duration', category: 'math', group: 'round', n: 1000, unit: 'days' },
  { id: '5000d', kind: 'duration', category: 'math', group: 'round', n: 5000, unit: 'days' },
  { id: '10000d', kind: 'duration', category: 'math', group: 'round', n: 10000, unit: 'days' },
  { id: '15000d', kind: 'duration', category: 'math', group: 'round', n: 15000, unit: 'days' },
  { id: '20000d', kind: 'duration', category: 'math', group: 'round', n: 20000, unit: 'days' },
  { id: '1000w', kind: 'duration', category: 'math', group: 'round', n: 1000, unit: 'weeks' },
  { id: '2000w', kind: 'duration', category: 'math', group: 'round', n: 2000, unit: 'weeks' },
  { id: '10000h', kind: 'duration', category: 'math', group: 'round', n: 10000, unit: 'hours' },
  { id: '100000h', kind: 'duration', category: 'math', group: 'round', n: 100000, unit: 'hours' },
  { id: '1e6m', kind: 'duration', category: 'math', group: 'round', n: 1_000_000, unit: 'minutes' },
  { id: '1e7m', kind: 'duration', category: 'math', group: 'round', n: 10_000_000, unit: 'minutes' },
  { id: '1e9s', kind: 'duration', category: 'math', group: 'round', n: 1_000_000_000, unit: 'seconds' },
  { id: '2e9s', kind: 'duration', category: 'math', group: 'round', n: 2_000_000_000, unit: 'seconds' },

  // Cube year-ages (the original joke: 27 = 3³)
  ...cubeYearMilestones([2, 3, 4, 5]),

  // Famous constants as ages
  {
    id: 'pi-years',
    kind: 'year-fraction',
    category: 'math',
    group: 'constants',
    years: Math.PI,
    n: Math.PI,
    label: 'π years old',
    short: 'πy',
    blurb:
      'Your π birthday: 3 years old, plus about 0.14159 of a year more (π ≈ 3.14159…). Counted with a mean Gregorian year.',
  },
  {
    id: 'avogadro-years',
    kind: 'year-fraction',
    category: 'math',
    group: 'constants',
    years: 6.02214076,
    n: 6.02214076,
    label: 'Avogadro years old',
    short: 'Nᴀy',
    blurb:
      'Avogadro’s number is about 6.022×10²³. We put the 6.022 years on the calendar and left off the ×10²³ — if you passed a 6.022×10²³th birthday without celebrating because we didn’t list it, we apologize!',
  },
  {
    id: 'faraday-years',
    kind: 'year-fraction',
    category: 'math',
    group: 'constants',
    years: 9.648533212,
    n: 9.648533212,
    label: 'Faraday years old',
    short: 'Fy',
    blurb:
      'The Faraday constant is about 9.649×10⁴ coulombs per mole. Same trick as Avogadro: we celebrate ~9.649 years and quietly skip the ×10⁴.',
  },

  // US legal / civic ages (jurisdiction and details vary; US-focused)
  {
    id: 'legal-18',
    kind: 'years',
    category: 'legal',
    group: 'legal',
    n: 18,
    label: '18 — old enough to vote',
    short: '18vote',
    blurb:
      'In the US, 18 is the age for voting in federal elections (26th Amendment). Lots of other “adulthood” lines also cluster here; state rules still vary.',
  },
  {
    id: 'legal-21',
    kind: 'years',
    category: 'legal',
    group: 'legal',
    n: 21,
    label: '21 — old enough to buy alcohol',
    short: '21alc',
    blurb:
      'Federal law sets 21 as the minimum age to purchase alcohol in the US. (Drinking age history is messy; this is the purchase-age line people usually mean.)',
  },
  {
    id: 'legal-62-ss',
    kind: 'years',
    category: 'legal',
    group: 'legal',
    n: 62,
    label: '62 — earliest Social Security',
    short: '62SS',
    blurb:
      '62 is the earliest age most people can claim Social Security retirement benefits in the US — at a permanently reduced amount if you claim early.',
  },
  {
    id: 'legal-65-medicare',
    kind: 'years',
    category: 'legal',
    group: 'legal',
    n: 65,
    label: '65 — Medicare eligibility',
    short: '65Med',
    blurb:
      '65 is the standard age for Medicare eligibility in the US (some people qualify earlier through disability or other rules).',
  },
  {
    id: 'legal-25-house',
    kind: 'years',
    category: 'legal',
    group: 'constitution',
    n: 25,
    label: '25 — old enough for the House',
    short: '25House',
    blurb:
      'US Constitution, Article I: you must be at least 25 to be a Representative in the House.',
  },
  {
    id: 'legal-30-senate',
    kind: 'years',
    category: 'legal',
    group: 'constitution',
    n: 30,
    label: '30 — old enough for the Senate',
    short: '30Senate',
    blurb: 'US Constitution, Article I: you must be at least 30 to be a Senator.',
  },
  {
    id: 'legal-35-president',
    kind: 'years',
    category: 'legal',
    group: 'constitution',
    n: 35,
    label: '35 — old enough to be President',
    short: '35Potus',
    blurb:
      'US Constitution, Article II: you must be at least 35 to be President. (Also a natural-born citizen and a long-term resident — we only track the birthday.)',
  },

  // Fictional ages (celebrate the number; you don’t have to live in the Shire)
  {
    id: 'fiction-33-hobbit',
    kind: 'years',
    category: 'fiction',
    group: 'fiction',
    n: 33,
    label: '33 — of age in the Shire',
    short: '33hobbit',
    blurb:
      'In Tolkien, hobbits come of age at 33. Frodo’s 33rd is the same day as Bilbo’s eleventy-first birthday party.',
  },
  {
    id: 'fiction-111-bilbo',
    kind: 'years',
    category: 'fiction',
    group: 'fiction',
    n: 111,
    label: '111 — eleventy-first (Bilbo)',
    short: '111Bilbo',
    blurb:
      'Bilbo Baggins’s famous eleventy-first birthday — the long-expected party. A fine number to celebrate even if you’re not disappearing with a ring.',
  },

  // Ages that show up in famous songs (title or well-known lyric landmark)
  {
    id: 'song-17-nicks',
    kind: 'years',
    category: 'songs',
    group: 'songs',
    n: 17,
    label: '17 — Edge of Seventeen',
    short: '17Nicks',
    blurb:
      'Stevie Nicks’s “Edge of Seventeen” — not a birthday party song, but 17 is right there in the title everyone knows.',
  },
  {
    id: 'song-22-swift',
    kind: 'years',
    category: 'songs',
    group: 'songs',
    n: 22,
    label: '22 — Taylor Swift’s “22”',
    short: '22Swift',
    blurb: 'Taylor Swift’s “22” — modern shorthand for a messy, fun early-twenties birthday energy.',
  },
  {
    id: 'song-23-blink',
    kind: 'years',
    category: 'songs',
    group: 'songs',
    n: 23,
    label: '23 — nobody likes you when you’re 23',
    short: '23blink',
    blurb:
      'blink-182’s “What’s My Age Again?” — the line everyone remembers: nobody likes you when you’re 23.',
  },
  {
    id: 'song-64-beatles',
    kind: 'years',
    category: 'songs',
    group: 'songs',
    n: 64,
    label: '64 — When I’m Sixty-Four',
    short: '64Beatles',
    blurb: 'The Beatles’ “When I’m Sixty-Four” — will you still need me, will you still feed me…',
  },
]

/** Filter chips on the timeline. `defaultOn: false` hides the chip’s milestones until toggled. */
export const FILTER_GROUPS = [
  { id: 'cubes', label: 'Cubes' },
  { id: 'round', label: 'Round numbers' },
  { id: 'constants', label: 'Constants' },
  { id: 'legal', label: 'Legal' },
  { id: 'constitution', label: 'Constitution', defaultOn: false },
  { id: 'fiction', label: 'Fiction' },
  { id: 'songs', label: 'Songs' },
]
