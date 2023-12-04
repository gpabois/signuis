import { PgReportRepository } from "@/lib/repositories/report/pg";
import { setupDatabase, teardownDatabase } from "./index.setup";
import { getDatabaseConnection } from '@/lib/database';
import { INuisanceTypeRepository, IReportRepository } from "@/lib/repositories";
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg";
import { ReportFixtures } from "@/lib/fixtures";
import { geojson } from "@/lib/utils/geojson";

describe("report repository", () => {
    beforeEach(() => setupDatabase());
    afterEach(() => teardownDatabase());

    async function createRepository(): Promise<IReportRepository> {
        return new PgReportRepository(await getDatabaseConnection());
    }

    async function createNuisanceTypeRepository(): Promise<INuisanceTypeRepository> {
        return new PgNuisanceTypeRepository(await getDatabaseConnection());
    }

    async function setup(): Promise<{repositories: {reports: IReportRepository, nuisanceTypes: INuisanceTypeRepository}}> {
        return {
            repositories: {
                reports:        await createRepository(),
                nuisanceTypes:  await createNuisanceTypeRepository()
            }
        }
    }

    test("insert", async() => {
        // Setup
        const shared = await setup();
        const insert = await ReportFixtures.ForRepositories.generateInsertReportData({}, shared);
        
        // Test
        const [id] = await shared.repositories.reports.insert(insert);
        expect(id).not.toBeNull();

        const report = await shared.repositories.reports.findOneBy({id});
        expect(report).not.toBeNull();
        expect(report!.location.coordinates[0]).toBeCloseTo(insert.location.coordinates[0]);
        expect(report!.location.coordinates[1]).toBeCloseTo(insert.location.coordinates[1]);
        expect(report!.nuisanceType.id).toBe(insert.nuisanceTypeId);
    });

    test("findOneBy({id})", async() => {
        // Setup
        const shared = await setup();
        const {id, ...insert} = await ReportFixtures.ForRepositories.insert({}, shared);

        // Test
        const report = await shared.repositories.reports.findOneBy({id})

        // Assertions
        expect(report).not.toBeNull();
        expect(report!.id).toBe(id);
        expect(report!.location.coordinates[0]).toBeCloseTo(insert.location.coordinates[0]);
        expect(report!.location.coordinates[1]).toBeCloseTo(insert.location.coordinates[1]);
        expect(report!.nuisanceType.id).toBe(insert.nuisanceTypeId);
        expect(report!.intensity).toBe(insert.intensity);
    });

    test("findOneBy({within}) with report within the polygon", async() => {
        // Setup
        const shared = await setup();
        const {id, ...insert} = await ReportFixtures.ForRepositories.insert({
            location: geojson.Point.fromLatLon({
                lat:  -29.05215,
                lon: -74.93155
            })
        }, shared);

        const within = geojson.Polygon.Rectangle.fromDiagonalPoints({
            nw: geojson.Point.add(insert.location, geojson.Point.create(-5, -5)),
            se: geojson.Point.add(insert.location, geojson.Point.create(5, 5)),
        })
        
        // Test 
        const report = await shared.repositories.reports.findOneBy({within})
        
        // Assertions
        expect(report).not.toBeNull();
        expect(report!.id).toBe(id);
        expect(report!.location.coordinates[0]).toBeCloseTo(insert.location.coordinates[0]);
        expect(report!.location.coordinates[1]).toBeCloseTo(insert.location.coordinates[1]);
        expect(report!.nuisanceType.id).toBe(insert.nuisanceTypeId);
        expect(report!.intensity).toBe(insert.intensity);
    });

    test("findOneBy({within}) without report within the polygon", async() => {
        // Setup
        const shared = await setup();
        const location = geojson.Point.fromLatLon({
            lat:  -29.05215,
            lon: -74.93155
        });
        
        const {id, ...insert} = await ReportFixtures.ForRepositories.insert({
            location
        }, shared);

        const within = geojson.Polygon.Rectangle.fromDiagonalPoints({
            nw: geojson.Point.add(insert.location, geojson.Point.create(-15, -15)),
            se: geojson.Point.add(insert.location, geojson.Point.create(-5, -5)),
        })
        
        // Test 
        const report = await shared.repositories.reports.findOneBy({within})
        
        // Assertions
        expect(report).toBeNull();
    });

    test("sumBy({within})", async() => {
        // Setup
        const shared = await setup();
        const location = geojson.Point.fromLatLon({
            lat:  -29.05215,
            lon: -74.93155
        });

        await ReportFixtures.ForRepositories.insert({
            location,
            intensity: 1
        }, shared);

        await ReportFixtures.ForRepositories.insert({
            location,
            intensity: 3
        }, shared);

        const within = geojson.Polygon.Rectangle.fromDiagonalPoints({
            nw: geojson.Point.add(location, geojson.Point.create(-10, -10)),
            se: geojson.Point.add(location, geojson.Point.create(10, 10)),
        })

        // Test 
        const sums = await shared.repositories.reports.sumBy({filter: {within}})
        
        // Assertions
        expect(sums).toHaveLength(2);
    });

    test("deleteBy", async() => {
        // Setup
        const shared = await setup();
        const {id} = await ReportFixtures.ForRepositories.insert({}, shared);

        // Test
        await shared.repositories.reports.deleteBy({id});
        
        // Assertions
        expect(await shared.repositories.reports.findOneBy({id})).toBeNull();
    })
    
})