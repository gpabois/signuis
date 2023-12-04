import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, Square3Stack3DIcon } from "@heroicons/react/20/solid";
import { useScale } from "./hooks/useScale";
import { useInterval } from "./hooks/useInterval";
import { useTick } from "./hooks/useTick";
import { Ticks } from "./Ticks";
import { Slider } from "./Slider";
import { Period } from "./TimelinePeriod";
import { ScaleInput } from "./ScaleInput";
import "./style.css"

enum TimelineMode {
    Default = "default",
    Shift = "shift",
}

export {TimelinePeriod} from './TimelinePeriod';

export interface TimelineProps {
    from?: Date,
    to?: Date,
    /**
     * Scale in miliseconds
     */
    scale?: number,
    resolution?: number,
    onChange?: (value: {from: Date, to: Date}) => void,
    onBoundsChange?: (value: {from: Date, to: Date}) => void,
    onScaleChange?: (value: number) => void,
    loading?: boolean,
    children?: ReactNode
};

export function Timeline(props: TimelineProps) {
    const container = useRef<HTMLDivElement>(null);
    
    // Geometry-related attributes
    const [width, setWidth] = useState(0);
    const [origin, setOrigin] = useState(0);
    
    // Compute the time ticks
    const [mode, setMode] = useState<TimelineMode>(TimelineMode.Default);

    // From, and to
    const [from, setFrom] = useState(props.from || new Date(Date.now() - 24 * 60 * 60 * 1000));
    const [to, setTo] = useState(props.to || new Date(Date.now()));
    const bounds = {to, from}

    // Selected tick range
    const [selectedFrom, setSelectedFrom] = useState(10);
    const [selectedTo, setSelectedTo] = useState(20);
    const selectedTickRange = {
        from: selectedFrom,
        to: selectedTo
    };

    // Scale-related elements
    const [scale, setScale] = useScale({scale: props.scale || 15 * 60 * 1000, width, bounds});
    const [resolution, setResolution] = useState(props.resolution || 4)

    // Interval
    const interval = useInterval({bounds});

    // Value of the first tick.
    const tickContext = useTick({width, scale, origin, bounds, resolution})

    const zoomOut = () => {
        const pivot = new Date(from.getTime() + interval / 2);
        
        const newInterval = interval * 2;
        const newScale = scale * 2;

        const newFrom = new Date(pivot.getTime() - newInterval / 2);
        const newTo = new Date(pivot.getTime() + newInterval / 2);

        setFrom(newFrom);
        setTo(newTo);
        setScale(newScale);
    }

    const zoomIn = () => {
        const pivot = new Date(from.getTime() + interval / 2);
        
        const newInterval = interval / 2;
        const newScale = scale / 2;

        const newFrom = new Date(pivot.getTime() - newInterval / 2);
        const newTo = new Date(pivot.getTime() + newInterval / 2);

        setFrom(newFrom);
        setTo(newTo);
        setScale(newScale);
    }

    function shift(ms: number) {
        setTo((to) => new Date(to.getTime() + ms))
        setFrom((from) => new Date(from.getTime() + ms))
    }

    const onRangeChange = ({from, to}: {from: number, to: number}) => {
        setSelectedFrom(from);
        setSelectedTo(to);
    }

    useEffect(() => {
        const value = {
            from: tickContext.get(selectedTickRange.from),
            to: tickContext.get(selectedTickRange.to)
        };
        props.onChange?.(value);
    }, [to, from, selectedTickRange.from, selectedTickRange.to, scale])

    // Recompute scaling to ensure there is not inadequate scaling while changing intervals
    useEffect(() => setScale(scale), [from, to, scale])
    useEffect(() => props.onScaleChange?.(scale), [scale])
    useEffect(() => props.onBoundsChange?.({from, to}), [from, to])

    // Bind width and origin, so it can be updated if the container's geometry has changed.
    useEffect(() => {
        const observer = new ResizeObserver(_ => {
            if(!container.current) return;
            
            setWidth(container.current.getBoundingClientRect().width)
            setOrigin(container.current.getBoundingClientRect().left);
        })

        if(container.current)
        {
            setWidth(container.current.getBoundingClientRect().width)
            setOrigin(container.current.getBoundingClientRect().left);
            
            observer.observe(container.current)
        }

        return () => {container.current && observer.unobserve(container.current)}
    });

    // Bind control events to slide the timeline.
    useEffect(() => {
        const onMouseUp = (e: MouseEvent) => {
            setMode(TimelineMode.Default);
        }
        
        const onMouseMove = (e: MouseEvent) => {
            if(mode != TimelineMode.Shift) 
                return;

            e.preventDefault();

            // Shift resolution in minutes
            const shiftMs = e.movementX * scale / 10;
            shift(shiftMs);
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mousemove", onMouseMove);
        }
    })

    // Transform direct period props
    const periods = useMemo(() => {
        const children = props.children ? (Array.isArray(props.children) ? props.children : [props.children]) : [];

        return children
            .filter((c) => c !== undefined)
            .filter(({props}) => props.to?.getTime() >= from.getTime() && props.from.getTime() <= to.getTime()) 
            .map(({props, key}) => ({key, props: {
                from: props.from,
                to: props.to,
                context: tickContext,
                children: props.children,
            }}))
    }, [props.children, from, to, tickContext])

    return <div className="w-full h-full">
        <div ref={container} className="w-full h-full border-2 border-gray-300 bg-gray-100 relative">
            <Ticks context={tickContext} />
            <Slider context={tickContext} from={0} to={10} onChange={onRangeChange} />
            {periods.map(({props, key}) => <Period key={key} {...props} />)}
            <div onMouseDown={(e) => {e.preventDefault(); setMode(TimelineMode.Shift)}} className="absolute w-full h-full inset-0 z-10">
                {props.loading && <div className="inset-0 loading w-10 bg-slate-600 h-full absolute"></div>}
            </div>
        </div>
        <div className="mt-2 p-1 flex flex-row w-full border-gray-300 bg-gray-100">
            <div className="rounded bg-gray-100">
                <input 
                    type="datetime-local" 
                    value={from.toISOString().slice(0,-8)} 
                    onChange={e => {
                        setFrom((_) => new Date(e.target.value))
                    }}
                />
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-row items-center">
                <button className="p-1 bg-gray-100" onClick={(_) => shift(-scale)}><ArrowLeftIcon className="h-4 w-4"/></button>
                <button className="p-1 bg-gray-100" onClick={zoomOut}><MagnifyingGlassMinusIcon className="h-4 w-4"/></button>
                <button className="p-1 bg-gray-100" onClick={zoomIn}><MagnifyingGlassPlusIcon className="h-4 w-4"/></button>
                <button className="p-1 bg-gray-100" onClick={(_) => shift(scale)}><ArrowRightIcon className="h-4 w-4"/></button>
                <div className="flex flex-row items-center">
                    <button><Square3Stack3DIcon onClick={(_) => setScale(scale)} className="w-4 h-4"></Square3Stack3DIcon></button>
                    <ScaleInput value={scale} onChanged={setScale}/>
                </div>
                
            </div>
            <div className="flex-1"></div>
            <div className="bg-gray-100 rounded">
                <input 
                    type="datetime-local" 
                    value={to.toISOString().slice(0, 16)} 
                    onChange={e => {
                        setTo((_) => new Date(e.target.value))
                    }}
                />
            </div>
        </div>
    </div>
}