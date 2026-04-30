# OOP & SOLID — Interview Reference

## Four Pillars of OOP

### 1. Encapsulation — hide internals, expose public interface

```ts
class BankAccount {
  private balance: number = 0 // hidden from outside

  deposit(amount: number): void {
    // public interface
    this.balance += amount
  }

  getBalance(): number {
    return this.balance
  }
}
```

Already used in: MinStack (#155), Trie (#208), WordDictionary (#211)

### 2. Abstraction — expose only what's needed, hide complexity

```ts
// User doesn't need to know HOW sort works
nums.sort((a, b) => a - b)

// Trie: user calls insert("apple"), doesn't know about nodes/isEnd
trie.insert('apple')
```

### 3. Inheritance — child class extends parent

```ts
class Animal {
  speak(): string {
    return '...'
  }
}

class Dog extends Animal {
  speak(): string {
    return 'Woof'
  } // override
}
```

### 4. Polymorphism — same interface, different behavior

```ts
const animals: Animal[] = [new Dog(), new Cat()]
animals.forEach((a) => a.speak()) // each calls its own version
```

---

## SOLID Principles

| Letter | Principle             | One-liner                                    | Example                                                               |
| ------ | --------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| **S**  | Single Responsibility | A class does one thing                       | Don't mix user auth and email sending in one class                    |
| **O**  | Open/Closed           | Open for extension, closed for modification  | Add new shapes via subclasses, don't modify the Shape base class      |
| **L**  | Liskov Substitution   | Child can replace parent without breaking    | If Dog extends Animal, any code using Animal should work with Dog     |
| **I**  | Interface Segregation | Many small interfaces > one big one          | `Readable` and `Writable` instead of one giant `FileSystem` interface |
| **D**  | Dependency Inversion  | Depend on abstractions, not concrete classes | Function takes `Database` interface, not `PostgresDB` directly        |

Most important for L3: **S** (Single Responsibility) and **D** (Dependency Inversion).

---

## Interface vs Abstract Class

```ts
// Interface — contract only, no implementation
interface Searchable {
  search(query: string): Result[]
}

// Abstract class — partial implementation, can have shared logic
abstract class Database {
  connect(): void {
    /* shared logic */
  }
  abstract query(sql: string): Row[] // subclass MUST implement
}

class PostgresDB extends Database {
  query(sql: string): Row[] {
    /* postgres-specific */
  }
}
```

**When to use which:**

- **Interface** — when you just need a contract (multiple classes can implement it)
- **Abstract class** — when you have shared logic that subclasses inherit

---

## When OOP Might Come Up in Interview

- **"Design a parking lot"** — classes for ParkingLot, Spot, Vehicle
- **"How would you structure this code?"** — use classes, interfaces, separation of concerns
- **During coding** — using a class instead of loose functions shows awareness
- **"What are the SOLID principles?"** — know at least S and D with examples

---

## TypeScript-Specific OOP Features

```ts
// Access modifiers
class User {
  public name: string // accessible everywhere (default)
  private id: number // only inside this class
  protected email: string // inside this class + subclasses
  readonly role: string // can't be changed after construction

  constructor(name: string, id: number, email: string, role: string) {
    this.name = name
    this.id = id
    this.email = email
    this.role = role
  }
}

// Shorthand constructor (same as above)
class UserShort {
  constructor(
    public name: string,
    private id: number,
    protected email: string,
    readonly role: string,
  ) {}
}

// Implements interface
interface Logger {
  log(message: string): void
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message)
  }
}
```
