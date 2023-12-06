import { ReactNode, useMemo, ReactElement } from "react";
import { DateBounds, TickContext } from "./model";
import { UseGeometryBoundsHook } from "./hooks/useContext";

export type PeriodProps = TimelinePeriodProps & {
    useGeometryBounds: UseGeometryBoundsHook
}

export function Period({useGeometryBounds, value, children}: PeriodProps) {
    const {bounds} = useGeometryBounds(value)
    const left = useMemo(() =>  (bounds && bounds!.from) || 0, [bounds])
    const width = useMemo(() => (bounds && (bounds!.to - bounds!.from)) || 0, [bounds]);
    return <div style={{width, left}} className="h-full absolute z-0 inset-0">
        {children}
    </div>
}

export type TimelinePeriodProps = {value: DateBounds, children?: ReactNode};
export function TimelinePeriod(props: TimelinePeriodProps & {key?: string | null}): ReactElement<TimelinePeriodProps> {
    return {
        type: "TimelinePeriod",
        props,
        key: props.key ? props.key : null
    }
}