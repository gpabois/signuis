import { getAbility } from "@/actions/authz/getAbility";
import { redirect } from 'next/navigation'
import { headers } from "next/headers";
import path from "path";
import { getCurrentSession } from "@/actions/auth/getCurrentSession";

export async function checkIfAuthenticated() {
    const session = await getCurrentSession();
    const pathname = headers().get('x-pathname');
    
    if(!session?.user) {
        redirect(`/auth/signIn?redirectTo=${pathname}`)
    }
}

// Route groups requiring authentication.
const authenticatedRouteGroups = ["/admin", "/my", "/monitoring"];

export async function AuthenticationGuard({children}: {children: React.ReactNode}) {
    const ability = await getAbility();

    const pathname = headers().get('x-pathname');

    if(authenticatedRouteGroups.find(e => pathname?.startsWith(e))) {
        await checkIfAuthenticated();
    }

    // Administration routes
    if(pathname?.startsWith("/admin") && !ability.can('access', 'administration')) {
        redirect('/403')
    }

    // Administration routes
    if(pathname?.startsWith("/monitoring") && !ability.can('access', 'monitoring')) {
        redirect('/403')
    }

    return <>{children}</>
}