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
        insert: jest.fn(),
        update: jest.fn(),
        findOneBy: jest.fn(),
        findBy: jest.fn(),
        countBy: jest.fn(),
        deleteBy: jest.fn()
    }
}

export type MockNuisanceTypeRepository = jest.Mocked<INuisanceTypeRepository>;
export function newMockedNuisanceTypeRepository(): MockNuisanceTypeRepository {
    return {
        insert: jest.fn(),
        update: jest.fn(),
        deleteBy: jest.fn(),
        findOneBy: jest.fn(),
        countBy: jest.fn(),
        findBy: jest.fn(),
    }
}