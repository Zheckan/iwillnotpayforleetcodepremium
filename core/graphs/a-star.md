# A\* Algorithm — Interview Reference

## A\* vs Dijkstra

**Dijkstra:** explores nodes by **distance from start** only. Expands in all directions equally.

**A\*:** explores nodes by **distance from start + estimated distance to goal**. Prioritizes nodes that seem closer to the destination.

A\* knows where the goal is located, so it goes in its direction. Dijkstra is blind to the goal's position.

### Helpful Visualization

A\* vs Dijkstra side by side: https://www.youtube.com/shorts/aXdS8QC2f1M

## The Formula

```
f(n) = g(n) + h(n)

g(n) = actual cost from start to n (same as Dijkstra)
h(n) = estimated cost from n to goal (the heuristic)
f(n) = total estimated cost — used to pick next node
```

A\* processes **one node at a time** — always the one with the smallest `f(n)`. Its neighbors get added to the priority queue with their `f(n)` scores. Same loop as Dijkstra, just a different definition of "cheapest."

If `h(n) = 0` for all nodes → A\* becomes Dijkstra.

## The Heuristic

The heuristic `h(n)` is your "guess" of remaining distance. Must be **admissible** — never overestimates the true cost. If it overestimates, A\* might miss the shortest path.

Common heuristics:

- **Manhattan distance** (grid, 4-direction): `|x1-x2| + |y1-y2|`
- **Euclidean distance** (any direction): `sqrt((x1-x2)² + (y1-y2)²)`

## When to Use What

|                      | Dijkstra                     | A\*                                |
| -------------------- | ---------------------------- | ---------------------------------- |
| Goal                 | Shortest path to ALL nodes   | Shortest path to ONE specific node |
| Heuristic            | None                         | Needs one (domain-specific)        |
| Speed                | Slower (explores everything) | Faster (guided toward goal)        |
| Knows goal location? | No                           | Yes                                |
| Use case             | Network routing, all-pairs   | GPS navigation, game pathfinding   |

## What to Say in Interview

> "A\* is like Dijkstra but with a heuristic that estimates the remaining distance
> to the goal. Instead of exploring all nodes by distance from start, it prioritizes
> nodes with the lowest estimated total cost — actual distance so far plus estimated
> distance remaining. This makes it much faster for point-to-point shortest path
> problems. The heuristic must be admissible — it should never overestimate the
> true cost."

## Connection to Problems Solved

- **#743 Network Delay Time** — solved with Dijkstra (find shortest path to ALL nodes)
- If the problem asked "shortest path to one specific node" → A\* would be more efficient
