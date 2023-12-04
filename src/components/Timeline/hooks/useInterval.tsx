import { useEffect, useMemo, useState } from "react";
import { computeInterval } from "../utils";

export function useInterval({bounds: {to, from}}: {bounds: {to: Date, from: Date}}) {
    const [interval, setInterval] = useState(computeInterval({to, from}));
    useEffect(() => setInterval(computeInterval({to, from})), [to, from])
    return interval
}