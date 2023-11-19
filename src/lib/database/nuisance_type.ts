import { Generated } from "kysely";

export interface NuisanceTypeTable {
    id: Generated<string>,
    label: string,
    description: string,
    family: string
}