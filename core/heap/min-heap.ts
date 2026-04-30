/**
 * MinHeap — smallest element always at the top
 *
 * Parent is always <= children
 * Stored as array: parent at i, left child at 2i+1, right child at 2i+2
 *
 * Operations:
 *   push(val)  — add element, bubble UP to maintain heap property    O(log n)
 *   pop()      — remove & return min, bubble DOWN to restore heap    O(log n)
 *   peek()     — return min without removing                         O(1)
 *   size()     — number of elements                                  O(1)
 *
 * Visual:
 *        1
 *       / \
 *      3   5      →  array: [1, 3, 5, 7, 9]
 *     / \
 *    7   9
 *
 * Index math:
 *   parent(i)     = Math.floor((i - 1) / 2)
 *   leftChild(i)  = 2 * i + 1
 *   rightChild(i) = 2 * i + 2
 */

export class MinHeap {
  private heap: number[] = []

  /** Return number of elements in the heap */
  get size(): number {
    return this.heap.length
  }

  /** Return the minimum element without removing it */
  peek(): number | undefined {
    return this.heap[0]
  }

  /** Add a new element to the heap */
  push(val: number): void {
    this.heap.push(val)
    this.bubbleUp(this.heap.length - 1)
  }

  /** Remove and return the minimum element */
  pop(): number | undefined {
    const min = this.heap[0]
    this.heap[0] = this.heap.pop()!
    this.bubbleDown(0)
    return min
  }

  /** Swap two elements in the heap array */
  private swap(i: number, j: number): void {
    ;[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }

  /** Move element at index UP until heap property is restored */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.heap[index] < this.heap[parentIndex]) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else {
        break
      }
    }
  }

  /** Move element at index DOWN until heap property is restored */
  private bubbleDown(index: number): void {
    while (index < this.heap.length) {
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2
      const smallerChildIndex =
        this.heap[leftChildIndex] < this.heap[rightChildIndex] ? leftChildIndex : rightChildIndex
      if (this.heap[index] > this.heap[smallerChildIndex]) {
        this.swap(index, smallerChildIndex)
        index = smallerChildIndex
      } else {
        break
      }
    }
  }
}

// --- Test your implementation ---
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const heap = new MinHeap()

  heap.push(5)
  heap.push(3)
  heap.push(8)
  heap.push(1)
  heap.push(9)

  console.assert(heap.peek() === 1, `peek should be 1, got ${heap.peek()}`)
  console.assert(heap.size === 5, `size should be 5, got ${heap.size}`)

  console.assert(heap.pop() === 1, 'pop should return 1')
  console.assert(heap.pop() === 3, 'pop should return 3')
  console.assert(heap.pop() === 5, 'pop should return 5')
  console.assert(heap.pop() === 8, 'pop should return 8')
  console.assert(heap.pop() === 9, 'pop should return 9')
  console.assert(heap.pop() === undefined, 'pop on empty should return undefined')

  console.log('All MinHeap tests passed!')
}
