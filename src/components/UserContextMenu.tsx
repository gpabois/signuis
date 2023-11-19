"use client";

import { ButtonLink } from "./common/ButtonLink";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { Button } from "./common/Button";
import Link from "next/link";
import { Can } from "./Can";

export function UserContextMenu() {
    const session = useCurrentSession();

    if(session) {
        return <div className="flex flex-col">
            <Button className="
                relative 
                inline-flex 
                items-center 
                justify-center 
                w-10 h-10 
                overflow-hidden 
                rounded-full 
                bg-gray-10 dark:bg-gray-600
                text-gray-100 dark:text-primary-100 
                bg-gray-100
                border-0
                border-primary-900 ring-2 ring-offset-2
                ">
            {session.user.image ? <img src={session.user.image}/> : session.user.name.at(0)?.toUpperCase()}
        </Button>
        <div id="userDropdown" className="z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div>{session.user.name}</div>
            <div className="font-medium truncate">{session.user.email}</div>
            </div>
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
            <li>
                <Link className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" href="/my/reports">Signalement</Link>
            </li>
            <li>
                <Link href="/my/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Paramètres</Link>
            </li>
            <Can I="access" a="administration">
            <li>
                <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Administration</Link>
            </li>
            </Can>
            </ul>
            <div className="py-1">
                <Link href="/auth/signOut" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Se déconnecter</Link>
            </div>
        </div>
        </div>
    } else {
        return <ButtonLink href="/auth/signIn">Se connecter</ButtonLink>
    }
}