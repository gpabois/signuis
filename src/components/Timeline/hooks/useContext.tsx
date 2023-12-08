import { useEffect, useMemo, useState } from "react";
import { DateBounds } from "../model";

export type UseGeometryBoundsHook = (value?: DateBounds) => {bounds?: {from: number, to: number}}
export type UsePositionHook = (value: Date) => number;
export type ReverseFunc = (position: number) => Date;

const generateUsePosition = ({bounds, width, ppms}: {bounds: DateBounds, width: number, ppms: number}): UsePositionHook => {
    return ((value: Date) => {
        if(value === undefined) return 0;

        const pos = Math.round((value.getTime() - bounds.from.getTime()) * ppms)

        if(pos < 0) return 0;
        if(pos > width) return width;

        return pos
    })
}

const generateGeometryBounds = ({ppms, usePosition}: {usePosition: UsePositionHook, ppms: number}): UseGeometryBoundsHook => {
    return ((value?: DateBounds) => {
        if(!value) return {}

        const to = Math.round(value.to.getTime() * ppms);
        
        return {
            bounds: {
                from: usePosition(value.from),
                to: usePosition(value.to)
            }
        }
    })
}

const generateReverse = ({origin, ppms, bounds}: {bounds: DateBounds, ppms: number, origin: number}): ReverseFunc => {
    return ((position: number): Date => {
        const dt = (position - origin) / ppms;
        return new Date(bounds.from.getTime() + dt)
    })
}

export function useTimelineContext({bounds, width, origin}: {bounds: DateBounds, width: number, origin: number}) {
    const interval = bounds.to.getTime() - bounds.from.getTime();
    const ppms = width / interval;

    const [usePosition, setUsePosition] = useState<UsePositionHook>(() => generateUsePosition({bounds, width, ppms}));
    const [useGeometryBounds, setUseGometryBounds] = useState<UseGeometryBoundsHook>(() => generateGeometryBounds({usePosition, ppms}));
    const [reverse, setUseReverse] = useState<ReverseFunc>(() => generateReverse({origin, ppms, bounds}))

    useEffect(() => {
        const interval = bounds.to.getTime() - bounds.from.getTime();
        const ppms = width / interval;

        const usePosition = generateUsePosition({bounds, width, ppms});
        const useGeometryBounds = generateGeometryBounds({ppms, usePosition});
        const reverse = generateReverse({origin, ppms, bounds});

        setUsePosition(() => usePosition);
        setUseGometryBounds(() => useGeometryBounds);
        setUseReverse(() => reverse);

    }, [bounds, width, origin])

    return {use: {position: usePosition, geometryBounds: useGeometryBounds}, reverse}
}