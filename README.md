# nth.

Weird birthday milestones — 10,000 days old, a billion seconds, and friends.

Small Vue + Vite app meant for **GitHub Pages**. Enter a birth date (and optional time); the URL updates so you can share a link.

## Local

```bash
npm install
npm run dev
```

Open the printed localhost URL. Changes hot-reload in the browser.

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

## Milestone list

Defined in `src/lib/milestones.js` — easy to add more (days, weeks, hours, minutes, seconds).
