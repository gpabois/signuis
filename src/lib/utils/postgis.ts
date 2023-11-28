import { Geometry } from 'geojson'
import { Kysely, RawBuilder, SelectExpression, sql } from 'kysely'


export function ST_Within<A, B>(A: A, B: B): RawBuilder<boolean> {
    return sql<boolean>`ST_GeomFromGeoJSON(${A}, ${B})`;
}

export function ST_GeomFromGeoJSON<T extends Geometry>(value: T): RawBuilder<T> {
  return sql`ST_GeomFromGeoJSON(${JSON.stringify(value)})`
}

export function ST_AsGeoJSON<DB, TB extends keyof DB>(value: SelectExpression<DB, TB>): RawBuilder<SelectExpression<DB, TB>> {
    return sql`ST_AsGeoJSON(${value})`
}