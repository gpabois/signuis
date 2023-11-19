import { cache } from "react";
import { getCurrentSession } from "../auth/getCurrentSession"
import { bindAbility } from "@/lib/authz/ability";

export const getAbility = cache(async function () {
    const session = await getCurrentSession();
    return bindAbility(session?.user)
})