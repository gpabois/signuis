import { IntensityWeights, NuisanceType } from "."

export interface Nuisance {
    period?: {from: Date, to: Date}
    nuisanceType?: NuisanceType,
    count: number,
    weights: IntensityWeights
}