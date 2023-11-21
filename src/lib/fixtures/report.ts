import { InsertReport, NewReport, Report } from "@/lib/model";
import { randomInt } from "crypto";
import { Shared } from '@/lib/shared';
import { NuisanceTypeFixtures } from '.';
import { faker } from '@faker-js/faker';
import { Point } from 'geojson';

export function randomPoint(): Point {
    const center: [number, number] = [48.8029439, 2.485429]
    const around = faker.location.nearbyGPSCoordinate({origin: center, radius: 1, isMetric: true})
    const coordinates = [around[1], around[0]]
    return {
        type: "Point",
        coordinates
    }
}

export namespace ReportFixtures {
    export namespace ForRepositories {
        export async function generateInsertReportData(args: Partial<InsertReport>, shared: Shared): Promise<InsertReport> {
            return {
                location:       randomPoint(),
                nuisanceTypeId: args?.nuisanceTypeId || await NuisanceTypeFixtures.ForRepositories.insert({}, shared),
                intensity:      randomInt(10),
            }
        }
        
        export async function insert(args: Partial<Report>, shared: Shared): Promise<string> {
            return await shared.repositories.reports.insert(await generateInsertReportData(args, shared))
        }
    }

    export namespace ForServices {
        export async function generateNewReportData(args: Partial<NewReport>, shared: Shared): Promise<NewReport> {
            return {
                userId:         args.userId,
                location:       randomPoint(),
                nuisanceTypeId: args?.nuisanceTypeId || (await NuisanceTypeFixtures.ForServices.add({}, shared)).id,
                intensity:      randomInt(10),
            }
        }  
        
        export async function add(args: Partial<NewReport>, shared: Shared): Promise<Report> {
            return await shared.services.reporting.addReport(await generateNewReportData(args, shared))
        }
    }
}
