import React, { ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "./common/Button";
import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, Square3Stack3DIcon } from "@heroicons/react/20/solid";

// Minimal tick size : 10 px;
const TICK_SIZE_MINIMAL_SIZE = 10;

enum SliderMode {
    Default = "default",
    MoveTo = "move-to",
    MoveFrom = "move-from"
}

enum TimelineMode {
    Default = "default",
    Shift = "shift",
}

/**
 * Slider to select time-range
 * @param props 
 * @returns 
 */
function Slider(props: {size: number, count: number, from: number, to: number, origin: number, offset: number, onChange?: (value: {from: number, to: number}) => void}) {
    const [mode, setMode] = useState<SliderMode>(SliderMode.Default);
    const [to, _setTo] = useState(props.to);
    const [from, _setFrom] = useState(props.from);
    
    const left = useMemo(() => {
        return Math.round(from * props.size + props.origin + props.offset)
    }, [props.size, props.origin, props.offset, from])

    const width = useMemo(() => {
        return (to - from) * props.size 
    }, [props.size, to, from]);

    const setTo = (to: number) => {
        if(to < from) to = from + 1;
        if(to >=  props.count) to = props.count - 1;
        _setTo(to);
    }

    const setFrom = (from: number) => {
        if(from > to) from = to - 1;
        if(from < 0) from = 0;
        _setFrom(from);
    }

    // Notify range change
    useEffect(() => props.onChange?.({from, to}), [from, to])

    // Bind controls to slide the range
    useEffect(() => {
        function onMouseUp(e: MouseEvent) {
            setMode(SliderMode.Default);
        }

        function onMouseMove(e: MouseEvent) {
            if(mode == SliderMode.Default)
                return;

            e.preventDefault();

            const nearestTick = Math.round((e.screenX - (props.origin + props.offset)) / props.size);

            if(mode == SliderMode.MoveFrom) {
                setFrom(nearestTick)
            } else {
                setTo(nearestTick);
            }
        }

        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener('mousemove',  onMouseMove);

        return () => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        }
    })


    return <div style={{width, left}} className="h-full flex flex-row relative z-20">
            <div className="w-1 hover:w-2 hover:cursor-col-resize bg-green-600" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.MoveFrom)}}></div>
            <div className="h-full opacity-20 grow bg-green-200 border-x-2 border-green-600">
            </div>
            <div className="w-1 hover:cursor-col-resize hover:w-2 bg-green-600" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.MoveTo)}}></div>
        </div>
}

/**
 * A tick on the timeline
 * @param props 
 * @returns 
 */
