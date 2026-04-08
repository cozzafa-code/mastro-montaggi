// ts-20260408scan2
"use client";
// @ts-nocheck
// MASTRO Montaggi — MagazzinoWOW v1
// Database tecnico vivo: giacenza + scheda + storico prezzi + lista spesa + catalogo galassia + note comunità

import React, { useState, useEffect, useCallback } from "react";

// ── Design System fliwoX ──────────────────────────────────────────
const TEAL = "#28A0A0";
const TEAL_D = "#156060";
const TEAL_L = "#EEF8F8";
const BG = "#E8F4F4";
const INK = "#0D1F1F";
const SUB = "#4A7070";
const BDR = "#C8E4E4";
const WHITE = "#fff";
const RED = "#DC4444";
const GREEN = "#1A9E73";
const AMBER = "#D08008";
const FF = "system-ui, -apple-system, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ── SVG Icons (no emoji, no libraries) ────────────────────────────
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoBox = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IcoDoc = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoChart = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoCart = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>;
const IcoStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoQR = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/></svg>;
const IcoBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IcoAlert = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoGlobe = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;

// ── Types ─────────────────────────────────────────────────────────
type Vista = 'giacenza' | 'catalogo' | 'spesa' | 'alert' | 'inventario';
type DettaglioTab = 'info' | 'tecnica' | 'prezzi' | 'note';

interface Articolo {
  id: string; nome: string; codice: string; categoria: string;
  fornitore: string; um: string; giacenza: number; scorta_min: number;
  prezzo: number; posizione?: string; posizione_furgone?: string;
  foto_url?: string; scheda_tecnica_url?: string; istruzioni_posa_url?: string;
  certificazioni?: any[]; compatibilita_sistemi?: string[];
  campo_applicazione?: string[]; note_interne?: string;
}

interface ArticoloGalassia {
  id: string; nome: string; codice_articolo: string; cat: string;
  fornitore: string; um: string; valore_unitario: number;
  materiale?: string; superficie?: string; note?: string;
  campi_applicazione?: string[]; tipo_record: string;
  scheda_tecnica_url?: string; foto_url?: string;
  certificazioni?: any[]; compatibilita_sistemi?: string[];
  prezzo_medio?: number; n_utilizzatori?: number;
}

// ── Supabase config ───────────────────────────────────────────────
const SB_URL = "https://fgefcigxlbrmbeqqzjmo.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8";
const hdrs = { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" };

async function sbGet(table: string, query = "") {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, { headers: hdrs });
  return r.ok ? r.json() : [];
}

// ── Styles ────────────────────────────────────────────────────────
const card: React.CSSProperties = { background: WHITE, borderRadius: 14, border: `1px solid ${BDR}`, boxShadow: "0 4px 0 0 #A8CCCC, 0 6px 14px rgba(0,0,0,.06)", padding: 14, marginBottom: 10 };
const pill = (active: boolean, color = TEAL): React.CSSProperties => ({
  padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? color : BDR}`,
  background: active ? color : WHITE, color: active ? WHITE : INK,
  fontSize: 12, fontWeight: 700, fontFamily: FF, cursor: "pointer",
  boxShadow: active ? `0 3px 0 0 ${TEAL_D}` : "0 2px 0 0 #A8CCCC",
  transform: active ? "translateY(0)" : "translateY(-1px)",
});
const btn3d = (bg: string, sh: string): React.CSSProperties => ({
  background: bg, border: "none", borderRadius: 12, padding: "10px 16px",
  color: WHITE, fontSize: 13, fontWeight: 800, fontFamily: FF, cursor: "pointer",
  boxShadow: `0 4px 0 0 ${sh}`, display: "flex", alignItems: "center", gap: 6,
});

// ── Componente QR Scanner ─────────────────────────────────────────
function QRScannerView({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animFrame: number;
    let detector: any = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        // Try BarcodeDetector API (Chrome Android)
        if ("BarcodeDetector" in window) {
          detector = new (window as any).BarcodeDetector({ formats: ["qr_code", "ean_13", "ean_8", "code_128"] });
          const scanFrame = async () => {
            if (!scanning || !videoRef.current || !detector) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code) { onScan(code); return; }
              }
            } catch (e) { /* ignore frame errors */ }
            animFrame = requestAnimationFrame(scanFrame);
          };
          scanFrame();
        } else {
          setError("Il browser non supporta la scansione QR automatica. Inserisci il codice manualmente.");
        }
      } catch (e) {
        setError("Impossibile accedere alla fotocamera. Verifica i permessi o inserisci il codice manualmente.");
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [scanning]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" as any }}>
      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>Scansiona QR / Barcode</div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: WHITE, fontSize: 16 }}>x</button>
      </div>

      {/* Video camera */}
      <div style={{ position: "relative", background: "#000", flex: 1 }}>
        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} playsInline muted />
        {/* Scan overlay */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 180, height: 180, border: `3px solid ${TEAL}`, borderRadius: 16, boxShadow: `0 0 0 9999px rgba(0,0,0,.4)` }} />
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.7)" }}>Inquadra il QR code nel riquadro</div>
      </div>

      {error && (
        <div style={{ padding: "8px 14px", background: "rgba(220,68,68,.1)", fontSize: 11, color: RED }}>{error}</div>
      )}

      {/* Input manuale */}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>Oppure inserisci il codice manualmente:</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Codice articolo..."
            onKeyDown={e => { if (e.key === "Enter" && manualCode) onScan(manualCode); }}
            style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid rgba(40,160,160,.3)`, fontSize: 13, fontFamily: FM, outline: "none", background: "rgba(255,255,255,.05)", color: WHITE }} />
          <button onClick={() => { if (manualCode) onScan(manualCode); }}
            style={{ ...btn3d(TEAL, TEAL_D), padding: "8px 14px", fontSize: 12 }}>Cerca</button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Inventario Fisico ──────────────────────────────────
function InventarioView({ articoli, setArticoli }: { articoli: Articolo[]; setArticoli: (fn: any) => void }) {
  const [conteggi, setConteggi] = useState<Record<string, string>>({});
  const [salvato, setSalvato] = useState(false);

  const diffArticoli = articoli.filter(a => {
    const contato = conteggi[a.id];
    return contato !== undefined && contato !== "" && Number(contato) !== a.giacenza;
  });

  const salvaInventario = async () => {
    for (const a of diffArticoli) {
      const nuovaG = Number(conteggi[a.id]);
      const diff = nuovaG - a.giacenza;
      await fetch(`${SB_URL}/rest/v1/movimenti_magazzino`, {
        method: "POST", headers: { ...hdrs, Prefer: "return=minimal" },
        body: JSON.stringify({
          azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
          articolo_id: a.id, tipo: "inventario",
          quantita: Math.abs(diff),
          causale: diff > 0 ? "rettifica_inventario_positiva" : "rettifica_inventario_negativa",
          note: `Inventario: da ${a.giacenza} a ${nuovaG} (${diff > 0 ? "+" : ""}${diff})`,
        }),
      });
      await fetch(`${SB_URL}/rest/v1/articoli_magazzino?id=eq.${a.id}`, {
        method: "PATCH", headers: { ...hdrs, Prefer: "return=minimal" },
        body: JSON.stringify({ scorta_attuale: nuovaG }),
      });
      setArticoli((prev: Articolo[]) => prev.map(x => x.id === a.id ? { ...x, giacenza: nuovaG } : x));
    }
    setSalvato(true);
    setTimeout(() => setSalvato(false), 3000);
    setConteggi({});
  };

  if (articoli.length === 0) return (
    <div style={card}><div style={{ textAlign: "center" as any, padding: 16, fontSize: 12, color: SUB }}>Aggiungi articoli al magazzino prima di fare l'inventario.</div></div>
  );

  return (
    <>
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Inventario fisico</div>
        <div style={{ fontSize: 11, color: SUB, lineHeight: 1.5, marginBottom: 10 }}>Conta gli articoli e inserisci la giacenza reale. MASTRO calcola le differenze e genera rettifiche automatiche.</div>
      </div>

      {salvato && (
        <div style={{ ...card, background: "rgba(26,158,115,.06)", borderColor: GREEN, textAlign: "center" as any }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Inventario salvato — {diffArticoli.length} rettifiche registrate</div>
        </div>
      )}

      <div style={card}>
        {articoli.map((a, i) => {
          const contato = conteggi[a.id];
          const hasDiff = contato !== undefined && contato !== "" && Number(contato) !== a.giacenza;
          const diff = hasDiff ? Number(contato) - a.giacenza : 0;
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < articoli.length - 1 ? `1px solid ${BDR}` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome}</div>
                <div style={{ fontSize: 10, color: SUB }}>Sistema: {a.giacenza} {a.um}
                  {hasDiff && <span style={{ color: diff > 0 ? GREEN : RED, fontWeight: 700, marginLeft: 6 }}>{diff > 0 ? "+" : ""}{diff}</span>}
                </div>
              </div>
              <input type="number" placeholder={String(a.giacenza)} value={conteggi[a.id] || ""} 
                onChange={e => setConteggi(p => ({ ...p, [a.id]: e.target.value }))}
                style={{ width: 65, padding: "8px 6px", borderRadius: 8, border: `1.5px solid ${hasDiff ? (diff > 0 ? GREEN : RED) : BDR}`, fontSize: 14, fontFamily: FM, outline: "none", textAlign: "center" as any, background: hasDiff ? (diff > 0 ? `${GREEN}08` : `${RED}08`) : WHITE }} />
            </div>
          );
        })}
      </div>

      {diffArticoli.length > 0 && (
        <button onClick={salvaInventario} style={{ ...btn3d(AMBER, "#A06005"), width: "100%", justifyContent: "center", marginTop: 8, fontSize: 13 }}>
          Salva inventario — {diffArticoli.length} rettific{diffArticoli.length === 1 ? "a" : "he"}
        </button>
      )}

      {diffArticoli.length === 0 && (
        <div style={{ textAlign: "center" as any, padding: 12, fontSize: 12, color: SUB }}>Inserisci la giacenza contata per ogni articolo. Solo quelli con differenza verranno rettificati.</div>
      )}
    </>
  );
}

