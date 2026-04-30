/*
      1
    / \
    2   3
    / \
   4   5

Preowrder:  1 → 2 → 4 → 5 → 3
Inorder:   4 → 2 → 5 → 1 → 3
Postorder: 4 → 5 → 2 → 3 → 1
*/
class Tree {
  current: number
  left: Tree | null
  right: Tree | null

  constructor(val?: number, left?: Tree | null, right?: Tree | null) {
    this.current = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
  }
}

function dfs(tree: Tree | null, value: number) {
  if (tree === null) return null
  const stack: (Tree | null)[] = [tree]
  while (stack.length > 0) {
    const current = stack.pop()
    if (current === null || current === undefined) continue
    if (current.current === value) return current
    if (current.right) stack.push(current.right)
    if (current.left) stack.push(current.left)
  }
  return null
}

function bfs(tree: Tree | null, value: number) {
  if (tree === null) return null
  const queue: (Tree | null)[] = [tree]
  while (queue.length > 0) {
    const current = queue.shift()
    if (current === null || current === undefined) continue
    if (current.current === value) return current
    if (current.left) queue.push(current.left)
    if (current.right) queue.push(current.right)
  }
  return null
}

// Test cases
const tree = new Tree(5, new Tree(3, new Tree(2), new Tree(4)), new Tree(7, new Tree(6), new Tree(8)))
console.log(bfs(tree, 5))
console.log(bfs(tree, 3))
console.log(bfs(tree, 7))

console.log(dfs(tree, 5))
console.log(dfs(tree, 3))
console.log(dfs(tree, 7))

// Will not find number
console.log(bfs(tree, 9))
console.log(dfs(tree, 9))
