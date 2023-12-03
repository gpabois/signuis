import { DatabaseConnection, createDatabaseConnection, getDatabaseConnection } from "@/lib/database";
import { INuisanceTileRepository, INuisanceTypeRepository, IReportRepository, ISessionRepository, IUserRepository} from "@/lib/repositories";
import { PgNuisanceTileRepository } from "@/lib/repositories/nuisance-tile/pg";
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg";
import { PgReportRepository } from "@/lib/repositories/report/pg";
import { PgSessionRepository } from "@/lib/repositories/session/pg";
import { PgUserRepository } from "@/lib/repositories/user/pg";
import { AccountService, IAccountService } from "@/lib/services/account";
import { AuthenticationService, IAuthenticationService } from "@/lib/services/authentication";
import { IReportingService, ReportingService } from "@/lib/services/reporting";
import { Signals, createSignals } from "@/lib/signals";
import { get } from "http";
import { IMonitoringService, MonitoringService } from "./services/monitoring";

export interface Shared {
    signals: Signals,
    db: DatabaseConnection,
    
    repositories: {
        reports: IReportRepository,
        users: IUserRepository,
        nuisanceTypes: INuisanceTypeRepository,
        nuisanceTiles: INuisanceTileRepository,
        sessions: ISessionRepository
    },

    services: {
        reporting: IReportingService,
        account: IAccountService,
        auth: IAuthenticationService,
        monitoring: IMonitoringService
    }
}

export async function createShared(): Promise<Shared> {
    const db = getDatabaseConnection();
    const signals = createSignals();
    const repositories = {
        reports:        new PgReportRepository(db),
        users:          new PgUserRepository(db),
        nuisanceTypes:  new PgNuisanceTypeRepository(db),
        nuisanceTiles:  new PgNuisanceTileRepository(db),
        sessions:       new PgSessionRepository(db)
    }

    const services = {
        reporting: new ReportingService({
            reports: repositories.reports,
            nuisanceTypes: repositories.nuisanceTypes,
            signals
        }),
        account: new AccountService({
            users: repositories.users,
            signals
        }),
        auth: new AuthenticationService({
            users: repositories.users,
            sessions: repositories.sessions,
            signals
        }),
        monitoring: new MonitoringService({reports: repositories.reports, nuisanceTiles: repositories.nuisanceTiles, signals})
    }

    return {db, signals, repositories, services}
}