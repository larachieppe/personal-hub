# Polymath Hub

A personal dashboard for self-directed, cross-disciplinary study — a place to keep the mission
statement in front of you, track a curriculum across multiple domains, and collect the
books/courses/articles that go with each topic.

Live site (once Pages is enabled): `https://<your-username>.github.io/personal-hub/`

## What's here

- **Dashboard** (`/`) — mission statement, a rotating quote, and overall progress across every domain.
- **Curriculum** (`/curriculum`, `/curriculum/[domain]`) — domains (Business, Computer Science,
  Technology, Startups) broken into topics, each with a checklist of resources.
- **Resources** (`/resources`) — every resource across the whole curriculum, searchable and
  filterable by domain/type, with the same checkboxes as the domain pages.
- **Habits** (`/habits`) — daily check-off for a fixed set of habits (weight lifting, cardio,
  studying 8+ hours, reading before sleep), each with a streak counter, a milestone label
  (Week/Month/Century/Year Streak), a full-year heatmap, and an all-time total.
- **Plan** (`/plan`) — a day-by-day plan for the current week: one unchecked resource assigned to
  each weekday, weekends left as rest/review days.
- **Review** (`/review`) — a weekly retrospective: how consistent you were with each habit over
  the last 7 days, and which resources you checked off in that window.
- **Backup** (`/backup`) — export all progress (curriculum + habits) to a JSON file, or import one
  to restore it. Linked from the footer on every page.

The homepage also surfaces a **What's Next** pick — one random unchecked resource from the whole
curriculum, with a checkbox and a "Shuffle" button — for days you want to make progress without
deciding where. Domains and the homepage Ledger show milestone callouts once you cross 25/50/75/100%
overall, or fully master a domain (a "Mastered" badge appears next to its name everywhere).

## How progress works

Every resource in a topic is a checkbox. Check one off and:
- The topic's status (Uncharted / In Progress / Mastered) updates automatically — Uncharted
  means nothing's checked, In Progress means some are, Mastered means all of them are.
- Every progress bar (topic, domain, and the homepage Ledger) recomputes from checked resources.

**This is stored in your browser's `localStorage`, not in the data files.** That means:
- It's instant — no editing files or redeploying to check something off.
- It's per-browser. Progress won't follow you to a different browser or device, and clearing
  site data resets it.
- Renaming a resource's `title` in `curriculum.json` changes its identity, so a previously
  checked item under the old title will show as unchecked again.

The Habits page works the same way (`localStorage`, per-browser): each habit can be marked done
once per calendar day. A streak stays alive if you've checked in today or yesterday, and breaks
if you miss a full day; the all-time total never resets. To add, remove, or rename habits, edit
[`data/habits.json`](data/habits.json).

Because everything lives in `localStorage` and nowhere else, use the **Backup** page periodically
(or before switching browsers/devices) to export a JSON snapshot of both your curriculum progress
and habit log, and import it back in on the other side.

### How the Weekly Plan "auto-updates"

There's no stored plan data anywhere — `/plan` is computed fresh on every page load from two
inputs: the current date and whatever's still unchecked in the curriculum. The Monday-to-Friday
assignment is shuffled using a seed derived from that week's Monday date, so:
- Reloading the page during the same week always shows the same plan (it's stable, not random
  every render).
- A new week automatically gets a fresh shuffle, with no manual editing required.
- Checking off resources shrinks the pool the plan draws from, so completed items stop showing up
  — as a side effect, checking something off mid-week can shift what later days in that same week
  show, since the shuffle re-runs over a shorter list.

## Editing your curriculum

Content lives in plain data files — no database, no login, just edit and commit:

- [`data/curriculum.json`](data/curriculum.json) — domains, topics, and resources.
  - Add a domain by adding an object to the `domains` array.
  - Add a topic by adding an object to a domain's `topics` array (no `status` field needed —
    it's derived from the checklist).
  - Add a resource to a topic's `resources` array: `{ "title": "...", "url": "...", "type": "article" }`
    (`type` is one of `book`, `course`, `video`, `article`, `paper`, `other`; `url` can be `""` if
    you don't have a link yet).
- [`data/motivation.json`](data/motivation.json) — your mission statement and the pool of quotes
  shown on the dashboard (one is picked per day).

Commit and push changes to `main` and the site redeploys automatically.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This repo is configured for static export (`output: "export"` in `next.config.ts`) and deploys to
GitHub Pages automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on
every push to `main`.

One-time setup after pushing this repo: in the GitHub repo, go to **Settings → Pages** and set
**Source** to **GitHub Actions** (only needed once; the workflow handles every deploy after that).

If you rename the repo, update `repoName` in `next.config.ts` to match — it's used to compute the
`basePath` so assets resolve correctly under `https://<username>.github.io/<repo>/`.
