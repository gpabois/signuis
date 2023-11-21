import { DatabaseConnection } from "@/lib/database";
import { INuisanceTypeRepository } from ".";
import { FilterNuisanceType, InsertNuisanceType, NuisanceType } from "@/lib/model";
import { Cursor } from "@/lib/utils/cursor";
import { Optional } from "@/lib/option";


export const PG_NUISANCE_TYPE_TABLE_NAME = "NuisanceType";
/**
 * Postgres-implemented repository for reports.
 */
export class PgNuisanceTypeRepository implements INuisanceTypeRepository {
    con: DatabaseConnection;

    constructor(con: DatabaseConnection) {
        this.con = con;
    }

    async insert(insert: InsertNuisanceType): Promise<NuisanceType["id"]> {
        const res = await this.con.insertInto("NuisanceType")
        .values(insert)
        .returning('id')
        .executeTakeFirstOrThrow();

        return res.id;
    }
    
    async update(update: Partial<NuisanceType> & Pick<NuisanceType, "id"> & { id: string; }): Promise<void> {
        const {id: id, ...values} = update;
        await this.con.updateTable("NuisanceType").set(values).where('id', '=', id).execute()
    }

    async deleteBy(filter: FilterNuisanceType): Promise<void> {
        await this.con.deleteFrom("NuisanceType")
        .where(eb => eb.and(filter))
        .execute();
    }
    
    async findOneBy(filter: FilterNuisanceType): Promise<Optional<NuisanceType>> {
        const [item] = await this.findBy(filter, {page: 0, size: 1});
        if(item === undefined) return null;
        return item;
    }

    async findBy(filter: FilterNuisanceType, cursor: Cursor): Promise<Array<NuisanceType>> {
        let query = this.con.selectFrom("NuisanceType")
        .selectAll()
        .where(eb => eb.and(filter))
        
        if(cursor.size >= 0) {
            query = query.limit(cursor.size).offset(cursor.size * cursor.page)
        }
        
        return await query.execute();
    }

    async countBy(filter: Partial<NuisanceType>): Promise<number> {
        const res = await this.con.selectFrom("NuisanceType")
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(eb => eb.and(filter))
        .executeTakeFirstOrThrow();
        
        return res.count;
    }
};
