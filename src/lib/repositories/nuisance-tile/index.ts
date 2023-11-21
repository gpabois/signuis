import { DeltaNuisanceTile, FilterNuisanceTile, NuisanceTile, NuisanceTileIndex } from "@/lib/model/nuisance-tile";
import { Cursor } from "@/lib/utils/cursor";

export interface INuisanceTileRepository {
    /**
     * Increments the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    incrementNuisanceTile(tile: DeltaNuisanceTile): Promise<void>;

    /**
     * Decrements the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    decrementNuisanceTile(tile: DeltaNuisanceTile): Promise<void>;

    /**
     * Find nuisance tiles by
     * @param tileIndex
     */
    findBy(filter: FilterNuisanceTile, cursor: Cursor): Promise<Array<NuisanceTile>>

    countBy(filter: FilterNuisanceTile): Promise<number>
}