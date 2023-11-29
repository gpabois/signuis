import { AggregatedNuisanceTile, DeltaNuisanceTile, FilterNuisanceTile, Intensity, NuisanceTileIndex } from "@/lib/model/nuisance-tile";
import { Optional } from "@/lib/option";
import { Cursor } from "@/lib/utils/cursor";

export interface INuisanceTileRepository {
    /**
     * Increments the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    increment(tile: DeltaNuisanceTile): Promise<void>;

    /**
     * Decrements the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    decrement(tile: DeltaNuisanceTile): Promise<void>;

    /**
     * Aggregates nuisance tiles
     * @param filter 
     * @param aggregateBy 
     */
    sumBy(filter: FilterNuisanceTile, aggregateBy: Array<"Time"|"NuisanceType">): Promise<Array<AggregatedNuisanceTile>>

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