"use server";

import "server-only"

import { NuisanceType, Report } from "@/lib/model";
import { Cursor } from "@/lib/utils/cursor";
import { getReportingService } from "@/actions/getReportingService";
import { getAbility } from "../authz/getAbility";

export const findNuisanceTypesBy = async function(filter: Partial<NuisanceType>, cursor?: Cursor): Promise<NuisanceType[]> {
    const reporting = await getReportingService();
    return await reporting.findNuisanceTypesBy(filter, cursor);
}

export const countNuisanceTypesBy = async function(filter: Partial<NuisanceType>): Promise<number> {
    const reporting = await getReportingService();
    return await reporting.countNuisanceTypesBy(filter);
}

/**
 * Delete a type of nuisance
 * @param nuisanceType 
 */
export async function deleteNuisanceType({id}: NuisanceType): Promise<void> {
    const ability = await getAbility();
    const reporting = await getReportingService();
   
    if(ability.can("delete", "nuisance-types")) {
        await reporting.removeNuisanceType(id);
    }
}

export const findReportsBy = async function(filter: Partial<Report>, cursor?: Cursor): Promise<Array<Report>> {
    const reporting = await getReportingService();
    return await reporting.findReportsBy(filter, cursor);
}

export const countReportsBy = async function(filter: Partial<Report>): Promise<number> {
    const reporting = await getReportingService();
    return await reporting.countReportsBy(filter);
}