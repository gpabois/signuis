"use server";

import { getAuthenticationService } from "../getAuthenticationService";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Result } from "@/lib/result";
import { getCurrentSession } from "./getCurrentSession";
import { SessionTokenCookieName } from ".";


export async function signOut(): Promise<Result<void>> {
    const session = await getCurrentSession();
    if(!session) redirect('/')
    
    const auth = await getAuthenticationService();
    await auth.signOut(session?.sessionToken)
    
    const cookieStore = cookies();
    cookieStore.set(SessionTokenCookieName, "", {maxAge: 0});
    
    redirect('/')
}
