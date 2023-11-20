import { Database, DatabaseConnection } from "@/lib/database";
import { FilterReport, InsertReport, PatchReport, Report } from "@/lib/model";
import { SelectExpression, sql } from "kysely";
import { IReportRepository } from "..";
import { Cursor } from "@/lib/utils/cursor";
import { PG_NUISANCE_TYPE_TABLE_NAME } from "../nuisance-type/pg";
import { Optional } from "@/lib/option";

export const PG_REPORT_TABLE_NAME = "Report";

const FetchReportColumns: SelectExpression<Database, "Report" | "NuisanceType">[] = [
    "Report.id as report__id", 
    "Report.userId as report__userId", 
    "Report.intensity as report__intensity", 
    "Report.createdAt as report__createdAt",
    sql<string>`ST_AsGeoJSON(location)`.as('report__str_location'),
    "NuisanceType.id as nuisanceType__id",
    "NuisanceType.label as nuisanceType__label",
    "NuisanceType.family as nuisanceType__family",
    "NuisanceType.description as nuisanceType__description"
]

type FetchReportRow = { 
    id: string; 
    userId: string | null; 
    intensity: number; 
    createdAt: Date; 
    str_location: string; 
    user__id: string | null,
    user__name: string | null,
    nuisanceType__id: string;
    nuisanceType__label: string;
    nuisanceType__family: string;
    nuisanceType__description: string;
};


function mapRow(row: FetchReportRow): Report {
    return {
        id: row.id,
        createdAt: row.createdAt,
        intensity: row.intensity,
        location: JSON.parse(row.str_location),
        user: (row.user__id && row.user__name && {
            id: row.user__id,
            name: row.user__name
        }) || undefined, 
        nuisanceType: {
            id: row.nuisanceType__id,
            label: row.nuisanceType__label,
            family: row.nuisanceType__family,
            description: row.nuisanceType__description
        }
    }
}
/**
 * Postgres-implemented repository for reports.
 */
export class PgReportRepository implements IReportRepository {
    con: DatabaseConnection;

    constructor(con: DatabaseConnection) {
        this.con = con;
    }


    async insert(report: InsertReport): Promise<string> {
        const result = await this.con
            .insertInto(PG_REPORT_TABLE_NAME)
            .values({
                nuisanceTypeId: report.nuisanceTypeId,
                userId:         report.userId,
                location:       sql`ST_GeomFromGeoJSON(${JSON.stringify(report.location)})`,
                intensity:      report.intensity,
            })
            .returning("id")
            .executeTakeFirstOrThrow();

        return result.id;
    }

    async update(update: PatchReport & { id: string; }): Promise<void> {
        const {id: id, ...values} = update;
        await this.con.updateTable(PG_REPORT_TABLE_NAME).set(update).where('id', '=', id)
    }
    
    async deleteBy(filter: FilterReport): Promise<void> {
        await this.con
            .deleteFrom(PG_REPORT_TABLE_NAME)
            .where(eb => eb.and(filter))
            .execute();
    }

    async findBy(filter: FilterReport, cursor: Cursor) {
        const map = {
            id: "Report.id",
            userId: "Report.userId",
            intensity: "Report.intensity",
            createdAt: "Report.createdAt"
        }

        //@ts-ignore
        filter = Object.fromEntries(Object.keys(filter).map(k => [map[k], filter[k]]))
        
        let query = this.con
            .selectFrom(PG_REPORT_TABLE_NAME)
            .innerJoin(PG_NUISANCE_TYPE_TABLE_NAME, "NuisanceType.id", "Report.nuisanceTypeId")
            .innerJoin("User", "User.id", "Report.userId")
            .select([
                "Report.id as id", 
                "Report.userId as userId", 
                "Report.intensity as intensity", 
                "Report.createdAt as createdAt",
                sql<string>`ST_AsGeoJSON(location)`.as('str_location'),
                "User.id as user__id",
                "User.name as user__name",
                "NuisanceType.id as nuisanceType__id",
                "NuisanceType.label as nuisanceType__label",
                "NuisanceType.family as nuisanceType__family",
                "NuisanceType.description as nuisanceType__description"
            ])
            .where(eb => eb.and(filter)) 
            .orderBy("Report.createdAt desc")
        
        if(cursor.size > 0) {
            query = query.limit(cursor.size).offset(cursor.size * cursor.page)
        }

        const items = await query.execute();
        return items.map(mapRow)
    }

    async findOneBy(filter: FilterReport): Promise<Optional<Report>> {
        const [item] = await this.findBy(filter, {page: 0, size:1});
        if(item === undefined) return null;
        return item
    }

    async countBy(filter: FilterReport): Promise<number> {
        const res = await this.con.selectFrom(PG_REPORT_TABLE_NAME)
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(eb => eb.and(filter))
        .executeTakeFirstOrThrow();
        
        return res.count;
    }
};
