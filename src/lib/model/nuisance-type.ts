export const NuisanceTypeFamilies = [
    {value: "odeur", label: "Odeur"}, 
    {value: "visuel", label: "Visuel"}, 
    {value: "bruit", label: "Bruit"}, 
    {value: "déchets", label: "Déchets"}, 
    {value: "accident", label: "Accident"}
];

export interface CreateNuisanceType {
    label: string,
    description: string,
    family: string
}
export type InsertNuisanceType = CreateNuisanceType;
export interface NuisanceType {
    id: string,
    label: string,
    description: string,
    family: string
}

export type FilterNuisanceType = Partial<NuisanceType>;

export type PatchNuisanceType = Partial<NuisanceType> & Pick<NuisanceType, "id">
export type UpdateNuisanceType = PatchNuisanceType;