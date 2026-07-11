# Polymath Hub

A personal dashboard for self-directed, cross-disciplinary study — a place to keep the mission
statement in front of you, track a curriculum across multiple domains, and collect the
books/courses/articles that go with each topic.

Live site (once Pages is enabled): `https://<your-username>.github.io/personal-hub/`

## What's here

- **Dashboard** (`/`) — mission statement, a rotating quote, and overall progress across every domain.
- **Curriculum** (`/curriculum`, `/curriculum/[domain]`) — domains (Business, Computer Science,
  Technology, Biotech, Startups, Product Management) broken into topics, each with a checklist of
  resources.
- **Resources** (`/resources`) — every resource across the whole curriculum, searchable and
  filterable by domain/type, with the same checkboxes as the domain pages.
- **Plan** (`/plan`) — a day-by-day plan for every day of the week, including weekends. Each day gets
  a resource assigned in sequence (never a later lesson before an earlier one in the same topic);
  checking one off keeps it marked on that day and appends a new suggestion below it. Don't want the
  one it picked? Click **Change** to swap in a different eligible resource from the same pool.
  Every day also has a **Tasks** section: pick from the tasks you've created on the To-Do page and
  assign as many as you like to that day, check them off or remove them from the day (removing
  doesn't delete the task, just unschedules it).
- **To-Do** (`/todos`) — a master list of tasks, separate from the curriculum: type something and hit
  Add. Each task is a single entity — check it done, delete it, or (from the Plan page) assign it to
  one or more days of the week; a "This week: Mon, Wed" label shows where it's currently scheduled.
  Deleting a task also removes it from every day it was assigned to.
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
- **Progress** (`/progress`) — Habits and Review together on one page behind a tab switcher.
  - **Habits** tab: daily check-off for a fixed set of habits (weight lifting, cardio, studying
    8+ hours, reading before sleep), each with a streak counter, a milestone label
    (Week/Month/Century/Year Streak), a full-year heatmap, and an all-time total.
  - **Review** tab: a retrospective with a **Week / Month / Year** toggle: habit consistency,
    meal plan adherence, and resources completed, all computed against however much of that
    period has elapsed so far (e.g. 6/6 days if you're on day 6 of the month, not 6/31).
- **Backup** (`/backup`) — export all progress (curriculum + habits + meals + pantry + to-dos) to a
  JSON file, or import one to restore it. Linked from the footer on every page.

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

Every topic also has a **+ Add a resource** link at the bottom of its checklist (on the domain page).
Paste a link and that's genuinely all you need to do — the title and type are filled in for you
(see `lib/resource-meta.ts`): pasting a YouTube URL fetches its real title from YouTube's own oEmbed
API and sets the type to Video; anything else gets a readable title guessed from the URL's own path
(e.g. `.../rice-simple-prioritization-for-product-managers/` becomes "Rice Simple Prioritization For
Product Managers") with the type guessed from the domain (arXiv/DOI/PubMed → Paper, Amazon/Goodreads
→ Book, otherwise Article). Both fields stay fully editable — type over the guessed title or change
the type dropdown before hitting Add if it didn't guess right — and clicking Add before the guess has
finished resolving just waits for it rather than losing your link. It's added to that exact topic
immediately, no file editing or redeploy required. Resources added this way behave exactly like ones
from `curriculum.json`: they get their own checkbox, count toward that topic's progress, show up in
the Athenaeum and What's Next, and can be picked up by the Weekly Plan once every curriculum resource
ahead of them in the topic is checked off. They also get a **Remove** button (next to Discard) since
— unlike curriculum content — they can be deleted outright, not just hidden.



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

The Habits tab (under Progress) works the same way (`localStorage`, per-browser): each habit can be
marked done once per calendar day. A streak stays alive if you've checked in today or yesterday, and
breaks if you miss a full day; the all-time total never resets. To add, remove, or rename habits,
edit [`data/habits.json`](data/habits.json).

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

Resources you add yourself (`localStorage`, per-browser) work the same way, in reverse: they're a
map of domain → topic → resource list (`polymath-hub:custom-resources`, via
`lib/custom-resources-store.ts`) that gets *merged into* the curriculum before anything else runs —
`mergeCustomResources()` in `lib/curriculum.ts` appends them to the right topic's resources array,
tagged `custom: true`, right alongside what's in `curriculum.json`. Every page that reads the
curriculum (Dashboard, Curriculum, a domain page, the Athenaeum, What's Next, the Weekly Plan,
Review) does this merge itself, so a resource you add shows up everywhere immediately, with no
distinction from JSON-defined ones except the extra **Remove** button.

Because everything lives in `localStorage` and nowhere else, use the **Backup** page periodically
(or before switching browsers/devices) to export a JSON snapshot of your curriculum progress, habit
log, meal log, meal plan edits, calorie goal, pantry list, discarded resources, Weekly Plan
assignment history, to-do list and its day assignments, and your own added resources — and import it
back in on the other side.

### How the Weekly Plan actually works

Two rules, both enforced in `lib/curriculum.ts`'s `getNextResources()`:

1. **Sequential within a topic.** The only resource ever eligible to be suggested from a topic is
   the earliest one (in `curriculum.json`'s array order) that isn't checked off yet. A later lesson
   simply isn't in the pool until every earlier one in that topic is done.
2. **Persistent per day.** Every day of the week (Monday through Sunday) keeps an accumulating list
   of assigned resources in `localStorage` (`polymath-hub:plan-assignments`, via `lib/plan-store.ts`)
   instead of picking one fresh resource every render. Checking off (or discarding) the active item
   for a day appends a new one below it — the completed item stays right where it was, struck
   through. A resource already pending on another day that week is skipped, so the same suggestion
   never shows up twice at once.

Each assigned resource also has a **Change** button, which reveals a dropdown of the other resources
currently eligible under the sequential rule above (i.e. still respecting topic order) and not
already pending elsewhere that week. Picking one calls `replaceAssignment()` in `lib/plan-store.ts`,
swapping it into that exact slot in place — the day keeps its position in the list, nothing is
appended or removed, and the swap is just as persistent as the original assignment.

A new calendar week means new (empty) date keys, so Monday of a new week always starts fresh —
there's nothing to reset by hand.

### To-Do tasks and day assignment

To-dos are deliberately split into two independent pieces of state in `lib/todo-store.ts`, both
`localStorage`-backed and per-browser:

- **The task pool** (`polymath-hub:todos`) — every task you've ever created on `/todos`, each with
  just a `text` and a `done` flag. A task is one entity: marking it done or deleting it is global,
  not per-day. This is what the To-Do page manages: type into the box and hit Add (or press Enter),
  check tasks off, or delete them.
- **Day assignments** (`polymath-hub:todo-assignments`) — a map of calendar date → list of task ids
  scheduled on that date. This is what the Plan page manages: each day has a **Tasks** section
  listing whichever pool tasks are currently assigned to it (with the same checkbox, plus a
  **Remove** button that unschedules the task from that day without deleting it), and a
  "+ Add a task to this day" control that opens a dropdown of not-yet-assigned tasks to schedule.
  A task can be assigned to as many days as you like at once.

Deleting a task from the To-Do page also purges it from every day's assignment list, so you never
end up with a scheduled id that no longer resolves to anything. Since assignments are keyed by the
actual date, a new calendar week starts with nothing assigned, the same as plan assignments — but
the task pool itself persists across weeks, so a recurring task just needs re-assigning, not
re-creating.

## Editing your curriculum

Content lives in plain data files — no database, no login, just edit and commit:

- [`data/curriculum.json`](data/curriculum.json) — domains, topics, and resources.
  - Add a domain by adding an object to the `domains` array.
  - Add a topic by adding an object to a domain's `topics` array (no `status` field needed —
    it's derived from the checklist).
  - A topic's `resources` array holds two kinds of things:
    - A plain resource: `{ "title": "...", "url": "...", "type": "article" }` (`type` is one of
      `book`, `video`, `article`, `paper`, `other`; `url` can be `""` if you don't have a link yet).
      For one-off additions you don't need to touch this file at all — use the **+ Add a resource**
      link on the topic itself (see above).
    - A multi-part course: `{ "title": "...", "type": "course", "sectionType": "video", "sections": [{ "title": "...", "url": "..." }, ...] }`.
      Use this instead of several flat resources whenever a source is genuinely one course with
      real sections (Google's ML Crash Course, fast.ai, a CMU lecture series, Khan Academy's
      Foundations, etc.) — `sectionType` is whatever every section actually is (almost always
      homogeneous: all `video` or all `article`), shown as each section's badge. On the domain page
      a course renders as one row (title + a "checked/total sections" count) that expands to show
      each section as its own checkbox; sections are still individually checkable, sequential, and
      discardable — they just aren't several indistinguishable rows that happen to share a title
      prefix. A course can also take an optional `"notes": "..."` string, shown in italics under its
      title (e.g. to flag that the original course site has gone offline and the sections now link
      straight to the underlying videos instead). The **+ Add a resource** form only ever adds plain
      resources, never a nested course — building a new course means editing this file directly, and
      when you do, add every real section the course actually has, not just a few — a course entry
      that's missing most of its sections is worse than one flat resource.
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
