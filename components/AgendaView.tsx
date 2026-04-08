// AgendaView build: 2026-04-03 20:34:26
'use client';
import React, { useState, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  Bell, CheckCircle, Circle, X, Check, Phone, Navigation,
  ClipboardList, Calendar, List, LayoutGrid, Wrench
} from 'lucide-react';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  blue:'#3B7FE0',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};
const card: React.CSSProperties = {
  background:'linear-gradient(145deg,#fff,#f4fcfc)',
  borderRadius:12, border:`1.5px solid ${DS.border}`,
  boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:12,
};

type TipoEvento = 'lavoro'|'intervento'|'urgente'|'task';
type Vista = 'giorno'|'settimana'|'mese';

interface Evento {
  id:number; tipo:TipoEvento; titolo:string;
  cliente?:string; indirizzo?:string; telefono?:string;
  data:string; oraInizio:string; oraFine:string;
  durataGiorni:number; commessaId?:string; note?:string; fatto?:boolean; fromErp?:boolean;
}
interface Task {
  id:number; testo:string; urgente:boolean; fatto:boolean;
  data?:string; azioni?:{label:string;href?:string}[];
}

const TIPO_COL: Record<TipoEvento,{bg:string;border:string;text:string}> = {
  lavoro:     {bg:'rgba(40,160,160,.13)', border:DS.teal,  text:DS.teal},
  intervento: {bg:'rgba(59,127,224,.13)', border:DS.blue,  text:DS.blue},
  urgente:    {bg:'rgba(220,68,68,.13)',  border:DS.red,   text:DS.red},
  task:       {bg:'rgba(208,128,8,.13)',  border:DS.amber, text:DS.amber},
};
const TIPO_LABEL: Record<TipoEvento,string> = {lavoro:'Lavoro',intervento:'Intervento',urgente:'Urgente',task:'Task'};
const GG = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const MESI_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const TODAY = new Date().toISOString().slice(0,10);

function addDays(d:string,n:number):string{const dt=new Date(d+'T12:00');dt.setDate(dt.getDate()+n);return dt.toISOString().slice(0,10);}
function startOfWeek(d:string):string{const dt=new Date(d+'T12:00');const day=dt.getDay();const diff=day===0?-6:1-day;dt.setDate(dt.getDate()+diff);return dt.toISOString().slice(0,10);}
function daysInMonth(d:string):number{const dt=new Date(d+'T12:00');return new Date(dt.getFullYear(),dt.getMonth()+1,0).getDate();}
function fmtDate(d:string,o:Intl.DateTimeFormatOptions):string{return new Date(d+'T12:00').toLocaleDateString('it-IT',o);}

const EVENTI_INIT: Evento[] = [
  {id:1,tipo:'lavoro',    titolo:'Fam. Rossi — infissi PVC',    fromErp:true,      cliente:'Fam. Rossi',    indirizzo:'Via Roma 12, Brindisi',    telefono:'+39 331 456 7890',data:'2026-04-03',oraInizio:'08:30',oraFine:'17:00',durataGiorni:2,commessaId:'COM-047',note:'3 vani'},
  {id:2,tipo:'lavoro',    titolo:'Cond. Verdi — sopralluogo',   fromErp:true,     cliente:'Cond. Verdi',   indirizzo:'Via Verdi 22, Brindisi',   telefono:'+39 340 999 0001',data:'2026-04-05',oraInizio:'08:00',oraFine:'12:00',durataGiorni:1,commessaId:'COM-048'},
  {id:3,tipo:'intervento',titolo:'Manutenzione Sig. Bruno',     fromErp:true,       cliente:'Sig. Bruno',    indirizzo:'Via Mazzini 5, Lecce',     telefono:'+39 333 112 3344',data:'2026-04-03',oraInizio:'14:00',oraFine:'16:00',durataGiorni:1},
  {id:4,tipo:'urgente',   titolo:'Riparazione porta balcone',   fromErp:true,     cliente:'Sig.ra Ferrari',indirizzo:'Corso Italia 8, Brindisi', telefono:'+39 348 776 5432',data:'2026-04-04',oraInizio:'09:00',oraFine:'11:00',durataGiorni:1},
  {id:5,tipo:'lavoro',    titolo:'Studio Greco — finestre al.',   cliente:'Studio Greco',  indirizzo:'Corso Italia 88, Taranto', telefono:'+39 340 222 3333',data:'2026-04-07',oraInizio:'08:00',oraFine:'18:00',durataGiorni:3,commessaId:'COM-049'},
  {id:6,tipo:'task',      titolo:'Preventivo Sig. Bianchi',       data:'2026-04-04',oraInizio:'10:00',oraFine:'10:30',durataGiorni:1,note:'Chiamare prima'},
  {id:7,tipo:'task',      titolo:'Ordine materiali PVC',          data:'2026-04-05',oraInizio:'09:00',oraFine:'09:30',durataGiorni:1},
];
const TASKS_INIT: Task[] = [
  {id:1,testo:'Conferma appuntamento Cond. Verdi',urgente:true, fatto:false,data:'2026-04-03',azioni:[{label:'Chiama',href:'tel:+39340999001'},{label:'SMS',href:'sms:+39340999001'}]},
  {id:2,testo:'Invia preventivo Studio Greco',    urgente:true, fatto:false,data:'2026-04-04',azioni:[{label:'Apri commessa'}]},
  {id:3,testo:'Riordino stock guarnizioni EPDM',  urgente:false,fatto:false,data:'2026-04-06'},
  {id:4,testo:'Aggiorna listino Sch├╝co Q2',       urgente:false,fatto:true},
  {id:5,testo:'Foto fine lavoro COM-047',         urgente:false,fatto:false,data:'2026-04-04'},
];

