"use client";

import { Input } from "@/components/common/forms/Input";
import { Password } from "@/components/common/forms/Password";
import { useFormState } from "react-dom";
import { FormButton } from "@/components/common/forms/FormButton";
import { signIn } from "@/actions/auth/signIn";
import { Result, hasFailed } from "@/lib/result";

export function SignInForm() {
    const [state, doSignIn] = useFormState<{result?: Result<void>, redirectTo?: string}>(signIn, {});

    return <form className="space-y-4 md:space-y-6" action={doSignIn}>
    {hasFailed(state.result) && <span className="text-red-800">{state.result.error.type}</span>}
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