// @ts-nocheck
"use client";
// PORTALE AZIENDA fliwoX v8 LIGHT — tutte le sezioni dense
// Gestione completa operatori: commesse, documenti, foto, chat, timeline, ore, firme, materiali, spese, GPS

import React, { useState, useMemo } from "react";

/* ═══════════════════════════════════════════
   DESIGN TOKENS — Apple iWork light
═══════════════════════════════════════════ */
const T = {
  bg: "#FFFFFF",
  bgAlt: "#FAFAFA",
  bgHover: "#F5F7F7",
  ink: "#1A1A1A",
  sub: "#6B7280",
  muted: "#9CA3AF",
  line: "#E5E7EB",
  lineLight: "#F0F0F0",
  teal: "#1A9E8F",
  tealLight: "rgba(26,158,143,0.08)",
  tealBorder: "rgba(26,158,143,0.2)",
  green: "#2D8A4E",
  greenLight: "rgba(45,138,78,0.08)",
  amber: "#C47D0A",
  amberLight: "rgba(196,125,10,0.08)",
  red: "#DC4444",
  redLight: "rgba(220,68,68,0.08)",
  blue: "#3B7FE0",
  blueLight: "rgba(59,127,224,0.08)",
  purple: "#7C3AED",
  purpleLight: "rgba(124,58,237,0.08)",
  radius: 8,
  mono: "'JetBrains Mono',monospace",
  font: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
};

