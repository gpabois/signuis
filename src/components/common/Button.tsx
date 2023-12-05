import { Spinner } from "./Spinner";

export type ButtonProps = {
    id?: string,
    type?: "button" | "submit" | "reset",
    className?: string,
    children: React.ReactNode,
    loading?: boolean
    nature?: "primary" | "danger" | "bare" | "success"
    disabled?: boolean
    onClick?: () => void
};
export function Button(props: ButtonProps) {
    let classNames = "";
    
    if(props.nature == "danger") {
        classNames = "bg-red-500"
    } 
    else if(props.nature == "primary") {
        classNames = `
            text-white 
            bg-gradient-to-br from-pink-500 to-orange-400 
            focus:ring-4 
            focus:outline-none focus:ring-pink-200 
            font-medium rounded-lg text-sm
        `
    }
    else {
        classNames = ``
    }

    return <button
            disabled={props.disabled}
            type={props.type || "button"}
            onClick={(_) => props.onClick?.()}
            className={`
                inline-flex
                items-center
                border 
                rounded 
                p-2
                text-gray-700                 
                ${classNames}
                leading-tight focus:outline-none focus:shadow-outline
                ${props.className} 
                `}>
            {props.loading && <Spinner/>} 
            {props.children}
    </button>
}