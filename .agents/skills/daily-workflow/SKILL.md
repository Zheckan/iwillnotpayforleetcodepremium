---
name: daily-workflow
description: "Activate at session start (greet/orient), at day-start ('start new day', 'let's begin', 'good morning', 'new day', or when the date has rolled over since the last PROGRESS.md entry), and at day-end ('let's stop for today', 'wrap up', 'done for today', 'stop here'). Owns the full day lifecycle: branch creation, PR open at first commit, PROGRESS.md updates, and PR finalization at day end. One PR per day, never auto-merged."
---

# Daily Workflow

This skill describes the full day lifecycle for the LeetCode prep repo. It is invoked at three moments: **session start**, **day start**, and **day end**.

---

## Core invariants

These hold for every day, no exceptions:

1. **One branch per day:** `day-{N}/{YYYY-MM-DD}` cut from `main`.
2. **One PR per day:** opened at the first commit of the day, updated with each subsequent push.
3. **Never auto-merge.** PRs stay open as a record. The user merges manually if/when they want to.
4. **PROGRESS.md is the single source of truth.** Every state change goes there, in real time, by the agent — not the user.
5. **README/PROGRESS housekeeping is the agent's job, not the user's.** Don't ask the user to update tracking files.

---

## 1. Session start (every conversation)

Before responding to anything else:

1. Read `PROGRESS.md` → current phase, day, branch, last session log row.
2. If `prep/README.md` exists, read it and the active plan it points to when choosing today's work. In the public mirror, `prep/` is intentionally absent; fall back to `AGENTS.md`, `PROGRESS.md`, and local user notes.
3. Run `git branch --show-current` → compare with PROGRESS.md `Branch` field.
4. Run `git status` → check for uncommitted work from a prior session.
5. Determine: is today the same date as the last session, or a new day?
   - **Same day, same branch** → resume work, greet briefly with where they left off.
   - **New day** → trigger the **Day Start** flow (section 2).
   - **Mismatched branch but same day** → ask the user what state they want.

Greeting format: short. "You're on day N (Phase X, {pattern}). Last session: {one line}. Today's plan: {next problems from the active prep plan, or from AGENTS.md if no private prep plan exists}."

---

## 2. Day start

Triggered when: the user says a day-start phrase, OR the date rolled over since the last PROGRESS.md `Started` entry, OR they explicitly ask to start a new day.

### Pre-flight checks (do not skip)

1. **Yesterday's branch state.** If `git status` shows uncommitted changes on the previous day's branch:
   - Show the user what's uncommitted.
   - Ask whether to commit-and-push to yesterday's PR before cutting today's branch, or stash, or discard.
2. **Yesterday's PR.** If the previous day's PR exists:
   - Verify it's pushed and up to date.
   - Leave it open. **Do not merge.** Do not close.
   - Note its URL in the greeting so the user can reference it.

### Cut today's branch

```bash
git checkout main
git pull
git checkout -b day-{N+1}/{YYYY-MM-DD}
```

`{N+1}` = previous day number from PROGRESS.md + 1. `{YYYY-MM-DD}` = today's actual date (use `date +%Y-%m-%d`, not a guess).

### Update PROGRESS.md Current State

Edit the Current State block:

- Bump **Phase** if the previous day completed a phase.
- Bump **Day** to N+1.
- Set **Started** to today's date.
- Set **Branch** to the new branch name.

Add a new row to the Session Log table with today's date, branch, day number, and a placeholder for "what was done" (filled in at day end).

### Commit the bookkeeping

```bash
git add PROGRESS.md
git commit -m "chore(day-{N+1}): start new training day"
```

This is the day's first commit — it triggers the PR-open step (section 3).

---

## 3. PR open (at first commit of the day)

Immediately after the first commit on the new day's branch:

```bash
git push -u origin day-{N+1}/{YYYY-MM-DD}
gh pr create \
  --base main \
  --title "Day {N+1}: {YYYY-MM-DD} — {phase summary}" \
  --body "$(cat <<'EOF'
## Summary
- Phase {X}: {pattern}
- Planned problems: {list from active prep plan}

## Test plan
- [ ] All solutions run cleanly via `bun` / `python3`
- [ ] LeetCode submissions accepted
- [ ] PROGRESS.md updated with TC/SC and notes
EOF
)"
```

Capture the PR URL and surface it to the user. Update PROGRESS.md Session Log row with the PR link.

**Do not merge this PR. Ever, automatically.** Even at day end. Only the user merges.

---

## 4. During the day

Per-problem flow, in real time (do not batch to end of day):

1. **Problem started:** add row to Problem Log with status `in-progress`, today's date, language, pattern.
2. **Problem solved:**
   - Update status to `solved`.
   - **Ask the user** for TC and SC. Do not state them yourself (memory: `feedback_always_ask_tc_sc.md`).
   - Update the problem's `README.md` with Solution Approach + complexity. This is the agent's job.
3. **Notable observation:** update Student Notes section in PROGRESS.md immediately — strengths, areas to improve, patterns to revisit.
4. **Each commit:**
   - Conventional Commits format (`feat(day-N): solve #NNN — {pattern}`).
   - Push to today's branch — the open PR auto-updates.

---

## 5. Day end

Triggered when: user says "let's stop for today", "wrap up", "done for today", "stop here", or similar.

### Final housekeeping

1. **Stray debug?** Run `git diff main...HEAD` and scan for stray `console.log`, `print`, debug code. Clean before final commit.
2. **PROGRESS.md final pass:**
   - Update each problem solved today with final status and notes.
   - Fill in the Session Log row's "What was done" column with a one-line summary.
   - Update Student Notes with anything new observed.
3. **Final commit + push** with a wrap-up message:
   ```bash
   git add -A
   git commit -m "chore(day-N): wrap up — {summary}"
   git push
   ```
4. **PR body update.** Edit the PR description with the actual problems solved and outcomes:
   ```bash
   gh pr edit {PR#} --body "..."
   ```
5. **Do not merge.** Confirm to user: "PR #{N} updated and left open as record. See you tomorrow."

---

## 6. Edge cases

- **User wants to keep working past "let's stop":** treat as session-resume, no new branch.
- **User skips a day:** day number still increments by 1 (it's a counter of training days, not calendar days). The branch date reflects the actual date worked.
- **Multiple commits on same problem:** one PR for the day still — keep pushing to today's branch.
- **User wants to merge a previous day's PR:** they ask explicitly. Use `gh pr merge` with their confirmation. Default merge strategy: squash, unless they say otherwise.
- **Branch already exists for today:** something went wrong. Stop and ask the user before overwriting.

---

## What this skill does NOT do

- Does not solve problems. Coaching rules in `AGENTS.md` / `CLAUDE.md` still apply.
- Does not write Solution Approach text without confirming TC/SC with the user.
- Does not merge PRs.
- Does not delete branches.
