---
name: fetch-problem
description: "Fetch a LeetCode problem and set up the local project folder with description, tests, and starter code. Use this skill whenever the user wants to start a new problem, mentions a LeetCode problem by name or number, says things like 'let's do problem 283', 'fetch move zeroes', 'set up the next problem', or 'create problem X'. Also trigger when the user says 'next problem' or asks to move on to a new problem from the study plan."
---

# Fetch LeetCode Problem

This skill fetches a LeetCode problem from the API and creates a local project folder with the problem description (README.md), starter code, and test harness.

## How it works

The repo already has a shell script `scripts/create-problem.sh` that does the heavy lifting — it calls a TypeScript helper (`scripts/fetch-leetcode-problem.ts`) that queries the LeetCode GraphQL API, extracts the problem description, examples, constraints, starter code, and test cases, then writes everything into the proper directory structure.

## Usage

When the user asks to fetch a problem, run the script via Bash:

```bash
scripts/create-problem.sh -l <language> "<Problem Name>"
```

### Resolving problem input

The user might provide:

- **A problem name**: "Two Sum", "Move Zeroes", "Binary Tree Level Order Traversal"
- **A problem number**: "283", "problem 104", "#739"
- **A short reference**: "next problem", "the next one on the plan"

For **names** — pass directly to the script as-is.

For **numbers** — look up the problem title from the study plan in AGENTS.md or CLAUDE.md. The study plan lists problem numbers by phase/day. Map the number to its title before calling the script. Common mappings from the study plan:

| #    | Title                                                   |
| ---- | ------------------------------------------------------- |
| 344  | Reverse String                                          |
| 557  | Reverse Words in a String III                           |
| 26   | Remove Duplicates from Sorted Array                     |
| 27   | Remove Element                                          |
| 283  | Move Zeroes                                             |
| 217  | Contains Duplicate                                      |
| 242  | Valid Anagram                                           |
| 383  | Ransom Note                                             |
| 125  | Valid Palindrome                                        |
| 167  | Two Sum II                                              |
| 15   | 3Sum                                                    |
| 11   | Container With Most Water                               |
| 643  | Maximum Average Subarray I                              |
| 3    | Longest Substring Without Repeating Characters          |
| 424  | Longest Repeating Character Replacement                 |
| 209  | Minimum Size Subarray Sum                               |
| 141  | Linked List Cycle                                       |
| 876  | Middle of the Linked List                               |
| 142  | Linked List Cycle II                                    |
| 287  | Find the Duplicate Number                               |
| 704  | Binary Search                                           |
| 35   | Search Insert Position                                  |
| 33   | Search in Rotated Sorted Array                          |
| 34   | Find First and Last Position of Element in Sorted Array |
| 153  | Find Minimum in Rotated Sorted Array                    |
| 20   | Valid Parentheses                                       |
| 155  | Min Stack                                               |
| 150  | Evaluate Reverse Polish Notation                        |
| 739  | Daily Temperatures                                      |
| 853  | Car Fleet                                               |
| 104  | Maximum Depth of Binary Tree                            |
| 226  | Invert Binary Tree                                      |
| 543  | Diameter of Binary Tree                                 |
| 98   | Validate Binary Search Tree                             |
| 230  | Kth Smallest Element in a BST                           |
| 236  | Lowest Common Ancestor of a Binary Tree                 |
| 102  | Binary Tree Level Order Traversal                       |
| 199  | Binary Tree Right Side View                             |
| 515  | Find Largest Value in Each Tree Row                     |
| 103  | Binary Tree Zigzag Level Order Traversal                |
| 700  | Search in a Binary Search Tree                          |
| 108  | Convert Sorted Array to Binary Search Tree              |
| 450  | Delete Node in a BST                                    |
| 235  | Lowest Common Ancestor of a BST                         |
| 200  | Number of Islands                                       |
| 695  | Max Area of Island                                      |
| 133  | Clone Graph                                             |
| 207  | Course Schedule                                         |
| 210  | Course Schedule II                                      |
| 547  | Number of Provinces                                     |
| 323  | Number of Connected Components in an Undirected Graph   |
| 70   | Climbing Stairs                                         |
| 746  | Min Cost Climbing Stairs                                |
| 198  | House Robber                                            |
| 213  | House Robber II                                         |
| 91   | Decode Ways                                             |
| 62   | Unique Paths                                            |
| 64   | Minimum Path Sum                                        |
| 1143 | Longest Common Subsequence                              |
| 46   | Permutations                                            |
| 78   | Subsets                                                 |
| 39   | Combination Sum                                         |
| 17   | Letter Combinations of a Phone Number                   |
| 215  | Kth Largest Element in an Array                         |
| 347  | Top K Frequent Elements                                 |
| 973  | K Closest Points to Origin                              |

If the number isn't in this table, try passing the number as the title — the script's dataset lookup can often resolve it.

For **"next problem"** — read PROGRESS.md and AGENTS.md to determine what the user should work on next based on their current phase/day and what's already been solved.

### Language selection

- Default to `ts` (TypeScript) unless the user specifies otherwise
- The user might say "in python", "py", "use python" — pass `-l py`
- Available languages: `ts`, `py`, `js`, `cpp`

## After fetching

Once the problem is created:

1. Read the generated README.md to confirm it looks good
2. Read the generated solution file to see the starter code and test harness
3. Update PROGRESS.md — add a new row with status `in-progress`
4. Present the problem to the user: show the problem description, examples, and constraints
5. Do NOT show or hint at the solution — follow the coaching rules in AGENTS.md

## Error handling

If the script fails:

- Check that `bun` is installed (`which bun`)
- Check internet connectivity
- The problem name might not match exactly — try variations (e.g., "Two Sum" vs "two-sum")
- If LeetCode rate-limits, wait a moment and retry

## Example

User says: "Let's do problem 283"

1. Look up 283 → "Move Zeroes"
2. Run: `scripts/create-problem.sh -l ts "Move Zeroes"`
3. Read the generated files
4. Update PROGRESS.md
5. Present the problem to the user
