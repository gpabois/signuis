import { useMemo, useRef, useState, useEffect } from "react";
import { DateBounds, TickContext } from "./model";
import { UseGeometryBoundsHook, UsePositionHook } from "./hooks/useContext";

/**
 * A tick on the timeline
 * @param props 
 * @returns 
 */
function Tick({usePosition, value, scale, resolution}: TickProps) {
    const left = usePosition(value)
    const label = useRef<HTMLDivElement>(null);

    const [marginLeft, setMarginLeft] = useState(0);
    const [top, setTop] = useState(0);

    const isFull = useMemo(() => value.getTime() % (resolution * scale) == 0, [resolution, scale, value]);

    useEffect(() => {
        const observer = new ResizeObserver(_ => {
            if(!label.current)
                return;
            
            setTop(-label.current.getBoundingClientRect().height);
            setMarginLeft(-label.current.getBoundingClientRect().width / 2);
        })

        if(label.current)
        {
            setTop(-label.current.getBoundingClientRect().height);
            setMarginLeft(-label.current.getBoundingClientRect().width / 2);
            observer.observe(label.current)
        }

        return () => {label.current && observer.unobserve(label.current)}
      }, [label, value])

    const display = useMemo(() => {
        if(scale < 24 * 60 * 60 * 1000)
            return value.toLocaleTimeString("fr-fr")

        return value.toLocaleDateString("fr-fr")
    }, [value, scale]) 

    return <>
        <div style={{width: '1px', left}} className={`${isFull ? "h-2/6": "h-1/6"} z-20 bg-gray-500 absolute`}></div>
        {isFull && 
            <div ref={label} 
                style={{left, top, marginLeft}} 
                className="text-xs absolute bg-gray-100 hover:z-50 text-center -rotate-45">
                    {display}
            </div>
        }
    </>
}

 export interface TickProps {
    usePosition: UsePositionHook,
    value: Date,
    scale: number,
    resolution: number
 }
 export interface TicksProps {
    usePosition: UsePositionHook,
    scale: number,
    bounds: DateBounds,
    resolution: number
 }

 function generateTicks({bounds, scale, usePosition, resolution}: {usePosition: UsePositionHook, bounds: DateBounds, scale: number, resolution: number}): Array<TickProps> {
    let rem = bounds.from.getTime() % scale;
    const firstTickValue = bounds.from.getTime() + (scale - rem);
    rem = bounds.to.getTime() % scale;
    const lastTickValue = bounds.to.getTime() - rem;

    let ticks: Array<TickProps> = [];

    for(let cursor = firstTickValue; cursor <= lastTickValue; cursor = cursor + scale) {
        ticks.push({
            value: new Date(cursor),
            scale,
            usePosition,
            resolution
        })
    } 

    return ticks;
 }

/**
 * Display ticks
 * @param props 
 * @returns 
 */
export function Ticks({usePosition, scale, bounds, resolution}: TicksProps) {
    const [ticks, setTicks] = useState(generateTicks({scale, bounds, usePosition, resolution}))

    useEffect(() => setTicks(generateTicks({scale, bounds, usePosition, resolution})), [bounds, scale, resolution, usePosition])
    return <>
        {ticks.map(props => {
            return <Tick key={`tick-${props.value.getTime()}`} {...props} />
        }
)}
    </>
}
