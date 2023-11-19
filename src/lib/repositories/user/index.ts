import { UpdateUser, UserFilter, InsertUser, SensitiveUser, DeleteUserFilter } from '@/lib/model';
import { Deletable, Insertable, Searchable, Updatable } from '../trait';

/**
 * Interface for user-related repository operations
 */
export interface IUserRepository 
        extends Insertable<string, InsertUser>, 
                Searchable<UserFilter, SensitiveUser>, 
                Deletable<DeleteUserFilter>,
                Updatable<string, UpdateUser>

{
};