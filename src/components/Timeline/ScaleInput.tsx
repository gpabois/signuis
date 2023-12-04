import { useState, useEffect } from "react";
import { decomposeTimestamp, recomposeTimestamp } from "./utils";

export function ScaleInput(props: {value: number, onChanged?: (ms: number) => void}) {
    const s_unit = 1000;
    const mn_unit = s_unit * 60;
    const h_unit = mn_unit * 60;
    const d_unit = h_unit * 24;
    
    const {days: initDays, hours: initHours, minutes: initMinutes} = decomposeTimestamp(props.value);

    const [days, setDays] = useState(initDays);
    const [hours, setHours] = useState(initHours);
    const [minutes, setMinutes] = useState(initMinutes);

    useEffect(() => {
        const {days, hours, minutes} = decomposeTimestamp(props.value);
        setDays(days); setHours(hours); setMinutes(minutes);
    }, [props.value]);
    
    useEffect(() => {
        props.onChanged?.(
            recomposeTimestamp({days, hours, minutes})
        )
    }, [days, hours, minutes])

    return <div className="flex flex-row align-center space-x-2">
        <div>
            <label className="mr-2">Jour: </label>
            <input className="w-12" name="days" type="number" value={days} onChange={(e) => setDays(e.target.valueAsNumber)}/>
        </div>
        <div>
            <label className="mr-2">Heures: </label>
            <input className="w-12" name="hours" type="number" value={hours} onChange={(e) => setHours(e.target.valueAsNumber)}/>
        </div>
        <div>   
            <label className="mr-2">Minutes: </label>
            <input className="w-12" name="minutes" type="number" value={minutes} onChange={(e) => setMinutes(e.target.valueAsNumber)}/>
        </div>

    </div>
}