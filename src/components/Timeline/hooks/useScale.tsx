import { useState } from "react";
import { computeInterval, computeTickCount, computeTickSize, reverseComputeScale, reverseComputeTickCount } from "../utils";

// Minimal tick size : 10 px;
const TICK_SIZE_MINIMAL_SIZE = 10;

export function useScale({scale: initialScale, width, bounds: {to, from}}: {width: number, scale: number, bounds: {from: Date, to: Date}}): [number, (scale: number) => void] {
    const [scale, _setScale] = useState(initialScale);

    function controlScale(scale: number): number {
        if(width == 0) return scale;

        const interval  = computeInterval({from, to});
        const tickCount = computeTickCount({interval, scale});
        const tickSize  = computeTickSize({width, count: tickCount});

        // If tick size is below threshold, reverse compute scale so it can fit.
        if(tickSize < TICK_SIZE_MINIMAL_SIZE) {
            const idealTickCount = reverseComputeTickCount({width, tickSize: TICK_SIZE_MINIMAL_SIZE});
            scale = reverseComputeScale({interval, tickCount: idealTickCount});
        }
        
        return scale
    }

    const setScale = (scale: number) => {
        scale = controlScale(scale)
        _setScale(scale);
        return scale;
    }

    return [scale, setScale];
}