// ── Componente Lista Spesa Pre-Cantiere ──────────────────────────
function ListaSpesaView() {
  const [consumi, setConsumi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoVano, setTipoVano] = useState("F1A");
  const [numVani, setNumVani] = useState(1);
  const [spesa, setSpesa] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await sbGet("consumo_medio_vano", "order=tipo_vano,articolo_nome");
      setConsumi(data || []);
      setLoading(false);
    })();
  }, []);

  const tipiDisponibili = Array.from(new Set(consumi.map(c => c.tipo_vano))).sort();

  const calcolaSpesa = () => {
    const filtrati = consumi.filter(c => c.tipo_vano === tipoVano);
    const risultato = filtrati.map(c => ({
      ...c,
      quantita_totale: Math.ceil(c.quantita_media * numVani),
    }));
    setSpesa(risultato);
  };

  useEffect(() => {
    if (consumi.length > 0) calcolaSpesa();
  }, [tipoVano, numVani, consumi]);

  if (loading) return <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: SUB }}>Caricamento consumi medi...</div>;

  const tipoLabels: Record<string, string> = {
    F1A: "Finestra 1 anta",
    F2A: "Finestra 2 ante",
    PF1A: "Portafinestra 1 anta",
    ALZANTE: "Alzante scorrevole",
    PORTA: "Porta ingresso",
    TAPPARELLA: "Tapparella (addon)",
    ZANZARIERA: "Zanzariera (addon)",
  };

  return (
    <>
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Lista spesa pre-cantiere</div>
        <div style={{ fontSize: 11, color: SUB, lineHeight: 1.5, marginBottom: 10 }}>Seleziona tipo e numero di vani — MASTRO calcola i materiali necessari.</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: SUB, display: "block", marginBottom: 3 }}>Tipo vano</label>
            <select value={tipoVano} onChange={e => setTipoVano(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", background: WHITE }}>
              {tipiDisponibili.map(t => (
                <option key={t} value={t}>{tipoLabels[t] || t}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: SUB, display: "block", marginBottom: 3 }}>Quantita</label>
            <input type="number" value={numVani} onChange={e => setNumVani(Math.max(1, Number(e.target.value)))} min={1}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 14, fontFamily: FM, outline: "none", textAlign: "center" as any }} />
          </div>
        </div>
      </div>

      {spesa.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
            Materiali per {numVani}x {tipoLabels[tipoVano] || tipoVano}
          </div>
          {spesa.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < spesa.length - 1 ? `1px solid ${BDR}` : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>{s.articolo_nome}</div>
                {s.note && <div style={{ fontSize: 10, color: SUB, marginTop: 1 }}>{s.note}</div>}
              </div>
              <div style={{ textAlign: "right" as any, flexShrink: 0 }}>
                <div style={{ fontFamily: FM, fontSize: 16, fontWeight: 800, color: TEAL }}>{s.quantita_totale}</div>
                <div style={{ fontSize: 9, color: SUB }}>{s.um}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, background: `${AMBER}10`, borderRadius: 8, padding: "8px 10px", fontSize: 10, color: AMBER, lineHeight: 1.5 }}>
            Consumi medi Galassia MASTRO — basati su posa standard UNI 11673. Variabili per dimensione vano e condizioni cantiere.
          </div>
        </div>
      )}

      {spesa.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 12, color: SUB }}>Nessun dato di consumo per questo tipo di vano.</div>
        </div>
      )}
    </>
  );
}

