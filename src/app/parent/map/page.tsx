'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaSave, FaArrowLeft, FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MapPickerPage() {
    const { user } = useAuth();
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<any>(null); // Menyimpan marker agar bisa diupdate
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedPos, setSelectedPos] = useState<{ lat: number, lng: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Fungsi untuk mendapatkan lokasi terkini pengguna
    const getCurrentLocation = () => {
        setIsDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    updateMarkerAndPan(pos);
                    setIsDetecting(false);
                    toast.success("Lokasi terkini ditemukan");
                },
                () => {
                    setIsDetecting(false);
                    toast.error("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.");
                }
            );
        } else {
            setIsDetecting(false);
            toast.error("Browser Anda tidak mendukung GPS.");
        }
    };

    // Fungsi pembantu untuk memindahkan marker dan fokus peta
    const updateMarkerAndPan = (pos: { lat: number, lng: number }) => {
        setSelectedPos(pos);
        if (map) {
            map.panTo(pos);
            map.setZoom(17);
        }
        if (markerRef.current) {
            markerRef.current.position = pos;
        }
    };

    useEffect(() => {
        const initMap = async () => {
            setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string });

            try {
                const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
                const { AdvancedMarkerElement, PinElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

                // 1. Default awal: Gunakan koordinat user jika ada, jika tidak ada gunakan Morowali
                const initialPos = user?.coordinate
                    ? { lat: Number(user.coordinate.latitude), lng: Number(user.coordinate.longitude) }
                    : { lat: -2.476443, lng: 121.925435 };

                if (mapRef.current && !map) {
                    const newMap = new Map(mapRef.current, {
                        center: initialPos,
                        zoom: 17,
                        mapId: '384e4f41c1d8c24aaf3284e6',
                        disableDefaultUI: true,
                        gestureHandling: 'greedy',
                    });

                    const pin = new PinElement({
                        background: "#ec4899",
                        glyphColor: "#fff",
                        borderColor: "#be185d"
                    });

                    const newMarker = new AdvancedMarkerElement({
                        map: newMap,
                        position: initialPos,
                        content: pin.element,
                        title: "Lokasi Rumah"
                    });

                    markerRef.current = newMarker;

                    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
                        if (e.latLng) {
                            const clickedPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                            updateMarkerAndPan(clickedPos);
                        }
                    });

                    setMap(newMap);
                    setSelectedPos(initialPos);

                    // 2. OTOMATIS cari lokasi saat ini jika user belum punya koordinat tersimpan
                    if (!user?.coordinate) {
                        setTimeout(() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    const currentPos = {
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude
                                    };
                                    updateMarkerAndPan(currentPos);
                                    newMarker.position = currentPos;
                                });
                            }
                        }, 1000);
                    }
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
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 active:bg-gray-200 shadow-sm"
                    >
                        <FaArrowLeft size={18} />
                    </button>
                    <h1 className="font-bold text-gray-800 tracking-tight text-lg">Atur Lokasi Rumah</h1>
                </div>

                {/* Tombol Gunakan Lokasi Saat Ini */}
                <button
                    onClick={getCurrentLocation}
                    disabled={isDetecting}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-full text-xs font-black uppercase tracking-tight active:scale-95 transition-all"
                >
                    <FaCrosshairs className={isDetecting ? "animate-spin" : ""} />
                    {isDetecting ? "Mendeteksi..." : "Lokasi Saat Ini"}
                </button>
            </div>

            <div ref={mapRef} className="flex-1 w-full h-full relative z-0" />

            <div className="fixed bottom-24 left-0 right-0 px-4 z-20 pointer-events-none">
                <Card className="p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-pink-50 bg-white/95 backdrop-blur-md rounded-[28px] pointer-events-auto max-w-md mx-auto transform transition-all active:scale-[0.98]">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                                <FaMapMarkerAlt size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">
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

            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.15em] shadow-xl border border-white/10">
                    Klik peta atau gunakan tombol GPS diatas
                </div>
            </div>
        </div>
    );
}