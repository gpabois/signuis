import { NuisanceTile, NuisanceTileIndex } from "@/lib/model/nuisance-tile";

export interface INuisanceTileRepository {
    /**
     * Increments the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    incrementNuisanceTile(tile: NuisanceTile): Promise<void>;

    /**
     * Decrements the weight and count of a nuisance tile
     * Creates the tile if it does not exist.
     * @param tile
     */
    decrementNuisanceTile(tile: NuisanceTile): Promise<void>;

    /**
     * Get a nuisance tile.
     * @param tileIndex
     */
    getNuisanceTile(tileIndex: NuisanceTileIndex): Promise<NuisanceTile|undefined>
}