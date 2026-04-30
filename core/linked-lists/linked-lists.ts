class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}

// Insert function
function insert(head: ListNode | null, val: number): ListNode {
  if (head === null) return new ListNode(val)
  let temp: ListNode = head
  while (temp.next !== null) temp = temp.next

  temp.next = new ListNode(val)

  return head
}

// Delete function
function deleteNode(head: ListNode | null, val: number): ListNode | null {
  if (head === null) return null
  if (head.val === val) return head.next
  let prev: ListNode = head
  while (prev.next !== null && prev.next.val !== val) prev = prev.next
  if (prev.next !== null) prev.next = prev.next.next
  return head
}

function reverseList(head: ListNode): ListNode | null {
  let prev: ListNode | null = null
  let current: ListNode | null = head

  while (current !== null) {
    // Save the next node
    const next: ListNode | null = current.next

    // Reverse the pointer, from forward to backward
    current.next = prev
    prev = current

    // Move the pointer to the next node
    current = next
  }
  return prev as ListNode | null
}
