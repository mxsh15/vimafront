"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";

type LatLng = { lat: number; lng: number };

export function SelectLocationMap({
    value,
    onChange,
    className = "",
}: {
    value: LatLng | null;
    onChange: (p: LatLng) => void;
    className?: string;
}) {
    const mapKey = process.env.NEXT_PUBLIC_NESHAN_MAP_KEY;

    const tehran = useMemo(() => ({ lat: 35.6892, lng: 51.389 }), []);
    const center = value ?? tehran;

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const clickHandlerRef = useRef<((e: any) => void) | null>(null);

    // هر وقت value از بیرون عوض شد: مارکر/سنتر آپدیت
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // اگر مختصات داریم، مارکر را همانجا ببر
        if (value) {
            const lngLat: [number, number] = [value.lng, value.lat];

            if (!markerRef.current) {
                markerRef.current = new nmp_mapboxgl.Marker({ draggable: false })
                    .setLngLat(lngLat)
                    .addTo(map);
            } else {
                markerRef.current.setLngLat(lngLat);
            }

            // نرم و تمیز سنتر کن
            map.flyTo?.({ center: lngLat, zoom: Math.max(map.getZoom?.() ?? 14, 15) });
        }
    }, [value]);

    // cleanup
    useEffect(() => {
        return () => {
            const map = mapRef.current;
            if (map && clickHandlerRef.current) {
                map.off?.("click", clickHandlerRef.current);
            }
            clickHandlerRef.current = null;

            if (markerRef.current) {
                markerRef.current.remove?.();
                markerRef.current = null;
            }

            mapRef.current = null;
        };
    }, []);

    if (!mapKey) {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                کلید نقشه نشان تنظیم نشده. مقدار{" "}
                <code className="font-mono">NEXT_PUBLIC_NESHAN_MAP_KEY</code> را در{" "}
                <code className="font-mono">.env.local</code> قرار بده.
            </div>
        );
    }

    function useMyLocation() {
        if (!navigator.geolocation)
            return alert("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.");

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                onChange(p);

                const map = mapRef.current;
                if (map) {
                    map.flyTo?.({ center: [p.lng, p.lat], zoom: 16 });
                }
            },
            () => alert("دسترسی موقعیت مکانی رد شد یا خطا رخ داد.")
        );
    }

    console.log("NESHAN KEY:", process.env.NEXT_PUBLIC_NESHAN_MAP_KEY);

    return (
        <div className={`rounded-xl border border-slate-200 overflow-hidden bg-white ${className}`}>
                <div className="flex items-center justify-between p-2 border-b border-slate-200">
                <div className="text-sm font-medium">انتخاب موقعیت روی نقشه</div>
                <button
                    type="button"
                    onClick={useMyLocation}
                    className="text-xs rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50"
                >
                    موقعیت فعلی
                </button>
            </div>
                <div className="h-[320px] w-full">
                    {/* بارگذاری پویاِ کامپوننت React نقشه اگر موجود باشد، وگرنه fallback */}
                    <MapLoader
                        mapKey={mapKey}
                        center={center}
                        value={value}
                        onMapReady={(map) => (mapRef.current = map)}
                        onMarkerCreate={(lngLat) => {
                            if (!markerRef.current) markerRef.current = new nmp_mapboxgl.Marker({ draggable: false }).setLngLat(lngLat).addTo(mapRef.current as any);
                            else markerRef.current.setLngLat(lngLat);
                        }}
                        onMapClick={(lng, lat) => onChange({ lat, lng })}
                    />
                </div>

            <div className="p-2 text-xs text-slate-600">
                {value ? (
                    <span>
                        مختصات انتخاب‌شده:{" "}
                        <span className="font-mono">
                            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                        </span>
                    </span>
                ) : (
                    <span>روی نقشه کلیک کنید تا موقعیت دقیق ثبت شود.</span>
                )}
            </div>
        </div>
    );
}

function MapLoader({
    mapKey,
    center,
    value,
    onMapReady,
    onMarkerCreate,
    onMapClick,
}: {
    mapKey: string | undefined;
    center: LatLng;
    value: LatLng | null;
    onMapReady: (map: any) => void;
    onMarkerCreate: (lngLat: [number, number]) => void;
    onMapClick: (lng: number, lat: number) => void;
}) {
    return (
        <div className="h-full flex items-center justify-center text-sm text-slate-600">
            کامپوننت نقشه نصب نیست؛ برای فعال‌سازی، بستهٔ @neshan-maps-platform/mapbox-gl-react را نصب کنید.
        </div>
    );
}
