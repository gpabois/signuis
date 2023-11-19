import { destroyDatabaseConnection, getDatabaseConnection } from "@/lib/database"
import { fullyRollback, migrateToLatest } from "@/lib/database/migrations";
import { sql } from "kysely";

export async function setupDatabase(): Promise<void> {
    const db = await getDatabaseConnection();
    await sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.execute(db);
    const result = await migrateToLatest(db);

    if(result.error) throw result.error;
    
}

export async function teardownDatabase(): Promise<void> {
    try {
        const db = await getDatabaseConnection();
        const result = await fullyRollback(db);
        if(result.error) throw result.error;
    } finally {
        await destroyDatabaseConnection();
    }
}

