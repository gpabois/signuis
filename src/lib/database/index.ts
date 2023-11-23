import { Kysely, KyselyPlugin, PluginTransformQueryArgs, PluginTransformResultArgs, PostgresDialect, QueryResult, RootOperationNode, UnknownRow } from "kysely"
import { CFG } from "../config"
import { Account as AccountTable } from "./account"
import { NuisanceTypeTable } from "./nuisance_type"
import { NuisanceTile as NuisanceTileTable } from "./nuisance-tile"
import { Report as ReportTable } from "./report"
import { Session as SessionTable } from "./session"
import { User as UserTable } from "./user"
import { VerificationTokenTable } from "./verification_token"
import { Pool } from "pg"

export interface Database {
    ///////////////
    // Auth      //
    ///////////////
    User: UserTable,
    Account: AccountTable,
    Session: SessionTable,
    VerificationToken: VerificationTokenTable

    ///////////////
    // Nuisance ///
    ///////////////
    NuisanceType: NuisanceTypeTable,

    ///////////////
    // Reporting //
    ///////////////
    Report: ReportTable

    ////////////////
    // Monitoring //
    ////////////////
    NuisanceTile: NuisanceTileTable
}

export type DatabaseConnection = Kysely<Database>;

let db: DatabaseConnection | null = null;

/**
 * Create a database connection
 * @param cfg 
 * @returns 
 */
export function createDatabaseConnection(): DatabaseConnection {
    const dialect = new PostgresDialect({
        pool: new Pool({
            database: CFG.database.name,
            user: CFG.database.username,
            password: CFG.database.password,
            max: 10,
        })
    });

    return new Kysely<Database>({dialect});
}


export function getDatabaseConnection(): DatabaseConnection {
    if(db === null) db = createDatabaseConnection();
    return db;
}

export async function destroyDatabaseConnection() {
    await db?.destroy();
    db = null;
}