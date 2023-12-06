import { useMemo } from "react";
import { ZodIssue } from "zod";

export type InputProps = {
    id?: string,
    name?:string, 
    className?: string,
    label?: string, 
    value?: string,
    issues?: ZodIssue[],
    onValueChanged?: (value: string) => void
};
export function Password(props: InputProps) {
    const errors = useMemo<ZodIssue[]>(() => (props.id && props.issues) ? props.issues.filter((i) => i.path.includes(props.id!)) : [], [props.id, props.issues])
    const className = useMemo(() => {
        if(errors.length > 0) {
            return "border-red-600"
        }
        return ""
    }, [errors])

    return <div className={props.className}>
        <label className="block text-gray-700 dark:text-gray-100 text-sm font-bold mb-2">
            {props.label}
        </label>
        <input type="password" 
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
        {errors.map((error, i) => <span key={`error_${i}`} className="mt-2 text-sm text-red-500">{error.message}</span>)}
    </div>
}