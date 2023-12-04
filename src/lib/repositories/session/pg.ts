import { InsertSession, Session, FilterSession, UpdateSession } from "@/lib/model";
import { ISessionRepository } from ".";
import { DatabaseConnection } from "@/lib/database";
import { Optional } from "@/lib/option";
import { Cursor } from "@/lib/utils/cursor";

export class PgSessionRepository implements ISessionRepository {
    private con: DatabaseConnection

    constructor(con: DatabaseConnection) {
        this.con = con;
    }

    async insert(...inserts: Array<InsertSession>): Promise<Array<Session["id"]>> {
        return (await this.con.insertInto("Session")
            .values(inserts)
            .returning("id")
            .execute()).map(({id}) => id);
    }
    
    async deleteBy(entity: FilterSession): Promise<void> {
        await this.con.deleteFrom("Session").where(eb => eb.and(entity)).execute();
    }

    async update(update: UpdateSession): Promise<void> {
        const {id: id, ...values} = update;
        await this.con.updateTable("Session").set(values).where('id', '=', id).execute();
    }
    
    async findOneBy(filter: FilterSession): Promise<Optional<Session>> {
        const [item] = await this.findBy(filter, {page: 0, size: 1})
        if(item === undefined) return null;
        return item;
    }
    
    async findBy(filter: FilterSession, cursor: Cursor): Promise<Array<Session>> {
        const map = {
            id: "Session.id",
            expires: "Session.userId",
            sessionToken: "Session.sessionToken"
        }

        //@ts-ignore
        filter = Object.fromEntries(Object.keys(filter).map(k => [map[k], filter[k]]))

        let query = this.con
                        .selectFrom("Session")
                        .innerJoin("User", "User.id", "Session.userId")
                        .select([
                            "Session.id as id",
                            "Session.expires as expires",
                            "Session.sessionToken as sessionToken",
                            "User.id as user__id",
                            "User.name as user__name",
                            "User.email as user__email",
                            "User.emailVerified as user__emailVerified",
                            "User.role as user__role",
                            "User.image as user__image"
                        ])
                        .where(eb => eb.and(filter))
        
        if(cursor.size >= 0) {
            query = query.limit(cursor.size).offset(cursor.page * cursor.size)
        }

        const sessions = await query.execute();

        return sessions.map(row => ({
            id: row.id,
            sessionToken: row.sessionToken,
            expires: row.expires,
            user: {
                id: row.user__id,
                name: row.user__name,
                email: row.user__email,
                emailVerified: row.user__emailVerified,
                role: row.user__role,
                image: row.user__image === null ? undefined : row.user__image
            }
        }))
    }

    async countBy(filter: FilterSession): Promise<number> {
        const res =  await this.con
        .selectFrom("Session")
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(eb => eb.and(filter))
        .executeTakeFirstOrThrow()

        return res.count
    }
}