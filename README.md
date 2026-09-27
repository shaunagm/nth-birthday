# nth.

Weird birthday milestones — 10,000 days old, a billion seconds, π years, and friends.

Small Vue + Vite app meant for **GitHub Pages**. Enter a birth date (and optional time); the URL updates so you can share a link.

## Setup

```bash
npm install
npm run dev
```

Open the printed localhost URL. Changes hot-reload in the browser.

## Tests

Birthday date math lives in `src/lib/milestones.js` and is covered by Vitest:

```bash
npm test          # single run
npm run test:watch
```

## Adding a milestone

**Edit only** [`data/milestones.js`](data/milestones.js). That file is the catalog; the rest of the app loads it automatically.

1. Copy an existing entry that matches your kind (duration, calendar years, or year-fraction).
2. Give it a **unique** `id` (kebab-case, stable forever — don’t reuse old ids).
3. Set `category` (`math` | `legal` | `fiction` | `songs`) and a `group` that already exists in `FILTER_GROUPS` (or add a new filter chip there in the same file).
4. Fill in `label`, `short`, and `blurb` so the timeline and calendar export read clearly.
5. Run `npm test` and `npm run dev` to sanity-check.

### Field cheat sheet

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Unique string |
| `kind` | yes | `duration` \| `years` \| `year-fraction` |
| `category` | yes | UI category |
| `group` | yes | Must match a `FILTER_GROUPS` id |
| `n` | yes | Age number (for fractions, same as `years`) |
| `unit` | duration only | `seconds` \| `minutes` \| `hours` \| `days` \| `weeks` |
| `years` | year-fraction only | Continuous age in mean Gregorian years |
| `label` | recommended | Full title on the timeline |
| `short` | recommended | Compact chip / rail text |
| `blurb` | recommended | Longer note (also goes into `.ics` description) |

**Examples**

```js
// Calendar age (anniversary of birth date)
{
  id: 'fiction-42-hitchhiker',
  kind: 'years',
  category: 'fiction',
  group: 'fiction',
  n: 42,
  label: '42 — the Answer',
  short: '42',
  blurb: 'Douglas Adams’s Hitchhiker’s Guide: 42 is the Answer to Life, the Universe, and Everything.',
}

// Exact duration from birth
{ id: '30000d', kind: 'duration', category: 'math', group: 'round', n: 30000, unit: 'days' }

// Fractional age (mean Gregorian year)
{
  id: 'e-years',
  kind: 'year-fraction',
  category: 'math',
  group: 'constants',
  years: Math.E,
  n: Math.E,
  label: 'e years old',
  short: 'ey',
  blurb: 'Your e birthday — age ≈ 2.71828… mean Gregorian years.',
}
```

New filter chip (only if you need a new group):

```js
// in FILTER_GROUPS
{ id: 'sports', label: 'Sports' }
```

Optional: set `defaultOn: false` so the chip starts off (see Constitution).

### PR checklist

- [ ] Only `data/milestones.js` changed (unless you also need a new filter group — still that file)
- [ ] Unique `id`
- [ ] `npm test` passes
- [ ] Spot-checked in `npm run dev` with a birth date near the new milestone

## GitHub Pages

1. Create a GitHub repo named **`nth-birthday`** (name must match `base` in `vite.config.js`, or change `base`).
2. Push this project to `main`.
3. Deploy:

```bash
npm run deploy
```

That builds into `dist/` and pushes a `gh-pages` branch. In the repo on GitHub: **Settings → Pages → Deploy from branch → `gh-pages` / root**.

Site URL will look like: `https://<you>.github.io/nth-birthday/`

### First-time git remote (if needed)

```bash
cd /path/to/nth-birthday
git init
git add .
git commit -m "feat: initial nth birthday milestone calculator"
# create empty repo on GitHub named nth-birthday, then:
git remote add origin git@github.com:<you>/nth-birthday.git
git branch -M main
git push -u origin main
npm run deploy
```

`gh` CLI is optional; the GitHub website “New repository” flow works fine.
