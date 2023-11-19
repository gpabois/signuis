import { Heading } from "@/components/Heading";
import { countReportsBy, findReportsBy } from "../../../actions/nuisance-types/actions";
import { ReportList } from "./list";

export default async function Page() {
    const page = await findReportsBy({});
    const size = await countReportsBy({});

    return <>
        <Heading className="mb-4" level={1}>Signalements</Heading>
        <ReportList page={page} size={size} />
    </>
}