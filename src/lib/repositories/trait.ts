import { Optional } from "../option"
import { Cursor } from "../utils/cursor"

export interface Insertable<ID, InsertEntity> {
    insert(entity: InsertEntity): Promise<ID>
};

export interface Deletable<FilterEntity> {
    deleteBy(entity: FilterEntity): Promise<void>
};

export interface Updatable<ID, UpdateEntity> {
    update(update: UpdateEntity & {id: ID}): Promise<void>;
}

export interface Searchable<Filter, Entity> {
    findOneBy(filter: Filter): Promise<Optional<Entity>>
    findBy(filter: Filter, cursor: Cursor): Promise<Array<Entity>>
    countBy(filter: Filter): Promise<number>
}
