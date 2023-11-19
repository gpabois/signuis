"use client";

import { useEffect } from "react";
import { useGeolocated } from "react-geolocated";

export default function(props: {onLocationUpdated: (coords: GeolocationCoordinates) => void}) {
    const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
        watchPosition: true,
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
      });
    
    useEffect(() => {
        if(coords) props.onLocationUpdated(coords)
    }, [coords]);

    return <></>;
}