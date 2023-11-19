export type Holder<P extends string, R> = {
    [key in P]: R
};
