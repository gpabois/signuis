import React, { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "./common/Button";

enum SliderMode {
    Default = "default",
    MoveTo = "move-to",
    MoveFrom = "move-from"
}

enum TimelineMode {
    Default = "default",
    Shift = "shift",
}

function Slider(props: {size: number, count: number, from: number, to: number, origin: number, offset: number}) {
    const [mode, setMode] = useState<SliderMode>(SliderMode.Default);
    const [to, setTo] = useState(props.to);
    const [from, setFrom] = useState(props.from);
    
    const left = useMemo(() => {
        return Math.round(from * props.size + props.origin + props.offset)
    }, [props.size, props.origin, props.offset, from])

    const width = useMemo(() => {
        return (to - from) * props.size 
    }, [props.size, to, from]);

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

function Tick(props: {value: Date, scale: number, position: number, size: number, full: boolean}) {
    const label = useRef<HTMLElement>(null);

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
        <div style={{width: '1px', left: props.position}} className={`${props.full ? "h-2/6": "h-1/6"} bg-gray-500 absolute`}>
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

function Ticks(props: {full: number, scale: number, from: Date, count: number, origin: number, offset: number, size: number, width: number}) {
    const fitFrom = Math.round(props.from.getTime() / props.scale) * props.scale;
    
    const [count, setCount] = useState(props.count);
    const forEach = useMemo(() => Array.from(Array(count).keys()), [count])

    return <>
        {forEach.map(i => {
            const position = props.origin + props.offset + props.size * i;
            const value = new Date(fitFrom + props.scale * i);
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

export interface TimelineSliderProps {
    from?: Date,
    to?: Date,
    /**
     * Scale in miliseconds
     */
    scale?: number,
    resolution?: number,
    onValueChanged?: (value: {from: Date, to: Date}) => void
};

export function TimelineSlider(props: TimelineSliderProps) {
    const container = useRef<HTMLElement>(null);
    
    const [width, setWidth] = useState(0);
    const [origin, setOrigin] = useState(0);
    
    // Every 15 minutes
    const [scale, setScale] = useState(props.scale || 15 * 60 * 1000);
    const [resolution, setResolution] = useState(props.resolution || 4)
    const full = useMemo(() => scale * resolution, [scale, resolution])
    
    const [from, setFrom] = useState(props.from || new Date(Date.now() - 24 * 60 * 60 * 1000));
    const [to, setTo] = useState(props.to || new Date(Date.now()));
    
    // Interval
    const interval = useMemo(() => (to.getTime() - from.getTime()), [to, from]);
    const tickCount = useMemo(() => Math.round(interval / scale), [interval, scale]);

    // Compute the time ticks
    const [mode, setMode] = useState<TimelineMode>(TimelineMode.Default);

    // Size of a tick in pixels.
    const tickSize = useMemo(() => {
        if(tickCount == 0) return 0;
        return Math.round(width / tickCount);
    }, [width, tickCount])

    // Offset
    const tickOffset = useMemo(() => {
        return Math.round(tickSize * Math.round((to.getTime() % scale) / scale))
    }, [to, scale, tickSize]);

    function zoomOut() {
        const pivot = new Date(from.getTime() + interval / 2);
        
        const newInterval = interval * 2;
        const newScale = scale * 2;

        const newFrom = new Date(pivot.getTime() - newInterval / 2);
        const newTo = new Date(pivot.getTime() + newInterval / 2);

        setFrom(newFrom);
        setTo(newTo);
        setScale(newScale);
    }

    function zoomIn() {
        const pivot = new Date(from.getTime() + interval / 2);
        
        const newInterval = interval / 2;
        const newScale = scale / 2;

        const newFrom = new Date(pivot.getTime() - newInterval / 2);
        const newTo = new Date(pivot.getTime() + newInterval / 2);

        setFrom(newFrom);
        setTo(newTo);
        setScale(newScale);
    }

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

    useEffect(() => {
        function onMouseUp(e: MouseEvent) {
            setMode(TimelineMode.Default);
        }
        
        function onMouseMove(e: MouseEvent) {
            if(mode != TimelineMode.Shift) 
                return;

            e.preventDefault();

            // Shift resolution in minutes
            const shiftMns = e.movementX * scale / 10;

            setTo((to) => new Date(to.getTime() + shiftMns))
            setFrom((from) => new Date(from.getTime() + shiftMns))
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mousemove", onMouseMove);
        }
    })

    return <div className="p-2 w-full h-full">
        <div ref={container} className="w-full h-full border-2 border-gray-300 bg-gray-100 relative">
            <Ticks width={width} full={full} size={tickSize} scale={scale} count={tickCount} from={from} origin={origin} offset={tickOffset}/>
            <Slider 
                size={tickSize}
                origin={origin} 
                offset={tickOffset} 
                count={tickCount} 
                from={10} 
                to={20}
            />
            <div onMouseDown={(e) => {e.preventDefault(); setMode(TimelineMode.Shift)}} className="absolute w-full h-full inset-0 z-0">
            </div>
        </div>
        <div className="flex flex-row w-full">
            <div className="rounded">
                <input 
                    type="datetime-local" 
                    value={from.toISOString().slice(0, 16)} 
                    onChange={e => e.target.valueAsDate && setFrom((_) => e.target.valueAsDate!)}
                />
            </div>
            <div className="flex-1"></div>
            <div>
                <button onClick={zoomOut}>Zoom out</button>
            </div>
            <div className="flex-1"></div>
            <div>
                <input 
                    type="datetime-local" 
                    value={to.toISOString().slice(0, 16)} 
                    onChange={e => e.target.valueAsDate && setTo((_) => e.target.valueAsDate!)}/>
            </div>
        </div>
    </div>
}