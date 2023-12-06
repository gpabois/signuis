import { useEffect, useState } from "react";
import { DateBounds } from "../model";

export type UseBoundsArgs = {
    onChanged?: (value: DateBounds) => void,
    value: DateBounds
}

export function useBounds(args: UseBoundsArgs): [DateBounds, (value: DateBounds) => void] {
    const [bounds, _setBounds] = useState(args.value);

    const setBounds = (newBounds: DateBounds, notify: boolean = true) => {
        if(newBounds != bounds) {
            notify && args.onChanged?.(newBounds);
            _setBounds(newBounds);
        }
    }

    // Update on value change
    useEffect(() => setBounds(args.value, false), [args.value])

    return [bounds, setBounds];
}