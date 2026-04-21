'use client';

import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface MapPreviewProps {
    position: { lat: number; lng: number };
    userName?: string;
    showMarker: boolean;
    isInteractive?: boolean;
}

export default function MapPreview({
    position,
    userName,
    showMarker,
    isInteractive = false
}: MapPreviewProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Validasi koordinat agar tidak error NaN
        const isValidCoordinate =
            typeof position.lat === 'number' && !isNaN(position.lat) &&
            typeof position.lng === 'number' && !isNaN(position.lng);

        if (!isValidCoordinate) return;

        const initMap = async () => {
            setOptions({
                key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
            });

            try {
                // Import library dasar
                const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
                // Pakai marker standar (lebih kebal error daripada AdvancedMarker)
                const { Marker } = await importLibrary("marker") as google.maps.MarkerLibrary;

                if (mapRef.current) {
                    const mapOptions: google.maps.MapOptions = {
                        center: position,
                        zoom: 15,
                        // KITA HAPUS mapId DI SINI SUPAYA TIDAK BLANK
                        disableDefaultUI: !isInteractive,
                        gestureHandling: isInteractive ? 'greedy' : 'none',
                    };

                    const map = new Map(mapRef.current, mapOptions);

                    if (showMarker) {
                        new Marker({
                            position: position,
                            map: map,
                            title: userName || "Lokasi",
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal load Google Maps:", error);
            }
        };

        initMap();
    }, [position, isInteractive, showMarker, userName]);

    return (
        <div
            ref={mapRef}
            className="h-full w-full rounded-2xl shadow-inner bg-gray-100"
            style={{ minHeight: '250px' }}
        />
    );
}