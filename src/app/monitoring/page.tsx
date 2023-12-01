"use client";

import { TimelinePeriod, TimelineSlider } from "@/components/TimelineSlider";
import { UserContextMenu } from "@/components/UserContextMenu";
import { DynamicMap, DynamicZoomControl } from "@/components/leaflet/dynamic"
import { useMemo, useState } from "react"
import { TileLayer } from "react-leaflet"

const LOCATION_FALLBACK: [number, number] = [48.8572207, 2.324604];


export default function Page() {
    const DEFAULT_TIME_RANGE = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(Date.now())
    };

    const [selectedNuisanceTypes, setSelectedNuisanceTypes] = useState([])
    const [between, setBetween] = useState(DEFAULT_TIME_RANGE);

    const [timeBounds, _] = useState({
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(Date.now())
    })

    const tileLayersParams = useMemo(() => ({
      nuisanceTypesIds: selectedNuisanceTypes.length == 0 ? "all" : selectedNuisanceTypes.join(","),
      between: `${between.from.getTime()},${between.to.getTime()}`
    }), [selectedNuisanceTypes, between])

    const nuisanceTileLayerUrl = useMemo(() => `/monitoring/tiles/${tileLayersParams.nuisanceTypesIds}/${tileLayersParams.between}/{z}/{x}/{y}`, [tileLayersParams])

    return <div className="flex flex-row  h-screen w-screen">
        <div className="bg-gray-100 w-60">
          {between.from.toLocaleString("fr-fr")} - {between.to.toLocaleString("fr-fr")}
        </div>
        <div id="viewport" className="relative h-full w-full">
          <div className="absolute inset-0 z-20 py-2 px-2 w-full h-20 flex items-center place-content-end space-x-2">
            <UserContextMenu />
          </div>
          <DynamicMap center={LOCATION_FALLBACK} zoom={13} className="z- w-full h-full z-0" zoomControl={false}>
              <TileLayer url={nuisanceTileLayerUrl}></TileLayer>
              <DynamicZoomControl position="bottomleft" />
          </DynamicMap>
          <div className="absolute left-0 bottom-20 z-20 py-2 px-2 w-full h-20 flex items-center place-content-end space-x-2">
            <TimelineSlider from={timeBounds.from} to={timeBounds.to} onChange={setBetween}>
                <TimelinePeriod from={new Date(Date.now() - 12 * 60 * 60 * 1000)} to={new Date(Date.now() - 10 * 60 * 60 * 1000)}>
                  <div className="h-full text-center bg-slate-600"></div>
                </TimelinePeriod>
            </TimelineSlider>
          </div>
      </div>
    </div>
}