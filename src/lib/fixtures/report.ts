import { InsertReport, CreateReport, Report } from "@/lib/model";
import { randomInt } from "crypto";
import { Shared } from '@/lib/shared';
import { NuisanceTypeFixtures } from '.';
import { faker } from '@faker-js/faker';
import { Point } from 'geojson';
import { INuisanceTypeRepository, IReportRepository } from "../repositories";
import { IReportingService } from "../services/reporting";

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
        export async function generateInsertReportData(args: Partial<InsertReport>, shared: {repositories: {nuisanceTypes: INuisanceTypeRepository}}): Promise<InsertReport> {
            return {
                location:       randomPoint(),
                nuisanceTypeId: args?.nuisanceTypeId || (await NuisanceTypeFixtures.ForRepositories.insert({}, shared)).id,
                intensity:      randomInt(1, 5),
            }
        }

        export function generateFindByReportData(args: Partial<Report>): Report {
            return {
                id:           args.id || faker.string.uuid(),
                location:     args.location || randomPoint(),
                intensity:    args.intensity || randomInt(1, 5),
                nuisanceType: args.nuisanceType!,
                createdAt:    args.createdAt || faker.date.anytime()
            }
        }
        
        export async function insert(args: Partial<Report>, shared: {repositories: {nuisanceTypes: INuisanceTypeRepository, reports: IReportRepository}}): Promise<{id: string} & InsertReport> {
            const insertData = await generateInsertReportData(args, shared)
            const id = await shared.repositories.reports.insert(insertData)
            return {id, ...insertData}
        }
    }

    export namespace ForServices {
        export async function generateCreateReportData(args: Partial<CreateReport>, shared?: {services: {reporting: IReportingService}}): Promise<CreateReport> {
            return {
                userId:         args.userId,
                location:       randomPoint(),
                nuisanceTypeId: args?.nuisanceTypeId || (await NuisanceTypeFixtures.ForServices.create({}, shared!)).id,
                intensity:      randomInt(1, 5),
            }
        }  

        export function generateReportData(args: Partial<Report>): Report {
            return {
                id:             args?.id || faker.string.uuid(),
                location:       args?.location || randomPoint(),
                nuisanceType:   args?.nuisanceType || NuisanceTypeFixtures.ForServices.generateNuisanceTypeData(),
                intensity:      args?.intensity || randomInt(1, 5),
                createdAt:      args?.createdAt || faker.date.anytime()
            }
        }  
        
        export async function create(args: Partial<CreateReport>, shared: {services: {reporting: IReportingService}}): Promise<Report> {
            return await shared.services.reporting.createReport(await generateCreateReportData(args, shared))
        }
    }
}
