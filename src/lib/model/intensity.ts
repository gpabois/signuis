import { Tuple } from "../utils/tuple";
import { Gaussian } from 'ts-gaussian';

const distribution = new Gaussian(0, 1);

export type IntensityWeights = Tuple<number, 5>;
export namespace Intensity {
    /**
     * See https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
     * @param weights 
     * @return 0 - 100% corresponding to a strong nuisance.
     */
    export function wilsonScoreLowerBound(weights: IntensityWeights, confidence: number = 0.95) {
        // Intensity of 3, 4, 5 are considered as strong nuisances
        const p = weights[2] + weights[3] + weights[4];
        const n = weights.reduce((a,b) => a + b, 0);
        
        if(n == 0) return 0;

        const z = distribution.ppf(1 - (1 - confidence) / 2);
        const phat = 1.0 * p / n;

        return (phat + Math.pow(z, 2) / (2*n) - z * Math.sqrt((phat * (1 - phat) + Math.pow(z, 2) / (4 * n)) / n)) / (1 + Math.pow(z, 2) / n)
    }

    export function createWeights(): IntensityWeights {
        return new Array(5).map((_) => 0) as IntensityWeights
    }

    export function intoWeights(intensity: number): IntensityWeights {
        let weights = createWeights();
        weights[intensity] = 1;
        return weights;

    }
}