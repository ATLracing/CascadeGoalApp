// TypeKey must be one of the ID types
export class CMap<TypeKey, TypeValue>
{
    
    private map_: Map<string, TypeValue>;

    constructor()
    {
        this.map_ = new Map<string, TypeValue>();
    }

    set(key: TypeKey, value: TypeValue): void
    {
        this.map_.set(JSON.stringify(key), value);
    }

    delete(key: TypeKey): void
    {
        this.map_.delete(JSON.stringify(key));
    }

    get(key: TypeKey): TypeValue
    {
        return this.map_.get(JSON.stringify(key));
    }

    has(key: TypeKey): boolean
    {
        return this.map_.has(JSON.stringify(key));
    }

    // TODO
    keys(): IterableIterator<TypeKey>
    {
        return new CMapIterable<TypeKey>(this.map_.keys());
    }

    values(): IterableIterator<TypeValue>
    {
        return this.map_.values();
    }
}

export class CMapIterable<TypeKey> implements IterableIterator<TypeKey>
{
    iterator_: IterableIterator<string>;

    constructor(iterator: IterableIterator<string>)
    {
        this.iterator_ = iterator;
    }

    next(): IteratorResult<TypeKey>
    {
        let next: IteratorResult<string> = this.iterator_.next();
        return { done: next.done, value: JSON.parse(next.value) };
    }

    // TODO
    [Symbol.iterator] = undefined;
}