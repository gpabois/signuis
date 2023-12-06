import { IntensityWeights } from "@/lib/model";
import { NuisanceTileSum, FilterNuisanceTile, NuisanceTile } from "@/lib/model/nuisance-tile";
import { Optional } from "@/lib/option";
import { Cursor } from "@/lib/utils/cursor";

export interface INuisanceTileRepository {
    /**
     * Increments the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    increment(weights: IntensityWeights, coordinates: Array<{x: number, y: number, z: number, t: Date, nuisanceTypeId: string}>): Promise<void>;

    /**
     * Decrements the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    decrement(weights: IntensityWeights, filter: FilterNuisanceTile): Promise<void>;

    /**
     * Aggregates nuisance tiles
     * @param filter 
     * @param aggregateBy 
     */
    sumBy(filter: FilterNuisanceTile, aggregateBy: Array<"Time"|"NuisanceType">): Promise<Array<NuisanceTileSum>>

    /**
     * Find nuisance tiles
     * @param tileIndex
     */
    findOneBy(filter: FilterNuisanceTile): Promise<Optional<NuisanceTile>>

    /**
     * Find nuisance tiles
     * @param tileIndex
     */
    findBy(filter: FilterNuisanceTile, cursor: Cursor): Promise<Array<NuisanceTile>>

    /**
     * Count nuisance tiles
     * @param filter 
     */
    countBy(filter: FilterNuisanceTile): Promise<number>
}