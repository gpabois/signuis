import { Point } from "geojson";
import { Generated } from "kysely";
import { User } from "../model";
import { NuisanceType } from "../model/nuisance-type";



export interface Report {
    id:             Generated<string>,
    location:       Point,
    nuisanceTypeId: NuisanceType['id'],
    userId:         User['id'] | null,
    intensity:      number,
    createdAt:      Generated<Date>
}