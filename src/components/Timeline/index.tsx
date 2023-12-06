import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, ArrowsPointingOutIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, Square3Stack3DIcon } from "@heroicons/react/20/solid";
import { Ticks } from "./Ticks";
import { Slider } from "./Slider";
import { Period } from "./TimelinePeriod";
import { ScaleInput } from "./ScaleInput";
import "./style.css"
import { useTimelineContext } from "./hooks/useContext";
import { computeInterval } from "./utils";
import { useScale } from "./hooks/useScale";
import { useBounds } from "./hooks/useBounds";
import { DateBounds } from "./model";

enum TimelineMode {
    Default = "default",
    Shift = "shift",
}

export {TimelinePeriod} from './TimelinePeriod';

export interface TimelineProps {
    bounds: {from: Date, to: Date};
    value?: {from: Date, to: Date};
    /**
     * Scale in miliseconds
     */
    scale: number,
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
    const [width, setWidth]     = useState(0);
    const [origin, setOrigin]   = useState(0);
    
    const [mode, setMode] = useState<TimelineMode>(TimelineMode.Default);

    // Value
    const [value, setValue] = useState(props.value);
    useEffect(() => setValue(props.value), [props.value]);
    const updateValue = (value: DateBounds, notify: boolean = true) => {
        setValue(value);
        notify && props.onChange?.(value);
    }

    // Bounds
    const [bounds, setBounds] = useBounds({
        value: props.bounds,
        onChanged: props.onBoundsChange
    })

    const updateBounds = ({from, to}: {from?: Date, to?: Date}) => {
        setBounds({
            to: to || bounds.to,
            from: from || bounds.from
        })
    }

    // Scale-related elements
    const [scale, setScale] = useScale({scale: props.scale, width, bounds, onChanged: props.onScaleChange});
    const [resolution, _] = useState(props.resolution || 4)

    const timelineContext = useTimelineContext({bounds, width, origin})
    
    // Interval
    const interval = useMemo(() => computeInterval(bounds), [bounds]);

    const setValueToEntireBounds = () => {
        updateValue(bounds);
    }
    const zoomOut = () => {
        const pivot = new Date(bounds.from.getTime() + interval / 2);
        
        const newInterval = interval * 2;
        const newScale = scale * 2;

        const from = new Date(pivot.getTime() - newInterval / 2);
        const to = new Date(pivot.getTime() + newInterval / 2);

        setBounds({from, to})
        setScale(newScale);
    }

    const zoomIn = () => {
        const pivot = new Date(bounds.from.getTime() + interval / 2);
        
        const newInterval = interval / 2;
        const newScale = scale / 2;

        const from = new Date(pivot.getTime() - newInterval / 2);
        const to = new Date(pivot.getTime() + newInterval / 2);

        setBounds({from, to})
        setScale(newScale);
    }

    function shift(ms: number) {
        setBounds({
            to: new Date(bounds.to.getTime() + ms),
            from: new Date(bounds.from.getTime() + ms)
        })
    }

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
    }, [props.children, bounds])

    return <div className="w-full h-full">
        <div ref={container} className="w-full h-full border-2 border-gray-300 bg-gray-100 relative">
            <Ticks 
                usePosition={timelineContext.use.position} 
                scale={scale}
                resolution={resolution}
                bounds={bounds}
            />
            <Slider 
                bounds={bounds}
                useGeometryBounds={timelineContext.use.geometryBounds} 
                reverse={timelineContext.reverse} 
                value={value} 
                onChange={updateValue} 
            />
            {periods.map(({props, key}) => <Period key={key} {...props} useGeometryBounds={timelineContext.use.geometryBounds} />)}
            <div onMouseDown={(e) => {e.preventDefault(); setMode(TimelineMode.Shift)}} className="absolute w-full h-full inset-0 z-10">
                {props.loading && <div className="inset-0 loading w-10 bg-slate-600 h-full absolute"></div>}
            </div>
        </div>
        <div className="mt-2 p-1 flex flex-row w-full border-gray-300 bg-gray-100">
            <div className="rounded bg-gray-100">
                <input 
                    type="datetime-local" 
                    value={bounds.from.toISOString().slice(0,-8)} 
                    onChange={e => {
                        updateBounds({from: new Date(e.target.value)})
                    }}
                />
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-row items-center">
                <button className="p-1 bg-gray-100" onClick={(_) => shift(-scale)}><ArrowLeftIcon className="h-4 w-4"/></button>
                <button className="p-1 bg-gray-100" onClick={(_) => setValueToEntireBounds()}><ArrowsPointingOutIcon className="h-4 w-4"/></button>
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
                    value={bounds.to.toISOString().slice(0, 16)} 
                    onChange={e => {
                       updateBounds({to: new Date(e.target.value)})
                    }}
                />
            </div>
        </div>
    </div>
}