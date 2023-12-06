"use client";

import { findNuisances } from "@/actions/nuisance/findNuisances";
import { TimelinePeriod, Timeline } from "@/components/Timeline";
import { DateBounds } from "@/components/Timeline/model";
import { UserContextMenu } from "@/components/UserContextMenu";
import { Button } from "@/components/common/Button";
import { DynamicMap, DynamicMapHook, DynamicTileLayer, DynamicZoomControl } from "@/components/leaflet/dynamic"
import { Intensity, IntensityWeights, NuisanceType } from "@/lib/model";
import { Nuisance } from "@/lib/model/nuisance";
import { getNuisanceHeatmapColor } from "@/lib/services/monitoring";
import { geojson } from "@/lib/utils/geojson";
import { groupBy } from "@/lib/utils/iterable";
import { fromQueryParams, toQueryParams } from "@/lib/utils/url";
import { ArrowRightIcon, SignalIcon } from "@heroicons/react/20/solid";
import { stat } from "fs";
import { Polygon } from "geojson";
import { Point, type LeafletEvent, type Map, LatLng } from "leaflet";
import { init } from "next/dist/compiled/webpack/webpack";
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react"
import { useDebounce, useInterval } from 'usehooks-ts'

const LOCATION_FALLBACK = new LatLng(48.8572207, 2.324604);

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

export function NuisanceAssesment({period, nuisances, loading}: {period: {from: Date, to: Date}, nuisances: Array<Nuisance>, loading: boolean}) {
  const groupByFamilies = Object
  .entries(groupBy(nuisances, (n) => n.nuisanceType!.family))

  const assessmentByFamily = groupByFamilies.map<{family: string, count: number, weights: IntensityWeights}>(([family, g]) => ({
    family,
    count: g.reduce((agg, n) => agg + n.count, 0),
    weights: [
      g.reduce((agg, n) => agg + n.weights[0], 0),
      g.reduce((agg, n) => agg + n.weights[1], 0),
      g.reduce((agg, n) => agg + n.weights[2], 0),
      g.reduce((agg, n) => agg + n.weights[3], 0),
      g.reduce((agg, n) => agg + n.weights[4], 0)
    ]
  }))
  const countByFamilies = groupByFamilies
    .map<{name: string, value: number}>(([family, n]) => ({name: family, value: n.reduce((a,b) => a + b.count, 0)}));

  
  
  return <>
    <div className="flex flex-row mb-2 items-center bg-gray-200">
      <span className="text-xs p-1 bg-gray-300 rounded-lg">{period.from.toLocaleString("fr-fr")} </span>
      <ArrowRightIcon className="w-4 h-4 grow"/>
      <span className="text-xs p-1 bg-gray-300 rounded-lg">{period.to.toLocaleString("fr-fr")} </span>
    </div>

    {nuisances.length == 0 ?
      <div className="mt-2 p-4 bg-amber-100 border-2 shadow-inner rounded">
        Aucune nuisance signalée sur cette période.
      </div>
      :
      <table className="w-full text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-slate-300 ">Famille</th>
              <th className="border border-slate-300 ">#</th>
              <th className="border border-slate-300 ">Intensité</th>
            </tr>
          </thead>
          <tbody>
          {
            assessmentByFamily.map(a => <tr>
              <td className="border border-slate-300 ">{a.family}</td>
              <td className="border border-slate-300 ">{a.count}</td>
              <td className="border border-slate-300 ">{(Intensity.wilsonScoreLowerBound(a.weights) * 100).toFixed(2)}%</td>
            </tr>)
          }
        </tbody>
      </table>
    }


  </>
}

enum MonitoringMode {
  History = "history",
  Realtime = "realtime"
};

export interface MonitoringProps {
  between?: DateBounds,
  nuisanceTypes: Array<NuisanceType>,
  center?: LatLng
}

export interface MonitoringState {
  mode: MonitoringMode,
  center: LatLng,
  timeBounds: DateBounds,
  selectedPeriod: DateBounds,
  scale: number
}

