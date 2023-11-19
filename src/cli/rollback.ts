import { destroyDatabaseConnection, getDatabaseConnection } from "@/lib/database";
import { fullyRollback } from "@/lib/database/migrations";

async function executeCmd() {
    const db = getDatabaseConnection();
    const result = await fullyRollback(db);
    
    if(result.error) {
        console.error(result.error)
    }
   
   console.log("Migration successful")
   await destroyDatabaseConnection();
}

executeCmd();