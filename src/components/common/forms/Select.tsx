import React, { useMemo } from "react";
import { ZodIssue } from "zod";

export function SelectOption(props: {value?: string, label?:string}) {
    return <option value={props.value}>{props.label || props.value}</option>
}

export type SelectProps = {
    id?: string,
    name?:string, 
    className?: string,
    label?: string, 
    value?: string,
    issues?: ZodIssue[],
    children?: React.ReactNode,
    onValueChanged?: (value: string) => void
};
export function Select(props: SelectProps) {
    const errors = useMemo<ZodIssue[]>(() => (props.id && props.issues) ? props.issues.filter((i) => i.path.includes(props.id!)) : [], [props.id, props.issues])
    const className = useMemo(() => {
        if(errors.length > 0) {
            return "border-red-600"
        }
        return ""
    }, [errors])

    return <div className={props.className}>
        {props.label && 
        <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
            {props.label}
        </label>}     
        <select 
            id={props.id}
            name={props.name}
            value={props.value} 
            onChange={(e) => props.onValueChanged?.(e.target.value)}
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
            leading-tight focus:outline-none focus:shadow-outline`}>
            {props.children}
        </select>

        {errors.map((error, i) => <span key={`error_${i}`} className="mt-2 text-sm text-red-500">{error.message}</span>)}
    </div>
}