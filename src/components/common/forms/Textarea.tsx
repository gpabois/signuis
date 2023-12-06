import { useMemo } from "react";
import { ZodIssue } from "zod";

export type SelectProps = {
    id?: string,
    name?:string, 
    className?: string,
    issues?: ZodIssue[],
    label?: string, 
    value?: string,
    rows?: number,
    onValueChanged?: (value: string) => void
};
export function Textarea(props: SelectProps) {

    const errors = useMemo<ZodIssue[]>(() => (props.id && props.issues) ? props.issues.filter((i) => i.path.includes(props.id!)) : [], [props.id, props.issues])
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
        <textarea 
            id={props.id}
            name={props.name}
            className={`
                shadow 
                ${className}
                appearance-none 
                border rounded w-full 
                py-2 px-3 
                text-gray-700
                dark:bg-slate-800 
                dark:border-slate-600
                dark:text-gray-300 
                leading-tight focus:outline-none focus:shadow-outline`}
            rows={props.rows || 4} 
            onChange={(e) => props.onValueChanged?.(e.target.value)}>
                {props.value}
        </textarea>
        {errors.map((error, i) => <span key={`error_${i}`} className="mt-2 text-sm text-red-500">{error.message}</span>)}

    </div>
}