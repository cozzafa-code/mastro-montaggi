// @ts-nocheck
// ImportaCommessa.tsx — Importa commesse da Opera, FpPro, Finestra3000, Gesty, Excel, CSV
'use client';
import React, { useState, useRef } from 'react';

const DS = {
  bg:'#E8F4F4',topbar:'#0D1F1F',teal:'#28A0A0',tealDark:'#156060',
  card:'#fff',border:'#C8E4E4',text:'#0D1F1F',textMid:'#4A7070',textLight:'#8BBCBC',
  red:'#DC4444',green:'#1A9E73',amber:'#D08008',blue:'#3B7FE0',
};

// ─── FORMATO DETECTION ────────────────────────────────────────────────────────
type Formato = 'opera_xml'|'fppro_xml'|'finestra3000_xml'|'generic_xml'|'excel'|'csv'|'sconosciuto';

function detectFormato(fileName: string, content: string): Formato {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const upper = content.slice(0, 2000).toUpperCase();

  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  if (ext === 'csv' || ext === 'tsv') return 'csv';

  if (ext === 'xml' || ext === 'ope' || ext === 'fpp') {
    // Detect by content signatures
    if (upper.includes('<OPERA') || upper.includes('<EMMEGISOFT') || upper.includes('<COMMESSA') && upper.includes('<VANO'))
      return 'opera_xml';
    if (upper.includes('<FPPRO') || upper.includes('<FINESTRAPROJECT') || upper.includes('FPPRO'))
      return 'fppro_xml';
    if (upper.includes('<FINESTRA3000') || upper.includes('<F3K') || upper.includes('<SERRAMENTO'))
      return 'finestra3000_xml';
    return 'generic_xml';
  }

  // Try content detection for files without extension
  if (content.trim().startsWith('<?xml') || content.trim().startsWith('<')) {
    if (upper.includes('<OPERA') || upper.includes('<EMMEGISOFT')) return 'opera_xml';
    if (upper.includes('<FPPRO')) return 'fppro_xml';
    if (upper.includes('<FINESTRA3000') || upper.includes('<F3K')) return 'finestra3000_xml';
    return 'generic_xml';
  }

  if (content.includes(';') || content.includes(',') || content.includes('\t')) return 'csv';

  return 'sconosciuto';
}

// ─── PARSERS ──────────────────────────────────────────────────────────────────
interface VanoImportato {
  nome: string;
  tipo: string;
  materiale: string;
  larghezza: number | null;
  altezza: number | null;
  stanza: string;
  piano: string;
  note: string;
  colore_int?: string;
  colore_est?: string;
  vetro?: string;
  sistema?: string;
}

interface CommessaImportata {
  cliente: string;
  indirizzo: string;
  telefono: string;
  email: string;
  note: string;
  vani: VanoImportato[];
  formato_sorgente: string;
  errori: string[];
}

// Helper: parse XML to DOM
function parseXML(content: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    if (doc.querySelector('parsererror')) return null;
    return doc;
  } catch { return null; }
}

// Helper: get text from XML node
function xt(el: Element | null, tag: string): string {
  if (!el) return '';
  const node = el.getElementsByTagName(tag)[0] || el.querySelector(tag);
  return node?.textContent?.trim() || '';
}

