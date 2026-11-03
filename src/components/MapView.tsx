import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { ASWAN_CENTER, type GambiItem } from "@/lib/gambi";

interface Props {
  items: (GambiItem & { distance?: number })[];
  me: { lat: number; lng: number } | null;
  focusId: number | null;
}

// Leaflet is imported dynamically inside effects so SSR never touches `window`.
export function MapView({ items, me, focusId }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const markers = useRef(new Map<number, Leaflet.Marker>());

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || mapRef.current) return;
      const L = (mod.default ?? mod) as typeof Leaflet;
      LRef.current = L;
      const map = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(
        [ASWAN_CENTER.lat, ASWAN_CENTER.lng],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: "abc",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      render();
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function render() {
    const L = LRef.current;
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!L || !layer || !map) return;
    layer.clearLayers();
    markers.current.clear();
    const pts: [number, number][] = [];
    items.forEach((it) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="gambi-pin ${it.type}"><span class="ring"></span><span class="core"></span></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker([it.lat, it.lng], { icon })
        .bindPopup(`<b style="font-family:Cairo">${it.title}</b><br/><span style="opacity:.7">${it.placeName}</span>`)
        .addTo(layer);
      markers.current.set(it.id, m);
      pts.push([it.lat, it.lng]);
    });
    if (me) {
      L.marker([me.lat, me.lng], {
        icon: L.divIcon({ className: "", html: `<div class="gambi-pin me"><span class="ring"></span><span class="core"></span></div>`, iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).bindPopup("انت هنا").addTo(layer);
      pts.push([me.lat, me.lng]);
    }
    if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.15), { duration: 0.8, maxZoom: 15 });
  }

  useEffect(render, [items, me]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (focusId == null) return;
    const m = markers.current.get(focusId);
    if (m && mapRef.current) {
      mapRef.current.flyTo(m.getLatLng(), 16, { duration: 0.8 });
      m.openPopup();
    }
  }, [focusId]);

  return <div ref={el} className="gambi-map h-full w-full" />;
}
