import { useMemo, useState } from "react";

export type RangeProps = {
    id?: string,
    name?:string, 
    className?: string,
    label?: string, 
    value?: number,
    fieldErrors?: {[id: string]: string[]},
    min?: number,
    max?: number,
    step?: number,
    onValueChanged?: (value: number) => void
};
export function Range(props: RangeProps) {
    const [value, setValue] = useState(props.value);

    const errors = useMemo<string[]>(() => (props.id && props.fieldErrors?.[props.id]) || [], [props.id, props.fieldErrors])
    const className = useMemo(() => {
        if(errors.length > 0) {
            return "border-red-600"
        }
        return ""
    }, [errors])

    return <div className={props.className}>
        {props.label && <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
            {props.label}
        </label>}
        <input type="range" 
            value={props.value} 
            id={props.id}
            name={props.name}
            min={props.min}
            max={props.max}
            step={props.step}
            onChange={(e) => {
                setValue(e.target.valueAsNumber)
                props.onValueChanged?.(e.target.valueAsNumber)
            }} 
            className={`
                w-full h-1
                rounded-lg 
                appearance-none 
                cursor-pointer 
                bg-gradient-to-r 
                from-blue-500 
                via-green-500 
                to-red-500
                dark:bg-gray-700`
            }/>
        {errors.map((error, i) => <span key={`error_${i}`} className="mt-2 text-sm text-red-500">{error}</span>)}
    </div>
}