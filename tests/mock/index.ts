import { INuisanceTypeRepository, IReportRepository } from "@/lib/repositories";
import { Signal } from "@/lib/signals/signal"

export function mockReceiver<D>(s: Signal<D>): jest.Mock {
    const w = jest.fn();
    s.connect((emitter, data) => w())
    return w
}

export type MockReportRepository = jest.Mocked<IReportRepository>;
export function newMockedReportRepository(): MockReportRepository {
    return {
        insertReport: jest.fn(),
        getReport: jest.fn(),
        getReportsBy: jest.fn(),
        deleteReport: jest.fn()
    }
}

export type MockNuisanceTypeRepository = jest.Mocked<INuisanceTypeRepository>;
export function newMockedNuisanceTypeRepository(): MockNuisanceTypeRepository {
    return {
        insertNuisanceType: jest.fn(),
        deleteNuisanceType: jest.fn(),
        getNuisanceType: jest.fn(),
        getNuisanceTypesBy: jest.fn(),

    }
}