/* ═══════════════════════════════════════════
   DATI DEMO — operatori con tutto lo storico
═══════════════════════════════════════════ */
const OPERATORI = [
  {
    id: "op1", nome: "Marco Ferretti", ruolo: "montatore", stato: "in_cantiere",
    telefono: "+39 345 678 9012", email: "marco.f@waltercozza.it",
    pin: "1234", assunto: "2019-03-15", contratto: "indeterminato",
    patente: "B", automezzo: "Fiat Ducato AB 123 CD",
    avatar: "MF", colore: "#1A9E8F",
    posizione: { lat: 39.3076, lng: 16.2501, aggiornamento: "08/04 08:42", indirizzo: "Via Roma 45, Cosenza" },
    kpi: { commesseAnno: 47, oreAnno: 1840, mediaGiorno: 8.2, ritardi: 2, valutazioneMedia: 4.7, reclami: 1, presenzeMese: 21, assenzeAnno: 4 },
    commesse: [
      {
        id: "COM-2024-089", cliente: "Fam. Bianchi", indirizzo: "Via Garibaldi 12, Cosenza",
        tipo: "Sostituzione infissi", stato: "in_corso", priorita: "alta",
        dataInizio: "05/04/2026", dataFine: "10/04/2026", avanzamento: 65,
        vani: [
          { id: "V1", nome: "Soggiorno", tipo: "Finestra 2 ante", dim: "1400x1600", materiale: "PVC Aluplast IDEAL 7000", stato: "montato", oreReali: 3.5, orePreviste: 3 },
          { id: "V2", nome: "Camera matrimoniale", tipo: "Portafinestra scorrevole", dim: "2200x2200", materiale: "PVC Aluplast ENERGETO 8000", stato: "in_corso", oreReali: 2.0, orePreviste: 4 },
          { id: "V3", nome: "Cucina", tipo: "Finestra 1 anta + ribalta", dim: "900x1200", materiale: "PVC Aluplast IDEAL 7000", stato: "da_fare", oreReali: 0, orePreviste: 2 },
          { id: "V4", nome: "Bagno", tipo: "Vasistas", dim: "600x800", materiale: "PVC Aluplast IDEAL 7000", stato: "da_fare", oreReali: 0, orePreviste: 1.5 },
        ],
        documenti: [
          { nome: "Ordine fornitore Aluplast", tipo: "pdf", data: "28/03", peso: "245 KB" },
          { nome: "Scheda tecnica IDEAL 7000", tipo: "pdf", data: "28/03", peso: "1.2 MB" },
          { nome: "Foto sopralluogo", tipo: "zip", data: "25/03", peso: "8.4 MB" },
          { nome: "Preventivo approvato", tipo: "pdf", data: "20/03", peso: "180 KB" },
          { nome: "DDT consegna materiali", tipo: "pdf", data: "04/04", peso: "95 KB" },
        ],
        foto: [
          { src: "prima_soggiorno.jpg", fase: "PRIMA", vano: "V1", data: "05/04 09:15", nota: "Infisso esistente in legno, guarnizioni consumate" },
          { src: "demolizione_soggiorno.jpg", fase: "DEMOLIZIONE", vano: "V1", data: "05/04 10:30", nota: "Controtelaio rimosso, muro pulito" },
          { src: "montaggio_soggiorno.jpg", fase: "MONTAGGIO", vano: "V1", data: "05/04 14:20", nota: "Controtelaio nuovo posato, livellato" },
          { src: "dopo_soggiorno.jpg", fase: "DOPO", vano: "V1", data: "05/04 16:45", nota: "Finestra montata, silicone fatto, anta regolata" },
          { src: "prima_camera.jpg", fase: "PRIMA", vano: "V2", data: "07/04 08:30", nota: "Portafinestra scorrevole vecchia" },
          { src: "demolizione_camera.jpg", fase: "DEMOLIZIONE", vano: "V2", data: "07/04 10:00", nota: "Binario rimosso" },
        ],
        chat: [
          { da: "Marco", ora: "05/04 08:10", testo: "Sono arrivato, inizio dal soggiorno", tipo: "operatore" },
          { da: "Ufficio", ora: "05/04 08:12", testo: "OK, buon lavoro. Ricordati le foto PRIMA", tipo: "ufficio" },
          { da: "Marco", ora: "05/04 10:35", testo: "Controtelaio soggiorno rimosso. Muro in buone condizioni, niente sorprese", tipo: "operatore" },
          { da: "Marco", ora: "05/04 16:50", testo: "Soggiorno completato, 4 foto caricate. Domani camera", tipo: "operatore" },
          { da: "Cliente", ora: "06/04 09:00", testo: "Buongiorno, domani potete iniziare dopo le 9?", tipo: "cliente" },
          { da: "Marco", ora: "07/04 08:32", testo: "Inizio camera matrimoniale. Scorrevole pesante, serve aiuto per il telaio", tipo: "operatore" },
          { da: "Ufficio", ora: "07/04 08:35", testo: "Mando Luca alle 10", tipo: "ufficio" },
          { da: "AI", ora: "07/04 08:36", testo: "Nota: per ENERGETO 8000 scorrevole, coppia serraggio ferramenta Roto = 2.5 Nm", tipo: "ai" },
        ],
        timeline: [
          { data: "20/03", evento: "Preventivo approvato dal cliente", tipo: "milestone" },
          { data: "25/03", evento: "Sopralluogo tecnico — misure confermate", tipo: "milestone" },
          { data: "28/03", evento: "Ordine materiali inviato ad Aluplast", tipo: "ordine" },
          { data: "03/04", evento: "Materiali consegnati in magazzino — DDT verificato", tipo: "consegna" },
          { data: "04/04", evento: "Materiali caricati sul Ducato — lista spunta OK", tipo: "logistica" },
          { data: "05/04", evento: "Inizio cantiere — V1 Soggiorno completato", tipo: "lavoro" },
          { data: "07/04", evento: "V2 Camera — in corso (scorrevole)", tipo: "lavoro" },
          { data: "08/04", evento: "OGGI — previsto: completare V2 + inizio V3", tipo: "oggi" },
        ],
        materiali: [
          { nome: "Viti ASSY 4x50 zincate", qta: 48, usate: 32, um: "pz" },
          { nome: "Silicone neutro bianco", qta: 4, usate: 2, um: "tubi" },
          { nome: "Schiuma PU bassa espansione", qta: 3, usate: 1, um: "bombolette" },
          { nome: "Nastro VKP PIU 25mm", qta: 2, usate: 1, um: "rotoli" },
          { nome: "Guarnizione EPDM nera", qta: 10, usate: 4, um: "mt" },
          { nome: "Tasselli Fischer FUR 10x80", qta: 24, usate: 12, um: "pz" },
        ],
        firme: [
          { tipo: "Inizio lavori", data: "05/04 08:15", firmato: true, chi: "Sig. Bianchi" },
          { tipo: "Fine lavori parziale V1", data: "05/04 16:50", firmato: true, chi: "Sig. Bianchi" },
          { tipo: "Fine lavori totale", data: null, firmato: false, chi: null },
          { tipo: "Collaudo", data: null, firmato: false, chi: null },
        ],
        spese: [
          { data: "05/04", desc: "Colazione cantiere", importo: 8.50, cat: "Pasti", stato: "approvata" },
          { data: "05/04", desc: "Tasselli aggiuntivi Brico", importo: 12.90, cat: "Materiale", stato: "approvata" },
          { data: "07/04", desc: "Parcheggio ZTL Cosenza", importo: 5.00, cat: "Trasporto", stato: "da_approvare" },
        ],
        ore: [
          { data: "05/04", inizio: "08:00", fine: "17:00", pausa: 60, nette: 8, tipo: "cantiere" },
          { data: "07/04", inizio: "08:15", fine: "16:30", pausa: 45, nette: 7.5, tipo: "cantiere" },
          { data: "08/04", inizio: "08:00", fine: null, pausa: 0, nette: 0, tipo: "cantiere" },
        ],
      },
      {
        id: "COM-2024-082", cliente: "Condominio Via Verdi", indirizzo: "Via Verdi 8, Rende",
        tipo: "Persiane alluminio", stato: "programmata", priorita: "media",
        dataInizio: "14/04/2026", dataFine: "18/04/2026", avanzamento: 0,
        vani: [
          { id: "V1", nome: "App.1 Soggiorno", tipo: "Persiana 2 ante", dim: "1200x1600", materiale: "Alluminio CX65", stato: "da_fare", oreReali: 0, orePreviste: 2 },
          { id: "V2", nome: "App.1 Camera", tipo: "Persiana 2 ante", dim: "1000x1400", materiale: "Alluminio CX65", stato: "da_fare", oreReali: 0, orePreviste: 1.5 },
          { id: "V3", nome: "App.2 Soggiorno", tipo: "Persiana 2 ante", dim: "1200x1600", materiale: "Alluminio CX65", stato: "da_fare", oreReali: 0, orePreviste: 2 },
        ],
        documenti: [
          { nome: "Preventivo condominio", tipo: "pdf", data: "10/03", peso: "320 KB" },
          { nome: "Delibera assembleare", tipo: "pdf", data: "15/03", peso: "450 KB" },
        ],
        foto: [],
        chat: [
          { da: "Ufficio", ora: "01/04", testo: "Commessa assegnata. Materiali arrivano il 12/04", tipo: "ufficio" },
          { da: "Marco", ora: "01/04", testo: "OK, presa visione", tipo: "operatore" },
        ],
        timeline: [
          { data: "10/03", evento: "Preventivo inviato", tipo: "milestone" },
          { data: "15/03", evento: "Delibera assembleare approvata", tipo: "milestone" },
          { data: "01/04", evento: "Commessa assegnata a Marco", tipo: "assegnazione" },
        ],
        materiali: [],
        firme: [],
        spese: [],
        ore: [],
      },
    ],
    storicoPrestazioni: [
      { mese: "Gen", commesse: 4, oreNette: 168, valutazione: 4.8, ritardi: 0 },
      { mese: "Feb", commesse: 5, oreNette: 152, valutazione: 4.6, ritardi: 1 },
      { mese: "Mar", commesse: 4, oreNette: 176, valutazione: 4.9, ritardi: 0 },
      { mese: "Apr", commesse: 2, oreNette: 56, valutazione: 4.5, ritardi: 1 },
    ],
    certificazioni: [
      { nome: "Posa qualificata UNI 11673-1", scadenza: "12/2026", stato: "valida" },
      { nome: "Sicurezza cantiere base", scadenza: "06/2026", stato: "in_scadenza" },
      { nome: "Primo soccorso", scadenza: "03/2027", stato: "valida" },
    ],
    dotazioni: [
      { nome: "Trapano Hilti TE 6-A22", stato: "assegnato", dal: "01/2024" },
      { nome: "Livella laser Bosch GCL 2-50", stato: "assegnato", dal: "03/2024" },
      { nome: "Kit sigillatura", stato: "assegnato", dal: "01/2024" },
      { nome: "Fiat Ducato AB 123 CD", stato: "assegnato", dal: "06/2023" },
    ],
  },
  {
    id: "op2", nome: "Luca Mancini", ruolo: "montatore", stato: "disponibile",
    telefono: "+39 333 456 7890", email: "luca.m@waltercozza.it",
    pin: "5678", assunto: "2021-09-01", contratto: "determinato",
    patente: "B", automezzo: "Fiat Doblò CD 456 EF",
    avatar: "LM", colore: "#3B7FE0",
    posizione: { lat: 39.3316, lng: 16.2404, aggiornamento: "08/04 07:55", indirizzo: "Sede — Via Industriale, Cosenza" },
    kpi: { commesseAnno: 32, oreAnno: 1320, mediaGiorno: 7.8, ritardi: 5, valutazioneMedia: 4.2, reclami: 3, presenzeMese: 19, assenzeAnno: 8 },
    commesse: [
      {
        id: "COM-2024-091", cliente: "Bar Sport Centrale", indirizzo: "Corso Mazzini 44, Cosenza",
        tipo: "Vetrina commerciale", stato: "in_attesa_materiali", priorita: "media",
        dataInizio: "11/04/2026", dataFine: "12/04/2026", avanzamento: 0,
        vani: [
          { id: "V1", nome: "Vetrina frontale", tipo: "Vetrata fissa temperata", dim: "3000x2400", materiale: "Alluminio CX70 + vetro stratificato 6+6", stato: "da_fare", oreReali: 0, orePreviste: 6 },
        ],
        documenti: [
          { nome: "Preventivo vetrina", tipo: "pdf", data: "01/04", peso: "210 KB" },
        ],
        foto: [],
        chat: [
          { da: "Ufficio", ora: "03/04", testo: "Vetro stratificato ordinato a Vetro Sud. Consegna 10/04", tipo: "ufficio" },
          { da: "Luca", ora: "03/04", testo: "Serve ponteggio?", tipo: "operatore" },
          { da: "Ufficio", ora: "03/04", testo: "No, altezza interna 2.80. Ventose bastano", tipo: "ufficio" },
        ],
        timeline: [
          { data: "01/04", evento: "Preventivo confermato", tipo: "milestone" },
          { data: "03/04", evento: "Ordine vetro a Vetro Sud", tipo: "ordine" },
        ],
        materiali: [
          { nome: "Silicone strutturale", qta: 6, usate: 0, um: "tubi" },
          { nome: "Ventose 3 coppe", qta: 2, usate: 0, um: "pz" },
        ],
        firme: [],
        spese: [],
        ore: [],
      },
    ],
    storicoPrestazioni: [
      { mese: "Gen", commesse: 3, oreNette: 148, valutazione: 4.3, ritardi: 1 },
      { mese: "Feb", commesse: 3, oreNette: 136, valutazione: 4.0, ritardi: 2 },
      { mese: "Mar", commesse: 3, oreNette: 160, valutazione: 4.4, ritardi: 1 },
      { mese: "Apr", commesse: 0, oreNette: 0, valutazione: 0, ritardi: 0 },
    ],
    certificazioni: [
      { nome: "Posa qualificata UNI 11673-1", scadenza: "09/2026", stato: "valida" },
      { nome: "Lavori in quota", scadenza: "05/2026", stato: "in_scadenza" },
    ],
    dotazioni: [
      { nome: "Trapano Makita DHP 486", stato: "assegnato", dal: "09/2021" },
      { nome: "Fiat Doblò CD 456 EF", stato: "assegnato", dal: "09/2021" },
    ],
  },
  {
    id: "op3", nome: "Andrea Russo", ruolo: "tecnico_misure", stato: "in_sopralluogo",
    telefono: "+39 320 111 2233", email: "andrea.r@waltercozza.it",
    pin: "9012", assunto: "2020-01-10", contratto: "indeterminato",
    patente: "B", automezzo: "Fiat 500L GH 789 IJ",
    avatar: "AR", colore: "#7C3AED",
    posizione: { lat: 39.2900, lng: 16.2700, aggiornamento: "08/04 09:10", indirizzo: "Via Gramsci 22, Rende" },
    kpi: { commesseAnno: 62, oreAnno: 1560, mediaGiorno: 7.0, ritardi: 1, valutazioneMedia: 4.9, reclami: 0, presenzeMese: 22, assenzeAnno: 2 },
    commesse: [
      {
        id: "RIL-2024-155", cliente: "Sig.ra Greco", indirizzo: "Via Gramsci 22, Rende",
        tipo: "Rilievo misure infissi", stato: "in_corso", priorita: "alta",
        dataInizio: "08/04/2026", dataFine: "08/04/2026", avanzamento: 40,
        vani: [
          { id: "V1", nome: "Soggiorno", tipo: "Finestra 2 ante", dim: "da rilevare", materiale: "da definire", stato: "in_corso", oreReali: 0.5, orePreviste: 0.5 },
          { id: "V2", nome: "Camera 1", tipo: "Finestra 1 anta", dim: "da rilevare", materiale: "da definire", stato: "da_fare", oreReali: 0, orePreviste: 0.3 },
          { id: "V3", nome: "Camera 2", tipo: "Finestra 1 anta", dim: "da rilevare", materiale: "da definire", stato: "da_fare", oreReali: 0, orePreviste: 0.3 },
          { id: "V4", nome: "Cucina", tipo: "Finestra 1 anta + ribalta", dim: "da rilevare", materiale: "da definire", stato: "da_fare", oreReali: 0, orePreviste: 0.3 },
          { id: "V5", nome: "Bagno", tipo: "Vasistas", dim: "da rilevare", materiale: "da definire", stato: "da_fare", oreReali: 0, orePreviste: 0.2 },
        ],
        documenti: [],
        foto: [
          { src: "ril_soggiorno_1.jpg", fase: "RILIEVO", vano: "V1", data: "08/04 09:20", nota: "Luce muro 1380mm, altezza 1580mm, fuori squadro 3mm" },
        ],
        chat: [
          { da: "Andrea", ora: "08/04 09:05", testo: "Arrivato da Sig.ra Greco. Inizio rilievo", tipo: "operatore" },
          { da: "Andrea", ora: "08/04 09:22", testo: "Soggiorno: luce 1380x1580, fuori squadro 3mm lato dx. Muro 30cm", tipo: "operatore" },
        ],
        timeline: [
          { data: "08/04", evento: "Inizio rilievo misure", tipo: "lavoro" },
        ],
        materiali: [],
        firme: [],
        spese: [],
        ore: [
          { data: "08/04", inizio: "09:00", fine: null, pausa: 0, nette: 0, tipo: "sopralluogo" },
        ],
      },
    ],
    storicoPrestazioni: [
      { mese: "Gen", commesse: 6, oreNette: 154, valutazione: 4.9, ritardi: 0 },
      { mese: "Feb", commesse: 5, oreNette: 140, valutazione: 4.8, ritardi: 1 },
      { mese: "Mar", commesse: 7, oreNette: 168, valutazione: 5.0, ritardi: 0 },
      { mese: "Apr", commesse: 1, oreNette: 8, valutazione: 0, ritardi: 0 },
    ],
    certificazioni: [
      { nome: "Posa qualificata UNI 11673-1", scadenza: "01/2027", stato: "valida" },
      { nome: "Termografia edifici livello 1", scadenza: "11/2026", stato: "valida" },
    ],
    dotazioni: [
      { nome: "Metro laser Leica DISTO D2", stato: "assegnato", dal: "01/2020" },
      { nome: "iPad Pro 12.9 + Apple Pencil", stato: "assegnato", dal: "03/2023" },
      { nome: "Fiat 500L GH 789 IJ", stato: "assegnato", dal: "01/2020" },
    ],
  },
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const statoColor = (s: string) => {
  const m: Record<string, { bg: string; fg: string; label: string }> = {
    in_cantiere:         { bg: T.greenLight,   fg: T.green,  label: "In cantiere" },
    disponibile:         { bg: T.tealLight,    fg: T.teal,   label: "Disponibile" },
    in_sopralluogo:      { bg: T.purpleLight,  fg: T.purple, label: "In sopralluogo" },
    in_pausa:            { bg: T.amberLight,   fg: T.amber,  label: "In pausa" },
    non_disponibile:     { bg: T.redLight,     fg: T.red,    label: "Non disponibile" },
  };
  return m[s] || { bg: T.bgAlt, fg: T.sub, label: s };
};

const statoVanoColor = (s: string) => {
  const m: Record<string, { dot: string; label: string }> = {
    montato:  { dot: T.green, label: "Montato" },
    in_corso: { dot: T.amber, label: "In corso" },
    da_fare:  { dot: T.muted, label: "Da fare" },
  };
  return m[s] || { dot: T.muted, label: s };
};

const statoCommColor = (s: string) => {
  const m: Record<string, { dot: string; label: string }> = {
    in_corso:             { dot: T.green, label: "In corso" },
    programmata:          { dot: T.blue,  label: "Programmata" },
    in_attesa_materiali:  { dot: T.amber, label: "Attesa materiali" },
    completata:           { dot: T.teal,  label: "Completata" },
  };
  return m[s] || { dot: T.muted, label: s };
};

const tipoTimelineIcon = (tipo: string) => {
  const m: Record<string, string> = {
    milestone: "◆", ordine: "▶", consegna: "📦", logistica: "🚛",
    lavoro: "🔧", assegnazione: "👤", oggi: "●",
  };
  return m[tipo] || "·";
};

const tipoChatColor = (tipo: string) => {
  const m: Record<string, string> = { operatore: T.teal, ufficio: T.blue, cliente: T.green, ai: T.purple };
  return m[tipo] || T.sub;
};

const fmtOre = (n: number) => n > 0 ? `${n.toFixed(1)}h` : "—";

/* ═══════════════════════════════════════════
   SEZIONE: LINE DIVIDER
═══════════════════════════════════════════ */
const Line = () => <div style={{ borderBottom: `1px solid ${T.line}` }} />;
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "14px 20px 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: T.muted }}>{children}</div>
);

