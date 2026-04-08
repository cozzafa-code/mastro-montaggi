// hooks/useOffline.ts — MASTRO MONTAGGI offline hook
'use client';
import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  queueCount: number;
  isSyncing: boolean;
  lastSync: string | null;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    queueCount: 0,
    isSyncing: false,
    lastSync: null,
  });

  // Registra Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('[SW] Registered', reg.scope);
      }).catch((err) => {
        console.error('[SW] Registration failed', err);
      });
    }
  }, []);

  // Ascolta online/offline
  useEffect(() => {
    const goOnline = () => {
      setState((s) => ({ ...s, isOnline: true }));
      // Trigger sync della queue
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_QUEUE' });
        setState((s) => ({ ...s, isSyncing: true }));
      }
    };
    const goOffline = () => {
      setState((s) => ({ ...s, isOnline: false }));
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Ascolta messaggi dal SW
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'QUEUED_OFFLINE') {
        setState((s) => ({ ...s, queueCount: s.queueCount + 1 }));
      }
      if (e.data?.type === 'SYNC_RESULT') {
        setState((s) => ({
          ...s,
          isSyncing: false,
          queueCount: e.data.remaining || 0,
          lastSync: new Date().toLocaleTimeString('it-IT'),
        }));
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  const manualSync = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC_QUEUE' });
      setState((s) => ({ ...s, isSyncing: true }));
    }
  }, []);

  return { ...state, manualSync };
}

// ─── COMPONENTE BANNER OFFLINE ────────────────────────────────────────────────
export function OfflineBanner() {
  const { isOnline, queueCount, isSyncing, lastSync, manualSync } = useOffline();

  if (isOnline && queueCount === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 70, left: 12, right: 12, zIndex: 9999,
      background: isOnline ? '#065F46' : '#92400E',
      color: '#fff', borderRadius: 12, padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,.3)',
      fontFamily: 'system-ui', fontSize: 13, fontWeight: 600,
      animation: 'slideUp .3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Dot pulsante */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isOnline ? '#34D399' : '#FCD34D',
          animation: isOnline ? 'none' : 'pulse 1.5s infinite',
        }} />
        <span>
          {!isOnline && 'Offline — i dati verranno sincronizzati'}
          {isOnline && isSyncing && 'Sincronizzazione in corso...'}
          {isOnline && !isSyncing && queueCount > 0 && `${queueCount} operazioni in coda`}
        </span>
      </div>
      {isOnline && queueCount > 0 && !isSyncing && (
        <button
          onClick={manualSync}
          style={{
            background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)',
            color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 12,
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          Sincronizza
        </button>
      )}
      {lastSync && isOnline && queueCount === 0 && (
        <span style={{ fontSize: 11, opacity: 0.8 }}>Ultimo sync: {lastSync}</span>
      )}
      <style>{`
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
