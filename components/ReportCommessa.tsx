'use client';
import React, { useState } from 'react';
import {
  X, MapPin, Phone, Clock, Ruler, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Package, FileText, Camera,
  Wrench, User, Building2, AlertTriangle, ClipboardList,
  ArrowRight, Zap, Info
} from 'lucide-react';

const DS = {
  topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', amber:'#D08008',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

// ─── TIPI ─────────────────────────────────────────────────────────────────────
interface Misura {
  campo: string;
  valore: string;
  note?: string;
  rilevato_da: string;
  data: string;
}

interface VanoReport {
  id: number;
  nome: string;
  tipo: string;
  materiale: string;
  colore: string;
  spessore: string;
  stato: 'completato'|'in_corso'|'da_fare';
  misure: Misura[];
  note_misuratore: string;
  note_produzione: string;
  anomalie: string[];
  disegno_cad: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenCad?: (vanoId: number, vanoNome: string) => void;
}

// ─── DATI MOCK COMPLETI (verranno da Supabase) ────────────────────────────────
const REPORT = {
  commessa: {
    id: 'COM-2024-047',
    data_creazione: '15/03/2026',
    data_appuntamento: '04/04/2026',
    ora: '08:30',
    stato: 'montaggio' as const,
    tipo_lavoro: 'Sostituzione infissi residenziale',
    priorita: 'normale' as const,
    note_generali: 'Condominio anni \'80 — muri portanti 30cm. Citofono piano terra. Parcheggio sul retro accessibile con furgone.',
    richiesta_cliente: 'Finestre e porta balcone con maggiore isolamento termico. Cliente tiene molto alla pulizia del cantiere.',
    importo: '€ 4.850',
    acconto: '€ 1.500 (pagato 20/03)',
  },
  cliente: {
    nome: 'Famiglia Rossi',
    indirizzo: 'Via Roma 12, Int. 4 — Brindisi BR 72100',
    piano: '2° piano (senza ascensore)',
    telefono: '+39 331 456 7890',
    email: 'rossi@email.it',
    presente: true,
    cane: false,
    note_accesso: 'Campanello "Rossi" piano terra. Scale strette — max 2 persone con materiale.',
  },
  misuratore: {
    nome: 'Luigi Bianchi',
    data: '18/03/2026',
    note: 'Parete est con irregolarità +2cm compensata nel disegno. Muratura in buone condizioni. Nessun controtelaio da sostituire.',
  },
  storia: [
    { data:'15/03/2026', fase:'Sopralluogo', chi:'Lidia Cozza', note:'Cliente accettato preventivo. Richiesta termine entro aprile.' },
    { data:'18/03/2026', fase:'Misurazione', chi:'Luigi Bianchi', note:'Misure completate. Rilevata irregolarità parete est +2cm. Disegni CAD pronti.' },
    { data:'20/03/2026', fase:'Preventivo', chi:'Lidia Cozza', note:'Preventivo €4.850 approvato. Acconto €1.500 ricevuto.' },
    { data:'28/03/2026', fase:'Produzione', chi:'Officina Sud', note:'Tutti e 3 gli infissi prodotti. Controllo qualità OK. Consegnati in magazzino.' },
    { data:'04/04/2026', fase:'Montaggio', chi:'Marco Vito', note:'In corso oggi.' },
  ],
  vani: [
    {
      id: 1,
      nome: 'Finestra Camera da Letto',
      tipo: 'Finestra a 2 ante',
      materiale: 'PVC bianco',
      colore: 'Bianco RAL 9016',
      spessore: '70mm profilo',
      stato: 'completato' as const,
      disegno_cad: true,
      note_misuratore: 'Luce muraria regolare. Controtelaio esistente in buone condizioni, conservato.',
      note_produzione: 'Prodotto con doppio vetro 4-16-4 Ar basso emissivo. Uw 1.1 W/m²K.',
      anomalie: [],
      misure: [
        { campo:'Luce muraria larghezza', valore:'122 cm', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Luce muraria altezza',   valore:'142 cm', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Profondità spalla sx',   valore:'8 cm',   rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Profondità spalla dx',   valore:'8 cm',   rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Infisso da montare L',   valore:'120 cm', note:'–2cm quota montaggio', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Infisso da montare H',   valore:'140 cm', note:'–2cm quota montaggio', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Trasmittanza Uw',        valore:'1.1 W/m²K', rilevato_da:'Officina Sud', data:'28/03' },
      ],
    },
    {
      id: 2,
      nome: 'Porta Balcone Soggiorno',
      tipo: 'Portafinestra 2 ante',
      materiale: 'Alluminio taglio termico',
      colore: 'Grigio antracite esterno / Bianco interno',
      spessore: '60mm profilo TT',
      stato: 'in_corso' as const,
      disegno_cad: true,
      note_misuratore: 'ATTENZIONE: parete est con +2cm di irregolarità sul lato sinistro. Compensato nel disegno con spessore battuta asimmetrico. Verificare prima del montaggio.',
      note_produzione: 'Prodotto con triplo vetro 4-12-4-12-4. Uw 0.9 W/m²K. Maniglia con chiusura multipunto.',
      anomalie: ['Parete est +2cm irregolarità — vedi disegno CAD', 'Verificare piombatura prima di fissare'],
      misure: [
        { campo:'Luce muraria larghezza', valore:'92 cm',  rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Luce muraria altezza',   valore:'212 cm', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Irregolarità parete est',valore:'+2 cm',  note:'ANOMALIA — compensare con battuta sx', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Profondità spalla',      valore:'10 cm',  rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Infisso da montare L',   valore:'90 cm',  note:'–2cm quota montaggio', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Infisso da montare H',   valore:'210 cm', note:'–2cm quota montaggio', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Trasmittanza Uw',        valore:'0.9 W/m²K', rilevato_da:'Officina Sud', data:'28/03' },
      ],
    },
    {
      id: 3,
      nome: 'Finestra Bagno',
      tipo: 'Finestra vasistas + anta',
      materiale: 'PVC bianco',
      colore: 'Bianco RAL 9016',
      spessore: '70mm profilo',
      stato: 'da_fare' as const,
      disegno_cad: false,
      note_misuratore: 'Vano piccolo, accesso dal bagno. Vetro opaco satinato richiesto dal cliente.',
      note_produzione: 'Prodotto con vetro satinato + camera 4-12-4. Uw 1.3 W/m²K.',
      anomalie: [],
      misure: [
        { campo:'Luce muraria larghezza', valore:'62 cm', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Luce muraria altezza',   valore:'92 cm', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Profondità spalla',      valore:'7 cm',  rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Infisso da montare L',   valore:'60 cm', note:'–2cm quota montaggio', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Infisso da montare H',   valore:'90 cm', note:'–2cm quota montaggio', rilevato_da:'Luigi Bianchi', data:'18/03' },
        { campo:'Trasmittanza Uw',        valore:'1.3 W/m²K', rilevato_da:'Officina Sud', data:'28/03' },
      ],
    },
  ] as VanoReport[],
  materiali_necessari: [
    { nome:'Coprifili PVC 60mm', qty:'14 ml', stato:'in magazzino' },
    { nome:'Guarnizioni EPDM 8mm', qty:'10 pz', stato:'in arrivo dom.' },
    { nome:'Schiuma poliuretanica', qty:'2 bombolette', stato:'con te' },
    { nome:'Silicone neutro bianco', qty:'3 cartucce', stato:'con te' },
    { nome:'Viti inox 6x80mm', qty:'30 pz', stato:'in magazzino' },
    { nome:'Tappi PVC bianchi', qty:'30 pz', stato:'con te' },
  ],
};

// ─── STATO BADGE ─────────────────────────────────────────────────────────────
const StatoBadge = ({stato}:{stato:string}) => {
  const c = stato==='completato'?{bg:'#D1FAE5',col:DS.green,txt:'Completato'}:
            stato==='in_corso'  ?{bg:'#FEF3C7',col:DS.amber, txt:'In corso'} :
                                 {bg:'#F3F4F6',col:DS.textMid,txt:'Da fare'};
  return <span style={{background:c.bg,color:c.col,borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700,fontFamily:DS.ui}}>{c.txt}</span>;
};

// ─── SEZIONE COLLASSABILE ─────────────────────────────────────────────────────
const Sezione = ({titolo,icona,badge,colore,children,defaultAperta=false}:{titolo:string;icona:React.ReactNode;badge?:string;colore?:string;children:React.ReactNode;defaultAperta?:boolean}) => {
  const [aperta,setAperta] = useState(defaultAperta);
  return (
    <div style={{borderRadius:12,border:`1.5px solid ${DS.border}`,overflow:'hidden',marginBottom:10}}>
      <button onClick={()=>setAperta(a=>!a)}
        style={{width:'100%',background:aperta?`linear-gradient(135deg,${colore||DS.teal}15,${colore||DS.teal}05)`:'#fff',border:'none',padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',textAlign:'left' as const}}>
        <span style={{color:colore||DS.teal}}>{icona}</span>
        <span style={{fontWeight:700,color:DS.text,fontSize:14,flex:1}}>{titolo}</span>
        {badge&&<span style={{background:`${colore||DS.teal}20`,color:colore||DS.teal,borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:700}}>{badge}</span>}
        {aperta?<ChevronUp size={16} color={DS.textLight}/>:<ChevronDown size={16} color={DS.textLight}/>}
      </button>
      {aperta&&<div style={{padding:'0 14px 14px',borderTop:`1px solid ${DS.border}`}}>{children}</div>}
    </div>
  );
};

// ─── RIGA MISURA ─────────────────────────────────────────────────────────────
const RigaMisura = ({m}:{m:Misura}) => (
  <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'8px 0',borderBottom:`1px solid ${DS.border}`}}>
    <div style={{flex:1}}>
      <div style={{fontSize:12,color:DS.textMid}}>{m.campo}</div>
      {m.note&&<div style={{fontSize:11,color:DS.amber,marginTop:1}}>⚠ {m.note}</div>}
    </div>
    <div style={{textAlign:'right' as const}}>
      <div style={{fontFamily:DS.mono,fontWeight:700,color:DS.text,fontSize:15}}>{m.valore}</div>
      <div style={{fontSize:10,color:DS.textLight}}>{m.rilevato_da} · {m.data}</div>
    </div>
  </div>
);

// ─── COMPONENT PRINCIPALE ────────────────────────────────────────────────────
export default function ReportCommessa({ open, onClose, onOpenCad }: Props) {
  const [vanoAperto, setVanoAperto] = useState<number|null>(null);

  if (!open) return null;

  const r = REPORT;
  const vaniCompletati = r.vani.filter(v=>v.stato==='completato').length;
  const vaniConAnomalie = r.vani.filter(v=>v.anomalie.length>0).length;

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300,backdropFilter:'blur(2px)'}}/>
      <div style={{position:'fixed',left:0,right:0,bottom:0,top:0,maxWidth:480,margin:'0 auto',background:'#f4fcfc',zIndex:301,display:'flex',flexDirection:'column',animation:'reportIn 280ms cubic-bezier(.32,.72,0,1)'}}>
        <style>{`@keyframes reportIn{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* ── TOPBAR ── */}
        <div style={{background:DS.topbar,padding:'14px 16px',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{color:'#fff',fontWeight:800,fontSize:16}}>Report Commessa</div>
              <div style={{color:DS.textLight,fontSize:11,marginTop:1}}>{r.commessa.id} · {r.cliente.nome}</div>
            </div>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:10,padding:'8px',cursor:'pointer'}}>
              <X size={18} color="#8BBCBC"/>
            </button>
          </div>

          {/* KPI veloci */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6}}>
            {[
              {val:`${vaniCompletati}/${r.vani.length}`, label:'Vani', col:DS.green},
              {val:r.commessa.importo, label:'Importo', col:DS.teal},
              {val:vaniConAnomalie>0?`${vaniConAnomalie} ⚠`:'OK', label:'Anomalie', col:vaniConAnomalie>0?DS.red:DS.green},
              {val:r.commessa.ora, label:'Orario', col:DS.amber},
            ].map(k=>(
              <div key={k.label} style={{background:'rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 6px',textAlign:'center' as const}}>
                <div style={{fontFamily:DS.mono,fontWeight:700,fontSize:14,color:k.col}}>{k.val}</div>
                <div style={{fontSize:10,color:DS.textLight,marginTop:1}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTENT SCROLLABILE ── */}
        <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>

          {/* ALERT ANOMALIE IN CIMA */}
          {r.vani.some(v=>v.anomalie.length>0) && (
            <div style={{background:'#FEF2F2',border:`2px solid ${DS.red}40`,borderRadius:12,padding:'12px 14px',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <AlertTriangle size={16} color={DS.red}/>
                <span style={{fontWeight:700,color:DS.red,fontSize:14}}>Anomalie da verificare</span>
              </div>
              {r.vani.filter(v=>v.anomalie.length>0).map(v=>
                v.anomalie.map((a,i)=>(
                  <div key={`${v.id}-${i}`} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:4}}>
                    <ArrowRight size={12} color={DS.red} style={{flexShrink:0,marginTop:2}}/>
                    <div style={{fontSize:13,color:DS.red}}><strong>{v.nome}:</strong> {a}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* CLIENTE + ACCESSO */}
          <Sezione titolo="Cliente & Accesso" icona={<User size={16}/>} defaultAperta={true} colore={DS.teal}>
            <div style={{paddingTop:12,display:'flex',flexDirection:'column',gap:8}}>
              {[
                {ic:<MapPin size={13}/>, val:r.cliente.indirizzo},
                {ic:<Building2 size={13}/>, val:r.cliente.piano},
                {ic:<Phone size={13}/>, val:r.cliente.telefono},
                {ic:<Clock size={13}/>, val:`Appuntamento ${r.commessa.data_appuntamento} ore ${r.commessa.ora}`},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                  <span style={{color:DS.teal,flexShrink:0,marginTop:1}}>{row.ic}</span>
                  <span style={{fontSize:13,color:DS.textMid,lineHeight:1.4}}>{row.val}</span>
                </div>
              ))}
              <div style={{background:'#FEF9EC',border:`1px solid ${DS.amber}30`,borderRadius:8,padding:'8px 10px',marginTop:4}}>
                <div style={{fontSize:12,color:DS.amber,fontWeight:700,marginBottom:3}}>Note accesso</div>
                <div style={{fontSize:13,color:DS.textMid,lineHeight:1.4}}>{r.cliente.note_accesso}</div>
              </div>
              <div style={{fontSize:13,color:DS.textMid,lineHeight:1.4}}>
                <strong style={{color:DS.text}}>Richiesta cliente:</strong> {r.commessa.richiesta_cliente}
              </div>
            </div>
          </Sezione>

          {/* VANI CON MISURE */}
          <Sezione titolo="Vani & Misure" icona={<Ruler size={16}/>} badge={`${r.vani.length} vani`} defaultAperta={true} colore={DS.teal}>
            <div style={{paddingTop:10,display:'flex',flexDirection:'column',gap:10}}>
              {r.vani.map(v=>(
                <div key={v.id} style={{border:`1.5px solid ${v.anomalie.length>0?DS.red+'50':v.stato==='completato'?DS.green+'50':DS.border}`,borderRadius:10,overflow:'hidden'}}>
                  {/* Header vano */}
                  <button onClick={()=>setVanoAperto(vanoAperto===v.id?null:v.id)}
                    style={{width:'100%',background:v.stato==='completato'?'#f0fdf4':v.anomalie.length>0?'#fef2f2':'#fff',border:'none',padding:'10px 12px',display:'flex',alignItems:'center',gap:8,cursor:'pointer',textAlign:'left' as const}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                        <span style={{fontWeight:700,color:DS.text,fontSize:14}}>{v.nome}</span>
                        <StatoBadge stato={v.stato}/>
                        {v.anomalie.length>0&&<AlertTriangle size={13} color={DS.red}/>}
                      </div>
                      <div style={{fontSize:12,color:DS.textMid}}>{v.tipo} · {v.materiale}</div>
                    </div>
                    {vanoAperto===v.id?<ChevronUp size={15} color={DS.textLight}/>:<ChevronDown size={15} color={DS.textLight}/>}
                  </button>

                  {/* Dettaglio vano espanso */}
                  {vanoAperto===v.id&&(
                    <div style={{padding:'10px 12px',borderTop:`1px solid ${DS.border}`,background:'#fafffe'}}>

                      {/* Info materiale */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
                        {[
                          {label:'Colore', val:v.colore},
                          {label:'Profilo', val:v.spessore},
                        ].map(c=>(
                          <div key={c.label} style={{background:'#fff',border:`1px solid ${DS.border}`,borderRadius:8,padding:'7px 10px'}}>
                            <div style={{fontSize:10,color:DS.textLight,marginBottom:2}}>{c.label}</div>
                            <div style={{fontSize:12,fontWeight:700,color:DS.text}}>{c.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Misure */}
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:11,color:DS.textMid,fontWeight:700,textTransform:'uppercase' as const,letterSpacing:0.3,marginBottom:6}}>Misure rilevate</div>
                        {v.misure.map((m,i)=><RigaMisura key={i} m={m}/>)}
                      </div>

                      {/* Note misuratore */}
                      <div style={{background:'#EEF8F8',border:`1px solid ${DS.border}`,borderRadius:8,padding:'8px 10px',marginBottom:8}}>
                        <div style={{fontSize:10,color:DS.teal,fontWeight:700,marginBottom:3}}>NOTE MISURATORE — {REPORT.misuratore.nome}</div>
                        <div style={{fontSize:12,color:DS.textMid,lineHeight:1.5}}>{v.note_misuratore}</div>
                      </div>

                      {/* Note produzione */}
                      <div style={{background:'#f0fdf4',border:`1px solid ${DS.green}30`,borderRadius:8,padding:'8px 10px',marginBottom:8}}>
                        <div style={{fontSize:10,color:DS.green,fontWeight:700,marginBottom:3}}>NOTE PRODUZIONE — Officina Sud</div>
                        <div style={{fontSize:12,color:DS.textMid,lineHeight:1.5}}>{v.note_produzione}</div>
                      </div>

                      {/* Anomalie */}
                      {v.anomalie.length>0&&(
                        <div style={{background:'#FEF2F2',border:`1px solid ${DS.red}30`,borderRadius:8,padding:'8px 10px'}}>
                          <div style={{fontSize:10,color:DS.red,fontWeight:700,marginBottom:4}}>⚠ ANOMALIE</div>
                          {v.anomalie.map((a,i)=><div key={i} style={{fontSize:12,color:DS.red,lineHeight:1.4,marginBottom:2}}>• {a}</div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Sezione>

          {/* MATERIALI */}
          <Sezione titolo="Materiali necessari" icona={<Package size={16}/>} badge={`${r.materiali_necessari.length} voci`} colore={DS.amber}>
            <div style={{paddingTop:10}}>
              {r.materiali_necessari.map((m,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:i<r.materiali_necessari.length-1?`1px solid ${DS.border}`:'none'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{m.nome}</div>
                    <div style={{fontSize:11,color:DS.textMid,fontFamily:DS.mono}}>qty: {m.qty}</div>
                  </div>
                  <div style={{background:m.stato==='con te'?'#D1FAE5':m.stato==='in magazzino'?DS.tealLight:'#FEF3C7',color:m.stato==='con te'?DS.green:m.stato==='in magazzino'?DS.teal:DS.amber,borderRadius:20,padding:'3px 9px',fontSize:11,fontWeight:700}}>
                    {m.stato}
                  </div>
                </div>
              ))}
            </div>
          </Sezione>

          {/* STORIA COMMESSA */}
          <Sezione titolo="Storia commessa" icona={<ClipboardList size={16}/>} colore={DS.textMid}>
            <div style={{paddingTop:10}}>
              {r.storia.map((s,i)=>(
                <div key={i} style={{display:'flex',gap:12,paddingBottom:i<r.storia.length-1?16:0,position:'relative'}}>
                  {i<r.storia.length-1&&<div style={{position:'absolute',left:11,top:24,bottom:0,width:2,background:i===r.storia.length-2?DS.teal:DS.border}}/>}
                  <div style={{width:22,height:22,borderRadius:'50%',background:i===r.storia.length-1?DS.teal:DS.green,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,zIndex:1}}>
                    <CheckCircle size={12} color="#fff"/>
                  </div>
                  <div>
                    <div style={{fontWeight:700,color:DS.text,fontSize:13}}>{s.fase}</div>
                    <div style={{fontSize:11,color:DS.textMid,marginTop:1}}>{s.data} · {s.chi}</div>
                    <div style={{fontSize:12,color:DS.textMid,marginTop:3,lineHeight:1.4}}>{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Sezione>

          {/* NOTE GENERALI */}
          <Sezione titolo="Note cantiere" icona={<Info size={16}/>} colore={DS.textMid}>
            <div style={{paddingTop:10,fontSize:13,color:DS.textMid,lineHeight:1.6}}>
              {r.commessa.note_generali}
            </div>
          </Sezione>

          <div style={{height:20}}/>
        </div>
      </div>
    </>
  );
}
