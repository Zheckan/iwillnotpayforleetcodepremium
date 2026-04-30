const baseArray = [10, 20, 30, 40, 50]

// length: property indicating the number of elements
console.log('length: ', baseArray.length)

// at: accesses element at index, supports negative positions
console.log('at: ', baseArray.at(0), baseArray.at(-1))

// concat: merges arrays without mutating original
console.log('concat: ', baseArray.concat([60, 70]))

// copyWithin: copies part of array within itself (mutates)
const copyWithinArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
copyWithinArray.copyWithin(2, 6, 9)
console.log('copyWithin: ', copyWithinArray)

// entries: returns iterator of [index, value] pairs
console.log('entries: ', [...baseArray.entries()])

// every: tests whether all elements pass predicate
console.log(
  'every: ',
  baseArray.every((value) => value > 0),
  baseArray.every((value) => value > 25),
)

// fill: overwrites elements with a static value (mutates)
const fillArray = [1, 2, 3, 4, 5]
fillArray.fill(0, 1, 4)
console.log('fill: ', fillArray)

// filter: creates new array with elements passing predicate
console.log(
  'filter: ',
  baseArray.filter((value) => value >= 30),
)

// find: returns first element that satisfies predicate
console.log(
  'find: ',
  baseArray.find((value) => value > 25),
)

// findIndex: returns index of first element satisfying predicate
console.log(
  'findIndex: ',
  baseArray.findIndex((value) => value === 30),
)

// findLast: returns last element satisfying predicate
const findLastNumbers = [5, 12, 8, 130, 44]
console.log(
  'findLast: ',
  findLastNumbers.findLast((value) => value > 10),
)

// findLastIndex: returns index of last element satisfying predicate
console.log(
  'findLastIndex: ',
  findLastNumbers.findLastIndex((value) => value > 10),
)

// flat: flattens nested arrays by depth, default depth is 1, if depth is 0, returns the original array
const nestedArray = [1, [2, 3], [4, [5, 6]]]
console.log('flat: ', nestedArray.flat(), nestedArray.flat(2))

// flatMap: maps and flattens one level in a single pass
const phrases = ['hello world', 'array api']
console.log(
  'flatMap: ',
  phrases.flatMap((phrase) => phrase.split(' ')),
)

// forEach: executes callback for each array element
const forEachUppercase: string[] = []
phrases.forEach((phrase) => forEachUppercase.push(phrase.toUpperCase()))
console.log('forEach: ', forEachUppercase)

// includes: checks if value is present
console.log('includes: ', baseArray.includes(30), baseArray.includes(999))

// indexOf: finds first index of value (-1 if absent)
const letters = ['a', 'b', 'a', 'c']
console.log('indexOf: ', letters.indexOf('a'), letters.indexOf('z'))

// join: concatenates elements into a string with separator
console.log('join: ', letters.join('-'))

// keys: returns iterator over indices
console.log('keys: ', [...baseArray.keys()])

// lastIndexOf: finds last occurrence index of value
console.log('lastIndexOf: ', letters.lastIndexOf('a'), letters.lastIndexOf('z'))

// map: transforms array by applying function to each element
console.log(
  'map: ',
  baseArray.map((value) => value / 10),
)

// pop: removes and returns last element (mutates)
const popArray = [1, 2, 3]
console.log('pop: ', popArray.pop(), popArray)

// push: adds elements to end, returns new length (mutates)
const pushArray = [1, 2, 3]
console.log('push: ', pushArray.push(4, 5), pushArray)

// reduce: reduces array to single value from left to right
const reduceArray = [1, 2, 3, 4]
console.log(
  'reduce: ',
  reduceArray.reduce((total, value) => total + value, 0),
)

// reduceRight: reduces array from right to left
const reduceRightArray = ['a', 'b', 'c']
console.log(
  'reduceRight: ',
  reduceRightArray.reduceRight((acc, value) => acc + value, ''),
)

// reverse: reverses array in place
const reverseArray = [1, 2, 3, 4]
reverseArray.reverse()
console.log('reverse: ', reverseArray)

// shift: removes and returns first element (mutates)
const shiftArray = [10, 20, 30]
console.log('shift: ', shiftArray.shift(), shiftArray)

// slice: returns shallow copy of portion of array
console.log('slice: ', baseArray.slice(1, 3), baseArray.slice(-2))

// some: tests whether at least one element passes predicate
console.log(
  'some: ',
  baseArray.some((value) => value === 20),
  baseArray.some((value) => value > 100),
)

// sort: sorts array in place, optionally by comparator
const sortArray = [3, 1, 4, 1, 5]
sortArray.sort((a, b) => a - b)
console.log('sort: ', sortArray)

// splice: adds/removes elements in place
const spliceArray = [1, 2, 3, 4, 5]
console.log('splice: ', spliceArray.splice(1, 2, 99, 100), spliceArray)

// toLocaleString: joins elements using locale-specific conversions
const localeArray = [123456.789, new Date('2024-01-01T00:00:00Z')]
console.log('toLocaleString: ', localeArray.toLocaleString('en-US'))

// toString: returns comma-separated string representation
console.log('toString: ', baseArray.toString())

// valueOf: returns the array object itself (primitive conversion hook)
const valueOfArray = [7, 8, 9]
console.log('valueOf: ', valueOfArray.valueOf(), valueOfArray.valueOf() === valueOfArray)

// unshift: adds elements to start, returns new length (mutates)
const unshiftArray = [3, 4]
console.log('unshift: ', unshiftArray.unshift(1, 2), unshiftArray)

// values: returns iterator of values (default iterator)
console.log('values: ', [...baseArray.values()])

// Symbol.iterator: same as values, enables for...of
console.log('Symbol.iterator: ', [...baseArray[Symbol.iterator]()])

// with: returns copy with element replaced at index (no mutation)
const withArray = [1, 2, 3, 4]
console.log('with: ', withArray.with(2, 99), withArray)

// toReversed: returns reversed copy without mutating original
const toReversedArray = [1, 2, 3]
console.log('toReversed: ', toReversedArray.toReversed(), toReversedArray)

// toSorted: returns sorted copy without mutating original
const toSortedArray = [3, 7, 2, 5]
console.log('toSorted: ', toSortedArray.toSorted(), toSortedArray)

// toSpliced: returns copy with splice operations applied
const toSplicedArray = [1, 2, 3, 4]
console.log('toSpliced: ', toSplicedArray.toSpliced(1, 2, 99), toSplicedArray)
