"use client";

import { Input } from "@/components/common/forms/Input";
import { Password } from "@/components/common/forms/Password";
import {useFormState } from 'react-dom'
import { FormButton } from "@/components/common/forms/FormButton";
import { SignInState, signIn } from "@/actions/auth/signIn";
import { useSearchParams } from "next/navigation";
import { useResult } from "@/hooks/useResult";

export function SignInForm() {
    const redirectTo = useSearchParams().get("redirectTo");
    //@ts-ignore
    const [state, doSignIn] = useFormState<SignInState>(signIn, {redirectTo});
    const result = useResult<void>(state?.result);

    return <form className="space-y-4 md:space-y-6" action={doSignIn}>
    {result?.overallIssues.map((issue) => <span className="text-red-800">{issue.message}</span>)}
    <div>
        <Input label="Nom ou email" name="nameOrEmail"/>
    </div>
    <div>   
        <Password label="Mot de passe" name="password" />
    </div>
    <div className="flex items-center justify-between">
        <div className="flex items-start">
            <div className="flex items-center h-5">
            </div>
            <div className="ml-3 text-sm">
            </div>
        </div>
        <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
    </div>
    <FormButton type="submit">Se connecter</FormButton>
    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
        Pas encore de compte ? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Inscription</a>
    </p>
</form>
}