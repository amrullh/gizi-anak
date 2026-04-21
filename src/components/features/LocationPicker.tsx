'use client';

import { useMapEvents, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';

// Perbaikan icon marker Leaflet di Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialPosition?: { lat: number; lng: number };
}

export function LocationPicker({ onLocationSelect, initialPosition }: LocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialPosition ? L.latLng(initialPosition.lat, initialPosition.lng) : null
    );

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customIcon}>
            <Popup>Lokasi Rumah Terpilih</Popup>
        </Marker>
    );
}