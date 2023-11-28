import { Point, Polygon, Position } from "geojson";
import { zip } from "./iterable";

export namespace geojson {
    export namespace Point {
        export function create(...coordinates: [number, number]): Point {
            return {
                type: "Point",
                coordinates
            }
        }

        export function fromLatLon({lat, lon}: {lat: number, lon: number}): Point {
            return create(lon, lat)
        }

        export function add(...points: Array<Point>): Point {
            return {
                type: "Point",
                coordinates: Array.from(
                    zip(
                        ...points.map(
                            ({coordinates}) => coordinates)
                        )
                    ).map((c) => c.reduceRight((a,b) => a+b, 0))
            }
        }
    }

    export namespace Polygon {
        export function create(...points: Array<Point>): Polygon {
            return {
                type: "Polygon",
                coordinates: [points.map(({coordinates}) => coordinates)]
            }
        }

        export namespace Rectangle {
            export function fromDiagonalPoints({nw: {coordinates: [x0, y0]}, se: {coordinates: [x1, y1]}}: {nw: Point, se: Point}): Polygon {
                return {
                    type: "Polygon",
                    coordinates: [
                        [
                            [x0, y0],
                            [x1, y0],
                            [x1, y1],
                            [x0, y1],
                            [x0, y0],
                        ]
                    ]
                }
            }
        }
    }
}