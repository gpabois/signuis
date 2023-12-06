import { destroyDatabaseConnection } from "@/lib/database";
import { NuisanceTypeFixtures, ReportFixtures, UserFixtures, getRandomElement } from "@/lib/fixtures";
import { NuisanceType } from "@/lib/model";
import { createShared } from "@/lib/shared";
import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";

async function execute() {
    console.log("Generating fixtures...")
    const shared = await createShared();
    
    // Generate random nuisance types
    let nuisanceTypes: Array<NuisanceType> = [];

    for(let i = 0; i < 20; i++) {
        nuisanceTypes.push(await NuisanceTypeFixtures.ForServices.create({}, shared));
    }

    const admin = await UserFixtures.ForServices.register({name: "admin", password: "admin"}, shared);
    await shared.services.account.patchUser({role: "admin", id: admin.id});
    
    const user = await UserFixtures.ForServices.register({name: "user", password: "user"}, shared);

    let users = [admin, user];

    for(let i = 0; i < 100; i++) {
        users.push(await UserFixtures.ForServices.register({}, shared));
    }

    let creates = [];
    for(let i = 0; i < 200_000; i++) {
        if(i % 1000 == 0) console.log(i)
        
        creates.push(await ReportFixtures.ForServices.generateCreateReportData({
            userId: getRandomElement(users)!.id, 
            nuisanceTypeId: getRandomElement(nuisanceTypes)!.id,
            intensity: randomInt(1, 5),
            createdAt: faker.date.recent({days: 360})
        }, shared))

        if(creates.length % 1000 === 0) {
            await shared.services.reporting.createReports(...creates);
            creates = [];
        }
    }

   await shared.services.reporting.createReports(...creates);
   await destroyDatabaseConnection();
}

execute();