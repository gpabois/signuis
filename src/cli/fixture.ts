import { destroyDatabaseConnection, getDatabaseConnection } from "@/lib/database";
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg";
import { PgReportRepository } from "@/lib/repositories/report/pg";
import { PgUserRepository } from "@/lib/repositories/user/pg";
import { AccountService } from "@/lib/services/account";
import { ReportingService } from "@/lib/services/reporting";
import { createSignals } from "@/lib/signals";

async function execute() {
    console.log("Generating fixture...")
    const db = getDatabaseConnection();
    const signals = createSignals();
    const reports = new PgReportRepository(db);
    const nuisanceTypes = new PgNuisanceTypeRepository(db);
    const users = new PgUserRepository(db);

    const reporting = new ReportingService({reports, nuisanceTypes, signals});
    const account = new AccountService({users, signals});
    
   const nuisanceType = await reporting.addNuisanceType({
        label: "Bitume",
        family: "odeur",
        description: "Odeur de bitume"
    })

    const report = await reporting.addReport({
        nuisanceTypeId: nuisanceType.id,
        intensity: 5,
        location: {
            type: "Point",
            coordinates: [2.4546600018719182, 48.79016425031012]
        }
    })

    const admin = await account.registerUser({
        name: "admin",
        email: "admin@local.lan",
        password: "admin"
    })
    await account.patchUser({role: "admin", id: admin.id});
    
    const user = await account.registerUser({
        name: "user",
        email: "user@local.lan",
        password: "user"
    })

   await destroyDatabaseConnection();
}

execute();