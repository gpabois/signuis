import { ReactNode, useMemo, ReactElement } from "react";
import { TickContext } from "./model";

export function Period({from, to, context, children}: {from: Date, to: Date, context: TickContext, children?: ReactNode}) {
    const fromIndex = context.nearest(from);
    const toIndex = context.nearest(to);
    const left = useMemo(() =>  context.position(fromIndex), [from, context.offset, context.size])
    const width = useMemo(() => Math.abs((toIndex - fromIndex)) * context.size, [context.size, to, from]);

    return <div style={{width, left}} className="h-full absolute z-0 inset-0">
        {children}
    </div>
}

export type TimelinePeriodProps = {from: Date, to: Date, children?: ReactNode};
export function TimelinePeriod(props: TimelinePeriodProps & {key?: string | null}): ReactElement<TimelinePeriodProps> {
    return {
        type: "TimelinePeriod",
        props,
        key: props.key ? props.key : null
    }
}