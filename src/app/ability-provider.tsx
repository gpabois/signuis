'use client'

import { useCurrentSession } from "@/hooks/useCurrentSession";
import {bindAbility} from "@/lib/authz/ability";
import {AbilityContext} from "@/contexts/Ability"

/**
 * Provides ability for authorization.
 */
export function AbilityProvider(props: {children?: React.ReactNode}) {
    const session = useCurrentSession();
    const ability = bindAbility(session?.user);
    return <AbilityContext.Provider value={ability}>
        {props.children}
    </AbilityContext.Provider>
}