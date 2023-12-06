import { CreateUser, User,UserId, UserFilter, UpdateUser, SensitiveUser, InsertUser, DeleteUserFilter } from "@/lib/model";
import { IUserRepository } from "..";
import { DatabaseConnection } from "@/lib/database";
import { Optional } from "@/lib/option";
import { Cursor } from "@/lib/utils/cursor";

export class PgUserRepository implements IUserRepository {
    private con: DatabaseConnection

    constructor(con: DatabaseConnection) {
        this.con = con;
    }
    
    async insert(...inserts: Array<InsertUser>): Promise<Array<User["id"]>> {
        const result = await this.con.insertInto("User")
            .values(inserts.map((insert) => ({
                ...insert,
                emailVerified: null,
                role: "user"
            })))
            .returning("id")
            .execute();

        return result?.map(({id}) => id) || [];
    }

    async update(patch: UpdateUser): Promise<void> {
        await this.con.updateTable("User")
            .set(patch)
            .where("id", "=", patch.id)
            .execute();
    }

    async deleteBy(filter: DeleteUserFilter): Promise<void> {
        await this.con.deleteFrom("User").where(eb => eb.and(filter));
    }
    
    async findBy(filter: UserFilter, cursor: Cursor): Promise<Array<SensitiveUser>> {
        let query = this.con
            .selectFrom("User")
            .selectAll()
            .where((eb) => {
                const {nameOrEmail, ...directFilter} = filter;

                return eb.and([
                    ...(nameOrEmail ? [eb.or([
                        eb("User.name", "=", nameOrEmail), 
                        eb("User.email", "=", nameOrEmail)])] : []),
                    eb.and(directFilter)
                ])
            })

        if(filter.providerAccountId) {
            query = query.innerJoin("Account", "Account.userId", "User.id")
            .where("Account.providerAccountId", "=", filter.providerAccountId.providerAccountId)
            .where("Account.provider", "=", filter.providerAccountId.provider);
        }
            
        return query.execute();
    }

    async countBy(filter: UserFilter): Promise<number> {
        let query = this.con
            .selectFrom("User")
            .select(({fn}) => [fn.countAll<number>().as('count')])
            .where((eb) => {
                const {nameOrEmail, ...directFilter} = filter;

                return eb.and([
                    ...(nameOrEmail ? [eb.or([
                        eb("User.name", "=", nameOrEmail), 
                        eb("User.email", "=", nameOrEmail)])] : []),
                    eb.and(directFilter)
                ])
            })

        if(filter.providerAccountId) {
            query = query.innerJoin("Account", "Account.userId", "User.id")
            .where("Account.providerAccountId", "=", filter.providerAccountId.providerAccountId)
            .where("Account.provider", "=", filter.providerAccountId.provider);
        }

        return (await query.executeTakeFirstOrThrow()).count
    }

    async findOneBy(filter: UserFilter): Promise<Optional<SensitiveUser>> {
        const [entity] = await this.findBy(filter, {page: 0, size: 1})
        return entity === undefined ? null : entity
    }

};