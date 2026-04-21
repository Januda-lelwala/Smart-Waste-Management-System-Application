'use client';

import { useEffect, useRef } from 'react';
import type { Bin } from '@/lib/types';

interface Props { bins: Bin[] }

const STATUS_COLOR: Record<string, string> = {
  ok: '#34D399',
  warning: '#FBBF24',
  critical: '#F87171',
};

export default function MapView({ bins }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (leafletRef.current) return;

    import('leaflet').then(L => {
      if (!mapRef.current || leafletRef.current) return;

      const map = L.map(mapRef.current, {
        center: [14.599, 120.984],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      bins.forEach(bin => {
        const color = bin.offline ? '#4D5F75' : STATUS_COLOR[bin.status];
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:24px;height:24px">
              ${!bin.offline && bin.status !== 'ok' ? `
                <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.35;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite"></div>
              ` : ''}
              <div style="position:relative;width:24px;height:24px;border-radius:50%;background:#0F1624;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-size:10px;color:${color};font-weight:700">
                ${bin.fill}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([bin.lat, bin.lng], { icon });
        marker.bindPopup(`
          <div style="min-width:160px">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${bin.label}</div>
            <div style="color:#8494A8;font-size:11px;margin-bottom:8px">${bin.id} · ${bin.zone}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
              <span>Fill</span><span style="color:${color};font-weight:700">${bin.fill}%</span>
            </div>
            <div style="background:#1E2B3F;height:4px;border-radius:4px;overflow:hidden;margin-bottom:8px">
              <div style="width:${bin.fill}%;height:100%;background:${color}"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span>Battery</span><span style="color:#8494A8">${bin.battery}%</span>
            </div>
            ${bin.offline ? '<div style="color:#F87171;font-size:10px;margin-top:6px">● Offline</div>' : ''}
          </div>
        `);
        marker.addTo(map);
      });

      leafletRef.current = map;
    });

    return () => {
      if (leafletRef.current) {
        (leafletRef.current as { remove: () => void }).remove();
        leafletRef.current = null;
      }
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', height: '100%', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <style>{`
        .leaflet-container { background: #080D18; font-family: 'IBM Plex Sans', sans-serif; }
        .leaflet-control-zoom { border: 1px solid #1E2B3F !important; border-radius: 8px !important; overflow: hidden; }
        .leaflet-control-zoom a { background: #0F1624 !important; color: #8494A8 !important; border-color: #1E2B3F !important; }
        .leaflet-control-zoom a:hover { background: #192236 !important; color: #E4EBF5 !important; }
        .leaflet-control-attribution { background: rgba(12,20,32,0.6) !important; color: #4D5F75 !important; font-size: 9px !important; }
        .leaflet-popup-content-wrapper { background: #0F1624 !important; border: 1px solid #1E2B3F !important; border-radius: 10px !important; color: #E4EBF5 !important; box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important; }
        .leaflet-popup-tip { background: #0F1624 !important; }
        .leaflet-popup-close-button { color: #4D5F75 !important; }
        @keyframes ping { 0%{transform:scale(1);opacity:0.4} 75%,100%{transform:scale(2.2);opacity:0} }
      `}</style>

      <div ref={mapRef} style={{ width: '100%', height: '100%' }}/>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
        background: 'rgba(15,22,36,0.92)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {[['var(--ok)', 'OK (< 60%)'], ['var(--warning)', 'Warning (60–84%)'], ['var(--critical)', 'Critical (≥ 85%)'], ['var(--text-muted)', 'Offline']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}/>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}