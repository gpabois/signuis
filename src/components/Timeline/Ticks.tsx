import { useMemo, useRef, useState, useEffect } from "react";
import { TickContext } from "./model";

/**
 * A tick on the timeline
 * @param props 
 * @returns 
 */
function Tick({context, index}: {context: TickContext, index: number}) {
    const value = useMemo(() => context.get(index), [context, index]);
    const left =  useMemo(() => context.position(index), [context, index]);
    const label = useRef<HTMLDivElement>(null);

    const [marginLeft, setMarginLeft] = useState(0);
    const [top, setTop] = useState(0);

    const isFull = useMemo(() => index % context.resolution == 0, [index])

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
        if(context.scale < 24 * 60 * 60 * 1000)
            return value.toLocaleTimeString("fr-fr")

        return value.toLocaleDateString("fr-fr")
    }, [value, context.scale]) 

    return <>
        <div style={{width: '1px', left}} className={`${isFull ? "h-2/6": "h-1/6"} z-20 bg-gray-500 absolute`}></div>
        {isFull && 
            <div ref={label} 
                style={{left: left, top, marginLeft}} 
                className="text-xs absolute bg-gray-100 hover:z-50 text-center -rotate-45">
                    {display}
            </div>
        }
    </>
}

/**
 * Display ticks
 * @param props 
 * @returns 
 */
export function Ticks({context}: {context: TickContext}) {
    const forEach = useMemo(() => Array.from(Array(context.to.index + 1).keys()), [context.to.index])

    return <>
        {forEach.map(index => {
            const value    = context.get(index);
            return <Tick key={`tick-${value.getTime()}`} context={context} index={index} />
        }
)}
    </>
}
