# NP

### Three categories to know

| Category        | Solvable efficiently?                                                                                                                 | Example                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **P**           | Yes — O(n), O(n²), O(n log n)                                                                                                         | Sorting, binary search, shortest path  |
| **NP**          | Verifiable efficiently (can check a solution fast, but finding it is hard)                                                            | Sudoku — hard to solve, easy to verify |
| **NP-Complete** | Hardest in NP. No known fast solution. Just 'try and see' approachable solution, because we have no idea how to solve it efficiently. | Traveling salesman, knapsack           |

---

### How algorithm runtimes compare

Here is how fast (or slow) a problem can become as size `n` increases:

| Type                      | Growth | Example          | n=20 operations           |
| ------------------------- | ------ | ---------------- | ------------------------- |
| **Polynomial (fast)**     | O(n²)  | Sorting          | 400 operations            |
| **Exponential (slow)**    | O(2ⁿ)  | Brute-force TSP  | 1,048,576 operations      |
| **Factorial (very slow)** | O(n!)  | All permutations | 2,432,902,008,176,640,000 |

- **Polynomial time algorithms** (like sorting) remain manageable as `n` grows.
- **Exponential and factorial time** problems quickly become infeasible even for small `n`.

---

### NP-Complete problems

There is no humanly possible way to solve these problems efficiently.

- **Traveling Salesman**
  - We can't efficiently find the shortest path between all cities before we visit them all. So this problem is NP in best case. But we can verify a solution quickly.
  - We can think that this is sort of as dijkstra's algorithm, but we need to visit all cities, not just fastest path from one city to another.
- **Knapsack**
  - We know all weights and values, but there are 2^n possible subsets to check — no known polynomial solution for the general case. But we can verify a given solution quickly.
  - **0/1 Knapsack** (each item used once) is NP-complete. **Unbounded Knapsack** (reuse allowed) is solvable with DP — like #39 Combination Sum.

### NP problems

- **Sudoku**
  - Can verify a solution quickly. But not solvable efficiently, we can brute force it.

### P problems

- Sorting, binary search, shortest path, etc. (covered previously) — all have known, efficient (polynomial time) solutions.

### Quick Recognition Cheat Sheet

| If the problem says...                  | It might be...                   |
| --------------------------------------- | -------------------------------- |
| "Visit all nodes/cities and return"     | TSP (Traveling Salesman Problem) |
| "Maximize value with weight/size limit" | Knapsack                         |
| "Partition into two equal subsets"      | Subset Sum (NP-complete)         |
| "Find minimum colors for a graph"       | Graph Coloring (NP-complete)     |
| "Is there a subset that sums to X"      | Subset Sum                       |
