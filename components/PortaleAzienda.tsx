// @ts-nocheck
// PortaleAzienda.tsx v8 — LIGHT / Line-divided / Apple iWork
'use client';
import React, { useState, useEffect, useRef } from 'react';

const SB_URL='https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const sb={
  get:async(t,p={})=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}?${new URLSearchParams(p)}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});return r.ok?r.json():[];}catch{return[];}},
  post:async(t,b)=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(b)});return r.ok?r.json():null;}catch{return null;}},
  patch:async(t,id,b)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(b)});}catch{}},
};

// ═══ LIGHT DESIGN SYSTEM ═══
const F=`'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`;
const M=`'SF Mono','Menlo','Consolas',monospace`;
const C={
  bg:'#FFFFFF',
  sb:'#FAFAFA',
  line:'#E8E8E8',
  lineS:'#F2F2F2',
  hover:'#F7F7F7',
  sel:'#F0F9F8',
  teal:'#1A9E8F',
  tealL:'#E8F5F3',
  grn:'#2D8A4E',
  grnL:'#E8F5EC',
  amb:'#C47D0A',
  ambL:'#FFF8E8',
  red:'#D03838',
  redL:'#FEF0F0',
  blu:'#3574D4',
  bluL:'#EEF3FC',
  pur:'#7C5CBF',
  purL:'#F3EFF9',
  t1:'#1A1A1A',
  t2:'#666666',
  t3:'#999999',
  t4:'#CCCCCC',
};
const ST={
  nuova:{c:C.amb,bg:C.ambL,l:'In attesa'},
  vista:{c:C.blu,bg:C.bluL,l:'Presa in carico'},
  accettata:{c:C.grn,bg:C.grnL,l:'Accettata'},
  in_corso:{c:C.teal,bg:C.tealL,l:'In lavorazione'},
  completata:{c:C.pur,bg:C.purL,l:'Completata'},
  rifiutata:{c:C.red,bg:C.redL,l:'Rifiutata'},
  annullata:{c:C.t3,bg:C.lineS,l:'Annullata'},
};

const Logo=({s=22})=><svg width={s} height={s} viewBox="0 0 200 200" fill="none"><rect x="95" y="15" width="10" height="10" rx="2" fill="#2FA7A2"/><rect x="130" y="25" width="10" height="10" rx="2" fill="#7ED957"/><rect x="155" y="50" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="165" y="95" width="10" height="10" rx="2" fill="#7ED957"/><rect x="155" y="140" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="130" y="165" width="10" height="10" rx="2" fill="#7ED957"/><rect x="95" y="175" width="10" height="10" rx="2" fill="#2FA7A2"/><rect x="60" y="165" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="35" y="140" width="10" height="10" rx="2" fill="#7ED957"/><rect x="25" y="95" width="10" height="10" rx="2" fill="#F59E0B"/><rect x="35" y="50" width="10" height="10" rx="2" fill="#7ED957"/><rect x="60" y="25" width="10" height="10" rx="2" fill="#F59E0B"/><g transform="rotate(8 100 100)"><rect x="55" y="55" width="90" height="90" rx="22" fill="#2FA7A2"/><path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/><path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/></g></svg>;

