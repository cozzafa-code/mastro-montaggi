// @ts-nocheck
// PortaleAzienda.tsx v5 — DESKTOP SaaS Layout
'use client';
import React, { useState, useEffect, useRef } from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const sb={
  get:async(t,p={})=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}?${new URLSearchParams(p)}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});return r.ok?r.json():[];}catch{return[];}},
  post:async(t,b)=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(b)});return r.ok?r.json():null;}catch{return null;}},
  patch:async(t,id,b)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(b)});}catch{}},
  upload:async(path,file)=>{try{const r=await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':file.type,'x-upsert':'true'},body:file});return r.ok?`${SB_URL}/storage/v1/object/public/foto-vani/${path}`:null;}catch{return null;}},
};

const F=`'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif`;
const M=`'JetBrains Mono','SF Mono',monospace`;
const C={bg:'#080C14',sidebar:'#0C1220',surface:'#111827',card:'#151E2F',cardH:'#1A2740',border:'#1E293B',borderL:'#283548',teal:'#2DD4BF',tealD:'#14B8A6',tealBg:'rgba(45,212,191,0.08)',tealBd:'rgba(45,212,191,0.2)',green:'#34D399',greenBg:'rgba(52,211,153,0.1)',amber:'#FBBF24',amberBg:'rgba(251,191,36,0.1)',red:'#F87171',redBg:'rgba(248,113,113,0.1)',blue:'#60A5FA',blueBg:'rgba(96,165,250,0.1)',purple:'#A78BFA',t1:'#F8FAFC',t2:'#94A3B8',t3:'#475569'};
const ST={nuova:{bg:C.amberBg,c:C.amber,l:'In attesa'},vista:{bg:C.blueBg,c:C.blue,l:'Presa in carico'},accettata:{bg:C.greenBg,c:C.green,l:'Accettata'},in_corso:{bg:C.tealBg,c:C.teal,l:'In lavorazione'},completata:{bg:'rgba(167,139,250,0.1)',c:C.purple,l:'Completata'},rifiutata:{bg:C.redBg,c:C.red,l:'Rifiutata'},annullata:{bg:'rgba(71,85,105,0.1)',c:C.t3,l:'Annullata'}};

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
  const [det,setDet]=useState({montaggi:[],fotoFasi:[],firme:[],fatture:[],costi:[],documenti:[],candidature:[]});
  const [search,setSearch]=useState('');
  const pollRef=useRef(null);

  useEffect(()=>{
    (async()=>{
      const azRes=await sb.get('aziende_freelance',{invite_code:'eq.'+inviteCode,limit:'1'});
      if(!azRes?.length){setNotFound(true);setLoading(false);return;}
      const az=azRes[0];setAzienda(az);
      const allAz=await sb.get('aziende_freelance',{nome:'eq.'+az.nome,attiva:'eq.true'});
      const ops=[];
      for(const a of(allAz||[])){const o=await sb.get('operatori',{id:'eq.'+a.operatore_id,limit:'1'});if(o?.[0])ops.push({...o[0],azienda_fl_id:a.id});}
      setFreelancers(ops);
      await loadRL(allAz||[]);
      setLoading(false);
    })();
    return()=>{if(pollRef.current)clearInterval(pollRef.current);};
  },[inviteCode]);

  useEffect(()=>{
    if(!azienda)return;
    pollRef.current=setInterval(async()=>{const a=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});await loadRL(a||[]);},30000);
    return()=>clearInterval(pollRef.current);
  },[azienda]);

  const loadRL=async(azL)=>{const all=[];for(const a of azL){const r=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+a.id,order:'created_at.desc',limit:'200'});all.push(...(r||[]));}all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setRichieste(all);};

  const openDet=async(r)=>{
    setSelR(r);setPage('dettaglio');
    const [docs,fat,cos]=await Promise.all([sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'}),sb.get('fatture_freelance',{richiesta_id:'eq.'+r.id,order:'data_emissione.desc'}),sb.get('costi_commessa',{richiesta_id:'eq.'+r.id,order:'data.desc'})]);
    let montaggi=[],fotoFasi=[],firme=[];
    if(r.commessa_id){const [mt,ft,fm]=await Promise.all([sb.get('montaggi',{commessa_id:'eq.'+r.commessa_id,limit:'10'}),sb.get('allegati_vano',{select:'*',limit:'50'}),sb.get('firma_collaudo',{select:'*',limit:'10'})]);montaggi=mt||[];fotoFasi=(ft||[]).filter(f=>f.fase);firme=fm||[];}
    const cands=await sb.get('candidature_marketplace',{richiesta_id:'eq.'+r.id});
    const enriched=[];for(const c of(cands||[])){const op=await sb.get('operatori',{id:'eq.'+c.operatore_id,limit:'1'});enriched.push({...c,operatore:op?.[0]||null});}
    setDet({montaggi,fotoFasi,firme,fatture:fat||[],costi:cos||[],documenti:docs||[],candidature:enriched});
  };

  const gn=(opId)=>{const f=freelancers.find(x=>x.id===opId);return f?`${f.nome} ${f.cognome}`:'—';};
  const rpf=(opId)=>richieste.filter(r=>r.operatore_id===opId);

  const kN=richieste.filter(r=>['nuova','vista'].includes(r.stato)).length;
  const kA=richieste.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
  const kC=richieste.filter(r=>r.stato==='completata').length;
  const kB=richieste.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(parseFloat(r.budget)||0),0);
  const kR=richieste.filter(r=>r.stato==='rifiutata').length;

  let filtered=richieste;
  if(filtro==='attivi')filtered=richieste.filter(r=>['nuova','vista','accettata','in_corso'].includes(r.stato));
  else if(filtro==='completati')filtered=richieste.filter(r=>r.stato==='completata');
  else if(filtro==='rifiutati')filtered=richieste.filter(r=>r.stato==='rifiutata');
  if(selFL)filtered=filtered.filter(r=>r.operatore_id===selFL.id);
  if(search)filtered=filtered.filter(r=>(r.cliente+r.indirizzo+r.note).toLowerCase().includes(search.toLowerCase()));

  if(loading)return<div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Css/><div style={{width:48,height:48,borderRadius:'50%',border:`3px solid ${C.border}`,borderTopColor:C.teal,animation:'spin 1s linear infinite'}}/></div>;
  if(notFound)return<div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',color:C.t1,fontFamily:F,fontSize:20,fontWeight:700}}><Css/>Link non valido</div>;

  // ═══ DESKTOP LAYOUT ═════════════════════════════════════════════════════════
  return(
    <div style={{display:'flex',height:'100vh',background:C.bg,fontFamily:F,overflow:'hidden'}}><Css/>

      {/* ─── SIDEBAR ─── */}
      <div style={{width:260,background:C.sidebar,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        {/* Logo */}
        <div style={{padding:'20px 20px 16px',borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${azienda?.colore||C.teal},${C.tealD})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#fff',boxShadow:`0 4px 12px ${azienda?.colore||C.teal}33`}}>{(azienda?.nome||'?')[0]}</div>
            <div><div style={{color:C.t1,fontWeight:700,fontSize:14}}>{azienda?.nome}</div><div style={{color:C.t3,fontSize:11}}>{freelancers.length} serramentisti</div></div>
          </div>
        </div>

        {/* Nav */}
        <div style={{padding:'12px 10px',flex:1,overflowY:'auto'}}>
          <NavBtn active={page==='dashboard'&&!selFL} onClick={()=>{setPage('dashboard');setSelFL(null);setSelR(null);}} icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" label="Dashboard" badge={kN>0?kN:null}/>
          <NavBtn active={page==='nuovo'} onClick={()=>setPage('nuovo')} icon="M12 4v16m8-8H4" label="Nuovo lavoro"/>
          <NavBtn active={page==='marketplace'} onClick={()=>setPage('marketplace')} icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9" label="Marketplace"/>

          <div style={{fontSize:10,color:C.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.1em',padding:'16px 10px 8px'}}>Serramentisti</div>
          {freelancers.map(f=>{
            const fR=rpf(f.id);const fA=fR.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
            return(
              <button key={f.id} onClick={()=>{setSelFL(f);setPage('dashboard');setSelR(null);}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,border:'none',cursor:'pointer',marginBottom:2,
                  background:selFL?.id===f.id?C.tealBg:'transparent',transition:'.15s'}}>
                <div style={{width:28,height:28,borderRadius:8,background:selFL?.id===f.id?`${C.teal}33`:C.card,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:selFL?.id===f.id?C.teal:C.t2,fontFamily:F,flexShrink:0}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                <div style={{flex:1,textAlign:'left'}}><div style={{fontSize:12,fontWeight:selFL?.id===f.id?700:500,color:selFL?.id===f.id?C.teal:C.t2}}>{f.nome} {f.cognome}</div></div>
                {fA>0&&<div style={{background:C.tealBg,color:C.teal,borderRadius:6,padding:'1px 6px',fontSize:10,fontWeight:700}}>{fA}</div>}
              </button>
            );
          })}
        </div>

        {/* Bottom */}
        <div style={{padding:'12px 16px',borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.t3,textAlign:'center'}}>Powered by <span style={{color:C.teal,fontWeight:700}}>MASTRO</span></div>
        </div>
      </div>

      {/* ─── MAIN AREA ─── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* TOP BAR */}
        <div style={{padding:'12px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:16,flexShrink:0,background:C.surface}}>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:C.t1}}>{selFL?`${selFL.nome} ${selFL.cognome}`:page==='nuovo'?'Nuovo lavoro':page==='marketplace'?'Marketplace':page==='dettaglio'&&selR?selR.cliente:'Dashboard'}</div>
            {selFL&&<div style={{fontSize:12,color:C.t3}}>{selFL.ruolo||'montatore'} — {rpf(selFL.id).length} lavori</div>}
          </div>
          {/* Search */}
          <div style={{position:'relative',width:280}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" style={{position:'absolute',left:12,top:9}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca cliente, indirizzo..."
              style={{width:'100%',background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px 8px 36',fontSize:13,color:C.t1,fontFamily:F,outline:'none',boxSizing:'border-box'}}/>
          </div>
          {selFL&&<button onClick={()=>{setSelFL(null);}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:'7px 14px',fontSize:12,color:C.t2,cursor:'pointer',fontFamily:F}}>Vedi tutti</button>}
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* ═══ DASHBOARD ═══ */}
          {(page==='dashboard')&&<>
            {/* KPI row */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:24}}>
              {[
                {n:kN,l:'In attesa',c:C.amber,bg:C.amberBg,i:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'},
                {n:kA,l:'Attivi',c:C.blue,bg:C.blueBg,i:'M13 10V3L4 14h7v7l9-11h-7z'},
                {n:kC,l:'Completati',c:C.green,bg:C.greenBg,i:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'},
                {n:kR,l:'Rifiutati',c:C.red,bg:C.redBg,i:'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'},
                {n:kB,l:'Volume totale',c:C.teal,bg:C.tealBg,cur:1,i:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'},
              ].map((k,i)=>(
                <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'18px 16px',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:14,right:14,width:34,height:34,borderRadius:10,background:k.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={k.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.i}/></svg>
                  </div>
                  <div style={{fontFamily:M,fontWeight:700,fontSize:k.cur?18:26,color:C.t1,letterSpacing:'-.02em'}}>{k.cur?'\u20AC'+k.n.toLocaleString('it-IT',{maximumFractionDigits:0}):k.n}</div>
                  <div style={{fontSize:11,color:C.t3,fontWeight:500,marginTop:4,textTransform:'uppercase',letterSpacing:'.06em'}}>{k.l}</div>
                </div>
              ))}
            </div>

            {/* Filtri */}
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              {[{k:'tutti',l:'Tutti',n:richieste.length},{k:'attivi',l:'Attivi',n:kA+kN},{k:'completati',l:'Completati',n:kC},{k:'rifiutati',l:'Rifiutati',n:kR}].map(f=>(
                <button key={f.k} onClick={()=>setFiltro(f.k)}
                  style={{background:filtro===f.k?C.tealBg:'transparent',color:filtro===f.k?C.teal:C.t3,border:`1px solid ${filtro===f.k?C.tealBd:C.border}`,
                    borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,transition:'.15s'}}>
                  {f.l} ({f.n})
                </button>
              ))}
            </div>

            {/* TABLE */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden'}}>
              {/* Table header */}
              <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr 1fr 120px',padding:'10px 16px',borderBottom:`1px solid ${C.border}`,background:C.surface}}>
                {['Cliente','Indirizzo','Serramentista','Vani','Budget','Data','Stato'].map(h=>(
                  <div key={h} style={{fontSize:10,fontWeight:600,color:C.t3,textTransform:'uppercase',letterSpacing:'.08em'}}>{h}</div>
                ))}
              </div>
              {/* Table rows */}
              {filtered.length===0?(
                <div style={{padding:'40px 16px',textAlign:'center',color:C.t3,fontSize:14}}>Nessun lavoro trovato</div>
              ):filtered.map((r,i)=>{
                const st=ST[r.stato]||ST.nuova;const nV=(r.vani_json||[]).length;const isMkt=r.tipo_invio==='marketplace';
                return(
                  <div key={r.id} onClick={()=>openDet(r)}
                    style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr 1fr 120px',padding:'12px 16px',borderBottom:`1px solid ${C.border}`,cursor:'pointer',transition:'.1s',background:selR?.id===r.id?C.tealBg:'transparent'}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.cardH}
                    onMouseLeave={e=>e.currentTarget.style.background=selR?.id===r.id?C.tealBg:'transparent'}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.t1}}>{r.cliente}</div>
                      {r.urgente&&<span style={{fontSize:9,fontWeight:700,color:C.red,marginLeft:6}}>URGENTE</span>}
                      {isMkt&&<span style={{fontSize:9,fontWeight:700,color:C.purple,marginLeft:4}}>MKT</span>}
                    </div>
                    <div style={{fontSize:12,color:C.t3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.indirizzo}</div>
                    <div style={{fontSize:12,color:C.t2}}>{gn(r.operatore_id)}</div>
                    <div style={{fontFamily:M,fontSize:12,color:C.t2}}>{nV}</div>
                    <div style={{fontFamily:M,fontSize:12,color:C.teal,fontWeight:600}}>{r.budget?'\u20AC'+parseFloat(r.budget).toLocaleString('it-IT'):'—'}</div>
                    <div style={{fontSize:11,color:C.t3}}>{r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'—'}</div>
                    <div><span style={{display:'inline-flex',alignItems:'center',gap:4,background:st.bg,borderRadius:6,padding:'3px 10px'}}><div style={{width:6,height:6,borderRadius:'50%',background:st.c}}/><span style={{fontSize:10,fontWeight:600,color:st.c}}>{st.l}</span></span></div>
                  </div>
                );
              })}
            </div>
          </>}

          {/* ═══ DETTAGLIO ═══ */}
          {page==='dettaglio'&&selR&&(()=>{
            const r=selR;const st=ST[r.stato]||ST.nuova;
            const vani=r.vani_json||[];const allegati=r.allegati_json||[];
            const {montaggi,fotoFasi,firme,fatture,costi,documenti,candidature}=det;
            const mt=montaggi[0];const firma=firme[0];
            const totC=costi.reduce((s,c)=>s+(parseFloat(c.totale)||parseFloat(c.importo)||0),0);
            const totF=fatture.reduce((s,f)=>s+(parseFloat(f.totale)||parseFloat(f.importo)||0),0);
            const totP=fatture.filter(f=>f.stato==='pagata').reduce((s,f)=>s+(parseFloat(f.totale)||parseFloat(f.importo)||0),0);
            return(
              <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:20}}>
                {/* LEFT — main info */}
                <div>
                  {/* Header card */}
                  <div style={{background:`linear-gradient(135deg,${C.card},${st.bg})`,border:`1px solid ${st.c}22`,borderRadius:16,padding:24,marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontSize:24,fontWeight:800,color:C.t1,letterSpacing:'-.02em'}}>{r.cliente}</div>
                        <div style={{fontSize:14,color:C.t2,marginTop:6}}>{r.indirizzo}</div>
                        {r.telefono_cliente&&<div style={{fontSize:13,color:C.t3,marginTop:2}}>Tel: {r.telefono_cliente}</div>}
                        <div style={{fontSize:12,color:C.teal,marginTop:6,fontWeight:600}}>Assegnato a: {gn(r.operatore_id)}</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:6,background:st.bg,border:`1px solid ${st.c}33`,borderRadius:10,padding:'6px 14px'}}><div style={{width:8,height:8,borderRadius:'50%',background:st.c}}/><span style={{fontSize:13,fontWeight:700,color:st.c}}>{st.l}</span></span>
                        {r.urgente&&<span style={{fontSize:11,fontWeight:700,color:C.red,background:C.redBg,borderRadius:6,padding:'3px 10px'}}>URGENTE</span>}
                      </div>
                    </div>
                    {/* Progress */}
                    <div style={{display:'flex',gap:4}}>
                      {['nuova','accettata','in_corso','completata'].map((s,i)=>{
                        const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);
                        return(<div key={s} style={{flex:1}}><div style={{height:4,borderRadius:2,background:idx>=i?C.teal:`${C.t3}33`}}/><div style={{fontSize:9,color:idx>=i?C.teal:C.t3,fontWeight:600,marginTop:4,textAlign:'center'}}>{s==='nuova'?'Inviata':s==='accettata'?'Accettata':s==='in_corso'?'In corso':'Completata'}</div></div>);
                      })}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:16}}>
                    {[{l:'Data',v:r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'N/D'},{l:'Ora',v:r.ora_preferita?.slice(0,5)||'N/D'},{l:'Budget',v:r.budget?`\u20AC${parseFloat(r.budget).toLocaleString('it-IT')}`:'N/D'},{l:'Vani',v:`${vani.length}`}].map((d,i)=>(
                      <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px'}}>
                        <div style={{fontSize:10,color:C.t3,fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em'}}>{d.l}</div>
                        <div style={{fontSize:15,fontWeight:700,color:C.t1,marginTop:3}}>{d.v}</div>
                      </div>
                    ))}
                  </div>

                  {r.note&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 18px',marginBottom:16}}><div style={{fontSize:10,color:C.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Note</div><div style={{fontSize:14,color:C.t2,lineHeight:1.5}}>{r.note}</div></div>}

                  {/* Vani table */}
                  {vani.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:16}}>
                    <div style={{padding:'12px 18px',borderBottom:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.t1}}>Vani ({vani.length})</div>
                    <div style={{display:'grid',gridTemplateColumns:'40px 1fr 1fr 1fr 1fr 1fr',padding:'8px 18px',borderBottom:`1px solid ${C.border}`,background:C.surface}}>
                      {['#','Tipo','Materiale','Misure','Stanza','Piano'].map(h=><div key={h} style={{fontSize:9,color:C.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em'}}>{h}</div>)}
                    </div>
                    {vani.map((v,i)=>(
                      <div key={i} style={{display:'grid',gridTemplateColumns:'40px 1fr 1fr 1fr 1fr 1fr',padding:'10px 18px',borderBottom:`1px solid ${C.border}`}}>
                        <div style={{fontSize:12,color:C.t3,fontFamily:M}}>{i+1}</div>
                        <div style={{fontSize:12,color:C.t1,fontWeight:600}}>{v.tipo}</div>
                        <div><span style={{fontSize:11,color:C.teal,fontWeight:600,background:C.tealBg,borderRadius:4,padding:'1px 8px'}}>{v.materiale}</span></div>
                        <div style={{fontFamily:M,fontSize:12,color:C.t2}}>{v.larghezza&&v.altezza?`${v.larghezza}\u00D7${v.altezza}`:'\u2014'}</div>
                        <div style={{fontSize:12,color:C.t3}}>{v.stanza||'\u2014'}</div>
                        <div style={{fontSize:12,color:C.t3}}>{v.piano||'\u2014'}</div>
                      </div>
                    ))}
                  </div>}

                  {/* Foto fasi */}
                  {fotoFasi.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.t1,marginBottom:12}}>Documentazione fotografica</div>
                    {['prima','durante','dopo'].map(fase=>{
                      const fotos=fotoFasi.filter(f=>f.fase===fase);if(!fotos.length)return null;
                      return(<div key={fase} style={{marginBottom:14}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>{fase==='prima'?'Prima dei lavori':fase==='durante'?'Durante':'Dopo'} ({fotos.length})</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>{fotos.map((f,i)=><img key={i} src={f.file_url||f.url} alt="" style={{width:'100%',height:80,objectFit:'cover',borderRadius:8,border:`1px solid ${C.border}`}}/>)}</div>
                      </div>);
                    })}
                  </div>}

                  {/* Firma */}
                  {firma&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.t1,marginBottom:8}}>Firma collaudo</div>
                    <img src={firma.firma_url} alt="Firma" style={{maxWidth:'100%',maxHeight:120,border:`1px solid ${C.border}`,borderRadius:8}}/>
                    <div style={{fontSize:11,color:C.t3,marginTop:6}}>Firmato da {firma.firmato_da}</div>
                  </div>}
                </div>

                {/* RIGHT — sidebar panel */}
                <div>
                  {/* Riepilogo economico */}
                  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:14}}>Riepilogo economico</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                      {[
                        {l:'Budget',v:`\u20AC${parseFloat(r.budget||0).toLocaleString('it-IT')}`,c:C.t1},
                        {l:'Costi effettivi',v:`\u20AC${totC.toFixed(0)}`,c:totC>(parseFloat(r.budget)||0)?C.red:C.green},
                        {l:'Fatturato',v:`\u20AC${totF.toFixed(0)}`,c:C.teal},
                        {l:'Da pagare',v:`\u20AC${(totF-totP).toFixed(0)}`,c:(totF-totP)>0?C.amber:C.green},
                      ].map((k,i)=>(
                        <div key={i} style={{background:C.surface,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                          <div style={{fontFamily:M,fontWeight:700,fontSize:16,color:k.c}}>{k.v}</div>
                          <div style={{fontSize:9,color:C.t3,marginTop:2}}>{k.l}</div>
                        </div>
                      ))}
                    </div>
                    {mt&&<div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                      <div style={{background:C.surface,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                        <div style={{fontFamily:M,fontWeight:700,fontSize:16,color:C.t1}}>{mt.ore_preventivate||'\u2014'}h</div>
                        <div style={{fontSize:9,color:C.t3}}>Ore prev.</div>
                      </div>
                      <div style={{background:C.surface,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                        <div style={{fontFamily:M,fontWeight:700,fontSize:16,color:mt.ore_reali>mt.ore_preventivate?C.red:C.green}}>{mt.ore_reali?mt.ore_reali.toFixed(1):'\u2014'}h</div>
                        <div style={{fontSize:9,color:C.t3}}>Ore reali</div>
                      </div>
                    </div>}
                  </div>

                  {/* Fatture */}
                  {fatture.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Fatture ({fatture.length})</div>
                    {fatture.map(f=>{
                      const fc=f.stato==='pagata'?C.green:f.stato==='scaduta'?C.red:C.amber;
                      return(
                        <div key={f.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:C.t1}}>N. {f.numero}</div>
                            <div style={{fontSize:10,color:C.t3}}>{new Date(f.data_emissione).toLocaleDateString('it-IT')}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontFamily:M,fontWeight:700,fontSize:14,color:C.teal}}>{'\u20AC'}{parseFloat(f.totale||f.importo).toLocaleString('it-IT')}</div>
                            <span style={{fontSize:9,fontWeight:700,color:fc}}>{f.stato}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>}

                  {/* Costi */}
                  {costi.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Dettaglio costi ({costi.length})</div>
                    {costi.map((c,i)=>(
                      <div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<costi.length-1?`1px solid ${C.border}`:'none'}}>
                        <div><div style={{fontSize:12,fontWeight:500,color:C.t1}}>{c.descrizione}</div><div style={{fontSize:10,color:C.t3}}>{c.tipo}</div></div>
                        <div style={{fontFamily:M,fontSize:12,fontWeight:600,color:C.t2}}>{'\u20AC'}{parseFloat(c.totale||c.importo).toLocaleString('it-IT')}</div>
                      </div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,marginTop:6,borderTop:`1px solid ${C.borderL}`}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.t1}}>Totale</span>
                      <span style={{fontFamily:M,fontWeight:800,fontSize:16,color:C.teal}}>{'\u20AC'}{totC.toFixed(2)}</span>
                    </div>
                  </div>}

                  {/* Report */}
                  <button onClick={()=>{
                    const w=window.open('','_blank');if(!w)return;
                    w.document.write(`<html><head><title>Report ${r.cliente}</title><style>*{margin:0;box-sizing:border-box}body{font-family:'DM Sans',system-ui;padding:40px;max-width:800px;margin:0 auto;color:#1a1a1a}h1{font-size:24px;font-weight:800}h3{font-size:14px;font-weight:700;margin:20px 0 8px;color:#0D9488}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #e5e5e5;padding:8px 10px;text-align:left;font-size:12px}th{background:#f8f8f8;font-weight:700;font-size:10px;text-transform:uppercase;color:#666}.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.kpi>div{text-align:center;padding:14px;background:#f0fafa;border-radius:10px}.kpi .n{font-size:20px;font-weight:800;color:#0D9488}.kpi .l{font-size:9px;color:#888;margin-top:2px;text-transform:uppercase}</style></head><body>`);
                    w.document.write(`<h1>${r.cliente}</h1><p style="color:#666;font-size:12px;margin-top:4px">${r.indirizzo} \u2014 ${new Date().toLocaleDateString('it-IT')}</p>`);
                    w.document.write(`<div class="kpi"><div><div class="n">${vani.length}</div><div class="l">Vani</div></div><div><div class="n">\u20AC${parseFloat(r.budget||0).toLocaleString('it-IT')}</div><div class="l">Budget</div></div><div><div class="n">\u20AC${totC.toFixed(0)}</div><div class="l">Costi</div></div><div><div class="n">${mt?.ore_reali?mt.ore_reali.toFixed(1)+'h':'\u2014'}</div><div class="l">Ore</div></div></div>`);
                    if(vani.length){w.document.write('<h3>Vani</h3><table><tr><th>#</th><th>Tipo</th><th>Materiale</th><th>Misure</th><th>Stanza</th></tr>');vani.forEach((v,i)=>w.document.write(`<tr><td>${i+1}</td><td>${v.tipo}</td><td>${v.materiale}</td><td>${v.larghezza&&v.altezza?v.larghezza+'\u00D7'+v.altezza:'\u2014'}</td><td>${v.stanza||'\u2014'}</td></tr>`));w.document.write('</table>');}
                    if(costi.length){w.document.write('<h3>Costi</h3><table><tr><th>Descrizione</th><th>Tipo</th><th>Importo</th></tr>');costi.forEach(c=>w.document.write(`<tr><td>${c.descrizione}</td><td>${c.tipo}</td><td>\u20AC${parseFloat(c.totale||c.importo).toLocaleString('it-IT')}</td></tr>`));w.document.write(`<tr><td colspan="2" style="text-align:right;font-weight:700">Totale</td><td style="font-weight:700">\u20AC${totC.toFixed(2)}</td></tr></table>`);}
                    if(fatture.length){w.document.write('<h3>Fatture</h3><table><tr><th>N.</th><th>Data</th><th>Totale</th><th>Stato</th></tr>');fatture.forEach(f=>w.document.write(`<tr><td>${f.numero}</td><td>${new Date(f.data_emissione).toLocaleDateString('it-IT')}</td><td>\u20AC${parseFloat(f.totale||f.importo).toLocaleString('it-IT')}</td><td>${f.stato}</td></tr>`));w.document.write('</table>');}
                    w.document.write('<p style="margin-top:32px;color:#ccc;font-size:9px">MASTRO Suite \u2014 fliwoX Montaggi</p></body></html>');w.document.close();w.print();
                  }} style={{width:'100%',background:`linear-gradient(135deg,${C.card},${C.tealBg})`,color:C.teal,border:`1px solid ${C.tealBd}`,borderRadius:12,padding:'12px 0',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Stampa / Salva report PDF
                  </button>

                  <button onClick={()=>{setPage('dashboard');setSelR(null);}} style={{width:'100%',marginTop:8,background:'transparent',color:C.t3,border:`1px solid ${C.border}`,borderRadius:12,padding:'10px 0',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>
                    \u2190 Torna alla lista
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ═══ NUOVO + MARKETPLACE placeholder ═══ */}
          {(page==='nuovo'||page==='marketplace')&&<div style={{maxWidth:640}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:32,textAlign:'center'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.5" style={{margin:'0 auto 16px',display:'block'}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style={{fontSize:18,fontWeight:700,color:C.t1,marginBottom:8}}>{page==='marketplace'?'Pubblica sul Marketplace':'Crea nuovo lavoro'}</div>
              <div style={{fontSize:14,color:C.t2,marginBottom:24,lineHeight:1.5}}>{page==='marketplace'?'Pubblica la tua richiesta a tutti i serramentisti della piattaforma. Riceverai candidature con prezzi proposti.':'Compila i dati del lavoro e assegnalo ad un serramentista. Puoi anche importare da Opera, FpPro, Finestra 3000, Excel o CSV.'}</div>
              <div style={{color:C.t3,fontSize:13}}>Form completo in arrivo — per ora usa il bottone + dalla dashboard mobile</div>
            </div>
          </div>}

        </div>
      </div>
    </div>
  );
}

// ═══ COMPONENTS ═══════════════════════════════════════════════════════════════
function NavBtn({active,onClick,icon,label,badge}){
  return(
    <button onClick={onClick} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,border:'none',cursor:'pointer',marginBottom:2,background:active?C.tealBg:'transparent',transition:'.15s'}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active?C.teal:C.t3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
      <span style={{fontSize:13,fontWeight:active?700:500,color:active?C.teal:C.t2,flex:1,textAlign:'left',fontFamily:F}}>{label}</span>
      {badge&&<span style={{background:`linear-gradient(135deg,${C.amber},#F59E0B)`,color:'#000',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:800}}>{badge}</span>}
    </button>
  );
}

function Css(){return<style>{`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800&family=JetBrains+Mono:wght@500;700&display=swap');
  @keyframes spin{to{transform:rotate(360deg)}}
  *::-webkit-scrollbar{width:6px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#283548;border-radius:3px}
  input,select,textarea{font-family:'DM Sans',-apple-system,sans-serif}
`}</style>;}
