"use client";

import { findNuisances } from "@/actions/nuisance/findNuisances";
import { Heading } from "@/components/Heading";
import { TimelinePeriod, Timeline } from "@/components/Timeline";
import { UserContextMenu } from "@/components/UserContextMenu";
import { DynamicMap, DynamicMapHook, DynamicTileLayer, DynamicZoomControl } from "@/components/leaflet/dynamic"
import { Intensity } from "@/lib/model";
import { Nuisance } from "@/lib/model/nuisance";
import { getNuisanceHeatmapColor } from "@/lib/services/monitoring";
import { geojson } from "@/lib/utils/geojson";
import { groupBy } from "@/lib/utils/iterable";
import { Polygon } from "geojson";
import { type LeafletEvent, type Map } from "leaflet";
import { useEffect, useMemo, useState } from "react"
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip } from 'recharts';


const LOCATION_FALLBACK: [number, number] = [48.8572207, 2.324604];

function useAsync<T>(initial: T, promise?: Promise<T>) {
  const [current, setCurrent] = useState(promise);
  const [loading, setLoading] = useState(promise !== undefined);
  const [error, setError] = useState(null);
  const [data, setData] = useState<T>(initial);
  
  promise?.then(setData).catch(setError).finally(() => setLoading(false));

  return {
    data,
    error,
    loading,
    handle: (promise: Promise<T>) => {
      setCurrent(promise);
      setLoading(true);
      promise
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
    }
  }
}

export function NuisancesDetails({period, nuisances, loading}: {period: {from: Date, to: Date}, nuisances: Array<Nuisance>, loading: boolean}) {

  const groupByFamilies = Object
  .entries(groupBy(nuisances, (n) => n.nuisanceType!.family))

  const countByFamilies = groupByFamilies
    .map<{name: string, value: number}>(([family, n]) => ({name: family, value: n.reduce((a,b) => a + b.count, 0)}));

  return <>
    Période de {period.from.toLocaleString("fr-fr")} à {period.to.toLocaleString("fr-fr")}
    
    <div className="w-full h-80">
      <Heading level={1}>Par famille</Heading>
      <ResponsiveContainer>
        <PieChart>
          <Pie 
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                fill="#8884d8"
                endAngle={0}
                isAnimationActive={false} 
                data={countByFamilies}
                cx="50%"
                cy="50%"
                label={(e) => `${e.name} - ${(e.percent * 100).toFixed(2)}%`}>
          </Pie>
          <Tooltip/>
        </PieChart>
      </ResponsiveContainer>
    </div>

  </>
}

