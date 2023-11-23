import { Expression, Kysely, RawBuilder, sql } from 'kysely'


export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("NuisanceTile")
        .addColumn("x", "integer")
        .addColumn("y", "integer")
        .addColumn("z", "integer")
        .addColumn("t", "timestamptz")
        .addColumn("nuisanceTypeId", "uuid")
        .addColumn("count", "integer")
        .addColumn("w1", "integer")
        .addColumn("w2", "integer")
        .addColumn("w3", "integer")
        .addColumn("w4", "integer")
        .addColumn("w5", "integer")
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