# Balanced BST — AVL & Red-Black Trees

## Why Balanced Trees?

A BST gives O(h) operations (search, insert, delete). But h depends on shape:

```
Skewed BST (h = n):        Balanced BST (h = log n):
1                                  4
 \                                / \
  2                              2   6
   \                            / \ / \
    3                          1  3 5  7
     \
      4         O(n) ops        O(log n) ops
```

Balanced BSTs automatically maintain h = O(log n) through **rotations** after insert/delete.

---

## AVL Tree

AVL is a BST where every node satisfies the **balance factor** rule.

### Balance Factor

```
balanceFactor(node) = height(left subtree) - height(right subtree)
```

**Rule:** balance factor must be -1, 0, or 1 for every node.

```
Valid AVL:          Invalid AVL:
     3  (bf=0)           3  (bf=-2) ← violates!
    / \                   \
   2   4                   4
  /                         \
 1                            5
```

### How It Stays Balanced — Rotations

When insert/delete causes |bf| > 1, perform a rotation:

**Left Rotation** (right-heavy):

```
  1  (bf=-2)           2
   \          →       / \
    2                1   3
     \
      3
```

**Right Rotation** (left-heavy):

```
      3  (bf=2)        2
     /        →       / \
    2                1   3
   /
  1
```

**Left-Right** (left child is right-heavy):

```
    3                3              2
   /    left rot    /   right rot  / \
  1     on 1  →   2       →      1   3
   \             /
    2           1
```

**Right-Left** (mirror of above):

```
  1              1                2
   \  right rot   \   left rot  / \
    3  on 3  →     2     →     1   3
   /                \
  2                  3
```

### AVL Properties

- **Strictly balanced** — height difference ≤ 1 at every node
- **h ≤ 1.44 log n** — tighter than red-black
- **Search:** slightly faster than red-black (shorter height)
- **Insert/Delete:** more rotations needed (up to O(log n) rotations per operation)
- **Used in:** databases, lookup-heavy applications

---

## Red-Black Tree

A BST where nodes are colored **red** or **black**, with rules that ensure approximate balance.

### The 5 Rules

1. Every node is either **red** or **black**
2. The **root** is always **black**
3. Every null leaf (NIL) is **black**
4. **No two red nodes in a row** — a red node cannot have a red parent or red child
5. **Every path** from root to any null leaf has the **same number of black nodes** (called "black-height")

### Example

```
        8 (B)
       / \
      4(R)  12(R)
     / \    / \
   2(B) 6(B) 10(B) 14(B)
```

Check the rules:

- Root (8) is black ✓
- No red-red parent-child ✓ (4's children are black, 12's children are black)
- Black-height from root to any null = 2 ✓ (every path hits exactly 2 black nodes before null)

### Why This Guarantees Balance

Rule 4 (no red-red) + Rule 5 (equal black-height) together mean:

- Longest path: alternating red-black = 2 × black-height
- Shortest path: all black = black-height
- So longest path ≤ 2 × shortest path
- This guarantees **h ≤ 2 log n**

### Red-Black vs AVL

| Property           | AVL                    | Red-Black                                |
| ------------------ | ---------------------- | ---------------------------------------- |
| Balance strictness | height diff ≤ 1        | h ≤ 2 log n (relaxed)                    |
| Search speed       | Slightly faster        | Slightly slower                          |
| Insert/Delete      | More rotations         | Fewer rotations (max 2-3)                |
| Memory             | Stores height per node | Stores 1 bit (color) per node            |
| Best for           | Read-heavy workloads   | Write-heavy / general purpose            |
| Used in            | Databases              | Java TreeMap, C++ std::map, Linux kernel |

### What to Say in Interview

> "I'm familiar with AVL and red-black trees. Both are self-balancing BSTs that maintain O(log n) operations through rotations.
>
> AVL is strictly balanced — the height difference between left and right subtrees is at most 1 at every node. It's faster for lookups but needs more rotations on insert/delete.
>
> Red-black trees use node coloring with 5 rules — no two red nodes in a row, and every root-to-leaf path has the same number of black nodes. This gives a looser balance (h ≤ 2 log n) but requires fewer rotations, which is why it's used in most standard library implementations like Java's TreeMap."

---

## Connection to Problems Solved

- **#98 Validate BST** — validated BST property. Balanced BSTs add height/color constraints on top
- **#108 Sorted Array to BST** — built balanced BST by picking middle. AVL/Red-Black do this automatically via rotations
- **#450 Delete Node in BST** — after deletion, balanced BSTs would rotate to restore balance
- **#700 Search in BST** — O(h) search. In balanced BST, h = O(log n) guaranteed