export function Monitoring(props: MonitoringProps) {
  // Router
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const loadState = <T extends  {[key: string]: any}>(params: T) => {
    const stateMap = {
      c: LOCATION_FALLBACK,
      m: MonitoringMode.Realtime,
      tb: {from: new Date(Date.now() - 24 * 60 * 60 * 1000), to: new Date(Date.now())},
      sp: {from: new Date(Date.now() - 24 * 60 * 60 * 1000), to: new Date(Date.now())},
      s: 5 * 60 * 1000
    }

    fromQueryParams(stateMap, params)

    return {
      center: stateMap.c as LatLng,
      timeBounds: stateMap.tb,
      selectedPeriod: stateMap.sp,
      mode: stateMap.m,
      scale: stateMap.s
    }
  }
  
  const saveState = (args: {mode: MonitoringMode, center: LatLng, timeBounds: DateBounds, selectedPeriod: DateBounds, scale: number}) => {
    const stateMap = {
      c:  center, 
      tb: timeBounds,
      sp: selectedPeriod,
      m:  mode,
      s:  scale
    }

    const queryParams = toQueryParams(stateMap)
    router.replace(`${pathname}?${queryParams}`)
  }

  const initialState = loadState(Object.fromEntries(searchParams.entries()));
  console.log(initialState)
  
  // Heatmap
  const heatmapColor = getNuisanceHeatmapColor();
  
  // Monitoring mode (history or realtime)
  const [mode, setMode] = useState<MonitoringMode>(initialState.mode)

  // Leaflet component
  const [map, setMap] = useState<Map|null>(null);
  const [center, setCenter] = useState(initialState.center)

  // Map bounds
  const [mapBounds, setMapBounds] = useState<Polygon|null>(null);
  const debouncedMapBounds = useDebounce(mapBounds, 500);

  // Time bounds
  const [timeBounds, setTimeBounds] = useState(initialState.timeBounds);
  const debouncedTimeBounds = useDebounce(timeBounds, 500);

  // Selected nuisances types
  const [selectedNuisanceTypes, setSelectedNuisanceTypes] = useState<Array<NuisanceType>>([])
  const [selectedPeriod, setSelectedPeriod] = useState(initialState.selectedPeriod);
  const debounceSelectedPeriod = useDebounce(selectedPeriod, 500);

  const {data: nuisancesPeriods, handle: handleNuisancePeriods, error: fetchNuisancePeriodsError, loading: fetchingNuisancePeriods} = useAsync<Array<Nuisance>>([]);
  const {data: nuisancesDetails, handle: handleNuisancesDetails, error: fetchNuisancesDetails, loading: fetchingNuisancesDetails} = useAsync<Array<Nuisance>>([]);
  
  // Define a scale of 5 mn.
  const [scale, setScale] = useState(initialState.scale);
  const debouncedScale = useDebounce(scale, 500);

  useEffect(() => {
    saveState({center, timeBounds, selectedPeriod, mode, scale})
  }, [center, timeBounds, scale, mode, selectedPeriod])


  // Realtime functions
  const updateRealtimeParameters = function() {
    const now = new Date();

    setTimeBounds({
      from: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      to: now
    });

    setSelectedPeriod({
      from: new Date(now.getTime() - 15 * 60 * 1000),
      to: now
    });
  };

  useInterval(updateRealtimeParameters, mode == MonitoringMode.Realtime ? 60 * 1000 : null)

  useEffect(() => {
    if(mode == MonitoringMode.Realtime) updateRealtimeParameters();
  }, [mode])

  // Update nuisance periods upon change of
  useEffect(() => {
    if(!mapBounds) return;

    handleNuisancePeriods(findNuisances({
      between: timeBounds,
      within: [mapBounds],
      groupBy: {period: scale}
    }))

  }, [debouncedTimeBounds, debouncedMapBounds, debouncedScale, selectedNuisanceTypes]);

  useEffect(() => {
    if(!mapBounds) return;
    
    handleNuisancesDetails(findNuisances({
      between: selectedPeriod,
      within: [mapBounds],
      groupBy: {nuisanceType: true}
    }));

  }, [debounceSelectedPeriod, mapBounds, selectedNuisanceTypes]);

  // Update fetched nuisances upon updated of time or map bounds, or selected nuisance types
  useEffect(() => {
    const onMapViewportMoved = (_ : LeafletEvent) => {
      const mapBounds = map!.getBounds();
      const mapPolygon = geojson.Polygon.Rectangle.fromDiagonalPoints({
        nw: geojson.Point.fromLatLon({lat: mapBounds.getNorthWest().lat, lon: mapBounds.getNorthWest().lng}),
        se: geojson.Point.fromLatLon({lat: mapBounds.getSouthEast().lat, lon: mapBounds.getSouthEast().lng})
      })
      
      map && setCenter(map.getCenter());
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
    nuisanceTypesIds: selectedNuisanceTypes.length == 0 ? "all" : selectedNuisanceTypes.map(n => n.id).join(","),
    between: `${selectedPeriod.from.getTime()},${selectedPeriod.to.getTime()}`
  }), [selectedNuisanceTypes, selectedPeriod])

  const nuisanceTileLayerUrl = useMemo(() => `/monitoring/tiles/${tileLayersParams.nuisanceTypesIds}/${tileLayersParams.between}/{z}/{x}/{y}`, [tileLayersParams])

  return <div className="flex flex-row  h-screen w-screen">
      <div className="bg-gray-100 w-1/3 shadow z-40 p-2">
        <NuisanceAssesment period={selectedPeriod} nuisances={nuisancesDetails} loading={fetchingNuisancesDetails}/>
      </div>
      <div id="viewport" className="relative h-full w-full">
        <div className="absolute inset-0 z-20 p-2 w-full h-20 flex flex-row items-center place-content-end space-x-2">
          {mode == MonitoringMode.Realtime ?
            <Button className="bg-rose-600 text-white p-2 rounded  space-x-4 text-center" onClick={() => setMode(MonitoringMode.History)}>
              <SignalIcon className="w-5 h-5 mr-1"/>
              Temps réel
            </Button> : <span>Historique</span>}
          <UserContextMenu />
        </div>
        <DynamicMap center={center} zoom={13} className="z- w-full h-full z-0" zoomControl={false}>
            <DynamicTileLayer   url={nuisanceTileLayerUrl}></DynamicTileLayer>
            <DynamicZoomControl position="topleft" />
            <DynamicMapHook     whenCreated={setMap}/>
        </DynamicMap>
        <div className="absolute left-0 bottom-20 z-20 p-4 w-full h-20 flex items-center place-content-end space-x-2">
          <Timeline 
              loading={fetchingNuisancePeriods} 
              scale={scale} 
              onScaleChange={setScale} 
              onBoundsChange={setTimeBounds} 
              bounds={timeBounds} 
              value={selectedPeriod} 
              onChange={setSelectedPeriod}>
              {nuisancesPeriods.map((n) => 
                  (n.period && n.period.to && n.period.from) ? 
                  <TimelinePeriod value={n.period} key={`${n.period.from.toISOString()}-${n.period.to.toISOString()}`}>
                    <div style={{backgroundColor: heatmapColor(Intensity.wilsonScoreLowerBound(n.weights)).hex()}} className="h-full w-full" ></div>
                  </TimelinePeriod> : <></>
              )}
          </Timeline>
        </div>
    </div>
  </div>
}