
export function computeInterval({from, to}: {from: Date, to: Date}): number {
    return to.getTime() - from.getTime();
}

export function computeTickCount({interval, scale}: {interval: number, scale: number}) {
    return Math.round(interval / scale);
}

export function computeTickSize({width, count}: {width: number, count: number}): number {
    return count == 0 ? 0 : Math.round(width / count);
}

/**
 * Compute scale based on the interval, and the expected number of ticks.
 * @param param0 
 * @returns 
 */
export function reverseComputeScale({interval, tickCount}: {interval: number, tickCount: number}): number {
    return Math.round(interval / tickCount);
}

/**
 * Compute tick count, so the tick size is the expected one.
 * @param param0 
 */
export function reverseComputeTickCount({width, tickSize}: {width: number, tickSize: number}): number {
    return Math.round(width / tickSize);
}

export function computeOffset({from, scale, size}: {from: Date, scale: number, size: number}) {
    return Math.round(Math.round((from.getTime() % scale) / scale) * size)
}

export function recomposeTimestamp({days, hours, minutes}: {days: number, hours: number, minutes: number}): number {
    const s_unit = 1000;
    const mn_unit = s_unit * 60;
    const h_unit = mn_unit * 60;
    const d_unit = h_unit * 24; 

    return days * d_unit + hours * h_unit + minutes * mn_unit;
}

export function decomposeTimestamp(value: number): {days: number, hours: number, minutes: number} {
    const s_unit = 1000;
    const mn_unit = s_unit * 60;
    const h_unit = mn_unit * 60;
    const d_unit = h_unit * 24; 

    let days = Math.trunc(value / d_unit);
    value = value % d_unit;

    let hours = Math.trunc(value / h_unit);
    value = value % h_unit;

    let minutes = Math.trunc(value / mn_unit);
    value = value % mn_unit;

    return {days, hours, minutes}
}
