---
name: update-progress
description: "Update PROGRESS.md with today's training session results. Use this skill at the end of a session, when the user says 'update progress', 'log my progress', 'save progress', 'wrap up', 'done for today', 'let's stop here', or when they ask you to record what was accomplished. Also trigger when the user says 'what did I do today' or 'summarize my session'. This skill reviews the conversation history and solution files to determine what happened, then writes it all to PROGRESS.md."
---

# Update Progress

This skill reviews the current conversation and repo state to update `PROGRESS.md` — the single source of truth for training progress.

## What to update

PROGRESS.md has four sections that may need changes. Review each one:

### 1. Current State

Update if the user has moved to a new phase or day:

- **Phase** — only changes when all problems in a phase are done
- **Day** — increments when the user starts a new training day
- **Branch** — should match the current git branch (`git branch --show-current`)
- **Active plan** — in the private repo, should point at the canonical private plan under `prep/`, not the root compatibility pointer. In the public mirror, `prep/` may be absent and local users can choose their own tracker layout.

### 2. Problem Log

For each problem the user worked on this session, determine what happened by reviewing:

- The conversation — did they discuss a problem? Get hints? Submit code?
- The solution files — check `problems/` for new or modified files
- Test results — did they run their solution? Did tests pass?

Then update the table:

| Status         | When to use                                             |
| -------------- | ------------------------------------------------------- |
| `not-started`  | Problem was fetched but not attempted yet               |
| `in-progress`  | User started working but hasn't finished                |
| `solved`       | User completed the problem and tests pass               |
| `needs-review` | User solved it but struggled, or solution isn't optimal |
| `needs-redo`   | Previously solved but needs a fresh attempt             |

For each problem, also fill in:

- **Date** — today's date (YYYY-MM-DD)
- **Language** — `ts`, `py`, `js`, or `cpp`
- **Pattern** — the algorithmic pattern used (Two Pointers, Sliding Window, Hash Map, DFS, etc.)
- **Notes** — brief note on what happened: complexity achieved, what was hard, hints needed

### 3. Core Topics Reviewed

If the user studied any `core/` reference files or discussed algorithmic concepts (not just solving a problem, but actually studying the pattern), add a row:

```
| Arrays & Two Pointers | 2026-03-22 | Studied core/arrays-strings, practiced reverse patterns |
```

### 4. Session Log

Add or update today's row with a summary of everything accomplished. Keep it concise but informative. Examples:

```
| 2026-03-22 | day-1/2026-03-22 | 1 | Solved #283 Move Zeroes (two pointers), #344 Reverse String. Studied arrays basics. |
| 2026-03-23 | day-2/2026-03-23 | 2 | Solved #26, #27. Struggled with #217 — needs review. Reviewed hash map patterns. |
```

## How to gather the information

Follow these steps in order:

1. **Read current PROGRESS.md** — know what's already tracked
2. **Read prep/README.md and the active plan if present** — know what today's intended work was. If `prep/` is absent, fall back to `AGENTS.md` and `PROGRESS.md`.
3. **Check git state** — `git branch --show-current` for the branch, `git diff --name-only` to see what files changed
4. **Scan the problems directory** — look for new or modified solution files:
   ```bash
   find problems/ -name "solution.*" -newer PROGRESS.md
   ```
5. **Review conversation history** — this is the most important source. Walk through the conversation and identify:
   - Which problems were discussed
   - Whether the user solved them or got stuck
   - What hints were given (more hints = `needs-review`)
   - What concepts were discussed
   - Whether tests passed
6. **Read solution files** — for any problems worked on, check if the solution file has actual code (not just the template)

## Writing the updates

Use the Edit tool to make targeted updates to PROGRESS.md. Don't rewrite the whole file — just edit the specific rows/sections that changed.

When adding a new problem row, maintain the table sorted by problem number.

When updating an existing row, preserve any previous notes and append new info.

## After updating

Show the user a brief summary of what was logged:

- Problems worked on and their status
- Session log entry
- What's recommended next based on the study plan

## Example conversation flow

User: "done for today, update my progress"

1. Read PROGRESS.md
2. Review the conversation: user solved #283 (Move Zeroes) in TypeScript using two pointers, O(n) time O(1) space. Got a conceptual hint. Also attempted #344 (Reverse String) and solved it quickly.
3. Update Problem Log:
   - Add row for #283: solved, 2026-03-22, ts, Two Pointers, "Needed one hint on in-place swap. O(n) time, O(1) space"
   - Add row for #344: solved, 2026-03-22, ts, Two Pointers, "Solved quickly. O(n) time, O(1) space"
4. Update Session Log:
   - "Solved #283 Move Zeroes, #344 Reverse String. Two pointers pattern — solid."
5. Tell the user: "Logged 2 problems solved today. Tomorrow: continue with #26 Remove Duplicates and #27 Remove Element."