// Helper: get number from XML node
function xn(el: Element | null, tag: string): number | null {
  const v = xt(el, tag);
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ─── OPERA / EMMEGISOFT XML ───────────────────────────────────────────────────
function parseOpera(content: string): CommessaImportata {
  const doc = parseXML(content);
  const errori: string[] = [];
  if (!doc) return { cliente:'', indirizzo:'', telefono:'', email:'', note:'Parse XML fallito', vani:[], formato_sorgente:'opera_xml', errori:['XML non valido'] };

  // Opera uses various tag names - try common patterns
  const root = doc.documentElement;
  const cliente = xt(root, 'Cliente') || xt(root, 'CLIENTE') || xt(root, 'NomeCliente') || xt(root, 'Committente') || '';
  const indirizzo = xt(root, 'Indirizzo') || xt(root, 'INDIRIZZO') || xt(root, 'IndirizzoCantiere') || '';
  const telefono = xt(root, 'Telefono') || xt(root, 'TEL') || xt(root, 'Tel') || '';
  const email = xt(root, 'Email') || xt(root, 'EMAIL') || '';

  // Find vani/serramenti nodes
  const vaniNodes = [
    ...Array.from(doc.getElementsByTagName('Vano')),
    ...Array.from(doc.getElementsByTagName('VANO')),
    ...Array.from(doc.getElementsByTagName('Serramento')),
    ...Array.from(doc.getElementsByTagName('SERRAMENTO')),
    ...Array.from(doc.getElementsByTagName('Finestra')),
    ...Array.from(doc.getElementsByTagName('Elemento')),
  ];

  const vani: VanoImportato[] = vaniNodes.map((v, i) => {
    const tipo = xt(v, 'Tipo') || xt(v, 'TIPO') || xt(v, 'TipoSerramento') || xt(v, 'Tipologia') || 'Finestra';
    const mat = xt(v, 'Materiale') || xt(v, 'MATERIALE') || xt(v, 'Sistema') || xt(v, 'Profilo') || 'PVC';
    const l = xn(v, 'Larghezza') || xn(v, 'LARGHEZZA') || xn(v, 'L') || xn(v, 'Width');
    const h = xn(v, 'Altezza') || xn(v, 'ALTEZZA') || xn(v, 'H') || xn(v, 'Height');

    return {
      nome: xt(v, 'Nome') || xt(v, 'NOME') || xt(v, 'Descrizione') || `Vano ${i+1}`,
      tipo: mapTipo(tipo),
      materiale: mapMateriale(mat),
      larghezza: l,
      altezza: h,
      stanza: xt(v, 'Stanza') || xt(v, 'Locale') || xt(v, 'LOCALE') || '',
      piano: xt(v, 'Piano') || xt(v, 'PIANO') || 'PT',
      note: xt(v, 'Note') || xt(v, 'NOTE') || '',
      colore_int: xt(v, 'ColoreInterno') || xt(v, 'COLORE_INT') || '',
      colore_est: xt(v, 'ColoreEsterno') || xt(v, 'COLORE_EST') || '',
      vetro: xt(v, 'Vetro') || xt(v, 'VETRO') || xt(v, 'TipoVetro') || '',
      sistema: xt(v, 'Sistema') || xt(v, 'SISTEMA') || xt(v, 'Profilo') || '',
    };
  });

  if (vani.length === 0) errori.push('Nessun vano trovato nel file');

  return { cliente, indirizzo, telefono, email, note: '', vani, formato_sorgente: 'opera_xml', errori };
}

// ─── FPPRO XML ────────────────────────────────────────────────────────────────
function parseFpPro(content: string): CommessaImportata {
  const doc = parseXML(content);
  const errori: string[] = [];
  if (!doc) return { cliente:'', indirizzo:'', telefono:'', email:'', note:'Parse XML fallito', vani:[], formato_sorgente:'fppro_xml', errori:['XML non valido'] };

  const root = doc.documentElement;
  const cliente = xt(root, 'Cliente') || xt(root, 'NomeCliente') || xt(root, 'Customer') || '';
  const indirizzo = xt(root, 'Indirizzo') || xt(root, 'Address') || '';

  const vaniNodes = [
    ...Array.from(doc.getElementsByTagName('Window')),
    ...Array.from(doc.getElementsByTagName('Door')),
    ...Array.from(doc.getElementsByTagName('Element')),
    ...Array.from(doc.getElementsByTagName('Serramento')),
    ...Array.from(doc.getElementsByTagName('Item')),
  ];

  const vani: VanoImportato[] = vaniNodes.map((v, i) => ({
    nome: xt(v, 'Name') || xt(v, 'Description') || xt(v, 'Desc') || `Vano ${i+1}`,
    tipo: mapTipo(xt(v, 'Type') || xt(v, 'Tipo') || v.tagName || 'Finestra'),
    materiale: mapMateriale(xt(v, 'Material') || xt(v, 'Profile') || xt(v, 'System') || 'PVC'),
    larghezza: xn(v, 'Width') || xn(v, 'W') || xn(v, 'Larghezza'),
    altezza: xn(v, 'Height') || xn(v, 'H') || xn(v, 'Altezza'),
    stanza: xt(v, 'Room') || xt(v, 'Location') || xt(v, 'Stanza') || '',
    piano: xt(v, 'Floor') || xt(v, 'Level') || xt(v, 'Piano') || 'PT',
    note: xt(v, 'Notes') || xt(v, 'Note') || '',
    colore_int: xt(v, 'ColorInt') || xt(v, 'InternalColor') || '',
    colore_est: xt(v, 'ColorExt') || xt(v, 'ExternalColor') || '',
    vetro: xt(v, 'Glass') || xt(v, 'Glazing') || '',
    sistema: xt(v, 'System') || xt(v, 'Profile') || '',
  }));

  if (vani.length === 0) errori.push('Nessun vano trovato nel file');
  return { cliente, indirizzo, telefono: '', email: '', note: '', vani, formato_sorgente: 'fppro_xml', errori };
}

// ─── FINESTRA 3000 XML ────────────────────────────────────────────────────────
function parseFinestra3000(content: string): CommessaImportata {
  // Very similar pattern to Opera/FpPro - different tag names
  const doc = parseXML(content);
  const errori: string[] = [];
  if (!doc) return { cliente:'', indirizzo:'', telefono:'', email:'', note:'', vani:[], formato_sorgente:'finestra3000_xml', errori:['XML non valido'] };

  const root = doc.documentElement;
  const cliente = xt(root, 'RagioneSociale') || xt(root, 'Cliente') || xt(root, 'Nominativo') || '';
  const indirizzo = xt(root, 'Indirizzo') || xt(root, 'Via') || '';

  const vaniNodes = [
    ...Array.from(doc.getElementsByTagName('Serramento')),
    ...Array.from(doc.getElementsByTagName('Posizione')),
    ...Array.from(doc.getElementsByTagName('Riga')),
  ];

  const vani: VanoImportato[] = vaniNodes.map((v, i) => ({
    nome: xt(v, 'Descrizione') || xt(v, 'Codice') || `Vano ${i+1}`,
    tipo: mapTipo(xt(v, 'Tipologia') || xt(v, 'Tipo') || 'Finestra'),
    materiale: mapMateriale(xt(v, 'Materiale') || xt(v, 'Profilo') || 'PVC'),
    larghezza: xn(v, 'Larghezza') || xn(v, 'Base'),
    altezza: xn(v, 'Altezza'),
    stanza: xt(v, 'Ambiente') || xt(v, 'Stanza') || '',
    piano: xt(v, 'Piano') || 'PT',
    note: xt(v, 'Note') || '',
    vetro: xt(v, 'Vetro') || xt(v, 'Vetrocamera') || '',
    sistema: xt(v, 'Serie') || xt(v, 'Sistema') || '',
  }));

  if (vani.length === 0) errori.push('Nessun vano trovato nel file');
  return { cliente, indirizzo, telefono: '', email: '', note: '', vani, formato_sorgente: 'finestra3000_xml', errori };
}

// ─── GENERIC XML ──────────────────────────────────────────────────────────────
function parseGenericXML(content: string): CommessaImportata {
  // Try all patterns
  const result = parseOpera(content);
  if (result.vani.length > 0) return { ...result, formato_sorgente: 'generic_xml' };
  const result2 = parseFpPro(content);
  if (result2.vani.length > 0) return { ...result2, formato_sorgente: 'generic_xml' };
  return { ...result, formato_sorgente: 'generic_xml', errori: ['Formato XML non riconosciuto. Prova a esportare in CSV.'] };
}

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSV(content: string): CommessaImportata {
  const errori: string[] = [];
  const sep = content.includes(';') ? ';' : content.includes('\t') ? '\t' : ',';
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length < 2) return { cliente:'', indirizzo:'', telefono:'', email:'', note:'', vani:[], formato_sorgente:'csv', errori:['File vuoto o troppo corto'] };

  const headers = lines[0].split(sep).map(h => h.replace(/['"]/g, '').trim().toLowerCase());

  // Map header names to standard fields
  const headerMap: Record<string, string[]> = {
    nome: ['nome', 'name', 'descrizione', 'description', 'vano', 'codice', 'posizione'],
    tipo: ['tipo', 'type', 'tipologia', 'serramento'],
    materiale: ['materiale', 'material', 'profilo', 'profile', 'sistema', 'system'],
    larghezza: ['larghezza', 'width', 'l', 'base', 'larg'],
    altezza: ['altezza', 'height', 'h', 'alt'],
    stanza: ['stanza', 'room', 'locale', 'ambiente', 'location'],
    piano: ['piano', 'floor', 'level'],
    note: ['note', 'notes', 'annotazioni', 'osservazioni'],
    colore_int: ['colore_int', 'coloreinterno', 'colorint', 'internal_color'],
    colore_est: ['colore_est', 'coloreesterno', 'colorext', 'external_color'],
    vetro: ['vetro', 'glass', 'glazing', 'vetrocamera'],
    cliente: ['cliente', 'customer', 'client', 'committente', 'ragionesociale'],
    indirizzo: ['indirizzo', 'address', 'via', 'cantiere'],
  };

  const findCol = (field: string): number => {
    const aliases = headerMap[field] || [field];
    for (const alias of aliases) {
      const idx = headers.indexOf(alias);
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const colIdx: Record<string, number> = {};
  for (const field of Object.keys(headerMap)) {
    colIdx[field] = findCol(field);
  }

  // If first row might be a client header row
  let clienteVal = '';
  let indirizzoVal = '';
  if (colIdx.cliente >= 0) {
    const firstDataRow = lines[1].split(sep).map(c => c.replace(/['"]/g, '').trim());
    clienteVal = firstDataRow[colIdx.cliente] || '';
    indirizzoVal = colIdx.indirizzo >= 0 ? (firstDataRow[colIdx.indirizzo] || '') : '';
  }

  const vani: VanoImportato[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.replace(/['"]/g, '').trim());
    if (cols.length < 2) continue;

    const getVal = (field: string) => colIdx[field] >= 0 ? (cols[colIdx[field]] || '') : '';
    const getNum = (field: string) => { const v = getVal(field); const n = parseFloat(v); return isNaN(n) ? null : n; };

    // Skip rows that look like subtotals or empty
    const nome = getVal('nome');
    const tipo = getVal('tipo');
    if (!nome && !tipo && !getVal('larghezza')) continue;

    vani.push({
      nome: nome || `Vano ${vani.length + 1}`,
      tipo: mapTipo(tipo || 'Finestra'),
      materiale: mapMateriale(getVal('materiale') || 'PVC'),
      larghezza: getNum('larghezza'),
      altezza: getNum('altezza'),
      stanza: getVal('stanza'),
      piano: getVal('piano') || 'PT',
      note: getVal('note'),
      colore_int: getVal('colore_int'),
      colore_est: getVal('colore_est'),
      vetro: getVal('vetro'),
    });
  }

  if (vani.length === 0) errori.push('Nessun vano trovato. Verifica che le colonne abbiano intestazioni riconoscibili.');
  return { cliente: clienteVal, indirizzo: indirizzoVal, telefono: '', email: '', note: '', vani, formato_sorgente: 'csv', errori };
}

// ─── EXCEL PARSER (basic — reads as CSV from clipboard/text) ──────────────────
function parseExcel(content: string): CommessaImportata {
  // Note: real .xlsx parsing requires a library (SheetJS) — to be handled client-side
  // For now, if user pastes from Excel it comes as TSV
  return parseCSV(content);
}

// ─── MAPPERS ──────────────────────────────────────────────────────────────────
function mapTipo(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('portafinestra') || r.includes('balcon')) return 'Portafinestra';
  if (r.includes('porta') || r.includes('door')) return 'Porta';
  if (r.includes('scorr') || r.includes('slid')) return 'Scorrevole';
  if (r.includes('velux') || r.includes('tetto') || r.includes('roof')) return 'Velux';
  if (r.includes('persian') || r.includes('shutter')) return 'Persiana';
  if (r.includes('zanzar') || r.includes('mosquit')) return 'Zanzariera';
  if (r.includes('casson')) return 'Cassonetto';
  if (r.includes('finestr') || r.includes('window') || r.includes('f1a') || r.includes('f2a')) return 'Finestra';
  return 'Finestra';
}

function mapMateriale(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('allum') || r.includes('alu')) return 'Alluminio';
  if (r.includes('legno') || r.includes('wood')) return 'Legno';
  if (r.includes('acciaio') || r.includes('steel')) return 'Acciaio';
  if (r.includes('composit') || r.includes('alu') && r.includes('legno')) return 'Alluminio-Legno';
  if (r.includes('pvc') || r.includes('ideal') || r.includes('energeto') || r.includes('aluplast') || r.includes('rehau') || r.includes('veka') || r.includes('koemmerling') || r.includes('schuco') || r.includes('salamander')) return 'PVC';
  return 'PVC';
}

// ─── MASTER PARSE FUNCTION ────────────────────────────────────────────────────
function parseFile(fileName: string, content: string): CommessaImportata {
  const formato = detectFormato(fileName, content);
  switch (formato) {
    case 'opera_xml': return parseOpera(content);
    case 'fppro_xml': return parseFpPro(content);
    case 'finestra3000_xml': return parseFinestra3000(content);
    case 'generic_xml': return parseGenericXML(content);
    case 'csv': return parseCSV(content);
    case 'excel': return parseExcel(content);
    default: return { cliente: '', indirizzo: '', telefono: '', email: '', note: '', vani: [], formato_sorgente: 'sconosciuto', errori: ['Formato file non riconosciuto. Formati supportati: XML (Opera, FpPro, Finestra3000), CSV, Excel.'] };
  }
}

// ─── COMPONENTE UI ────────────────────────────────────────────────────────────
interface ImportaProps {
  onImport: (data: CommessaImportata) => void;
  onClose: () => void;
}

export default function ImportaCommessa({ onImport, onClose }: ImportaProps) {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<CommessaImportata | null>(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setParsing(true);
    setResult(null);

    try {
      // Per Excel reali (.xlsx), serve SheetJS
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Dynamically load SheetJS
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
        const parsed = parseCSV(csv);
        parsed.formato_sorgente = 'excel';
        setResult(parsed);
      } else {
        const text = await file.text();
        const parsed = parseFile(file.name, text);
        setResult(parsed);
      }
    } catch (err) {
      setResult({ cliente: '', indirizzo: '', telefono: '', email: '', note: '', vani: [], formato_sorgente: 'errore', errori: [`Errore lettura file: ${err}`] });
    }
    setParsing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const FORMATI_INFO = [
    { nome: 'Opera / Emmegisoft', ext: '.ope, .xml', color: '#3B7FE0' },
    { nome: 'FpPro', ext: '.fpp, .xml', color: '#7C3AED' },
    { nome: 'Finestra 3000', ext: '.xml', color: '#059669' },
    { nome: 'Gesty', ext: '.csv, .xlsx', color: '#D97706' },
    { nome: 'PlanCAD', ext: '.xml, .csv', color: '#DC2626' },
    { nome: 'Excel generico', ext: '.xlsx, .xls', color: '#059669' },
    { nome: 'CSV generico', ext: '.csv', color: '#6B7280' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(13,31,31,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: DS.card, borderRadius: 20, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: DS.text }}>Importa commessa</div>
            <div style={{ fontSize: 12, color: DS.textMid, marginTop: 4 }}>Da qualsiasi software serramenti</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.textMid} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Formati supportati */}
          {!result && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: DS.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Software supportati</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {FORMATI_INFO.map(f => (
                  <span key={f.nome} style={{ fontSize: 10, fontWeight: 600, color: f.color, background: f.color + '15', border: `1px solid ${f.color}33`, borderRadius: 6, padding: '3px 8px' }}>
                    {f.nome} ({f.ext})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone */}
          {!result && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `3px dashed ${dragOver ? DS.teal : DS.border}`,
                borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? '#EEF8F8' : 'transparent', transition: '.2s',
              }}>
              <input ref={fileRef} type="file" accept=".xml,.ope,.fpp,.csv,.xlsx,.xls,.tsv" style={{ display: 'none' }} onChange={handleFileInput} />
              {parsing ? (
                <div>
                  <div style={{ width: 32, height: 32, border: `3px solid ${DS.border}`, borderTop: `3px solid ${DS.teal}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <div style={{ color: DS.textMid, fontSize: 14 }}>Analisi di {fileName}...</div>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div style={{ fontWeight: 700, fontSize: 15, color: DS.text, marginBottom: 4 }}>Trascina il file qui</div>
                  <div style={{ fontSize: 13, color: DS.textMid }}>oppure clicca per sfogliare</div>
                  <div style={{ fontSize: 11, color: DS.textLight, marginTop: 8 }}>XML, CSV, Excel — Opera, FpPro, Finestra 3000, Gesty</div>
                </>
              )}
            </div>
          )}

          {/* Risultato */}
          {result && (
            <div>
              {/* Errori */}
              {result.errori.length > 0 && (
                <div style={{ background: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  {result.errori.map((e, i) => (
                    <div key={i} style={{ fontSize: 12, color: DS.red, marginBottom: i < result.errori.length - 1 ? 4 : 0 }}>
                      {e}
                    </div>
                  ))}
                </div>
              )}

              {/* Riepilogo */}
              <div style={{ background: '#D1FAE5', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#065F46' }}>File analizzato: {fileName}</span>
                </div>
                <div style={{ fontSize: 12, color: '#065F46' }}>
                  Formato: <strong>{result.formato_sorgente}</strong> — {result.vani.length} vani trovati
                </div>
                {result.cliente && <div style={{ fontSize: 12, color: '#065F46', marginTop: 2 }}>Cliente: <strong>{result.cliente}</strong></div>}
                {result.indirizzo && <div style={{ fontSize: 12, color: '#065F46' }}>Indirizzo: {result.indirizzo}</div>}
              </div>

              {/* Preview vani */}
              {result.vani.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Vani importati ({result.vani.length})</div>
                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                    {result.vani.map((v, i) => (
                      <div key={i} style={{ background: '#F4FAFA', borderRadius: 8, padding: '8px 12px', marginBottom: 6, border: `1px solid ${DS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: DS.text }}>{v.nome}</span>
                          <span style={{ fontSize: 11, color: DS.textMid, marginLeft: 8 }}>{v.tipo} · {v.materiale}</span>
                        </div>
                        <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: DS.teal }}>
                          {v.larghezza && v.altezza ? `${v.larghezza}×${v.altezza}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Azioni */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onImport(result)}
                  disabled={result.vani.length === 0}
                  style={{ flex: 1, background: result.vani.length === 0 ? '#9CA3AF' : DS.teal, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Usa questi dati
                </button>
                <button onClick={() => { setResult(null); setFileName(''); }}
                  style={{ background: '#F3F4F6', color: DS.textMid, border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 14, cursor: 'pointer' }}>
                  Altro file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export parse function for use in other components
export { parseFile, detectFormato };
export type { CommessaImportata, VanoImportato };
