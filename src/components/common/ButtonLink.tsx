import Link from "next/link";
import { Spinner } from "./Spinner";
import { Url } from "next/dist/shared/lib/router/router";

export type ButtonProps = {
    id?: string,
    href: Url,
    className?: string,
    children: React.ReactNode,
    nature?: string
};
export function ButtonLink(props: ButtonProps) {
    let classNames = "";
    
    if(props.nature == "danger") {
        classNames = "bg-red-500"
    } else {
        classNames = `
            text-white 
            bg-gradient-to-br from-pink-500 to-orange-400 
            hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 
            dark:focus:ring-pink-800 
            font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2`
    }

    return <div className={props.className}>
        <Link
            href={props.href}
            className={`${props.className}
                shadow 
                appearance-none 
                border 
                rounded 
                w-full py-2 px-3 text-gray-700                 
                ${classNames}
                leading-tight focus:outline-none focus:shadow-outline`}>
            {props.children}
        </Link>
    </div>
}