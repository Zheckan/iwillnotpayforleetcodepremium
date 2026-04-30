const string =
  `Hey, this is a playground to repeat all API methods for strings, this is a test string. ` +
  `Please make a copy of this string and paste it into a new variable. ` +
  `Then, use the API methods to manipulate the string. ` +
  `Finally, print the result to the console.`

// at: access character at index, supports negative indices (unlike charAt)
console.log('at: ', string.at(0), string.at(-1), typeof string.at(0))

// charAt: access character at index, does not support negative indices
console.log('charAt: ', string.charAt(0), string.charAt(5), typeof string.charAt(0))

// charCodeAt: returns UTF-16 code unit value (0-65535) for character at index
console.log('charCodeAt: ', string.at(0), ' -> ', string.charCodeAt(0), `, 'A' is ${'A'.charCodeAt(0)}`)

// codePointAt: returns Unicode code point (can exceed 65535 for special characters)
console.log('codePointAt: ', string.at(0), ' -> ', string.codePointAt(0), `emoji '😀' is ${'😀'.codePointAt(0)}`)

// concat: concatenates strings without mutating original
const concatString = 'Hello'
const concatenated = concatString.concat(', ', 'world', '!')
console.log('concat: ', `'${concatString}' + ', world!' = '${concatenated}'`)

// endsWith: checks if string ends with substring
console.log(
  `endsWith: '${string.slice(string.length - 20, string.length - 1)}' ends with 'console.'? -> ${string.endsWith('console.')} ends with 'test'? -> ${string.endsWith('test')}`,
)

// includes: checks if string contains substring
console.log(
  `includes: '${string.slice(10, 40)}' includes 'playground'? -> ${string.includes('playground')} includes 'xyz'? -> ${string.includes('xyz')}`,
)

// indexOf: finds first occurrence index of substring
const testString = 'hello world, hello universe'
console.log(
  `indexOf: '${testString}' first 'hello' at index ${testString.indexOf('hello')}, starting from index 7? -> ${testString.indexOf('hello', 7)}`,
)

// isWellFormed: validates string according to Unicode standard
const validString = 'Hello, world!'
const invalidString = 'ab\uD800' // unpaired surrogate
console.log(
  `isWellFormed: '${validString}' is well-formed? -> ${validString.isWellFormed()}, invalid surrogate? '${invalidString}' -> ${invalidString.isWellFormed()}`,
)

// lastIndexOf: finds last occurrence index of substring
const lastIndexTestString = 'apple pie, apple juice, apple cake'
console.log(
  `lastIndexOf: '${lastIndexTestString}' last 'apple' at index ${lastIndexTestString.lastIndexOf('apple')}, before index 15? -> ${lastIndexTestString.lastIndexOf('apple', 15)}`,
)

// length: really have to explain this?
console.log(`length: '${validString}' has length ${validString.length}, 'emoji😀' has length ${'emoji😀'.length}`)

// localeCompare: compares strings using locale rules
const str1 = 'apple'
const str2 = 'banana'
console.log(`localeCompare: '${str1}' vs '${str2}' = ${str1.localeCompare(str2)} (negative = comes first)`)

// match: finds all matches of regex pattern (with g flag)
const textWithMatches = 'cat dog cat bird cat'
console.log(`match: '${textWithMatches}' match /cat/g -> ${JSON.stringify(textWithMatches.match(/cat/g))}`)

// matchAll: returns iterator of all regex matches with details
const matchIterator = [...'test123test456'.matchAll(/\d+/g)]
console.log(
  `matchAll: 'test123test456'.matchAll(/\\d+/g) found ${matchIterator.length} matches: ${matchIterator.map((m) => m[0]).join(', ')}`,
)

// normalize: normalizes Unicode characters to standard form
const composed = 'e\u0301' // e with combining acute
const decomposed = 'é' // precomposed é
console.log(
  // @ts-ignore
  `normalize: '${composed}' === '${decomposed}'? -> ${composed === decomposed}, after NFC? -> ${composed.normalize('NFC') === decomposed.normalize('NFC')}`,
)

// padEnd: pads string end to specified length
const padEndTest = 'Hi'
console.log(`padEnd: '${padEndTest}' padded to length 10 with '*' -> '${padEndTest.padEnd(10, '*')}'`)

