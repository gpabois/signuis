"use server";

import { cookies } from "next/headers";
import { getAuthenticationService } from "../getAuthenticationService";
import { cache } from "react";
import { SessionTokenCookieName } from ".";
import { Session } from "@/lib/model";

/**
 * Get the current user session.
 * @returns 
 */
export const getCurrentSession = cache(async function(): Promise<Session|undefined> {
    const auth = await getAuthenticationService();
    const cookieStore = cookies();

    const sessionToken = cookieStore.get(SessionTokenCookieName)?.value
    return await auth.check(sessionToken)
})