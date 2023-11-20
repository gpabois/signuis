import { findMyReports } from "@/actions/reports/findMyReports";
import {ReportCatalog} from './catalog';
import { Heading } from "@/components/Heading";

export default async function Page() {
    const reports = await findMyReports({}, {page: 0, size: 20})
    
    return <>  
        <Heading level={1} className="mb-2">Mes signalements</Heading>
        <ReportCatalog page={reports}></ReportCatalog>
    </>
}