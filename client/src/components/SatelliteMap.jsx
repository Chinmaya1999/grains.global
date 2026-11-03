import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DESTS, ORIGINS } from '../lib/corridor.js';

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const ATTR = 'Imagery &copy; Esri &mdash; Maxar, Earthstar Geographics, GIS User Community';

// [lat, lng]
const HUBS = [
  { id: 'india', ll: [22.5, 78.5], label: 'India', sub: 'Supply' },
  { id: 'me', ll: [25, 49], label: 'Middle East', sub: 'Demand' },
  { id: 'africa', ll: [4, 24], label: 'Africa', sub: 'Demand' },
];
const hub = (id) => HUBS.find((h) => h.id === id).ll;

// Curved route between two points (quadratic Bezier in lat/lng, bowed northward).
function curve(a, b, bow) {
  const m = [(a[0] + b[0]) / 2 + Math.abs(a[1] - b[1]) * bow, (a[1] + b[1]) / 2];
  return Array.from({ length: 41 }, (_, i) => {
    const t = i / 40, u = 1 - t;
    return [u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]];
  });
}

const pinIcon = (h) => L.divIcon({
  className: 'lf-pin', iconSize: [0, 0],
  html: `<div class="pin"><div class="pc"><b>${h.label}</b><span>(${h.sub})</span></div><i></i></div>`,
});

export default function SatelliteMap() {
  const el = useRef(null);
  useEffect(() => {
    // Static background picture: no controls, no dragging.
    const map = L.map(el.current, {
      zoomControl: false, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false,
      minZoom: 2, maxZoom: 7, zoomSnap: 0.25, attributionControl: false,
    });
    L.control.attribution({ prefix: false, position: 'topright' }).addAttribution(ATTR).addTo(map);
    L.tileLayer(`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 9, crossOrigin: true }).addTo(map);
    L.tileLayer(`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 9, opacity: 0.85, crossOrigin: true }).addTo(map);

    const routes = [[hub('india'), hub('me'), 0.22], [hub('me'), hub('africa'), 0.3], [hub('india'), hub('africa'), 0.42]];
    routes.forEach(([a, b, bow]) => {
      const pts = curve(a, b, bow);
      L.polyline(pts, { color: '#0b2a33', weight: 8, opacity: 0.35, interactive: false }).addTo(map);
      L.polyline(pts, { color: '#ff8a1f', weight: 4, opacity: 0.95, interactive: false }).addTo(map);
      L.polyline(pts, { color: '#ffffff', weight: 2, dashArray: '6 8', className: 'route-flow', interactive: false }).addTo(map);
    });
    // actual ports from the corridor data
    [...Object.values(ORIGINS).map((o) => ({ name: `${o.name} (origin)`, ll: [o.lonlat[1], o.lonlat[0]] })), ...DESTS.map((d) => ({ name: `${d.name}, ${d.country}`, ll: [d.lonlat[1], d.lonlat[0]] }))]
      .forEach((p) => L.circleMarker(p.ll, { radius: 4.5, color: '#fff', weight: 2, fillColor: '#f2b01e', fillOpacity: 1 }).addTo(map));
    HUBS.forEach((h) => L.marker(h.ll, { icon: pinIcon(h), keyboard: false, interactive: false }).addTo(map));

    // On wide screens push the corridor to the right so the headline and woman sit over open ground.
    const fit = () => {
      map.invalidateSize();
      const w = el.current.clientWidth, wide = w > 1180;
      map.fitBounds([[-30, -6], [40, 96]], { paddingTopLeft: [wide ? w * 0.4 : 6, wide ? 56 : 8], paddingBottomRight: [8, wide ? 70 : 8], animate: false });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.current);
    return () => { ro.disconnect(); map.remove(); };
  }, []);
  return <div ref={el} className="satmap" role="img" aria-label="Satellite map of the trade corridor between India, the Middle East and Africa" />;
}
