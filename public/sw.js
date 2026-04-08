// MASTRO MONTAGGI — Service Worker v1.0
// Cache-first per static, network-first per API, offline queue per POST/PATCH
const CACHE_NAME = 'mastro-montaggi-v1';
const API_CACHE = 'mastro-api-v1';
const OFFLINE_QUEUE = 'mastro-offline-queue';

// Static assets da pre-cachare
const PRECACHE = [
  '/',
  '/manifest.json',
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 1) POST/PATCH Supabase → se offline, accoda
  if (url.hostname.includes('supabase.co') && (e.request.method === 'POST' || e.request.method === 'PATCH')) {
    e.respondWith(handleMutationRequest(e.request));
    return;
  }

  // 2) GET Supabase REST → network-first, fallback cache
  if (url.hostname.includes('supabase.co') && e.request.method === 'GET') {
    e.respondWith(networkFirstApi(e.request));
    return;
  }

  // 3) Static assets → cache-first
  if (e.request.method === 'GET') {
    e.respondWith(cacheFirst(e.request));
    return;
  }
});

// ─── CACHE-FIRST (static) ─────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// ─── NETWORK-FIRST (API GET) ──────────────────────────────────────────────────
async function networkFirstApi(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── OFFLINE QUEUE (POST/PATCH) ───────────────────────────────────────────────
async function handleMutationRequest(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch {
    // Offline → salva in IndexedDB queue
    const body = await request.text();
    const queueItem = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: Date.now(),
    };
    await saveToQueue(queueItem);
    // Notifica il client
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'QUEUED_OFFLINE', item: queueItem });
    });
    return new Response(JSON.stringify({ queued: true, id: queueItem.id }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── IndexedDB per offline queue ──────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('mastro-offline', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToQueue(item) {
  const db = await openDB();
  const tx = db.transaction('queue', 'readwrite');
  tx.objectStore('queue').put(item);
  return new Promise((resolve) => { tx.oncomplete = resolve; });
}

async function getQueue() {
  const db = await openDB();
  const tx = db.transaction('queue', 'readonly');
  const store = tx.objectStore('queue');
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

async function removeFromQueue(id) {
  const db = await openDB();
  const tx = db.transaction('queue', 'readwrite');
  tx.objectStore('queue').delete(id);
  return new Promise((resolve) => { tx.oncomplete = resolve; });
}

// ─── SYNC quando torna online ─────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SYNC_QUEUE') {
    e.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  const queue = await getQueue();
  if (!queue.length) return;

  const clients = await self.clients.matchAll();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (response.ok) {
        await removeFromQueue(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  // Notifica i client del risultato sync
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_RESULT',
      synced,
      failed,
      remaining: failed,
    });
  });
}
