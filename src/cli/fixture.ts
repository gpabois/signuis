import { destroyDatabaseConnection } from "@/lib/database";
import { NuisanceTypeFixtures, ReportFixtures, UserFixtures, getRandomElement } from "@/lib/fixtures";
import { NuisanceType } from "@/lib/model";
import { createShared } from "@/lib/shared";

async function execute() {
    console.log("Generating fixtures...")
    const shared = await createShared();
    
    // Generate random nuisance types
    let nuisanceTypes: Array<NuisanceType> = [];

    for(let i = 0; i < 20; i++) {
        nuisanceTypes.push(await NuisanceTypeFixtures.ForServices.add({}, shared));
    }

    const admin = await UserFixtures.ForServices.register({name: "admin", password: "admin"}, shared);
    await shared.services.account.patchUser({role: "admin", id: admin.id});
    
    const user = await UserFixtures.ForServices.register({name: "user", password: "user"}, shared);

    let users = [admin, user];

    for(let i = 0; i < 100; i++) {
        users.push(await UserFixtures.ForServices.register({}, shared));
    }

    for(let i = 0; i < 10000; i++) {
        await ReportFixtures.ForServices.add({
            userId: getRandomElement(users)!.id, 
            nuisanceTypeId: getRandomElement(nuisanceTypes)!.id
        }, shared)
    }


   await destroyDatabaseConnection();
}

execute();