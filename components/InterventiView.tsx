'use client';
import React, { useState, useRef } from 'react';
import {
  Plus, X, Check, Clock, MapPin, Phone, Camera, Paperclip,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle,
  Wrench, Zap, Eye, Hammer, TriangleAlert, Play, Pause,
  Square, Send, RotateCcw, User, Building2, FileText,
  Package, Pen, Circle, ChevronDown, ChevronUp
} from 'lucide-react';

// ─── DS ──────────────────────────────────────────────────────────────────────
const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};
const card: React.CSSProperties = {
  background:'linear-gradient(145deg,#fff,#f4fcfc)',
  borderRadius:14, border:`1.5px solid ${DS.border}`,
  boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:14,
};
const bp=(p=false,bg=DS.teal,sh=DS.tealDark): React.CSSProperties=>({
  background:bg, color:'#fff', border:'none', borderRadius:10,
  padding:'10px 16px', fontFamily:DS.ui, fontWeight:700, fontSize:13,
  cursor:'pointer', display:'flex', alignItems:'center', gap:8,
  boxShadow:p?'none':`0 4px 0 0 ${sh}`,
  transform:p?'translateY(3px)':'translateY(0)',
  transition:'box-shadow 80ms, transform 80ms',
});
const bpG  = (p=false) => bp(p,DS.green,DS.greenDark);
const bpR  = (p=false) => bp(p,DS.red,DS.redDark);
const bpA  = (p=false) => bp(p,DS.amber,DS.amberDark);
const bpGh = (p=false): React.CSSProperties => ({...bp(p,DS.tealLight,DS.border),color:DS.teal,boxShadow:p?'none':`0 3px 0 0 ${DS.border}`});

// ─── TIPI ────────────────────────────────────────────────────────────────────
export type TipoIntervento = 'montaggio'|'sopralluogo'|'manutenzione'|'urgente'|'custom';
export type StatoIntervento = 'programmato'|'in_corso'|'completato'|'urgente';

export interface CheckItem { id:number; testo:string; fatto:boolean; }
export interface Materiale { id:number; desc:string; qty:number; unita:string; }
export interface Intervento {
  id: number;
  tipo: TipoIntervento;
  stato: StatoIntervento;
  titolo: string;
  descrizione: string;
  cliente: string;
  indirizzo: string;
  telefono: string;
  dataOra: string;
  commessaId?: string;
  creatoDa: 'ufficio'|'montatore';
  checklist: CheckItem[];
  materiali: Materiale[];
  foto: string[];
  orelavoro: number; // secondi
  note: string;
  firmaSalvata: boolean;
}

// ─── CHECKLIST TEMPLATE PER TIPO ─────────────────────────────────────────────
const CHECKLIST_TEMPLATE: Record<TipoIntervento, string[]> = {
  montaggio: [
    'Verifica misure sul posto',
    'Smontaggio vecchio infisso',
    'Preparazione vano e controtelaio',
    'Installazione nuovo infisso',
    'Sigillatura perimetrale',
    'Test funzionamento',
    'Pulizia cantiere',
    'Foto fine lavoro',
  ],
  sopralluogo: [
    'Rilievo misure',
    'Foto stato attuale',
    'Verifica accessibilità',
    'Note anomalie strutturali',
    'Conferma tipologia lavoro',
  ],
  manutenzione: [
    'Ispezione visiva generale',
    'Verifica guarnizioni',
    'Lubrificazione cerniere e cremonesi',
    'Regolazione ante',
    'Test tenuta aria/acqua',
    'Sostituzione parti usurate',
  ],
  urgente: [
    'Valutazione problema',
    'Intervento immediato',
    'Verifica sicurezza',
    'Documentazione danno (foto)',
  ],
  custom: [],
};

const TIPI_LABEL: Record<TipoIntervento,{label:string;color:string;bg:string;icon:React.ReactNode}> = {
  montaggio:    {label:'Montaggio',    color:DS.teal,   bg:DS.tealLight,  icon:<Hammer size={13}/>},
  sopralluogo:  {label:'Sopralluogo',  color:'#3B7FE0', bg:'#DBEAFE',     icon:<Eye size={13}/>},
  manutenzione: {label:'Manutenzione', color:DS.green,  bg:'#D1FAE5',     icon:<Wrench size={13}/>},
  urgente:      {label:'Urgente',      color:DS.red,    bg:'#FEE2E2',     icon:<Zap size={13}/>},
  custom:       {label:'Personalizzato',color:DS.amber, bg:'#FEF3C7',     icon:<FileText size={13}/>},
};

