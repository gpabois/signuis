import { InsertNuisanceType, NewNuisanceType, NuisanceType, NuisanceTypeFamilies } from "@/lib/model";
import { Shared } from "@/lib/shared";
import { faker } from "@faker-js/faker";
import { getRandomElement } from ".";

export namespace NuisanceTypeFixtures {
    export namespace ForRepositories {
        export function generateInsertData(args?: Partial<InsertNuisanceType>): InsertNuisanceType {
            return {
                label: args?.label || faker.lorem.word(40),
                family: args?.family || getRandomElement(NuisanceTypeFamilies)!.value,
                description: args?.description || faker.lorem.paragraph(3)
            }
        }
        // 
        export async function insert(args: Partial<InsertNuisanceType>, shared: Shared): Promise<string> {
            const insertNuisanceType = await generateInsertData(args);
            return await shared?.repositories.nuisanceTypes.insert(insertNuisanceType);
        }
    }

    export namespace ForServices {
        export function generateNewData(args?: Partial<NewNuisanceType>): NewNuisanceType {
            return {
                label: args?.label || faker.lorem.word(40),
                family: args?.family || getRandomElement(NuisanceTypeFamilies)!.value,
                description: args?.description || faker.lorem.paragraph(3)
            }
        }    
        
        /**
         * Add a nuisance type through the reporting service
         * @param args 
         * @param shared 
         */
        export function add(args: Partial<NewNuisanceType>, shared: Shared): Promise<NuisanceType> {
            const data = generateNewData(args);
            return shared.services.reporting.addNuisanceType(data)
        }
    }
}