// padStart: pads string start to specified length
const padStartTest = 'Hi'
console.log(`padStart: '${padStartTest}' padded to length 10 with '*' -> '${padStartTest.padStart(10, '*')}'`)

// repeat: repeats string n times
const repeatTest = 'Ha'
console.log(`repeat: '${repeatTest}' repeated 4 times -> '${repeatTest.repeat(4)}'`)

// replace: replaces first occurrence only
const replaceTest = 'The quick brown fox jumps over the lazy dog'
console.log(`replace: '${replaceTest}' replace first 'the' -> '${replaceTest.replace(/the/i, 'THE')}'`)

// replaceAll: replaces all occurrences
const replaceAllTest = 'cat and cat and cat'
console.log(`replaceAll: '${replaceAllTest}' replace all 'cat' -> '${replaceAllTest.replaceAll('cat', 'dog')}'`)

// search: returns index of first regex match
const searchTest = 'Visit Microsoft'
console.log(`search: '${searchTest}' search /[Microsoft]/ -> index ${searchTest.search(/Microsoft/)}`)

// slice: extracts substring by start and end indices (supports negative)
const sliceTest = 'Hello, World!'
console.log(`slice: '${sliceTest}' slice(0, 5) -> '${sliceTest.slice(0, 5)}', slice(-6) -> '${sliceTest.slice(-6)}'`)

// split: splits string into array by separator
const splitTest = 'apple,banana,orange'
console.log(`split: '${splitTest}' split by ',' -> ${JSON.stringify(splitTest.split(','))}`)

// startsWith: checks if string starts with substring
console.log(
  `startsWith: '${validString}' starts with 'Hello'? -> ${validString.startsWith('Hello')} starts with 'Hey'? -> ${validString.startsWith('Hey')}`,
)

// substring: extracts substring (similar to slice but no negative indices)
const substringTest = 'Hello, World!'
console.log(
  `substring: '${substringTest}' substring(0, 5) -> '${substringTest.substring(0, 5)}', substring(7) -> '${substringTest.substring(7)}'`,
)

// toLocaleLowerCase: converts to lowercase respecting locale rules (user device language)
const localeLowerTest = 'HELLO WORLD'
console.log(`toLocaleLowerCase: '${localeLowerTest}' to locale lowercase -> '${localeLowerTest.toLocaleLowerCase()}'`)

// toLocaleUpperCase: converts to uppercase respecting locale rules (user device language)
const localeUpperTest = 'hello world'
console.log(`toLocaleUpperCase: '${localeUpperTest}' to locale uppercase -> '${localeUpperTest.toLocaleUpperCase()}'`)

// toLowerCase: converts all characters to lowercase (Unicode standard mapping)
const lowerTest = 'JavaScript IS Fun'
console.log(`toLowerCase: '${lowerTest}' to lowercase -> '${lowerTest.toLowerCase()}'`)

// toUpperCase: converts all characters to uppercase (Unicode standard mapping)
const upperTest = 'JavaScript is fun'
console.log(`toUpperCase: '${upperTest}' to uppercase -> '${upperTest.toUpperCase()}'`)

// toString: really have to explain this?
const stringObj = 'Hello'
console.log(`toString: stringObj.toString() -> '${stringObj.toString()}', typeof -> '${typeof stringObj.toString()}'`)

// trim: removes leading and trailing whitespace (not just spaces)
const trimTest = '   Hello, World!   '
console.log(`trim: '${trimTest}' trimmed -> '${trimTest.trim()}'`)

// trimEnd: removes trailing whitespace only
const trimEndTest = '   Hello, World!   '
console.log(`trimEnd: '${trimEndTest}' trimmed end -> '${trimEndTest.trimEnd()}'`)

// trimStart: removes leading whitespace only
const trimStartTest = '   Hello, World!   '
console.log(`trimStart: '${trimStartTest}' trimmed start -> '${trimStartTest.trimStart()}'`)

// valueOf: returns primitive value (usually same as toString for strings)
const valueOfTest = 'Hello, World!'
console.log(
  `valueOf: '${valueOfTest}' valueOf -> '${valueOfTest.valueOf()}', typeof -> '${typeof valueOfTest.valueOf()}'`,
)
