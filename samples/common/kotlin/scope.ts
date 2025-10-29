// === kotlin.ts ===

// Объявляем, что файл — модуль
export {}

declare global {
    interface Object {
        apply<T>(this: T, block: (it: T) => void): T
        also<T>(this: T, block: (it: T) => void): T
        letIt<T, R>(this: T, block: (it: T) => R): R
        withIt<T, R>(this: T, block: (this: T) => R): R
    }
}

function define(name: string, fn: Function) {
    if (!(Object.prototype as any)[name]) {
        Object.defineProperty(Object.prototype, name, {
            value: fn,
            writable: true,
            configurable: true,
            enumerable: false, // не засоряем for..in / Object.keys
        })
    }
}

define('apply', function<T>(this: T, block: (it: T) => void): T {
    block(this); return this
})

define('also', function<T>(this: T, block: (it: T) => void): T {
    block(this); return this
})

define('letIt', function<T, R>(this: T, block: (it: T) => R): R {
    return block(this)
})

define('withIt', function<T, R>(this: T, block: (this: T) => R): R {
    return block.call(this)
})
