import { ReportList } from "@/components/reports/list";
import { Report } from "@/lib/model";

export function ReportCatalog(props: {page: Array<Report>}) {
    return <ReportList items={props.page}/>
}