import { Monitoring } from "./monitoring"

export default function Page() {
    const DEFAULT_TIME_RANGE = {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000),
        to: new Date(Date.now())
      };

    return <Monitoring between={DEFAULT_TIME_RANGE} />
}