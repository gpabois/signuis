export type DateBounds = {
    from: Date,
    to: Date
}

export type TickContext = {
    count: number,
    origin: number,
    size: number,
    scale: number,
    offset: number,
    resolution: number,
    full: number,
    from: {value: Date, index: number},
    to: {value: Date, index: number},
    get: (index: number) => Date,
    nearest: (value: Date) => number,
    position: (index: number) => number,
    useGet: (index: number) => Date,
    usePosition: (index: number) => number,
    useNearest: (value: Date) => number
}
