"use client";

import { TimelinePeriod, TimelineSlider } from "@/components/TimelineSlider";
import { UserContextMenu } from "@/components/UserContextMenu";
import { DynamicMap, DynamicZoomControl } from "@/components/leaflet/dynamic"
import { useState } from "react"
import { TileLayer } from "react-leaflet"

const LOCATION_FALLBACK: [number, number] = [48.8572207, 2.324604];


export default function Page() {
    const [nuisanceType, setNuisanceType] = useState("633896f9-507a-4a2f-8b6e-15b34f7a3a28")
    const [time, setTime] = useState(28344304)

    const [timeBounds, _] = useState({
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(Date.now())
    })

    return <div id="viewport" className="relative h-screen w-screen">
        <div className="absolute inset-0 z-20 py-2 px-2 w-full h-20 flex items-center place-content-end space-x-2">
          <UserContextMenu />
        </div>
        <DynamicMap center={LOCATION_FALLBACK} zoom={13} className="z- w-full h-full z-0" zoomControl={false}>
            <TileLayer url={`/monitoring/tiles/${nuisanceType}/${time}/{z}/{x}/{y}`}></TileLayer>
            <DynamicZoomControl position="bottomleft" />
        </DynamicMap>
        <div className="absolute left-0 bottom-20 z-20 py-2 px-2 w-full h-20 flex items-center place-content-end space-x-2">
          <TimelineSlider from={timeBounds.from} to={timeBounds.to}>
              <TimelinePeriod from={new Date(Date.now() - 12 * 60 * 60 * 1000)} to={new Date(Date.now() - 10 * 60 * 60 * 1000)}>
                <div className="h-full text-center bg-slate-600"></div>
              </TimelinePeriod>
          </TimelineSlider>
        </div>
    </div>
}