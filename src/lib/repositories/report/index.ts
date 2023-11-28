
import { FilterReport, InsertReport, CreateReport, Report, ReportId, UpdateReport, ReportSum } from '@/lib/model/report';
import { Cursor } from '@/lib/utils/cursor';
import { Deletable, Insertable, Searchable, Updatable } from '../trait';



/**
 * Report repository
 */
export interface IReportRepository
    extends Insertable<string, InsertReport>,
            Updatable<string, UpdateReport>,
            Deletable<FilterReport>,
            Searchable<FilterReport, Report>

{
    sumBy(filter: FilterReport): Promise<Array<ReportSum>>
};

