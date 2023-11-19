'use client'

import { CurrentSessionContext } from "@/contexts/CurrentSession";
import { Session } from "@/lib/model";


export function SessionProvider(props: {children?: React.ReactNode, session?: Session}) {
    return <CurrentSessionContext.Provider value={props.session}>
        {props.children}
    </CurrentSessionContext.Provider>
}