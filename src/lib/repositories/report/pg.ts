import { Database, DatabaseConnection } from "@/lib/database";
import { FilterReport, InsertReport, PatchReport, Report } from "@/lib/model";
import { ExpressionOrFactory, sql } from "kysely";
import { IReportRepository } from "..";
import { Cursor } from "@/lib/utils/cursor";
import { Optional } from "@/lib/option";

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
            .insertInto("Report")
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
        await this.con.updateTable("Report").set(update).where('id', '=', id)
    }
    
    async deleteBy(filter: FilterReport): Promise<void> {
        await this.con
            .deleteFrom("Report")
            .where(eb => eb.and(filter))
            .execute();
    }

    private filter(filter: FilterReport): ExpressionOrFactory<Database, "Report", false> {
        const map = {
            id:         "Report.id",
            userId:     "Report.userId",
            intensity:  "Report.intensity",
            createdAt:  "Report.createdAt"
        }

        return eb => {
            //@ts-ignore
            filter = Object.fromEntries(Object.keys(filter).map(k => [map[k], filter[k]]))
        
            let w: any = eb.and(filter)
                            
            if(filter.within)
                w = w.and(sql`ST_Within(Report.location, ST_GeomFromGeoJSON(${JSON.stringify(filter.within)}))`)
            
            if(filter.between) {
                w = w.and(
                    eb('Report.createdAt', '>=', filter.between.start),
                    eb('Report.createdAt', '<=', filter.between.end)
                )
            }

            if(filter.nuisanceTypeId__in) {
                w = w.and('Report.nuisanceTypeId', 'in', filter.nuisanceTypeId__in)
            }

            return w
        }
    }

    async aggregateBy(filter: FilterReport) {
        let query = this.con
            .selectFrom("Report")
            .select([
                // Generate weighted ranks
                sql<number>`SUM(CASE WHEN Report.intensity = 1 THEN 1 END)`.as('w1'),
                sql<number>`SUM(CASE WHEN Report.intensity = 2 THEN 1 END)`.as('w2'),
                sql<number>`SUM(CASE WHEN Report.intensity = 3 THEN 1 END)`.as('w3'),
                sql<number>`SUM(CASE WHEN Report.intensity = 4 THEN 1 END)`.as('w4'),
                sql<number>`SUM(CASE WHEN Report.intensity = 5 THEN 1 END)`.as('w5'),
                //
                sql<number>`count(*)`.as('count')
            ])
            .where(this.filter(filter))
            .groupBy('Report.nuisanceTypeId')

        return query.execute()

    }

    async findBy(filter: FilterReport, cursor: Cursor) {
        let query = this.con
            .selectFrom("Report")
            .innerJoin("NuisanceType", "NuisanceType.id", "Report.nuisanceTypeId")
            .leftJoin("User", "User.id", "Report.userId")
            .select([
                "Report.id as id", 
                "Report.userId as userId", 
                "Report.intensity as intensity", 
                "Report.createdAt as createdAt",
                sql<string>`ST_AsGeoJSON(location)`.as('str_location'),
                "User.id as user__id",
                "User.name as user__name",
                "Report.nuisanceTypeId as nuisanceType__id",
                "NuisanceType.label as nuisanceType__label",
                "NuisanceType.family as nuisanceType__family",
                "NuisanceType.description as nuisanceType__description"
            ])
            .where(this.filter(filter))
            .orderBy("Report.createdAt desc")
    

        if(cursor.size > 0) {
            query = query.limit(cursor.size).offset(cursor.size * cursor.page)
        }

        const items = await query.execute();

        return items.map(row => ({
            id: row.id,
            createdAt: row.createdAt,
            intensity: Number(row.intensity),
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
        }))
    }

    async findOneBy(filter: FilterReport): Promise<Optional<Report>> {
        const [item] = await this.findBy(filter, {page: 0, size: 1});
        if(item === undefined) return null;
        return item
    }

    async countBy(filter: FilterReport): Promise<number> {
        const res = await this.con.selectFrom("Report")
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(eb => eb.and(filter))
        .executeTakeFirstOrThrow();
        
        return res.count;
    }
};
