// Sliding Window + Two Pointers
// Maximum sum of subarray of size k using sliding window
const arr: number[] = [1, 4, 2, 10, 23, 3, 1, 0, 20]
const k: number = 4

function maxSumSubarray(arr: number[], k: number): number {
  if (arr.length < k) return 0

  // Calculate sum of first window
  let windowSum = 0
  for (let i = 0; i < k; i++) {
    windowSum += arr[i]
  }

  let maxSum = windowSum

  // Slide the window across the array
  for (let i = k; i < arr.length; i++) {
    // Remove leftmost element of previous window and add new rightmost element
    windowSum = windowSum - arr[i - k] + arr[i]
    maxSum = Math.max(maxSum, windowSum)
  }

  return maxSum
}

console.log(arr)
console.log(maxSumSubarray(arr, k)) // Output: 39

const str: string = 'hello'
const k2: number = 3

function uniqueCharacters(str: string, k: number): string {
  if (str.length < k) return ''

  // Calculate sum of first window
  const firstWindow = str.slice(0, k)
  const uniqueChars = new Set(firstWindow)
  if (uniqueChars.size === k) return firstWindow

  let uniqueString = ''
  for (let i = k; i < str.length; i++) {
    const newChar = str[i]
    const oldChar = str[i - k]
    if (!uniqueChars.has(newChar)) {
      uniqueChars.add(newChar)
    }
    if (
      !uniqueChars.has(oldChar) ||
      str
        .slice(i - k + 1, i + 1)
        .split('')
        .every((char, index, arr) => arr.indexOf(char) === index)
    ) {
      continue
    }
    if (uniqueChars.size === k) {
      uniqueString += str.slice(i - k + 1, i + 1)
    }
  }
  return uniqueString
}

console.log(str)
console.log(uniqueCharacters(str, k2)) // Output: "hel"