/* ═══════════════════════════════════════════
   BARRA AVANZAMENTO
═══════════════════════════════════════════ */
const ProgressBar = ({ pct, height = 4 }: { pct: number; height?: number }) => (
  <div style={{ background: T.lineLight, borderRadius: height / 2, height, overflow: "hidden", flex: 1 }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: height / 2, background: pct >= 100 ? T.green : pct >= 50 ? T.teal : T.amber, transition: "width 0.3s" }} />
  </div>
);

/* ═══════════════════════════════════════════
   COMPONENTE PRINCIPALE
═══════════════════════════════════════════ */
export default function PortaleAzienda() {
  const [selOp, setSelOp] = useState<string | null>(null);
  const [selComm, setSelComm] = useState<string | null>(null);
  const [commTab, setCommTab] = useState("vani");
  const [search, setSearch] = useState("");

  const opFiltered = useMemo(() => {
    if (!search) return OPERATORI;
    const q = search.toLowerCase();
    return OPERATORI.filter(o => o.nome.toLowerCase().includes(q) || o.ruolo.includes(q) || o.id.includes(q));
  }, [search]);

  const op = OPERATORI.find(o => o.id === selOp);
  const comm = op?.commesse.find(c => c.id === selComm);

  // ── SIDEBAR ──
  const Sidebar = () => (
    <div style={{ width: 280, borderRight: `1px solid ${T.line}`, background: T.bgAlt, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>f</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>fliwoX</span>
          <span style={{ fontSize: 11, color: T.muted, marginLeft: "auto" }}>Portale Azienda</span>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca operatore..."
          style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13, background: T.bg, outline: "none", color: T.ink, fontFamily: T.font }}
        />
      </div>
      {/* KPI azienda */}
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.line}`, display: "flex", gap: 12 }}>
        <div><span style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>{OPERATORI.length}</span><span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>operatori</span></div>
        <div><span style={{ fontSize: 18, fontWeight: 700, color: T.green }}>{OPERATORI.filter(o => o.stato === "in_cantiere" || o.stato === "in_sopralluogo").length}</span><span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>attivi</span></div>
        <div><span style={{ fontSize: 18, fontWeight: 700, color: T.amber }}>{OPERATORI.reduce((s, o) => s + o.commesse.filter(c => c.stato === "in_attesa_materiali").length, 0)}</span><span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>bloccati</span></div>
      </div>
      {/* Lista */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {opFiltered.map(o => {
          const sc = statoColor(o.stato);
          const active = o.id === selOp;
          return (
            <div key={o.id} onClick={() => { setSelOp(o.id); setSelComm(null); }}
              style={{ padding: "12px 16px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer", background: active ? T.tealLight : "transparent", transition: "background 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: o.colore, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{o.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.nome}</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{o.ruolo === "montatore" ? "Montatore" : o.ruolo === "tecnico_misure" ? "Tecnico misure" : o.ruolo}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: sc.fg, background: sc.bg, padding: "3px 8px", borderRadius: 4 }}>{sc.label}</span>
              </div>
              {/* Mini commesse */}
              <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {o.commesse.slice(0, 3).map(c => {
                  const cc = statoCommColor(c.stato);
                  return (
                    <span key={c.id} style={{ fontSize: 10, color: T.sub, display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cc.dot, display: "inline-block" }} />
                      {c.id}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── DETTAGLIO OPERATORE ──
  const DettaglioOp = () => {
    if (!op) return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 14 }}>
        Seleziona un operatore dalla lista
      </div>
    );

    const sc = statoColor(op.stato);
    const oreOggi = op.commesse.reduce((s, c) => s + c.ore.filter(o => o.data === "08/04").reduce((s2, o2) => s2 + (o2.nette || 0), 0), 0);
    const speseMese = op.commesse.reduce((s, c) => s + c.spese.reduce((s2, sp) => s2 + sp.importo, 0), 0);

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── HEADER OPERATORE ── */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.line}`, background: T.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: op.colore, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 800 }}>{op.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{op.nome}</div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{op.ruolo === "montatore" ? "Montatore" : "Tecnico misure"} · {op.telefono} · {op.automezzo}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: sc.fg, background: sc.bg, padding: "4px 10px", borderRadius: 5 }}>{sc.label}</span>
          </div>
          {/* KPI row */}
          <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Commesse anno", val: op.kpi.commesseAnno, color: T.ink },
              { label: "Ore anno", val: `${op.kpi.oreAnno}h`, color: T.ink },
              { label: "Media/giorno", val: `${op.kpi.mediaGiorno}h`, color: T.teal },
              { label: "Valutazione", val: `${op.kpi.valutazioneMedia}/5`, color: op.kpi.valutazioneMedia >= 4.5 ? T.green : T.amber },
              { label: "Ritardi", val: op.kpi.ritardi, color: op.kpi.ritardi > 3 ? T.red : T.ink },
              { label: "Reclami", val: op.kpi.reclami, color: op.kpi.reclami > 2 ? T.red : T.ink },
              { label: "Presenze mese", val: `${op.kpi.presenzeMese}/22`, color: T.ink },
              { label: "Spese mese", val: `€${speseMese.toFixed(0)}`, color: T.amber },
            ].map((k, i) => (
              <div key={i} style={{ minWidth: 80 }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 2 }}>{k.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: k.color, fontFamily: T.mono }}>{k.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY — 2 colonne ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* COLONNA SX — Commesse */}
          <div style={{ width: 340, borderRight: `1px solid ${T.line}`, overflowY: "auto" }}>
            <SectionTitle>Commesse assegnate ({op.commesse.length})</SectionTitle>
            {op.commesse.map(c => {
              const cc = statoCommColor(c.stato);
              const active = c.id === selComm;
              const oreTot = c.vani.reduce((s, v) => s + v.oreReali, 0);
              const orePrev = c.vani.reduce((s, v) => s + v.orePreviste, 0);
              return (
                <div key={c.id} onClick={() => { setSelComm(c.id); setCommTab("vani"); }}
                  style={{ padding: "12px 20px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer", background: active ? T.tealLight : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cc.dot }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.teal, fontFamily: T.mono }}>{c.id}</span>
                    <span style={{ fontSize: 11, color: T.sub, marginLeft: "auto" }}>{cc.label}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{c.cliente}</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{c.tipo} · {c.indirizzo}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <ProgressBar pct={c.avanzamento} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.ink, fontFamily: T.mono, minWidth: 30, textAlign: "right" }}>{c.avanzamento}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: T.sub }}>
                    <span>{c.vani.length} vani</span>
                    <span>{fmtOre(oreTot)}/{fmtOre(orePrev)}</span>
                    <span>{c.foto.length} foto</span>
                    <span>{c.documenti.length} doc</span>
                    <span>{c.chat.length} msg</span>
                    <span>{c.spese.length} spese</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.sub, marginTop: 4 }}>{c.dataInizio} → {c.dataFine}</div>
                </div>
              );
            })}

            {/* ── SEZIONI EXTRA OPERATORE ── */}
            <Line />
            <SectionTitle>Posizione GPS</SectionTitle>
            <div style={{ padding: "8px 20px 14px" }}>
              <div style={{ fontSize: 12, color: T.ink }}>{op.posizione.indirizzo}</div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>Aggiornamento: {op.posizione.aggiornamento} · {op.posizione.lat.toFixed(4)}, {op.posizione.lng.toFixed(4)}</div>
            </div>

            <Line />
            <SectionTitle>Certificazioni</SectionTitle>
            {op.certificazioni.map((c, i) => (
              <div key={i} style={{ padding: "6px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.stato === "valida" ? T.green : c.stato === "in_scadenza" ? T.amber : T.red }} />
                <span style={{ fontSize: 12, color: T.ink, flex: 1 }}>{c.nome}</span>
                <span style={{ fontSize: 10, color: c.stato === "in_scadenza" ? T.amber : T.sub, fontFamily: T.mono }}>{c.scadenza}</span>
              </div>
            ))}

            <Line />
            <SectionTitle>Dotazioni assegnate</SectionTitle>
            {op.dotazioni.map((d, i) => (
              <div key={i} style={{ padding: "6px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: T.ink, flex: 1 }}>{d.nome}</span>
                <span style={{ fontSize: 10, color: T.sub }}>dal {d.dal}</span>
              </div>
            ))}

            <Line />
            <SectionTitle>Storico prestazioni</SectionTitle>
            <div style={{ padding: "4px 20px 14px" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60, marginBottom: 6 }}>
                {op.storicoPrestazioni.map((p, i) => {
                  const maxH = 56;
                  const h = p.oreNette > 0 ? Math.max((p.oreNette / 180) * maxH, 4) : 2;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: "100%", maxWidth: 28, height: h, borderRadius: 3, background: p.valutazione >= 4.5 ? T.teal : p.valutazione >= 4 ? T.blue : T.amber, opacity: 0.7 }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {op.storicoPrestazioni.map((p, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: T.muted }}>{p.mese}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.ink, fontFamily: T.mono }}>{p.oreNette}h</div>
                    <div style={{ fontSize: 9, color: p.valutazione >= 4.5 ? T.green : T.sub }}>{p.valutazione > 0 ? `${p.valutazione}★` : "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLONNA DX — Dettaglio commessa */}
          <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
            {!comm ? (
              <div style={{ padding: 40, textAlign: "center", color: T.muted, fontSize: 13 }}>
                Seleziona una commessa per vedere tutti i dettagli
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: `1px solid ${T.line}`, padding: "0 20px", position: "sticky", top: 0, background: T.bg, zIndex: 2 }}>
                  {["vani", "foto", "documenti", "chat", "timeline", "materiali", "firme", "spese", "ore"].map(tab => (
                    <div key={tab} onClick={() => setCommTab(tab)}
                      style={{ padding: "10px 14px", fontSize: 11, fontWeight: commTab === tab ? 700 : 500, color: commTab === tab ? T.teal : T.sub, borderBottom: commTab === tab ? `2px solid ${T.teal}` : "2px solid transparent", cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s" }}>
                      {tab}
                    </div>
                  ))}
                </div>

                {/* ── TAB VANI ── */}
                {commTab === "vani" && (
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                      {comm.vani.length} vani — {comm.vani.filter(v => v.stato === "montato").length} completati, {comm.vani.filter(v => v.stato === "in_corso").length} in corso
                    </div>
                    {comm.vani.map((v, i) => {
                      const vc = statoVanoColor(v.stato);
                      return (
                        <React.Fragment key={v.id}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: vc.dot, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{v.id} · {v.nome}</span>
                                <span style={{ fontSize: 10, color: T.sub }}>{v.tipo}</span>
                              </div>
                              <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                                {v.dim} · {v.materiale}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 10, color: vc.dot === T.green ? T.green : T.sub, fontWeight: 600 }}>{vc.label}</div>
                              <div style={{ fontSize: 11, fontFamily: T.mono, color: T.ink, marginTop: 1 }}>{fmtOre(v.oreReali)}/{fmtOre(v.orePreviste)}</div>
                            </div>
                          </div>
                          {i < comm.vani.length - 1 && <Line />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* ── TAB FOTO ── */}
                {commTab === "foto" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.foto.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna foto caricata</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.foto.length} foto</div>
                        {comm.foto.map((f, i) => {
                          const faseColor: Record<string, string> = { PRIMA: T.blue, DEMOLIZIONE: T.red, MONTAGGIO: T.amber, DOPO: T.green, RILIEVO: T.purple };
                          return (
                            <React.Fragment key={i}>
                              <div style={{ padding: "10px 0", display: "flex", gap: 12, alignItems: "flex-start" }}>
                                {/* Placeholder foto */}
                                <div style={{ width: 64, height: 64, borderRadius: 6, background: T.lineLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${T.line}` }}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: faseColor[f.fase] || T.sub, background: `${faseColor[f.fase] || T.sub}15`, padding: "1px 6px", borderRadius: 3 }}>{f.fase}</span>
                                    <span style={{ fontSize: 10, color: T.sub }}>Vano {f.vano}</span>
                                    <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>{f.data}</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: T.ink }}>{f.nota}</div>
                                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{f.src}</div>
                                </div>
                              </div>
                              {i < comm.foto.length - 1 && <Line />}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* ── TAB DOCUMENTI ── */}
                {commTab === "documenti" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.documenti.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun documento</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.documenti.length} documenti</div>
                        {comm.documenti.map((d, i) => (
                          <React.Fragment key={i}>
                            <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 6, background: d.tipo === "pdf" ? T.redLight : T.blueLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: d.tipo === "pdf" ? T.red : T.blue, textTransform: "uppercase" }}>{d.tipo}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.nome}</div>
                                <div style={{ fontSize: 10, color: T.sub, marginTop: 1 }}>{d.peso}</div>
                              </div>
                              <span style={{ fontSize: 10, color: T.muted }}>{d.data}</span>
                            </div>
                            {i < comm.documenti.length - 1 && <Line />}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* ── TAB CHAT ── */}
                {commTab === "chat" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.chat.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun messaggio</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.chat.length} messaggi</div>
                        {comm.chat.map((msg, i) => {
                          const col = tipoChatColor(msg.tipo);
                          return (
                            <React.Fragment key={i}>
                              <div style={{ padding: "8px 0", display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: col, flexShrink: 0, marginTop: 6 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: col }}>{msg.da}</span>
                                    <span style={{ fontSize: 10, color: T.muted }}>{msg.ora}</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>{msg.testo}</div>
                                </div>
                              </div>
                              {i < comm.chat.length - 1 && <Line />}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* ── TAB TIMELINE ── */}
                {commTab === "timeline" && (
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Timeline commessa</div>
                    {comm.timeline.map((t, i) => (
                      <div key={i} style={{ padding: "8px 0", display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 24, textAlign: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: t.tipo === "oggi" ? 10 : 12, color: t.tipo === "oggi" ? T.teal : T.sub }}>{tipoTimelineIcon(t.tipo)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: t.tipo === "oggi" ? T.teal : T.ink, fontWeight: t.tipo === "oggi" ? 700 : 400 }}>{t.evento}</div>
                        </div>
                        <span style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, flexShrink: 0 }}>{t.data}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── TAB MATERIALI ── */}
                {commTab === "materiali" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.materiali.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun materiale assegnato</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.materiali.length} materiali</div>
                        {comm.materiali.map((m, i) => {
                          const pct = m.qta > 0 ? (m.usate / m.qta) * 100 : 0;
                          return (
                            <React.Fragment key={i}>
                              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, color: T.ink }}>{m.nome}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                    <ProgressBar pct={pct} height={3} />
                                    <span style={{ fontSize: 10, color: T.sub, fontFamily: T.mono, minWidth: 60 }}>{m.usate}/{m.qta} {m.um}</span>
                                  </div>
                                </div>
                              </div>
                              {i < comm.materiali.length - 1 && <Line />}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* ── TAB FIRME ── */}
                {commTab === "firme" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.firme.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna firma richiesta</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Firme</div>
                        {comm.firme.map((f, i) => (
                          <React.Fragment key={i}>
                            <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.firmato ? T.green : T.muted, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: T.ink, fontWeight: 500 }}>{f.tipo}</div>
                                {f.firmato && <div style={{ fontSize: 10, color: T.sub, marginTop: 1 }}>{f.chi} · {f.data}</div>}
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 600, color: f.firmato ? T.green : T.muted }}>{f.firmato ? "Firmato" : "In attesa"}</span>
                            </div>
                            {i < comm.firme.length - 1 && <Line />}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* ── TAB SPESE ── */}
                {commTab === "spese" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.spese.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna spesa registrata</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                          {comm.spese.length} spese · Totale: €{comm.spese.reduce((s, sp) => s + sp.importo, 0).toFixed(2)}
                        </div>
                        {comm.spese.map((sp, i) => (
                          <React.Fragment key={i}>
                            <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: T.ink }}>{sp.desc}</div>
                                <div style={{ fontSize: 10, color: T.sub, marginTop: 1 }}>{sp.cat} · {sp.data}</div>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: T.mono }}>€{sp.importo.toFixed(2)}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, color: sp.stato === "approvata" ? T.green : T.amber, background: sp.stato === "approvata" ? T.greenLight : T.amberLight }}>{sp.stato === "approvata" ? "OK" : "Attesa"}</span>
                            </div>
                            {i < comm.spese.length - 1 && <Line />}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* ── TAB ORE ── */}
                {commTab === "ore" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.ore.length === 0 ? (
                      <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna ora registrata</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                          Ore lavorate · Totale: {fmtOre(comm.ore.reduce((s, o) => s + o.nette, 0))}
                        </div>
                        {comm.ore.map((o, i) => (
                          <React.Fragment key={i}>
                            <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: T.ink, fontFamily: T.mono, minWidth: 42 }}>{o.data}</span>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 12, color: T.ink }}>{o.inizio}</span>
                                <span style={{ fontSize: 10, color: T.muted }}>→</span>
                                <span style={{ fontSize: 12, color: o.fine ? T.ink : T.amber }}>{o.fine || "in corso"}</span>
                                {o.pausa > 0 && <span style={{ fontSize: 10, color: T.sub }}>({o.pausa}min pausa)</span>}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: T.teal, fontFamily: T.mono }}>{o.nette > 0 ? fmtOre(o.nette) : "..."}</span>
                              <span style={{ fontSize: 10, color: T.muted }}>{o.tipo}</span>
                            </div>
                            {i < comm.ore.length - 1 && <Line />}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", fontFamily: T.font, color: T.ink, height: "100vh", overflow: "hidden", background: T.bg }}>
      <Sidebar />
      <DettaglioOp />
    </div>
  );
}
