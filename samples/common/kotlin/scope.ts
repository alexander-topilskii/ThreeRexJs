// === kotlin.ts ===


declare global {
    interface Object {
        apply<T>(this: T, block: (it: T) => void): T
        also<T>(this: T, block: (it: T) => void): T
        letIt<T, R>(this: T, block: (it: T) => R): R
        withIt<T, R>(this: T, block: (this: T) => R): R
    }
}

Object.prototype.apply = function<T>(this: T, block: (it: T) => void): T {
    block(this)
    return this
}
Object.prototype.also = function<T>(this: T, block: (it: T) => void): T {
    block(this)
    return this
}
Object.prototype.letIt = function<T, R>(this: T, block: (it: T) => R): R {
    return block(this)
}
Object.prototype.withIt = function<T, R>(this: T, block: (this: T) => R): R {
    return block.call(this)
}


// Аналог Kotlin apply { } — вызывает блок с объектом и возвращает сам объект
export function apply<T>(obj: T, block: (it: T) => void): T {
    block(obj)
    return obj
}

// Аналог Kotlin also { } — вызывает блок с объектом и возвращает его (но блок обычно для побочных эффектов)
export function also<T>(obj: T, block: (it: T) => void): T {
    block(obj)
    return obj
}

// Аналог Kotlin let { } — вызывает блок и возвращает результат блока
export function letIt<T, R>(obj: T, block: (it: T) => R): R {
    return block(obj)
}

// Аналог Kotlin run { } — просто выполняет блок и возвращает результат
export function run<R>(block: () => R): R {
    return block()
}

// Аналог Kotlin with(obj) { } — вызывает блок, где контекстом служит объект
export function withIt<T, R>(obj: T, block: (this: T) => R): R {
    return block.call(obj)
}