const STATI_LABEL: Record<StatoIntervento,{label:string;color:string;bg:string}> = {
  programmato:  {label:'Programmato',  color:'#3B7FE0', bg:'#DBEAFE'},
  in_corso:     {label:'In corso',     color:DS.amber,  bg:'#FEF3C7'},
  completato:   {label:'Completato',   color:DS.green,  bg:'#D1FAE5'},
  urgente:      {label:'Urgente',      color:DS.red,    bg:'#FEE2E2'},
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INTERVENTI_INIT: Intervento[] = [
  {
    id:1, tipo:'montaggio', stato:'in_corso',
    titolo:'Sostituzione finestre piano terra',
    descrizione:'3 finestre PVC bianco 70mm. Cliente vuole vetrocamera basso emissivo.',
    cliente:'Fam. Rossi', indirizzo:'Via Roma 12, Brindisi', telefono:'+39 331 456 7890',
    dataOra:'2026-04-03 08:30', commessaId:'COM-2024-047', creatoDa:'ufficio',
    checklist: CHECKLIST_TEMPLATE.montaggio.map((t,i)=>({id:i+1,testo:t,fatto:i<2})),
    materiali:[
      {id:1,desc:'Profilo PVC 70mm',qty:12,unita:'ml'},
      {id:2,desc:'Vetrocamera 4/16/4',qty:3,unita:'pz'},
    ],
    foto:[], orelavoro:3600, note:'Accesso da cortile retro.', firmaSalvata:false,
  },
  {
    id:2, tipo:'sopralluogo', stato:'programmato',
    titolo:'Sopralluogo preventivo Condominio Verdi',
    descrizione:'Misure per 6 appartamenti. Piano da concordare con amministratore.',
    cliente:'Cond. Verdi', indirizzo:'Via Verdi 22, Brindisi', telefono:'+39 340 999 0001',
    dataOra:'2026-04-04 08:00', commessaId:undefined, creatoDa:'ufficio',
    checklist: CHECKLIST_TEMPLATE.sopralluogo.map((t,i)=>({id:i+1,testo:t,fatto:false})),
    materiali:[], foto:[], orelavoro:0, note:'', firmaSalvata:false,
  },
  {
    id:3, tipo:'urgente', stato:'urgente',
    titolo:'Riparazione urgente porta finestra',
    descrizione:'Anta rotta, non si chiude. Cliente bloccato.',
    cliente:'Sig. Bruno', indirizzo:'Via Mazzini 5, Lecce', telefono:'+39 333 112 3344',
    dataOra:'2026-04-03 14:00', commessaId:undefined, creatoDa:'montatore',
    checklist: CHECKLIST_TEMPLATE.urgente.map((t,i)=>({id:i+1,testo:t,fatto:false})),
    materiali:[], foto:[], orelavoro:0, note:'Urgentissimo.', firmaSalvata:false,
  },
];

function fmtSec(s:number){return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function fmtOre(s:number){if(s===0)return '0 min';const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);return h>0?`${h}h ${m}m`:`${m} min`;}
function oraNow(){return new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});}

// ─── HOOK TIMER ───────────────────────────────────────────────────────────────
function useInterventoTimer(initSec:number) {
  const [elapsed,setElapsed]=useState(initSec);
  const [running,setRunning]=useState(false);
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const start=()=>{if(!running){setRunning(true);ref.current=setInterval(()=>setElapsed(e=>e+1),1000);}};
  const pause=()=>{if(ref.current)clearInterval(ref.current);setRunning(false);};
  const stop=()=>{pause();};
  return{elapsed,running,start,pause,stop};
}

