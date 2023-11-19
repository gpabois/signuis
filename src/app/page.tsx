import { Home } from "./home";
import { findNuisanceTypesBy } from "../actions/nuisance-types/actions";

export default async function Page() {
  // Get all types of nuisance
  const nuisanceTypes = await findNuisanceTypesBy({}, {page: 0, size: -1});
  // Return client-side 
  return <Home nuisanceTypes={nuisanceTypes}/>
}

