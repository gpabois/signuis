import { Spinner } from "./Spinner";

export type ButtonProps = {
    id?: string,
    type?: "button" | "submit" | "reset",
    className?: string,
    children: React.ReactNode,
    loading?: boolean
    nature?: string
    disabled?: boolean
    onClick?: () => void
};
export function Button(props: ButtonProps) {
    let classNames = "";
    
    if(props.nature == "danger") {
        classNames = "bg-red-500"
    } else {
        classNames = `
            text-white 
            bg-gradient-to-br from-pink-500 to-orange-400 
            hover:bg-gradient-to-bl 
            focus:ring-4 
            focus:outline-none focus:ring-pink-200 
            dark:focus:ring-pink-800 
            font-medium rounded-lg text-sm
            transition-all duration-500
        `
    }

    return <div className={props.className}>
        <button
            disabled={props.disabled}
            type={props.type || "button"}
            onClick={(_) => props.onClick?.()}
            className={`
                border 
                rounded 
                h-10 px-2
                text-gray-700                 
                ${classNames}
                leading-tight focus:outline-none focus:shadow-outline
                ${props.className} 
                `}>
            <span>{props.children}</span>
            {props.loading && <Spinner/>} 
            
        </button>
    </div>
}