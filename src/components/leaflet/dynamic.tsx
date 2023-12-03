"use client";

import dynamic from 'next/dynamic';

export const DynamicMap = dynamic(async () => (await import('@/components/leaflet/index')).Map, {ssr: false})
export const DynamicMapHook = dynamic(async () => (await import('@/components/leaflet/index')).MapHook, {ssr: false})
//@ts-ignore
export const DynamicMarker = dynamic(async () => ((await import("react-leaflet-marker")).Marker), {ssr: false});
//@ts-ignore
export const DynamicMarkerLayer = dynamic(async () => ((await import("react-leaflet-marker")).MarkerLayer), {ssr: false});
export const DynamicTileLayer = dynamic(async () => ((await import("react-leaflet")).TileLayer), {ssr: false});

export const DynamicZoomControl =  dynamic(async () => ((await import("react-leaflet")).ZoomControl), {ssr: false});

