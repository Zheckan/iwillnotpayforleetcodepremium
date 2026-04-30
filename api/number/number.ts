// toExponential: returns a string representing the number in exponential notation
const exponentialNumber = 123456.789
console.log(`toExponential: '${exponentialNumber}' to exponential? -> ${exponentialNumber.toExponential(2)}`)

// toFixed: returns a string representing the number in fixed point notation
const toFixedNumber = 19.567
console.log(`toFixed: '${toFixedNumber}' to fixed? -> ${toFixedNumber.toFixed(2)}`)

// toLocaleString: returns a string representing the number in the local language
const toLocaleStringNumber = 1234567.89
console.log(`toLocaleString: '${toLocaleStringNumber}' to locale string? -> ${toLocaleStringNumber.toLocaleString()}`)

// toPrecision: returns a string representing the number in precision notation
const toPrecisionNumber = 123.456
console.log(`toPrecision: '${toPrecisionNumber}' to precision? -> ${toPrecisionNumber.toPrecision(4)}`)

// toString: returns a string representing the number in string notation
const toStringNumber = 42
console.log(
  `toString: '${toStringNumber}' to string? -> ${toStringNumber.toString()} type of? -> ${typeof toStringNumber.toString()}`,
)

// valueOf: returns the primitive value of the number
const valueOfNumber = 99.99
console.log(`valueOf: '${valueOfNumber}' value of? -> ${valueOfNumber.valueOf()}`)
