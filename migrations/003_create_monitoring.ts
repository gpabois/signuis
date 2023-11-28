import { Expression, Kysely, RawBuilder, sql } from 'kysely'


export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("NuisanceTile")
        .addColumn("x", "integer", col => col.notNull())
        .addColumn("y", "integer", col => col.notNull())
        .addColumn("z", "integer", col => col.notNull())
        .addColumn("t", "timestamptz", col => col.notNull())
        .addColumn("nuisanceTypeId", "uuid", col => col.notNull())
        .addColumn("count", "integer", col => col.defaultTo(0))
        .addColumn("w1", "integer", col => col.defaultTo(0))
        .addColumn("w2", "integer", col => col.defaultTo(0))
        .addColumn("w3", "integer", col => col.defaultTo(0))
        .addColumn("w4", "integer", col => col.defaultTo(0))
        .addColumn("w5", "integer", col => col.defaultTo(0))
        .addForeignKeyConstraint(
            "nuisance_tile_nuisance_type_fk", 
            ["nuisanceTypeId"], 
            "NuisanceType", 
            ["id"],
            (cons) => cons.onDelete("cascade")
        )
        .addUniqueConstraint("nuisance_tile_unique_index", ["x", "y", "z", "t", "nuisanceTypeId"])
        .execute();
    
    await db.schema
            .createIndex("nuisance_tile_coordinates")
            .on("NuisanceTile")
            .columns(["x", "y", "z", "t", "nuisanceTypeId"])
            .execute()
}

export async function down(db: Kysely<any>): Promise<void>{
    await db.schema.dropTable("NuisanceTile").ifExists().execute()
}