import { useMemo } from "react";

export type InputProps = {
    id?: string,
    name?:string, 
    className?: string,
    label?: string, 
    value?: string,
    fieldErrors?: {[id: string]: string[]},
    onValueChanged?: (value: string) => void
};
export function Input(props: InputProps) {
    const errors = useMemo<string[]>(() => (props.id && props.fieldErrors?.[props.id]) || [], [props.id, props.fieldErrors])
    const className = useMemo(() => {
        if(errors.length > 0) {
            return "border-red-600"
        }
        return ""
    }, [errors])

    return <div className={props.className}>
        <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
            {props.label}
        </label>
        <input type="text" 
            value={props.value} 
            id={props.id}
            name={props.name}
            onChange={(e) => props.onValueChanged?.(e.target.value)} 
            className={`
                shadow 
                appearance-none 
                border 
                rounded 
                ${className}
                w-full py-2 px-3 
                text-gray-700 
                dark:bg-slate-800 
                dark:border-slate-600
                dark:text-gray-300 
                leading-tight focus:outline-none focus:shadow-outline`}/>
        {errors.map((error, i) => <span key={`error_${i}`} className="mt-2 text-sm text-red-500">{error}</span>)}
    </div>
}