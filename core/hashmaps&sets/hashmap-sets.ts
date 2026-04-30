// Hashmap and Set implementation (both are built-in types in JavaScript, will use built-in in next section)
class HashMapMyType<K, V> {
  private map: Array<[K, V]>
  constructor() {
    this.map = []
  }

  insert(key: K, value: V) {
    if (this.get(key)) return console.error('Key already exists in map')
    this.map.push([key, value])
  }

  get(key: K) {
    return this.map.find(([k, v]) => k === key)?.[1]
  }

  delete(key: K) {
    this.map = this.map.filter(([k, v]) => k !== key)
  }
}

class SetMyType<T> {
  private set: Array<T>
  constructor() {
    this.set = []
  }
  insert(value: T) {
    if (this.set.includes(value)) return console.error('Value already exists in set')
    this.set.push(value)
  }

  delete(value: T) {
    this.set = this.set.filter((v) => v !== value)
  }

  contains(value: T) {
    return this.set.includes(value)
  }
}