function Tick(props: {value: Date, scale: number, position: number, size: number, full: boolean}) {
    const label = useRef<HTMLDivElement>(null);

    const [marginLeft, setMarginLeft] = useState(0);
    const [top, setTop] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
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
      }, [label, props.value])

    const display = useMemo(() => {
        if(props.scale < 24 * 60 * 60 * 1000)
            return props.value.toLocaleTimeString("fr-fr")

        return props.value.toLocaleDateString("fr-fr")
    }, [props.value, props.scale]) 

    return <>
        <div style={{width: '1px', left: props.position}} className={`${props.full ? "h-2/6": "h-1/6"} z-20 bg-gray-500 absolute`}>
        </div>
        {props.full && 
            <div ref={label} 
                style={{left: props.position, top, marginLeft}} 
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
function Ticks(props: {full: number, scale: number, first: Date, count: number, origin: number, offset: number, size: number, width: number}) {
    const forEach    = useMemo(() => Array.from(Array(props.count).keys()), [props.count])

    return <>
        {forEach.map(i => {
            const position = props.origin + props.offset + props.size * i;
            const value = new Date(props.first.getTime() + props.scale * i);
            if(position > props.width) return <></>
            return <Tick key={`tick-${value.getTime()}`} 
                        scale={props.scale}
                        position={position} 
                        value={value}
                        size={props.size}
                        full={value.getTime() % props.full === 0}
                    />
        }
)}
    </>
}

function nearestTickByTime({scale, first, count, value}: {scale: number, first: Date, count: number, value: Date}): number {
    const tick = Math.floor((value.getTime() - first.getTime()) / scale)
    return Math.min(Math.max(tick, 0), count);
}

function recomposeTimestamp({days, hours, minutes}: {days: number, hours: number, minutes: number}): number {
    const s_unit = 1000;
    const mn_unit = s_unit * 60;
    const h_unit = mn_unit * 60;
    const d_unit = h_unit * 24; 

    return days * d_unit + hours * h_unit + minutes * mn_unit;
}
function decomposeTimestamp(value: number): {days: number, hours: number, minutes: number} {
    const s_unit = 1000;
    const mn_unit = s_unit * 60;
    const h_unit = mn_unit * 60;
    const d_unit = h_unit * 24; 

    let days = Math.trunc(value / d_unit);
    value = value % d_unit;

    let hours = Math.trunc(value / h_unit);
    value = value % h_unit;

    let minutes = Math.trunc(value / mn_unit);
    value = value % mn_unit;

    return {days, hours, minutes}
}

function ScaleInput(props: {value: number, onChanged?: (ms: number) => void}) {
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

export interface TimelineSliderProps {
    from?: Date,
    to?: Date,
    /**
     * Scale in miliseconds
     */
    scale?: number,
    resolution?: number,
    onChanged?: (value: {from: Date, to: Date}) => void,
    children?: ReactNode
};

function Period(props: {size: number, count: number, from: number, to: number, origin: number, offset: number, children?: ReactNode}) {
    const left = useMemo(() => {
        return Math.round(props.from * props.size + props.origin + props.offset)
    }, [props.size, props.origin, props.offset, props.from])

    const width = useMemo(() => {
        return (props.to - props.from) * props.size 
    }, [props.size, props.to, props.from]);

    return <div style={{width, left}} className="h-full absolute z-0 inset-0">
        {props.children}
    </div>
}

export type TimelinePeriodProps = {from: Date, to: Date, children?: ReactNode};

export function TimelinePeriod(props: TimelinePeriodProps): ReactElement<TimelinePeriodProps> {
    return {
        type: "TimelinePeriod",
        props,
        key: null
    }
}

export function TimelineSlider(props: TimelineSliderProps) {
    const container = useRef<HTMLDivElement>(null);
    
    // Geometry-related attributes
    const [width, setWidth] = useState(0);
    const [origin, setOrigin] = useState(0);
    
    // From, and to
    const [from, setFrom] = useState(props.from || new Date(Date.now() - 24 * 60 * 60 * 1000));
    const [to, setTo] = useState(props.to || new Date(Date.now()));

    // Scale-related elements
    const [scale, _setScale] = useState(controlScale(props.scale || 15 * 60 * 1000));
    const [resolution, setResolution] = useState(props.resolution || 4)
    const full = useMemo(() => scale * resolution, [scale, resolution])

    // Interval
    const interval = useMemo(()  => computeInterval({to, from}), [to, from]);
    const tickCount = useMemo(() => computeTickCount({interval, scale}), [interval, scale, width]);

    // Compute the time ticks
    const [mode, setMode] = useState<TimelineMode>(TimelineMode.Default);

    // Size of a tick in pixels.
    const tickSize = useMemo(() => computeTickSize({width, tickCount}), [width, tickCount])

    // Value of the first tick.
    const firstTick = useMemo(() =>  new Date(Math.round(from.getTime() / scale) * scale), [scale, from]);

    // Offset
    const tickOffset = useMemo(() => {
        const scaleOffset = Math.round((to.getTime() % scale) / scale)
        return Math.round(tickSize * scaleOffset)
    }, [to, scale, tickSize]);

    function computeInterval({from, to}: {from: Date, to: Date}): number {
        return to.getTime() - from.getTime();
    }

    function computeTickCount({interval, scale}: {interval: number, scale: number}) {
        return Math.round(interval / scale);
    }

    function computeTickSize({width, tickCount}: {width: number, tickCount: number}): number {
        return tickCount == 0 ? 0 : Math.round(width / tickCount);
    }

    /**
     * Compute scale based on the interval, and the expected number of ticks.
     * @param param0 
     * @returns 
     */
    function reverseComputeScale({interval, tickCount}: {interval: number, tickCount: number}): number {
        return Math.round(interval / tickCount);
    }

    /**
     * Compute tick count, so the tick size is the expected one.
     * @param param0 
     */
    function reverseComputeTickCount({width, tickSize}: {width: number, tickSize: number}): number {
        return Math.round(width / tickSize);
    }

    function controlScale(scale: number): number {
        if(width == 0) return scale;

        const interval  = computeInterval({from, to});
        const tickCount = computeTickCount({interval, scale});
        const tickSize  = computeTickSize({width, tickCount});

        // If tick size is below threshold, reverse compute scale so it can fit.
        if(tickSize < TICK_SIZE_MINIMAL_SIZE) {
            const idealTickCount = reverseComputeTickCount({width, tickSize: TICK_SIZE_MINIMAL_SIZE});
            scale = reverseComputeScale({interval, tickCount: idealTickCount});
        }
        
        return scale
    }

    const setScale = (scale: number) =>  _setScale(controlScale(scale));
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
        const value = {
            from: new Date(firstTick.getTime() * from * scale),
            to: new Date(firstTick.getTime() * to * scale)
        };

        props.onChanged?.(value);
    }

    // Recompute scaling to ensure there is not inadequate scaling while changing intervals
    useEffect(() => setScale(scale), [from, to, scale])

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
        function onMouseUp(e: MouseEvent) {
            setMode(TimelineMode.Default);
        }
        
        function onMouseMove(e: MouseEvent) {
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
    const periodProps = useMemo(() => {
        const children = props.children ? (Array.isArray(props.children) ? props.children : [props.children]) : [];
        return children
            .filter(({props}) => props.to?.getTime() >= from.getTime() && props.from.getTime() <= to.getTime()) 
            .map(({props}) => ({
                from: nearestTickByTime({scale, first: firstTick, value: props.from, count: tickCount}),
                to: nearestTickByTime({scale, first: firstTick, value: props.to, count: tickCount}),
                size: tickSize,
                count: tickCount,
                origin,
                offset: tickOffset,
                children: props.children
            }))
    }, [props.children, from, to, tickSize, scale, tickOffset, tickCount, origin])

    return <div className="p-2 w-full h-full">
        <div ref={container} className="w-full h-full border-2 border-gray-300 bg-gray-100 relative">
            <Ticks 
                width={width} 
                full={full} 
                size={tickSize} 
                scale={scale} 
                count={tickCount} 
                first={firstTick} 
                origin={origin} 
                offset={tickOffset}
            />
            <Slider 
                size={tickSize}
                origin={origin} 
                offset={tickOffset} 
                count={tickCount} 
                from={10} 
                to={20}
            />
            {periodProps.map(props => <Period {...props}/>)}
            <div onMouseDown={(e) => {e.preventDefault(); setMode(TimelineMode.Shift)}} className="absolute w-full h-full inset-0 z-10">
            </div>
        </div>
        <div className="mt-2 p-1 flex flex-row w-full border-gray-300 bg-gray-100 ">
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
                    <button><Square3Stack3DIcon className="w-4 h-4"></Square3Stack3DIcon></button>
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