"use client";

import { DynamicMap } from "@/components/leaflet/dynamic"
import { useState } from "react"
import { TileLayer } from "react-leaflet"

const LOCATION_FALLBACK: [number, number] = [48.8572207, 2.324604];


export default function Page() {
    const [nuisanceType, setNuisanceType] = useState("633896f9-507a-4a2f-8b6e-15b34f7a3a28")
    const [time, setTime] = useState(28344304)
    return <div className="h-screen w-screen">
        <DynamicMap center={LOCATION_FALLBACK} zoom={13} className="w-full h-full">
            <TileLayer url={`/monitoring/tiles/${nuisanceType}/${time}/{z}/{x}/{y}`}></TileLayer>
        </DynamicMap>
    </div>
}