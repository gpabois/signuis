"use client";

import { useEffect, useMemo, useState } from 'react'
import { CreateReportForm  } from '@/app/reportForms';
import { Point } from 'geojson';
import {DynamicMarker, DynamicZoomControl, DynamicMap, DynamicMapHook, DynamicMarkerLayer} from '@/components/leaflet/dynamic';
import Geolocation from '@/components/Geolocation';
import { UserContextMenu } from '@/components/UserContextMenu';
import { Button } from '@/components/common/Button';
import { MegaphoneIcon, UserIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { NuisanceType, Report } from '@/lib/model';
import { type Map as LeafletMap} from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';

const LOCATION_FALLBACK: [number, number] = [48.8572207, 2.324604];

export type HomeProps = {
    nuisanceTypes?: Array<NuisanceType>
}

export function Home(props: HomeProps) {
  const [map, setMap] = useState<LeafletMap|null>(null);
  const [displayReportForm, setDisplayReportForm] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number]|null>(null);
  const [_, setGeoLocation] = useState<GeolocationCoordinates|null>(null);

  function onReportCreated(report: Report) {
    toast('Signalement enregistré !')
    setDisplayReportForm(false);
  }
  const location = useMemo<Point| undefined>(() => {
    return (currentPosition && {
      type: "Point",
      coordinates: [currentPosition[1], currentPosition[0]]
    }) || undefined
  }, [currentPosition])

  function onLocationUpdated(gps: GeolocationCoordinates) {
    setCurrentPosition((_) => [gps.latitude, gps.longitude]);
    setGeoLocation((_) => gps)
  }

  currentPosition && map && map?.flyTo(currentPosition);
  useEffect(() => {
    currentPosition && map && map.flyTo(currentPosition);
  }, [map, currentPosition])

  return (
    <main className="h-screen w-screen flex flex-col">
        <ToastContainer position="top-left" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick
        rtl={false}
        draggable
        theme="light"
        />
      <div id="viewport" className="relative h-full w-full flex-1">
        <div className='absolute inset-O z-20 py-2 px-2 w-full flex flex-row items-center place-content-end space-x-2'>
          <Button onClick={() => setDisplayReportForm((e) => !e)} nature="primary">
            {displayReportForm ? <XMarkIcon className='h-5 w-5'/> :  <MegaphoneIcon className='h-5 w-5'/>}
          </Button>
          <UserContextMenu />
        </div>
        <DynamicMap className="z- w-full h-full z-0" center={currentPosition || LOCATION_FALLBACK} zoomControl={false} zoom={16} >
          {currentPosition && <DynamicMarkerLayer>
            <DynamicMarker position={currentPosition}>
                <UserIcon className='h-5 w-5 relative inset-0 ring-2 rounded-xl bg-slate-600 text-white'/>
            </DynamicMarker>
          </DynamicMarkerLayer>}
          <DynamicZoomControl position="bottomleft" />
          <DynamicMapHook whenCreated={setMap}/>
        </DynamicMap>
      </div>
      {displayReportForm && 
        <div className='flex-none p-10 shadow z-20'>
            <CreateReportForm report={{location}} nuisanceTypes={props.nuisanceTypes} onReportCreated={onReportCreated}/>
        </div>
      }
    <Geolocation onLocationUpdated={onLocationUpdated} />
    </main>
  )
}

