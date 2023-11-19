import { InsertSession, Session, FilterSession, UpdateSession} from '@/lib/model';
import { Insertable, Deletable, Updatable, Searchable } from '../trait';

/**
 * Interface for user-related repository operations
 */
export interface ISessionRepository 
    extends Insertable<string, InsertSession>, 
            Deletable<FilterSession>,
            Updatable<string, UpdateSession>,
            Searchable<FilterSession, Session>
{}