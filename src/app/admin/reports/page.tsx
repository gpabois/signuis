import { Heading } from "@/components/Heading";
import { countReportsBy, findReportsBy } from "../../../actions/nuisance-types/actions";
import { ReportBook } from "./book";

export default async function Page() {
    const page = await findReportsBy({});
    const count = await countReportsBy({});

    return <>
        <Heading className="mb-4" level={1}>Signalements</Heading>
        <ReportBook page={page} count={count} />
    </>
}