// ─── EVENTO BLOCK ─────────────────────────────────────────────────────────────
function EvBlock({ev,compact,onOpen,onDragStart}:{ev:Evento;compact?:boolean;onOpen:(e:Evento)=>void;onDragStart:(e:React.DragEvent,ev:Evento)=>void}){
  const c=TIPO_COL[ev.tipo];
  const glassStyle: React.CSSProperties = compact ? {
    background:`linear-gradient(135deg,${c.bg},rgba(255,255,255,0.9))`,
    border:`1.5px solid ${c.border}`,
    borderLeft:`3px solid ${c.border}`,
    borderRadius:5,
    padding:'2px 5px',
    cursor:'pointer',
    marginBottom:2,
    userSelect:'none' as const,
    boxShadow:`0 1px 4px ${c.border}44, inset 0 1px 0 rgba(255,255,255,0.6)`,
  } : {
    background:`linear-gradient(145deg,rgba(255,255,255,0.95),${c.bg})`,
    border:`1.5px solid ${c.border}`,
    borderLeft:`4px solid ${c.border}`,
    borderRadius:8,
    padding:'6px 8px',
    cursor:'pointer',
    marginBottom:3,
    userSelect:'none' as const,
    boxShadow:`0 2px 8px ${c.border}55, 0 1px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 ${c.border}33 inset`,
    backdropFilter:'blur(4px)',
  };
  return(
    <div draggable onDragStart={e=>onDragStart(e,ev)} onClick={()=>onOpen(ev)} style={glassStyle}>
      <div style={{fontWeight:700,color:c.text,fontSize:compact?10:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textShadow:`0 0 8px ${c.border}44`}}>{ev.titolo}</div>
      {!compact&&<div style={{fontSize:10,color:DS.textMid,marginTop:1,display:'flex',gap:5,alignItems:'center'}}><Clock size={8}/>{ev.oraInizio}–{ev.oraFine}{ev.cliente&&<><MapPin size={8}/>{ev.cliente}</>}</div>}
      {ev.fromErp&&!compact&&<div style={{fontSize:9,color:c.text,opacity:.6,marginTop:1}}>ERP</div>}
    </div>
  );
}

