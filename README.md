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
- **Plan** (`/plan`) — a day-by-day plan for the current week. Each weekday gets resources assigned
  in sequence (never a later lesson before an earlier one in the same topic); checking one off keeps
  it marked on that day and appends a new suggestion below it. Weekends are rest/review days.
- **Kitchen** (`/kitchen`) — meal plan and pantry together on one page behind a tab switcher.
  - **Meal Plan** tab: your weekly menu (breakfast/lunch/snack/dinner for each day), with a
    checkbox and a calorie count per meal. Each day shows calories eaten so far against your daily
    goal (1750 by default, editable right on the page). A day counts as fully followed once all its
    meals are checked, which drives a streak and an all-time total, the same as the Habits page.
    Click **Edit plan** to rewrite any meal's name or calorie count directly on the page — no file
    editing required.
  - **Pantry** tab: a checklist of what you keep stocked, organized into categories (Grains,
    Proteins, Produce, etc). Check an item off once you have it; unchecked items are what's missing.
    Click **Edit pantry** to rename items/categories or add and remove them — this list is fully
    yours to shape, unlike the fixed weekly structure of Habits/Meals.
- **Review** (`/review`) — a retrospective with a **Week / Month / Year** toggle: habit consistency,
  meal plan adherence, and resources completed, all computed against however much of that period has
  elapsed so far (e.g. 6/6 days if you're on day 6 of the month, not 6/31).
- **Backup** (`/backup`) — export all progress (curriculum + habits + meals + pantry) to a JSON
  file, or import one to restore it. Linked from the footer on every page.

Every resource in `curriculum.json` is a single, specific article, video, or lecture/reading page —
never a bare YouTube channel, playlist, or a "hub" page that lists many pieces of content under one
URL. Where a source (freeCodeCamp's certification pages, AWS Skill Builder's course modules) has no
stable per-section URL, the resource points to a real, distinct alternative covering that same topic
instead of reusing one shared link across several checklist rows.

The homepage also surfaces a **What's Next** pick — one resource from the whole curriculum, with a
checkbox and a "Shuffle" button — for days you want to make progress without deciding where. Both
What's Next and the Weekly Plan only ever pick from each topic's *earliest unchecked* resource, so
you'll never see "Lesson 4" suggested while "Lesson 1" is still sitting unchecked in the same topic.
Domains and the homepage Ledger show milestone callouts once you cross 25/50/75/100% overall, or
fully master a domain (a "Mastered" badge appears next to its name everywhere).

Any resource — on a domain page, in the Athenaeum, in What's Next, or in the Weekly Plan — has a
**Discard** button. Discarding a resource removes it everywhere (it no longer counts toward that
topic's progress, and won't be picked by What's Next or the Weekly Plan). It's not deleted from
`curriculum.json` — the Athenaeum has a **Show discarded** toggle where you can **Restore** anything
you change your mind about.

## Nothing is ever deleted on a schedule

Habit check-ins, resource-completion timestamps, and meal logs are never pruned or rotated out —
they accumulate in `localStorage` indefinitely. The **Review** page only ever showed a rolling
7-day window in earlier versions of this site, which made it *look* like older progress had
vanished once the week passed; it hadn't, there was just no view into it. Review now has a
**Week / Month / Year** toggle that re-slices the same underlying data over longer ranges, so a
whole year of history is visible without adding any new storage or snapshotting.

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

The Meal Plan tab (under Kitchen) is a weekly menu template that repeats every week. [`data/meals.json`](data/meals.json)
defines the default plan (what a fresh browser sees) — each meal has a `calories` value, and there's
a top-level `dailyCalorieGoal` (1750 by default). The **Edit plan** button lets you rewrite any
meal's name or calorie count right there; those edits are saved as overrides in `localStorage` and
take priority over the JSON default. "Reset to default" clears all overrides and reverts to what's
in the file. The **Daily goal** field next to the streak badges is always editable (not gated behind
Edit plan) and is stored the same way. Checking off a meal logs it against that specific calendar
date, so it doesn't carry over week to week, but editing a meal's *name or calories* changes the
recurring template (e.g. every future Monday), since that's a different kind of edit than checking a
box. Each day shows "calories eaten / goal" based on the checked meals for that date (turning red if
over goal), and a day's streak/total is based on all of that day's meals being checked, using the
same today-or-yesterday grace period as habit streaks.

The Pantry tab (under Kitchen) works differently from Habits/Meal Plan: instead of overriding a fixed JSON template,
the *entire* list lives in `localStorage` from the moment you first visit (seeded once from
[`data/pantry.json`](data/pantry.json)). That's because a pantry naturally needs items and whole
categories added and removed, not just text edits to fixed slots — there's no JSON file to keep
editing afterwards. "Reset to default" wipes your customized list and reseeds it from the file.

Discarding works the same way (`localStorage`, per-browser): it's a set of resource keys that gets
filtered out of the curriculum before anything else runs — progress bars, topic status, What's Next,
and the Weekly Plan all operate on that filtered view, so a discarded resource behaves as if it
doesn't exist until you restore it.

Because everything lives in `localStorage` and nowhere else, use the **Backup** page periodically
(or before switching browsers/devices) to export a JSON snapshot of your curriculum progress, habit
log, meal log, meal plan edits, calorie goal, pantry list, discarded resources, and Weekly Plan
assignment history — and import it back in on the other side.

### How the Weekly Plan actually works

Two rules, both enforced in `lib/curriculum.ts`'s `getNextResources()`:

1. **Sequential within a topic.** The only resource ever eligible to be suggested from a topic is
   the earliest one (in `curriculum.json`'s array order) that isn't checked off yet. A later lesson
   simply isn't in the pool until every earlier one in that topic is done.
2. **Persistent per day.** Each weekday (Mon–Fri) keeps an accumulating list of assigned resources
   in `localStorage` (`polymath-hub:plan-assignments`, via `lib/plan-store.ts`) instead of picking
   one fresh resource every render. Checking off (or discarding) the active item for a day appends a
   new one below it — the completed item stays right where it was, struck through. A resource
   already pending on another day that week is skipped, so the same suggestion never shows up twice
   at once.

A new calendar week means new (empty) date keys, so Monday of a new week always starts fresh —
there's nothing to reset by hand.

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