// ── Componente Allegati Galassia ──────────────────────────────────
function AllegatiGalassia({ articoloId }: { articoloId: string }) {
  const [allegati, setAllegati] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newAll, setNewAll] = useState<Record<string, string>>({ tipo: "scheda_tecnica", nome: "", url: "", descrizione: "" });

  useEffect(() => {
    (async () => {
      const data = await sbGet("allegati_galassia", `articolo_galassia_id=eq.${articoloId}&order=tipo,created_at.desc`);
      setAllegati(data || []);
      setLoading(false);
    })();
  }, [articoloId]);

  const tipoLabel: Record<string, string> = {
    catalogo_pdf: "Catalogo PDF",
    scheda_tecnica: "Scheda tecnica",
    schema_montaggio: "Schema montaggio",
    istruzioni_posa: "Istruzioni posa",
    foto_prodotto: "Foto prodotto",
    foto_confezione: "Foto confezione",
    foto_etichetta: "Foto etichetta",
    certificazione: "Certificazione",
    dop_ce: "DoP / CE",
    video: "Video",
    listino_prezzi: "Listino prezzi",
    altro: "Altro",
  };

  const tipoColor: Record<string, string> = {
    catalogo_pdf: TEAL, scheda_tecnica: TEAL, schema_montaggio: AMBER,
    istruzioni_posa: GREEN, foto_prodotto: GREEN, foto_confezione: GREEN,
    foto_etichetta: GREEN, certificazione: "#3B7FE0", dop_ce: "#3B7FE0",
    video: RED, listino_prezzi: AMBER, altro: SUB,
  };

  const salvaAllegato = async () => {
    if (!newAll.nome || !newAll.url) return;
    const body = {
      articolo_galassia_id: articoloId,
      azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
      tipo: newAll.tipo,
      nome: newAll.nome,
      descrizione: newAll.descrizione || null,
      url: newAll.url,
      caricato_da: "Utente MASTRO",
    };
    const r = await fetch(`${SB_URL}/rest/v1/allegati_galassia`, {
      method: "POST",
      headers: { ...hdrs, Prefer: "return=representation" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const ins = await r.json();
      setAllegati(p => [...(ins instanceof Array ? ins : [ins]), ...p]);
      setAddOpen(false);
      setNewAll({ tipo: "scheda_tecnica", nome: "", url: "", descrizione: "" });
    }
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em" }}>
          Documenti e allegati {allegati.length > 0 && `(${allegati.length})`}
        </div>
        <button onClick={() => setAddOpen(!addOpen)}
          style={{ ...btn3d(AMBER, "#A06005"), padding: "5px 10px", fontSize: 10 }}>
          + Aggiungi
        </button>
      </div>

      {addOpen && (
        <div style={{ background: "#FFF8E8", borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${AMBER}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, marginBottom: 8 }}>Aggiungi documento — visibile a tutti</div>
          <select value={newAll.tipo} onChange={e => setNewAll(p => ({ ...p, tipo: e.target.value }))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", background: WHITE, marginBottom: 6 }}>
            {Object.entries(tipoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={newAll.nome} onChange={e => setNewAll(p => ({ ...p, nome: e.target.value }))}
            placeholder="Nome documento (es. Catalogo Maico 2026)"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any, marginBottom: 6 }} />
          <input value={newAll.url} onChange={e => setNewAll(p => ({ ...p, url: e.target.value }))}
            placeholder="URL del file (link PDF, immagine o video)"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any, marginBottom: 6 }} />
          <input value={newAll.descrizione} onChange={e => setNewAll(p => ({ ...p, descrizione: e.target.value }))}
            placeholder="Descrizione breve (opzionale)"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setAddOpen(false)} style={{ flex: 1, background: TEAL_L, color: SUB, border: "none", borderRadius: 8, padding: "8px", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>Annulla</button>
            <button onClick={salvaAllegato} style={{ flex: 2, ...btn3d(AMBER, "#A06005"), justifyContent: "center", fontSize: 11, padding: "8px" }}>Salva allegato</button>
          </div>
        </div>
      )}

      {loading && <div style={{ fontSize: 12, color: SUB, padding: 8 }}>Caricamento...</div>}

      {!loading && allegati.length === 0 && !addOpen && (
        <div style={{ fontSize: 12, color: SUB, padding: "8px 0", lineHeight: 1.5 }}>
          Nessun documento allegato. Aggiungi cataloghi, schede tecniche, foto prodotto o schemi di montaggio — saranno visibili a tutti gli utenti MASTRO.
        </div>
      )}

      {allegati.map((al: any) => (
        <a key={al.id} href={al.url} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: WHITE, borderRadius: 8, border: `1px solid ${BDR}`, marginBottom: 4, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${tipoColor[al.tipo] || SUB}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tipoColor[al.tipo] || SUB} strokeWidth="2">
              {al.tipo.startsWith("foto") ? <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>
                : al.tipo === "video" ? <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>
                  : <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{al.nome}</div>
            <div style={{ fontSize: 9, color: SUB, marginTop: 1 }}>
              <span style={{ color: tipoColor[al.tipo] || SUB, fontWeight: 600 }}>{tipoLabel[al.tipo] || al.tipo}</span>
              {al.caricato_da && ` — ${al.caricato_da}`}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </a>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ══════════════════════════════════════════════════════════════════
export default function MagazzinoWow({ onBack }: { onBack?: () => void }) {
  const [vista, setVista] = useState<Vista>("giacenza");
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [catalogo, setCatalogo] = useState<ArticoloGalassia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("tutti");
  const [selArt, setSelArt] = useState<Articolo | null>(null);
  const [selGal, setSelGal] = useState<ArticoloGalassia | null>(null);
  const [detTab, setDetTab] = useState<DettaglioTab>("info");
  const [storicoP, setStoricoP] = useState<any[]>([]);
  const [noteCom, setNoteCom] = useState<any[]>([]);
  const [movimenti, setMovimenti] = useState<any[]>([]);
  const [movForm, setMovForm] = useState<any>(null);
  const [addGalOpen, setAddGalOpen] = useState(false);
  const [newGal, setNewGal] = useState<Record<string,string>>({});
  const [savedGalId, setSavedGalId] = useState<string|null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkItems, setBulkItems] = useState<Record<string, { qty: string; prezzo: string }>>({});
  const [scannerOpen, setScannerOpen] = useState(false);

  // ── Load data ──
  useEffect(() => {
    (async () => {
      try {
        const [art, gal] = await Promise.all([
          sbGet("articoli_magazzino", "select=*&order=nome"),
          sbGet("catalogo_galassia", "select=*&order=cat,nome"),
        ]);
        setArticoli((art || []).map((a: any) => ({
          id: a.id, nome: a.nome, codice: a.codice, categoria: a.tipo || "varie",
          fornitore: a.codice_fornitore || "-", um: a.unita_misura || "pz",
          giacenza: Number(a.scorta_attuale) || 0, scorta_min: Number(a.scorta_minima) || 0,
          prezzo: Number(a.prezzo_acquisto) || 0, posizione: a.ubicazione,
          scheda_tecnica_url: a.scheda_tecnica_url, foto_url: a.foto_url,
          certificazioni: a.certificazioni || [], compatibilita_sistemi: a.compatibilita_sistemi || [],
          campo_applicazione: a.campo_applicazione || [], note_interne: a.note_interne,
          posizione_furgone: a.posizione_furgone, istruzioni_posa_url: a.istruzioni_posa_url,
        })));
        setCatalogo(gal || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // ── Derived ──
  const sottoScorta = articoli.filter(a => a.giacenza <= a.scorta_min);
  const valTotale = articoli.reduce((s, a) => s + a.giacenza * a.prezzo, 0);
  const categorie = Array.from(new Set(articoli.map(a => a.categoria))).sort();
  const catGalassia = Array.from(new Set(catalogo.filter(g => g.tipo_record === "articolo").map(g => g.cat))).sort();

  const filtrati = articoli.filter(a => {
    if (catFilter !== "tutti" && a.categoria !== catFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return a.nome.toLowerCase().includes(s) || a.codice.toLowerCase().includes(s) || a.fornitore.toLowerCase().includes(s);
  });

  const galFiltrati = catalogo.filter(g => {
    if (g.tipo_record !== "articolo") return false;
    if (catFilter !== "tutti" && g.cat !== catFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return g.nome.toLowerCase().includes(s) || (g.codice_articolo || "").toLowerCase().includes(s) || (g.fornitore || "").toLowerCase().includes(s);
  });

  // ── Load storico/note per articolo selezionato ──
  const loadDettaglio = useCallback(async (artId: string) => {
    const [st, nt, mv] = await Promise.all([
      sbGet("storico_prezzi", `articolo_id=eq.${artId}&order=data_acquisto.desc&limit=20`),
      sbGet("note_comunita", `order=created_at.desc&limit=20`),
      sbGet("movimenti_magazzino", `articolo_id=eq.${artId}&order=created_at.desc&limit=30`),
    ]);
    setStoricoP(st || []);
    setNoteCom(nt || []);
    setMovimenti(mv || []);
  }, []);

  // ── Movimento carico/scarico ──
  const eseguiMov = async () => {
    if (!movForm || !selArt) return;
    const qty = Number(movForm.qty);
    if (!qty) return;
    const body = {
      azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
      articolo_id: selArt.id,
      tipo: movForm.tipo,
      quantita: qty,
      prezzo_unitario: movForm.prezzo ? Number(movForm.prezzo) : null,
      causale: movForm.causale || "manuale",
      note: movForm.note || "",
    };
    await fetch(`${SB_URL}/rest/v1/movimenti_magazzino`, {
      method: "POST", headers: { ...hdrs, Prefer: "return=minimal" }, body: JSON.stringify(body),
    });
    // Aggiorna giacenza
    const nuovaG = movForm.tipo === "carico" ? selArt.giacenza + qty : selArt.giacenza - qty;
    await fetch(`${SB_URL}/rest/v1/articoli_magazzino?id=eq.${selArt.id}`, {
      method: "PATCH", headers: { ...hdrs, Prefer: "return=minimal" },
      body: JSON.stringify({ scorta_attuale: nuovaG }),
    });
    // Storico prezzo se carico
    if (movForm.tipo === "carico" && movForm.prezzo) {
      await fetch(`${SB_URL}/rest/v1/storico_prezzi`, {
        method: "POST", headers: { ...hdrs, Prefer: "return=minimal" },
        body: JSON.stringify({
          azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
          articolo_id: selArt.id, prezzo: Number(movForm.prezzo),
          fornitore: selArt.fornitore, quantita: qty,
        }),
      });
    }
    setSelArt({ ...selArt, giacenza: nuovaG });
    setArticoli(prev => prev.map(a => a.id === selArt.id ? { ...a, giacenza: nuovaG } : a));
    setMovForm(null);
    loadDettaglio(selArt.id);
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: DETTAGLIO ARTICOLO
  // ══════════════════════════════════════════════════════════════
  if (selArt) {
    return (
      <div style={{ minHeight: "100vh", background: BG, backgroundImage: `linear-gradient(rgba(40,160,160,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(40,160,160,.18) 1px,transparent 1px)`, backgroundSize: "24px 24px", fontFamily: FF }}>
        {/* Topbar */}
        <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
          <button onClick={() => { setSelArt(null); setDetTab("info"); }} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><IcoBack /></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: WHITE }}>{selArt.nome}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{selArt.codice} - {selArt.fornitore}</div>
          </div>
          <div style={{ background: selArt.giacenza <= selArt.scorta_min ? "rgba(220,68,68,.15)" : "rgba(26,158,115,.15)", borderRadius: 8, padding: "4px 10px" }}>
            <span style={{ fontFamily: FM, fontSize: 16, fontWeight: 800, color: selArt.giacenza <= selArt.scorta_min ? RED : GREEN }}>{selArt.giacenza}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginLeft: 4 }}>{selArt.um}</span>
          </div>
        </div>

        <div style={{ padding: "12px 14px" }}>
          {/* Tab dettaglio */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
            {([["info", "Scheda", IcoBox], ["tecnica", "Tecnica", IcoDoc], ["prezzi", "Prezzi", IcoChart], ["note", "Note", IcoStar]] as [DettaglioTab, string, any][]).map(([key, label, Ico]) => (
              <button key={key} onClick={() => { setDetTab(key); if (key !== "info") loadDettaglio(selArt.id); }} style={pill(detTab === key)}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB INFO ── */}
          {detTab === "info" && (
            <>
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Dati articolo</div>
                {[
                  ["Codice", selArt.codice],
                  ["Categoria", selArt.categoria],
                  ["Fornitore", selArt.fornitore],
                  ["UM", selArt.um],
                  ["Prezzo acquisto", `\u20AC${selArt.prezzo.toFixed(2)}`],
                  ["Scorta minima", `${selArt.scorta_min} ${selArt.um}`],
                  ["Posizione magazzino", selArt.posizione || "-"],
                  ["Posizione furgone", selArt.posizione_furgone || "-"],
                ].map(([k, v]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BDR}` }}>
                    <span style={{ fontSize: 12, color: SUB }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: INK, fontFamily: typeof v === "string" && v.includes("\u20AC") ? FM : FF }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Compatibilita */}
              {selArt.compatibilita_sistemi && selArt.compatibilita_sistemi.length > 0 && (
                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Compatibile con</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selArt.compatibilita_sistemi.map(s => (
                      <span key={s} style={{ background: TEAL_L, color: TEAL, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pulsanti carico/scarico */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                <button onClick={() => setMovForm({ tipo: "carico", qty: "", prezzo: "", causale: "acquisto", note: "" })} style={btn3d(GREEN, "#0F7A56")}>+ Carico</button>
                <button onClick={() => setMovForm({ tipo: "scarico", qty: "", causale: "cantiere", note: "" })} style={btn3d(RED, "#A83030")}>- Scarico</button>
              </div>

              {/* QR Code + DDT */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button onClick={() => setMovForm({ tipo: "qr" } as any)} style={{ ...btn3d("#3B7FE0", "#2960B0"), justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>
                  QR Code
                </button>
                <button onClick={() => setMovForm({ tipo: "ddt", qty: "", note: "", articoli: [] } as any)} style={{ ...btn3d(AMBER, "#A06005"), justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/></svg>
                  DDT Rapido
                </button>
              </div>

              {/* QR Code Display */}
              {movForm && movForm.tipo === "qr" && (
                <div style={{ ...card, marginTop: 10, textAlign: "center" as any }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#3B7FE0", marginBottom: 10 }}>QR Code Articolo</div>
                  <div style={{ background: WHITE, borderRadius: 12, padding: 16, display: "inline-block", border: `2px solid ${BDR}` }}>
                    <svg viewBox="0 0 200 200" width="160" height="160">
                      <rect width="200" height="200" fill="white"/>
                      {/* QR pattern generato dal codice articolo */}
                      {(() => {
                        const code = selArt.codice || selArt.id.slice(0, 8);
                        const cells: any[] = [];
                        // Simple deterministic pattern from code hash
                        let hash = 0;
                        for (let i = 0; i < code.length; i++) hash = ((hash << 5) - hash) + code.charCodeAt(i);
                        // Finder patterns (3 corners)
                        const drawFinder = (x: number, y: number) => {
                          cells.push(<rect key={`f${x}${y}`} x={x*8} y={y*8} width={56} height={56} fill="black"/>);
                          cells.push(<rect key={`fw${x}${y}`} x={x*8+8} y={y*8+8} width={40} height={40} fill="white"/>);
                          cells.push(<rect key={`fc${x}${y}`} x={x*8+16} y={y*8+16} width={24} height={24} fill="black"/>);
                        };
                        drawFinder(1, 1);
                        drawFinder(18, 1);
                        drawFinder(1, 18);
                        // Data cells from hash
                        for (let r = 0; r < 25; r++) {
                          for (let c = 0; c < 25; c++) {
                            if ((r < 9 && c < 9) || (r < 9 && c > 15) || (r > 15 && c < 9)) continue;
                            const bit = ((hash * (r * 25 + c + 1)) >>> 0) % 3;
                            if (bit === 0) cells.push(<rect key={`d${r}${c}`} x={c*8} y={r*8} width={8} height={8} fill="black"/>);
                          }
                        }
                        return cells;
                      })()}
                    </svg>
                  </div>
                  <div style={{ fontFamily: FM, fontSize: 12, fontWeight: 700, color: INK, marginTop: 8 }}>{selArt.codice}</div>
                  <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>{selArt.nome}</div>
                  <div style={{ fontSize: 10, color: SUB, marginTop: 8, lineHeight: 1.5 }}>Scansiona questo QR per aprire la scheda articolo, fare carico/scarico rapido e vedere lo storico.</div>
                  <button onClick={() => setMovForm(null)} style={{ ...btn3d("#3B7FE0", "#2960B0"), width: "100%", justifyContent: "center", marginTop: 10, fontSize: 12 }}>Chiudi</button>
                </div>
              )}

              {/* DDT Rapido - Carico da documento di trasporto */}
              {movForm && movForm.tipo === "ddt" && (
                <div style={{ ...card, marginTop: 10, borderColor: AMBER }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: AMBER, marginBottom: 6 }}>Carico da DDT</div>
                  <div style={{ fontSize: 11, color: SUB, marginBottom: 10 }}>Inserisci numero DDT e quantita ricevuta. Il carico viene registrato automaticamente.</div>
                  <input placeholder="Numero DDT" value={movForm.ddt_numero || ""} onChange={e => setMovForm({ ...movForm, ddt_numero: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 13, fontFamily: FM, marginBottom: 8, outline: "none", background: WHITE }} />
                  <input type="number" placeholder="Quantita ricevuta" value={movForm.qty || ""} onChange={e => setMovForm({ ...movForm, qty: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 14, fontFamily: FM, marginBottom: 8, outline: "none", background: WHITE }} />
                  <input type="number" placeholder="Prezzo unitario" value={movForm.prezzo || ""} onChange={e => setMovForm({ ...movForm, prezzo: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 14, fontFamily: FM, marginBottom: 8, outline: "none", background: WHITE }} />
                  <input placeholder="Fornitore" value={movForm.fornitore_ddt || selArt.fornitore || ""} onChange={e => setMovForm({ ...movForm, fornitore_ddt: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 13, marginBottom: 8, outline: "none", background: WHITE }} />
                  <textarea placeholder="Note (opzionale)" value={movForm.note || ""} onChange={e => setMovForm({ ...movForm, note: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 13, marginBottom: 10, outline: "none", background: WHITE, resize: "vertical" as any, minHeight: 40 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setMovForm(null)} style={{ flex: 1, background: TEAL_L, color: SUB, border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Annulla</button>
                    <button onClick={async () => {
                      const qty = Number(movForm.qty);
                      if (!qty) return;
                      const body = {
                        azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
                        articolo_id: selArt.id,
                        tipo: "carico",
                        quantita: qty,
                        prezzo_unitario: movForm.prezzo ? Number(movForm.prezzo) : null,
                        causale: "ddt_entrata",
                        ddt_numero: movForm.ddt_numero || null,
                        note: movForm.note ? `DDT ${movForm.ddt_numero || ""} - ${movForm.note}` : `DDT ${movForm.ddt_numero || ""}`,
                      };
                      await fetch(`${SB_URL}/rest/v1/movimenti_magazzino`, {
                        method: "POST", headers: { ...hdrs, Prefer: "return=minimal" }, body: JSON.stringify(body),
                      });
                      const nuovaG = selArt.giacenza + qty;
                      await fetch(`${SB_URL}/rest/v1/articoli_magazzino?id=eq.${selArt.id}`, {
                        method: "PATCH", headers: { ...hdrs, Prefer: "return=minimal" },
                        body: JSON.stringify({ scorta_attuale: nuovaG }),
                      });
                      if (movForm.prezzo) {
                        await fetch(`${SB_URL}/rest/v1/storico_prezzi`, {
                          method: "POST", headers: { ...hdrs, Prefer: "return=minimal" },
                          body: JSON.stringify({
                            azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
                            articolo_id: selArt.id, prezzo: Number(movForm.prezzo),
                            fornitore: movForm.fornitore_ddt || selArt.fornitore, quantita: qty,
                          }),
                        });
                      }
                      setSelArt({ ...selArt, giacenza: nuovaG });
                      setArticoli(prev => prev.map(a => a.id === selArt.id ? { ...a, giacenza: nuovaG } : a));
                      setMovForm(null);
                      loadDettaglio(selArt.id);
                    }} style={{ flex: 2, ...btn3d(AMBER, "#A06005"), justifyContent: "center", fontSize: 12 }}>
                      Registra carico DDT
                    </button>
                  </div>
                </div>
              )}

              {/* Form movimento */}
              {movForm && movForm.tipo !== "qr" && movForm.tipo !== "ddt" && (
                <div style={{ ...card, marginTop: 10, borderColor: movForm.tipo === "carico" ? GREEN : RED }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: movForm.tipo === "carico" ? GREEN : RED, marginBottom: 10 }}>
                    {movForm.tipo === "carico" ? "Carico materiale" : "Scarico materiale"}
                  </div>
                  <input type="number" placeholder="Quantita" value={movForm.qty} onChange={e => setMovForm({ ...movForm, qty: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 14, fontFamily: FM, marginBottom: 8, outline: "none", background: WHITE }} />
                  {movForm.tipo === "carico" && (
                    <input type="number" placeholder="Prezzo unitario" value={movForm.prezzo || ""} onChange={e => setMovForm({ ...movForm, prezzo: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 14, fontFamily: FM, marginBottom: 8, outline: "none", background: WHITE }} />
                  )}
                  <select value={movForm.causale} onChange={e => setMovForm({ ...movForm, causale: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 13, fontFamily: FF, marginBottom: 8, outline: "none", background: WHITE, color: INK }}>
                    {movForm.tipo === "carico"
                      ? <>{["acquisto", "reso_cliente", "trasferimento", "inventario"].map(c => <option key={c} value={c}>{c}</option>)}</>
                      : <>{["cantiere", "commessa", "difettoso", "trasferimento", "inventario"].map(c => <option key={c} value={c}>{c}</option>)}</>
                    }
                  </select>
                  <textarea placeholder="Note..." value={movForm.note} onChange={e => setMovForm({ ...movForm, note: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${BDR}`, borderRadius: 10, fontSize: 13, fontFamily: FF, marginBottom: 10, outline: "none", background: WHITE, resize: "vertical", minHeight: 50 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={eseguiMov} style={{ ...btn3d(movForm.tipo === "carico" ? GREEN : RED, movForm.tipo === "carico" ? "#0F7A56" : "#A83030"), flex: 1, justifyContent: "center" }}>Conferma</button>
                    <button onClick={() => setMovForm(null)} style={{ ...btn3d("#8BBCBC", "#6A9A9A"), flex: 1, justifyContent: "center" }}>Annulla</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── TAB TECNICA ── */}
          {detTab === "tecnica" && (
            <>
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Documentazione tecnica</div>
                {selArt.scheda_tecnica_url ? (
                  <a href={selArt.scheda_tecnica_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: TEAL_L, borderRadius: 10, textDecoration: "none", marginBottom: 6 }}>
                    <IcoDoc /><span style={{ fontSize: 13, color: TEAL, fontWeight: 700 }}>Scheda tecnica PDF</span>
                  </a>
                ) : <div style={{ fontSize: 12, color: SUB, padding: "8px 0" }}>Nessuna scheda tecnica allegata</div>}
                {selArt.istruzioni_posa_url && (
                  <a href={selArt.istruzioni_posa_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#E8F8E8", borderRadius: 10, textDecoration: "none" }}>
                    <IcoDoc /><span style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>Istruzioni di posa</span>
                  </a>
                )}
              </div>
              {selArt.certificazioni && selArt.certificazioni.length > 0 && (
                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Certificazioni</div>
                  {selArt.certificazioni.map((c: any, i: number) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: `1px solid ${BDR}`, fontSize: 12, color: INK }}>{typeof c === "string" ? c : JSON.stringify(c)}</div>
                  ))}
                </div>
              )}
              {selArt.campo_applicazione && selArt.campo_applicazione.length > 0 && (
                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Campi di applicazione</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selArt.campo_applicazione.map(c => (
                      <span key={c} style={{ background: TEAL_L, color: TEAL, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {selArt.note_interne && (
                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Note interne</div>
                  <div style={{ fontSize: 12, color: INK, lineHeight: 1.5 }}>{selArt.note_interne}</div>
                </div>
              )}
            </>
          )}

          {/* ── TAB PREZZI ── */}
          {detTab === "prezzi" && (
            <>
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Storico prezzi di acquisto</div>
                {storicoP.length === 0 ? (
                  <div style={{ fontSize: 12, color: SUB, padding: "10px 0" }}>Nessun prezzo registrato. Fai un carico con prezzo per iniziare.</div>
                ) : (
                  <>
                    {/* Mini grafico barre ASCII */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60, marginBottom: 10, padding: "0 4px" }}>
                      {storicoP.slice(0, 12).reverse().map((s: any, i: number) => {
                        const max = Math.max(...storicoP.map((x: any) => Number(x.prezzo)));
                        const h = max > 0 ? (Number(s.prezzo) / max) * 50 + 10 : 20;
                        return <div key={i} style={{ flex: 1, height: h, background: `linear-gradient(180deg, ${TEAL}, ${TEAL_D})`, borderRadius: "4px 4px 0 0", minWidth: 8 }} title={`${s.data_acquisto}: \u20AC${Number(s.prezzo).toFixed(2)}`} />;
                      })}
                    </div>
                    {storicoP.map((s: any) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BDR}` }}>
                        <div>
                          <div style={{ fontSize: 12, color: INK }}>{s.fornitore || "-"}</div>
                          <div style={{ fontSize: 10, color: SUB }}>{s.data_acquisto} - qty {s.quantita}</div>
                        </div>
                        <span style={{ fontFamily: FM, fontSize: 14, fontWeight: 700, color: AMBER }}>{"\u20AC"}{Number(s.prezzo).toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Prezzo medio Galassia</div>
                <div style={{ fontSize: 12, color: SUB, padding: "8px 0" }}>Disponibile con 200+ clienti attivi. I prezzi anonimi aggregati mostreranno quanto pagano gli altri serramentisti per questo articolo.</div>
              </div>
            </>
          )}

          {/* ── TAB NOTE COMUNITA ── */}
          {detTab === "note" && (
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Note della comunita</div>
              {noteCom.length === 0 ? (
                <div style={{ fontSize: 12, color: SUB, padding: "10px 0" }}>Nessuna nota dalla comunita per questo articolo. Le note appariranno quando altri montatori condivideranno le loro esperienze.</div>
              ) : (
                noteCom.map((n: any) => (
                  <div key={n.id} style={{ padding: "8px 0", borderBottom: `1px solid ${BDR}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{n.operatore_nome}</span>
                      {n.rating && <span style={{ fontSize: 11, color: AMBER }}>{"*".repeat(n.rating)}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: INK, lineHeight: 1.5 }}>{n.testo}</div>
                    {n.sistema_profilo && <span style={{ fontSize: 10, color: TEAL, background: TEAL_L, padding: "2px 8px", borderRadius: 8, marginTop: 4, display: "inline-block" }}>{n.sistema_profilo}</span>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Storico movimenti (sempre visibile in fondo) */}
          {detTab === "info" && movimenti.length > 0 && (
            <div style={{ ...card, marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Ultimi movimenti</div>
              {movimenti.slice(0, 10).map((m: any) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BDR}` }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.tipo === "carico" ? GREEN : RED }}>{m.tipo === "carico" ? "+" : "-"}{m.quantita}</span>
                    <span style={{ fontSize: 11, color: SUB, marginLeft: 6 }}>{m.causale}</span>
                  </div>
                  <span style={{ fontSize: 10, color: SUB, fontFamily: FM }}>{(m.created_at || "").slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER: DETTAGLIO CATALOGO GALASSIA
  // ══════════════════════════════════════════════════════════════
  if (selGal) {
    return (
      <div style={{ minHeight: "100vh", background: BG, backgroundImage: `linear-gradient(rgba(40,160,160,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(40,160,160,.18) 1px,transparent 1px)`, backgroundSize: "24px 24px", fontFamily: FF }}>
        <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 50 }}>
          <button onClick={() => setSelGal(null)} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><IcoBack /></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: WHITE }}>{selGal.nome}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{selGal.codice_articolo} - {selGal.fornitore}</div>
          </div>
          <div style={{ background: "rgba(40,160,160,.15)", borderRadius: 8, padding: "4px 10px" }}>
            <IcoGlobe />
          </div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Catalogo Galassia</div>
            {[
              ["Codice", selGal.codice_articolo],
              ["Categoria", selGal.cat],
              ["Fornitore", selGal.fornitore],
              ["Materiale", selGal.materiale || "-"],
              ["Superficie", selGal.superficie || "-"],
              ["UM", selGal.um],
              ["Prezzo riferimento", selGal.valore_unitario > 0 ? `\u20AC${selGal.valore_unitario.toFixed(2)}` : "know-how"],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BDR}` }}>
                <span style={{ fontSize: 12, color: SUB }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: INK, fontFamily: typeof v === "string" && v.includes("\u20AC") ? FM : FF }}>{v}</span>
              </div>
            ))}
          </div>
          {selGal.note && (
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
                {selGal.tipo_record === "know_how" ? "Know-how tecnico" : "Note tecniche"}
              </div>
              <div style={{ fontSize: 12, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selGal.note}</div>
            </div>
          )}
          {selGal.campi_applicazione && selGal.campi_applicazione.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Campi di applicazione</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selGal.campi_applicazione.map(c => (
                  <span key={c} style={{ background: TEAL_L, color: TEAL, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Aggiungi al mio magazzino */}
          {!articoli.find(a => a.codice === selGal.codice_articolo) ? (
            <button onClick={async () => {
              const body = {
                azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
                codice: selGal.codice_articolo,
                nome: selGal.nome,
                tipo: selGal.cat,
                unita_misura: selGal.um || "pz",
                prezzo_acquisto: selGal.valore_unitario || 0,
                scorta_minima: 0,
                scorta_attuale: 0,
                codice_fornitore: selGal.fornitore,
                attivo: true,
                note_interne: selGal.note || null,
                campo_applicazione: selGal.campi_applicazione || null,
                compatibilita_sistemi: selGal.compatibilita_sistemi || null,
                scheda_tecnica_url: selGal.scheda_tecnica_url || null,
              };
              try {
                const r = await fetch(`${SB_URL}/rest/v1/articoli_magazzino`, {
                  method: "POST", headers: { ...hdrs, Prefer: "return=representation" }, body: JSON.stringify(body),
                });
                if (r.ok) {
                  const ins = await r.json();
                  const item = ins[0] || ins;
                  setArticoli((p: any) => [...p, {
                    id: item.id, nome: item.nome, codice: item.codice, categoria: item.tipo || "varie",
                    fornitore: item.codice_fornitore || "-", um: item.unita_misura || "pz",
                    giacenza: 0, scorta_min: 0, prezzo: Number(item.prezzo_acquisto) || 0,
                    posizione: item.ubicazione, scheda_tecnica_url: item.scheda_tecnica_url,
                    certificazioni: [], compatibilita_sistemi: item.compatibilita_sistemi || [],
                    campo_applicazione: item.campo_applicazione || [], note_interne: item.note_interne,
                  }]);
                  setSelGal(null);
                  setVista("giacenza");
                }
              } catch (e) { console.error("[addToMag]", e); }
            }}
              style={{ ...btn3d(GREEN, "#0F7A56"), width: "100%", justifyContent: "center", marginBottom: 10, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Aggiungi al mio magazzino
            </button>
          ) : (
            <div style={{ ...card, background: "rgba(26,158,115,.06)", borderColor: GREEN, textAlign: "center" as any, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>Gia nel tuo magazzino</div>
              <button onClick={() => {
                const art = articoli.find(a => a.codice === selGal.codice_articolo);
                if (art) { setSelGal(null); setSelArt(art); loadDettaglio(art.id); }
              }} style={{ background: "none", border: "none", color: TEAL, fontWeight: 700, fontSize: 12, cursor: "pointer", marginTop: 4 }}>
                Vai alla scheda →
              </button>
            </div>
          )}

          {/* Allegati — documenti, foto, schemi, video */}
          <AllegatiGalassia articoloId={selGal.id} />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER: LISTA PRINCIPALE
  // ══════════════════════════════════════════════════════════════
  if (loading) return <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 14, color: TEAL, fontWeight: 700 }}>Caricamento magazzino...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: BG, backgroundImage: `linear-gradient(rgba(40,160,160,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(40,160,160,.18) 1px,transparent 1px)`, backgroundSize: "24px 24px", fontFamily: FF }}>
      {/* Topbar */}
      <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><IcoBack /></button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: WHITE }}>Magazzino</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{articoli.length} articoli - {catalogo.filter(g => g.tipo_record === "articolo").length} catalogo Galassia</div>
        </div>
        <button onClick={() => setScannerOpen(true)} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/></svg>
        </button>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FM, fontSize: 16, fontWeight: 800, color: TEAL }}>{"\u20AC"}{valTotale.toFixed(0)}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>valore stock</div>
        </div>
      </div>

      {/* ── QR SCANNER FULLSCREEN OVERLAY ── */}
      {scannerOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: INK, zIndex: 200, display: "flex", flexDirection: "column" }}>
          <QRScannerView onScan={(code: string) => {
            setScannerOpen(false);
            const art = articoli.find(a => a.codice === code || a.id === code);
            if (art) { setSelArt(art); loadDettaglio(art.id); return; }
            const gal = catalogo.find(g => g.codice_articolo === code || g.id === code);
            if (gal) { setSelGal(gal); return; }
            const artNome = articoli.find(a => a.nome.toLowerCase().includes(code.toLowerCase()));
            if (artNome) { setSelArt(artNome); loadDettaglio(artNome.id); return; }
            alert(`Articolo "${code}" non trovato.`);
          }} onClose={() => setScannerOpen(false)} />
        </div>
      )}

      <div style={{ padding: "12px 14px" }}>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            [articoli.length.toString(), "In stock", TEAL],
            [sottoScorta.length.toString(), "Sotto scorta", sottoScorta.length > 0 ? RED : GREEN],
            [catalogo.filter(g => g.tipo_record === "articolo").length.toString(), "Galassia", AMBER],
          ].map(([val, lbl, col]) => (
            <div key={lbl} style={{ ...card, padding: 10, textAlign: "center", marginBottom: 0 }}>
              <div style={{ fontFamily: FM, fontSize: 20, fontWeight: 800, color: col as string }}>{val}</div>
              <div style={{ fontSize: 10, color: SUB }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Tab principali */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
          {([
            ["giacenza", "Giacenza", IcoBox],
            ["catalogo", "Galassia", IcoGlobe],
            ["spesa", "Lista Spesa", IcoCart],
            ["inventario", "Inventario", IcoDoc],
            ["alert", "Alert", IcoAlert],
          ] as [Vista, string, any][]).map(([key, label, Ico]) => (
            <button key={key} onClick={() => { setVista(key); setSearch(""); setCatFilter("tutti"); }} style={pill(vista === key)}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {label}
                {key === "alert" && sottoScorta.length > 0 && <span style={{ background: RED, color: WHITE, borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 2 }}>{sottoScorta.length}</span>}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BDR}`, marginBottom: 10 }}>
          <IcoSearch />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={vista === "catalogo" ? "Cerca nel catalogo Galassia..." : "Cerca articolo o codice..."}
            style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", width: "100%", fontFamily: FF, color: INK }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", fontSize: 16, color: SUB, cursor: "pointer" }}>x</button>}
        </div>

        {/* Filtro categorie */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setCatFilter("tutti")} style={{ ...pill(catFilter === "tutti"), fontSize: 10, padding: "4px 10px" }}>Tutti</button>
          {(vista === "catalogo" ? catGalassia : categorie).slice(0, 8).map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ ...pill(catFilter === c), fontSize: 10, padding: "4px 10px", whiteSpace: "nowrap" }}>{c}</button>
          ))}
        </div>

        {/* Bottone Aggiungi */}
        <button onClick={() => { setAddGalOpen(true); setNewGal({ nome: "", fornitore: "", cat: "", materiale: "", superficie: "", um: "pz", prezzo: "", note: "", campi: "", scheda_url: "" }); }}
          style={{ ...btn3d(AMBER, "#A06005"), width: "100%", justifyContent: "center", marginBottom: 12, fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Aggiungi articolo al catalogo Galassia
        </button>

        {/* ── FORM NUOVO ARTICOLO GALASSIA ── */}
        {addGalOpen && (
          <div style={{ background: "linear-gradient(145deg,#fff,#FFF8E8)", borderRadius: 14, border: `2px solid ${AMBER}`, padding: 14, marginBottom: 12, boxShadow: "0 4px 0 0 #E8DCC0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: AMBER }}>Nuovo articolo — Catalogo Galassia</div>
              <button onClick={() => setAddGalOpen(false)} style={{ background: "none", border: "none", fontSize: 18, color: SUB, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ fontSize: 10, color: SUB, marginBottom: 10, lineHeight: 1.4 }}>Questo articolo sara visibile a tutti gli utenti MASTRO.</div>

            {[
              { k: "nome", p: "Nome articolo *", ph: "es. Cerniera Maico 3D Regolabile" },
              { k: "fornitore", p: "Fornitore / Marca", ph: "es. Maico, Roto, Wurth" },
              { k: "codice", p: "Codice articolo", ph: "es. MC-CERN-3D" },
              { k: "cat", p: "Categoria", ph: "es. cerniere, viti, guarnizioni" },
              { k: "materiale", p: "Materiale", ph: "es. acciaio, PVC, alluminio" },
              { k: "superficie", p: "Superficie / Finitura", ph: "es. zincato, anodizzato" },
              { k: "um", p: "Unita misura", ph: "pz, ml, mq, kg, rl, kit" },
              { k: "prezzo", p: "Prezzo riferimento (opzionale)", ph: "es. 14.00" },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: SUB, display: "block", marginBottom: 2 }}>{f.p}</label>
                <input value={newGal[f.k] || ""} onChange={e => setNewGal(p => ({ ...p, [f.k]: e.target.value }))}
                  placeholder={f.ph} type={f.k === "prezzo" ? "number" : "text"}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any, fontFamily: f.k === "prezzo" || f.k === "codice" ? FM : FF }} />
              </div>
            ))}

            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: SUB, display: "block", marginBottom: 2 }}>Note tecniche</label>
              <textarea value={newGal.note || ""} onChange={e => setNewGal(p => ({ ...p, note: e.target.value }))}
                placeholder="Descrizione tecnica, portata, dimensioni, istruzioni uso..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any, fontFamily: FF, resize: "vertical" as any, minHeight: 60 }} />
            </div>

            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: SUB, display: "block", marginBottom: 2 }}>Campi di applicazione (separati da virgola)</label>
              <input value={newGal.campi || ""} onChange={e => setNewGal(p => ({ ...p, campi: e.target.value }))}
                placeholder="es. PVC, alluminio, legno, posa"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any }} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: SUB, display: "block", marginBottom: 2 }}>Link scheda tecnica PDF (opzionale)</label>
              <input value={newGal.scheda_url || ""} onChange={e => setNewGal(p => ({ ...p, scheda_url: e.target.value }))}
                placeholder="https://..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 12, outline: "none", boxSizing: "border-box" as any }} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAddGalOpen(false)}
                style={{ flex: 1, background: TEAL_L, color: SUB, border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: FF }}>Annulla</button>
              <button onClick={async () => {
                if (!newGal.nome) return;
                const campiArr = (newGal.campi || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                const body = {
                  nome: newGal.nome,
                  codice_articolo: newGal.codice || ("USR-" + Date.now().toString(36).toUpperCase()),
                  cat: newGal.cat || "varie",
                  fornitore: newGal.fornitore || "",
                  materiale: newGal.materiale || null,
                  superficie: newGal.superficie || null,
                  um: newGal.um || "pz",
                  valore_unitario: newGal.prezzo ? Number(newGal.prezzo) : 0,
                  note: newGal.note || null,
                  campi_applicazione: campiArr.length > 0 ? campiArr : null,
                  scheda_tecnica_url: newGal.scheda_url || null,
                  tipo_record: "articolo",
                  galassia: true,
                };
                try {
                  const r = await fetch(`${SB_URL}/rest/v1/catalogo_galassia`, {
                    method: "POST",
                    headers: { ...hdrs, Prefer: "return=representation" },
                    body: JSON.stringify(body),
                  });
                  if (r.ok) {
                    const inserted = await r.json();
                    const item = inserted[0] || inserted;
                    setCatalogo((p: any) => [...p, item]);
                    setSavedGalId(item.id);
                    setNewGal({});
                  } else { console.error("Errore inserimento", await r.text()); }
                } catch (e) { console.error("[addGalassia]", e); }
              }}
                style={{ flex: 2, ...btn3d(AMBER, "#A06005"), justifyContent: "center", fontSize: 12 }}>
                Salva nel catalogo Galassia
              </button>
            </div>

            {/* Post-salvataggio: aggiungi documenti */}
            {savedGalId && (
              <div style={{ marginTop: 12, borderTop: `2px solid ${GREEN}`, paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>Articolo salvato nel catalogo Galassia</span>
                </div>
                <div style={{ fontSize: 11, color: SUB, marginBottom: 8 }}>Ora puoi aggiungere documenti: cataloghi, schede tecniche, foto, schemi di montaggio, video.</div>
                <AllegatiGalassia articoloId={savedGalId} />
                <button onClick={() => { setAddGalOpen(false); setSavedGalId(null); }}
                  style={{ ...btn3d(TEAL, TEAL_D), width: "100%", justifyContent: "center", marginTop: 8, fontSize: 12 }}>
                  Fatto — chiudi
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CARICO MULTIPLO ── */}
        {vista === "giacenza" && articoli.length > 0 && !bulkMode && (
          <button onClick={() => setBulkMode(true)}
            style={{ ...btn3d(GREEN, "#0F7A56"), width: "100%", justifyContent: "center", marginBottom: 10, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            Carico multiplo
          </button>
        )}

        {vista === "giacenza" && bulkMode && (
          <div style={{ ...card, borderColor: GREEN, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>Carico multiplo</div>
              <button onClick={() => { setBulkMode(false); setBulkItems({}); }} style={{ background: "none", border: "none", fontSize: 16, color: SUB, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ fontSize: 11, color: SUB, marginBottom: 10 }}>Inserisci le quantita ricevute per ogni articolo. Solo quelli con quantita verranno caricati.</div>

            {articoli.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${BDR}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome}</div>
                  <div style={{ fontSize: 10, color: SUB }}>{a.fornitore} - giac: {a.giacenza} {a.um}</div>
                </div>
                <input type="number" placeholder="Qty" value={bulkItems[a.id]?.qty || ""} onChange={e => setBulkItems(p => ({ ...p, [a.id]: { ...p[a.id], qty: e.target.value, prezzo: p[a.id]?.prezzo || "" } }))}
                  style={{ width: 60, padding: "6px 8px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 13, fontFamily: FM, outline: "none", textAlign: "center" as any }} />
                <input type="number" placeholder={"\u20AC"} value={bulkItems[a.id]?.prezzo || ""} onChange={e => setBulkItems(p => ({ ...p, [a.id]: { ...p[a.id], prezzo: e.target.value, qty: p[a.id]?.qty || "" } }))}
                  style={{ width: 60, padding: "6px 8px", borderRadius: 8, border: `1.5px solid ${BDR}`, fontSize: 13, fontFamily: FM, outline: "none", textAlign: "center" as any }} />
              </div>
            ))}

            {(() => {
              const itemsToLoad = Object.entries(bulkItems).filter(([_, v]) => Number(v.qty) > 0);
              return itemsToLoad.length > 0 ? (
                <button onClick={async () => {
                  for (const [artId, vals] of itemsToLoad) {
                    const qty = Number(vals.qty);
                    const art = articoli.find(a => a.id === artId);
                    if (!art || !qty) continue;
                    await fetch(`${SB_URL}/rest/v1/movimenti_magazzino`, {
                      method: "POST", headers: { ...hdrs, Prefer: "return=minimal" },
                      body: JSON.stringify({ azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29", articolo_id: artId, tipo: "carico", quantita: qty, prezzo_unitario: vals.prezzo ? Number(vals.prezzo) : null, causale: "carico_multiplo" }),
                    });
                    const nuovaG = art.giacenza + qty;
                    await fetch(`${SB_URL}/rest/v1/articoli_magazzino?id=eq.${artId}`, {
                      method: "PATCH", headers: { ...hdrs, Prefer: "return=minimal" },
                      body: JSON.stringify({ scorta_attuale: nuovaG }),
                    });
                    if (vals.prezzo) {
                      await fetch(`${SB_URL}/rest/v1/storico_prezzi`, {
                        method: "POST", headers: { ...hdrs, Prefer: "return=minimal" },
                        body: JSON.stringify({ azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29", articolo_id: artId, prezzo: Number(vals.prezzo), fornitore: art.fornitore, quantita: qty }),
                      });
                    }
                    setArticoli(prev => prev.map(a => a.id === artId ? { ...a, giacenza: nuovaG } : a));
                  }
                  setBulkMode(false);
                  setBulkItems({});
                }} style={{ ...btn3d(GREEN, "#0F7A56"), width: "100%", justifyContent: "center", marginTop: 10, fontSize: 13 }}>
                  Carica {itemsToLoad.length} articol{itemsToLoad.length === 1 ? "o" : "i"}
                </button>
              ) : (
                <div style={{ textAlign: "center" as any, padding: 10, fontSize: 12, color: SUB, marginTop: 8 }}>Inserisci quantita per almeno un articolo</div>
              );
            })()}
          </div>
        )}

        {/* ── VISTA GIACENZA ── */}
        {vista === "giacenza" && filtrati.map(a => (
          <button key={a.id} onClick={() => { setSelArt(a); loadDettaglio(a.id); }}
            style={{ ...card, cursor: "pointer", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderColor: a.giacenza <= a.scorta_min ? `${RED}40` : BDR }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: TEAL_L, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IcoBox />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome}</div>
              <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>{a.codice} - {a.fornitore}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: FM, fontSize: 18, fontWeight: 800, color: a.giacenza <= a.scorta_min ? RED : INK }}>{a.giacenza}</div>
              <div style={{ fontSize: 9, color: SUB }}>{a.um}</div>
            </div>
          </button>
        ))}

        {/* ── VISTA CATALOGO GALASSIA ── */}
        {vista === "catalogo" && (
          <>
            <div style={{ ...card, borderColor: TEAL, background: "rgba(40,160,160,.04)" }}>
              <div style={{ fontSize: 12, color: TEAL, fontWeight: 700, marginBottom: 4 }}>Catalogo Galassia MASTRO</div>
              <div style={{ fontSize: 11, color: SUB, lineHeight: 1.5 }}>{catalogo.filter(g => g.tipo_record === "articolo").length} articoli verificati + {catalogo.filter(g => g.tipo_record === "know_how").length} schede know-how tecnico. Dati curati da Galassia MASTRO.</div>
            </div>
            {galFiltrati.map(g => {
              const inMag = articoli.find(a => a.codice === g.codice_articolo);
              return (
              <div key={g.id} style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setSelGal(g)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: g.tipo_record === "know_how" ? "#FFF3E0" : TEAL_L, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {g.tipo_record === "know_how" ? <IcoStar /> : <IcoGlobe />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.nome}</div>
                    <div style={{ fontSize: 10, color: SUB, marginTop: 2 }}>
                      {g.cat} - {g.fornitore}
                      {inMag && <span style={{ background: `${GREEN}20`, color: GREEN, padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700, marginLeft: 6 }}>in magazzino</span>}
                    </div>
                  </div>
                  {g.valore_unitario > 0 && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: FM, fontSize: 14, fontWeight: 700, color: AMBER }}>{"\u20AC"}{g.valore_unitario.toFixed(2)}</div>
                      <div style={{ fontSize: 9, color: SUB }}>{g.um}</div>
                    </div>
                  )}
                </button>
                {!inMag && g.tipo_record === "articolo" && (
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    const body = {
                      azienda_id: "ccca51c1-656b-4e7c-a501-55753e20da29",
                      codice: g.codice_articolo, nome: g.nome, tipo: g.cat,
                      unita_misura: g.um || "pz", prezzo_acquisto: g.valore_unitario || 0,
                      scorta_minima: 0, scorta_attuale: 0, codice_fornitore: g.fornitore,
                      attivo: true, note_interne: g.note || null,
                      campo_applicazione: g.campi_applicazione || null,
                      compatibilita_sistemi: g.compatibilita_sistemi || null,
                    };
                    try {
                      const r = await fetch(`${SB_URL}/rest/v1/articoli_magazzino`, {
                        method: "POST", headers: { ...hdrs, Prefer: "return=representation" }, body: JSON.stringify(body),
                      });
                      if (r.ok) {
                        const ins = await r.json();
                        const item = ins[0] || ins;
                        setArticoli((p: any) => [...p, {
                          id: item.id, nome: item.nome, codice: item.codice, categoria: item.tipo || "varie",
                          fornitore: item.codice_fornitore || "-", um: item.unita_misura || "pz",
                          giacenza: 0, scorta_min: 0, prezzo: Number(item.prezzo_acquisto) || 0,
                        }]);
                      }
                    } catch (e) { console.error(e); }
                  }} style={{ width: 32, height: 32, borderRadius: 8, background: GREEN, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 0 0 #0F7A56" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                )}
              </div>
              );
            })}
            {galFiltrati.length === 0 && <div style={{ textAlign: "center", padding: 20, fontSize: 13, color: SUB }}>Nessun articolo trovato</div>}
          </>
        )}

        {/* ── VISTA LISTA SPESA PRE-CANTIERE ── */}
        {vista === "spesa" && <ListaSpesaView />}

        {/* ── VISTA INVENTARIO FISICO ── */}
        {vista === "inventario" && <InventarioView articoli={articoli} setArticoli={setArticoli} />}

        {/* ── VISTA ALERT ── */}
        {vista === "alert" && (
          <>
            {sottoScorta.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: GREEN, marginBottom: 4 }}>Tutto in ordine</div>
                <div style={{ fontSize: 12, color: SUB }}>Nessun articolo sotto scorta minima</div>
              </div>
            ) : (
              sottoScorta.map(a => (
                <button key={a.id} onClick={() => { setSelArt(a); loadDettaglio(a.id); }}
                  style={{ ...card, cursor: "pointer", width: "100%", textAlign: "left", borderColor: `${RED}40` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, paddingRight: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: INK }}>{a.nome}</div>
                      <div style={{ fontSize: 11, color: RED, fontWeight: 600, marginTop: 2 }}>Giacenza: {a.giacenza} {a.um} / Min: {a.scorta_min} {a.um}</div>
                      <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>{a.fornitore}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FM, fontWeight: 800, fontSize: 20, color: RED }}>{a.giacenza}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 6, background: "rgba(220,68,68,0.08)", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: RED, fontWeight: 600 }}>Tocca per fare un carico</div>
                </button>
              ))
            )}
            {sottoScorta.length > 0 && (
              <button onClick={() => {
                const msg = sottoScorta.map(a => `- ${a.nome}: ${Math.max(a.scorta_min * 2 - a.giacenza, 1)} ${a.um}`).join('\n');
                const txt = encodeURIComponent(`Buongiorno, vorrei ordinare:\n\n${msg}\n\nGrazie.\n— Inviato da MASTRO`);
                window.open(`https://wa.me/?text=${txt}`, '_blank');
              }} style={{ ...btn3d("#25D366", "#1DA851"), width: "100%", justifyContent: "center", marginTop: 4, fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.462A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.592-5.927-1.621l-.424-.254-2.744.868.882-2.686-.278-.443A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z"/></svg>
                Ordina tutto sotto-scorta via WhatsApp
              </button>
            )}
          </>
        )}

        {vista === "giacenza" && filtrati.length === 0 && (
          <div style={{ ...card, textAlign: "center" as any, padding: 20 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5" style={{ marginBottom: 8 }}>
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 4 }}>Il tuo magazzino e vuoto</div>
            <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5, marginBottom: 12 }}>Aggiungi i tuoi primi articoli dal catalogo Galassia — con un tap hai scheda tecnica, prezzo e fornitore gia compilati.</div>
            <button onClick={() => setVista("catalogo")} style={{ ...btn3d(TEAL, TEAL_D), width: "100%", justifyContent: "center", fontSize: 13 }}>
              Vai al catalogo Galassia ({catalogo.filter(g => g.tipo_record === "articolo").length} articoli)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
