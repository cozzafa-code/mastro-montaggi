// ts-20260408realdata
// ts-20260405d
'use client';
import React, { useState, useEffect } from 'react';
import {
  Cloud, Sun, CloudRain, Wind, MapPin, Clock, Wrench, Package, Sparkles,
  MessageSquare, AlertCircle, CheckCircle, ChevronRight,
  Zap, Bell, Navigation, Phone, ClipboardList, ArrowRight,
  Play, Pause, Check, Calendar, TriangleAlert, Hammer, User, Camera, X
} from 'lucide-react';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  blue:'#3B7FE0', blueDark:'#2563EB',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background:'linear-gradient(145deg,#fff,#f4fcfc)',
  borderRadius:14, border:`1.5px solid ${DS.border}`,
  boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:14,
  ...extra,
});

// â”€â”€â”€ METEO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MeteoWidget({ citta }: { citta: string }) {
  const [temp, setTemp] = useState<number|null>(null);
  const [desc, setDesc] = useState('');
  const [vento, setVento] = useState(0);
  const [icona, setIcona] = useState<'sole'|'nuvole'|'pioggia'>('sole');

  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${citta},IT&units=metric&lang=it&appid=4d8fb5b93d4af21d66a2948a49b7a7e7`)
      .then(r => r.json())
      .then(d => {
        if (d.cod === 200) {
          setTemp(Math.round(d.main.temp));
          setDesc(d.weather[0].description);
          setVento(Math.round(d.wind.speed * 3.6));
          const id = d.weather[0].id;
          setIcona(id >= 500 ? 'pioggia' : id >= 801 ? 'nuvole' : 'sole');
        } else { setTemp(18); setDesc('Soleggiato'); setVento(12); }
      })
      .catch(() => { setTemp(18); setDesc('Soleggiato'); setVento(12); });
  }, [citta]);

  const IconaEl = icona === 'pioggia' ? CloudRain : icona === 'nuvole' ? Cloud : Sun;
  const colMeteo = icona === 'pioggia' ? DS.blue : icona === 'nuvole' ? DS.textLight : '#F59E0B';
  const avviso = icona === 'pioggia' ? 'Pioggia "” attenzione ai lavori esterni' : vento > 30 ? 'Vento forte' : null;

  return (
    <div style={{...card(), background:DS.topbar, padding:'12px 14px'}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <IconaEl size={28} color={colMeteo}/>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'baseline', gap:8}}>
            <span style={{fontFamily:DS.mono, fontSize:28, fontWeight:700, color:'#fff'}}>{temp ?? '..'}°</span>
            <span style={{color:DS.textLight, fontSize:13, textTransform:'capitalize'}}>{desc}</span>
          </div>
          <div style={{display:'flex', gap:12, marginTop:2, fontSize:12, color:DS.textLight}}>
            <span style={{display:'flex', gap:4, alignItems:'center'}}><Wind size={11}/>{vento} km/h</span>
            <span style={{display:'flex', gap:4, alignItems:'center'}}><MapPin size={11}/>{citta}</span>
          </div>
        </div>
        {avviso && (
          <div style={{background:'rgba(220,68,68,0.2)', borderRadius:8, padding:'5px 9px', fontSize:11, color:'#FCA5A5', maxWidth:110, lineHeight:1.3}}>
            ⚠ {avviso}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ CARD LAVORO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Lavoro {
  id: string; cliente: string; indirizzo: string; telefono: string;
  oraInizio: string; oraFine: string; km: number; vani: number; pct: number;
  materiali?: {desc:string;qty:number}[];
}

function CardLavoro({ lav, isOggi, onOpen, onNaviga }: { lav:Lavoro; isOggi:boolean; onOpen:()=>void; onNaviga:()=>void }) {
  const col = lav.pct === 100 ? DS.green : lav.pct > 50 ? DS.teal : DS.amber;
  return (
    <div style={{...card(), border:`2px solid ${isOggi ? DS.teal : DS.border}`}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
        <div>
          <div style={{display:'flex', gap:6, marginBottom:3}}>
            <span style={{background:isOggi?DS.tealLight:'#FEF3C7', color:isOggi?DS.teal:DS.amber, borderRadius:20, padding:'1px 8px', fontSize:10, fontWeight:700}}>
              {isOggi ? 'OGGI' : 'DOMANI'}
            </span>
          </div>
          <div style={{fontWeight:700, color:DS.text, fontSize:16}}>{lav.cliente}</div>
          <div style={{fontSize:11, color:DS.textMid, marginTop:2, display:'flex', gap:8}}>
            <span style={{display:'flex', gap:3, alignItems:'center'}}><Clock size={10}/>{lav.oraInizio}–{lav.oraFine}</span>
            <span style={{display:'flex', gap:3, alignItems:'center'}}><MapPin size={10}/>{lav.km} km</span>
            <span style={{display:'flex', gap:3, alignItems:'center'}}><Wrench size={10}/>{lav.vani} vani</span>
          </div>
        </div>
        <span style={{fontFamily:DS.mono, fontWeight:700, fontSize:18, color:col}}>{lav.pct}%</span>
      </div>
      <div style={{height:6, borderRadius:999, background:DS.tealLight, overflow:'hidden', marginBottom:10}}>
        <div style={{height:6, background:col, width:`${lav.pct}%`, borderRadius:999, transition:'width 400ms'}}/>
      </div>
      {!isOggi && lav.materiali && lav.materiali.length > 0 && (
        <div style={{background:'#FEF3C7', borderRadius:8, padding:'8px 10px', marginBottom:10, border:`1px solid #F0D040`}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5}}>
            <div style={{fontSize:11, fontWeight:700, color:DS.amber, display:'flex', gap:5, alignItems:'center'}}>
              <Package size={11}/> Carica domani mattina:
            </div>
            <a href="tel:+39340555666" style={{fontSize:10, fontWeight:700, color:DS.amber, textDecoration:'none', display:'flex', alignItems:'center', gap:3, background:'rgba(208,128,8,0.12)', border:'1px solid rgba(208,128,8,0.3)', borderRadius:6, padding:'3px 7px'}}>
              <Phone size={9}/> Magazzino
            </a>
          </div>
          {lav.materiali.map((m,i) => (
            <div key={i} style={{fontSize:12, color:DS.text, display:'flex', justifyContent:'space-between'}}>
              <span>{m.desc}</span><span style={{fontFamily:DS.mono, fontWeight:700}}>×{m.qty}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:'flex', gap:8}}>
        <button onClick={onOpen}
          style={{flex:2, background:DS.teal, color:'#fff', border:'none', borderRadius:10, padding:'9px 12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:DS.ui, fontWeight:700, fontSize:13, boxShadow:`0 4px 0 0 ${DS.tealDark}`}}>
          <ClipboardList size={13}/> {isOggi ? 'Apri lavoro' : 'Vedi dettagli'}
        </button>
        <button onClick={onNaviga}
          style={{flex:1, background:DS.tealLight, color:DS.teal, border:`1px solid ${DS.border}`, borderRadius:10, padding:'9px 12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontFamily:DS.ui, fontWeight:700, fontSize:12, boxShadow:`0 3px 0 0 ${DS.border}`}}>
          <Navigation size={13}/> {lav.km}km
        </button>
        <a href={`tel:${lav.telefono}`}
          style={{background:DS.tealLight, color:DS.teal, border:`1px solid ${DS.border}`, borderRadius:10, padding:'9px 12px', cursor:'pointer', display:'flex', alignItems:'center', textDecoration:'none', boxShadow:`0 3px 0 0 ${DS.border}`}}>
          <Phone size={14}/>
        </a>
      </div>
    </div>
  );
}

// â”€â”€â”€ STATO COMMESSE "” solo lettura per il montatore â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatoCommesse({ onOpenCommessa }: { onOpenCommessa: ()=>void }) {
  const commesse = [
    {id:LAV_OGGI.id, cliente:LAV_OGGI.cliente, fase:'Montaggio', giorni:'Oggi', color:DS.teal, pct:LAV_OGGI.pct, nota:LAV_OGGI.vani+' vani in lavorazione'},
    {id:LAV_DOMANI.id, cliente:LAV_DOMANI.cliente, fase:'Programmato', giorni:'Domani', color:DS.amber, pct:LAV_DOMANI.pct, nota:''},
  ];
  return (
    <div style={card()}>
      <div style={{fontWeight:700, color:DS.text, fontSize:13, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span>Le mie commesse</span>
        <span style={{fontSize:11, color:DS.textMid}}>{commesse.length} attive</span>
      </div>
      {commesse.map((c,i) => (
        <button key={c.id} onClick={onOpenCommessa}
          style={{display:'flex', gap:10, alignItems:'center', padding:'9px 0', borderBottom:i<commesse.length-1?`1px solid ${DS.border}`:'none', background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer', borderRadius:8, transition:'background 120ms'}}
          onPointerEnter={e=>(e.currentTarget.style.background='rgba(40,160,160,0.05)')}
          onPointerLeave={e=>(e.currentTarget.style.background='none')}>
          <div style={{width:5, height:40, borderRadius:3, background:c.color, flexShrink:0}}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <span style={{fontWeight:700, color:DS.text, fontSize:13}}>{c.cliente}</span>
              <span style={{fontSize:11, color:DS.textMid, whiteSpace:'nowrap', marginLeft:8}}>{c.giorni}</span>
            </div>
            <div style={{fontSize:11, color:c.color, fontWeight:600, marginTop:1}}>{c.fase}</div>
            <div style={{fontSize:10, color:DS.textMid, marginTop:1}}>{c.nota}</div>
          </div>
          <ChevronRight size={14} color={DS.textLight} style={{flexShrink:0}}/>
        </button>
      ))}
    </div>
  );
}

// â”€â”€â”€ DATI MOCK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LAV_OGGI: Lavoro = {
  id:'com-047', cliente:'Fam. Rossi', indirizzo:'Via Roma 12, Brindisi',
  telefono:'+39 331 456 7890', oraInizio:'08:30', oraFine:'17:00',
  km:4.2, vani:3, pct:60,
};
const LAV_DOMANI: Lavoro = {
  id:'com-048', cliente:'Condominio Verdi', indirizzo:'Via Verdi 22, Brindisi',
  telefono:'+39 340 999 0001', oraInizio:'08:00', oraFine:'17:00',
  km:6.8, vani:6, pct:0,
  materiali:[
    {desc:'Coprifili alluminio 40mm', qty:6},
    {desc:'Guarnizioni EPDM 8mm',    qty:10},
    {desc:'Silicone neutro bianco',  qty:2},
  ],
};
const SOSPESI = [
  {id:1, testo:'Preventivo Studio Greco', urgente:true},
  {id:2, testo:'Ordine materiali non confermato', urgente:false},
  {id:3, testo:'Foto fine lavoro COM-047', urgente:false},
];

// â”€â”€â”€ PROPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Props {
  timer: {running:boolean;elapsed:number;start:()=>void;pause:()=>void;stop:()=>void;fmt:(s:number)=>string};
  completate: number; totaleCheck: number; pendenti: number; msgNonLetti: number;
  onOpenCommessa: ()=>void; onOpenChat: ()=>void;
  onOpenInterventi: ()=>void; onOpenAgenda: ()=>void;
  bpId: string; setBpId:(s:string)=>void; press:(id:string,fn?:()=>void)=>void;
  onLogout?: ()=>void;
  lavOggi?: Lavoro;
  lavDomani?: Lavoro;
  operatoreNome?: string;
}

// â”€â”€â”€ SEGNALA BLOCCO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TIPI_BLOCCO = [
  { id:'struttura',  label:'Problema strutturale', icon:'' },
  { id:'materiale',  label:'Materiale mancante',   icon:'' },
  { id:'cliente',    label:'Cliente assente',       icon:'' },
  { id:'misure',     label:'Misure errate',         icon:'' },
  { id:'altro',      label:'Altro problema',        icon:'⚠' },
];

function BloccoModal({ commessaId, onClose, onSegnala }: { commessaId:string; onClose:()=>void; onSegnala:(tipo:string,nota:string)=>void }) {
  const [tipo, setTipo]     = useState('');
  const [nota, setNota]     = useState('');
  const [sent, setSent]     = useState(false);
  const fotoRef             = React.useRef<HTMLInputElement>(null);
  const [nFoto, setNFoto]   = useState(0);

  const handleSend = () => {
    if (!tipo) return;
    onSegnala(tipo, nota);
    setSent(true);
  };

  if (sent) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:18,padding:24,width:'100%',maxWidth:380,textAlign:'center'}}>
        <div style={{width:56,height:56,borderRadius:'50%',background:'#FEE2E2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
          <Zap size={26} color={DS.red}/>
        </div>
        <div style={{fontWeight:700,color:DS.text,fontSize:17,marginBottom:6}}>Blocco segnalato</div>
        <div style={{color:DS.textMid,fontSize:14,marginBottom:20,lineHeight:1.5}}>
          L&apos;ufficio è stato notificato. La commessa {commessaId} è marcata come bloccata.
        </div>
        <button onClick={onClose}
          style={{background:DS.teal,color:'#fff',border:'none',borderRadius:10,padding:'12px',width:'100%',cursor:'pointer',fontFamily:DS.ui,fontWeight:700,fontSize:14,boxShadow:`0 4px 0 0 ${DS.tealDark}`}}>
          Chiudi
        </button>
      </div>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'flex-end'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:420,margin:'0 auto',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <div style={{fontWeight:700,color:DS.text,fontSize:17}}>Segnala blocco</div>
            <div style={{fontSize:12,color:DS.textMid,marginTop:2}}>{commessaId} "” notifica immediata all&apos;ufficio</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><X size={20} color={DS.textMid}/></button>
        </div>

        {/* Tipo blocco */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:DS.textMid,fontWeight:600,marginBottom:8}}>Tipo di problema</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {TIPI_BLOCCO.map(t=>(
              <button key={t.id} onClick={()=>setTipo(t.id)}
                style={{display:'flex',gap:12,alignItems:'center',padding:'11px 14px',borderRadius:10,border:`2px solid ${tipo===t.id?DS.red:DS.border}`,background:tipo===t.id?'#FEE2E2':'#fff',cursor:'pointer',textAlign:'left' as const}}>
                <span style={{fontSize:20}}>{t.icon}</span>
                <span style={{fontWeight:tipo===t.id?700:400,color:tipo===t.id?DS.red:DS.text,fontSize:14}}>{t.label}</span>
                {tipo===t.id&&<Check size={16} color={DS.red} style={{marginLeft:'auto'}}/>}
              </button>
            ))}
          </div>
        </div>

        {/* Nota */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:DS.textMid,fontWeight:600,marginBottom:6}}>Descrizione (opzionale)</div>
          <textarea value={nota} onChange={e=>setNota(e.target.value)} rows={3}
            placeholder="Es. La parete est è inclinata di 3cm, impossibile installare..."
            style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',resize:'none',boxSizing:'border-box' as const}}/>
        </div>

        {/* Foto */}
        <input ref={fotoRef} type="file" accept="image/*" capture="environment" multiple style={{display:'none'}}
          onChange={e=>setNFoto(f=>f+(e.target.files?.length||0))}/>
        <button onClick={()=>fotoRef.current?.click()}
          style={{width:'100%',background:DS.tealLight,border:`1.5px solid ${DS.border}`,borderRadius:10,padding:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,color:DS.teal,fontWeight:600,fontSize:13,fontFamily:DS.ui,marginBottom:14}}>
          <Camera size={15}/> {nFoto>0?`${nFoto} foto allegate`:'Allega foto dal cantiere'}
        </button>

        {/* Invia */}
        <button onClick={handleSend} disabled={!tipo}
          style={{width:'100%',background:tipo?DS.red:'#e5e7eb',border:'none',borderRadius:12,padding:'14px',cursor:tipo?'pointer':'default',color:tipo?'#fff':DS.textLight,fontWeight:700,fontSize:15,fontFamily:DS.ui,boxShadow:tipo?`0 5px 0 0 ${DS.redDark}`:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <Zap size={18}/> Segnala blocco all&apos;ufficio
        </button>
      </div>
    </div>
  );
}


// â”€â”€â”€ AI SUGGERIMENTI ATTIVI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AISuggerimenti({ onOpenCommessa, onOpenChat, onOpenAgenda }: {
  onOpenCommessa:()=>void; onOpenChat:()=>void; onOpenAgenda:()=>void;
}) {
  const [loading, setLoading] = useState(true);
  const [suggerimenti, setSuggerimenti] = useState<{id:string;testo:string;azione:string;urgente:boolean;fn:()=>void}[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    // Genera suggerimenti contestuali via API
    const ctx = {
      ora: new Date().getHours(),
      commessa: { id:LAV_OGGI.id, cliente:LAV_OGGI.cliente, vani:LAV_OGGI.vani, checklist:0, totale:7 },
      messaggiNonLetti: 3,
      urgenti: ['Verifica misure Porta Balcone prima di montare'],
      materialiMancanti: ['Coprifili alluminio 40mm'],
    };
    fetch('/api/claude', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:400,
        system:'Sei MASTRO AI, assistente per installatori di serramenti italiani. Rispondi SOLO con JSON array. Ogni item: {id,testo,azione,urgente}. Max 3 suggerimenti. Testo max 60 caratteri. Azione max 20 caratteri. Parla in modo diretto, da collega.',
        messages:[{role:'user',content:`Contesto giornata operatore: ${JSON.stringify(ctx)}. Genera 3 suggerimenti prioritari per la giornata.`}]
      })
    })
    .then(r=>r.json())
    .then(d=>{
      const text = d?.content?.[0]?.text ?? '[]';
      const clean = text.replace(/```json|```/g,'').trim();
      const items = JSON.parse(clean);
      const fns = [onOpenCommessa, onOpenChat, onOpenAgenda];
      setSuggerimenti(items.map((x:any,i:number)=>({...x, fn:fns[i%3]})));
    })
    .catch(()=>{
      // Fallback suggerimenti statici se API non disponibile
      setSuggerimenti([
        {id:'s1',testo:'Urgente: verifica misure Porta Balcone',azione:'Apri commessa',urgente:true,fn:onOpenCommessa},
        {id:'s2',testo:'3 messaggi non letti dal team',azione:'Leggi ora',urgente:false,fn:onOpenChat},
        {id:'s3',testo:'Ordine guarnizioni da confermare',azione:'Vai ordini',urgente:false,fn:onOpenCommessa},
      ]);
    })
    .finally(()=>setLoading(false));
  }, []);

  const visibili = suggerimenti.filter(s=>!dismissed.includes(s.id));
  if(visibili.length===0&&!loading) return null;

  return(
    <div style={{borderRadius:14,overflow:'hidden',border:`1.5px solid rgba(40,160,160,0.3)`,boxShadow:'0 2px 12px rgba(40,160,160,0.12)'}}>
      {/* Header AI */}
      <button onClick={()=>setExpanded(e=>!e)}
        style={{width:'100%',background:'linear-gradient(135deg,#0D1F1F,#1a3535)',border:'none',padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
        <div style={{width:28,height:28,borderRadius:8,background:'rgba(40,160,160,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Sparkles size={14} color='#28A0A0'/>
        </div>
        <div style={{flex:1,textAlign:'left'}}>
          <div style={{color:'#fff',fontWeight:700,fontSize:13}}>MASTRO AI</div>
          <div style={{color:'rgba(139,188,188,0.7)',fontSize:11,marginTop:1}}>
            {loading?'Analizzo la tua giornata...':visibili.some(s=>s.urgente)?'⚠ Attenzione richiesta':visibili.length+' suggerimenti attivi'}
          </div>
        </div>
        <div style={{color:'rgba(139,188,188,0.5)',fontSize:10}}>{expanded?'▲ Chiudi':'▼ Apri'}</div>
      </button>

      {/* Suggerimenti */}
      {expanded&&(
        <div style={{background:'#fff'}}>
          {loading?(
            <div style={{padding:'16px 14px',display:'flex',gap:10,alignItems:'center'}}>
              {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#28A0A0',opacity:0.4,animation:`aiPulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
              <span style={{fontSize:13,color:'#4A7070'}}>Elaboro contesto...</span>
            </div>
          ):visibili.map((s,i)=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderBottom:i<visibili.length-1?'1px solid #EEF8F8':'none'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:s.urgente?'#DC4444':'#28A0A0',flexShrink:0}}/>
              <span style={{flex:1,fontSize:13,color:'#0D1F1F',lineHeight:1.4}}>{s.testo}</span>
              <button onClick={s.fn}
                style={{background:s.urgente?'#DC4444':'#28A0A0',color:'#fff',border:'none',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'system-ui',whiteSpace:'nowrap',boxShadow:s.urgente?'0 3px 0 0 #A83030':'0 3px 0 0 #156060',flexShrink:0}}>
                {s.azione}
              </button>
              <button onClick={()=>setDismissed(d=>[...d,s.id])}
                style={{background:'none',border:'none',cursor:'pointer',padding:2,color:'#8BBCBC',fontSize:16,lineHeight:1,flexShrink:0}}>×</button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes aiPulse{0%,100%{transform:scale(.8);opacity:.4}50%{transform:scale(1.2);opacity:1}}`}</style>
    </div>
  );
}

// â”€â”€â”€ MAIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function HomeControlCenter({ timer,completate,totaleCheck,pendenti,msgNonLetti,onOpenCommessa,onOpenChat,onOpenInterventi,onOpenAgenda,bpId,setBpId,press,onLogout,lavOggi:lavOggiProp,lavDomani:lavDomaniProp,operatoreNome }:Props) {
  // Usa dati reali se passati, altrimenti mock
  const lavoro = lavOggiProp || LAV_OGGI;
  const lavoroDomani = lavDomaniProp || LAV_DOMANI;
  const nomeOp = operatoreNome || 'Marco Vito';

  const now = new Date();
  const ora = now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  const giorno = now.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
  const saluto = now.getHours()<12?'Buongiorno':now.getHours()<18?'Buon pomeriggio':'Buonasera';
  const [showBlocco, setShowBlocco] = useState(false);

  const btn3d = (color:string, shadow:string): React.CSSProperties => ({
    background:`linear-gradient(145deg,#fff,#f4fcfc)`,
    border:`1.5px solid ${color}33`,
    borderRadius:14, padding:'14px 12px', cursor:'pointer',
    display:'flex', flexDirection:'column', gap:8, alignItems:'flex-start',
    fontFamily:DS.ui, fontWeight:700, fontSize:13, color:DS.text,
    boxShadow:`0 4px 0 0 ${color}44, 0 6px 16px ${color}11, inset 0 1px 0 rgba(255,255,255,0.9)`,
    position:'relative', textAlign:'left' as const, transition:'transform 80ms, box-shadow 80ms',
  });

  const pressDown = (e:React.PointerEvent, color:string) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform='translateY(3px)';
    el.style.boxShadow=`0 1px 0 0 ${color}33`;
  };
  const pressUp = (e:React.PointerEvent, color:string, shadow:string) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform='';
    el.style.boxShadow=`0 4px 0 0 ${color}44, 0 6px 16px ${color}11, inset 0 1px 0 rgba(255,255,255,0.9)`;
  };

  // Dati meteo inline per il pannello vetro sabbiato
  const [meteoTemp, setMeteoTemp] = useState<number|null>(null);
  const [meteoDesc, setMeteoDesc] = useState('');
  const [meteoVento, setMeteoVento] = useState(0);
  const [meteoIcona, setMeteoIcona] = useState<'sole'|'nuvole'|'pioggia'>('sole');
  useEffect(()=>{
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Brindisi,IT&units=metric&lang=it&appid=4d8fb5b93d4af21d66a2948a49b7a7e7')
      .then(r=>r.json()).then(d=>{
        if(d.cod===200){
          setMeteoTemp(Math.round(d.main.temp));
          setMeteoDesc(d.weather[0].description);
          setMeteoVento(Math.round(d.wind.speed*3.6));
          const id=d.weather[0].id;
          setMeteoIcona(id>=500?'pioggia':id>=801?'nuvole':'sole');
        } else { setMeteoTemp(18); setMeteoDesc('Soleggiato'); setMeteoVento(12); }
      }).catch(()=>{ setMeteoTemp(18); setMeteoDesc('Soleggiato'); setMeteoVento(12); });
  },[]);
  const MeteoIcon = meteoIcona==='pioggia'?CloudRain:meteoIcona==='nuvole'?Cloud:Sun;
  const meteoCol = meteoIcona==='pioggia'?DS.blue:meteoIcona==='nuvole'?DS.textLight:'#F59E0B';

  return (
    <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, padding:'0 0 24px'}}>

      {/* â”€â”€ PANNELLO VETRO SABBIATO "” header + meteo integrati â”€â”€ */}
      <div style={{
        background:'linear-gradient(180deg, rgba(13,31,31,0.98) 0%, rgba(13,31,31,0.92) 100%)',
        backdropFilter:'blur(20px) saturate(180%)',
        WebkitBackdropFilter:'blur(20px) saturate(180%)',
        borderBottom:'1px solid rgba(40,160,160,0.15)',
        padding:'14px 16px 16px',
        display:'flex', flexDirection:'column', gap:12,
      }}>
        {/* Riga 1: saluto + badge */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:11, color:'rgba(139,188,188,0.6)', letterSpacing:0.3}}>{saluto} · {ora}</div>
            <div style={{fontWeight:800, color:'#F2F1EC', fontSize:20, marginTop:2, letterSpacing:-0.3}}>Marco Vito</div>
            <div style={{fontSize:11, color:'rgba(139,188,188,0.5)', marginTop:1}}>{giorno}</div>
          </div>
          <div style={{display:'flex', gap:8, marginTop:2}}>
            {msgNonLetti>0&&(
              <button onClick={onOpenChat} style={{background:'rgba(40,160,160,0.2)', border:'1px solid rgba(40,160,160,0.4)', borderRadius:20, padding:'5px 12px', cursor:'pointer', display:'flex', gap:5, alignItems:'center', color:DS.teal, fontSize:12, fontWeight:700}}>
                <MessageSquare size={13}/> {msgNonLetti}
              </button>
            )}
            {pendenti>0&&(
              <div style={{background:'rgba(208,128,8,0.2)', border:'1px solid rgba(208,128,8,0.4)', borderRadius:20, padding:'5px 12px', display:'flex', gap:5, alignItems:'center', fontSize:12, fontWeight:700, color:'#F5B942'}}>
                <Bell size={13}/> {pendenti}
              </div>
            )}
            {onLogout&&(
              <button onClick={onLogout} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(139,188,188,0.2)',borderRadius:20,padding:'5px 10px',cursor:'pointer',display:'flex',gap:4,alignItems:'center',color:'rgba(139,188,188,0.7)',fontSize:11,fontWeight:600}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Esci
              </button>
            )}
          </div>
        </div>

        {/* Riga 2: meteo + commessa attiva */}
        <div style={{display:'flex', gap:10, alignItems:'stretch'}}>
          {/* Meteo */}
          <div style={{flex:1, background:'rgba(255,255,255,0.05)', borderRadius:12, border:'1px solid rgba(40,160,160,0.15)', padding:'10px 12px', display:'flex', alignItems:'center', gap:10}}>
            <MeteoIcon size={24} color={meteoCol}/>
            <div>
              <div style={{display:'flex', alignItems:'baseline', gap:6}}>
                <span style={{fontFamily:DS.mono, fontSize:22, fontWeight:700, color:'#F2F1EC'}}>{meteoTemp??'..'}°</span>
                <span style={{color:'rgba(139,188,188,0.7)', fontSize:11, textTransform:'capitalize'}}>{meteoDesc}</span>
              </div>
              <div style={{fontSize:10, color:'rgba(139,188,188,0.5)', marginTop:1, display:'flex', gap:8}}>
                <span>{meteoVento} km/h</span>
                <span>Brindisi</span>
              </div>
            </div>
          </div>
          {/* Commessa attiva */}
          <button onClick={onOpenCommessa} style={{flex:1, background:'rgba(40,160,160,0.15)', borderRadius:12, border:'1px solid rgba(40,160,160,0.3)', padding:'10px 12px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:4}}>
            <div style={{fontSize:10, color:DS.teal, fontWeight:700, letterSpacing:0.5}}>IN CORSO</div>
            <div style={{fontWeight:700, color:'#F2F1EC', fontSize:13}}>{lavoro.cliente}</div>
            <div style={{fontSize:11, color:'rgba(139,188,188,0.6)', display:'flex', gap:6}}>
              <span>{lavoro.oraInizio}</span>
              <span>·</span>
              <span>{lavoro.vani} vani</span>
              <span>·</span>
              <span>{lavoro.km}km</span>
            </div>
          </button>
        </div>
      </div>

      {/* â”€â”€ CONTENUTO SCROLLABILE â”€â”€ */}
      <div style={{display:'flex', flexDirection:'column', gap:12, padding:'0 14px'}}>

        {/* MASTRO AI */}
        <AISuggerimenti onOpenCommessa={onOpenCommessa} onOpenChat={onOpenChat} onOpenAgenda={onOpenAgenda}/>

        {/* LAVORO DI OGGI */}
        <div style={{fontSize:11, color:DS.textMid, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:5}}>
          <Calendar size={11} color={DS.teal}/> Lavoro di oggi
        </div>
        <CardLavoro lav={lavoro} isOggi onOpen={onOpenCommessa} onNaviga={()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lavoro.indirizzo)}`,'_blank')}/>

        {/* MATERIALI IN ARRIVO */}
        <div style={{fontSize:11, color:DS.textMid, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:5}}>
          <Package size={11} color={DS.amber}/> Materiali cantiere
        </div>
        <div style={card()}>
          {/* Intestazione commessa */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${DS.border}`}}>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:DS.text}}>{lavoro.cliente}</div>
              <div style={{fontSize:11, color:DS.textMid, fontFamily:DS.mono}}>{lavoro.id} · {lavoro.oraInizio} oggi</div>
            </div>
            <a href="tel:+39340555666" style={{background:DS.tealLight, border:`1px solid ${DS.border}`, borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', gap:5, textDecoration:'none', color:DS.teal, fontSize:11, fontWeight:700}}>
              <Phone size={11}/> Magazzino
            </a>
          </div>
          {[
            {desc:'Coprifili alluminio 40mm', qty:6, stato:'confermato', data:'oggi'},
            {desc:'Guarnizioni EPDM 8mm', qty:10, stato:'in arrivo', data:'domani 08:00'},
          ].map((m,i,arr)=>(
            <div key={i} style={{display:'flex', gap:10, alignItems:'center', padding:'9px 0', borderBottom:i<arr.length-1?`1px solid ${DS.border}`:'none'}}>
              <div style={{width:8, height:8, borderRadius:'50%', background:m.stato==='confermato'?DS.green:DS.amber, flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13, color:DS.text, fontWeight:600}}>{m.desc}</div>
                <div style={{fontSize:11, color:DS.textMid}}>qty {m.qty} · {m.data}</div>
              </div>
              <span style={{fontSize:10, fontWeight:700, color:m.stato==='confermato'?DS.green:DS.amber, background:m.stato==='confermato'?'#D1FAE5':'#FEF3C7', borderRadius:20, padding:'2px 8px'}}>{m.stato}</span>
            </div>
          ))}
        </div>

        {/* INTERVENTO URGENTE */}
        <div style={{...card(), border:`2px solid ${DS.red}`, padding:0, overflow:'hidden'}}>
          {/* Header urgente */}
          <div style={{background:'#FEE2E2', padding:'8px 12px', display:'flex', alignItems:'center', gap:8, borderBottom:`1px solid ${DS.red}22`}}>
            <Zap size={14} color={DS.red}/>
            <span style={{fontWeight:800, color:DS.red, fontSize:12, letterSpacing:0.5}}>INTERVENTO URGENTE</span>
            <span style={{marginLeft:'auto', fontSize:10, color:DS.red, background:'rgba(220,68,68,0.1)', border:`1px solid ${DS.red}33`, borderRadius:20, padding:'2px 8px', fontWeight:700}}>Ricevuto oggi 11:42</span>
          </div>
          {/* Corpo */}
          <div style={{padding:'10px 12px', display:'flex', flexDirection:'column', gap:6}}>
            <div style={{fontWeight:700, color:DS.text, fontSize:15}}>Sig. Bruno — Riparazione porta balcone</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:10, fontSize:12, color:DS.textMid}}>
              <span style={{display:'flex', gap:4, alignItems:'center'}}><Clock size={11} color={DS.red}/> Da fare entro oggi 17:00</span>
              <span style={{display:'flex', gap:4, alignItems:'center'}}><MapPin size={11} color={DS.teal}/> Via Mazzini 5, Lecce · 8.1 km</span>
            </div>
            <div style={{fontSize:12, color:DS.textMid, background:'#FEF3C7', borderRadius:6, padding:'5px 8px', border:`1px solid #F0D040`}}>
              Porta balcone non si chiude dopo tempesta. Cliente al lavoro fino alle 16:00.
            </div>
            {/* Azioni */}
            <div style={{display:'flex', gap:8, marginTop:4}}>
              <a href="tel:+39333112334" style={{flex:1, background:DS.tealLight, border:`1px solid ${DS.border}`, borderRadius:8, padding:'8px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:5, textDecoration:'none', color:DS.teal, fontSize:12, fontWeight:700, boxShadow:`0 3px 0 0 ${DS.border}`}}>
                <Phone size={12}/> Chiama
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=Via+Mazzini+5+Lecce" target="_blank" rel="noreferrer"
                style={{flex:1, background:DS.tealLight, border:`1px solid ${DS.border}`, borderRadius:8, padding:'8px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:5, textDecoration:'none', color:DS.teal, fontSize:12, fontWeight:700, boxShadow:`0 3px 0 0 ${DS.border}`}}>
                <Navigation size={12}/> Naviga
              </a>
              <button onClick={onOpenCommessa}
                style={{flex:2, background:DS.red, border:'none', borderRadius:8, padding:'8px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:5, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:`0 3px 0 0 ${DS.redDark}`, fontFamily:DS.ui}}>
                <ClipboardList size={12}/> Apri commessa
              </button>
            </div>
          </div>
        </div>

        {/* SEGNALA BLOCCO */}
        <button onClick={()=>setShowBlocco(true)}
          style={{background:'#fff', border:`2px solid ${DS.red}33`, borderRadius:12, padding:'10px 14px', cursor:'pointer', width:'100%', display:'flex', alignItems:'center', gap:10, fontFamily:DS.ui, boxShadow:`0 3px 0 0 ${DS.red}22`}}>
          <div style={{width:34, height:34, borderRadius:8, background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <Zap size={16} color={DS.red}/>
          </div>
          <div style={{textAlign:'left' as const}}>
            <div style={{fontWeight:700, color:DS.red, fontSize:13}}>Segnala blocco lavoro</div>
            <div style={{fontSize:11, color:DS.textMid, marginTop:1}}>Notifica immediata all&apos;ufficio</div>
          </div>
        </button>

        {/* DOMANI */}
        <div style={{fontSize:11, color:DS.textMid, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:5}}>
          <Calendar size={11} color={DS.amber}/> Domani
        </div>
        <CardLavoro lav={lavoroDomani} isOggi={false} onOpen={onOpenCommessa} onNaviga={()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lavoroDomani.indirizzo)}`,'_blank')}/>



      </div>
      {showBlocco&&<BloccoModal commessaId={lavoro.id} onClose={()=>setShowBlocco(false)} onSegnala={(t,n)=>{console.log('Blocco:',t,n);}}/>}
    </div>
  );
}
