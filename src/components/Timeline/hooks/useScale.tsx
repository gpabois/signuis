import { useEffect, useState } from "react";
import { computeInterval, computeTickCount, computeTickSize, reverseComputeScale, reverseComputeTickCount } from "../utils";
import { DateBounds } from "../model";

// Minimal tick size : 10 px;
const MIN_TICK_SIZE = 15;

export type UseScaleArgs = {
    scale: number,
    width: number,
    bounds: DateBounds,
    onChanged?: (scale: number) => void
}

export function useScale(args: UseScaleArgs): [number, (scale: number) => void, () => void] {
    const [scale, _setScale] = useState(args.scale);

    function computeMinimalScale(args: UseScaleArgs) {
        const interval  = computeInterval(args.bounds);
        
        // ms per pixels;
        const mspms = interval / args.width;

        // Ticks per miliseconds
        return Math.round(MIN_TICK_SIZE * mspms);
    }

    function controlScale(scale: number, args: UseScaleArgs): number {
        if(args.width == 0) return scale;
        const minScale = computeMinimalScale( args)
        return Math.max(scale, minScale);
    }

    const autoScale = () => {
        setScale(computeMinimalScale(args));
    }

    const setScale = (newScale: number, notify: boolean = true) => {
        newScale = controlScale(newScale, args);
        
        if(newScale != scale) {
            _setScale(newScale);
            notify && args.onChanged?.(newScale);
        }
    }

    // Update on value change
    useEffect(() => setScale(args.scale, false), [args.scale])
    useEffect(() => setScale(scale, true), [args.bounds, args.width])

    return [scale, setScale, autoScale];
}