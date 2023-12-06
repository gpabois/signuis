"use server";

import { validation_error } from "@/lib/error";
import { CredentialsSchema } from "@/lib/forms";
import { failed, hasFailed, isSuccessful } from "@/lib/result";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Result } from "@/lib/result";
import { SessionTokenCookieName } from ".";
import { getAuthenticationService } from "@/actions/getAuthenticationService";

export type SignInState = {redirectTo?: string, result?: Result<void>}

/**
 * Authenticate the user
 * @param formState 
 * @param formData 
 * @returns 
 */
export async function signIn(prevState: SignInState, formData: FormData): Promise<SignInState> {
    const auth = await getAuthenticationService();

    // Pre-validation
    let validation = await CredentialsSchema.safeParseAsync({
        nameOrEmail: formData.get("nameOrEmail"),
        password: formData.get("password")
    })
    
    if(validation.success == false) 
        return {...prevState, result: failed(validation_error(validation.error.issues))}


    let result = await auth.signInWithCredentials(validation.data);
    
    if(hasFailed(result)) 
        return {...prevState, result}

    if(isSuccessful(result)) {
        const session = result.data;
        cookies().set(SessionTokenCookieName, session.sessionToken, { secure: process.env.NODE_ENV === "production" });
        redirect(prevState?.redirectTo || '/')
    }

    return {}
}