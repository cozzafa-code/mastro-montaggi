// @ts-nocheck
// PortaleAzienda.tsx v7 — Apple/Notion Aesthetic
'use client';
import React, { useState, useEffect, useRef } from 'react';

const SB_URL='https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const sb={
  get:async(t,p={})=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}?${new URLSearchParams(p)}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});return r.ok?r.json():[];}catch{return[];}},
  post:async(t,b)=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(b)});return r.ok?r.json():null;}catch{return null;}},
  patch:async(t,id,b)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(b)});}catch{}},
};

// ═══ DESIGN — Apple/Notion Minimal ═══
const F=`'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`;
const M=`'SF Mono','JetBrains Mono','Fira Code',monospace`;
const C={
  bg:'#0B0E13',      // near-black
  sb:'#0F1218',      // sidebar
  sf:'#13161D',      // surface
  cd:'#181C25',      // card
  cdH:'#1E222D',     // card hover
  bd:'#ffffff0a',    // ultra-subtle border
  bdS:'#ffffff08',   // separator
  teal:'#2FA7A2',    // fliwoX brand
  tealS:'#2FA7A222', // teal subtle
  grn:'#7ED957',     // fliwoX green
  grnS:'#7ED95715',
  amb:'#F59E0B',     // fliwoX amber
  ambS:'#F59E0B15',
  red:'#EF4444',
  redS:'#EF444415',
  blu:'#6B9FFF',
  bluS:'#6B9FFF15',
  pur:'#A78BFA',
  t1:'#EDEEF0',      // primary text — not pure white
  t2:'#7C8190',      // secondary
  t3:'#474B57',      // muted
};
const ST={
  nuova:{c:C.amb,l:'In attesa'},
  vista:{c:C.blu,l:'Presa in carico'},
  accettata:{c:C.grn,l:'Accettata'},
  in_corso:{c:C.teal,l:'In lavorazione'},
  completata:{c:C.pur,l:'Completata'},
  rifiutata:{c:C.red,l:'Rifiutata'},
  annullata:{c:C.t3,l:'Annullata'},
};

// fliwoX logo inline
const Logo=({s=24})=><svg width={s} height={s} viewBox="0 0 200 200" fill="none"><rect x="95" y="15" width="10" height="10" rx="2" fill="#2FA7A2"/><rect x="130" y="25" width="10" height="10" rx="2" fill="#7ED957"/><rect x="155" y="50" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="165" y="95" width="10" height="10" rx="2" fill="#7ED957"/><rect x="155" y="140" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="130" y="165" width="10" height="10" rx="2" fill="#7ED957"/><rect x="95" y="175" width="10" height="10" rx="2" fill="#2FA7A2"/><rect x="60" y="165" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="35" y="140" width="10" height="10" rx="2" fill="#7ED957"/><rect x="25" y="95" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="35" y="50" width="10" height="10" rx="2" fill="#7ED957"/><rect x="60" y="25" width="10" height="10" rx="2" fill="#F59E0B"/><g transform="rotate(8 100 100)"><rect x="55" y="55" width="90" height="90" rx="22" fill="#2FA7A2"/><path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/><path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/></g></svg>;

