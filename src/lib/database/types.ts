import { Point } from "geojson";
import { RawBuilder, sql } from "kysely";

export function PointColumn(): RawBuilder<void> {
    return sql<void>`geometry`
}

export function ST_MakePoint(point: Point) : RawBuilder<Point> {   
    return sql<Point>`ST_MakePoint(${point.coordinates[1]}, ${point.coordinates[0]})`
}