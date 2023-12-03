
import { FilterReport, InsertReport, Report, UpdateReport, ReportSum } from '@/lib/model/report';
import { Deletable, Insertable, Searchable, Updatable } from '../trait';



export interface ReportSumByArgs {
    filter: FilterReport,
    groupBy?: {period?: number, nuisanceType?: boolean}
}
/**
 * Report repository
 */
export interface IReportRepository
    extends Insertable<string, InsertReport>,
            Updatable<string, UpdateReport>,
            Deletable<FilterReport>,
            Searchable<FilterReport, Report>

{
    sumBy(args: ReportSumByArgs): Promise<Array<ReportSum>>
};

