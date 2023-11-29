"use server";

import { FilterNuisanceTile, Intensity } from "@/lib/model";
import { Cursor } from "@/lib/utils/cursor";
import { getMonitoringService } from "@/actions/getMonitoringService";

export const findNuisanceTilesBy = async function(filter: FilterNuisanceTile, cursor?: Cursor): Promise<Array<NuisanceTile>> {
    const reporting = await getMonitoringService();
    return await reporting.findNuisanceTilesBy(filter, cursor);
}

export const countNuisanceTilesBy = async function(filter: FilterNuisanceTile): Promise<number> {
    const reporting = await getMonitoringService();
    return await reporting.countNuisanceTilesBy(filter);
}