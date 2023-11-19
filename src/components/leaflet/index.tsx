'use client';

import { MapContainer, MapContainerProps, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react';
import { type Map as LeafletMap } from 'leaflet';

/**
 * Map used for the Home page
 * @param props 
 * @returns 
 */
export function Map(props: MapContainerProps) {
  return <MapContainer {...props} >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {props.children}
  </MapContainer>
}

export function MapHook(props: {whenCreated?: (map: LeafletMap) => void}) {
  const map = useMap()
  useEffect(() => props.whenCreated?.(map), [map]);
  return <></>
}
