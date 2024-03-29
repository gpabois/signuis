import { Kysely, sql } from 'kysely'
import { PointColumn } from '../src/lib/database/types'

export async function up(db: Kysely<any>): Promise<void> {
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`.execute(db);

    await db.schema
        .createTable("NuisanceType")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("family", "varchar(50)")
        .addColumn("label", "varchar(50)")
        .addColumn("description", "text")
        .execute()

    await db.schema
        .createTable("Report")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("location", PointColumn())
        .addColumn("intensity", "int8")
        .addColumn("nuisanceTypeId", "uuid", col => col.notNull())
        .addColumn("userId", "uuid")
        .addColumn("createdAt", 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
        .addForeignKeyConstraint(
            "report_nuisance_type_fk", 
            ["nuisanceTypeId"], 
            "NuisanceType", 
            ["id"],
            (cons) => cons.onDelete("cascade")
        )
        .addForeignKeyConstraint(
            "report_user_fk",
            ["userId"],
            "User",
            ["id"],
            cons => cons.onDelete("set null")
        )
        .execute()
    
    await db.schema.createIndex("report_location_idx")
        .on("Report")
        .using("gist(location)")
        .execute()
    
}

export async function down(db: Kysely<any>): Promise<void>{
    await db.schema.dropTable("Report").ifExists().execute()
    await db.schema.dropTable("NuisanceType").ifExists().execute()
}