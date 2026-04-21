'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import PulseDot from '@/components/ui/PulseDot';
import MapView from '@/components/views/MapView';
import BinsView from '@/components/views/BinsView';
import RoutesView from '@/components/views/RoutesView';
import AlertsView from '@/components/views/AlertsView';
import AnalyticsView from '@/components/views/AnalyticsView';
import { BINS, ALERTS, ROUTE, ANALYTICS, ZONES } from '@/lib/mock-data';
import type { Bin, Alert, Route, AnalyticsData, Zone, ViewId } from '@/lib/types';

const VIEW_TITLES: Record<ViewId, string> = {
  map:       'Live Map',
  bins:      'Bins Overview',
  route:     'Route Optimisation',
  alerts:    'Alerts & Notifications',
  analytics: 'Analytics',
};

const POLL_INTERVAL = 8000; // ms — how often to re-fetch bins from API

export default function Dashboard() {
  const [view, setView]           = useState<ViewId>('map');
  const [bins, setBins]           = useState<Bin[]>(BINS);
  const [alerts, setAlerts]       = useState<Alert[]>(ALERTS.map(a => ({ ...a, read: false })));
  const [route, setRoute]         = useState<Route>(ROUTE);
  const [analytics, setAnalytics] = useState<AnalyticsData>(ANALYTICS);
  const [zones, setZones]         = useState<Zone[]>(ZONES);
  const [apiReady, setApiReady]   = useState(false);

  // Initial load from API (falls back to mock data on error)
  useEffect(() => {
    async function bootstrap() {
      try {
        const [binsRes, alertsRes, routesRes, analyticsRes, zonesRes] = await Promise.all([
          fetch('/api/bins'),
          fetch('/api/alerts'),
          fetch('/api/pickup-routes'),
          fetch('/api/analytics'),
          fetch('/api/zones'),
        ]);

        if (binsRes.ok)      setBins(await binsRes.json());
        if (alertsRes.ok)    setAlerts(await alertsRes.json());
        if (routesRes.ok)    { const routes = await routesRes.json(); if (routes[0]) setRoute(routes[0]); }
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (zonesRes.ok)     setZones(await zonesRes.json());
        setApiReady(true);
      } catch {
        // API not reachable — keep mock data, no crash
        console.warn('API unavailable, using mock data');
      }
    }
    bootstrap();
  }, []);

  // Poll bins every POLL_INTERVAL when API is live
  useEffect(() => {
    if (!apiReady) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/bins');
        if (res.ok) setBins(await res.json());
      } catch { /* swallow — keep last known state */ }
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [apiReady]);

  // Local fill simulation when API is not yet live (dev without backend)
  useEffect(() => {
    if (apiReady) return;
    const id = setInterval(() => {
      setBins(prev => prev.map(b => {
        if (b.offline) return b;
        const delta = (Math.random() - 0.35) * 3;
        const fill = Math.max(0, Math.min(100, Math.round(b.fill + delta)));
        const status = fill >= 85 ? 'critical' : fill >= 60 ? 'warning' : 'ok';
        return { ...b, fill, status, lastPing: Date.now() };
      }));
    }, 4000);
    return () => clearInterval(id);
  }, [apiReady]);

  const markRead = useCallback(async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    try { await fetch(`/api/alerts/${id}`, { method: 'PATCH' }); } catch { /* optimistic */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    try { await fetch('/api/alerts', { method: 'PATCH' }); } catch { /* optimistic */ }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar bins={bins} alerts={alerts}/>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={view} onNav={setView} alerts={alerts}/>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Breadcrumb bar */}
          <div style={{
            height: 40,
            display: 'flex', alignItems: 'center', padding: '0 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            flexShrink: 0,
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Dashboard</span>
            <span style={{ color: 'var(--border-hi)', margin: '0 8px' }}>›</span>
            <span style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 600 }}>
              {VIEW_TITLES[view]}
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              {view === 'map' && <><PulseDot color="var(--ok)"/><span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Live feed</span></>}
              {apiReady
                ? <span style={{ color: 'var(--ok)', fontSize: 10, marginLeft: 8 }}>● API</span>
                : <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 8 }}>◌ Mock data</span>
              }
            </span>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {view === 'map'       && <div style={{ height: '100%' }}><MapView bins={bins}/></div>}
            {view === 'bins'      && <BinsView bins={bins}/>}
            {view === 'route'     && <RoutesView bins={bins} route={route}/>}
            {view === 'alerts'    && <AlertsView alerts={alerts} onMarkRead={markRead} onMarkAllRead={markAllRead}/>}
            {view === 'analytics' && <AnalyticsView analytics={analytics} zones={zones}/>}
          </div>
        </div>
      </div>
    </div>
  );
}