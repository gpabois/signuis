import { Point, Polygon } from "geojson"
import { NuisanceType, User } from "."

export type ReportId = string;

export interface NewReport {
    location: Point,
    nuisanceTypeId: NuisanceType['id'],
    userId?: User['id'] | null,
    intensity: number
}

export type InsertReport = NewReport;

export interface PatchReport extends NewReport {
    id: string,
}

export type UpdateReport = PatchReport;

export type FilterReport = Partial<PatchReport> & {
    within?: Polygon,
    between?: {start: Date, end: Date}
};

export interface Report {
    id: string,
    createdAt: Date,
    location: Point,
    user?: {
        id: string,
        name: string
    },
    intensity: number,
    nuisanceType: NuisanceType
}