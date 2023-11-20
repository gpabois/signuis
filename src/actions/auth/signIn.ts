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
export async function signIn(formState: {redirectTo?: string}, formData: FormData): Promise<Result<void>> {
    const auth = await getAuthenticationService();
    const cookieStore = cookies();

    const validation = await CredentialsSchema.safeParseAsync({
        nameOrEmail: formData.get("nameOrEmail"),
        password: formData.get("password")
    })
    
    if(validation.success == false) 
        return failed(validation_error(validation.error.formErrors.fieldErrors))

    const credentials = validation.data;

    const sessionResult = await auth.signInWithCredentials(credentials);
    if(hasFailed(sessionResult)) return sessionResult;

    const session = sessionResult.data;
    
    cookies().set(SessionTokenCookieName, session.sessionToken, { secure: process.env.NODE_ENV === "production" });

    redirect(formState.redirectTo || '/')
}