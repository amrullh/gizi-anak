'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaSave, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MapPickerPage() {
    const { user } = useAuth();
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedPos, setSelectedPos] = useState<{ lat: number, lng: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const initMap = async () => {
            setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string });

            try {
                const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
                const { AdvancedMarkerElement, PinElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

                // Koordinat awal: Morowali (fallback) atau data user
                const initialPos = user?.coordinate
                    ? { lat: Number(user.coordinate.latitude), lng: Number(user.coordinate.longitude) }
                    : { lat: -2.476443, lng: 121.925435 };

                if (mapRef.current && !map) {
                    const newMap = new Map(mapRef.current, {
                        center: initialPos,
                        zoom: 17,
                        mapId: '384e4f41c1d8c24aaf3284e6',
                        disableDefaultUI: true,
                        gestureHandling: 'greedy', // Memudahkan scroll 1 jari di mobile
                    });

                    const pin = new PinElement({
                        background: "#ec4899", // Pink GiziAnak
                        glyphColor: "#fff",
                        borderColor: "#be185d"
                    });

                    const newMarker = new AdvancedMarkerElement({
                        map: newMap,
                        position: initialPos,
                        content: pin.element,
                        title: "Lokasi Rumah"
                    });

                    // Listener untuk pindahkan titik saat peta diklik
                    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
                        if (e.latLng) {
                            const clickedPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                            newMarker.position = clickedPos;
                            setSelectedPos(clickedPos);
                        }
                    });

                    setMap(newMap);
                    setSelectedPos(initialPos);
                }
            } catch (err) {
                console.error("Gagal inisialisasi peta:", err);
            }
        };

        if (user) initMap();
    }, [user, map]);

    const handleSaveLocation = async () => {
        if (!user || !selectedPos) return;

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                coordinate: {
                    latitude: selectedPos.lat,
                    longitude: selectedPos.lng
                }
            });
            toast.success("Lokasi rumah berhasil disimpan!");
            router.push('/parent/profile');
        } catch (error) {
            toast.error("Gagal menyimpan lokasi.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Header Sticky */}
            <div className="p-4 flex items-center gap-4 bg-white/90 backdrop-blur-md border-b z-10">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 active:bg-gray-200 transition-all shadow-sm"
                >
                    <FaArrowLeft size={18} />
                </button>
                <h1 className="font-bold text-gray-800 tracking-tight text-lg">Atur Lokasi Rumah</h1>
            </div>

            {/* Container Peta */}
            <div ref={mapRef} className="flex-1 w-full h-full relative z-0" />

            {/* Floating Card - Disesuaikan agar di atas Navbar (bottom-24) */}
            <div className="fixed bottom-24 left-0 right-0 px-4 z-20 pointer-events-none">
                <Card className="p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-pink-50 bg-white/95 backdrop-blur-md rounded-[28px] pointer-events-auto max-w-md mx-auto transform transition-all active:scale-[0.98]">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                                <FaMapMarkerAlt size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none mb-1">
                                    Koordinat Terpilih
                                </p>
                                <p className="font-mono text-sm font-bold text-gray-700 truncate">
                                    {selectedPos ? `${selectedPos.lat.toFixed(6)}, ${selectedPos.lng.toFixed(6)}` : 'Mendeteksi...'}
                                </p>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            onClick={handleSaveLocation}
                            disabled={isSaving}
                            className="py-4 rounded-2xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all active:brightness-90 disabled:bg-gray-300"
                        >
                            {isSaving ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FaSave size={16} /> Simpan Lokasi Saya
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Tooltip Instruksi */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.15em] shadow-xl border border-white/10">
                    Klik pada peta untuk menentukan titik
                </div>
            </div>
        </div>
    );
}