import { useState, useEffect, useMemo } from "react";
import { TickContext } from "../model";
import { computeInterval, computeTickCount, computeTickSize, computeOffset } from "../utils";
import { useInterval } from "./useInterval";

/**
 * Tick-related hook
 * @param args 
 */
export function useTick({scale, width, origin, resolution, bounds}: {width: number, origin: number, resolution: number, scale: number, bounds: {to: Date, from: Date}}): TickContext {
    const interval = useInterval({bounds});

    const [count, setCount] = useState(computeTickCount({interval, scale}));
    useEffect(() => setCount(computeTickCount({interval, scale})), [interval, scale]);

    const [size, setSize] = useState(computeTickSize({width, count}));
    useEffect(() => setSize(computeTickSize({width, count})), [width, count]);
    
    const [offset, setOffset] = useState(computeOffset({from: bounds.from, scale, size}));
    useEffect(() => setOffset(computeOffset({from: bounds.from, scale, size})), [bounds.from, scale, size]);

    const [fromValue, setFromValue] = useState(scale == 0 ? bounds.from : new Date(Math.round(bounds.from.getTime() / scale) * scale));
    useEffect(() => setFromValue(scale == 0 ? bounds.from : new Date(Math.round(bounds.from.getTime() / scale) * scale)), [bounds.from, scale]);
    
    const [toIndex, setToIndex] = useState((scale == 0 || width == 0) ? count - 1 : Math.ceil(width / scale) - 1)
    useEffect(() => setToIndex((size == 0 || width == 0) ? count - 1 : Math.ceil((width - offset) / size) - 1), [width, size, count]);

    const [toValue, setToValue] = useState(scale == 0 ? bounds.to : new Date(Math.round(bounds.from.getTime() / scale) * scale * toIndex));
    useEffect(() => setToValue(scale == 0 ? bounds.to : new Date(fromValue.getTime() + scale * toIndex)), [toIndex, scale, bounds.to])


    const context = {
        count,
        size,
        scale,
        origin,
        offset,
        resolution,
        full: () => resolution * scale,
        from: {
            index: 0,
            value: fromValue
        },
        to: {
            index: toIndex,
            value: toValue
        }
    }

    const withinRange = (index: number) => Math.min(Math.max(context.from.index, index), context.to.index);
    const get = (tickIndex: number): Date => new Date(context.from.value.getTime() + tickIndex * context.scale)
    const nearest = (value: Date): number => withinRange(Math.floor((value.getTime() - context.from.value.getTime()) / context.scale))
    const position =  (tickIndex: number) => Math.ceil(tickIndex * context.size + context.offset)
    
    return {
        ...context,
        get,
        nearest,
        position
    }
}