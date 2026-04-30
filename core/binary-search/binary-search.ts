const arr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function binarySearch(arr: number[], val: number) {
  let left: number = 0
  let right: number = arr.length - 1

  while (left <= right) {
    let middle: number = Math.floor((left + right) / 2)
    if (arr[middle] === val) return middle
    if (arr[middle] < val) left = middle + 1
    else right = middle - 1
  }
  return -1
}
