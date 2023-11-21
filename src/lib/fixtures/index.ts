export * from './nuisance-type';
export * from './report';
export * from './nuisance-tile'
export * from './user'

export function getRandomElement<T>(arr: Array<T>): T | undefined {
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined
}
  