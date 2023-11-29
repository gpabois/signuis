import { Point, Polygon } from "geojson"
import { IntensityWeights, NuisanceType, User } from "."

export type ReportId = string;

export interface CreateReport {
    location: Point,
    nuisanceTypeId: NuisanceType['id'],
    userId?: User['id'] | null,
    createdAt?: Date,
    intensity: number
}

export type InsertReport = CreateReport;

export interface PatchReport extends CreateReport {
    id: string,
}

export type UpdateReport = PatchReport;

export type FilterReport = Partial<PatchReport> & {
    nuisanceTypeId__in?: Array<string>,
    within?: Polygon,
    between?: {from: Date, to: Date}
};

export interface ReportSum {
    weights: IntensityWeights
    count: number,
    nuisanceType: NuisanceType
}

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