import { FilterReport, Report } from "@/lib/model";
import { getCurrentSession } from "../auth/getCurrentSession";
import { getReportingService } from "../getReportingService";
import { Cursor } from "@/lib/utils/cursor";

export async function findMyReports({userId, ...filter}: FilterReport, cursor?: Cursor): Promise<Array<Report>> {
    const session = await getCurrentSession() 
    if(!session) return [];
    const reporting = await getReportingService();
    return await reporting.findReportsBy({
        userId: session.user.id,
        ...filter
    }, cursor);
}