import { useState, useEffect } from "react";
import { decomposeTimestamp, recomposeTimestamp } from "./utils";

export function ScaleInput(props: {value: number, onChanged?: (ms: number) => void}) {
    
    const [decomposed, setDecomposed] = useState(decomposeTimestamp(props.value))

    useEffect(() => setDecomposed(decomposeTimestamp(props.value)), [props.value])

    function notifyChange() {
        props.onChanged?.(recomposeTimestamp(decomposed))
    }

    function setDays(days: number) {
        setDecomposed(d => ({...d, days}))
        notifyChange()
    }

    function setHours(hours: number) {
        setDecomposed(d => ({...d, hours}))
        notifyChange()
    }

    function setMinutes(minutes: number) {
        setDecomposed(d => ({...d, minutes}))
        notifyChange()
    }

    return <div className="flex flex-row align-center space-x-2">
        <div>
            <label className="mr-2">Jour: </label>
            <input className="w-12" name="days" type="number" value={decomposed.days} onChange={(e) => setDays(e.target.valueAsNumber)}/>
        </div>
        <div>
            <label className="mr-2">Heures: </label>
            <input className="w-12" name="hours" type="number" value={decomposed.hours} onChange={(e) => setHours(e.target.valueAsNumber)}/>
        </div>
        <div>   
            <label className="mr-2">Minutes: </label>
            <input className="w-12" name="minutes" type="number" value={decomposed.minutes} onChange={(e) => setMinutes(e.target.valueAsNumber)}/>
        </div>

    </div>
}