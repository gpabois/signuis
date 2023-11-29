import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react"

export interface TimelineSliderProps {};

function Slider(props: {length: number, from: number, to: number, container?: HTMLElement}) {
    const mode: "default" | "move-to" | "move-from" = "default";

    const [to, setTo] = useState(props.to);
    const [from, setFrom] = useState(props.from);
    
    const left = useMemo(() => {
        return `${(100.0 / props.length) * from}%`
    }, [props.length, from])

    const width = useMemo(() => {
        return `${(100.0 / props.length) * (to - from)}%`;
    }, [props.length, to, from]);

    document.addEventListener('mousemove', (e) => {
        if(mode === "move-from") {

        }
    })
    function onFromMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if(!props.container) return;

        const scale = props.container.getBoundingClientRect().width / props.length; 
        const nearestTick = Math.floor((e.screenX - props.container.getBoundingClientRect().x) / scale);
        console.log(nearestTick)
    }

    return <div style={{width, left}} className="h-full flex flex-row">
            <div className="w-1 bg-green-600" onMouseMoveCapture={onFromMouseMove}></div>
            <div className="h-full grow bg-green-200 border-x-2 border-green-600">
            </div>
            <div className="w-1 bg-green-600"></div>
        </div>
}

function Track({children}: {children: ReactNode}) {
    return <div className="h-full w-full border-2 border-gray-800">

    </div>
}

function Tick(props: {children?: ReactNode, value: Date, index: number, length: number, full: boolean}) {
    let labelRef = useRef<HTMLElement>()

    const left = `${(100.0 / props.length) * props.index}%`
    const width = `${100.0 / props.length}%`;

    const [marginLeft, setMarginLeft] = useState(0)

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if(labelRef.current)
                setMarginLeft(-labelRef.current.offsetWidth / 2)
        })

        if(labelRef.current)
        {
            setMarginLeft(-labelRef.current.offsetWidth / 2);
            observer.observe(labelRef.current)
        }

        return () => labelRef.current && observer.unobserve(labelRef.current)
      }, [labelRef])

    return <>
        <div style={{width: '1px', left}} className={`${props.full ? "h-2/6": "h-1/6"} bg-gray-500 absolute`}>

        </div>
        {props.full && 
            <div ref={labelRef} 
                style={{left, marginLeft, bottom: '105%'}} 
                className="text-xs hover:text-sm absolute p-1 bg-gray-100">
                    {`${props.value.getHours()}`.padStart(2, '0')}:{`${props.value.getMinutes()}`.padStart(2, '0')}
            </div>
        }
    </>
}

export function TimelineSlider(props: TimelineSliderProps) {
    const container = useRef(null);

    // Every 15 minutes
    const scale = 15 * 60 * 1000;
    const full = 4;
    
    // Now - 24 hours
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Now
    const to = new Date(Date.now());
    
    // Interval
    const interval = (to.getTime() - from.getTime());

    // Compute the time ticks
    const nbOfTicks = Math.ceil(interval / scale);

    // Compute the ticks
    const ticks = Array.from(Array(nbOfTicks).keys()).map((index) => Tick({
        value: new Date(from.getTime() + index * scale),
        index,
        length: nbOfTicks,
        full: (index % full == 0)
    }))

    return <div ref={container} className="flex flex-row w-full h-full m-4 border-2 border-gray-300 bg-gray-100 relative">
        {ticks}
        <Slider container={container.current == null ? undefined : container.current} length={nbOfTicks} from={10} to={20}></Slider>
    </div>
}