export default function PortaleAzienda({inviteCode}:{inviteCode:string}){
  const [loading,setLoading]=useState(true);
  const [azienda,setAzienda]=useState(null);
  const [notFound,setNotFound]=useState(false);
  const [freelancers,setFreelancers]=useState([]);
  const [richieste,setRichieste]=useState([]);
  const [page,setPage]=useState('dashboard');
  const [selFL,setSelFL]=useState(null);
  const [selR,setSelR]=useState(null);
  const [filtro,setFiltro]=useState('tutti');
  const [det,setDet]=useState({montaggi:[],fotoFasi:[],firme:[],fatture:[],costi:[],documenti:[],candidature:[],timeline:[],chat:[],valutazione:null});
  const [search,setSearch]=useState('');
  const [calView,setCalView]=useState('mese');
  const [calDate,setCalDate]=useState(()=>new Date());
  const [hoverEvent,setHoverEvent]=useState(null);
  const [hoverPos,setHoverPos]=useState({x:0,y:0});
  const [notifiche,setNotifiche]=useState([]);
  const [valutazioni,setValutazioni]=useState([]);
  const [chatMsg,setChatMsg]=useState('');
  const [detTab,setDetTab]=useState('info');
  const [fFatture,setFFatture]=useState([]);
  const [fProfilo,setFProfilo]=useState(null);
  const [flTab,setFlTab]=useState('panoramica');
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
      const azIds=(allAz||[]).map(a=>a.id);
      const allNotif=[];for(const aid of azIds){const n=await sb.get('notifiche_portale',{azienda_fl_id:'eq.'+aid,destinatario:'eq.azienda',order:'created_at.desc',limit:'50'});allNotif.push(...(n||[]));}
      allNotif.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setNotifiche(allNotif);
      const allVal=[];for(const op of ops){const v=await sb.get('valutazioni_freelance',{operatore_id:'eq.'+op.id,order:'created_at.desc'});allVal.push(...(v||[]));}
      setValutazioni(allVal);
      setLoading(false);
    })();
    return()=>{if(pollRef.current)clearInterval(pollRef.current);};
  },[inviteCode]);

  useEffect(()=>{if(!azienda)return;pollRef.current=setInterval(async()=>{const a=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});await loadRL(a||[]);},25000);return()=>clearInterval(pollRef.current);},[azienda]);
  useEffect(()=>{if(!selFL)return;(async()=>{const fat=await sb.get('fatture_freelance',{operatore_id:'eq.'+selFL.id,order:'data_emissione.desc',limit:'50'});setFFatture(fat||[]);const prof=await sb.get('profili_freelance',{operatore_id:'eq.'+selFL.id,limit:'1'});setFProfilo(prof?.[0]||null);setFlTab('panoramica');})();},[selFL]);

  const loadRL=async(azL)=>{const all=[];for(const a of azL){const r=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+a.id,order:'created_at.desc',limit:'200'});all.push(...(r||[]));}all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setRichieste(all);};
  const openDet=async(r)=>{
    setSelR(r);setPage('dettaglio');setDetTab('info');
    const [docs,fat,cos,tl,ch,val]=await Promise.all([sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'}),sb.get('fatture_freelance',{richiesta_id:'eq.'+r.id,order:'data_emissione.desc'}),sb.get('costi_commessa',{richiesta_id:'eq.'+r.id,order:'data.desc'}),sb.get('timeline_eventi',{richiesta_id:'eq.'+r.id,order:'created_at.desc',limit:'50'}),sb.get('chat_portale',{richiesta_id:'eq.'+r.id,order:'created_at.asc',limit:'100'}),sb.get('valutazioni_freelance',{richiesta_id:'eq.'+r.id,limit:'1'})]);
    let montaggi=[],fotoFasi=[],firme=[];
    if(r.commessa_id){const [mt,ft,fm]=await Promise.all([sb.get('montaggi',{commessa_id:'eq.'+r.commessa_id,limit:'10'}),sb.get('allegati_vano',{select:'*',limit:'50'}),sb.get('firma_collaudo',{select:'*',limit:'10'})]);montaggi=mt||[];fotoFasi=(ft||[]).filter(f=>f.fase);firme=fm||[];}
    setDet({montaggi,fotoFasi,firme,fatture:fat||[],costi:cos||[],documenti:docs||[],candidature:[],timeline:tl||[],chat:ch||[],valutazione:val?.[0]||null});
  };
  const sendChat=async()=>{if(!chatMsg.trim()||!selR)return;const msg={richiesta_id:selR.id,mittente_tipo:'azienda',mittente_nome:azienda?.nome||'Azienda',testo:chatMsg.trim()};const res=await sb.post('chat_portale',msg);if(res){setDet(d=>({...d,chat:[...d.chat,...(Array.isArray(res)?res:[res])]}));setChatMsg('');setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:'smooth'}),100);}};

  const gn=(opId)=>{const f=freelancers.find(x=>x.id===opId);return f?`${f.nome} ${f.cognome}`:'—';};
  const rpf=(opId)=>richieste.filter(r=>r.operatore_id===opId);
  const avgR=(opId)=>{const v=valutazioni.filter(x=>x.operatore_id===opId);return v.length?{avg:(v.reduce((s,x)=>s+x.stelle,0)/v.length).toFixed(1),n:v.length}:{avg:'—',n:0};};
  const kN=richieste.filter(r=>['nuova','vista'].includes(r.stato)).length;
  const kA=richieste.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
  const kC=richieste.filter(r=>r.stato==='completata').length;
  const kB=richieste.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(parseFloat(r.budget)||0),0);
  const unreadN=notifiche.filter(n=>!n.letta).length;

  let filtered=richieste;
  if(filtro==='attivi')filtered=richieste.filter(r=>['nuova','vista','accettata','in_corso'].includes(r.stato));
  else if(filtro==='completati')filtered=richieste.filter(r=>r.stato==='completata');
  if(selFL&&page==='dashboard')filtered=filtered.filter(r=>r.operatore_id===selFL.id);
  if(search)filtered=filtered.filter(r=>(r.cliente+r.indirizzo+(r.note||'')).toLowerCase().includes(search.toLowerCase()));

  if(loading)return<div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F}}><Css/><Logo s={40}/></div>;
  if(notFound)return<div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:F,gap:16}}><Css/><Logo s={48}/><div style={{color:C.t2,fontSize:15}}>Questo link non è valido</div></div>;

  // ═══ LAYOUT ═══
  return(
    <div style={{display:'flex',height:'100vh',background:C.bg,fontFamily:F,color:C.t1,overflow:'hidden'}}><Css/>

      {/* ═══ SIDEBAR — Notion style ═══ */}
      <div style={{width:240,background:C.sb,display:'flex',flexDirection:'column',flexShrink:0}}>
        {/* Logo + azienda */}
        <div style={{padding:'20px 16px 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
            <Logo s={22}/>
            <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.03em'}}>fliwo<span style={{color:C.teal}}>X</span></span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,background:C.cd}}>
            <div style={{width:24,height:24,borderRadius:6,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{(azienda?.nome||'?')[0]}</div>
            <div style={{fontSize:12,fontWeight:600,color:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{azienda?.nome}</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{padding:'0 8px',flex:1,overflowY:'auto'}}>
          {[
            {k:'dashboard',l:'Dashboard',i:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3',b:kN||null},
            {k:'calendario',l:'Calendario',i:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'},
            {k:'notifiche',l:'Notifiche',i:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',b:unreadN||null},
          ].map(n=>(
            <button key={n.k} onClick={()=>{setPage(n.k);if(n.k==='dashboard'){setSelFL(null);setSelR(null);}}}
              style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:6,border:'none',cursor:'pointer',marginBottom:1,
                background:page===n.k&&!selFL?C.tealS:'transparent',transition:'.15s'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={page===n.k&&!selFL?C.teal:C.t3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.i}/></svg>
              <span style={{fontSize:13,fontWeight:page===n.k&&!selFL?600:400,color:page===n.k&&!selFL?C.t1:C.t2,flex:1,textAlign:'left'}}>{n.l}</span>
              {n.b&&<span style={{fontSize:10,fontWeight:700,color:C.amb,background:C.ambS,borderRadius:10,padding:'1px 7px'}}>{n.b}</span>}
            </button>
          ))}

          <div style={{height:1,background:C.bd,margin:'12px 10px'}}/>

          <div style={{padding:'0 10px',marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:500,color:C.t3,letterSpacing:'.04em'}}>Serramentisti</span>
          </div>
          {freelancers.map(f=>{
            const a=selFL?.id===f.id;const fAct=rpf(f.id).filter(r=>['accettata','in_corso'].includes(r.stato)).length;const rt=avgR(f.id);
            return(
              <button key={f.id} onClick={()=>{setSelFL(f);setPage('serramentista');setSelR(null);}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:6,border:'none',cursor:'pointer',marginBottom:1,background:a?C.tealS:'transparent',transition:'.15s'}}>
                <div style={{width:22,height:22,borderRadius:6,background:a?C.teal+'33':C.cd,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:a?C.teal:C.t3,flexShrink:0}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                <div style={{flex:1,textAlign:'left',minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:a?600:400,color:a?C.t1:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nome} {f.cognome}</div>
                  {rt.n>0&&<div style={{fontSize:9,color:C.amb,opacity:.7}}>{'\u2605'} {rt.avg}</div>}
                </div>
                {fAct>0&&<span style={{fontSize:10,fontWeight:600,color:C.teal}}>{fAct}</span>}
              </button>
            );
          })}
        </div>

        <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:6,opacity:.4}}>
          <Logo s={12}/>
          <span style={{fontSize:10,color:C.t3}}>fliwoX</span>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Topbar — minimal */}
        <div style={{padding:'16px 28px',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
          {page==='dettaglio'&&<button onClick={()=>{setPage('dashboard');setSelR(null);}} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>}
          <div style={{flex:1}}>
            <span style={{fontSize:14,fontWeight:500,color:C.t2}}>{page==='calendario'?'Calendario':page==='notifiche'?'Notifiche':page==='dettaglio'&&selR?selR.cliente:page==='serramentista'&&selFL?`${selFL.nome} ${selFL.cognome}`:'Dashboard'}</span>
          </div>
          <div style={{position:'relative'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" style={{position:'absolute',left:10,top:8}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..."
              style={{width:220,background:C.cd,border:'none',borderRadius:8,padding:'7px 10px 7px 34',fontSize:12,color:C.t1,fontFamily:F,outline:'none'}}/>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'0 28px 28px'}}>

          {/* ═══ DASHBOARD ═══ */}
          {page==='dashboard'&&<>
            {/* KPI — clean, no boxes */}
            <div style={{display:'flex',gap:48,marginBottom:32,paddingTop:8}}>
              {[{n:kN,l:'In attesa',c:C.amb},{n:kA,l:'Attivi',c:C.teal},{n:kC,l:'Completati',c:C.grn},{n:'\u20AC'+kB.toLocaleString('it-IT',{maximumFractionDigits:0}),l:'Volume',c:C.t1}].map((k,i)=>(
                <div key={i}>
                  <div style={{fontFamily:M,fontWeight:600,fontSize:typeof k.n==='number'?32:24,color:k.c,letterSpacing:'-0.03em',lineHeight:1}}>{k.n}</div>
                  <div style={{fontSize:12,color:C.t3,marginTop:6,fontWeight:400}}>{k.l}</div>
                </div>
              ))}
            </div>

            {/* Filtri — pill minimal */}
            <div style={{display:'flex',gap:4,marginBottom:20}}>
              {[{k:'tutti',l:'Tutti',n:richieste.length},{k:'attivi',l:'Attivi',n:kA+kN},{k:'completati',l:'Completati',n:kC}].map(f=>(
                <button key={f.k} onClick={()=>setFiltro(f.k)}
                  style={{background:filtro===f.k?C.cd:'transparent',color:filtro===f.k?C.t1:C.t3,border:'none',borderRadius:6,padding:'5px 14px',fontSize:12,fontWeight:filtro===f.k?600:400,cursor:'pointer',transition:'.15s'}}>
                  {f.l} <span style={{opacity:.5}}>{f.n}</span>
                </button>
              ))}
            </div>

            {/* Table — clean, no heavy borders */}
            <div>
              <div style={{display:'grid',gridTemplateColumns:'2.5fr 2.5fr 1.5fr 60px 90px 80px 120px',padding:'0 0 10px',borderBottom:`1px solid ${C.bd}`}}>
                {['Cliente','Indirizzo','Serramentista','Vani','Budget','Data','Stato'].map(h=>(
                  <div key={h} style={{fontSize:11,color:C.t3,fontWeight:500}}>{h}</div>
                ))}
              </div>
              {filtered.length===0?<div style={{padding:'48px 0',textAlign:'center',color:C.t3,fontSize:13}}>Nessun lavoro</div>:
              filtered.map(r=>{
                const st=ST[r.stato]||ST.nuova;const nV=(r.vani_json||[]).length;
                return(
                  <div key={r.id} onClick={()=>openDet(r)}
                    style={{display:'grid',gridTemplateColumns:'2.5fr 2.5fr 1.5fr 60px 90px 80px 120px',padding:'12px 0',borderBottom:`1px solid ${C.bdS}`,cursor:'pointer',transition:'.1s',borderRadius:4}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.cdH}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:13,fontWeight:500}}>{r.cliente}</span>
                      {r.urgente&&<span style={{fontSize:9,fontWeight:600,color:C.red}}>URG</span>}
                      {r.tipo_invio==='marketplace'&&<span style={{fontSize:9,fontWeight:600,color:C.pur}}>MKT</span>}
                    </div>
                    <div style={{fontSize:12,color:C.t3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:8}}>{r.indirizzo}</div>
                    <div style={{fontSize:12,color:C.t2}}>{gn(r.operatore_id)}</div>
                    <div style={{fontFamily:M,fontSize:12,color:C.t3}}>{nV}</div>
                    <div style={{fontFamily:M,fontSize:12,color:C.teal}}>{r.budget?'\u20AC'+parseFloat(r.budget).toLocaleString('it-IT'):'—'}</div>
                    <div style={{fontSize:11,color:C.t3}}>{r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'—'}</div>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:st.c,flexShrink:0}}/>
                      <span style={{fontSize:11,color:st.c,fontWeight:500}}>{st.l}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>}

          {/* ═══ CALENDARIO ═══ */}
          {page==='calendario'&&(()=>{
            const oggi=new Date();const oggiStr=oggi.toISOString().slice(0,10);
            const FL_C=['#2FA7A2','#6B9FFF','#A78BFA','#EF4444','#F59E0B','#7ED957','#F472B6','#38BDF8','#818CF8','#FB923C','#4ADE80'];
            const flC=(opId)=>{const idx=freelancers.findIndex(f=>f.id===opId);return FL_C[idx%FL_C.length];};
            const prev=()=>{const d=new Date(calDate);d.setMonth(d.getMonth()-1);setCalDate(d);};
            const next=()=>{const d=new Date(calDate);d.setMonth(d.getMonth()+1);setCalDate(d);};
            const year=calDate.getFullYear();const month=calDate.getMonth();
            const firstDay=new Date(year,month,1);const lastDay=new Date(year,month+1,0);
            const startOff=(firstDay.getDay()+6)%7;const totalD=lastDay.getDate();
            const grid=[];
            const prevML=new Date(year,month,0).getDate();
            for(let i=startOff-1;i>=0;i--)grid.push({d:prevML-i,m:month-1,other:true});
            for(let i=1;i<=totalD;i++)grid.push({d:i,m:month,other:false});
            const rem=42-grid.length;for(let i=1;i<=rem;i++)grid.push({d:i,m:month+1,other:true});

            return(
              <div>
                {/* Header */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <button onClick={prev} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
                    <span style={{fontSize:18,fontWeight:600,textTransform:'capitalize',minWidth:160}}>{calDate.toLocaleDateString('it-IT',{month:'long',year:'numeric'})}</span>
                    <button onClick={next} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                    <button onClick={()=>setCalDate(new Date())} style={{background:C.cd,border:'none',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:500,color:C.t2,cursor:'pointer'}}>Oggi</button>
                  </div>
                </div>

                {/* Days header */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,marginBottom:2}}>
                  {['LUN','MAR','MER','GIO','VEN','SAB','DOM'].map((d,i)=>(
                    <div key={d} style={{fontSize:10,color:i>=5?C.amb+'99':C.t3,fontWeight:500,textAlign:'center',padding:'8px 0'}}>{d}</div>
                  ))}
                </div>

                {/* Grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gridTemplateRows:'repeat(6,1fr)',gap:1}}>
                  {grid.map((gd,i)=>{
                    const am=gd.m<0?gd.m+12:gd.m>11?gd.m-12:gd.m;
                    const ay=gd.m<0?year-1:gd.m>11?year+1:year;
                    const ds=`${ay}-${String(am+1).padStart(2,'0')}-${String(gd.d).padStart(2,'0')}`;
                    const dayRL=richieste.filter(r=>r.data_preferita===ds);
                    const isT=ds===oggiStr;
                    return(
                      <div key={i} style={{background:isT?C.tealS:gd.other?'transparent':C.sf,borderRadius:6,padding:'6px 8px',minHeight:88}}>
                        <div style={{fontSize:12,fontWeight:isT?700:gd.other?300:400,color:isT?C.teal:gd.other?C.t3+'88':C.t2,marginBottom:4}}>
                          {gd.d}
                        </div>
                        {dayRL.slice(0,3).map(r=>{
                          const fc=flC(r.operatore_id);
                          return(
                            <div key={r.id} onClick={()=>openDet(r)}
                              onMouseEnter={e=>{setHoverEvent(r);setHoverPos({x:e.clientX,y:e.clientY});}}
                              onMouseLeave={()=>setHoverEvent(null)}
                              style={{borderLeft:`2px solid ${fc}`,paddingLeft:6,marginBottom:3,cursor:'pointer'}}>
                              <div style={{fontSize:10,fontWeight:500,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.cliente}</div>
                            </div>
                          );
                        })}
                        {dayRL.length>3&&<div style={{fontSize:9,color:C.t3}}>+{dayRL.length-3}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Tooltip */}
                {hoverEvent&&<div style={{position:'fixed',left:hoverPos.x+16,top:hoverPos.y-10,background:C.cd,borderRadius:10,padding:'12px 16px',zIndex:1000,boxShadow:'0 8px 32px rgba(0,0,0,.6)',maxWidth:280,pointerEvents:'none'}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{hoverEvent.cliente}</div>
                  <div style={{fontSize:11,color:C.t3,marginBottom:6}}>{hoverEvent.indirizzo}</div>
                  <div style={{display:'flex',gap:10,fontSize:11,color:C.t2}}>
                    <span>{(hoverEvent.vani_json||[]).length} vani</span>
                    {hoverEvent.budget&&<span style={{color:C.teal}}>{'\u20AC'}{parseFloat(hoverEvent.budget).toLocaleString('it-IT')}</span>}
                    <span>{gn(hoverEvent.operatore_id)}</span>
                  </div>
                </div>}
              </div>
            );
          })()}

          {/* ═══ NOTIFICHE ═══ */}
          {page==='notifiche'&&<div style={{maxWidth:600}}>
            {notifiche.length===0?<div style={{padding:48,textAlign:'center',color:C.t3}}>Nessuna notifica</div>:
            notifiche.map(n=>(
              <div key={n.id} style={{display:'flex',gap:12,padding:'14px 0',borderBottom:`1px solid ${C.bdS}`}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:n.letta?'transparent':C.teal,flexShrink:0,marginTop:7}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:n.letta?400:600}}>{n.titolo}</div>
                  {n.corpo&&<div style={{fontSize:12,color:C.t2,marginTop:2}}>{n.corpo}</div>}
                  <div style={{fontSize:11,color:C.t3,marginTop:4}}>{new Date(n.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
          </div>}

          {/* ═══ DETTAGLIO ═══ */}
          {page==='dettaglio'&&selR&&(()=>{
            const r=selR;const st=ST[r.stato]||ST.nuova;const vani=r.vani_json||[];
            const {montaggi,fotoFasi,firme,fatture,costi,timeline,chat,valutazione}=det;
            const mt=montaggi[0];
            const totC=costi.reduce((s,c)=>s+(parseFloat(c.totale)||parseFloat(c.importo)||0),0);
            const totF=fatture.reduce((s,f)=>s+(parseFloat(f.totale)||parseFloat(f.importo)||0),0);
            const totP=fatture.filter(f=>f.stato==='pagata').reduce((s,f)=>s+(parseFloat(f.totale)||parseFloat(f.importo)||0),0);

            return(
              <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:32}}>
                {/* LEFT */}
                <div style={{overflowY:'auto',maxHeight:'calc(100vh - 80px)',paddingRight:8}}>
                  {/* Header */}
                  <div style={{marginBottom:28}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:st.c}}/>
                        <span style={{fontSize:12,color:st.c,fontWeight:500}}>{st.l}</span>
                      </div>
                      {r.urgente&&<span style={{fontSize:11,color:C.red,fontWeight:500}}>Urgente</span>}
                    </div>
                    <div style={{fontSize:28,fontWeight:700,letterSpacing:'-0.03em',lineHeight:1.2}}>{r.cliente}</div>
                    <div style={{fontSize:14,color:C.t2,marginTop:6}}>{r.indirizzo}{r.telefono_cliente?` \u00B7 ${r.telefono_cliente}`:''}</div>
                    <div style={{fontSize:12,color:C.teal,marginTop:4}}>Assegnato a {gn(r.operatore_id)}</div>
                    {/* Progress */}
                    <div style={{display:'flex',gap:2,marginTop:16}}>
                      {['nuova','accettata','in_corso','completata'].map((s,i)=>{
                        const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);
                        return<div key={s} style={{flex:1,height:2,borderRadius:1,background:idx>=i?C.teal:C.bd}}/>;
                      })}
                    </div>
                  </div>

                  {/* Tabs — underline style */}
                  <div style={{display:'flex',gap:24,borderBottom:`1px solid ${C.bd}`,marginBottom:20}}>
                    {[{k:'info',l:'Dettagli'},{k:'timeline',l:'Timeline'},{k:'chat',l:'Chat'},{k:'economia',l:'Economia'}].map(t=>(
                      <button key={t.k} onClick={()=>setDetTab(t.k)}
                        style={{background:'none',border:'none',borderBottom:detTab===t.k?`2px solid ${C.teal}`:'2px solid transparent',padding:'8px 0',cursor:'pointer',fontSize:13,fontWeight:detTab===t.k?600:400,color:detTab===t.k?C.t1:C.t3,transition:'.15s'}}>
                        {t.l}
                      </button>
                    ))}
                  </div>

                  {/* TAB: INFO */}
                  {detTab==='info'&&<>
                    <div style={{display:'flex',gap:32,marginBottom:24}}>
                      {[{l:'Data',v:r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'—'},{l:'Budget',v:r.budget?`\u20AC${parseFloat(r.budget).toLocaleString('it-IT')}`:'—'},{l:'Vani',v:`${vani.length}`}].map(d=>(
                        <div key={d.l}><div style={{fontSize:11,color:C.t3,marginBottom:2}}>{d.l}</div><div style={{fontSize:16,fontWeight:600}}>{d.v}</div></div>
                      ))}
                    </div>
                    {r.note&&<div style={{fontSize:13,color:C.t2,lineHeight:1.6,marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${C.bdS}`}}>{r.note}</div>}
                    {/* Vani */}
                    {vani.length>0&&<div style={{marginBottom:24}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Vani</div>
                      {vani.map((v,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.bdS}`}}>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            <span style={{fontFamily:M,fontSize:11,color:C.t3,width:20}}>{i+1}</span>
                            <div>
                              <div style={{fontSize:13,fontWeight:500}}>{v.tipo}</div>
                              <div style={{fontSize:11,color:C.t3}}>{v.stanza||''}{v.piano?' \u00B7 P.'+v.piano:''}</div>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            <span style={{fontSize:11,color:C.teal,fontWeight:500}}>{v.materiale}</span>
                            <span style={{fontFamily:M,fontSize:12,color:C.t2}}>{v.larghezza&&v.altezza?`${v.larghezza}\u00D7${v.altezza}`:''}</span>
                          </div>
                        </div>
                      ))}
                    </div>}
                    {/* Foto */}
                    {fotoFasi.length>0&&<div style={{marginBottom:24}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Foto</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
                        {fotoFasi.map((f,i)=><img key={i} src={f.file_url||f.url} alt="" style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:8}}/>)}
                      </div>
                    </div>}
                    {valutazione&&<div style={{marginBottom:24}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Valutazione</div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:18,color:C.amb}}>{'\u2605'.repeat(valutazione.stelle)}<span style={{opacity:.2}}>{'\u2605'.repeat(5-valutazione.stelle)}</span></span>
                      </div>
                      {valutazione.commento&&<div style={{fontSize:12,color:C.t2,marginTop:6,fontStyle:'italic'}}>"{valutazione.commento}"</div>}
                    </div>}
                  </>}

                  {/* TAB: TIMELINE */}
                  {detTab==='timeline'&&<div>
                    {timeline.map((ev,i)=>(
                      <div key={ev.id} style={{display:'flex',gap:16,marginBottom:0}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:12,flexShrink:0}}>
                          <div style={{width:8,height:8,borderRadius:'50%',background:i===0?C.teal:C.t3+'44',flexShrink:0}}/>
                          {i<timeline.length-1&&<div style={{width:1,flex:1,background:C.bd}}/>}
                        </div>
                        <div style={{paddingBottom:20}}>
                          <div style={{fontSize:13,fontWeight:500}}>{ev.titolo}</div>
                          {ev.descrizione&&<div style={{fontSize:12,color:C.t3,marginTop:2}}>{ev.descrizione}</div>}
                          <div style={{fontSize:11,color:C.t3,marginTop:4}}>{new Date(ev.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                        </div>
                      </div>
                    ))}
                  </div>}

                  {/* TAB: CHAT */}
                  {detTab==='chat'&&<div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 280px)'}}>
                    <div style={{flex:1,overflowY:'auto'}}>
                      {chat.length===0?<div style={{padding:40,textAlign:'center',color:C.t3,fontSize:13}}>Nessun messaggio</div>:
                      chat.map((m,i)=>(
                        <div key={m.id||i} style={{display:'flex',justifyContent:m.mittente_tipo==='azienda'?'flex-end':'flex-start',marginBottom:10}}>
                          <div style={{maxWidth:'65%'}}>
                            <div style={{fontSize:10,color:C.t3,marginBottom:3,textAlign:m.mittente_tipo==='azienda'?'right':'left'}}>{m.mittente_nome}</div>
                            <div style={{background:m.mittente_tipo==='azienda'?C.teal:C.cd,color:m.mittente_tipo==='azienda'?'#fff':C.t1,borderRadius:12,padding:'8px 14px',fontSize:13,lineHeight:1.5}}>{m.testo}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef}/>
                    </div>
                    <div style={{display:'flex',gap:8,paddingTop:12}}>
                      <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Scrivi..."
                        style={{flex:1,background:C.cd,border:'none',borderRadius:8,padding:'10px 14px',fontSize:13,color:C.t1,fontFamily:F,outline:'none'}}/>
                      <button onClick={sendChat} disabled={!chatMsg.trim()} style={{background:C.teal,border:'none',borderRadius:8,padding:'0 20px',cursor:'pointer',fontSize:12,fontWeight:600,color:'#fff',opacity:chatMsg.trim()?1:.3}}>Invia</button>
                    </div>
                  </div>}

                  {/* TAB: ECONOMIA */}
                  {detTab==='economia'&&<>
                    <div style={{display:'flex',gap:32,marginBottom:24}}>
                      {[{l:'Budget',v:'\u20AC'+parseFloat(r.budget||0).toLocaleString('it-IT'),c:C.t1},{l:'Costi',v:'\u20AC'+totC.toFixed(0),c:totC>(parseFloat(r.budget)||0)?C.red:C.grn},{l:'Fatturato',v:'\u20AC'+totF.toFixed(0),c:C.teal},{l:'Da pagare',v:'\u20AC'+(totF-totP).toFixed(0),c:(totF-totP)>0?C.amb:C.grn}].map(k=>(
                        <div key={k.l}><div style={{fontSize:11,color:C.t3,marginBottom:2}}>{k.l}</div><div style={{fontFamily:M,fontSize:20,fontWeight:600,color:k.c}}>{k.v}</div></div>
                      ))}
                    </div>
                    {fatture.length>0&&<div style={{marginBottom:24}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Fatture</div>
                      {fatture.map(f=><div key={f.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.bdS}`}}>
                        <div><div style={{fontSize:13,fontWeight:500}}>N. {f.numero}</div><div style={{fontSize:11,color:C.t3}}>{new Date(f.data_emissione).toLocaleDateString('it-IT')}</div></div>
                        <div style={{textAlign:'right'}}><div style={{fontFamily:M,fontSize:14,fontWeight:600,color:C.teal}}>{'\u20AC'}{parseFloat(f.totale||f.importo).toLocaleString('it-IT')}</div><div style={{fontSize:10,color:f.stato==='pagata'?C.grn:f.stato==='scaduta'?C.red:C.amb}}>{f.stato}</div></div>
                      </div>)}
                    </div>}
                    {costi.length>0&&<div>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Costi</div>
                      {costi.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.bdS}`}}>
                        <div><div style={{fontSize:12,fontWeight:400}}>{c.descrizione}</div><div style={{fontSize:10,color:C.t3}}>{c.tipo}</div></div>
                        <div style={{fontFamily:M,fontSize:12,color:C.t2}}>{'\u20AC'}{parseFloat(c.totale||c.importo).toLocaleString('it-IT')}</div>
                      </div>)}
                    </div>}
                  </>}
                </div>

                {/* RIGHT — minimal sidebar */}
                <div style={{borderLeft:`1px solid ${C.bdS}`,paddingLeft:24,overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  {/* Economia quick */}
                  <div style={{marginBottom:28}}>
                    <div style={{fontSize:11,color:C.t3,marginBottom:12}}>Riepilogo</div>
                    {[{l:'Budget',v:'\u20AC'+parseFloat(r.budget||0).toLocaleString('it-IT')},{l:'Costi',v:'\u20AC'+totC.toFixed(0)},{l:'Fatturato',v:'\u20AC'+totF.toFixed(0)},{l:'Saldo',v:'\u20AC'+(totF-totP).toFixed(0)}].map(k=>(
                      <div key={k.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0'}}>
                        <span style={{fontSize:12,color:C.t3}}>{k.l}</span>
                        <span style={{fontFamily:M,fontSize:12,fontWeight:500}}>{k.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline recent */}
                  {timeline.length>0&&<div style={{marginBottom:28}}>
                    <div style={{fontSize:11,color:C.t3,marginBottom:12}}>Ultimi eventi</div>
                    {timeline.slice(0,5).map(ev=>(
                      <div key={ev.id} style={{marginBottom:10}}>
                        <div style={{fontSize:12,fontWeight:400}}>{ev.titolo}</div>
                        <div style={{fontSize:10,color:C.t3}}>{new Date(ev.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'})}</div>
                      </div>
                    ))}
                  </div>}

                  {/* Serramentista */}
                  {(()=>{const f=freelancers.find(x=>x.id===r.operatore_id);const rt=f?avgR(f.id):{avg:'—',n:0};return f?<div style={{marginBottom:28}}>
                    <div style={{fontSize:11,color:C.t3,marginBottom:12}}>Serramentista</div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:C.teal+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:C.teal}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                      <div><div style={{fontSize:13,fontWeight:600}}>{f.nome} {f.cognome}</div>{rt.n>0&&<div style={{fontSize:11,color:C.amb}}>{'\u2605'} {rt.avg} ({rt.n})</div>}</div>
                    </div>
                  </div>:null;})()}

                  <button onClick={()=>{const w=window.open('','_blank');if(!w)return;w.document.write(`<html><head><title>${r.cliente}</title><style>*{margin:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;padding:48px;max-width:700px;margin:0 auto;color:#1a1a1a}h1{font-size:22px;font-weight:700;letter-spacing:-.02em}p.sub{color:#888;font-size:12px;margin-top:4px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:8px 10px;text-align:left;font-size:12px;border-bottom:1px solid #eee}th{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.05em}</style></head><body>`);w.document.write(`<h1>${r.cliente}</h1><p class="sub">${r.indirizzo}</p>`);if(vani.length){w.document.write('<table><tr><th>#</th><th>Tipo</th><th>Materiale</th><th>Misure</th><th>Stanza</th></tr>');vani.forEach((v,i)=>w.document.write(`<tr><td>${i+1}</td><td>${v.tipo}</td><td>${v.materiale}</td><td>${v.larghezza&&v.altezza?v.larghezza+'\u00D7'+v.altezza:''}</td><td>${v.stanza||''}</td></tr>`));w.document.write('</table>');}w.document.write(`<p style="margin-top:32px;color:#ccc;font-size:9px">fliwoX</p></body></html>`);w.document.close();w.print();}}
                    style={{width:'100%',background:'none',border:`1px solid ${C.bd}`,borderRadius:8,padding:'10px 0',fontSize:12,color:C.t2,cursor:'pointer',fontFamily:F}}>
                    Report PDF
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ═══ SERRAMENTISTA ═══ */}
          {page==='serramentista'&&selFL&&(()=>{
            const f=selFL;const fRL=rpf(f.id);const fComp=fRL.filter(r=>r.stato==='completata');
            const fAtt=fRL.filter(r=>['accettata','in_corso'].includes(r.stato));
            const fBudget=fRL.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(parseFloat(r.budget)||0),0);
            const rt=avgR(f.id);const fVal=valutazioni.filter(v=>v.operatore_id===f.id);
            const totFatt=fFatture.reduce((s,x)=>s+(parseFloat(x.totale)||parseFloat(x.importo)||0),0);
            const totPag=fFatture.filter(x=>x.stato==='pagata').reduce((s,x)=>s+(parseFloat(x.totale)||parseFloat(x.importo)||0),0);

            return(
              <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:32}}>
                <div style={{overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  {/* Hero — clean */}
                  <div style={{marginBottom:28}}>
                    <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
                      <div style={{width:52,height:52,borderRadius:14,background:C.teal+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:C.teal}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                      <div>
                        <div style={{fontSize:24,fontWeight:700,letterSpacing:'-0.03em'}}>{f.nome} {f.cognome}</div>
                        <div style={{fontSize:13,color:C.t3}}>{f.ruolo||'Montatore serramentista'}</div>
                      </div>
                      {rt.n>0&&<div style={{marginLeft:'auto'}}><span style={{fontFamily:M,fontSize:24,fontWeight:600,color:C.amb}}>{rt.avg}</span><span style={{fontSize:11,color:C.t3,marginLeft:6}}>{rt.n} valutazioni</span></div>}
                    </div>
                    {fProfilo?.bio&&<div style={{fontSize:13,color:C.t2,lineHeight:1.6,marginBottom:12}}>{fProfilo.bio}</div>}
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {(fProfilo?.specializzazioni||[]).map(s=><span key={s} style={{fontSize:11,color:C.teal,background:C.tealS,borderRadius:4,padding:'2px 8px'}}>{s}</span>)}
                      {(fProfilo?.certificazioni||[]).map(c=><span key={c} style={{fontSize:11,color:C.grn,background:C.grnS,borderRadius:4,padding:'2px 8px'}}>{c}</span>)}
                    </div>
                  </div>

                  {/* KPI */}
                  <div style={{display:'flex',gap:40,marginBottom:28}}>
                    {[{n:fRL.length,l:'Totali'},{n:fAtt.length,l:'Attivi',c:C.teal},{n:fComp.length,l:'Completati',c:C.grn},{n:'\u20AC'+fBudget.toLocaleString('it-IT',{maximumFractionDigits:0}),l:'Volume'}].map(k=>(
                      <div key={k.l}><div style={{fontFamily:M,fontSize:typeof k.n==='number'?24:18,fontWeight:600,color:k.c||C.t1,letterSpacing:'-.02em'}}>{k.n}</div><div style={{fontSize:11,color:C.t3,marginTop:3}}>{k.l}</div></div>
                    ))}
                  </div>

                  {/* Tabs */}
                  <div style={{display:'flex',gap:24,borderBottom:`1px solid ${C.bd}`,marginBottom:20}}>
                    {[{k:'panoramica',l:'Panoramica'},{k:'lavori',l:'Lavori'},{k:'contabilita',l:'Contabilità'},{k:'valutazioni',l:'Valutazioni'}].map(t=>(
                      <button key={t.k} onClick={()=>setFlTab(t.k)} style={{background:'none',border:'none',borderBottom:flTab===t.k?`2px solid ${C.teal}`:'2px solid transparent',padding:'8px 0',cursor:'pointer',fontSize:13,fontWeight:flTab===t.k?600:400,color:flTab===t.k?C.t1:C.t3}}>{t.l}</button>
                    ))}
                  </div>

                  {flTab==='panoramica'&&fRL.slice(0,8).map(r=>{const st=ST[r.stato]||ST.nuova;return(
                    <div key={r.id} onClick={()=>openDet(r)} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:`1px solid ${C.bdS}`,cursor:'pointer'}}>
                      <div><div style={{fontSize:13,fontWeight:500}}>{r.cliente}</div><div style={{fontSize:11,color:C.t3}}>{r.indirizzo}</div></div>
                      <div style={{textAlign:'right',display:'flex',alignItems:'center',gap:10}}>
                        {r.budget&&<span style={{fontFamily:M,fontSize:12,color:C.teal}}>{'\u20AC'}{parseFloat(r.budget).toLocaleString('it-IT')}</span>}
                        <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:5,height:5,borderRadius:'50%',background:st.c}}/><span style={{fontSize:10,color:st.c}}>{st.l}</span></div>
                      </div>
                    </div>
                  );})}

                  {flTab==='lavori'&&fRL.map(r=>{const st=ST[r.stato]||ST.nuova;return(
                    <div key={r.id} onClick={()=>openDet(r)} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.bdS}`,cursor:'pointer'}}>
                      <div><span style={{fontSize:13,fontWeight:500}}>{r.cliente}</span>{r.urgente&&<span style={{fontSize:9,color:C.red,marginLeft:6}}>URG</span>}</div>
                      <div style={{display:'flex',alignItems:'center',gap:16}}>
                        <span style={{fontSize:11,color:C.t3}}>{(r.vani_json||[]).length} vani</span>
                        <span style={{fontFamily:M,fontSize:11,color:C.teal}}>{r.budget?'\u20AC'+parseFloat(r.budget).toLocaleString('it-IT'):'—'}</span>
                        <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:5,height:5,borderRadius:'50%',background:st.c}}/><span style={{fontSize:10,color:st.c}}>{st.l}</span></div>
                      </div>
                    </div>
                  );})}

                  {flTab==='contabilita'&&<>
                    <div style={{display:'flex',gap:32,marginBottom:24}}>
                      {[{l:'Fatturato',v:'\u20AC'+totFatt.toFixed(0),c:C.teal},{l:'Pagato',v:'\u20AC'+totPag.toFixed(0),c:C.grn},{l:'Da pagare',v:'\u20AC'+(totFatt-totPag).toFixed(0),c:(totFatt-totPag)>0?C.amb:C.grn}].map(k=>(
                        <div key={k.l}><div style={{fontSize:11,color:C.t3,marginBottom:2}}>{k.l}</div><div style={{fontFamily:M,fontSize:20,fontWeight:600,color:k.c}}>{k.v}</div></div>
                      ))}
                    </div>
                    {fFatture.map(ft=><div key={ft.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.bdS}`}}>
                      <div><div style={{fontSize:13,fontWeight:500}}>N. {ft.numero}</div><div style={{fontSize:10,color:C.t3}}>{new Date(ft.data_emissione).toLocaleDateString('it-IT')}{ft.data_scadenza?' \u2192 '+new Date(ft.data_scadenza).toLocaleDateString('it-IT'):''}</div></div>
                      <div style={{textAlign:'right'}}><div style={{fontFamily:M,fontSize:14,fontWeight:600,color:C.teal}}>{'\u20AC'}{parseFloat(ft.totale||ft.importo).toLocaleString('it-IT')}</div><div style={{fontSize:10,color:ft.stato==='pagata'?C.grn:ft.stato==='scaduta'?C.red:C.amb}}>{ft.stato}</div></div>
                    </div>)}
                  </>}

                  {flTab==='valutazioni'&&<>
                    {fVal.length===0?<div style={{padding:32,color:C.t3}}>Nessuna valutazione</div>:
                    fVal.map(v=>(
                      <div key={v.id} style={{padding:'14px 0',borderBottom:`1px solid ${C.bdS}`}}>
                        <div style={{fontSize:16,color:C.amb,marginBottom:4}}>{'\u2605'.repeat(v.stelle)}<span style={{opacity:.15}}>{'\u2605'.repeat(5-v.stelle)}</span></div>
                        {v.commento&&<div style={{fontSize:12,color:C.t2,fontStyle:'italic',lineHeight:1.5}}>"{v.commento}"</div>}
                        <div style={{fontSize:10,color:C.t3,marginTop:4}}>{new Date(v.created_at).toLocaleDateString('it-IT')}</div>
                      </div>
                    ))}
                  </>}
                </div>

                {/* RIGHT */}
                <div style={{borderLeft:`1px solid ${C.bdS}`,paddingLeft:24,overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  <div style={{fontSize:11,color:C.t3,marginBottom:12}}>Info</div>
                  {[
                    {l:'Tariffa',v:fProfilo?.tariffa_oraria?'\u20AC'+fProfilo.tariffa_oraria+'/h':'—'},
                    {l:'Esperienza',v:fProfilo?.anni_esperienza?fProfilo.anni_esperienza+' anni':'—'},
                    {l:'Zone',v:(fProfilo?.zone_operative||[]).join(', ')||'—'},
                    {l:'Fatturato',v:'\u20AC'+totFatt.toFixed(0)},
                    {l:'Da pagare',v:'\u20AC'+(totFatt-totPag).toFixed(0)},
                  ].map(r=>(
                    <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0'}}>
                      <span style={{fontSize:12,color:C.t3}}>{r.l}</span>
                      <span style={{fontSize:12,fontWeight:500}}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ═══ PLACEHOLDER ═══ */}
          {(page==='nuovo'||page==='marketplace')&&<div style={{padding:'48px 0',textAlign:'center'}}><div style={{fontSize:16,fontWeight:500,marginBottom:8}}>{page==='marketplace'?'Marketplace':'Nuovo lavoro'}</div><div style={{fontSize:13,color:C.t3}}>In arrivo</div></div>}

        </div>
      </div>
    </div>
  );
}

function Css(){return<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @keyframes spin{to{transform:rotate(360deg)}}
  *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#ffffff08;border-radius:2px}*::-webkit-scrollbar-thumb:hover{background:#ffffff15}
  ::selection{background:#2FA7A233}
  input{font-family:'Inter',-apple-system,sans-serif}
`}</style>;}
