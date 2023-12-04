import { Intensity, User, Report, Session, NuisanceTile} from '../model'
import { Signal } from './signal'

export interface Signals {
    // Report //

    /**
     * A new report has been created
     */
    report_created: Signal<Report>,

    /**
     * A report has been deleted
     */
    report_deleted: Signal<Report>,

    /**
     * A nuisance tile has been updated (incremented, or decremented)
     */
    nuisance_tile_updated: Signal<NuisanceTile>,

    /**
     * A new registered 
     */
    user_registered: Signal<User>,
    /**
     * A user has been deleted
     */
    user_deleted: Signal<User>,

    /**
     * A user has signed in
     */
    user_signed_in: Signal<Session>,

    /**
     * A user has signed out
     */
    user_signed_out: Signal<Session>

}

export function createSignals(): Signals {
    return {
        report_created:         new Signal<Report>(),
        report_deleted:         new Signal<Report>(),
        nuisance_tile_updated:  new Signal<NuisanceTile>(),
        user_registered:        new Signal<User>,
        user_deleted:           new Signal<User>,
        user_signed_in:         new Signal<Session>,
        user_signed_out:        new Signal<Session>
    }
}