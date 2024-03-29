import { useState, useMemo, useEffect } from "react";
import { DateBounds, TickContext } from "./model";
import { useDebounce } from 'usehooks-ts'
import { ReverseFunc, UseGeometryBoundsHook } from "./hooks/useContext";

enum SliderMode {
    Default = "default",
    MoveTo = "move-to",
    MoveFrom = "move-from",
    Shift = "shift"
}

export type SliderProps = {
    bounds: DateBounds,
    useGeometryBounds: UseGeometryBoundsHook,
    reverse: ReverseFunc,
    value?: DateBounds,
    onChange?: (value: {from: Date, to: Date}) => void
}

/**
 * Slider to select time-range
 * @param props 
 * @returns 
 */
export function Slider({value: initialValue, bounds, useGeometryBounds, reverse, onChange}: SliderProps) {
    const [mode, setMode] = useState<SliderMode>(SliderMode.Default);
    const [value, setValue] = useState(initialValue || bounds);

    const {bounds: rectangle} = useGeometryBounds(value);
    
    const left = useMemo(() => rectangle?.from, [rectangle]);
    const width = useMemo(() =>  rectangle && (rectangle.to - rectangle.from), [rectangle]);

    const updateRange = (newRange: {from?: Date, to?: Date}, notify: boolean = true) => {   
        setValue((r) => {
            const range = {
                to: newRange.to || r.to,
                from: newRange.from || r.from
            }
            notify && onChange?.(range)
            return range;
        })
    }

    // Notify range change
    useEffect(() => updateRange(initialValue || bounds, false), [initialValue])

    // Bind controls to slide the range
    useEffect(() => {
        const onFocusOut = (e: any) => setMode(SliderMode.Default);
        const onMouseUp = (e: MouseEvent) => setMode(SliderMode.Default);
        const onMouseMove = (e: MouseEvent) => {
            if(mode == SliderMode.Default) return;
            
            e.preventDefault();
    
            const newValue = reverse(e.clientX);
            
            if(mode == SliderMode.MoveFrom) {
                updateRange({from: newValue})
            } else if(mode == SliderMode.MoveTo) {
                updateRange({to: newValue})
            } else {
                const dt = reverse(e.clientX).getTime() - value.from.getTime();
                const newValue = {
                    from: new Date(value.from.getTime() + dt),
                    to: new Date(value.to.getTime() + dt)
                }

                updateRange(newValue);
            }
        }
        window.addEventListener("mouseup",      onMouseUp);
        window.addEventListener('mousemove',    onMouseMove);
        window.addEventListener('focusout',     onFocusOut)

        return () => {
            window.removeEventListener('mouseup',   onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        }
    }, [mode])

    return <div style={{width, left}} className="h-full flex flex-row relative z-20">
            <div className="w-1 hover:w-2 hover:cursor-col-resize bg-gray-600" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.MoveFrom)}}></div>
            <div className="h-full w-full slider" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.Shift)}}></div>
            <div className="w-1 hover:cursor-col-resize hover:w-2 bg-gray-600" onMouseDown={(e) => {e.preventDefault(); setMode(SliderMode.MoveTo)}}></div>
        </div>
}

