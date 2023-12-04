import { useState, useMemo, useEffect } from "react";
import { TickContext } from "./model";

enum SliderMode {
    Default = "default",
    MoveTo = "move-to",
    MoveFrom = "move-from"
}

/**
 * Slider to select time-range
 * @param props 
 * @returns 
 */
export function Slider({context, from: initialFrom, to: initialTo, onChange}: {context: TickContext, from: number, to: number, onChange?: (value: {from: number, to: number}) => void}) {
    const [mode, setMode] = useState<SliderMode>(SliderMode.Default);
    
    const [to, _setTo] = useState(initialTo);
    const [from, _setFrom] = useState(initialFrom);

    const left = useMemo(() => context.position(from), [context, from])
    const width = useMemo(() =>  (to - from) * context.size, [context, to, from]);

    const setTo = (to: number) => {
        if(to < from) to = from + 1;
        if(to >  context.to.index) to = context.to.index;
        _setTo(to);
    }

    const setFrom = (from: number) => {
        if(from > to) from = to - 1;
        if(from < context.from.index) from = context.from.index;
        _setFrom(from);
    }

    // Notify range change
    useEffect(() => onChange?.({from, to}), [from, to])

    // Control the range validity on change
    useEffect(() => {
        setFrom(from);
        setTo(to);
    }, [to, from, context])

    const onMouseUp = (e: MouseEvent) => setMode(SliderMode.Default);
    const onMouseMove = (e: MouseEvent) => {

        if(mode == SliderMode.Default) return;

        e.preventDefault();

        const componentX = (context.origin + context.offset);
        const absX = e.clientX - componentX;
        const nearestTick = Math.round(absX / context.size);
        

        if(mode == SliderMode.MoveFrom) {
            setFrom(nearestTick)
        } else {
            setTo(nearestTick);
        }
    }

    // Bind controls to slide the range
    useEffect(() => {
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener('mousemove',  onMouseMove);

        return () => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        }
    }, [context, from, to, mode])


    return <div style={{width, left}} className="h-full flex flex-row relative z-20">
            <div className="w-1 hover:w-2 hover:cursor-col-resize bg-green-600" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.MoveFrom)}}></div>
            <div className="h-full opacity-20 grow bg-green-200 border-x-2 border-green-600">
                
            </div>
            <div className="w-1 hover:cursor-col-resize hover:w-2 bg-green-600" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.MoveTo)}}></div>
        </div>
}