export default function PortaleAzienda({inviteCode}:{inviteCode:string}){
  const [loading,setLoading]=useState(true);const [azienda,setAzienda]=useState(null);const [notFound,setNotFound]=useState(false);
  const [freelancers,setFreelancers]=useState([]);const [richieste,setRichieste]=useState([]);
  const [page,setPage]=useState('dashboard');const [selFL,setSelFL]=useState(null);const [selR,setSelR]=useState(null);
  const [filtro,setFiltro]=useState('tutti');const [search,setSearch]=useState('');
  const [det,setDet]=useState({montaggi:[],fotoFasi:[],firme:[],fatture:[],costi:[],documenti:[],candidature:[],timeline:[],chat:[],valutazione:null});
  const [calDate,setCalDate]=useState(()=>new Date());const [hoverEvent,setHoverEvent]=useState(null);const [hoverPos,setHoverPos]=useState({x:0,y:0});
  const [notifiche,setNotifiche]=useState([]);const [valutazioni,setValutazioni]=useState([]);
  const [chatMsg,setChatMsg]=useState('');const [detTab,setDetTab]=useState('info');
  const [fFatture,setFFatture]=useState([]);const [fProfilo,setFProfilo]=useState(null);const [flTab,setFlTab]=useState('panoramica');
  const pollRef=useRef(null);const chatEndRef=useRef(null);

  useEffect(()=>{(async()=>{
    const azRes=await sb.get('aziende_freelance',{invite_code:'eq.'+inviteCode,limit:'1'});
    if(!azRes?.length){setNotFound(true);setLoading(false);return;}
    const az=azRes[0];setAzienda(az);
    const allAz=await sb.get('aziende_freelance',{nome:'eq.'+az.nome,attiva:'eq.true'});
    const ops=[];for(const a of(allAz||[])){const o=await sb.get('operatori',{id:'eq.'+a.operatore_id,limit:'1'});if(o?.[0])ops.push({...o[0],azienda_fl_id:a.id});}
    setFreelancers(ops);await loadRL(allAz||[]);
    const azIds=(allAz||[]).map(a=>a.id);const allN=[];for(const aid of azIds){const n=await sb.get('notifiche_portale',{azienda_fl_id:'eq.'+aid,destinatario:'eq.azienda',order:'created_at.desc',limit:'50'});allN.push(...(n||[]));}
    allN.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setNotifiche(allN);
    const allV=[];for(const op of ops){const v=await sb.get('valutazioni_freelance',{operatore_id:'eq.'+op.id,order:'created_at.desc'});allV.push(...(v||[]));}
    setValutazioni(allV);setLoading(false);
  })();return()=>{if(pollRef.current)clearInterval(pollRef.current);};},[inviteCode]);
  useEffect(()=>{if(!azienda)return;pollRef.current=setInterval(async()=>{const a=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});await loadRL(a||[]);},25000);return()=>clearInterval(pollRef.current);},[azienda]);
  useEffect(()=>{if(!selFL)return;(async()=>{const fat=await sb.get('fatture_freelance',{operatore_id:'eq.'+selFL.id,order:'data_emissione.desc',limit:'50'});setFFatture(fat||[]);const prof=await sb.get('profili_freelance',{operatore_id:'eq.'+selFL.id,limit:'1'});setFProfilo(prof?.[0]||null);setFlTab('panoramica');})();},[selFL]);

  const loadRL=async(azL)=>{const all=[];for(const a of azL){const r=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+a.id,order:'created_at.desc',limit:'200'});all.push(...(r||[]));}all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setRichieste(all);};
  const openDet=async(r)=>{setSelR(r);setPage('dettaglio');setDetTab('info');const [docs,fat,cos,tl,ch,val]=await Promise.all([sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'}),sb.get('fatture_freelance',{richiesta_id:'eq.'+r.id,order:'data_emissione.desc'}),sb.get('costi_commessa',{richiesta_id:'eq.'+r.id,order:'data.desc'}),sb.get('timeline_eventi',{richiesta_id:'eq.'+r.id,order:'created_at.desc',limit:'50'}),sb.get('chat_portale',{richiesta_id:'eq.'+r.id,order:'created_at.asc',limit:'100'}),sb.get('valutazioni_freelance',{richiesta_id:'eq.'+r.id,limit:'1'})]);let montaggi=[],fotoFasi=[],firme=[];if(r.commessa_id){const [mt,ft,fm]=await Promise.all([sb.get('montaggi',{commessa_id:'eq.'+r.commessa_id,limit:'10'}),sb.get('allegati_vano',{select:'*',limit:'50'}),sb.get('firma_collaudo',{select:'*',limit:'10'})]);montaggi=mt||[];fotoFasi=(ft||[]).filter(f=>f.fase);firme=fm||[];}setDet({montaggi,fotoFasi,firme,fatture:fat||[],costi:cos||[],documenti:docs||[],candidature:[],timeline:tl||[],chat:ch||[],valutazione:val?.[0]||null});};
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
  if(search)filtered=filtered.filter(r=>(r.cliente+r.indirizzo+(r.note||'')).toLowerCase().includes(search.toLowerCase()));

  if(loading)return<div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F}}><Css/><Logo s={36}/></div>;
  if(notFound)return<div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:F,gap:12}}><Css/><Logo s={40}/><div style={{color:C.t3,fontSize:14}}>Questo link non è valido</div></div>;

  return(
    <div style={{display:'flex',height:'100vh',background:C.bg,fontFamily:F,color:C.t1,overflow:'hidden'}}><Css/>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{width:220,background:C.sb,borderRight:`1px solid ${C.line}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'16px 14px 12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14}}>
            <Logo s={20}/>
            <span style={{fontSize:14,fontWeight:600,letterSpacing:'-0.02em',color:C.t1}}>fliwo<span style={{color:C.teal}}>X</span></span>
          </div>
          <div style={{fontSize:12,fontWeight:500,color:C.t2}}>{azienda?.nome}</div>
        </div>
        <div style={{height:1,background:C.line,margin:'0 14px'}}/>
        <div style={{padding:'8px 6px',flex:1,overflowY:'auto'}}>
          {[
            {k:'dashboard',l:'Dashboard',b:kN||null},
            {k:'calendario',l:'Calendario'},
            {k:'notifiche',l:'Notifiche',b:unreadN||null},
          ].map(n=>(
            <button key={n.k} onClick={()=>{setPage(n.k);if(n.k==='dashboard')setSelFL(null);setSelR(null);}}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',borderRadius:5,border:'none',cursor:'pointer',marginBottom:1,background:page===n.k&&!selFL?C.tealL:'transparent',fontSize:13,fontWeight:page===n.k&&!selFL?600:400,color:page===n.k&&!selFL?C.teal:C.t2,fontFamily:F}}>
              <span>{n.l}</span>
              {n.b&&<span style={{fontSize:10,fontWeight:600,color:C.amb}}>{n.b}</span>}
            </button>
          ))}

          <div style={{height:1,background:C.line,margin:'10px 8px'}}/>
          <div style={{padding:'2px 10px 6px',fontSize:11,fontWeight:500,color:C.t3}}>Serramentisti</div>
          {freelancers.map(f=>{
            const a=selFL?.id===f.id&&page==='serramentista';const fAct=rpf(f.id).filter(r=>['accettata','in_corso'].includes(r.stato)).length;const rt=avgR(f.id);
            return(
              <button key={f.id} onClick={()=>{setSelFL(f);setPage('serramentista');setSelR(null);}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:7,padding:'5px 10px',borderRadius:5,border:'none',cursor:'pointer',marginBottom:1,background:a?C.tealL:'transparent',fontFamily:F}}>
                <div style={{width:20,height:20,borderRadius:5,background:a?C.teal:C.line,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:a?'#fff':C.t3,flexShrink:0}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                <div style={{flex:1,textAlign:'left',minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:a?600:400,color:a?C.teal:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nome} {f.cognome}</div>
                </div>
                {fAct>0&&<span style={{fontSize:10,color:C.teal,fontWeight:600}}>{fAct}</span>}
              </button>
            );
          })}
        </div>
        <div style={{padding:'10px 14px',borderTop:`1px solid ${C.line}`,display:'flex',alignItems:'center',gap:5,opacity:.4}}>
          <Logo s={10}/><span style={{fontSize:9,color:C.t3}}>fliwoX</span>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Topbar */}
        <div style={{padding:'12px 32px',display:'flex',alignItems:'center',gap:16,flexShrink:0,borderBottom:`1px solid ${C.line}`}}>
          {page==='dettaglio'&&<button onClick={()=>{setPage('dashboard');setSelR(null);}} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>}
          <span style={{flex:1,fontSize:13,fontWeight:500,color:C.t2}}>{page==='calendario'?'Calendario':page==='notifiche'?'Notifiche':page==='dettaglio'&&selR?selR.cliente:page==='serramentista'&&selFL?`${selFL.nome} ${selFL.cognome}`:'Dashboard'}</span>
          <div style={{position:'relative'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="2" style={{position:'absolute',left:8,top:7}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..."
              style={{width:200,background:C.sb,border:`1px solid ${C.line}`,borderRadius:6,padding:'5px 8px 5px 28',fontSize:12,color:C.t1,fontFamily:F,outline:'none'}}/>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'24px 32px 32px'}}>

          {/* ═══ DASHBOARD ═══ */}
          {page==='dashboard'&&<>
            {/* KPI — inline, no boxes, just numbers */}
            <div style={{display:'flex',gap:40,marginBottom:28}}>
              {[{n:kN,l:'In attesa',c:C.amb},{n:kA,l:'Attivi',c:C.teal},{n:kC,l:'Completati',c:C.grn},{n:'\u20AC'+kB.toLocaleString('it-IT',{maximumFractionDigits:0}),l:'Volume',c:C.t1}].map((k,i)=>(
                <div key={i}><div style={{fontFamily:M,fontWeight:500,fontSize:typeof k.n==='number'?28:22,color:k.c,letterSpacing:'-0.03em',lineHeight:1}}>{k.n}</div><div style={{fontSize:12,color:C.t3,marginTop:5}}>{k.l}</div></div>
              ))}
            </div>

            {/* Filters */}
            <div style={{display:'flex',gap:2,marginBottom:16}}>
              {[{k:'tutti',l:'Tutti',n:richieste.length},{k:'attivi',l:'Attivi',n:kA+kN},{k:'completati',l:'Completati',n:kC}].map(f=>(
                <button key={f.k} onClick={()=>setFiltro(f.k)} style={{background:filtro===f.k?C.sb:'transparent',color:filtro===f.k?C.t1:C.t3,border:'none',borderRadius:4,padding:'4px 12px',fontSize:12,fontWeight:filtro===f.k?600:400,cursor:'pointer'}}>{f.l} <span style={{color:C.t4}}>{f.n}</span></button>
              ))}
            </div>

            {/* Table — line divided, no card */}
            <div style={{borderTop:`1px solid ${C.line}`}}>
              <div style={{display:'grid',gridTemplateColumns:'2.5fr 2.5fr 1.5fr 50px 80px 70px 110px',padding:'8px 0',borderBottom:`1px solid ${C.line}`}}>
                {['Cliente','Indirizzo','Serramentista','Vani','Budget','Data','Stato'].map(h=><div key={h} style={{fontSize:11,color:C.t3,fontWeight:500}}>{h}</div>)}
              </div>
              {filtered.length===0?<div style={{padding:'40px 0',textAlign:'center',color:C.t3}}>Nessun lavoro</div>:
              filtered.map(r=>{const st=ST[r.stato]||ST.nuova;return(
                <div key={r.id} onClick={()=>openDet(r)} style={{display:'grid',gridTemplateColumns:'2.5fr 2.5fr 1.5fr 50px 80px 70px 110px',padding:'10px 0',borderBottom:`1px solid ${C.lineS}`,cursor:'pointer',transition:'.08s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <span style={{fontSize:13,fontWeight:500,color:C.t1}}>{r.cliente}</span>
                    {r.urgente&&<span style={{fontSize:9,fontWeight:600,color:C.red}}>URG</span>}
                    {r.tipo_invio==='marketplace'&&<span style={{fontSize:9,fontWeight:600,color:C.pur}}>MKT</span>}
                  </div>
                  <div style={{fontSize:12,color:C.t3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:8}}>{r.indirizzo}</div>
                  <div style={{fontSize:12,color:C.t2}}>{gn(r.operatore_id)}</div>
                  <div style={{fontFamily:M,fontSize:12,color:C.t3}}>{(r.vani_json||[]).length}</div>
                  <div style={{fontFamily:M,fontSize:12,color:C.teal}}>{r.budget?'\u20AC'+parseFloat(r.budget).toLocaleString('it-IT'):'—'}</div>
                  <div style={{fontSize:11,color:C.t3}}>{r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'—'}</div>
                  <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:6,height:6,borderRadius:'50%',background:st.c}}/><span style={{fontSize:11,color:st.c,fontWeight:500}}>{st.l}</span></div>
                </div>
              );})}
            </div>
          </>}

          {/* ═══ CALENDARIO ═══ */}
          {page==='calendario'&&(()=>{
            const oggi=new Date();const oggiStr=oggi.toISOString().slice(0,10);
            const FC=['#1A9E8F','#3574D4','#7C5CBF','#D03838','#C47D0A','#2D8A4E','#C44298','#0E8CC2','#5B5FC7','#D06B1E','#3DAF6A'];
            const flC=opId=>{const idx=freelancers.findIndex(f=>f.id===opId);return FC[idx%FC.length];};
            const prev=()=>{const d=new Date(calDate);d.setMonth(d.getMonth()-1);setCalDate(d);};
            const next=()=>{const d=new Date(calDate);d.setMonth(d.getMonth()+1);setCalDate(d);};
            const year=calDate.getFullYear();const month=calDate.getMonth();
            const firstDay=new Date(year,month,1);const lastDay=new Date(year,month+1,0);
            const startOff=(firstDay.getDay()+6)%7;const totalD=lastDay.getDate();
            const grid=[];const prevML=new Date(year,month,0).getDate();
            for(let i=startOff-1;i>=0;i--)grid.push({d:prevML-i,other:true});
            for(let i=1;i<=totalD;i++)grid.push({d:i,other:false});
            const rem=42-grid.length;for(let i=1;i<=rem;i++)grid.push({d:i,other:true});
            return(<div>
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
                <button onClick={prev} style={{background:'none',border:'none',cursor:'pointer'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
                <span style={{fontSize:16,fontWeight:600,textTransform:'capitalize',minWidth:150}}>{calDate.toLocaleDateString('it-IT',{month:'long',year:'numeric'})}</span>
                <button onClick={next} style={{background:'none',border:'none',cursor:'pointer'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                <button onClick={()=>setCalDate(new Date())} style={{background:C.sb,border:`1px solid ${C.line}`,borderRadius:4,padding:'3px 10px',fontSize:11,color:C.t2,cursor:'pointer'}}>Oggi</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
                {['LUN','MAR','MER','GIO','VEN','SAB','DOM'].map((d,i)=><div key={d} style={{fontSize:10,color:C.t3,fontWeight:500,textAlign:'center',padding:'6px 0',borderBottom:`1px solid ${C.line}`}}>{d}</div>)}
                {grid.map((gd,i)=>{
                  const am=gd.other?(i<7?month-1:month+1):month;const amN=am<0?11:am>11?0:am;const ay=am<0?year-1:am>11?year+1:year;
                  const ds=`${ay}-${String(amN+1).padStart(2,'0')}-${String(gd.d).padStart(2,'0')}`;
                  const dayRL=richieste.filter(r=>r.data_preferita===ds);const isT=ds===oggiStr;
                  return(<div key={i} style={{borderBottom:`1px solid ${C.lineS}`,borderRight:i%7<6?`1px solid ${C.lineS}`:'none',padding:'4px 6px',minHeight:80,background:isT?C.tealL:'transparent'}}>
                    <div style={{fontSize:12,fontWeight:isT?700:gd.other?300:400,color:isT?C.teal:gd.other?C.t4:C.t2,marginBottom:3}}>{gd.d}</div>
                    {dayRL.slice(0,3).map(r=>{const fc=flC(r.operatore_id);return(
                      <div key={r.id} onClick={()=>openDet(r)} onMouseEnter={e=>{setHoverEvent(r);setHoverPos({x:e.clientX,y:e.clientY});}} onMouseLeave={()=>setHoverEvent(null)}
                        style={{borderLeft:`2px solid ${fc}`,paddingLeft:5,marginBottom:2,cursor:'pointer'}}>
                        <div style={{fontSize:10,fontWeight:500,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.cliente}</div>
                      </div>
                    );})}
                    {dayRL.length>3&&<div style={{fontSize:9,color:C.t3}}>+{dayRL.length-3}</div>}
                  </div>);
                })}
              </div>
              {hoverEvent&&<div style={{position:'fixed',left:hoverPos.x+12,top:hoverPos.y-8,background:'#fff',border:`1px solid ${C.line}`,borderRadius:8,padding:'10px 14px',zIndex:1000,boxShadow:'0 4px 20px rgba(0,0,0,.08)',maxWidth:260,pointerEvents:'none'}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{hoverEvent.cliente}</div>
                <div style={{fontSize:11,color:C.t3}}>{hoverEvent.indirizzo}</div>
                <div style={{display:'flex',gap:8,fontSize:11,color:C.t2,marginTop:4}}><span>{(hoverEvent.vani_json||[]).length} vani</span>{hoverEvent.budget&&<span style={{color:C.teal}}>{'\u20AC'}{parseFloat(hoverEvent.budget).toLocaleString('it-IT')}</span>}<span>{gn(hoverEvent.operatore_id)}</span></div>
              </div>}
            </div>);
          })()}

          {/* ═══ NOTIFICHE ═══ */}
          {page==='notifiche'&&<div style={{maxWidth:560}}>
            {notifiche.length===0?<div style={{padding:40,textAlign:'center',color:C.t3}}>Nessuna notifica</div>:
            notifiche.map(n=>(<div key={n.id} style={{display:'flex',gap:10,padding:'12px 0',borderBottom:`1px solid ${C.lineS}`}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:n.letta?'transparent':C.teal,flexShrink:0,marginTop:6}}/>
              <div><div style={{fontSize:13,fontWeight:n.letta?400:600}}>{n.titolo}</div>{n.corpo&&<div style={{fontSize:12,color:C.t2,marginTop:1}}>{n.corpo}</div>}<div style={{fontSize:11,color:C.t3,marginTop:3}}>{new Date(n.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</div></div>
            </div>))}
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
              <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:40}}>
                <div style={{overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  {/* Header */}
                  <div style={{marginBottom:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:st.c}}/><span style={{fontSize:12,color:st.c,fontWeight:500}}>{st.l}</span>
                      {r.urgente&&<span style={{fontSize:11,color:C.red}}>Urgente</span>}
                    </div>
                    <div style={{fontSize:24,fontWeight:700,letterSpacing:'-0.03em'}}>{r.cliente}</div>
                    <div style={{fontSize:13,color:C.t2,marginTop:4}}>{r.indirizzo}{r.telefono_cliente?' \u00B7 '+r.telefono_cliente:''}</div>
                    <div style={{fontSize:12,color:C.teal,marginTop:3}}>{gn(r.operatore_id)}</div>
                    <div style={{display:'flex',gap:2,marginTop:14}}>{['nuova','accettata','in_corso','completata'].map((s,i)=>{const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);return<div key={s} style={{flex:1,height:2,borderRadius:1,background:idx>=i?C.teal:C.line}}/>;})}</div>
                  </div>

                  {/* Tabs */}
                  <div style={{display:'flex',gap:20,borderBottom:`1px solid ${C.line}`,marginBottom:16}}>
                    {[{k:'info',l:'Dettagli'},{k:'timeline',l:'Timeline'},{k:'chat',l:'Chat'},{k:'economia',l:'Economia'}].map(t=>(<button key={t.k} onClick={()=>setDetTab(t.k)} style={{background:'none',border:'none',borderBottom:detTab===t.k?`2px solid ${C.teal}`:'2px solid transparent',padding:'6px 0',cursor:'pointer',fontSize:13,fontWeight:detTab===t.k?600:400,color:detTab===t.k?C.t1:C.t3}}>{t.l}</button>))}
                  </div>

                  {detTab==='info'&&<>
                    <div style={{display:'flex',gap:32,marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.lineS}`}}>
                      {[{l:'Data',v:r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'—'},{l:'Budget',v:r.budget?`\u20AC${parseFloat(r.budget).toLocaleString('it-IT')}`:'—'},{l:'Vani',v:`${vani.length}`}].map(d=>(<div key={d.l}><div style={{fontSize:11,color:C.t3}}>{d.l}</div><div style={{fontSize:15,fontWeight:600,marginTop:1}}>{d.v}</div></div>))}
                    </div>
                    {r.note&&<div style={{fontSize:13,color:C.t2,lineHeight:1.6,marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C.lineS}`}}>{r.note}</div>}
                    {vani.length>0&&<div style={{marginBottom:20}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Vani</div>
                      <div style={{borderTop:`1px solid ${C.line}`}}>
                        {vani.map((v,i)=>(<div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.lineS}`}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <span style={{fontFamily:M,fontSize:11,color:C.t4,width:16}}>{i+1}</span>
                            <div><div style={{fontSize:13,fontWeight:500}}>{v.tipo}</div><div style={{fontSize:11,color:C.t3}}>{v.stanza||''}{v.piano?' \u00B7 P.'+v.piano:''}</div></div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <span style={{fontSize:11,color:C.teal}}>{v.materiale}</span>
                            <span style={{fontFamily:M,fontSize:12,color:C.t2}}>{v.larghezza&&v.altezza?`${v.larghezza}\u00D7${v.altezza}`:''}</span>
                          </div>
                        </div>))}
                      </div>
                    </div>}
                    {fotoFasi.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Foto</div><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>{fotoFasi.map((f,i)=><img key={i} src={f.file_url||f.url} alt="" style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:6}}/>)}</div></div>}
                    {valutazione&&<div><div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Valutazione</div><div style={{color:C.amb,fontSize:16}}>{'\u2605'.repeat(valutazione.stelle)}<span style={{opacity:.2}}>{'\u2605'.repeat(5-valutazione.stelle)}</span></div>{valutazione.commento&&<div style={{fontSize:12,color:C.t2,marginTop:4,fontStyle:'italic'}}>"{valutazione.commento}"</div>}</div>}
                  </>}

                  {detTab==='timeline'&&<div>{timeline.map((ev,i)=>(<div key={ev.id} style={{display:'flex',gap:14}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',width:10,flexShrink:0}}><div style={{width:7,height:7,borderRadius:'50%',background:i===0?C.teal:C.line,flexShrink:0}}/>{i<timeline.length-1&&<div style={{width:1,flex:1,background:C.lineS}}/>}</div><div style={{paddingBottom:18}}><div style={{fontSize:13,fontWeight:500}}>{ev.titolo}</div>{ev.descrizione&&<div style={{fontSize:12,color:C.t3,marginTop:1}}>{ev.descrizione}</div>}<div style={{fontSize:11,color:C.t4,marginTop:3}}>{new Date(ev.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div></div>))}</div>}

                  {detTab==='chat'&&<div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 260px)'}}><div style={{flex:1,overflowY:'auto'}}>{chat.length===0?<div style={{padding:32,textAlign:'center',color:C.t3}}>Nessun messaggio</div>:chat.map((m,i)=>(<div key={m.id||i} style={{display:'flex',justifyContent:m.mittente_tipo==='azienda'?'flex-end':'flex-start',marginBottom:8}}><div style={{maxWidth:'60%'}}><div style={{fontSize:10,color:C.t3,marginBottom:2}}>{m.mittente_nome}</div><div style={{background:m.mittente_tipo==='azienda'?C.teal:C.sb,color:m.mittente_tipo==='azienda'?'#fff':C.t1,borderRadius:10,padding:'7px 12px',fontSize:13,lineHeight:1.5,border:m.mittente_tipo!=='azienda'?`1px solid ${C.line}`:'none'}}>{m.testo}</div></div></div>))}<div ref={chatEndRef}/></div><div style={{display:'flex',gap:6,paddingTop:10}}><input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Scrivi..." style={{flex:1,background:C.sb,border:`1px solid ${C.line}`,borderRadius:6,padding:'8px 12px',fontSize:13,color:C.t1,fontFamily:F,outline:'none'}}/><button onClick={sendChat} disabled={!chatMsg.trim()} style={{background:C.teal,border:'none',borderRadius:6,padding:'0 16px',cursor:'pointer',fontSize:12,fontWeight:600,color:'#fff',opacity:chatMsg.trim()?1:.3}}>Invia</button></div></div>}

                  {detTab==='economia'&&<><div style={{display:'flex',gap:32,marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.lineS}`}}>{[{l:'Budget',v:'\u20AC'+parseFloat(r.budget||0).toLocaleString('it-IT'),c:C.t1},{l:'Costi',v:'\u20AC'+totC.toFixed(0),c:totC>(parseFloat(r.budget)||0)?C.red:C.grn},{l:'Fatturato',v:'\u20AC'+totF.toFixed(0),c:C.teal},{l:'Da pagare',v:'\u20AC'+(totF-totP).toFixed(0),c:(totF-totP)>0?C.amb:C.grn}].map(k=>(<div key={k.l}><div style={{fontSize:11,color:C.t3}}>{k.l}</div><div style={{fontFamily:M,fontSize:18,fontWeight:500,color:k.c,marginTop:1}}>{k.v}</div></div>))}</div>
                    {fatture.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Fatture</div>{fatture.map(f=>(<div key={f.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.lineS}`}}><div><div style={{fontSize:13}}>N. {f.numero}</div><div style={{fontSize:10,color:C.t3}}>{new Date(f.data_emissione).toLocaleDateString('it-IT')}</div></div><div style={{textAlign:'right'}}><div style={{fontFamily:M,fontSize:13,color:C.teal}}>{'\u20AC'}{parseFloat(f.totale||f.importo).toLocaleString('it-IT')}</div><div style={{fontSize:10,color:f.stato==='pagata'?C.grn:f.stato==='scaduta'?C.red:C.amb}}>{f.stato}</div></div></div>))}</div>}
                    {costi.length>0&&<div><div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Costi</div>{costi.map(c=>(<div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${C.lineS}`}}><div><div style={{fontSize:12}}>{c.descrizione}</div><div style={{fontSize:10,color:C.t3}}>{c.tipo}</div></div><div style={{fontFamily:M,fontSize:12,color:C.t2}}>{'\u20AC'}{parseFloat(c.totale||c.importo).toLocaleString('it-IT')}</div></div>))}<div style={{display:'flex',justifyContent:'space-between',paddingTop:8}}><span style={{fontSize:12,fontWeight:600}}>Totale</span><span style={{fontFamily:M,fontSize:14,fontWeight:600,color:C.teal}}>{'\u20AC'}{totC.toFixed(2)}</span></div></div>}
                  </>}
                </div>

                {/* Right */}
                <div style={{borderLeft:`1px solid ${C.line}`,paddingLeft:28,overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  <div style={{fontSize:11,color:C.t3,marginBottom:10}}>Riepilogo</div>
                  {[{l:'Budget',v:'\u20AC'+parseFloat(r.budget||0).toLocaleString('it-IT')},{l:'Costi',v:'\u20AC'+totC.toFixed(0)},{l:'Fatturato',v:'\u20AC'+totF.toFixed(0)},{l:'Saldo',v:'\u20AC'+(totF-totP).toFixed(0)}].map(k=>(<div key={k.l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:`1px solid ${C.lineS}`}}><span style={{fontSize:12,color:C.t3}}>{k.l}</span><span style={{fontSize:12,fontWeight:500}}>{k.v}</span></div>))}

                  {timeline.length>0&&<><div style={{fontSize:11,color:C.t3,marginTop:20,marginBottom:8}}>Ultimi eventi</div>{timeline.slice(0,5).map(ev=>(<div key={ev.id} style={{marginBottom:8}}><div style={{fontSize:12}}>{ev.titolo}</div><div style={{fontSize:10,color:C.t4}}>{new Date(ev.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'})}</div></div>))}</>}

                  {(()=>{const f=freelancers.find(x=>x.id===r.operatore_id);const rt=f?avgR(f.id):{avg:'—',n:0};return f?<><div style={{fontSize:11,color:C.t3,marginTop:20,marginBottom:8}}>Serramentista</div><div style={{fontSize:13,fontWeight:600}}>{f.nome} {f.cognome}</div>{rt.n>0&&<div style={{fontSize:11,color:C.amb,marginTop:2}}>{'\u2605'} {rt.avg} ({rt.n})</div>}</>:null;})()}

                  <button onClick={()=>{const w=window.open('','_blank');if(!w)return;w.document.write(`<html><head><title>${r.cliente}</title><style>*{margin:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;padding:48px;max-width:700px;margin:0 auto;color:#1a1a1a}h1{font-size:20px;font-weight:700}p.s{color:#888;font-size:11px;margin-top:3px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:7px 8px;text-align:left;font-size:11px;border-bottom:1px solid #eee}th{font-size:9px;color:#888;text-transform:uppercase}</style></head><body><h1>${r.cliente}</h1><p class="s">${r.indirizzo}</p>`);if(vani.length){w.document.write('<table><tr><th>#</th><th>Tipo</th><th>Materiale</th><th>Misure</th><th>Stanza</th></tr>');vani.forEach((v,i)=>w.document.write(`<tr><td>${i+1}</td><td>${v.tipo}</td><td>${v.materiale}</td><td>${v.larghezza&&v.altezza?v.larghezza+'\u00D7'+v.altezza:''}</td><td>${v.stanza||''}</td></tr>`));w.document.write('</table>');}w.document.write('<p style="margin-top:24px;color:#ccc;font-size:8px">fliwoX</p></body></html>');w.document.close();w.print();}}
                    style={{width:'100%',marginTop:24,background:'none',border:`1px solid ${C.line}`,borderRadius:6,padding:'8px 0',fontSize:12,color:C.t2,cursor:'pointer',fontFamily:F}}>Report PDF</button>
                </div>
              </div>);
          })()}

          {/* ═══ SERRAMENTISTA ═══ */}
          {page==='serramentista'&&selFL&&(()=>{
            const f=selFL;const fRL=rpf(f.id);const fComp=fRL.filter(r=>r.stato==='completata');
            const fAtt=fRL.filter(r=>['accettata','in_corso'].includes(r.stato));
            const fBud=fRL.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(parseFloat(r.budget)||0),0);
            const rt=avgR(f.id);const fVal=valutazioni.filter(v=>v.operatore_id===f.id);
            const totFatt=fFatture.reduce((s,x)=>s+(parseFloat(x.totale)||parseFloat(x.importo)||0),0);
            const totPag=fFatture.filter(x=>x.stato==='pagata').reduce((s,x)=>s+(parseFloat(x.totale)||parseFloat(x.importo)||0),0);
            return(
              <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:40}}>
                <div style={{overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  <div style={{marginBottom:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
                      <div style={{width:44,height:44,borderRadius:12,background:C.tealL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:600,color:C.teal}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                      <div><div style={{fontSize:22,fontWeight:700,letterSpacing:'-0.02em'}}>{f.nome} {f.cognome}</div><div style={{fontSize:12,color:C.t3}}>{f.ruolo||'Montatore'}</div></div>
                      {rt.n>0&&<div style={{marginLeft:'auto'}}><span style={{fontFamily:M,fontSize:20,fontWeight:500,color:C.amb}}>{rt.avg}</span><span style={{fontSize:11,color:C.t3,marginLeft:4}}>{rt.n} val.</span></div>}
                    </div>
                    {fProfilo?.bio&&<div style={{fontSize:13,color:C.t2,lineHeight:1.6,marginBottom:10}}>{fProfilo.bio}</div>}
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {(fProfilo?.specializzazioni||[]).map(s=><span key={s} style={{fontSize:11,color:C.teal,background:C.tealL,borderRadius:3,padding:'1px 7px'}}>{s}</span>)}
                      {(fProfilo?.certificazioni||[]).map(c=><span key={c} style={{fontSize:11,color:C.grn,background:C.grnL,borderRadius:3,padding:'1px 7px'}}>{c}</span>)}
                    </div>
                  </div>

                  <div style={{display:'flex',gap:36,marginBottom:24,paddingBottom:16,borderBottom:`1px solid ${C.line}`}}>
                    {[{n:fRL.length,l:'Totali'},{n:fAtt.length,l:'Attivi',c:C.teal},{n:fComp.length,l:'Completati',c:C.grn},{n:'\u20AC'+fBud.toLocaleString('it-IT',{maximumFractionDigits:0}),l:'Volume'}].map(k=>(<div key={k.l}><div style={{fontFamily:M,fontSize:typeof k.n==='number'?22:16,fontWeight:500,color:k.c||C.t1}}>{k.n}</div><div style={{fontSize:11,color:C.t3,marginTop:2}}>{k.l}</div></div>))}
                  </div>

                  <div style={{display:'flex',gap:20,borderBottom:`1px solid ${C.line}`,marginBottom:16}}>
                    {[{k:'panoramica',l:'Panoramica'},{k:'lavori',l:'Lavori'},{k:'contabilita',l:'Contabilità'},{k:'valutazioni',l:'Valutazioni'}].map(t=>(<button key={t.k} onClick={()=>setFlTab(t.k)} style={{background:'none',border:'none',borderBottom:flTab===t.k?`2px solid ${C.teal}`:'2px solid transparent',padding:'6px 0',cursor:'pointer',fontSize:13,fontWeight:flTab===t.k?600:400,color:flTab===t.k?C.t1:C.t3}}>{t.l}</button>))}
                  </div>

                  {flTab==='panoramica'&&fRL.slice(0,8).map(r=>{const st=ST[r.stato]||ST.nuova;return(<div key={r.id} onClick={()=>openDet(r)} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.lineS}`,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><div><div style={{fontSize:13,fontWeight:500}}>{r.cliente}</div><div style={{fontSize:11,color:C.t3}}>{r.indirizzo}</div></div><div style={{display:'flex',alignItems:'center',gap:10}}>{r.budget&&<span style={{fontFamily:M,fontSize:11,color:C.teal}}>{'\u20AC'}{parseFloat(r.budget).toLocaleString('it-IT')}</span>}<div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:5,height:5,borderRadius:'50%',background:st.c}}/><span style={{fontSize:10,color:st.c}}>{st.l}</span></div></div></div>);})}

                  {flTab==='lavori'&&<div style={{borderTop:`1px solid ${C.line}`}}>{fRL.map(r=>{const st=ST[r.stato]||ST.nuova;return(<div key={r.id} onClick={()=>openDet(r)} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.lineS}`,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span style={{fontSize:12,fontWeight:500}}>{r.cliente}</span><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:11,color:C.t3}}>{(r.vani_json||[]).length}v</span><span style={{fontFamily:M,fontSize:11,color:C.teal}}>{r.budget?'\u20AC'+parseFloat(r.budget).toLocaleString('it-IT'):'—'}</span><div style={{display:'flex',alignItems:'center',gap:3}}><div style={{width:5,height:5,borderRadius:'50%',background:st.c}}/><span style={{fontSize:10,color:st.c}}>{st.l}</span></div></div></div>);})}</div>}

                  {flTab==='contabilita'&&<><div style={{display:'flex',gap:32,marginBottom:20,paddingBottom:14,borderBottom:`1px solid ${C.lineS}`}}>{[{l:'Fatturato',v:'\u20AC'+totFatt.toFixed(0),c:C.teal},{l:'Pagato',v:'\u20AC'+totPag.toFixed(0),c:C.grn},{l:'Da pagare',v:'\u20AC'+(totFatt-totPag).toFixed(0),c:(totFatt-totPag)>0?C.amb:C.grn}].map(k=>(<div key={k.l}><div style={{fontSize:11,color:C.t3}}>{k.l}</div><div style={{fontFamily:M,fontSize:18,fontWeight:500,color:k.c}}>{k.v}</div></div>))}</div>{fFatture.map(ft=>(<div key={ft.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.lineS}`}}><div><div style={{fontSize:12}}>N. {ft.numero}</div><div style={{fontSize:10,color:C.t3}}>{new Date(ft.data_emissione).toLocaleDateString('it-IT')}</div></div><div style={{textAlign:'right'}}><div style={{fontFamily:M,fontSize:12,color:C.teal}}>{'\u20AC'}{parseFloat(ft.totale||ft.importo).toLocaleString('it-IT')}</div><div style={{fontSize:10,color:ft.stato==='pagata'?C.grn:ft.stato==='scaduta'?C.red:C.amb}}>{ft.stato}</div></div></div>))}</>}

                  {flTab==='valutazioni'&&<>{fVal.length===0?<div style={{padding:24,color:C.t3}}>Nessuna valutazione</div>:fVal.map(v=>(<div key={v.id} style={{padding:'12px 0',borderBottom:`1px solid ${C.lineS}`}}><div style={{color:C.amb,fontSize:15}}>{'\u2605'.repeat(v.stelle)}<span style={{opacity:.15}}>{'\u2605'.repeat(5-v.stelle)}</span></div>{v.commento&&<div style={{fontSize:12,color:C.t2,marginTop:4,fontStyle:'italic'}}>"{v.commento}"</div>}<div style={{fontSize:10,color:C.t4,marginTop:3}}>{new Date(v.created_at).toLocaleDateString('it-IT')}</div></div>))}</>}
                </div>

                <div style={{borderLeft:`1px solid ${C.line}`,paddingLeft:24,overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
                  <div style={{fontSize:11,color:C.t3,marginBottom:8}}>Info</div>
                  {[{l:'Tariffa',v:fProfilo?.tariffa_oraria?'\u20AC'+fProfilo.tariffa_oraria+'/h':'—'},{l:'Esperienza',v:fProfilo?.anni_esperienza?fProfilo.anni_esperienza+' anni':'—'},{l:'Zone',v:(fProfilo?.zone_operative||[]).join(', ')||'—'},{l:'Fatturato',v:'\u20AC'+totFatt.toFixed(0)},{l:'Da pagare',v:'\u20AC'+(totFatt-totPag).toFixed(0)}].map(r=>(<div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:`1px solid ${C.lineS}`}}><span style={{fontSize:11,color:C.t3}}>{r.l}</span><span style={{fontSize:11,fontWeight:500}}>{r.v}</span></div>))}
                </div>
              </div>);
          })()}

          {(page==='nuovo'||page==='marketplace')&&<div style={{padding:'40px 0',textAlign:'center',color:C.t3}}>In arrivo</div>}
        </div>
      </div>
    </div>
  );
}

function Css(){return<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @keyframes spin{to{transform:rotate(360deg)}}
  *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:2px}
  ::selection{background:#1A9E8F22}
  input{font-family:'Inter',-apple-system,sans-serif}
  body{margin:0}
`}</style>;}
