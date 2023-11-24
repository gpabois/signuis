import { InsertNuisanceType, CreateNuisanceType, NuisanceType, NuisanceTypeFamilies } from "@/lib/model";
import { Shared } from "@/lib/shared";
import { faker } from "@faker-js/faker";
import { getRandomElement } from ".";
import { INuisanceTypeRepository } from "../repositories";
import { IReportingService } from "../services/reporting";

export namespace NuisanceTypeFixtures {
    export namespace ForRepositories {
        export function generateInsertData(args?: Partial<InsertNuisanceType>): InsertNuisanceType {
            return {
                label: args?.label || faker.lorem.word(40),
                family: args?.family || getRandomElement(NuisanceTypeFamilies)!.value,
                description: args?.description || faker.lorem.paragraph(3)
            }
        }
        
        /**
         * Execute insertion into the nuisance type repository
         * @param args 
         * @param shared 
         * @returns 
         */
        export async function insert(args: Partial<InsertNuisanceType>, shared: {repositories: {nuisanceTypes: INuisanceTypeRepository}}): Promise<{id: string} & InsertNuisanceType> {
            const insertNuisanceType = await generateInsertData(args);
            const id = await shared?.repositories.nuisanceTypes.insert(insertNuisanceType);
            return {id, ...insertNuisanceType}
        }
    }

    export namespace ForServices 
    {
        export function generateNuisanceTypeData(args?: Partial<NuisanceType>): NuisanceType {
            return {
                id: args?.id || faker.string.uuid(),
                label: args?.label || faker.lorem.word(40),
                family: args?.family || getRandomElement(NuisanceTypeFamilies)!.value,
                description: args?.description || faker.lorem.paragraph(3)
            }
        }    
        
        export function generateCreateNuisanceTypeData(args?: Partial<CreateNuisanceType>): CreateNuisanceType {
            return {
                label: args?.label || faker.lorem.word(40),
                family: args?.family || getRandomElement(NuisanceTypeFamilies)!.value,
                description: args?.description || faker.lorem.paragraph(3)
            }
        }    
        
        /**
         * Create a nuisance type through the reporting service
         * @param args 
         * @param shared 
         */
        export function create(args: Partial<CreateNuisanceType>, shared: {services: {reporting: IReportingService}}): Promise<NuisanceType> {
            const data = generateCreateNuisanceTypeData(args);
            return shared.services.reporting.createNuisanceType(data)
        }
    }
}

