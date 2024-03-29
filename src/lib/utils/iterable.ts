type Iterableify<T> = { [K in keyof T]: Iterable<T[K]> }

export function* zip<T extends Array<any>>(
    ...toZip: Iterableify<T>
): Generator<T> {
    // Get iterators for all of the iterables.
    const iterators = toZip.map(i => i[Symbol.iterator]())

    while (true) {
        // Advance all of the iterators.
        const results = iterators.map(i => i.next())

        // If any of the iterators are done, we should stop.
        if (results.some(({ done }) => done)) {
            break
        }

        // We can assert the yield type, since we know none
        // of the iterators are done.
        yield results.map(({ value }) => value) as T
    }
}

export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);