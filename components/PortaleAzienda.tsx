// @ts-nocheck
// PortaleAzienda.tsx v6 — DESKTOP FULL SaaS
'use client';
import React, { useState, useEffect, useRef } from 'react';

const SB_URL='https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const sb={
  get:async(t,p={})=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}?${new URLSearchParams(p)}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});return r.ok?r.json():[];}catch{return[];}},
  post:async(t,b)=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(b)});return r.ok?r.json():null;}catch{return null;}},
  patch:async(t,id,b)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(b)});}catch{}},
};
const F=`'DM Sans',-apple-system,sans-serif`;const M=`'JetBrains Mono','SF Mono',monospace`;
const C={bg:'#080C14',sb:'#0C1220',sf:'#111827',cd:'#151E2F',cdH:'#1A2740',bd:'#1E293B',bdL:'#283548',teal:'#2DD4BF',tealD:'#14B8A6',tBg:'rgba(45,212,191,0.08)',tBd:'rgba(45,212,191,0.2)',grn:'#34D399',gBg:'rgba(52,211,153,0.1)',amb:'#FBBF24',aBg:'rgba(251,191,36,0.1)',red:'#F87171',rBg:'rgba(248,113,113,0.1)',blu:'#60A5FA',bBg:'rgba(96,165,250,0.1)',pur:'#A78BFA',t1:'#F8FAFC',t2:'#94A3B8',t3:'#475569'};
const ST={nuova:{bg:C.aBg,c:C.amb,l:'In attesa'},vista:{bg:C.bBg,c:C.blu,l:'Presa in carico'},accettata:{bg:C.gBg,c:C.grn,l:'Accettata'},in_corso:{bg:C.tBg,c:C.teal,l:'In lavorazione'},completata:{bg:'rgba(167,139,250,0.1)',c:C.pur,l:'Completata'},rifiutata:{bg:C.rBg,c:C.red,l:'Rifiutata'},annullata:{bg:'rgba(71,85,105,0.1)',c:C.t3,l:'Annullata'}};

// Timeline event icons
const TL_ICONS={stato_cambiato:'\u{1F504}',arrivo_cantiere:'\u{1F4CD}',inizio_lavoro:'\u{1F528}',pausa:'\u23F8',ripresa:'\u25B6',fine_lavoro:'\u2705',foto_caricata:'\u{1F4F7}',firma_cliente:'\u270D\uFE0F',documento_caricato:'\u{1F4C4}',nota:'\u{1F4DD}',problema:'\u26A0\uFE0F',materiale_arrivato:'\u{1F4E6}',ritardo:'\u23F0',completamento_vano:'\u2611\uFE0F',custom:'\u{1F6E0}'};

