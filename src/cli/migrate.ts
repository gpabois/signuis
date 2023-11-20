import { destroyDatabaseConnection, getDatabaseConnection } from "@/lib/database";
import { migrateToLatest } from "@/lib/database/migrations";

async function executeCmd() {
    console.log("Migrating database...")
    const db = getDatabaseConnection();
    const result = await migrateToLatest(db);
    
    if(result.error) {
        console.error(result.error)
    }
   
   console.log("Migration successful")
   await destroyDatabaseConnection();
}

executeCmd();