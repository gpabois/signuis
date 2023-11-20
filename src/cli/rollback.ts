import { destroyDatabaseConnection, getDatabaseConnection } from "@/lib/database";
import { fullyRollback } from "@/lib/database/migrations";

async function executeCmd() {
    console.log("Rollback database...")
    const db = getDatabaseConnection();
    const result = await fullyRollback(db);
    
    if(result.error) {
        console.error(result.error)
    }
   
   console.log("Rollback successful")
   await destroyDatabaseConnection();
}

executeCmd();