export default function PortaleAzienda({inviteCode}:{inviteCode:string}){
  const [loading,setLoading]=useState(true);
  const [azienda,setAzienda]=useState(null);
  const [notFound,setNotFound]=useState(false);
  const [freelancers,setFreelancers]=useState([]);
  const [richieste,setRichieste]=useState([]);
  const [page,setPage]=useState('dashboard'); // dashboard|calendario|notifiche|dettaglio|nuovo|marketplace
  const [selFL,setSelFL]=useState(null);
  const [selR,setSelR]=useState(null);
  const [filtro,setFiltro]=useState('tutti');
  const [det,setDet]=useState({montaggi:[],fotoFasi:[],firme:[],fatture:[],costi:[],documenti:[],candidature:[],timeline:[],chat:[],valutazione:null});
  const [search,setSearch]=useState('');
  const [notifiche,setNotifiche]=useState([]);
  const [valutazioni,setValutazioni]=useState([]);
  const [chatMsg,setChatMsg]=useState('');
  const [detTab,setDetTab]=useState('info'); // info|timeline|chat|docs|economia
  const pollRef=useRef(null);
  const chatEndRef=useRef(null);

  useEffect(()=>{
    (async()=>{
      const azRes=await sb.get('aziende_freelance',{invite_code:'eq.'+inviteCode,limit:'1'});
      if(!azRes?.length){setNotFound(true);setLoading(false);return;}
      const az=azRes[0];setAzienda(az);
      const allAz=await sb.get('aziende_freelance',{nome:'eq.'+az.nome,attiva:'eq.true'});
      const ops=[];for(const a of(allAz||[])){const o=await sb.get('operatori',{id:'eq.'+a.operatore_id,limit:'1'});if(o?.[0])ops.push({...o[0],azienda_fl_id:a.id});}
      setFreelancers(ops);
      await loadRL(allAz||[]);
      // Load notifiche
      const azIds=(allAz||[]).map(a=>a.id);
      const allNotif=[];for(const aid of azIds){const n=await sb.get('notifiche_portale',{azienda_fl_id:'eq.'+aid,destinatario:'eq.azienda',order:'created_at.desc',limit:'50'});allNotif.push(...(n||[]));}
      allNotif.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      setNotifiche(allNotif);
      // Load valutazioni
      const allVal=[];for(const op of ops){const v=await sb.get('valutazioni_freelance',{operatore_id:'eq.'+op.id,order:'created_at.desc'});allVal.push(...(v||[]));}
      setValutazioni(allVal);
      setLoading(false);
    })();
    return()=>{if(pollRef.current)clearInterval(pollRef.current);};
  },[inviteCode]);

  useEffect(()=>{
    if(!azienda)return;
    pollRef.current=setInterval(async()=>{const a=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});await loadRL(a||[]);},25000);
    return()=>clearInterval(pollRef.current);
  },[azienda]);

  const loadRL=async(azL)=>{const all=[];for(const a of azL){const r=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+a.id,order:'created_at.desc',limit:'200'});all.push(...(r||[]));}all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setRichieste(all);};

  const openDet=async(r)=>{
    setSelR(r);setPage('dettaglio');setDetTab('info');
    const [docs,fat,cos,tl,ch,val]=await Promise.all([
      sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'}),
      sb.get('fatture_freelance',{richiesta_id:'eq.'+r.id,order:'data_emissione.desc'}),
      sb.get('costi_commessa',{richiesta_id:'eq.'+r.id,order:'data.desc'}),
      sb.get('timeline_eventi',{richiesta_id:'eq.'+r.id,order:'created_at.desc',limit:'50'}),
      sb.get('chat_portale',{richiesta_id:'eq.'+r.id,order:'created_at.asc',limit:'100'}),
      sb.get('valutazioni_freelance',{richiesta_id:'eq.'+r.id,limit:'1'}),
    ]);
    let montaggi=[],fotoFasi=[],firme=[];
    if(r.commessa_id){const [mt,ft,fm]=await Promise.all([sb.get('montaggi',{commessa_id:'eq.'+r.commessa_id,limit:'10'}),sb.get('allegati_vano',{select:'*',limit:'50'}),sb.get('firma_collaudo',{select:'*',limit:'10'})]);montaggi=mt||[];fotoFasi=(ft||[]).filter(f=>f.fase);firme=fm||[];}
    setDet({montaggi,fotoFasi,firme,fatture:fat||[],costi:cos||[],documenti:docs||[],candidature:[],timeline:tl||[],chat:ch||[],valutazione:val?.[0]||null});
  };

  const sendChat=async()=>{
    if(!chatMsg.trim()||!selR)return;
    const msg={richiesta_id:selR.id,mittente_tipo:'azienda',mittente_nome:azienda?.nome||'Azienda',testo:chatMsg.trim()};
    const res=await sb.post('chat_portale',msg);
    if(res){setDet(d=>({...d,chat:[...d.chat,...(Array.isArray(res)?res:[res])]}));setChatMsg('');setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:'smooth'}),100);}
  };

  const gn=(opId)=>{const f=freelancers.find(x=>x.id===opId);return f?`${f.nome} ${f.cognome}`:'—';};
  const rpf=(opId)=>richieste.filter(r=>r.operatore_id===opId);
  const avgRating=(opId)=>{const v=valutazioni.filter(x=>x.operatore_id===opId);return v.length?{avg:(v.reduce((s,x)=>s+x.stelle,0)/v.length).toFixed(1),n:v.length}:{avg:'—',n:0};};

  const kN=richieste.filter(r=>['nuova','vista'].includes(r.stato)).length;
  const kA=richieste.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
  const kC=richieste.filter(r=>r.stato==='completata').length;
  const kB=richieste.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(parseFloat(r.budget)||0),0);
  const kR=richieste.filter(r=>r.stato==='rifiutata').length;
  const unreadNotif=notifiche.filter(n=>!n.letta).length;

  let filtered=richieste;
  if(filtro==='attivi')filtered=richieste.filter(r=>['nuova','vista','accettata','in_corso'].includes(r.stato));
  else if(filtro==='completati')filtered=richieste.filter(r=>r.stato==='completata');
  else if(filtro==='rifiutati')filtered=richieste.filter(r=>r.stato==='rifiutata');
  if(selFL)filtered=filtered.filter(r=>r.operatore_id===selFL.id);
  if(search)filtered=filtered.filter(r=>(r.cliente+r.indirizzo+(r.note||'')).toLowerCase().includes(search.toLowerCase()));

  if(loading)return<Sh><Css/><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div style={{width:48,height:48,borderRadius:'50%',border:`3px solid ${C.bd}`,borderTopColor:C.teal,animation:'spin 1s linear infinite'}}/></div></Sh>;
  if(notFound)return<Sh><Css/><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:C.t1,fontWeight:700,fontSize:20}}>Link non valido</div></Sh>;

  return(
    <div style={{display:'flex',height:'100vh',background:C.bg,fontFamily:F,overflow:'hidden'}}><Css/>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{width:250,background:C.sb,borderRight:`1px solid ${C.bd}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'18px 16px 14px',borderBottom:`1px solid ${C.bd}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${azienda?.colore||C.teal},${C.tealD})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff'}}>{(azienda?.nome||'?')[0]}</div>
            <div><div style={{color:C.t1,fontWeight:700,fontSize:13}}>{azienda?.nome}</div><div style={{color:C.t3,fontSize:10}}>{freelancers.length} serramentisti</div></div>
          </div>
        </div>

        <div style={{padding:'8px 8px',flex:1,overflowY:'auto'}}>
          <NB a={page==='dashboard'&&!selFL} o={()=>{setPage('dashboard');setSelFL(null);setSelR(null);}} i="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" l="Dashboard" b={kN>0?kN:null}/>
          <NB a={page==='calendario'} o={()=>setPage('calendario')} i="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" l="Calendario"/>
          <NB a={page==='notifiche'} o={()=>setPage('notifiche')} i="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" l="Notifiche" b={unreadNotif>0?unreadNotif:null}/>
          <NB a={page==='nuovo'} o={()=>setPage('nuovo')} i="M12 4v16m8-8H4" l="Nuovo lavoro"/>
          <NB a={page==='marketplace'} o={()=>setPage('marketplace')} i="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9" l="Marketplace"/>

          <div style={{fontSize:9,color:C.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.1em',padding:'14px 8px 6px'}}>Serramentisti</div>
          {freelancers.map(f=>{
            const fA=rpf(f.id).filter(r=>['accettata','in_corso'].includes(r.stato)).length;
            const rt=avgRating(f.id);
            return(
              <button key={f.id} onClick={()=>{setSelFL(selFL?.id===f.id?null:f);setPage('dashboard');setSelR(null);}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:7,border:'none',cursor:'pointer',marginBottom:1,background:selFL?.id===f.id?C.tBg:'transparent'}}>
                <div style={{width:26,height:26,borderRadius:7,background:selFL?.id===f.id?`${C.teal}33`:C.cd,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:selFL?.id===f.id?C.teal:C.t2,flexShrink:0}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                <div style={{flex:1,textAlign:'left',minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:selFL?.id===f.id?700:500,color:selFL?.id===f.id?C.teal:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nome} {f.cognome}</div>
                  {rt.n>0&&<div style={{fontSize:9,color:C.amb}}>{'\u2605'.repeat(Math.round(parseFloat(rt.avg)))} {rt.avg}</div>}
                </div>
                {fA>0&&<div style={{background:C.tBg,color:C.teal,borderRadius:5,padding:'1px 5px',fontSize:9,fontWeight:700}}>{fA}</div>}
              </button>
            );
          })}
        </div>
        <div style={{padding:'10px 14px',borderTop:`1px solid ${C.bd}`,fontSize:9,color:C.t3,textAlign:'center'}}>Powered by <span style={{color:C.teal,fontWeight:700}}>MASTRO</span></div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* TOPBAR */}
        <div style={{padding:'10px 20px',borderBottom:`1px solid ${C.bd}`,display:'flex',alignItems:'center',gap:14,flexShrink:0,background:C.sf}}>
          {page==='dettaglio'&&<button onClick={()=>{setPage('dashboard');setSelR(null);}} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:8,width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t2} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>}
          <div style={{flex:1}}><div style={{fontSize:16,fontWeight:800,color:C.t1}}>{page==='calendario'?'Calendario':page==='notifiche'?'Notifiche':page==='dettaglio'&&selR?selR.cliente:selFL?`${selFL.nome} ${selFL.cognome}`:'Dashboard'}</div></div>
          <div style={{position:'relative',width:260}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" style={{position:'absolute',left:10,top:9}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..." style={{width:'100%',background:C.cd,border:`1px solid ${C.bd}`,borderRadius:7,padding:'7px 10px 7px 32',fontSize:12,color:C.t1,fontFamily:F,outline:'none',boxSizing:'border-box'}}/>
          </div>
          {selFL&&<button onClick={()=>setSelFL(null)} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:7,padding:'6px 12px',fontSize:11,color:C.t2,cursor:'pointer'}}>Tutti</button>}
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflowY:'auto',padding:20}}>

          {/* ═══ DASHBOARD ═══ */}
          {page==='dashboard'&&<>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
              {[{n:kN,l:'In attesa',c:C.amb,bg:C.aBg},{n:kA,l:'Attivi',c:C.blu,bg:C.bBg},{n:kC,l:'Completati',c:C.grn,bg:C.gBg},{n:kR,l:'Rifiutati',c:C.red,bg:C.rBg},{n:kB,l:'Volume totale',c:C.teal,bg:C.tBg,cur:1}].map((k,i)=>(
                <div key={i} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:'16px 14px'}}>
                  <div style={{fontFamily:M,fontWeight:700,fontSize:k.cur?16:24,color:C.t1}}>{k.cur?'\u20AC'+k.n.toLocaleString('it-IT',{maximumFractionDigits:0}):k.n}</div>
                  <div style={{fontSize:10,color:C.t3,fontWeight:500,marginTop:3,textTransform:'uppercase',letterSpacing:'.06em'}}>{k.l}</div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:6,marginBottom:14}}>
              {[{k:'tutti',l:'Tutti',n:richieste.length},{k:'attivi',l:'Attivi',n:kA+kN},{k:'completati',l:'Completati',n:kC},{k:'rifiutati',l:'Rifiutati',n:kR}].map(f=>(
                <button key={f.k} onClick={()=>setFiltro(f.k)} style={{background:filtro===f.k?C.tBg:'transparent',color:filtro===f.k?C.teal:C.t3,border:`1px solid ${filtro===f.k?C.tBd:C.bd}`,borderRadius:7,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer'}}>{f.l} ({f.n})</button>
              ))}
            </div>

            {/* TABLE */}
            <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1.2fr 60px 90px 80px 110px',padding:'8px 14px',borderBottom:`1px solid ${C.bd}`,background:C.sf}}>
                {['Cliente','Indirizzo','Serramentista','Vani','Budget','Data','Stato'].map(h=><div key={h} style={{fontSize:9,color:C.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em'}}>{h}</div>)}
              </div>
              {filtered.length===0?<div style={{padding:'30px 14px',textAlign:'center',color:C.t3,fontSize:13}}>Nessun lavoro</div>:
              filtered.map(r=>{
                const st=ST[r.stato]||ST.nuova;const nV=(r.vani_json||[]).length;
                return(
                  <div key={r.id} onClick={()=>openDet(r)} style={{display:'grid',gridTemplateColumns:'2fr 2fr 1.2fr 60px 90px 80px 110px',padding:'10px 14px',borderBottom:`1px solid ${C.bd}`,cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.cdH} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div><span style={{fontSize:12,fontWeight:600,color:C.t1}}>{r.cliente}</span>{r.urgente&&<span style={{fontSize:8,fontWeight:700,color:C.red,marginLeft:4}}>URG</span>}{r.tipo_invio==='marketplace'&&<span style={{fontSize:8,fontWeight:700,color:C.pur,marginLeft:4}}>MKT</span>}</div>
                    <div style={{fontSize:11,color:C.t3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.indirizzo}</div>
                    <div style={{fontSize:11,color:C.t2}}>{gn(r.operatore_id)}</div>
                    <div style={{fontFamily:M,fontSize:11,color:C.t2}}>{nV}</div>
                    <div style={{fontFamily:M,fontSize:11,color:C.teal,fontWeight:600}}>{r.budget?'\u20AC'+parseFloat(r.budget).toLocaleString('it-IT'):'—'}</div>
                    <div style={{fontSize:10,color:C.t3}}>{r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'—'}</div>
                    <div><span style={{display:'inline-flex',alignItems:'center',gap:3,background:st.bg,borderRadius:5,padding:'2px 8px'}}><div style={{width:5,height:5,borderRadius:'50%',background:st.c}}/><span style={{fontSize:9,fontWeight:600,color:st.c}}>{st.l}</span></span></div>
                  </div>
                );
              })}
            </div>
          </>}

          {/* ═══ CALENDARIO ═══ */}
          {page==='calendario'&&(()=>{
            const [calView,setCalView]=React.useState('mese'); // mese|settimana
            const [calDate,setCalDate]=React.useState(new Date());
            const oggi=new Date();const oggiStr=oggi.toISOString().slice(0,10);

            // Colors per serramentista (stable hash)
            const FL_COLORS=['#2DD4BF','#60A5FA','#A78BFA','#F87171','#FBBF24','#34D399','#F472B6','#38BDF8','#818CF8','#FB923C','#4ADE80'];
            const flColor=(opId)=>{const idx=freelancers.findIndex(f=>f.id===opId);return FL_COLORS[idx%FL_COLORS.length];};

            // Mese navigation
            const prevMonth=()=>{const d=new Date(calDate);d.setMonth(d.getMonth()-1);setCalDate(d);};
            const nextMonth=()=>{const d=new Date(calDate);d.setMonth(d.getMonth()+1);setCalDate(d);};
            const goToday=()=>setCalDate(new Date());

            // Genera griglia mese
            const year=calDate.getFullYear();const month=calDate.getMonth();
            const firstDay=new Date(year,month,1);
            const lastDay=new Date(year,month+1,0);
            const startOffset=(firstDay.getDay()+6)%7; // Lunedì = 0
            const totalDays=lastDay.getDate();
            const gridDays=[];
            // Giorni mese precedente
            const prevMonthLast=new Date(year,month,0).getDate();
            for(let i=startOffset-1;i>=0;i--) gridDays.push({day:prevMonthLast-i,month:month-1,year,isOtherMonth:true});
            // Giorni mese corrente
            for(let i=1;i<=totalDays;i++) gridDays.push({day:i,month,year,isOtherMonth:false});
            // Giorni mese successivo
            const remaining=42-gridDays.length;
            for(let i=1;i<=remaining;i++) gridDays.push({day:i,month:month+1,year,isOtherMonth:true});

            const monthName=calDate.toLocaleDateString('it-IT',{month:'long',year:'numeric'});

            // Week view
            const weekStart=new Date(calDate);weekStart.setDate(weekStart.getDate()-((weekStart.getDay()+6)%7));
            const weekDays=Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(d.getDate()+i);return d;});
            const hours=Array.from({length:12},(_,i)=>7+i); // 7:00 - 18:00

            // Stats sidebar
            const thisMonthRL=richieste.filter(r=>{if(!r.data_preferita)return false;const d=new Date(r.data_preferita);return d.getMonth()===month&&d.getFullYear()===year;});
            const monthByFL=freelancers.map(f=>({...f,count:thisMonthRL.filter(r=>r.operatore_id===f.id).length})).filter(f=>f.count>0).sort((a,b)=>b.count-a.count);

            const [hoverEvent,setHoverEvent]=React.useState(null);
            const [hoverPos,setHoverPos]=React.useState({x:0,y:0});

            return(
              <div style={{display:'grid',gridTemplateColumns:'1fr 240px',gap:16,height:'calc(100vh - 80px)'}}>
                {/* MAIN CALENDAR */}
                <div style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
                  {/* Header */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexShrink:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{display:'flex',gap:2}}>
                        <button onClick={prevMonth} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:'8px 0 0 8px',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t2} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button onClick={nextMonth} style={{background:C.cd,border:`1px solid ${C.bd}`,borderLeft:'none',borderRadius:'0 8px 8px 0',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t2} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                      <div style={{fontSize:20,fontWeight:800,color:C.t1,textTransform:'capitalize'}}>{monthName}</div>
                      <button onClick={goToday} style={{background:C.tBg,border:`1px solid ${C.tBd}`,borderRadius:8,padding:'6px 14px',fontSize:11,fontWeight:700,color:C.teal,cursor:'pointer'}}>Oggi</button>
                    </div>
                    <div style={{display:'flex',gap:2}}>
                      {['mese','settimana'].map(v=>(
                        <button key={v} onClick={()=>setCalView(v)} style={{background:calView===v?C.tBg:'transparent',color:calView===v?C.teal:C.t3,border:`1px solid ${calView===v?C.tBd:C.bd}`,borderRadius:8,padding:'6px 14px',fontSize:11,fontWeight:600,cursor:'pointer',textTransform:'capitalize'}}>{v}</button>
                      ))}
                    </div>
                  </div>

                  {/* MONTH VIEW */}
                  {calView==='mese'&&<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                    {/* Day headers */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,marginBottom:4}}>
                      {['LUN','MAR','MER','GIO','VEN','SAB','DOM'].map((d,i)=>(
                        <div key={d} style={{fontSize:10,color:i>=5?C.amb:C.t3,fontWeight:700,textAlign:'center',padding:'6px 0',letterSpacing:'.1em'}}>{d}</div>
                      ))}
                    </div>
                    {/* Grid */}
                    <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(7,1fr)',gridTemplateRows:'repeat(6,1fr)',gap:1}}>
                      {gridDays.map((gd,i)=>{
                        const actualMonth=gd.month<0?gd.month+12:gd.month>11?gd.month-12:gd.month;
                        const actualYear=gd.month<0?gd.year-1:gd.month>11?gd.year+1:gd.year;
                        const ds=`${actualYear}-${String(actualMonth+1).padStart(2,'0')}-${String(gd.day).padStart(2,'0')}`;
                        const dayRL=(selFL?richieste.filter(r=>r.operatore_id===selFL.id):richieste).filter(r=>r.data_preferita===ds);
                        const isToday=ds===oggiStr;
                        const isWeekend=i%7>=5;
                        return(
                          <div key={i} style={{background:isToday?`${C.teal}11`:gd.isOtherMonth?C.bg:isWeekend?`${C.cd}88`:C.cd,border:`1px solid ${isToday?C.tBd:C.bd}`,borderRadius:6,padding:'4px 6px',overflow:'hidden',minHeight:0,display:'flex',flexDirection:'column'}}>
                            <div style={{fontSize:12,fontWeight:isToday?800:gd.isOtherMonth?400:600,color:isToday?C.teal:gd.isOtherMonth?C.t3:C.t1,marginBottom:3,display:'flex',alignItems:'center',gap:4}}>
                              {isToday&&<div style={{width:5,height:5,borderRadius:'50%',background:C.teal}}/>}
                              {gd.day}
                            </div>
                            <div style={{flex:1,overflow:'auto',display:'flex',flexDirection:'column',gap:2}}>
                              {dayRL.slice(0,3).map(r=>{
                                const st=ST[r.stato]||ST.nuova;const fc=flColor(r.operatore_id);
                                return(
                                  <div key={r.id} onClick={(e)=>{e.stopPropagation();openDet(r);}}
                                    onMouseEnter={(e)=>{setHoverEvent(r);setHoverPos({x:e.clientX,y:e.clientY});}}
                                    onMouseLeave={()=>setHoverEvent(null)}
                                    style={{background:`${fc}15`,borderLeft:`3px solid ${fc}`,borderRadius:'0 4px 4px 0',padding:'2px 5px',cursor:'pointer',transition:'.1s'}}>
                                    <div style={{fontSize:10,fontWeight:600,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.cliente}</div>
                                    <div style={{fontSize:8,color:fc,fontWeight:600}}>{gn(r.operatore_id).split(' ')[0]}</div>
                                  </div>
                                );
                              })}
                              {dayRL.length>3&&<div style={{fontSize:9,color:C.teal,fontWeight:700,textAlign:'center'}}>+{dayRL.length-3} altri</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>}

                  {/* WEEK VIEW */}
                  {calView==='settimana'&&<div style={{flex:1,overflow:'auto'}}>
                    <div style={{display:'grid',gridTemplateColumns:'50px repeat(7,1fr)',gap:0}}>
                      {/* Header */}
                      <div style={{borderBottom:`1px solid ${C.bd}`,padding:4}}/>
                      {weekDays.map((d,i)=>{
                        const ds=d.toISOString().slice(0,10);const isT=ds===oggiStr;
                        return(
                          <div key={i} style={{borderBottom:`1px solid ${C.bd}`,borderLeft:`1px solid ${C.bd}`,padding:'8px 6px',textAlign:'center',background:isT?`${C.teal}08`:'transparent'}}>
                            <div style={{fontSize:10,color:i>=5?C.amb:C.t3,fontWeight:600,textTransform:'uppercase'}}>{d.toLocaleDateString('it-IT',{weekday:'short'})}</div>
                            <div style={{fontSize:18,fontWeight:isT?800:600,color:isT?C.teal:C.t1}}>{d.getDate()}</div>
                          </div>
                        );
                      })}
                      {/* Time slots */}
                      {hours.map(h=><React.Fragment key={h}>
                        <div style={{padding:'4px 6px',fontSize:10,color:C.t3,fontFamily:M,borderBottom:`1px solid ${C.bd}`,textAlign:'right'}}>{String(h).padStart(2,'0')}:00</div>
                        {weekDays.map((d,di)=>{
                          const ds=d.toISOString().slice(0,10);
                          const dayRL=(selFL?richieste.filter(r=>r.operatore_id===selFL.id):richieste).filter(r=>r.data_preferita===ds);
                          // Show events at their preferred hour, or spread them
                          const eventsThisHour=dayRL.filter(r=>{
                            const oh=r.ora_preferita?parseInt(r.ora_preferita.slice(0,2)):8;
                            return oh===h;
                          });
                          return(
                            <div key={di} style={{borderBottom:`1px solid ${C.bd}`,borderLeft:`1px solid ${C.bd}`,padding:2,minHeight:40,background:ds===oggiStr?`${C.teal}05`:'transparent'}}>
                              {eventsThisHour.map(r=>{
                                const fc=flColor(r.operatore_id);const st=ST[r.stato]||ST.nuova;
                                return(
                                  <div key={r.id} onClick={()=>openDet(r)}
                                    onMouseEnter={(e)=>{setHoverEvent(r);setHoverPos({x:e.clientX,y:e.clientY});}}
                                    onMouseLeave={()=>setHoverEvent(null)}
                                    style={{background:`${fc}20`,border:`1px solid ${fc}44`,borderLeft:`3px solid ${fc}`,borderRadius:4,padding:'3px 6px',marginBottom:2,cursor:'pointer'}}>
                                    <div style={{fontSize:10,fontWeight:600,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.cliente}</div>
                                    <div style={{fontSize:8,color:fc}}>{gn(r.operatore_id).split(' ')[0]} · {(r.vani_json||[]).length}v</div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </React.Fragment>)}
                    </div>
                  </div>}
                </div>

                {/* RIGHT SIDEBAR — stats */}
                <div style={{borderLeft:`1px solid ${C.bd}`,paddingLeft:16,overflowY:'auto'}}>
                  {/* Month summary */}
                  <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:14,marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Questo mese</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <div style={{background:C.sf,borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                        <div style={{fontFamily:M,fontWeight:700,fontSize:22,color:C.t1}}>{thisMonthRL.length}</div>
                        <div style={{fontSize:9,color:C.t3}}>Lavori</div>
                      </div>
                      <div style={{background:C.sf,borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                        <div style={{fontFamily:M,fontWeight:700,fontSize:16,color:C.teal}}>{'\u20AC'}{thisMonthRL.reduce((s,r)=>s+(parseFloat(r.budget)||0),0).toLocaleString('it-IT',{maximumFractionDigits:0})}</div>
                        <div style={{fontSize:9,color:C.t3}}>Volume</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:8}}>
                      {[
                        {l:'Attesa',n:thisMonthRL.filter(r=>['nuova','vista'].includes(r.stato)).length,c:C.amb},
                        {l:'Attivi',n:thisMonthRL.filter(r=>['accettata','in_corso'].includes(r.stato)).length,c:C.blu},
                        {l:'Fatti',n:thisMonthRL.filter(r=>r.stato==='completata').length,c:C.grn},
                      ].map(k=>(
                        <div key={k.l} style={{textAlign:'center'}}>
                          <div style={{fontFamily:M,fontWeight:700,fontSize:16,color:k.c}}>{k.n}</div>
                          <div style={{fontSize:8,color:C.t3}}>{k.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Per serramentista */}
                  <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:14,marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Per serramentista</div>
                    {monthByFL.length===0?<div style={{fontSize:11,color:C.t3,padding:'8px 0'}}>Nessun lavoro questo mese</div>:
                    monthByFL.map(f=>{
                      const fc=flColor(f.id);
                      return(
                        <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${C.bd}`}}>
                          <div style={{width:4,height:24,borderRadius:2,background:fc}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:600,color:C.t1}}>{f.nome} {f.cognome}</div>
                          </div>
                          <div style={{fontFamily:M,fontWeight:700,fontSize:13,color:fc}}>{f.count}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legenda colori */}
                  <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:14}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Legenda stati</div>
                    {Object.entries(ST).filter(([k])=>k!=='annullata').map(([k,v])=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0'}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:v.c}}/>
                        <span style={{fontSize:11,color:C.t2}}>{v.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HOVER TOOLTIP */}
                {hoverEvent&&(()=>{
                  const r=hoverEvent;const st=ST[r.stato]||ST.nuova;const nV=(r.vani_json||[]).length;
                  return(
                    <div style={{position:'fixed',left:hoverPos.x+16,top:hoverPos.y-10,background:C.sf,border:`1px solid ${C.bd}`,borderRadius:12,padding:'14px 16px',zIndex:1000,boxShadow:'0 8px 32px rgba(0,0,0,.5)',maxWidth:300,pointerEvents:'none'}}>
                      <div style={{fontWeight:700,fontSize:14,color:C.t1,marginBottom:4}}>{r.cliente}</div>
                      <div style={{fontSize:11,color:C.t2,marginBottom:6}}>{r.indirizzo}</div>
                      <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:6}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:3,background:st.bg,borderRadius:5,padding:'2px 8px'}}><div style={{width:5,height:5,borderRadius:'50%',background:st.c}}/><span style={{fontSize:10,fontWeight:600,color:st.c}}>{st.l}</span></span>
                        {r.urgente&&<span style={{fontSize:9,fontWeight:700,color:C.red}}>URGENTE</span>}
                      </div>
                      <div style={{display:'flex',gap:12,fontSize:11,color:C.t3}}>
                        <span>{nV} vani</span>
                        {r.budget&&<span style={{color:C.teal,fontWeight:600}}>{'\u20AC'}{parseFloat(r.budget).toLocaleString('it-IT')}</span>}
                        <span>{gn(r.operatore_id)}</span>
                      </div>
                      {r.note&&<div style={{fontSize:10,color:C.t3,marginTop:6,lineHeight:1.3,maxHeight:40,overflow:'hidden'}}>{r.note}</div>}
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {/* ═══ NOTIFICHE ═══ */}
          {page==='notifiche'&&<div style={{maxWidth:700}}>
            {notifiche.length===0?<div style={{padding:40,textAlign:'center',color:C.t3}}>Nessuna notifica</div>:
            notifiche.map(n=>(
              <div key={n.id} style={{display:'flex',gap:12,padding:'12px 16px',background:n.letta?'transparent':C.tBg,borderRadius:10,marginBottom:6,border:`1px solid ${n.letta?C.bd:C.tBd}`}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:n.letta?'transparent':C.teal,flexShrink:0,marginTop:6}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:n.letta?500:700,color:C.t1}}>{n.titolo}</div>
                  {n.corpo&&<div style={{fontSize:12,color:C.t2,marginTop:2}}>{n.corpo}</div>}
                  <div style={{fontSize:10,color:C.t3,marginTop:4}}>{new Date(n.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
          </div>}

          {/* ═══ DETTAGLIO ═══ */}
          {page==='dettaglio'&&selR&&(()=>{
            const r=selR;const st=ST[r.stato]||ST.nuova;
            const vani=r.vani_json||[];
            const {montaggi,fotoFasi,firme,fatture,costi,documenti,timeline,chat,valutazione}=det;
            const mt=montaggi[0];const firma=firme[0];
            const totC=costi.reduce((s,c)=>s+(parseFloat(c.totale)||parseFloat(c.importo)||0),0);
            const totF=fatture.reduce((s,f)=>s+(parseFloat(f.totale)||parseFloat(f.importo)||0),0);
            const totP=fatture.filter(f=>f.stato==='pagata').reduce((s,f)=>s+(parseFloat(f.totale)||parseFloat(f.importo)||0),0);
            const unreadChat=chat.filter(m=>m.mittente_tipo==='freelance'&&!m.letto).length;

            return(
              <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:16,height:'calc(100vh - 80px)'}}>
                {/* LEFT */}
                <div style={{overflowY:'auto',paddingRight:4}}>
                  {/* Header */}
                  <div style={{background:`linear-gradient(135deg,${C.cd},${st.bg})`,border:`1px solid ${st.c}22`,borderRadius:14,padding:20,marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={{fontSize:22,fontWeight:800,color:C.t1,letterSpacing:'-.02em'}}>{r.cliente}</div>
                        <div style={{fontSize:13,color:C.t2,marginTop:4}}>{r.indirizzo}{r.telefono_cliente?` \u2022 ${r.telefono_cliente}`:''}</div>
                        <div style={{fontSize:11,color:C.teal,marginTop:4,fontWeight:600}}>Assegnato: {gn(r.operatore_id)}</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,background:st.bg,border:`1px solid ${st.c}33`,borderRadius:8,padding:'5px 12px'}}><div style={{width:7,height:7,borderRadius:'50%',background:st.c}}/><span style={{fontSize:12,fontWeight:700,color:st.c}}>{st.l}</span></span>
                        {r.urgente&&<span style={{fontSize:10,fontWeight:700,color:C.red,background:C.rBg,borderRadius:5,padding:'2px 8px'}}>URGENTE</span>}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:3,marginTop:12}}>{['nuova','accettata','in_corso','completata'].map((s,i)=>{const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);return<div key={s} style={{flex:1,height:3,borderRadius:2,background:idx>=i?C.teal:`${C.t3}33`}}/>;})}</div>
                  </div>

                  {/* TABS */}
                  <div style={{display:'flex',gap:2,marginBottom:14,background:C.cd,borderRadius:10,padding:3,border:`1px solid ${C.bd}`}}>
                    {[{k:'info',l:'Dettagli'},{k:'timeline',l:`Timeline (${timeline.length})`},{k:'chat',l:`Chat${unreadChat>0?' ('+unreadChat+')':''}`},{k:'docs',l:`Documenti (${documenti.length})`},{k:'economia',l:'Economia'}].map(t=>(
                      <button key={t.k} onClick={()=>setDetTab(t.k)} style={{flex:1,background:detTab===t.k?C.tBg:'transparent',color:detTab===t.k?C.teal:C.t3,border:'none',borderRadius:8,padding:'7px 4px',fontSize:11,fontWeight:detTab===t.k?700:500,cursor:'pointer'}}>{t.l}</button>
                    ))}
                  </div>

                  {/* TAB: INFO */}
                  {detTab==='info'&&<>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:14}}>
                      {[{l:'Data',v:r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'N/D'},{l:'Ora',v:r.ora_preferita?.slice(0,5)||'N/D'},{l:'Budget',v:r.budget?`\u20AC${parseFloat(r.budget).toLocaleString('it-IT')}`:'N/D'},{l:'Vani',v:`${vani.length}`}].map((d,i)=>(
                        <div key={i} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:'10px 12px'}}><div style={{fontSize:9,color:C.t3,fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em'}}>{d.l}</div><div style={{fontSize:14,fontWeight:700,color:C.t1,marginTop:2}}>{d.v}</div></div>
                      ))}
                    </div>
                    {r.note&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:'12px 16px',marginBottom:14}}><div style={{fontSize:9,color:C.t3,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Note</div><div style={{fontSize:13,color:C.t2,lineHeight:1.5}}>{r.note}</div></div>}
                    {vani.length>0&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,overflow:'hidden',marginBottom:14}}>
                      <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.bd}`,fontSize:11,fontWeight:700,color:C.t1}}>Vani ({vani.length})</div>
                      <div style={{display:'grid',gridTemplateColumns:'36px 1fr 1fr 1fr 1fr 1fr',padding:'6px 14px',borderBottom:`1px solid ${C.bd}`,background:C.sf}}>
                        {['#','Tipo','Materiale','Misure','Stanza','Piano'].map(h=><div key={h} style={{fontSize:8,color:C.t3,fontWeight:600,textTransform:'uppercase'}}>{h}</div>)}
                      </div>
                      {vani.map((v,i)=>(
                        <div key={i} style={{display:'grid',gridTemplateColumns:'36px 1fr 1fr 1fr 1fr 1fr',padding:'8px 14px',borderBottom:`1px solid ${C.bd}`}}>
                          <div style={{fontSize:11,color:C.t3,fontFamily:M}}>{i+1}</div>
                          <div style={{fontSize:11,color:C.t1,fontWeight:600}}>{v.tipo}</div>
                          <div><span style={{fontSize:10,color:C.teal,fontWeight:600,background:C.tBg,borderRadius:3,padding:'1px 6px'}}>{v.materiale}</span></div>
                          <div style={{fontFamily:M,fontSize:11,color:C.t2}}>{v.larghezza&&v.altezza?`${v.larghezza}\u00D7${v.altezza}`:'\u2014'}</div>
                          <div style={{fontSize:11,color:C.t3}}>{v.stanza||'\u2014'}</div>
                          <div style={{fontSize:11,color:C.t3}}>{v.piano||'\u2014'}</div>
                        </div>
                      ))}
                    </div>}
                    {fotoFasi.length>0&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:14,marginBottom:14}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.t1,marginBottom:10}}>Foto fasi</div>
                      {['prima','durante','dopo'].map(fase=>{const fotos=fotoFasi.filter(f=>f.fase===fase);if(!fotos.length)return null;return<div key={fase} style={{marginBottom:10}}><div style={{fontSize:9,fontWeight:700,color:C.teal,textTransform:'uppercase',marginBottom:6}}>{fase} ({fotos.length})</div><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>{fotos.map((f,i)=><img key={i} src={f.file_url||f.url} alt="" style={{width:'100%',height:70,objectFit:'cover',borderRadius:6,border:`1px solid ${C.bd}`}}/>)}</div></div>;})}
                    </div>}
                    {firma&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:14,marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:C.t1,marginBottom:8}}>Firma collaudo</div><img src={firma.firma_url} alt="" style={{maxWidth:'100%',maxHeight:100,border:`1px solid ${C.bd}`,borderRadius:6}}/><div style={{fontSize:10,color:C.t3,marginTop:4}}>Firmato da {firma.firmato_da}</div></div>}
                    {valutazione&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:14}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.t1,marginBottom:8}}>Valutazione</div>
                      <div style={{fontSize:20,color:C.amb,marginBottom:6}}>{'\u2605'.repeat(valutazione.stelle)}{'\u2606'.repeat(5-valutazione.stelle)}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:8}}>
                        {[{l:'Puntualità',v:valutazione.puntualita},{l:'Qualità',v:valutazione.qualita},{l:'Comunicazione',v:valutazione.comunicazione},{l:'Pulizia',v:valutazione.pulizia}].map(k=>k.v&&<div key={k.l} style={{textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:C.amb}}>{k.v}/5</div><div style={{fontSize:9,color:C.t3}}>{k.l}</div></div>)}
                      </div>
                      {valutazione.commento&&<div style={{fontSize:12,color:C.t2,fontStyle:'italic',lineHeight:1.4}}>"{valutazione.commento}"</div>}
                    </div>}
                  </>}

                  {/* TAB: TIMELINE */}
                  {detTab==='timeline'&&<div>
                    {timeline.length===0?<div style={{padding:30,textAlign:'center',color:C.t3}}>Nessun evento</div>:
                    timeline.map((ev,i)=>(
                      <div key={ev.id} style={{display:'flex',gap:12,marginBottom:0}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0,width:20}}>
                          <div style={{width:10,height:10,borderRadius:'50%',background:i===0?C.teal:C.bd,flexShrink:0}}/>
                          {i<timeline.length-1&&<div style={{width:2,flex:1,background:C.bd}}/>}
                        </div>
                        <div style={{paddingBottom:16}}>
                          <div style={{fontSize:12,fontWeight:600,color:C.t1}}>{TL_ICONS[ev.tipo]||'\u2022'} {ev.titolo}</div>
                          {ev.descrizione&&<div style={{fontSize:11,color:C.t3,marginTop:2}}>{ev.descrizione}</div>}
                          <div style={{fontSize:10,color:C.t3,marginTop:3}}>{new Date(ev.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                        </div>
                      </div>
                    ))}
                  </div>}

                  {/* TAB: CHAT */}
                  {detTab==='chat'&&<div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 280px)'}}>
                    <div style={{flex:1,overflowY:'auto',padding:'0 4px'}}>
                      {chat.length===0?<div style={{padding:30,textAlign:'center',color:C.t3}}>Nessun messaggio. Scrivi per primo.</div>:
                      chat.map((m,i)=>(
                        <div key={m.id||i} style={{display:'flex',justifyContent:m.mittente_tipo==='azienda'?'flex-end':'flex-start',marginBottom:8}}>
                          <div style={{maxWidth:'70%'}}>
                            <div style={{fontSize:9,color:C.t3,marginBottom:2,textAlign:m.mittente_tipo==='azienda'?'right':'left'}}>{m.mittente_nome} · {new Date(m.created_at).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</div>
                            <div style={{background:m.mittente_tipo==='azienda'?C.teal:C.cd,color:m.mittente_tipo==='azienda'?'#000':C.t1,borderRadius:m.mittente_tipo==='azienda'?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'8px 12px',fontSize:13,lineHeight:1.4,border:m.mittente_tipo==='azienda'?'none':`1px solid ${C.bd}`}}>{m.testo}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef}/>
                    </div>
                    <div style={{display:'flex',gap:8,paddingTop:10}}>
                      <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Scrivi un messaggio..."
                        style={{flex:1,background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:'10px 14px',fontSize:13,color:C.t1,fontFamily:F,outline:'none',boxSizing:'border-box'}}/>
                      <button onClick={sendChat} disabled={!chatMsg.trim()} style={{background:C.teal,border:'none',borderRadius:10,padding:'0 20px',cursor:'pointer',fontSize:13,fontWeight:700,color:'#000',opacity:chatMsg.trim()?1:.4}}>Invia</button>
                    </div>
                  </div>}

                  {/* TAB: DOCS */}
                  {detTab==='docs'&&<div>
                    {documenti.length===0?<div style={{padding:30,textAlign:'center',color:C.t3}}>Nessun documento</div>:
                    documenti.map(d=>(
                      <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:10,background:C.cd,border:`1px solid ${C.bd}`,borderRadius:8,padding:'10px 14px',marginBottom:6,textDecoration:'none'}}>
                        <div style={{width:28,height:28,borderRadius:7,background:d.caricato_da==='azienda'?C.bBg:C.gBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.caricato_da==='azienda'?C.blu:C.grn} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.t1}}>{d.nome}</div><div style={{fontSize:10,color:C.t3}}>{d.tipo} · {d.caricato_da} · {new Date(d.created_at).toLocaleDateString('it-IT')}</div></div>
                      </a>
                    ))}
                  </div>}

                  {/* TAB: ECONOMIA */}
                  {detTab==='economia'&&<>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:14}}>
                      {[{l:'Budget',v:`\u20AC${parseFloat(r.budget||0).toLocaleString('it-IT')}`,c:C.t1},{l:'Costi',v:`\u20AC${totC.toFixed(0)}`,c:totC>(parseFloat(r.budget)||0)?C.red:C.grn},{l:'Fatturato',v:`\u20AC${totF.toFixed(0)}`,c:C.teal},{l:'Da pagare',v:`\u20AC${(totF-totP).toFixed(0)}`,c:(totF-totP)>0?C.amb:C.grn}].map((k,i)=>(
                        <div key={i} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:'12px',textAlign:'center'}}><div style={{fontFamily:M,fontWeight:700,fontSize:18,color:k.c}}>{k.v}</div><div style={{fontSize:9,color:C.t3,marginTop:2}}>{k.l}</div></div>
                      ))}
                    </div>
                    {fatture.length>0&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,overflow:'hidden',marginBottom:14}}>
                      <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.bd}`,fontSize:11,fontWeight:700,color:C.t1}}>Fatture ({fatture.length})</div>
                      {fatture.map(f=>{const fc=f.stato==='pagata'?C.grn:f.stato==='scaduta'?C.red:C.amb;return(
                        <div key={f.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:`1px solid ${C.bd}`}}>
                          <div><div style={{fontSize:12,fontWeight:600,color:C.t1}}>N. {f.numero}</div><div style={{fontSize:10,color:C.t3}}>{new Date(f.data_emissione).toLocaleDateString('it-IT')}</div></div>
                          <div style={{textAlign:'right'}}><div style={{fontFamily:M,fontWeight:700,fontSize:14,color:C.teal}}>{'\u20AC'}{parseFloat(f.totale||f.importo).toLocaleString('it-IT')}</div><span style={{fontSize:9,fontWeight:700,color:fc}}>{f.stato}</span></div>
                        </div>
                      );})}
                    </div>}
                    {costi.length>0&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,overflow:'hidden',marginBottom:14}}>
                      <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.bd}`,fontSize:11,fontWeight:700,color:C.t1}}>Costi ({costi.length})</div>
                      {costi.map((c,i)=>(
                        <div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:`1px solid ${C.bd}`}}>
                          <div><div style={{fontSize:12,fontWeight:500,color:C.t1}}>{c.descrizione}</div><div style={{fontSize:10,color:C.t3}}>{c.tipo} · {new Date(c.data).toLocaleDateString('it-IT')}</div></div>
                          <div style={{fontFamily:M,fontSize:12,fontWeight:600,color:C.t2}}>{'\u20AC'}{parseFloat(c.totale||c.importo).toLocaleString('it-IT')}</div>
                        </div>
                      ))}
                      <div style={{display:'flex',justifyContent:'space-between',padding:'10px 14px'}}><span style={{fontSize:12,fontWeight:700,color:C.t1}}>Totale</span><span style={{fontFamily:M,fontWeight:800,fontSize:16,color:C.teal}}>{'\u20AC'}{totC.toFixed(2)}</span></div>
                    </div>}
                    {mt&&<div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:10,padding:14}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.t1,marginBottom:10}}>Tempo lavoro</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                        <div style={{textAlign:'center'}}><div style={{fontFamily:M,fontWeight:700,fontSize:18,color:C.t1}}>{mt.ore_preventivate||'\u2014'}h</div><div style={{fontSize:9,color:C.t3}}>Preventivate</div></div>
                        <div style={{textAlign:'center'}}><div style={{fontFamily:M,fontWeight:700,fontSize:18,color:mt.ore_reali>mt.ore_preventivate?C.red:C.grn}}>{mt.ore_reali?mt.ore_reali.toFixed(1):'\u2014'}h</div><div style={{fontSize:9,color:C.t3}}>Reali</div></div>
                        <div style={{textAlign:'center'}}><div style={{fontFamily:M,fontWeight:700,fontSize:18,color:C.t1}}>{mt.ore_reali>0?'\u20AC'+(totC/mt.ore_reali).toFixed(0)+'/h':'\u2014'}</div><div style={{fontSize:9,color:C.t3}}>Costo/ora</div></div>
                      </div>
                    </div>}
                  </>}
                </div>

                {/* RIGHT SIDEBAR — always visible */}
                <div style={{overflowY:'auto',borderLeft:`1px solid ${C.bd}`,paddingLeft:16}}>
                  {/* Quick economia */}
                  <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:14,marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Riepilogo</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[{l:'Budget',v:`\u20AC${parseFloat(r.budget||0).toLocaleString('it-IT')}`,c:C.t1},{l:'Costi',v:`\u20AC${totC.toFixed(0)}`,c:totC>(parseFloat(r.budget)||0)?C.red:C.grn},{l:'Fatturato',v:`\u20AC${totF.toFixed(0)}`,c:C.teal},{l:'Saldo',v:`\u20AC${(totF-totP).toFixed(0)}`,c:(totF-totP)>0?C.amb:C.grn}].map((k,i)=>(
                        <div key={i} style={{background:C.sf,borderRadius:8,padding:'8px 10px',textAlign:'center'}}><div style={{fontFamily:M,fontWeight:700,fontSize:14,color:k.c}}>{k.v}</div><div style={{fontSize:8,color:C.t3,marginTop:1}}>{k.l}</div></div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline recente */}
                  <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:14,marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Ultimi eventi</div>
                    {timeline.slice(0,6).map((ev,i)=>(
                      <div key={ev.id} style={{display:'flex',gap:8,marginBottom:8}}>
                        <div style={{width:6,height:6,borderRadius:'50%',background:i===0?C.teal:C.bd,flexShrink:0,marginTop:5}}/>
                        <div><div style={{fontSize:11,fontWeight:500,color:C.t1}}>{ev.titolo}</div><div style={{fontSize:9,color:C.t3}}>{new Date(ev.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>
                      </div>
                    ))}
                  </div>

                  {/* Serramentista info */}
                  {(()=>{const f=freelancers.find(x=>x.id===r.operatore_id);const rt=f?avgRating(f.id):{avg:'—',n:0};return f?(
                    <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:12,padding:14,marginBottom:12}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Serramentista</div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                        <div style={{width:36,height:36,borderRadius:10,background:`${C.teal}22`,border:`1.5px solid ${C.tBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:C.teal}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                        <div><div style={{fontSize:13,fontWeight:700,color:C.t1}}>{f.nome} {f.cognome}</div><div style={{fontSize:10,color:C.t3}}>{f.ruolo||'montatore'}</div></div>
                      </div>
                      {rt.n>0&&<div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:14,color:C.amb}}>{'\u2605'.repeat(Math.round(parseFloat(rt.avg)))}</span><span style={{fontSize:12,fontWeight:700,color:C.amb}}>{rt.avg}</span><span style={{fontSize:10,color:C.t3}}>({rt.n} valutazioni)</span></div>}
                    </div>
                  ):null;})()}

                  {/* Report */}
                  <button onClick={()=>{const w=window.open('','_blank');if(!w)return;w.document.write(`<html><head><title>Report ${r.cliente}</title><style>*{margin:0;box-sizing:border-box}body{font-family:system-ui;padding:32px;max-width:800px;margin:0 auto;color:#1a1a1a}h1{font-size:22px;font-weight:800}h3{font-size:13px;font-weight:700;margin:16px 0 6px;color:#0D9488}table{width:100%;border-collapse:collapse;margin:6px 0}th,td{border:1px solid #e5e5e5;padding:6px 8px;font-size:11px}th{background:#f8f8f8;font-weight:700;font-size:9px;text-transform:uppercase;color:#666}</style></head><body>`);w.document.write(`<h1>${r.cliente}</h1><p style="color:#666;font-size:11px">${r.indirizzo} \u2014 ${new Date().toLocaleDateString('it-IT')}</p>`);if(vani.length){w.document.write('<h3>Vani</h3><table><tr><th>#</th><th>Tipo</th><th>Materiale</th><th>Misure</th><th>Stanza</th></tr>');vani.forEach((v,i)=>w.document.write(`<tr><td>${i+1}</td><td>${v.tipo}</td><td>${v.materiale}</td><td>${v.larghezza&&v.altezza?v.larghezza+'\u00D7'+v.altezza:'\u2014'}</td><td>${v.stanza||'\u2014'}</td></tr>`));w.document.write('</table>');}w.document.write('<p style="margin-top:24px;color:#ccc;font-size:8px">MASTRO Suite</p></body></html>');w.document.close();w.print();}}
                    style={{width:'100%',background:C.tBg,color:C.teal,border:`1px solid ${C.tBd}`,borderRadius:10,padding:'10px 0',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Report PDF
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ═══ NUOVO + MKT placeholder ═══ */}
          {(page==='nuovo'||page==='marketplace')&&<div style={{maxWidth:600}}><div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:14,padding:32,textAlign:'center'}}><div style={{fontSize:18,fontWeight:700,color:C.t1,marginBottom:8}}>{page==='marketplace'?'Marketplace':'Nuovo lavoro'}</div><div style={{fontSize:13,color:C.t2,lineHeight:1.5}}>Form completo con import da Opera, FpPro, Excel, CSV — prossimo deploy.</div></div></div>}

        </div>
      </div>
    </div>
  );
}

function NB({a,o,i,l,b}){return<button onClick={o} style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 8px',borderRadius:7,border:'none',cursor:'pointer',marginBottom:1,background:a?C.tBg:'transparent'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a?C.teal:C.t3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={i}/></svg><span style={{fontSize:12,fontWeight:a?700:500,color:a?C.teal:C.t2,flex:1,textAlign:'left'}}>{l}</span>{b&&<span style={{background:`linear-gradient(135deg,${C.amb},#F59E0B)`,color:'#000',borderRadius:8,padding:'1px 6px',fontSize:9,fontWeight:800}}>{b}</span>}</button>;}
function Sh({children}){return<div style={{minHeight:'100vh',background:C.bg,fontFamily:F}}>{children}</div>;}
function Css(){return<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800&family=JetBrains+Mono:wght@500;700&display=swap');@keyframes spin{to{transform:rotate(360deg)}}*::-webkit-scrollbar{width:5px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#283548;border-radius:3px}input,select,textarea{font-family:'DM Sans',-apple-system,sans-serif}`}</style>;}
