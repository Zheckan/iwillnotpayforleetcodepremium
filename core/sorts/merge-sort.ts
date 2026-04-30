const array: number[] = [5, 3, 8, 4, 2, 7, 1, 6, 9, 0, 10]

function mergeSort(array: number[]): number[] {
  if (array.length <= 1) return array

  const mid = Math.floor(array.length / 2)
  const left = array.slice(0, mid)
  const right = array.slice(mid)

  return merge(mergeSort(left), mergeSort(right))
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      result.push(left[leftIndex])
      leftIndex++
    } else {
      result.push(right[rightIndex])
      rightIndex++
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
}

console.log(array)
console.log(mergeSort(array))
