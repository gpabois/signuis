"use server";

import { validation_error } from "@/lib/error";
import { CredentialsSchema } from "@/lib/forms";
import { failed, hasFailed } from "@/lib/result";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Result } from "@/lib/result";
import { SessionTokenCookieName } from ".";
import { getAuthenticationService } from "../getAuthenticationService";

/**
 * Authenticate the user
 * @param formState 
 * @param formData 
 * @returns 
 */
export async function signIn({redirectTo}: {redirectTo?: string, result?: Result<void>}, formData: FormData): Promise<{redirectTo?: string, result?: Result<void>}> {
    const auth = await getAuthenticationService();

    const validation = await CredentialsSchema.safeParseAsync({
        nameOrEmail: formData.get("nameOrEmail"),
        password: formData.get("password")
    })
    
    if(validation.success == false) 
        return {result: failed(validation_error(validation.error.formErrors.fieldErrors)), redirectTo}

    const credentials = validation.data;

    const sessionResult = await auth.signInWithCredentials(credentials);
    if(hasFailed(sessionResult)) return {result: sessionResult, redirectTo};

    const session = sessionResult.data;
    
    cookies().set(SessionTokenCookieName, session.sessionToken, { secure: process.env.NODE_ENV === "production" });

    redirect(redirectTo || '/')
}