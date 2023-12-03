import { IntensityWeights } from "."

export interface Nuisance {
    period?: {from: Date, to: Date}
    count: number,
    weights: IntensityWeights
}