export {}

const array: number[] = [5, 3, 8, 4, 2, 7, 1, 6, 9, 0, 10, 5, 8, 8]

function quickSort(array: number[]): number[] {
  if (array.length <= 1) return array

  const pivot = array[Math.floor(array.length / 2)]
  const less = array.filter((item: number) => item < pivot)
  const equal = array.filter((item: number) => item === pivot)
  const greater = array.filter((item: number) => item > pivot)

  return [...quickSort(less), ...equal, ...quickSort(greater)]
}

console.log(array)
console.log(quickSort(array))