// ─── MODAL EVENTO ─────────────────────────────────────────────────────────────
function ModalEvento({ev,onClose,onUpdate,onSposta,onReport}:{ev:Evento;onClose:()=>void;onUpdate:(e:Evento)=>void;onSposta:(e:Evento)=>void;onReport?:(e:Evento)=>void}){
  const c=TIPO_COL[ev.tipo];
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:300,display:'flex',alignItems:'flex-end'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:420,margin:'0 auto',maxHeight:'80vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div>
            <span style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:20,padding:'2px 10px',fontSize:11,color:c.text,fontWeight:700,display:'inline-block',marginBottom:6}}>{TIPO_LABEL[ev.tipo]}</span>
            <div style={{fontWeight:700,color:DS.text,fontSize:17,lineHeight:1.2}}>{ev.titolo}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><X size={20} color={DS.textMid}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
          {ev.cliente&&<div style={{display:'flex',gap:8,alignItems:'flex-start'}}><MapPin size={13} color={DS.teal}/><span style={{fontSize:13,color:DS.textMid}}>{ev.cliente}{ev.indirizzo?` · ${ev.indirizzo}`:''}</span></div>}
          {ev.telefono&&<div style={{display:'flex',gap:8,alignItems:'flex-start'}}><Phone size={13} color={DS.teal}/><span style={{fontSize:13,color:DS.textMid}}>{ev.telefono}</span></div>}
          <div style={{display:'flex',gap:8,alignItems:'flex-start'}}><Clock size={13} color={DS.teal}/><span style={{fontSize:13,color:DS.textMid}}>{fmtDate(ev.data,{weekday:'long',day:'numeric',month:'long'})} · {ev.oraInizio}–{ev.oraFine}</span></div>
          {ev.durataGiorni>1&&<div style={{display:'flex',gap:8,alignItems:'flex-start'}}><Calendar size={13} color={DS.teal}/><span style={{fontSize:13,color:DS.textMid}}>Durata: {ev.durataGiorni} giorni</span></div>}
          {ev.commessaId&&<div style={{display:'flex',gap:8,alignItems:'flex-start'}}><ClipboardList size={13} color={DS.teal}/><span style={{fontSize:13,color:DS.textMid}}>Commessa {ev.commessaId}</span></div>}
          {ev.note&&<div style={{display:'flex',gap:8,alignItems:'flex-start'}}><Bell size={13} color={DS.amber}/><span style={{fontSize:13,color:DS.textMid}}>{ev.note}</span></div>}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
          {ev.telefono&&<a href={`tel:${ev.telefono}`} style={{flex:1,background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'center',gap:6,textDecoration:'none',color:DS.teal,fontWeight:700,fontSize:13,boxShadow:`0 3px 0 0 ${DS.border}`}}><Phone size={14}/> Chiama</a>}
          {ev.indirizzo&&<a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ev.indirizzo||'')}`} target="_blank" rel="noreferrer" style={{flex:1,background:DS.teal,border:'none',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'center',gap:6,textDecoration:'none',color:'#fff',fontWeight:700,fontSize:13,boxShadow:`0 3px 0 0 ${DS.tealDark}`}}><Navigation size={14}/> Naviga</a>}
          {ev.tipo==='task'&&!ev.fatto&&<button onClick={()=>{onUpdate({...ev,fatto:true});onClose();}} style={{flex:1,background:DS.green,border:'none',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:`0 3px 0 0 ${DS.greenDark}`}}><Check size={14}/> Completato</button>}
          {(ev.tipo==='lavoro'||ev.tipo==='intervento'||ev.tipo==='urgente')&&<button onClick={()=>{window.dispatchEvent(new CustomEvent('navigateToWork'));onClose();}} style={{flex:1,background:DS.teal,border:'none',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:`0 3px 0 0 ${DS.tealDark}`}}><ClipboardList size={14}/> Apri lavoro</button>}
        </div>
        {ev.fromErp&&onReport&&(
          <button onClick={()=>{onReport(ev);onClose();}} style={{width:'100%',background:DS.topbar,border:'none',borderRadius:10,padding:'10px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13,fontFamily:DS.ui,marginBottom:8,boxShadow:'0 3px 0 0 #000'}}>
            <ClipboardList size={14}/> Apri report commessa
          </button>
        )}
        {ev.commessaId&&(
          <div style={{background:'linear-gradient(135deg,#0D1F1F,#1a3535)',borderRadius:10,padding:'12px 14px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}
            onClick={()=>{window.dispatchEvent(new CustomEvent('openCommessa',{detail:{id:ev.commessaId}}));}}>
            <div>
              <div style={{color:'#fff',fontWeight:700,fontSize:13}}>Report Commessa</div>
              <div style={{color:'#8BBCBC',fontSize:11,marginTop:1}}>Misure · storia · materiali · anomalie</div>
            </div>
            <div style={{color:DS.teal,fontSize:18}}>›</div>
          </div>
        )}
        <button onClick={()=>onSposta(ev)} style={{width:'100%',background:'#f8fefe',border:`1.5px solid ${DS.border}`,borderRadius:10,padding:'10px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',color:DS.textMid,fontWeight:600,fontSize:13,fontFamily:DS.ui}}>
          <Calendar size={14}/> Sposta appuntamento
        </button>
      </div>
    </div>
  );
}

// ─── VISTA GIORNO ─────────────────────────────────────────────────────────────
function VistaGiorno({data,eventi,onOpen,onDrop}:{data:string;eventi:Evento[];onOpen:(e:Evento)=>void;onDrop:(id:number,d:string,o:string)=>void}){
  const ORE=Array.from({length:13},(_,i)=>i+7);
  const [dragOver,setDragOver]=useState<string|null>(null);
  const dragId=useRef<number|null>(null);
  const evGiorno=eventi.filter(e=>{for(let i=0;i<e.durataGiorni;i++)if(addDays(e.data,i)===data)return true;return false;});
  return(
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{fontWeight:700,color:DS.text,fontSize:14,padding:'8px 14px',borderBottom:`1px solid ${DS.border}`,display:'flex',alignItems:'center',gap:8}}>
        {fmtDate(data,{weekday:'long',day:'numeric',month:'long'})}
        {data===TODAY&&<span style={{background:DS.teal,color:'#fff',borderRadius:20,padding:'1px 8px',fontSize:11,fontWeight:700}}>Oggi</span>}
      </div>
      {ORE.map(h=>{
        const ora=`${String(h).padStart(2,'0')}:00`;
        const slot=`${data}-${ora}`;
        const isDO=dragOver===slot;
        const evs=evGiorno.filter(e=>{const[eh]=e.oraInizio.split(':').map(Number);return eh===h;});
        return(
          <div key={h} onDragOver={e=>{e.preventDefault();setDragOver(slot);}} onDrop={()=>{if(dragId.current!=null){onDrop(dragId.current,data,ora);dragId.current=null;}setDragOver(null);}}
            style={{display:'flex',borderBottom:`1px solid ${isDO?DS.teal:DS.border}`,background:isDO?DS.tealLight:'transparent',minHeight:56,transition:'background 80ms'}}>
            <div style={{width:48,flexShrink:0,color:DS.textLight,fontSize:10,fontFamily:DS.mono,paddingTop:4,paddingLeft:10}}>{ora}</div>
            <div style={{flex:1,padding:'3px 8px'}}>
              {evs.map(ev=><EvBlock key={ev.id} ev={ev} onOpen={onOpen} onDragStart={(e)=>{dragId.current=ev.id;}}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── VISTA SETTIMANA ──────────────────────────────────────────────────────────
function VistaSett({dataInizio,eventi,onOpen,onDrop}:{dataInizio:string;eventi:Evento[];onOpen:(e:Evento)=>void;onDrop:(id:number,d:string,o:string)=>void}){
  const giorni=Array.from({length:7},(_,i)=>addDays(dataInizio,i));
  const [dragOver,setDragOver]=useState<string|null>(null);
  const dragId=useRef<number|null>(null);
  const getEv=(d:string)=>eventi.filter(e=>{for(let i=0;i<e.durataGiorni;i++)if(addDays(e.data,i)===d)return true;return false;});
  return(
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:`1px solid ${DS.border}`,background:'#f8fefe',flexShrink:0}}>
        {giorni.map((d,di)=>(
          <div key={d} style={{textAlign:'center',padding:'6px 2px',borderRight:`1px solid ${DS.border}`}}>
            <div style={{fontSize:9,color:DS.textMid}}>{GG[di]}</div>
            <div style={{fontFamily:DS.mono,fontWeight:700,fontSize:14,color:d===TODAY?'#fff':DS.text,background:d===TODAY?DS.teal:'none',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',margin:'2px auto 0'}}>{d.slice(8)}</div>
          </div>
        ))}
      </div>
      {Array.from({length:12},(_,i)=>i+7).map(h=>{
        const ora=`${String(h).padStart(2,'0')}:00`;
        return(
          <div key={h} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:`1px solid ${DS.border}`,minHeight:48}}>
            {giorni.map((d,di)=>{
              const slot=`${d}-${ora}`;
              const isDO=dragOver===slot;
              const evs=getEv(d).filter(e=>{const[eh]=e.oraInizio.split(':').map(Number);return eh===h;});
              return(
                <div key={d} onDragOver={e=>{e.preventDefault();setDragOver(slot);}} onDrop={()=>{if(dragId.current!=null){onDrop(dragId.current,d,ora);dragId.current=null;}setDragOver(null);}}
                  style={{borderRight:`1px solid ${DS.border}`,padding:'2px',background:isDO?DS.tealLight:'transparent',position:'relative',minHeight:48}}>
                  {di===0&&<span style={{position:'absolute',top:2,left:2,fontSize:8,color:DS.textLight,fontFamily:DS.mono}}>{ora}</span>}
                  {evs.map(ev=><EvBlock key={ev.id} ev={ev} compact onOpen={onOpen} onDragStart={(e)=>{dragId.current=ev.id;}}/>)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── VISTA MESE ───────────────────────────────────────────────────────────────
function VistaMese({anno,mese,eventi,onOpen,onDrop}:{anno:number;mese:number;eventi:Evento[];onOpen:(e:Evento)=>void;onDrop:(id:number,d:string,o:string)=>void}){
  const primo=`${anno}-${String(mese+1).padStart(2,'0')}-01`;
  const nGiorni=daysInMonth(primo);
  const primoWd=new Date(primo+'T12:00').getDay();
  const offset=primoWd===0?6:primoWd-1;
  const [dragOver,setDragOver]=useState<string|null>(null);
  const dragId=useRef<number|null>(null);
  const celle:(string|null)[]=[...Array(offset).fill(null),...Array.from({length:nGiorni},(_,i)=>`${anno}-${String(mese+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`)];
  while(celle.length%7!==0)celle.push(null);
  const getEv=(d:string)=>eventi.filter(e=>{for(let i=0;i<e.durataGiorni;i++)if(addDays(e.data,i)===d)return true;return false;});
  return(
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#f8fefe',borderBottom:`1px solid ${DS.border}`}}>
        {GG.map(g=><div key={g} style={{textAlign:'center',padding:'5px 0',fontSize:10,color:DS.textMid,fontWeight:600}}>{g}</div>)}
      </div>
      {Array.from({length:celle.length/7},(_,w)=>celle.slice(w*7,(w+1)*7)).map((sett,wi)=>(
        <div key={wi} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:`1px solid ${DS.border}`}}>
          {sett.map((d,di)=>{
            if(!d)return<div key={di} style={{background:'#fafafa',borderRight:`1px solid ${DS.border}`,minHeight:60}}/>;
            const evs=getEv(d);const isT=d===TODAY;const isDO=dragOver===d;
            return(
              <div key={d} onDragOver={e=>{e.preventDefault();setDragOver(d);}} onDrop={()=>{if(dragId.current!=null){onDrop(dragId.current,d,'08:00');dragId.current=null;}setDragOver(null);}}
                style={{borderRight:`1px solid ${DS.border}`,minHeight:60,padding:'2px 2px',background:isDO?DS.tealLight:'transparent'}}>
                <div style={{fontFamily:DS.mono,fontWeight:isT?700:400,fontSize:11,color:isT?'#fff':DS.text,background:isT?DS.teal:'none',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:2}}>{d.slice(8)}</div>
                {evs.slice(0,2).map(ev=>(
                  <div key={ev.id} draggable onDragStart={()=>{dragId.current=ev.id;}} onClick={()=>onOpen(ev)}
                    style={{background:TIPO_COL[ev.tipo].bg,borderLeft:`3px solid ${TIPO_COL[ev.tipo].border}`,borderRadius:3,padding:'1px 3px',fontSize:9,color:TIPO_COL[ev.tipo].text,fontWeight:600,marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer'}}>
                    {ev.titolo}
                  </div>
                ))}
                {evs.length>2&&<div style={{fontSize:8,color:DS.textLight}}>+{evs.length-2}</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── TASK LIST ────────────────────────────────────────────────────────────────
function TaskList({tasks,onToggle}:{tasks:Task[];onToggle:(id:number)=>void}){
  const pendenti=tasks.filter(t=>!t.fatto);
  const completati=tasks.filter(t=>t.fatto);
  return(
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <span style={{color:DS.textMid,fontSize:13}}>{pendenti.length} da completare</span>
        <button style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:8,padding:'7px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:DS.teal,fontWeight:700,fontSize:12}}>
          <Plus size={13}/> Aggiungi
        </button>
      </div>
      {pendenti.filter(t=>t.urgente).length>0&&(
        <><div style={{fontWeight:700,color:DS.red,fontSize:12,textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:6}}><Bell size={12}/> Urgenti</div>
        {pendenti.filter(t=>t.urgente).map(t=><TaskCard key={t.id} task={t} onToggle={onToggle}/>)}</>
      )}
      {pendenti.filter(t=>!t.urgente).length>0&&(
        <><div style={{fontWeight:700,color:DS.textMid,fontSize:12,textTransform:'uppercase',marginBottom:8,marginTop:8,display:'flex',alignItems:'center',gap:6}}><Check size={12} color={DS.textMid}/> Da fare</div>
        {pendenti.filter(t=>!t.urgente).map(t=><TaskCard key={t.id} task={t} onToggle={onToggle}/>)}</>
      )}
      {completati.length>0&&(
        <><div style={{fontWeight:700,color:DS.textLight,fontSize:12,textTransform:'uppercase',marginBottom:8,marginTop:12,display:'flex',alignItems:'center',gap:6}}><Check size={12} color={DS.textLight}/> Completati</div>
        {completati.map(t=><TaskCard key={t.id} task={t} onToggle={onToggle}/>)}</>
      )}
    </div>
  );
}

function TaskCard({task,onToggle}:{task:Task;onToggle:(id:number)=>void}){
  return(
    <div style={{...card,marginBottom:10,opacity:task.fatto?.6:1,border:task.urgente&&!task.fatto?`1.5px solid ${DS.red}33`:`1.5px solid ${DS.border}`}}>
      <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
        <button onClick={()=>onToggle(task.id)} style={{background:'none',border:'none',cursor:'pointer',padding:0,flexShrink:0,marginTop:1}}>
          {task.fatto?<CheckCircle size={22} color={DS.green}/>:task.urgente?<Circle size={22} color={DS.red}/>:<Circle size={22} color={DS.textLight}/>}
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:14,color:task.fatto?DS.textMid:DS.text,textDecoration:task.fatto?'line-through':'none',fontWeight:task.urgente&&!task.fatto?700:400}}>{task.testo}</div>
          {task.data&&!task.fatto&&<div style={{fontSize:11,color:DS.textMid,marginTop:2,display:'flex',alignItems:'center',gap:4}}><Calendar size={10}/>{task.data.slice(5).replace('-','/')}</div>}
          {task.azioni&&!task.fatto&&(
            <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
              {task.azioni.map((a,i)=>(
                a.href
                  ?<a key={i} href={a.href} style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:8,padding:'5px 10px',fontSize:12,color:DS.teal,fontWeight:600,textDecoration:'none'}}>{a.label}</a>
                  :<button key={i} style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:8,padding:'5px 10px',fontSize:12,color:DS.teal,fontWeight:600,cursor:'pointer'}}>{a.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
// ─── MODAL SPOSTA APPUNTAMENTO ────────────────────────────────────────────────
function SpostaModal({ev,onConferma,onClose}:{ev:Evento;onConferma:(id:number,data:string,ora:string,motivo:string)=>void;onClose:()=>void}){
  const [data,setData]=useState(ev.data);
  const [ora,setOra]=useState(ev.oraInizio);
  const [motivo,setMotivo]=useState('');
  const needsMotivo=!!ev.fromErp;
  const canConfirm=!needsMotivo||motivo.trim().length>0;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:18,padding:20,width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:700,color:DS.text,fontSize:16,marginBottom:4}}>Sposta appuntamento</div>
        <div style={{color:DS.textMid,fontSize:13,marginBottom:14}}>{ev.titolo}</div>
        {needsMotivo&&(
          <div style={{background:'#FEF3C7',border:`1px solid #F0D040`,borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:DS.amber,display:'flex',gap:8,alignItems:'flex-start'}}>
            <span style={{fontSize:14}}>ÔÜá</span>
            <span>Questo appuntamento viene dall&apos;ERP aziendale. Devi indicare il motivo dello spostamento.</span>
          </div>
        )}
        <div style={{display:'flex',gap:10,marginBottom:12}}>
          <div style={{flex:1}}>
            <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:5}}>Nuova data</label>
            <input type="date" value={data} onChange={e=>setData(e.target.value)}
              style={{width:'100%',padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.mono,outline:'none',boxSizing:'border-box' as const}}/>
          </div>
          <div style={{flex:1}}>
            <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:5}}>Ora</label>
            <input type="time" value={ora} onChange={e=>setOra(e.target.value)}
              style={{width:'100%',padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.mono,outline:'none',boxSizing:'border-box' as const}}/>
          </div>
        </div>
        {needsMotivo&&(
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:5}}>Motivo spostamento *</label>
            <input value={motivo} onChange={e=>setMotivo(e.target.value)} autoFocus
              placeholder="Es. Cliente ha richiesto rinvio, meteo avverso..."
              style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${canConfirm?DS.border:DS.red}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',boxSizing:'border-box' as const}}/>
          </div>
        )}
        {!needsMotivo&&(
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:5}}>Motivo (opzionale)</label>
            <input value={motivo} onChange={e=>setMotivo(e.target.value)}
              placeholder="Es. Ho spostato per comodita..."
              style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',boxSizing:'border-box' as const}}/>
          </div>
        )}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose}
            style={{flex:1,background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:10,padding:'11px',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13,fontFamily:DS.ui}}>
            Annulla
          </button>
          <button onClick={()=>{if(canConfirm)onConferma(ev.id,data,ora,motivo);}}
            disabled={!canConfirm}
            style={{flex:2,background:canConfirm?DS.green:'#e5e7eb',border:'none',borderRadius:10,padding:'11px',cursor:canConfirm?'pointer':'default',color:canConfirm?'#fff':DS.textLight,fontWeight:700,fontSize:13,fontFamily:DS.ui,boxShadow:canConfirm?`0 4px 0 0 ${DS.greenDark}`:'none'}}>
            Conferma spostamento
          </button>
        </div>
      </div>
    </div>
  );
}