// ─── HOOK FIRMA ───────────────────────────────────────────────────────────────
function useFirmaCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const drawing=useRef(false);
  const onStart=(e:React.PointerEvent)=>{drawing.current=true;const c=ref.current!,r=c.getBoundingClientRect(),ctx=c.getContext('2d')!;ctx.beginPath();ctx.moveTo(e.clientX-r.left,e.clientY-r.top);};
  const onMove=(e:React.PointerEvent)=>{if(!drawing.current)return;const c=ref.current!,r=c.getBoundingClientRect(),ctx=c.getContext('2d')!;ctx.strokeStyle=DS.teal;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();};
  const onEnd=()=>{drawing.current=false;};
  const clear=()=>{const c=ref.current;if(c)c.getContext('2d')!.clearRect(0,0,c.width,c.height);};
  return{ref,onStart,onMove,onEnd,clear};
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function InterventiView() {
  const [interventi,setInterventi] = useState(INTERVENTI_INIT);
  const [selected,setSelected]     = useState<number|null>(null);
  const [tab,setTab]               = useState<'oggi'|'futuri'|'completati'>('oggi');
  const [showNew,setShowNew]       = useState(false);
  const [bpId,setBpId]             = useState('');

  const press=(id:string,fn?:()=>void)=>{setBpId(id);setTimeout(()=>{setBpId('');fn?.();},150);};

  const oggi = new Date().toISOString().slice(0,10);
  const byTab = {
    oggi:       interventi.filter(i=>i.dataOra.startsWith(oggi)&&i.stato!=='completato'),
    futuri:     interventi.filter(i=>i.dataOra>oggi+'T'),
    completati: interventi.filter(i=>i.stato==='completato'),
  };

  if(selected!==null){
    const intv=interventi.find(i=>i.id===selected);
    if(!intv)return null;
    return(
      <InterventoDetail
        intervento={intv}
        onBack={()=>setSelected(null)}
        onUpdate={(updated)=>setInterventi(iv=>iv.map(i=>i.id===updated.id?updated:i))}
      />
    );
  }

  if(showNew){
    return(
      <NuovoIntervento
        onBack={()=>setShowNew(false)}
        onSave={(intv)=>{setInterventi(iv=>[...iv,intv]);setShowNew(false);setSelected(intv.id);}}
      />
    );
  }

  return(
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      {/* Sub-tabs */}
      <div style={{background:DS.topbar,display:'flex',padding:'0 8px',flexShrink:0}}>
        {(['oggi','futuri','completati'] as const).map(t=>{
          const count=byTab[t].length;
          return(
            <button key={t} onClick={()=>setTab(t)}
              style={{background:'none',border:'none',color:tab===t?DS.teal:'#8BBCBC',fontFamily:DS.ui,fontWeight:tab===t?700:400,fontSize:13,padding:'11px 14px',cursor:'pointer',borderBottom:tab===t?`2px solid ${DS.teal}`:'2px solid transparent',position:'relative',display:'flex',alignItems:'center',gap:6}}>
              {t==='oggi'?'OGGI':t==='futuri'?'FUTURI':'COMPLETATI'}
              {count>0&&<span style={{background:t==='oggi'?DS.teal:DS.textLight,color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:10}}>
        {/* Urgenti sempre in cima */}
        {tab==='oggi' && interventi.filter(i=>i.stato==='urgente').map(intv=>(
          <InterventoCard key={intv.id} intv={intv} onOpen={()=>setSelected(intv.id)}/>
        ))}

        {byTab[tab].filter(i=>i.stato!=='urgente').map(intv=>(
          <InterventoCard key={intv.id} intv={intv} onOpen={()=>setSelected(intv.id)}/>
        ))}

        {byTab[tab].length===0&&(
          <div style={{...card,textAlign:'center',padding:32,color:DS.textMid,fontSize:14}}>
            Nessun intervento
          </div>
        )}
      </div>

      {/* FAB nuovo intervento urgente */}
      <div style={{padding:'10px 14px',background:'#fff',borderTop:`1px solid ${DS.border}`,display:'flex',gap:10,flexShrink:0}}>
        <button style={{...bpGh(bpId==='new-prog'),flex:1,justifyContent:'center'}}
          onPointerDown={()=>setBpId('new-prog')} onPointerUp={()=>press('new-prog',()=>setShowNew(true))}>
          <Plus size={15}/> Nuovo intervento
        </button>
        <button style={{...bpR(bpId==='new-urg'),flex:1,justifyContent:'center'}}
          onPointerDown={()=>setBpId('new-urg')} onPointerUp={()=>press('new-urg',()=>{
            const id=Date.now();
            const intv:Intervento={
              id, tipo:'urgente', stato:'urgente',
              titolo:'Intervento urgente', descrizione:'',
              cliente:'', indirizzo:'', telefono:'',
              dataOra:new Date().toISOString().slice(0,16).replace('T',' '),
              creatoDa:'montatore',
              checklist:CHECKLIST_TEMPLATE.urgente.map((t,i)=>({id:i+1,testo:t,fatto:false})),
              materiali:[], foto:[], orelavoro:0, note:'', firmaSalvata:false,
            };
            setInterventi(iv=>[intv,...iv]);
            setSelected(id);
          })}>
          <Zap size={15}/> Urgente
        </button>
      </div>
    </div>
  );
}

// ─── CARD LISTA ──────────────────────────────────────────────────────────────
function InterventoCard({intv,onOpen}:{intv:Intervento;onOpen:()=>void}){
  const tipo=TIPI_LABEL[intv.tipo];
  const stato=STATI_LABEL[intv.stato];
  const completate=intv.checklist.filter(c=>c.fatto).length;
  const pct=intv.checklist.length>0?Math.round((completate/intv.checklist.length)*100):0;
  return(
    <button onClick={onOpen} style={{...card,width:'100%',textAlign:'left',cursor:'pointer',border:intv.stato==='urgente'?`2px solid ${DS.red}`:intv.stato==='in_corso'?`2px solid ${DS.amber}`:`1.5px solid ${DS.border}`,padding:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,color:DS.text,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{intv.titolo}</div>
          <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
            <span style={{background:tipo.bg,color:tipo.color,borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:3}}>{tipo.icon}{tipo.label}</span>
            <span style={{background:stato.bg,color:stato.color,borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:600}}>{stato.label}</span>
            {intv.commessaId&&<span style={{background:DS.tealLight,color:DS.teal,borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:600}}>{intv.commessaId}</span>}
          </div>
        </div>
        <div style={{marginLeft:8,textAlign:'right',flexShrink:0}}>
          <div style={{fontFamily:DS.mono,fontSize:12,color:DS.textMid}}>{intv.dataOra.slice(11,16)}</div>
          {intv.orelavoro>0&&<div style={{fontSize:11,color:DS.textMid,marginTop:2}}>{fmtOre(intv.orelavoro)}</div>}
        </div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',fontSize:12,color:DS.textMid,marginBottom:intv.checklist.length>0?8:0}}>
        <MapPin size={11}/>{intv.cliente} · {intv.indirizzo.split(',')[0]}
      </div>
      {intv.checklist.length>0&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:DS.textMid,marginBottom:4}}>
            <span>Checklist</span><span style={{fontFamily:DS.mono}}>{completate}/{intv.checklist.length}</span>
          </div>
          <div style={{background:DS.tealLight,borderRadius:999,height:5,overflow:'hidden'}}>
            <div style={{background:pct===100?DS.green:DS.teal,height:5,width:`${pct}%`,borderRadius:999,transition:'width 300ms'}}/>
          </div>
        </div>
      )}
    </button>
  );
}

// ─── DETTAGLIO INTERVENTO ─────────────────────────────────────────────────────
function InterventoDetail({intervento,onBack,onUpdate}:{intervento:Intervento;onBack:()=>void;onUpdate:(i:Intervento)=>void}){
  const [intv,setIntv]   = useState(intervento);
  const [dtab,setDtab]   = useState<'info'|'checklist'|'materiali'|'firma'>('info');
  const [bpId,setBpId]   = useState('');
  const [newMat,setNewMat]= useState('');
  const [newMatQty,setNewMatQty]=useState('1');
  const [newCheck,setNewCheck]=useState('');
  const timer = useInterventoTimer(intv.orelavoro);
  const firma = useFirmaCanvas();

  const save=(updated:Intervento)=>{setIntv(updated);onUpdate(updated);};
  const press=(id:string,fn?:()=>void)=>{setBpId(id);setTimeout(()=>{setBpId('');fn?.();},150);};

  const toggleCheck=(id:number)=>save({...intv,checklist:intv.checklist.map(c=>c.id===id?{...c,fatto:!c.fatto}:c)});
  const addCheck=()=>{if(!newCheck.trim())return;save({...intv,checklist:[...intv.checklist,{id:Date.now(),testo:newCheck.trim(),fatto:false}]});setNewCheck('');};
  const addMat=()=>{if(!newMat.trim())return;save({...intv,materiali:[...intv.materiali,{id:Date.now(),desc:newMat.trim(),qty:parseFloat(newMatQty)||1,unita:'pz'}]});setNewMat('');setNewMatQty('1');};
  const addFoto=()=>save({...intv,foto:[...intv.foto,`foto_${intv.foto.length+1}_${oraNow().replace(':','')}.jpg`]});

  const avvia=()=>save({...intv,stato:'in_corso'});
  const completa=()=>{timer.stop();save({...intv,stato:'completato',orelavoro:timer.elapsed});};

  const tipo=TIPI_LABEL[intv.tipo];
  const stato=STATI_LABEL[intv.stato];
  const completate=intv.checklist.filter(c=>c.fatto).length;
  const pct=intv.checklist.length>0?Math.round((completate/intv.checklist.length)*100):0;

  return(
    <div style={{display:'flex',flexDirection:'column',flex:1,background:DS.bg}}>
      {/* Header */}
      <div style={{background:DS.topbar,padding:'10px 14px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
          <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><ChevronLeft size={20} color="#fff"/></button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:'#fff',fontWeight:700,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{intv.titolo}</div>
            <div style={{color:DS.textLight,fontSize:11}}>{intv.cliente} · {intv.dataOra.slice(0,10)}</div>
          </div>
          <div style={{display:'flex',gap:6,flexShrink:0}}>
            <span style={{background:tipo.bg,color:tipo.color,borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700}}>{tipo.label}</span>
            <span style={{background:stato.bg,color:stato.color,borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700}}>{stato.label}</span>
          </div>
        </div>
        {/* Timer inline */}
        <div style={{background:'rgba(255,255,255,0.08)',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <Clock size={14} color={timer.running?DS.teal:DS.textLight}/>
            <span style={{fontFamily:DS.mono,fontSize:18,fontWeight:700,color:timer.running?DS.teal:'#fff'}}>{fmtSec(timer.elapsed)}</span>
          </div>
          <div style={{display:'flex',gap:6}}>
            {intv.stato==='in_corso'&&(!timer.running
              ?<button onClick={()=>{timer.start();}} style={{background:DS.green,border:'none',borderRadius:8,padding:'5px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:4,color:'#fff',fontSize:12,fontWeight:700,boxShadow:`0 3px 0 0 ${DS.greenDark}`}}>
                <Play size={12}/>{timer.elapsed>0?'Riprendi':'Avvia'}
              </button>
              :<button onClick={timer.pause} style={{background:DS.amber,border:'none',borderRadius:8,padding:'5px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:4,color:'#fff',fontSize:12,fontWeight:700,boxShadow:`0 3px 0 0 ${DS.amberDark}`}}>
                <Pause size={12}/>Pausa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline checklist progress */}
      {intv.checklist.length>0&&(
        <div style={{background:'#f4fcfc',padding:'8px 14px',borderBottom:`1px solid ${DS.border}`,flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:DS.textMid,marginBottom:4}}>
            <span>Avanzamento checklist</span>
            <span style={{fontFamily:DS.mono,fontWeight:700,color:pct===100?DS.green:DS.text}}>{completate}/{intv.checklist.length} — {pct}%</span>
          </div>
          <div style={{background:DS.tealLight,borderRadius:999,height:6,overflow:'hidden'}}>
            <div style={{background:pct===100?DS.green:DS.teal,height:6,width:`${pct}%`,borderRadius:999,transition:'width 300ms'}}/>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{background:DS.topbar,display:'flex',flexShrink:0}}>
        {(['info','checklist','materiali','firma'] as const).map(t=>(
          <button key={t} onClick={()=>setDtab(t)}
            style={{flex:1,background:'none',border:'none',color:dtab===t?DS.teal:'#8BBCBC',fontFamily:DS.ui,fontWeight:dtab===t?700:400,fontSize:11,padding:'10px 0',cursor:'pointer',borderBottom:dtab===t?`2px solid ${DS.teal}`:'2px solid transparent'}}>
            {t==='info'?'INFO':t==='checklist'?'CHECK':t==='materiali'?'MATERIALI':'FIRMA'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:'auto',padding:14}}>

        {/* ── INFO ── */}
        {dtab==='info'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={card}>
              {[
                {icon:<User size={13} color={DS.teal}/>,       val:intv.cliente},
                {icon:<MapPin size={13} color={DS.teal}/>,     val:intv.indirizzo},
                {icon:<Phone size={13} color={DS.teal}/>,      val:intv.telefono||'—'},
                {icon:<Clock size={13} color={DS.teal}/>,      val:intv.dataOra},
                {icon:<FileText size={13} color={DS.teal}/>,   val:intv.descrizione||'—'},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:i<4?10:0}}>
                  {r.icon}<span style={{fontSize:13,color:DS.textMid,lineHeight:1.5}}>{r.val}</span>
                </div>
              ))}
              {intv.commessaId&&(
                <div style={{marginTop:10,background:DS.tealLight,borderRadius:8,padding:'6px 10px',fontSize:12,color:DS.teal,fontWeight:600,display:'flex',gap:6,alignItems:'center'}}>
                  <Building2 size={12}/> Commessa: {intv.commessaId}
                </div>
              )}
            </div>
            {/* Foto */}
            <div style={card}>
              <div style={{fontWeight:700,color:DS.text,fontSize:13,marginBottom:10}}>Foto cantiere</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:10}}>
                {intv.foto.map((f,i)=>(
                  <div key={i} style={{background:DS.tealLight,borderRadius:8,padding:'6px 10px',fontSize:11,color:DS.teal,display:'flex',gap:4,alignItems:'center'}}>
                    <Camera size={10}/>{f}
                  </div>
                ))}
                {intv.foto.length===0&&<span style={{color:DS.textMid,fontSize:13}}>Nessuna foto</span>}
              </div>
              <button onClick={addFoto} style={{...bpGh(false),padding:'8px 14px',fontSize:13}}>
                <Camera size={14}/> Aggiungi foto
              </button>
            </div>
            {/* Note */}
            {intv.note&&<div style={{...card,background:'#FEF9EC',border:`1px solid #F0D040`,color:DS.amber,fontSize:13}}>
              <AlertCircle size={13} style={{display:'inline',marginRight:6}}/>{intv.note}
            </div>}
            {/* Azioni stato */}
            <div style={{display:'flex',gap:10,marginTop:4}}>
              {intv.stato==='programmato'&&<button style={{...bpG(bpId==='avvia'),flex:1,justifyContent:'center'}} onPointerDown={()=>setBpId('avvia')} onPointerUp={()=>press('avvia',()=>{avvia();timer.start();})}>
                <Play size={14}/> Avvia intervento
              </button>}
              {intv.stato==='in_corso'&&<button style={{...bpG(bpId==='completa'),flex:1,justifyContent:'center'}} onPointerDown={()=>setBpId('completa')} onPointerUp={()=>press('completa',()=>{completa();setDtab('firma');})}>
                <CheckCircle size={14}/> Completa e firma
              </button>}
              {intv.stato==='urgente'&&<button style={{...bpR(bpId==='avvia-urg'),flex:1,justifyContent:'center'}} onPointerDown={()=>setBpId('avvia-urg')} onPointerUp={()=>press('avvia-urg',()=>{avvia();timer.start();})}>
                <Zap size={14}/> Avvia urgente
              </button>}
              {intv.stato==='completato'&&<div style={{...card,background:'#D1FAE5',border:`1px solid ${DS.green}`,textAlign:'center',flex:1,color:DS.green,fontWeight:700,fontSize:14,padding:12}}>
                <CheckCircle size={16} style={{display:'inline',marginRight:6}}/>Completato — {fmtOre(intv.orelavoro)}
              </div>}
            </div>
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {dtab==='checklist'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {intv.checklist.map(c=>(
              <button key={c.id} onClick={()=>toggleCheck(c.id)}
                style={{...card,display:'flex',gap:12,alignItems:'center',width:'100%',textAlign:'left',cursor:'pointer',border:c.fatto?`1.5px solid ${DS.green}`:`1.5px solid ${DS.border}`,opacity:c.fatto?.75:1}}>
                <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${c.fatto?DS.green:DS.border}`,background:c.fatto?DS.green:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 150ms'}}>
                  {c.fatto&&<Check size={14} color="#fff"/>}
                </div>
                <span style={{flex:1,fontSize:14,color:c.fatto?DS.textMid:DS.text,textDecoration:c.fatto?'line-through':'none'}}>{c.testo}</span>
              </button>
            ))}
            {/* Aggiungi voce custom */}
            <div style={{...card,border:`2px dashed ${DS.border}`}}>
              <div style={{fontWeight:600,color:DS.text,fontSize:13,marginBottom:8}}>Aggiungi voce</div>
              <div style={{display:'flex',gap:8}}>
                <input value={newCheck} onChange={e=>setNewCheck(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCheck()}
                  placeholder="Es. Verifica guarnizione angoli" style={{flex:1,padding:'8px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:13,fontFamily:DS.ui,outline:'none'}}/>
                <button onClick={addCheck} style={{...bp(false),padding:'8px 12px'}}><Plus size={14}/></button>
              </div>
            </div>
          </div>
        )}

        {/* ── MATERIALI ── */}
        {dtab==='materiali'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {intv.materiali.length===0&&<div style={{...card,color:DS.textMid,fontSize:13,textAlign:'center',padding:24}}>Nessun materiale registrato</div>}
            {intv.materiali.map(m=>(
              <div key={m.id} style={{...card,display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:38,height:38,borderRadius:10,background:DS.tealLight,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Package size={16} color={DS.teal}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:DS.text,fontSize:14}}>{m.desc}</div>
                  <div style={{color:DS.textMid,fontSize:12,fontFamily:DS.mono}}>qty {m.qty} {m.unita}</div>
                </div>
                <button onClick={()=>save({...intv,materiali:intv.materiali.filter(x=>x.id!==m.id)})}
                  style={{background:'none',border:'none',cursor:'pointer',padding:4}}><X size={16} color={DS.textLight}/></button>
              </div>
            ))}
            <div style={{...card,border:`2px dashed ${DS.border}`}}>
              <div style={{fontWeight:600,color:DS.text,fontSize:13,marginBottom:8}}>Aggiungi materiale</div>
              <input value={newMat} onChange={e=>setNewMat(e.target.value)}
                placeholder="Es. Coprifili alluminio 40mm" style={{width:'100%',padding:'8px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:13,fontFamily:DS.ui,outline:'none',marginBottom:8,boxSizing:'border-box'}}/>
              <div style={{display:'flex',gap:8}}>
                <input value={newMatQty} onChange={e=>setNewMatQty(e.target.value)} type="number" min="0.1" step="0.1"
                  placeholder="qty" style={{width:80,padding:'8px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:13,fontFamily:DS.mono,outline:'none',textAlign:'center'}}/>
                <button onClick={addMat} style={{...bp(false),flex:1,justifyContent:'center'}}><Plus size={14}/> Aggiungi</button>
              </div>
            </div>
          </div>
        )}

        {/* ── FIRMA ── */}
        {dtab==='firma'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {intv.firmaSalvata
              ?<div style={{...card,textAlign:'center',padding:32}}>
                <CheckCircle size={48} color={DS.green} style={{margin:'0 auto 12px'}}/>
                <div style={{fontWeight:700,color:DS.text,fontSize:16}}>Firmato!</div>
                <div style={{color:DS.textMid,fontSize:13,marginTop:4}}>Intervento completato e firmato da {intv.cliente}</div>
                <div style={{marginTop:12,fontFamily:DS.mono,fontSize:13,color:DS.textMid}}>Durata: {fmtOre(intv.orelavoro)}</div>
              </div>
              :<>
                <div style={card}>
                  <div style={{fontWeight:600,color:DS.text,marginBottom:4}}>Riepilogo intervento</div>
                  <div style={{color:DS.textMid,fontSize:13}}>Cliente: {intv.cliente}</div>
                  <div style={{color:DS.textMid,fontSize:13}}>Check completati: {completate}/{intv.checklist.length}</div>
                  <div style={{color:DS.textMid,fontSize:13}}>Durata: {fmtOre(timer.elapsed>0?timer.elapsed:intv.orelavoro)}</div>
                  <div style={{color:DS.textMid,fontSize:13}}>Materiali: {intv.materiali.length} voci</div>
                </div>
                <div style={{...card,padding:8}}>
                  <div style={{color:DS.textMid,fontSize:12,marginBottom:8,textAlign:'center'}}>Firma del cliente</div>
                  <canvas ref={firma.ref} width={320} height={130}
                    style={{width:'100%',height:130,border:`2px dashed ${DS.border}`,borderRadius:8,touchAction:'none',cursor:'crosshair'}}
                    onPointerDown={firma.onStart} onPointerMove={firma.onMove} onPointerUp={firma.onEnd} onPointerLeave={firma.onEnd}/>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button style={{...bpGh(bpId==='cf'),flex:1,justifyContent:'center'}} onPointerDown={()=>setBpId('cf')} onPointerUp={()=>{setBpId('');firma.clear();}}>
                    <RotateCcw size={13}/> Cancella
                  </button>
                  <button style={{...bpG(bpId==='salva-firma'),flex:2,justifyContent:'center'}}
                    onPointerDown={()=>setBpId('salva-firma')}
                    onPointerUp={()=>{setBpId('');save({...intv,stato:'completato',firmaSalvata:true,orelavoro:timer.elapsed>0?timer.elapsed:intv.orelavoro});}}>
                    <Send size={13}/> Conferma e invia PDF
                  </button>
                </div>
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NUOVO INTERVENTO ─────────────────────────────────────────────────────────
function NuovoIntervento({onBack,onSave}:{onBack:()=>void;onSave:(i:Intervento)=>void}){
  const [tipo,setTipo]       = useState<TipoIntervento>('montaggio');
  const [titolo,setTitolo]   = useState('');
  const [cliente,setCliente] = useState('');
  const [indirizzo,setIndirizzo]=useState('');
  const [telefono,setTelefono]=useState('');
  const [dataOra,setDataOra] = useState(new Date().toISOString().slice(0,16));
  const [descrizione,setDescriz]=useState('');
  const [commessaId,setCommessaId]=useState('');
  const [note,setNote]       = useState('');
  const [bpId,setBpId]       = useState('');

  const save=()=>{
    if(!titolo.trim()||!cliente.trim())return;
    const intv:Intervento={
      id:Date.now(), tipo, stato:tipo==='urgente'?'urgente':'programmato',
      titolo:titolo.trim(), descrizione,
      cliente:cliente.trim(), indirizzo, telefono,
      dataOra:dataOra.replace('T',' '),
      commessaId:commessaId.trim()||undefined,
      creatoDa:'montatore',
      checklist:CHECKLIST_TEMPLATE[tipo].map((t,i)=>({id:i+1,testo:t,fatto:false})),
      materiali:[], foto:[], orelavoro:0, note, firmaSalvata:false,
    };
    onSave(intv);
  };

  return(
    <div style={{display:'flex',flexDirection:'column',flex:1,background:DS.bg}}>
      <div style={{background:DS.topbar,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><ChevronLeft size={20} color="#fff"/></button>
        <div style={{color:'#fff',fontWeight:700,fontSize:15}}>Nuovo intervento</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12}}>
        {/* Tipo */}
        <div style={card}>
          <div style={{fontWeight:700,color:DS.text,fontSize:13,marginBottom:10}}>Tipo intervento</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {(Object.entries(TIPI_LABEL) as [TipoIntervento,typeof TIPI_LABEL[TipoIntervento]][]).map(([t,tl])=>(
              <button key={t} onClick={()=>setTipo(t)}
                style={{background:tipo===t?tl.color:tl.bg,border:`2px solid ${tipo===t?tl.color:DS.border}`,borderRadius:10,padding:'10px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,fontFamily:DS.ui,fontWeight:700,fontSize:13,color:tipo===t?'#fff':tl.color,boxShadow:tipo===t?`0 3px 0 0 ${DS.tealDark}`:'none'}}>
                {tl.icon}{tl.label}
              </button>
            ))}
          </div>
        </div>
        {/* Campi */}
        {[
          {label:'Titolo *',val:titolo,set:setTitolo,placeholder:'Es. Sostituzione finestre cucina'},
          {label:'Cliente *',val:cliente,set:setCliente,placeholder:'Nome cliente'},
          {label:'Indirizzo',val:indirizzo,set:setIndirizzo,placeholder:'Via, città'},
          {label:'Telefono',val:telefono,set:setTelefono,placeholder:'+39 ...'},
          {label:'Commessa (opzionale)',val:commessaId,set:setCommessaId,placeholder:'COM-2024-XXX'},
        ].map(f=>(
          <div key={f.label}>
            <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:4,fontFamily:DS.ui}}>{f.label}</label>
            <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}
        <div>
          <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:4}}>Data e ora</label>
          <input type="datetime-local" value={dataOra} onChange={e=>setDataOra(e.target.value)}
            style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:4}}>Descrizione</label>
          <textarea value={descrizione} onChange={e=>setDescriz(e.target.value)} rows={3} placeholder="Descrivi il lavoro..."
            style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',resize:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:4}}>Note</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Note interne..."
            style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',resize:'none',boxSizing:'border-box'}}/>
        </div>
        {/* Anteprima checklist */}
        {CHECKLIST_TEMPLATE[tipo].length>0&&(
          <div style={{...card,border:`1px dashed ${DS.border}`}}>
            <div style={{fontWeight:600,color:DS.text,fontSize:13,marginBottom:8}}>Checklist auto-generata ({CHECKLIST_TEMPLATE[tipo].length} voci)</div>
            {CHECKLIST_TEMPLATE[tipo].slice(0,3).map((t,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'center',fontSize:13,color:DS.textMid,marginBottom:4}}>
                <Circle size={12} color={DS.tealLight}/>{t}
              </div>
            ))}
            {CHECKLIST_TEMPLATE[tipo].length>3&&<div style={{fontSize:12,color:DS.textLight,marginTop:4}}>+{CHECKLIST_TEMPLATE[tipo].length-3} altre voci...</div>}
          </div>
        )}
        <button style={{...bpG(!titolo.trim()||!cliente.trim()?false:bpId==='salva'),justifyContent:'center',opacity:!titolo.trim()||!cliente.trim()?.5:1}}
          disabled={!titolo.trim()||!cliente.trim()}
          onPointerDown={()=>setBpId('salva')} onPointerUp={()=>{setBpId('');save();}}>
          <Check size={15}/> Crea intervento
        </button>
      </div>
    </div>
  );
}
