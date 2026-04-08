// hooks/usePushNotifications.tsx — MASTRO MONTAGGI push notifications
'use client';
import React, { useState, useEffect, useCallback } from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';

// VAPID public key — PLACEHOLDER: genera con web-push e sostituisci
const VAPID_PUBLIC = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkGs-GDq6gGBHvtSsBlz4JFr_json-placeholder_replace-me';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type PushState = 'unsupported' | 'denied' | 'prompt' | 'granted' | 'subscribed';

export function usePushNotifications(operatoreId?: string) {
  const [state, setState] = useState<PushState>('unsupported');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    const perm = Notification.permission;
    if (perm === 'denied') setState('denied');
    else if (perm === 'granted') {
      // Check if already subscribed
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setState(sub ? 'subscribed' : 'granted');
        });
      });
    } else {
      setState('prompt');
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        setLoading(false);
        return;
      }
      setState('granted');
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });

      // Salva su Supabase
      if (operatoreId) {
        await fetch(`${SB_URL}/rest/v1/push_subscriptions`, {
          method: 'POST',
          headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            operatore_id: operatoreId,
            subscription: JSON.stringify(sub),
            created_at: new Date().toISOString(),
          }),
        });
      }
      setState('subscribed');
    } catch (err) {
      console.error('[Push] Subscribe failed', err);
    }
    setLoading(false);
  }, [operatoreId]);

  return { state, subscribe, loading };
}

// ─── BANNER RICHIESTA PERMESSO ────────────────────────────────────────────────
export function PushPermissionBanner({ operatoreId }: { operatoreId?: string }) {
  const { state, subscribe, loading } = usePushNotifications(operatoreId);
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || state === 'subscribed' || state === 'unsupported' || state === 'denied') return null;

  return (
    <div style={{
      position: 'fixed', top: 60, left: 12, right: 12, zIndex: 9998,
      background: 'linear-gradient(135deg, #0D1F1F, #1a3a3a)',
      color: '#fff', borderRadius: 14, padding: '14px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,.4)',
      fontFamily: 'system-ui', animation: 'slideDown .3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(40,160,160,.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Attiva le notifiche</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Ricevi avvisi per nuove commesse e urgenze</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={subscribe}
          disabled={loading}
          style={{
            flex: 1, background: '#28A0A0', border: 'none', color: '#fff',
            borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Attivazione...' : 'Attiva'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', borderRadius: 10, padding: '10px 16px', fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Dopo
        </button>
      </div>
      <style>{`
        @keyframes slideDown { from { transform: translateY(-60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