interface AgendaViewProps { onOpenReport?: (commessaId: string) => void; }
export default function AgendaView({ onOpenReport }: AgendaViewProps = {}){
  const [vista,setVista]     = useState<Vista>('settimana');
  const [tab,setTab]         = useState<'calendario'|'task'>('calendario');
  const [dataRef,setDataRef] = useState(TODAY);
  const [eventi,setEventi]   = useState(EVENTI_INIT);
  const [tasks,setTasks]     = useState(TASKS_INIT);
  const [selEv,setSelEv]     = useState<Evento|null>(null);
  const [spostaEv,setSpostaEv] = useState<Evento|null>(null);
  const pendenti=tasks.filter(t=>!t.fatto).length;

  const vai=(dir:1|-1)=>{
    if(vista==='giorno')    setDataRef(addDays(dataRef,dir));
    if(vista==='settimana') setDataRef(addDays(startOfWeek(dataRef),dir*7));
    if(vista==='mese'){const d=new Date(dataRef+'T12:00');d.setMonth(d.getMonth()+dir);setDataRef(d.toISOString().slice(0,10));}
  };

  const headerLabel=()=>{
    if(vista==='giorno')    return fmtDate(dataRef,{weekday:'short',day:'numeric',month:'long',year:'numeric'});
    if(vista==='settimana'){const s=startOfWeek(dataRef);const e=addDays(s,6);return`${fmtDate(s,{day:'numeric',month:'short'})} – ${fmtDate(e,{day:'numeric',month:'short',year:'numeric'})}`;}
    const d=new Date(dataRef+'T12:00');return`${MESI_IT[d.getMonth()]} ${d.getFullYear()}`;
  };

  const [dragModal,setDragModal] = useState<{id:number;data:string;ora:string}|null>(null);
  const [dragMotivo,setDragMotivo] = useState('');
  const onDrop=(id:number,d:string,o:string)=>{
    setDragModal({id,data:d,ora:o});
    setDragMotivo('');
  };
  const confirmDrop=()=>{
    if(!dragModal)return;
    setEventi(evs=>evs.map(e=>e.id===dragModal.id?{...e,data:dragModal.data,oraInizio:dragModal.ora}:e));
    setDragModal(null);
  };
  const onUpdate=(up:Evento)=>{setEventi(evs=>evs.map(e=>e.id===up.id?up:e));};
  const onToggleTask=(id:number)=>setTasks(ts=>ts.map(t=>t.id===id?{...t,fatto:!t.fatto}:t));

  const d=new Date(dataRef+'T12:00');

  return(
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>

      {/* ── HEADER VETRO SABBIATO ── */}
      <div style={{
        background:'linear-gradient(180deg,rgba(13,31,31,0.98),rgba(13,31,31,0.94))',
        backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(40,160,160,0.15)',
        flexShrink:0,
      }}>
        {/* Tab CALENDARIO / TASK */}
        <div style={{display:'flex',padding:'0 4px'}}>
          {(['calendario','task'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{background:'none',border:'none',color:tab===t?DS.teal:'rgba(139,188,188,0.5)',fontFamily:DS.ui,fontWeight:tab===t?700:400,fontSize:13,padding:'12px 18px',cursor:'pointer',borderBottom:tab===t?`2px solid ${DS.teal}`:'2px solid transparent',position:'relative',letterSpacing:0.5}}>
              {t==='calendario'?'CALENDARIO':'TASK'}
              {t==='task'&&pendenti>0&&<span style={{position:'absolute',top:8,right:6,width:17,height:17,borderRadius:'50%',background:DS.red,color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{pendenti}</span>}
            </button>
          ))}
        </div>

        {/* Controlli calendario */}
        {tab==='calendario'&&(
          <>
            {/* Nav data */}
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px 4px'}}>
              <button onClick={()=>vai(-1)} style={{background:'rgba(40,160,160,0.15)',border:'1px solid rgba(40,160,160,0.25)',borderRadius:8,padding:'7px 10px',cursor:'pointer',display:'flex',alignItems:'center'}}>
                <ChevronLeft size={16} color={DS.teal}/>
              </button>
              <div style={{flex:1,textAlign:'center',fontWeight:700,color:'#F2F1EC',fontSize:13}}>{headerLabel()}</div>
              <button onClick={()=>setDataRef(TODAY)} style={{background:'rgba(40,160,160,0.2)',color:DS.teal,border:'1px solid rgba(40,160,160,0.35)',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:DS.ui}}>Oggi</button>
              <button onClick={()=>vai(1)} style={{background:'rgba(40,160,160,0.15)',border:'1px solid rgba(40,160,160,0.25)',borderRadius:8,padding:'7px 10px',cursor:'pointer',display:'flex',alignItems:'center'}}>
                <ChevronRight size={16} color={DS.teal}/>
              </button>
            </div>
            {/* Vista switcher — 3 pill */}
            <div style={{display:'flex',gap:6,padding:'6px 12px 10px'}}>
              {(['giorno','settimana','mese'] as Vista[]).map(v=>(
                <button key={v} onClick={()=>setVista(v)}
                  style={{flex:1,background:vista===v?DS.teal:'rgba(40,160,160,0.1)',color:vista===v?'#fff':'rgba(139,188,188,0.7)',border:`1px solid ${vista===v?DS.teal:'rgba(40,160,160,0.2)'}`,borderRadius:20,padding:'7px 0',cursor:'pointer',fontSize:12,fontWeight:vista===v?700:400,fontFamily:DS.ui,display:'flex',alignItems:'center',justifyContent:'center',gap:5,boxShadow:vista===v?`0 3px 0 0 ${DS.tealDark}`:'none',transition:'all 120ms'}}>
                  {v==='giorno'&&<Clock size={12}/>}
                  {v==='settimana'&&<List size={12}/>}
                  {v==='mese'&&<LayoutGrid size={12}/>}
                  {v.charAt(0).toUpperCase()+v.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CONTENUTO ── */}
      {tab==='task'?<TaskList tasks={tasks} onToggle={onToggleTask}/>:(
        <div style={{flex:1,display:'flex',flexDirection:'column',background:'#fff',overflow:'hidden'}}>
          {vista==='giorno'    &&<VistaGiorno   data={dataRef}                     eventi={eventi} onOpen={setSelEv} onDrop={onDrop}/>}
          {vista==='settimana' &&<VistaSett      dataInizio={startOfWeek(dataRef)} eventi={eventi} onOpen={setSelEv} onDrop={onDrop}/>}
          {vista==='mese'      &&<VistaMese      anno={d.getFullYear()} mese={d.getMonth()} eventi={eventi} onOpen={setSelEv} onDrop={onDrop}/>}
        </div>
      )}
      {selEv&&<ModalEvento ev={selEv} onClose={()=>setSelEv(null)} onUpdate={(e)=>{onUpdate(e);setSelEv(null);}} onSposta={(e)=>{setSpostaEv(e);setSelEv(null);}} onReport={onOpenReport?ev=>onOpenReport(ev.commessaId||''):undefined}/>}
      {spostaEv&&<SpostaModal ev={spostaEv} onClose={()=>setSpostaEv(null)} onConferma={(id,d,o)=>{setEventi(evs=>evs.map(e=>e.id===id?{...e,data:d,oraInizio:o}:e));setSpostaEv(null);}}/>}
      {dragModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setDragModal(null)}>
          <div style={{background:'#fff',borderRadius:16,padding:20,width:'100%',maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,color:DS.text,fontSize:16,marginBottom:6}}>Sposta appuntamento</div>
            <div style={{color:DS.textMid,fontSize:13,marginBottom:14}}>
              Nuova data: <strong>{dragModal.data}</strong> alle <strong>{dragModal.ora}</strong>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:6}}>Motivo spostamento (opzionale)</label>
              <input value={dragMotivo} onChange={e=>setDragMotivo(e.target.value)} autoFocus
                placeholder="Es. Cliente ha chiesto di rinviare, meteo..."
                style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setDragModal(null)} style={{flex:1,background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:10,padding:'10px',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13,fontFamily:DS.ui}}>Annulla</button>
              <button onClick={confirmDrop} style={{flex:2,background:DS.green,border:'none',borderRadius:10,padding:'10px',cursor:'pointer',color:'#fff',fontWeight:700,fontSize:13,fontFamily:DS.ui,boxShadow:`0 3px 0 0 ${DS.greenDark}`}}>Conferma spostamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
