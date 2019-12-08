// TypeKey must be one of the ID types
export class CSet<TypeID>
{
    
    private set_: Set<string>;

    constructor(id_array: TypeID[])
    {
        this.set_ = new Set<string>();

        for (let id of id_array)
        {
            this.set_.add(JSON.stringify(id));
        }
    }

    add(value: TypeID): void
    {
        this.set_.add(JSON.stringify(value));
    }

    delete(value: TypeID): void
    {
        this.set_.delete(JSON.stringify(value));
    }

    has(value: TypeID): boolean
    {
        return this.set_.has(JSON.stringify(value));
    }

    // TODO iterator
}

// export class CMapIterable<TypeKey> implements IterableIterator<TypeKey>
// {
//     iterator_: IterableIterator<string>;

//     constructor(iterator: IterableIterator<string>)
//     {
//         this.iterator_ = iterator;
//     }

//     next(): IteratorResult<TypeKey>
//     {
//         let next: IteratorResult<string> = this.iterator_.next();
//         return { done: next.done, value: JSON.parse(next.value) };
//     }

//     // TODO
//     [Symbol.iterator] = undefined;
// }