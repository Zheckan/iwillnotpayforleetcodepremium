# iwillnotpayforleetcodepremium

## Before You Clone And Read Further

- There is a 99% chance a better open-source solution already exists.
- This is a very specific interview-prep thing and you probably do not need it exactly as-is.
- This may not work for your setup without edits. It is personal, opinionated, and intentionally annoying about autocomplete.
- The useful part is the workflow: AI as coach, no solution autocomplete, local progress tracking, and problem fetching.

An opinionated LeetCode-style practice workspace that uses AI as a coach, not as an answer machine.

This repository is a public shell of my private LeetCode interview-prep repo. It is generated from `.opensource/` rules in that private repo, so changes here normally arrive through snapshot commits from `Premium Avoidance Bot`.

The public mirror contains the reusable workflow: problem-fetch tooling, templates, algorithm notes, API references, agent instructions, editor settings, and formatting hooks. It does not include the private solved problem archive, personal progress notes, interview plans, STAR stories, recruiter notes, private Git history, or generated LeetCode problem statements/images.

## What This Is

- A local practice workflow for coding interviews.
- A fetcher that creates local problem folders from LeetCode metadata.
- A set of AI-coach instructions that force hints, Socratic debugging, and explanation instead of full solutions.
- A no-autocomplete editor setup meant to simulate interview conditions.
- A reference implementation of how I use AI assistants without letting them solve the problems for me.

## What This Is Not

- It is not LeetCode Premium.
- It is not a public dump of LeetCode problem statements.
- It is not a guarantee that the fetcher will keep working if LeetCode changes its API or terms.
- It is not a one-size-fits-all study plan.

Generated `problems/` folders are ignored by default because they may contain LeetCode-owned descriptions, examples, starter code, or images. Keep those local unless you have the right to publish them.

## Requirements

- [Bun](https://bun.sh/)
- Python 3
- `curl`
- A local Ollama-compatible endpoint for Markdown conversion

Create local environment config:

```bash
cp .env.example .env
```

Then adjust:

```bash
OLLAMA_MODEL=gpt-oss:20b
OLLAMA_ENDPOINT=http://127.0.0.1:11434
```

## Fetch A Problem

```bash
scripts/create-problem.sh -l ts "Two Sum"
scripts/create-problem.sh -l py "Binary Tree Level Order Traversal"
```

The script creates a local folder under `problems/<difficulty>/<number>-<slug>/` with:

- a README generated from fetched metadata
- a starter solution file for the selected language
- a small test harness when the metadata is simple enough to parse

## AI Coach Flow

This repo includes public workflow instructions for AI coding assistants:

- `AGENTS.md` and `CLAUDE.md` define the coaching rules.
- `.agents/skills/fetch-problem/SKILL.md` describes how an assistant should fetch and present a new problem.
- `.agents/skills/update-progress/SKILL.md` describes how an assistant should maintain a local progress tracker.
- `.claude/skills/` mirrors the same flow for Claude-style skill loading. In the private source repo these are symlinks to `.agents/skills/`.
- `.cursor/rules/` tells Cursor to guide rather than solve.

The core rule is simple: the assistant should help you think, not write the solution for you.

Those workflow files are copied from the private repo during export where safe. The VS Code settings are copied too, with private spellcheck words stripped during export.

## Interview-Mode Editor Setup

The `.vscode/settings.json` file intentionally disables autocomplete-like help:

- inline suggestions
- quick suggestions
- snippets
- tab completion
- parameter hints
- hover
- TypeScript and JavaScript auto-import suggestions

That friction is deliberate. In a real interview, you need to remember syntax, API names, and data-structure operations under pressure.

## Progress Tracking

Start from the example tracker:

```bash
cp PROGRESS.example.md PROGRESS.md
```

`PROGRESS.md` is ignored by Git so your practice history stays local.

## Formatting

Install dependencies:

```bash
bun install
```

Run checks:

```bash
bun run lint
```

Husky and lint-staged are included to keep formatting consistent before commits.

To install the hook after cloning:

```bash
bun install
bun run prepare
```

## Caveats

- This project is personal and opinionated.
- The fetcher uses LeetCode endpoints and may break.
- Respect LeetCode's terms and do not publish generated problem statements or images unless you have rights to do so.
- Adapt the coaching rules and progress tracker to your own interview target.

## License And Small Fee

There is a small fee for using this content: donate to [Come Back Alive](https://savelife.in.ua/en/donate-en/). Donate anything. As [Max Shcherbyna](https://twitter.com/max_shcherbyna) said: "Donate is like a penis, there isn't small one."

This project is licensed under the MIT License - see the LICENSE file for details. Just don't be cunts, and do not support Russia's war against Ukraine.
