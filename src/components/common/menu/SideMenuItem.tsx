"use client";

import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useMemo } from "react";

export function SideMenuItem(props: {href: Url, children: React.ReactNode}) {
   const pathname = usePathname()

   const className = useMemo(() => {
    if(pathname.startsWith(props.href.toString())) {
       return "bg-slate-600 text-white"
    }
    return ""
   }, [pathname])
   return <li className={`${className} w-full p-2 sm:pr-6 hover:bg-slate-200 hover:text-black hover:transition ease-in-out`}>
        <Link href={props.href} className="flex flex-row [&>*:first-child]:grow items-center">
            {props.children}
        </Link>
   </li>
}