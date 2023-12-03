"use server";

import { getMonitoringService } from "@/actions/getMonitoringService";
import { Nuisance } from "@/lib/model/nuisance";
import { GetNuisanceArgs } from "@/lib/services/monitoring";

export const findNuisances = async function(args: GetNuisanceArgs): Promise<Array<Nuisance>> {
    const reporting = await getMonitoringService();
    return await reporting.findNuisances(args);
}