export function Monitoring(props: {between: {from: Date, to: Date}}) {
    const heatmapColor = getNuisanceHeatmapColor();
    const [map, setMap] = useState<Map|null>(null);
    const [mapBounds, setMapBounds] = useState<Polygon|null>(null);
    const [selectedNuisanceTypes, setSelectedNuisanceTypes] = useState([])
    const [selectedPeriod, setSelectedPeriod] = useState(props.between);

    const {data: nuisancesPeriods, handle: handleNuisancePeriods, error: fetchNuisancePeriodsError, loading: fetchingNuisancePeriods} = useAsync<Array<Nuisance>>([]);
    const {data: nuisancesDetails, handle: handleNuisancesDetails, error: fetchNuisancesDetails, loading: fetchingNuisancesDetails} = useAsync<Array<Nuisance>>([]);
    
    // Define a scale of 30 mn.
    const [scale, setScale] = useState(30 * 60 * 1000);

    const [timeBounds, setTimeBounds] = useState({
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(Date.now())
    })

    useEffect(() => {
      if(!mapBounds) return;

      handleNuisancePeriods(findNuisances({
        between: timeBounds,
        within: [mapBounds],
        groupBy: {period: scale}
      }))

    }, [timeBounds, mapBounds, selectedNuisanceTypes]);

    useEffect(() => {
      if(!mapBounds) return;
      
      handleNuisancesDetails(findNuisances({
        between: selectedPeriod,
        within: [mapBounds],
        groupBy: {nuisanceType: true}
      }));

    }, [selectedPeriod, mapBounds, selectedNuisanceTypes]);

    // Update fetched nuisances
    useEffect(() => {
      const onMapViewportMoved = (_ : LeafletEvent) => {
        const mapBounds = map!.getBounds();
        const mapPolygon = geojson.Polygon.Rectangle.fromDiagonalPoints({
          nw: geojson.Point.fromLatLon({lat: mapBounds.getNorthWest().lat, lon: mapBounds.getNorthWest().lng}),
          se: geojson.Point.fromLatLon({lat: mapBounds.getSouthEast().lat, lon: mapBounds.getSouthEast().lng})
        })

        setMapBounds((_) => mapPolygon);
      }
      
      if(map) {
        const mapBounds = map!.getBounds();
        const mapPolygon = geojson.Polygon.Rectangle.fromDiagonalPoints({
          nw: geojson.Point.fromLatLon({lat: mapBounds.getNorthWest().lat, lon: mapBounds.getNorthWest().lng}),
          se: geojson.Point.fromLatLon({lat: mapBounds.getSouthEast().lat, lon: mapBounds.getSouthEast().lng})
        })

        setMapBounds((_) => mapPolygon);
        map.addEventListener("moveend", onMapViewportMoved);
      }

      return () => {map?.removeEventListener("moveend", onMapViewportMoved)};
    }, [map])

    // Generate tile layer url based on the selection of nuisance types, and the time range.
    const tileLayersParams = useMemo(() => ({
      nuisanceTypesIds: selectedNuisanceTypes.length == 0 ? "all" : selectedNuisanceTypes.join(","),
      between: `${selectedPeriod.from.getTime()},${selectedPeriod.to.getTime()}`
    }), [selectedNuisanceTypes, selectedPeriod])

    const nuisanceTileLayerUrl = useMemo(() => `/monitoring/tiles/${tileLayersParams.nuisanceTypesIds}/${tileLayersParams.between}/{z}/{x}/{y}`, [tileLayersParams])

    return <div className="flex flex-row  h-screen w-screen">
        <div className="bg-gray-100 w-200 shadow z-40 p-2">
          <NuisancesDetails period={selectedPeriod} nuisances={nuisancesDetails} loading={fetchingNuisancesDetails}/>
        </div>
        <div id="viewport" className="relative h-full w-full">
          <div className="absolute inset-0 z-20 py-2 px-2 w-full h-20 flex items-center place-content-end space-x-2">
            <UserContextMenu />
          </div>
          <DynamicMap center={LOCATION_FALLBACK} zoom={13} className="z- w-full h-full z-0" zoomControl={false}>
              <DynamicTileLayer   url={nuisanceTileLayerUrl}></DynamicTileLayer>
              <DynamicZoomControl position="topleft" />
              <DynamicMapHook     whenCreated={setMap}/>
          </DynamicMap>
          <div className="absolute left-0 bottom-20 z-20 p-4 w-full h-20 flex items-center place-content-end space-x-2">
            <Timeline loading={fetchingNuisancePeriods} scale={scale} onScaleChange={setScale} onBoundsChange={setTimeBounds} from={timeBounds.from} to={timeBounds.to} onChange={setSelectedPeriod}>
                {nuisancesPeriods.map((n) => 
                    n.period ? 
                    <TimelinePeriod from={n.period!.from} to={n.period!.to} key={`${n.period.from.toISOString()}-${n.period.to.toISOString()}`}>
                      <div style={{backgroundColor: heatmapColor(Intensity.wilsonScoreLowerBound(n.weights)).hex()}} className="h-full w-full" ></div>
                    </TimelinePeriod> : <></>
                )}
            </Timeline>
          </div>
      </div>
    </div>
}