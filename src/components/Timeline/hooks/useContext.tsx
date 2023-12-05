import { useMemo } from "react";
import { DateBounds } from "../model";

export type UseGeometryBoundsHook = (value?: DateBounds) => {bounds?: {from: number, to: number}}
export type UsePositionHook = (value: Date) => number;
export type ReverseFunc = (position: number) => Date;

export function useTimelineContext({bounds, width, origin}: {bounds: DateBounds, width: number, origin: number}) {
    const interval = useMemo(() => bounds.to.getTime() - bounds.from.getTime(), [bounds]);
    const ppms = useMemo(() => width / interval , [interval, width]);
    
    const usePosition = (value: Date) => useMemo(() =>{
        const pos = Math.round((value.getTime() - bounds.from.getTime()) * ppms)

        if(pos < 0) return 0;
        if(pos > width) return width;

        return pos
    }, [width, ppms, value, bounds]);


    const useGeometryBounds = (value?: DateBounds) => {
        if(!value) return {}

        const to = Math.round(value.to.getTime() * ppms);
        return {
            bounds: {
                from: usePosition(value.from),
                to: usePosition(value.to)
            }
        }
    }

    const reverse = useMemo(() => ((position: number): Date => {
        const dt = (position - origin) / ppms;
        return new Date(bounds.from.getTime() + dt)
    }), [bounds.from])

    return {use: {position: usePosition, geomtryBounds: useGeometryBounds}, reverse}
}