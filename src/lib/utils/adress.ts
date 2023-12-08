import { FeatureCollection, Point } from "geojson";

export namespace Address {
    export async function getNearest(point: Point): Promise<string> {
        const url = `https://api-adresse.data.gouv.fr/reverse/?lat=${point.coordinates[1]}&lon=${point.coordinates[0]}`
        const resp = await fetch(url);
        const result = (await resp.json()) as FeatureCollection
        return result.features[0].properties?.label || ""
    }
}