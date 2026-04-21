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
import type { Bin, Alert, ViewId } from '@/lib/types';

const VIEW_TITLES: Record<ViewId, string> = {
  map:       'Live Map',
  bins:      'Bins Overview',
  route:     'Route Optimisation',
  alerts:    'Alerts & Notifications',
  analytics: 'Analytics',
};

export default function Dashboard() {
  const [view, setView] = useState<ViewId>('map');
  const [bins, setBins] = useState<Bin[]>(BINS);
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS.map(a => ({ ...a, read: false })));

  // Simulate live fill-level updates
  useEffect(() => {
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
  }, []);

  const markRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
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
            {view === 'map' && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PulseDot color="var(--ok)"/>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Live feed</span>
              </span>
            )}
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {view === 'map'       && <div style={{ height: '100%' }}><MapView bins={bins}/></div>}
            {view === 'bins'      && <BinsView bins={bins}/>}
            {view === 'route'     && <RoutesView bins={bins} route={ROUTE}/>}
            {view === 'alerts'    && <AlertsView alerts={alerts} onMarkRead={markRead} onMarkAllRead={markAllRead}/>}
            {view === 'analytics' && <AnalyticsView analytics={ANALYTICS} zones={ZONES}/>}
          </div>
        </div>
      </div>
    </div>
  );
}