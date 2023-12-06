import { findNuisanceTypesBy } from "@/actions/nuisance-types/actions";
import { Monitoring } from "./monitoring"
import { useSearchParams } from "next/navigation";

export default async function Page() {
  const nuisanceTypes = await findNuisanceTypesBy({}, {page: 0, size: -1})
  const DEFAULT_TIME_RANGE = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(Date.now())
    };

  return <Monitoring nuisanceTypes={nuisanceTypes} />
}