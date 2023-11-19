import { FileMigrationProvider, MigrationResultSet, Migrator, NO_MIGRATIONS } from "kysely";
import { DatabaseConnection } from "..";
import { promises as fs } from 'fs'
import * as path from 'path'

function getMigrator(db: DatabaseConnection): Migrator {
    return new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            // This needs to be an absolute path.
            migrationFolder: path.join(process.cwd(), 'migrations'),
        })
    });
}

/**
 * Execute migrations
 * @param db 
 */
export async function migrateToLatest(db: DatabaseConnection): Promise<MigrationResultSet> {
    const migrator = getMigrator(db);
    return migrator.migrateToLatest();
}

export async function fullyRollback(db: DatabaseConnection): Promise<MigrationResultSet> {
    const migrator = getMigrator(db);
    return migrator.migrateTo(NO_MIGRATIONS);
}