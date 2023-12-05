import { useState, useEffect, useMemo } from "react";
import { TickContext } from "../model";
import { computeInterval, computeTickCount, computeTickSize, computeOffset } from "../utils";
import { useInterval } from "./useInterval";


export type UseTickArgs =  {width: number, origin: number, resolution: number, scale: number, bounds: {to: Date, from: Date}}
/**
 * Tick-related hook
 * @param args 
 */
export function useTick({width, scale, bounds, resolution, origin}: UseTickArgs): TickContext {
    const count = useMemo(() => {
        const interval = computeInterval(bounds);
        return computeTickCount({interval, scale})
    }, [bounds, scale]);

    const size = useMemo(() => computeTickSize({width, count}), [width, count]);
    const offset = useMemo(() => computeOffset({from: bounds.from, scale, size}), [bounds.from, scale, size]);
    const from = useMemo(() => ({
        index: 0,
        value: scale == 0 ? bounds.from : new Date(Math.round(bounds.from.getTime() / scale) * scale)
    }), [scale, bounds.from]);
    const to = useMemo(() => {
        const index = (scale == 0 || width == 0) ? count - 1 : count - 1
        const value = scale == 0 ? bounds.to : new Date(from.value.getTime() + scale * index);
        return {index, value}  
    }, [width, scale, count, bounds.to, from])
    const full = useMemo(() => resolution * scale, [resolution, scale]);

    const withinRange = useMemo(() => ((index: number) => Math.min(Math.max(from.index, index), to.index)), [scale, to, from])
    const get = useMemo(() => ((tickIndex: number): Date => new Date(from.value.getTime() + tickIndex * scale)), [scale, from])
    const nearest = useMemo(() => ((value: Date): number => {
        const dt = value.getTime() - from.value.getTime();
        const i = Math.round(dt / scale);
        return withinRange(i)
    }), [from, scale])
    const position = useMemo(() => ((tickIndex: number) => offset + size * tickIndex), [offset, size])
    
    const useGet = (index: number) => {
        return useMemo(() => get(index), [index, get])
    }
    const usePosition = (index: number) => {
        return useMemo(() => position(index), [index, position])
    }
    const useNearest = (value: Date) => {
        return useMemo(() => nearest(value), [value, nearest])
    }
    return {
        scale, resolution, origin, count, size, offset, from, to, full, get, nearest, position,
        useGet, usePosition, useNearest
    }
}