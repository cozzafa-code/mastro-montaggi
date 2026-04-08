// @ts-nocheck
// PortaleAzienda.tsx v4 — WOW Premium Portal
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const sb={
  get:async(t,p={})=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}?${new URLSearchParams(p)}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});return r.ok?r.json():[];}catch{return[];}},
  post:async(t,b)=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(b)});return r.ok?r.json():null;}catch{return null;}},
  patch:async(t,id,b)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(b)});}catch{}},
  upload:async(path,file)=>{try{const r=await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':file.type,'x-upsert':'true'},body:file});return r.ok?`${SB_URL}/storage/v1/object/public/foto-vani/${path}`:null;}catch{return null;}},
};

// ═══ DESIGN SYSTEM — PREMIUM ═══════════════════════════════════════════════════
const FONT = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
const MONO = `'JetBrains Mono', 'SF Mono', monospace`;
const C = {
  // Dark theme - premium
  bg: '#0A0F1A',
  surface: '#111827',
  surfaceHover: '#1A2235',
  card: '#151E2F',
  cardHover: '#1A2740',
  border: '#1E293B',
  borderLight: '#283548',
  // Accent
  teal: '#2DD4BF',
  tealDark: '#14B8A6',
  tealBg: 'rgba(45,212,191,0.08)',
  tealBorder: 'rgba(45,212,191,0.2)',
  // Status
  green: '#34D399',
  greenBg: 'rgba(52,211,153,0.1)',
  amber: '#FBBF24',
  amberBg: 'rgba(251,191,36,0.1)',
  red: '#F87171',
  redBg: 'rgba(248,113,113,0.1)',
  blue: '#60A5FA',
  blueBg: 'rgba(96,165,250,0.1)',
  purple: '#A78BFA',
  // Text
  t1: '#F8FAFC',
  t2: '#94A3B8',
  t3: '#475569',
};

const STATO={
  nuova:{bg:C.amberBg,c:C.amber,l:'In attesa',dot:C.amber},
  vista:{bg:C.blueBg,c:C.blue,l:'Presa in carico',dot:C.blue},
  accettata:{bg:C.greenBg,c:C.green,l:'Accettata',dot:C.green},
  in_corso:{bg:C.tealBg,c:C.teal,l:'In lavorazione',dot:C.teal},
  completata:{bg:'rgba(167,139,250,0.1)',c:C.purple,l:'Completata',dot:C.purple},
  rifiutata:{bg:C.redBg,c:C.red,l:'Rifiutata',dot:C.red},
  annullata:{bg:'rgba(71,85,105,0.1)',c:C.t3,l:'Annullata',dot:C.t3},
};

const TIPI_VANO=['Finestra','Portafinestra','Porta','Scorrevole','Velux','Persiana','Zanzariera','Cassonetto','Altro'];
const MAT_OPT=['PVC','Alluminio','Legno','Alluminio-Legno','Acciaio','Altro'];
const DOC_TIPI=['planimetria','specifiche','contratto','preventivo','rapporto','foto','certificato','altro'];

// ═══ GLOBAL STYLES (injected once) ═══════════════════════════════════════════
const GlobalCSS = () => <style>{`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800&family=JetBrains+Mono:wght@500;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  .card-hover{transition:all .2s ease}
  .card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.3),0 0 0 1px rgba(45,212,191,.15)!important}
  .btn-glow{transition:all .15s ease}
  .btn-glow:hover{box-shadow:0 0 20px rgba(45,212,191,.3),0 4px 16px rgba(0,0,0,.3)}
  .btn-glow:active{transform:scale(.97)}
  .glass{background:rgba(17,24,39,.7);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
  *::-webkit-scrollbar{width:6px;height:6px}
  *::-webkit-scrollbar-track{background:transparent}
  *::-webkit-scrollbar-thumb{background:#283548;border-radius:3px}
  *::-webkit-scrollbar-thumb:hover{background:#3B4D66}
  input,select,textarea{font-family:${FONT}}
`}</style>;

// ═══ MAIN COMPONENT ══════════════════════════════════════════════════════════
export default function PortaleAzienda({inviteCode}:{inviteCode:string}){
  const [loading,setLoading]=useState(true);
  const [azienda,setAzienda]=useState(null);
  const [notFound,setNotFound]=useState(false);
  const [freelancers,setFreelancers]=useState([]);
  const [richieste,setRichieste]=useState([]);
  const [view,setView]=useState('dashboard');
  const [selFreelancer,setSelFreelancer]=useState(null);
  const [selRichiesta,setSelRichiesta]=useState(null);
  const [filtro,setFiltro]=useState('tutti');
  const [dettaglio,setDettaglio]=useState({montaggi:[],fotoFasi:[],firme:[],fatture:[],costi:[],documenti:[],candidature:[]});
  const [showImport,setShowImport]=useState(false);
  const pollRef=useRef(null);

  useEffect(()=>{
    (async()=>{
      const azRes=await sb.get('aziende_freelance',{invite_code:'eq.'+inviteCode,limit:'1'});
      if(!azRes?.length){setNotFound(true);setLoading(false);return;}
      const az=azRes[0];setAzienda(az);
      const allAz=await sb.get('aziende_freelance',{nome:'eq.'+az.nome,attiva:'eq.true'});
      const ops=[];
      for(const a of(allAz||[])){
        const o=await sb.get('operatori',{id:'eq.'+a.operatore_id,limit:'1'});
        if(o?.[0])ops.push({...o[0],azienda_fl_id:a.id});
      }
      setFreelancers(ops);
      await loadRichieste(allAz||[]);
      setLoading(false);
    })();
    return()=>{if(pollRef.current)clearInterval(pollRef.current);};
  },[inviteCode]);

  useEffect(()=>{
    if(!azienda)return;
    pollRef.current=setInterval(async()=>{
      const allAz=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});
      await loadRichieste(allAz||[]);
    },30000);
    return()=>clearInterval(pollRef.current);
  },[azienda]);

  const loadRichieste=async(azList)=>{
    const all=[];
    for(const a of azList){
      const rl=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+a.id,order:'created_at.desc',limit:'100'});
      all.push(...(rl||[]));
    }
    all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    setRichieste(all);
  };

  const openDettaglio=async(r)=>{
    setSelRichiesta(r);setView('dettaglio');
    const [docs,cands,fat,cos]=await Promise.all([
      sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'}),
      sb.get('candidature_marketplace',{richiesta_id:'eq.'+r.id,order:'created_at.desc'}),
      sb.get('fatture_freelance',{richiesta_id:'eq.'+r.id,order:'data_emissione.desc'}),
      sb.get('costi_commessa',{richiesta_id:'eq.'+r.id,order:'data.desc'}),
    ]);
    let montaggi=[],fotoFasi=[],firme=[];
    if(r.commessa_id){
      const [mt,ft,fm]=await Promise.all([
        sb.get('montaggi',{commessa_id:'eq.'+r.commessa_id,limit:'10'}),
        sb.get('allegati_vano',{select:'*',limit:'50'}),
        sb.get('firma_collaudo',{select:'*',limit:'10'}),
      ]);
      montaggi=mt||[];fotoFasi=(ft||[]).filter(f=>f.fase);firme=fm||[];
    }
    // Enrich candidature
    const enriched=[];
    for(const c of(cands||[])){
      const op=await sb.get('operatori',{id:'eq.'+c.operatore_id,limit:'1'});
      enriched.push({...c,operatore:op?.[0]||null});
    }
    setDettaglio({montaggi,fotoFasi,firme,fatture:fat||[],costi:cos||[],documenti:docs||[],candidature:enriched});
  };

  const getName=(opId)=>{const f=freelancers.find(x=>x.id===opId);return f?`${f.nome} ${f.cognome}`:'—';};
  const richPerFreel=(opId)=>richieste.filter(r=>r.operatore_id===opId);

  // KPI
  const kNuove=richieste.filter(r=>['nuova','vista'].includes(r.stato)).length;
  const kAttivi=richieste.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
  const kComp=richieste.filter(r=>r.stato==='completata').length;
  const kBudget=richieste.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(r.budget||0),0);

  const filtered=filtro==='tutti'?richieste:filtro==='attivi'?richieste.filter(r=>['nuova','vista','accettata','in_corso'].includes(r.stato)):filtro==='completati'?richieste.filter(r=>r.stato==='completata'):richieste;

  // ─── LOADING ────────────────────────────────────────────────────────────────
  if(loading)return(
    <Shell><GlobalCSS/>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:16}}>
        <div style={{width:48,height:48,borderRadius:'50%',border:`3px solid ${C.border}`,borderTopColor:C.teal,animation:'spin 1s linear infinite'}}/>
        <div style={{color:C.t2,fontSize:14,fontFamily:FONT}}>Caricamento portale...</div>
      </div>
    </Shell>
  );

  if(notFound)return(
    <Shell><GlobalCSS/>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:20,padding:32}}>
        <div style={{width:80,height:80,borderRadius:24,background:C.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:24,fontWeight:800,color:C.t1,fontFamily:FONT,marginBottom:8}}>Link non valido</div>
          <div style={{fontSize:14,color:C.t2,maxWidth:320,lineHeight:1.5}}>Questo link di invito non esiste o è stato disattivato. Contatta il tuo montatore per un nuovo link.</div>
        </div>
      </div>
    </Shell>
  );

  // ─── NAV ────────────────────────────────────────────────────────────────────
  const goBack=()=>{setView('dashboard');setSelRichiesta(null);setSelFreelancer(null);};

  const TopBar=()=>(
    <div className="glass" style={{position:'sticky',top:0,zIndex:100,padding:'14px 20px',borderBottom:`1px solid ${C.border}`}}>
      <div style={{maxWidth:900,margin:'0 auto',display:'flex',alignItems:'center',gap:14}}>
        {view!=='dashboard'&&<button onClick={goBack} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,width:36,height:36,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.t2} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>}
        <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${azienda?.colore||C.teal},${C.tealDark})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',fontFamily:FONT,flexShrink:0,boxShadow:`0 4px 16px ${azienda?.colore||C.teal}33`}}>
          {(azienda?.nome||'?')[0]}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:C.t1,fontWeight:700,fontSize:16,fontFamily:FONT,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{azienda?.nome}</div>
          <div style={{color:C.t3,fontSize:12,fontFamily:FONT}}>{freelancers.length} serramentist{freelancers.length===1?'a':'i'}</div>
        </div>
        {view==='dashboard'&&kNuove>0&&<div style={{background:`linear-gradient(135deg,${C.amber},#F59E0B)`,color:'#000',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:800,fontFamily:FONT,animation:'pulse 2s infinite'}}>{kNuove} nuov{kNuove===1?'o':'i'}</div>}
      </div>
    </div>
  );

  // ═══ DASHBOARD ══════════════════════════════════════════════════════════════
  if(view==='dashboard')return(
    <Shell><GlobalCSS/><TopBar/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px 120px'}}>

        {/* KPI Grid — glassmorphism */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:32,animation:'fadeUp .5s ease'}}>
          {[
            {n:kNuove,l:'In attesa',c:C.amber,bg:C.amberBg,icon:'M12 8v4l3 3'},
            {n:kAttivi,l:'Attivi',c:C.blue,bg:C.blueBg,icon:'M13 2L3 14h9l-1 8 10-12h-9l1-8'},
            {n:kComp,l:'Completati',c:C.green,bg:C.greenBg,icon:'M20 6L9 17l-5-5'},
            {n:kBudget,l:'Totale',c:C.teal,bg:C.tealBg,cur:true,icon:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6'},
          ].map((k,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'20px 16px',position:'relative',overflow:'hidden',animation:`fadeUp .5s ease ${i*.08}s both`}}>
              <div style={{position:'absolute',top:12,right:12,width:32,height:32,borderRadius:10,background:k.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={k.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.icon}/></svg>
              </div>
              <div style={{fontFamily:MONO,fontWeight:700,fontSize:k.cur?20:28,color:C.t1,letterSpacing:'-0.02em'}}>
                {k.cur?'\u20AC'+k.n.toLocaleString('it-IT'):k.n}
              </div>
              <div style={{fontSize:11,color:C.t3,fontWeight:500,marginTop:4,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:FONT}}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* SERRAMENTISTI */}
        <SectionTitle>I miei serramentisti</SectionTitle>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(freelancers.length+1,4)},1fr)`,gap:12,marginBottom:32}}>
          {freelancers.map((f,i)=>{
            const fR=richPerFreel(f.id);
            const fA=fR.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
            const fC=fR.filter(r=>r.stato==='completata').length;
            return(
              <button key={f.id} className="card-hover" onClick={()=>{setSelFreelancer(f);setView('freelancer');}}
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,cursor:'pointer',textAlign:'left',animation:`fadeUp .5s ease ${i*.06}s both`}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.teal}22,${C.teal}44)`,border:`1.5px solid ${C.tealBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:C.teal,fontFamily:FONT}}>
                    {(f.nome||'?')[0]}{(f.cognome||'?')[0]}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:C.t1,fontFamily:FONT}}>{f.nome} {f.cognome}</div>
                    <div style={{fontSize:11,color:C.t3,fontFamily:FONT}}>{f.ruolo||'montatore'}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:12}}>
                  <div style={{flex:1,background:C.blueBg,borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
                    <div style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:C.blue}}>{fA}</div>
                    <div style={{fontSize:9,color:C.t3,fontWeight:500}}>Attivi</div>
                  </div>
                  <div style={{flex:1,background:C.greenBg,borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
                    <div style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:C.green}}>{fC}</div>
                    <div style={{fontSize:9,color:C.t3,fontWeight:500}}>Fatti</div>
                  </div>
                </div>
              </button>
            );
          })}
          {/* Marketplace card */}
          <button className="card-hover" onClick={()=>setView('marketplace')}
            style={{background:`linear-gradient(135deg,${C.card},${C.tealBg})`,border:`1px solid ${C.tealBorder}`,borderRadius:16,padding:20,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:44,height:44,borderRadius:14,background:C.tealBg,border:`1.5px solid ${C.tealBorder}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div style={{fontWeight:700,fontSize:14,color:C.teal,fontFamily:FONT}}>Marketplace</div>
            <div style={{fontSize:12,color:C.t3,marginTop:4,lineHeight:1.4,fontFamily:FONT}}>Pubblica la richiesta a tutti i serramentisti della piattaforma</div>
          </button>
        </div>

        {/* LAVORI */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <SectionTitle style={{marginBottom:0}}>Tutti i lavori</SectionTitle>
          <div style={{display:'flex',gap:6}}>
            {[{k:'tutti',l:'Tutti'},{k:'attivi',l:'Attivi'},{k:'completati',l:'Fatti'}].map(f=>(
              <button key={f.k} onClick={()=>setFiltro(f.k)}
                style={{background:filtro===f.k?C.tealBg:'transparent',color:filtro===f.k?C.teal:C.t3,border:`1px solid ${filtro===f.k?C.tealBorder:C.border}`,
                  borderRadius:8,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:FONT,transition:'.15s'}}>
                {f.l} ({f.k==='tutti'?richieste.length:f.k==='attivi'?kAttivi:kComp})
              </button>
            ))}
          </div>
        </div>

        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px',animation:'fadeIn .5s ease'}}>
            <div style={{width:64,height:64,borderRadius:20,background:C.card,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div style={{fontSize:15,fontWeight:600,color:C.t2,fontFamily:FONT}}>Nessun lavoro ancora</div>
            <div style={{fontSize:13,color:C.t3,marginTop:4,fontFamily:FONT}}>Crea il tuo primo lavoro con il bottone +</div>
          </div>
        ):filtered.map((r,i)=>{
          const st=STATO[r.stato]||STATO.nuova;
          const nV=(r.vani_json||[]).length;
          const isMkt=r.tipo_invio==='marketplace';
          return(
            <button key={r.id} className="card-hover" onClick={()=>openDettaglio(r)}
              style={{width:'100%',background:C.card,border:`1px solid ${r.urgente?`${C.red}44`:C.border}`,borderRadius:14,padding:'16px 18px',marginBottom:10,cursor:'pointer',textAlign:'left',display:'block',animation:`fadeUp .4s ease ${i*.04}s both`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div style={{flex:1,paddingRight:12}}>
                  <div style={{fontWeight:700,fontSize:15,color:C.t1,fontFamily:FONT}}>{r.cliente}</div>
                  <div style={{fontSize:12,color:C.t3,marginTop:3,fontFamily:FONT}}>{r.indirizzo}</div>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                  {isMkt&&<span style={{fontSize:9,fontWeight:700,color:C.purple,background:'rgba(167,139,250,0.1)',borderRadius:6,padding:'3px 8px',fontFamily:FONT}}>MKT</span>}
                  <div style={{display:'flex',alignItems:'center',gap:5,background:st.bg,borderRadius:8,padding:'4px 10px'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:st.dot}}/>
                    <span style={{fontSize:11,fontWeight:600,color:st.c,fontFamily:FONT}}>{st.l}</span>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:16,alignItems:'center'}}>
                <Chip icon="M4 4h16v16H4z" text={`${nV} vani`}/>
                {r.budget&&<Chip icon="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" text={`\u20AC${r.budget}`} accent/>}
                <span style={{fontSize:11,color:C.t3,fontFamily:FONT}}>{getName(r.operatore_id)}</span>
                {r.urgente&&<span style={{fontSize:10,fontWeight:700,color:C.red,fontFamily:FONT}}>URGENTE</span>}
              </div>
            </button>
          );
        })}

        {/* FAB */}
        <div style={{position:'fixed',bottom:24,right:24,display:'flex',flexDirection:'column',gap:10,zIndex:100}}>
          <button className="btn-glow" onClick={()=>setView('marketplace')}
            style={{width:52,height:52,borderRadius:16,background:C.card,border:`1px solid ${C.tealBorder}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeUp .5s ease .3s both'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </button>
          <button className="btn-glow" onClick={()=>setView('nuovo')}
            style={{width:56,height:56,borderRadius:18,background:`linear-gradient(135deg,${C.teal},${C.tealDark})`,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 24px ${C.teal}44`,animation:'fadeUp .5s ease .4s both'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </Shell>
  );

  // ═══ VISTA FREELANCER ═══════════════════════════════════════════════════════
  if(view==='freelancer'&&selFreelancer){
    const fR=richPerFreel(selFreelancer.id);
    const fA=fR.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
    const fC=fR.filter(r=>r.stato==='completata').length;
    const fB=fR.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(r.budget||0),0);
    return(
      <Shell><GlobalCSS/><TopBar/>
        <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px 120px'}}>
          {/* Hero */}
          <div style={{background:`linear-gradient(135deg,${C.card},${C.tealBg})`,border:`1px solid ${C.tealBorder}`,borderRadius:20,padding:28,marginBottom:24,animation:'fadeUp .5s ease'}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
              <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${C.teal}22,${C.teal}44)`,border:`2px solid ${C.tealBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:C.teal,fontFamily:FONT}}>
                {(selFreelancer.nome||'?')[0]}{(selFreelancer.cognome||'?')[0]}
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:22,color:C.t1,fontFamily:FONT}}>{selFreelancer.nome} {selFreelancer.cognome}</div>
                <div style={{fontSize:13,color:C.t3,fontFamily:FONT,marginTop:2}}>{selFreelancer.ruolo||'Montatore'}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              {[{n:fA,l:'Attivi',c:C.blue},{n:fC,l:'Completati',c:C.green},{n:fB,l:'Totale \u20AC',c:C.teal,cur:true}].map((k,i)=>(
                <div key={i} style={{background:'rgba(0,0,0,.2)',borderRadius:12,padding:'14px 12px',textAlign:'center'}}>
                  <div style={{fontFamily:MONO,fontWeight:700,fontSize:k.cur?18:24,color:k.c}}>{k.cur?'\u20AC'+k.n.toLocaleString('it-IT'):k.n}</div>
                  <div style={{fontSize:10,color:C.t3,fontWeight:500,marginTop:2,fontFamily:FONT}}>{k.l}</div>
                </div>
              ))}
            </div>
          </div>

          <SectionTitle>Lavori ({fR.length})</SectionTitle>
          {fR.length===0?<div style={{textAlign:'center',padding:40,color:C.t3,fontSize:14,fontFamily:FONT}}>Nessun lavoro ancora</div>:
          fR.map((r,i)=>{
            const st=STATO[r.stato]||STATO.nuova;const nV=(r.vani_json||[]).length;
            return(
              <button key={r.id} className="card-hover" onClick={()=>openDettaglio(r)}
                style={{width:'100%',background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'16px 18px',marginBottom:10,cursor:'pointer',textAlign:'left',display:'block',animation:`fadeUp .4s ease ${i*.04}s both`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <span style={{fontWeight:700,fontSize:15,color:C.t1,fontFamily:FONT}}>{r.cliente}</span>
                  <div style={{display:'flex',alignItems:'center',gap:5,background:st.bg,borderRadius:8,padding:'4px 10px'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:st.dot}}/>
                    <span style={{fontSize:11,fontWeight:600,color:st.c,fontFamily:FONT}}>{st.l}</span>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.t3,fontFamily:FONT}}>{r.indirizzo} · {nV} vani{r.budget?` · \u20AC${r.budget}`:''}</div>
              </button>
            );
          })}

          <FixedBtn onClick={()=>setView('nuovo')} label={`Invia lavoro a ${selFreelancer.nome}`}/>
        </div>
      </Shell>
    );
  }

  // ═══ DETTAGLIO ══════════════════════════════════════════════════════════════
  if(view==='dettaglio'&&selRichiesta){
    const r=selRichiesta;const st=STATO[r.stato]||STATO.nuova;
    const vani=r.vani_json||[];const allegati=r.allegati_json||[];
    const {montaggi,fotoFasi,firme,fatture,costi,documenti,candidature}=dettaglio;
    const montaggio=montaggi[0];const firma=firme[0];
    const isMkt=r.tipo_invio==='marketplace';
    const totCosti=costi.reduce((s,c)=>s+(c.totale||c.importo||0),0);
    const totFatt=fatture.reduce((s,f)=>s+(f.totale||f.importo||0),0);
    const totPagato=fatture.filter(f=>f.stato==='pagata').reduce((s,f)=>s+(f.totale||f.importo||0),0);

    return(
      <Shell><GlobalCSS/><TopBar/>
        <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px 40px'}}>

          {/* Hero header */}
          <div style={{background:`linear-gradient(135deg,${C.card},${st.bg})`,border:`1px solid ${st.c}22`,borderRadius:20,padding:24,marginBottom:20,animation:'scaleIn .4s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div>
                <div style={{fontWeight:800,fontSize:24,color:C.t1,fontFamily:FONT,letterSpacing:'-0.02em'}}>{r.cliente}</div>
                <div style={{fontSize:14,color:C.t2,marginTop:6,fontFamily:FONT}}>{r.indirizzo}</div>
                {r.telefono_cliente&&<div style={{fontSize:13,color:C.t3,marginTop:2,fontFamily:FONT}}>Tel: {r.telefono_cliente}</div>}
                <div style={{fontSize:12,color:C.teal,marginTop:6,fontWeight:600,fontFamily:FONT}}>Assegnato a: {getName(r.operatore_id)}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,background:st.bg,border:`1px solid ${st.c}33`,borderRadius:10,padding:'6px 14px'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:st.dot}}/>
                  <span style={{fontSize:13,fontWeight:700,color:st.c,fontFamily:FONT}}>{st.l}</span>
                </div>
                {r.urgente&&<span style={{fontSize:11,fontWeight:700,color:C.red,background:C.redBg,borderRadius:6,padding:'3px 10px',fontFamily:FONT}}>URGENTE</span>}
                {isMkt&&<span style={{fontSize:11,fontWeight:700,color:C.purple,background:'rgba(167,139,250,0.1)',borderRadius:6,padding:'3px 10px',fontFamily:FONT}}>MARKETPLACE</span>}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{display:'flex',gap:4,marginTop:8}}>
              {['nuova','accettata','in_corso','completata'].map((s,i)=>{
                const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);
                const active=idx>=i;
                return(<div key={s} style={{flex:1}}>
                  <div style={{height:4,borderRadius:2,background:active?C.teal:`${C.t3}33`,transition:'.3s'}}/>
                  <div style={{fontSize:9,color:active?C.teal:C.t3,fontWeight:600,marginTop:4,textAlign:'center',fontFamily:FONT}}>
                    {s==='nuova'?'Inviata':s==='accettata'?'Accettata':s==='in_corso'?'In corso':'Completata'}
                  </div>
                </div>);
              })}
            </div>
          </div>

          {/* Info grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:20}}>
            {[
              {l:'Data',v:r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'N/D'},
              {l:'Ora',v:r.ora_preferita?.slice(0,5)||'N/D'},
              {l:'Budget',v:r.budget?`\u20AC${r.budget}`:'N/D'},
              {l:'Vani',v:`${vani.length}`},
            ].map((d,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px'}}>
                <div style={{fontSize:10,color:C.t3,fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em',fontFamily:FONT}}>{d.l}</div>
                <div style={{fontSize:15,fontWeight:700,color:C.t1,marginTop:4,fontFamily:FONT}}>{d.v}</div>
              </div>
            ))}
          </div>

          {r.note&&<Cd t="Note"><div style={{fontSize:14,color:C.t2,lineHeight:1.6,fontFamily:FONT}}>{r.note}</div></Cd>}

          {/* Vani */}
          {vani.length>0&&<Cd t={`Vani (${vani.length})`}>
            {vani.map((v,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:10,padding:'12px 14px',marginBottom:8,border:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontWeight:700,fontSize:13,color:C.t1,fontFamily:FONT}}>Vano {i+1} — {v.tipo}</span>
                  <div style={{display:'flex',gap:10,marginTop:4}}>
                    <span style={{fontSize:11,color:C.teal,fontWeight:600,background:C.tealBg,borderRadius:4,padding:'1px 8px',fontFamily:FONT}}>{v.materiale}</span>
                    {v.stanza&&<span style={{fontSize:11,color:C.t3,fontFamily:FONT}}>{v.stanza}</span>}
                    {v.piano&&<span style={{fontSize:11,color:C.t3,fontFamily:FONT}}>P.{v.piano}</span>}
                  </div>
                </div>
                <span style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:C.t2}}>{v.larghezza&&v.altezza?`${v.larghezza}\u00D7${v.altezza}`:'\u2014'}</span>
              </div>
            ))}
          </Cd>}

          {/* Ore lavoro */}
          {montaggio&&<Cd t="Ore lavoro">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              {[
                {n:montaggio.ore_preventivate||'\u2014',l:'Preventivate',c:C.t1},
                {n:montaggio.ore_reali?montaggio.ore_reali.toFixed(1):'\u2014',l:'Reali',c:montaggio.ore_reali>montaggio.ore_preventivate?C.red:C.green},
                {n:montaggio.stato||'\u2014',l:'Stato',c:C.teal},
              ].map((k,i)=>(
                <div key={i} style={{background:C.surface,borderRadius:10,padding:14,textAlign:'center'}}>
                  <div style={{fontFamily:MONO,fontWeight:700,fontSize:20,color:k.c}}>{k.n}</div>
                  <div style={{fontSize:10,color:C.t3,fontWeight:500,marginTop:2,fontFamily:FONT}}>{k.l}</div>
                </div>
              ))}
            </div>
          </Cd>}

          {/* Fatture */}
          {fatture.length>0&&<Cd t={`Fatture (${fatture.length})`}>
            {fatture.map(f=>{
              const fSt=f.stato==='pagata'?{c:C.green,bg:C.greenBg}:f.stato==='scaduta'?{c:C.red,bg:C.redBg}:{c:C.amber,bg:C.amberBg};
              return(
                <div key={f.id} style={{background:C.surface,borderRadius:10,padding:'12px 14px',marginBottom:8,border:`1px solid ${C.border}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <span style={{fontWeight:700,fontSize:14,color:C.t1,fontFamily:FONT}}>N. {f.numero}</span>
                      <span style={{fontSize:11,color:C.t3,marginLeft:8,fontFamily:FONT}}>{new Date(f.data_emissione).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:C.teal}}>{'\u20AC'}{f.totale||f.importo}</span>
                      <span style={{fontSize:10,fontWeight:700,color:fSt.c,background:fSt.bg,borderRadius:6,padding:'3px 8px',fontFamily:FONT}}>{f.stato}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:8}}>
              <div style={{background:C.surface,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:C.t1}}>{'\u20AC'}{totFatt.toFixed(0)}</div>
                <div style={{fontSize:9,color:C.t3,fontFamily:FONT}}>Fatturato</div>
              </div>
              <div style={{background:C.surface,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:C.green}}>{'\u20AC'}{totPagato.toFixed(0)}</div>
                <div style={{fontSize:9,color:C.t3,fontFamily:FONT}}>Pagato</div>
              </div>
              <div style={{background:C.surface,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:(totFatt-totPagato)>0?C.red:C.green}}>{'\u20AC'}{(totFatt-totPagato).toFixed(0)}</div>
                <div style={{fontSize:9,color:C.t3,fontFamily:FONT}}>Da pagare</div>
              </div>
            </div>
          </Cd>}

          {/* Costi */}
          {costi.length>0&&<Cd t={`Costi (${costi.length})`}>
            {costi.map(c=>(
              <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.t1,fontFamily:FONT}}>{c.descrizione}</div>
                  <div style={{fontSize:10,color:C.t3,fontFamily:FONT}}>{c.tipo} · {new Date(c.data).toLocaleDateString('it-IT')}</div>
                </div>
                <span style={{fontFamily:MONO,fontWeight:700,fontSize:14,color:C.t1}}>{'\u20AC'}{c.totale||c.importo}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:12,marginTop:4}}>
              <span style={{fontSize:13,fontWeight:700,color:C.t1,fontFamily:FONT}}>Totale</span>
              <span style={{fontFamily:MONO,fontWeight:800,fontSize:18,color:C.teal}}>{'\u20AC'}{totCosti.toFixed(2)}</span>
            </div>
          </Cd>}

          {/* Riepilogo economico */}
          {(fatture.length>0||costi.length>0||montaggio)&&<Cd t="Riepilogo economico">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
              {[
                {n:r.budget||0,l:'Budget',c:C.t1,pre:'\u20AC'},
                {n:totCosti,l:'Costi',c:totCosti>(r.budget||0)?C.red:C.green,pre:'\u20AC',fix:0},
                {n:montaggio?.ore_reali||0,l:'Ore',c:C.t1,suf:'h',fix:1},
                {n:montaggio?.ore_reali>0?totCosti/montaggio.ore_reali:0,l:'\u20AC/ora',c:C.t1,pre:'\u20AC',fix:0},
              ].map((k,i)=>(
                <div key={i} style={{background:C.surface,borderRadius:10,padding:12,textAlign:'center'}}>
                  <div style={{fontFamily:MONO,fontWeight:700,fontSize:16,color:k.c}}>{k.pre||''}{typeof k.n==='number'?k.n.toFixed(k.fix??0):k.n}{k.suf||''}</div>
                  <div style={{fontSize:9,color:C.t3,fontFamily:FONT,marginTop:2}}>{k.l}</div>
                </div>
              ))}
            </div>
          </Cd>}

          {/* Foto fasi */}
          {fotoFasi.length>0&&<Cd t="Documentazione fotografica">
            {['prima','durante','dopo'].map(fase=>{
              const fotos=fotoFasi.filter(f=>f.fase===fase);if(!fotos.length)return null;
              return(<div key={fase} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8,fontFamily:FONT}}>
                  {fase==='prima'?'Prima dei lavori':fase==='durante'?'Durante':' Dopo'} ({fotos.length})
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                  {fotos.map((f,i)=><img key={i} src={f.file_url||f.url} alt="" style={{width:'100%',height:90,objectFit:'cover',borderRadius:10,border:`1px solid ${C.border}`}}/>)}
                </div>
              </div>);
            })}
          </Cd>}

          {/* Firma */}
          {firma&&<Cd t="Firma collaudo"><div style={{textAlign:'center'}}><img src={firma.firma_url} alt="Firma" style={{maxWidth:'100%',maxHeight:160,border:`1px solid ${C.border}`,borderRadius:12}}/><div style={{fontSize:12,color:C.t3,marginTop:8,fontFamily:FONT}}>Firmato da {firma.firmato_da}</div></div></Cd>}

          {/* Report */}
          <Cd t="Report">
            <button className="btn-glow" onClick={()=>{
              const w=window.open('','_blank');if(!w)return;
              w.document.write(`<html><head><title>Report ${r.cliente}</title><style>*{margin:0;box-sizing:border-box}body{font-family:'DM Sans',system-ui;padding:40px;max-width:800px;margin:0 auto;color:#1a1a1a}h1{font-size:28px;font-weight:800;margin-bottom:4px}h3{font-size:16px;font-weight:700;margin:24px 0 12px;color:#0D9488}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #e5e5e5;padding:10px 12px;text-align:left;font-size:13px}th{background:#f8f8f8;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#666}.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.kpi>div{text-align:center;padding:16px;background:#f0fafa;border-radius:12px;border:1px solid #e0f0f0}.kpi .n{font-size:22px;font-weight:800;color:#0D9488}.kpi .l{font-size:10px;color:#888;margin-top:4px;text-transform:uppercase}p.sub{color:#999;font-size:12px;margin-top:4px}</style></head><body>`);
              w.document.write(`<h1>${r.cliente}</h1><p class="sub">${r.indirizzo} \u2014 Report generato il ${new Date().toLocaleDateString('it-IT')}</p>`);
              w.document.write(`<div class="kpi"><div><div class="n">${vani.length}</div><div class="l">Vani</div></div><div><div class="n">\u20AC${r.budget||0}</div><div class="l">Budget</div></div><div><div class="n">\u20AC${totCosti.toFixed(0)}</div><div class="l">Costi</div></div><div><div class="n">${montaggio?.ore_reali?montaggio.ore_reali.toFixed(1)+'h':'\u2014'}</div><div class="l">Ore</div></div></div>`);
              if(vani.length){w.document.write(`<h3>Vani</h3><table><tr><th>#</th><th>Tipo</th><th>Materiale</th><th>Misure</th><th>Stanza</th></tr>`);vani.forEach((v,i)=>w.document.write(`<tr><td>${i+1}</td><td>${v.tipo}</td><td>${v.materiale}</td><td>${v.larghezza&&v.altezza?v.larghezza+'\u00D7'+v.altezza:'\u2014'}</td><td>${v.stanza||'\u2014'}</td></tr>`));w.document.write('</table>');}
              if(costi.length){w.document.write(`<h3>Costi</h3><table><tr><th>Descrizione</th><th>Tipo</th><th>Data</th><th>Importo</th></tr>`);costi.forEach(c=>w.document.write(`<tr><td>${c.descrizione}</td><td>${c.tipo}</td><td>${new Date(c.data).toLocaleDateString('it-IT')}</td><td>\u20AC${c.totale||c.importo}</td></tr>`));w.document.write(`<tr><td colspan="3" style="text-align:right;font-weight:700">Totale</td><td style="font-weight:700">\u20AC${totCosti.toFixed(2)}</td></tr></table>`);}
              if(fatture.length){w.document.write(`<h3>Fatture</h3><table><tr><th>N.</th><th>Data</th><th>Totale</th><th>Stato</th></tr>`);fatture.forEach(f=>w.document.write(`<tr><td>${f.numero}</td><td>${new Date(f.data_emissione).toLocaleDateString('it-IT')}</td><td>\u20AC${f.totale||f.importo}</td><td>${f.stato}</td></tr>`));w.document.write('</table>');}
              w.document.write(`<p style="margin-top:40px;color:#ccc;font-size:10px">Generato da MASTRO Suite \u2014 fliwoX Montaggi</p></body></html>`);
              w.document.close();w.print();
            }} style={{width:'100%',background:`linear-gradient(135deg,${C.card},${C.tealBg})`,color:C.teal,border:`1px solid ${C.tealBorder}`,borderRadius:12,padding:'14px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:FONT,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Stampa / Salva report PDF
            </button>
          </Cd>
        </div>
      </Shell>
    );
  }

  // ═══ MARKETPLACE + NUOVO → placeholder per ora, stessa logica di prima ═════
  if(view==='marketplace'||view==='nuovo'){
    return(
      <Shell><GlobalCSS/><TopBar/>
        <div style={{maxWidth:600,margin:'0 auto',padding:'24px 20px 120px'}}>
          <NuovoLavoroFormPremium
            azienda={azienda}
            freelancers={freelancers}
            selFreelancer={selFreelancer}
            inviteCode={inviteCode}
            isMarketplace={view==='marketplace'}
            onSent={async()=>{
              const allAz=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});
              await loadRichieste(allAz||[]);
              setView('dashboard');
            }}
            onBack={()=>setView('dashboard')}
          />
        </div>
      </Shell>
    );
  }

  return null;
}

// ═══ FORM NUOVO LAVORO PREMIUM ═══════════════════════════════════════════════
function NuovoLavoroFormPremium({azienda,freelancers,selFreelancer,inviteCode,isMarketplace,onSent,onBack}){
  const [target,setTarget]=useState(selFreelancer?.id||freelancers[0]?.id||'');
  const [cliente,setCliente]=useState('');const [indirizzo,setIndirizzo]=useState('');
  const [telC,setTelC]=useState('');const [emailC,setEmailC]=useState('');
  const [dataP,setDataP]=useState('');const [oraP,setOraP]=useState('');
  const [urgente,setUrgente]=useState(false);const [budget,setBudget]=useState('');const [note,setNote]=useState('');
  const [vani,setVani]=useState([{id:1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const [allegati,setAllegati]=useState([]);const [uploading,setUploading]=useState(false);
  const [sending,setSending]=useState(false);const [sent,setSent]=useState(false);
  const [showImport,setShowImport]=useState(false);
  const fileRef=useRef(null);

  const addV=()=>setVani(v=>[...v,{id:Date.now(),tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const rmV=id=>setVani(v=>v.filter(x=>x.id!==id));
  const upV=(id,f,val)=>setVani(v=>v.map(x=>x.id===id?{...x,[f]:val}:x));

  const handleUp=async e=>{const files=e.target.files;if(!files)return;setUploading(true);for(let i=0;i<files.length;i++){const f=files[i];const path=`portale/${inviteCode}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const url=await sb.upload(path,f);if(url)setAllegati(p=>[...p,{nome:f.name,url,tipo:f.type.startsWith('image')?'img':'file'}]);}setUploading(false);e.target.value='';};

  // Import handler
  const handleImportFile=async(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const text=await file.text();
      // Simple XML/CSV auto-detect and parse
      const isXml=text.trim().startsWith('<?xml')||text.trim().startsWith('<');
      const isCsv=!isXml&&(text.includes(';')||text.includes(',')||text.includes('\t'));
      if(isXml){
        const parser=new DOMParser();const doc=parser.parseFromString(text,'text/xml');
        const nodes=[...doc.getElementsByTagName('Vano'),...doc.getElementsByTagName('Serramento'),...doc.getElementsByTagName('Window'),...doc.getElementsByTagName('Element'),...doc.getElementsByTagName('Finestra'),...doc.getElementsByTagName('Posizione'),...doc.getElementsByTagName('Door'),...doc.getElementsByTagName('Item'),...doc.getElementsByTagName('VANO'),...doc.getElementsByTagName('SERRAMENTO'),...doc.getElementsByTagName('Riga')];
        const gt=(el,tags)=>{for(const t of tags){const n=el.getElementsByTagName(t)[0];if(n?.textContent?.trim())return n.textContent.trim();}return '';};
        const gn=(el,tags)=>{const v=gt(el,tags);const n=parseFloat(v);return isNaN(n)?null:n;};
        // Client info
        const root=doc.documentElement;
        const cl=gt(root,['Cliente','CLIENTE','NomeCliente','Committente','RagioneSociale','Customer'])||'';
        const ind=gt(root,['Indirizzo','INDIRIZZO','IndirizzoCantiere','Via','Address'])||'';
        if(cl)setCliente(cl);if(ind)setIndirizzo(ind);
        if(nodes.length>0){
          setVani(nodes.map((v,i)=>({
            id:Date.now()+i,
            tipo:mapTipo(gt(v,['Tipo','TIPO','Type','TipoSerramento','Tipologia'])||v.tagName||'Finestra'),
            materiale:mapMat(gt(v,['Materiale','MATERIALE','Material','Sistema','Profilo','System','Profile'])||'PVC'),
            larghezza:String(gn(v,['Larghezza','LARGHEZZA','Width','W','L','Base'])||''),
            altezza:String(gn(v,['Altezza','ALTEZZA','Height','H','Alt'])||''),
            stanza:gt(v,['Stanza','Locale','LOCALE','Room','Location','Ambiente'])||'',
            piano:gt(v,['Piano','PIANO','Floor','Level'])||'PT',
            note:[gt(v,['Note','NOTE','Notes']),gt(v,['ColoreInterno','COLORE_INT','ColorInt'])?'Int:'+gt(v,['ColoreInterno','COLORE_INT','ColorInt']):'',gt(v,['Vetro','VETRO','Glass'])?'Vetro:'+gt(v,['Vetro','VETRO','Glass']):''].filter(Boolean).join(' · '),
          })));
        }
      } else if(isCsv){
        const sep=text.includes(';')?';':text.includes('\t')?'\t':',';
        const lines=text.split('\n').map(l=>l.trim()).filter(Boolean);
        if(lines.length>=2){
          const heads=lines[0].split(sep).map(h=>h.replace(/['"]/g,'').trim().toLowerCase());
          const fi=(aliases)=>{for(const a of aliases){const i=heads.indexOf(a);if(i>=0)return i;}return -1;};
          const cols={nome:fi(['nome','name','descrizione','vano','codice']),tipo:fi(['tipo','type','tipologia']),mat:fi(['materiale','material','profilo','sistema']),l:fi(['larghezza','width','l','base']),h:fi(['altezza','height','h']),stanza:fi(['stanza','room','locale','ambiente']),piano:fi(['piano','floor']),note:fi(['note','notes']),cliente:fi(['cliente','customer','committente']),indirizzo:fi(['indirizzo','address','via'])};
          const firstRow=lines[1].split(sep).map(c=>c.replace(/['"]/g,'').trim());
          if(cols.cliente>=0&&firstRow[cols.cliente])setCliente(firstRow[cols.cliente]);
          if(cols.indirizzo>=0&&firstRow[cols.indirizzo])setIndirizzo(firstRow[cols.indirizzo]);
          const newVani=[];
          for(let i=1;i<lines.length;i++){
            const cs=lines[i].split(sep).map(c=>c.replace(/['"]/g,'').trim());
            if(cs.length<2)continue;
            const gv=idx=>idx>=0?(cs[idx]||''):'';
            newVani.push({id:Date.now()+i,tipo:mapTipo(gv(cols.tipo)||'Finestra'),materiale:mapMat(gv(cols.mat)||'PVC'),larghezza:gv(cols.l),altezza:gv(cols.h),stanza:gv(cols.stanza),piano:gv(cols.piano)||'PT',note:gv(cols.note)});
          }
          if(newVani.length>0)setVani(newVani);
        }
      }
    }catch(err){console.error('Import error',err);}
    e.target.value='';
  };

  const invia=async()=>{
    if(!cliente.trim()||!indirizzo.trim())return;
    setSending(true);
    const opId=isMarketplace?azienda.operatore_id:target;
    const azfl=isMarketplace?[{id:azienda.id}]:await sb.get('aziende_freelance',{operatore_id:'eq.'+opId,nome:'eq.'+azienda.nome,limit:'1'});
    await sb.post('richieste_lavoro',{
      azienda_fl_id:azfl?.[0]?.id||azienda.id,operatore_id:opId,
      cliente:cliente.trim(),indirizzo:indirizzo.trim(),telefono_cliente:telC,email_cliente:emailC,
      data_preferita:dataP||null,ora_preferita:oraP||null,urgente,
      budget:budget?parseFloat(budget):null,note,
      vani_json:vani.map(v=>({tipo:v.tipo,materiale:v.materiale,larghezza:v.larghezza?parseInt(v.larghezza):null,altezza:v.altezza?parseInt(v.altezza):null,stanza:v.stanza,piano:v.piano,note:v.note})),
      allegati_json:allegati,tipo_invio:isMarketplace?'marketplace':'diretto',marketplace_aperta:isMarketplace,stato:'nuova',
    });
    setSending(false);setSent(true);setTimeout(()=>onSent(),1500);
  };

  if(sent)return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:16,animation:'scaleIn .4s ease'}}>
      <div style={{width:72,height:72,borderRadius:22,background:C.greenBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{fontSize:24,fontWeight:800,color:C.t1,fontFamily:FONT}}>{isMarketplace?'Pubblicato!':'Inviata!'}</div>
      <div style={{fontSize:14,color:C.t2,fontFamily:FONT}}>{isMarketplace?'Tutti i serramentisti vedranno la richiesta':'Il montatore riceverà una notifica'}</div>
    </div>
  );

  const importRef=useRef(null);

  return(
    <>
      <input ref={importRef} type="file" accept=".xml,.ope,.fpp,.csv,.xlsx,.xls,.tsv" style={{display:'none'}} onChange={handleImportFile}/>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <div style={{fontWeight:800,fontSize:22,color:C.t1,fontFamily:FONT}}>{isMarketplace?'Pubblica sul Marketplace':'Nuovo lavoro'}</div>
          {isMarketplace&&<div style={{fontSize:13,color:C.t3,marginTop:4,fontFamily:FONT}}>Tutti i serramentisti potranno candidarsi</div>}
        </div>
        <button className="btn-glow" onClick={()=>importRef.current?.click()}
          style={{background:`linear-gradient(135deg,${C.card},rgba(96,165,250,0.08))`,border:`1px solid rgba(96,165,250,0.3)`,borderRadius:12,padding:'10px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:12,fontWeight:700,color:C.blue,fontFamily:FONT}}>Importa</div>
            <div style={{fontSize:9,color:C.t3,fontFamily:FONT}}>Opera, FpPro, Excel, CSV</div>
          </div>
        </button>
      </div>

      {/* Scegli freelancer */}
      {!isMarketplace&&freelancers.length>1&&<Cd t="Assegna a">
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {freelancers.map(f=>(
            <button key={f.id} onClick={()=>setTarget(f.id)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderRadius:12,border:`1.5px solid ${target===f.id?C.teal:C.border}`,background:target===f.id?C.tealBg:C.surface,cursor:'pointer',transition:'.15s'}}>
              <div style={{width:30,height:30,borderRadius:10,background:target===f.id?`${C.teal}33`:C.card,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:target===f.id?C.teal:C.t2,fontFamily:FONT}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
              <span style={{fontSize:13,fontWeight:target===f.id?700:500,color:target===f.id?C.teal:C.t2,fontFamily:FONT}}>{f.nome} {f.cognome}</span>
            </button>
          ))}
        </div>
      </Cd>}

      <Cd t="Cliente">
        <In l="Nome cliente *" v={cliente} o={setCliente} p="Mario Rossi"/>
        <In l="Indirizzo cantiere *" v={indirizzo} o={setIndirizzo} p="Via Roma 45, Cosenza"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <In l="Telefono" v={telC} o={setTelC} p="333 1234567"/>
          <In l="Email" v={emailC} o={setEmailC} p="mario@email.it"/>
        </div>
      </Cd>

      <Cd t="Tempistiche">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <In l="Data preferita" v={dataP} o={setDataP} t="date"/>
          <In l="Ora preferita" v={oraP} o={setOraP} t="time"/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10}}>
          <button onClick={()=>setUrgente(!urgente)} style={{width:46,height:26,borderRadius:13,border:'none',cursor:'pointer',position:'relative',background:urgente?C.red:`${C.t3}44`,transition:'.2s'}}>
            <div style={{width:22,height:22,borderRadius:11,background:'#fff',position:'absolute',top:2,left:urgente?22:2,transition:'.2s',boxShadow:'0 1px 4px rgba(0,0,0,.3)'}}/>
          </button>
          <span style={{fontSize:13,fontWeight:urgente?700:500,color:urgente?C.red:C.t3,fontFamily:FONT}}>{urgente?'URGENTE':'Urgente'}</span>
        </div>
      </Cd>

      <Cd t={`Vani (${vani.length})`}>
        {vani.map((v,i)=>(
          <div key={v.id} style={{background:C.surface,borderRadius:12,padding:14,marginBottom:10,border:`1px solid ${C.border}`,position:'relative',animation:'fadeUp .3s ease'}}>
            {vani.length>1&&<button onClick={()=>rmV(v.id)} style={{position:'absolute',top:10,right:10,background:C.redBg,border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>}
            <div style={{fontSize:12,fontWeight:700,color:C.teal,marginBottom:10,fontFamily:FONT}}>Vano {i+1}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Sl l="Tipo" v={v.tipo} o={val=>upV(v.id,'tipo',val)} opts={TIPI_VANO}/>
              <Sl l="Materiale" v={v.materiale} o={val=>upV(v.id,'materiale',val)} opts={MAT_OPT}/>
              <In l="Larghezza mm" v={v.larghezza} o={val=>upV(v.id,'larghezza',val)} p="1200" t="number"/>
              <In l="Altezza mm" v={v.altezza} o={val=>upV(v.id,'altezza',val)} p="1400" t="number"/>
              <In l="Stanza" v={v.stanza} o={val=>upV(v.id,'stanza',val)} p="Soggiorno"/>
              <Sl l="Piano" v={v.piano} o={val=>upV(v.id,'piano',val)} opts={['PT','1','2','3','4','5','Interrato']}/>
            </div>
            <In l="Note" v={v.note} o={val=>upV(v.id,'note',val)} p="Controtelaio, davanzale..."/>
          </div>
        ))}
        <button onClick={addV} style={{width:'100%',border:`2px dashed ${C.border}`,background:'transparent',borderRadius:12,padding:'12px 0',cursor:'pointer',color:C.teal,fontWeight:700,fontSize:13,fontFamily:FONT,transition:'.15s'}}>+ Aggiungi vano</button>
      </Cd>

      <Cd t="Budget"><In l="Budget indicativo (\u20AC)" v={budget} o={setBudget} p="350" t="number"/></Cd>

      <Cd t={`Allegati (${allegati.length})`}>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple style={{display:'none'}} onChange={handleUp}/>
        {allegati.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
          {allegati.map((a,i)=>(<div key={i} style={{position:'relative',borderRadius:10,overflow:'hidden',border:`1px solid ${C.border}`}}>
            {a.tipo==='img'?<img src={a.url} alt="" style={{width:'100%',height:80,objectFit:'cover',display:'block'}}/>:
            <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',background:C.surface}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>}
            <button onClick={()=>setAllegati(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:6,background:'rgba(0,0,0,.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>))}
        </div>}
        <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{width:'100%',border:`2px dashed ${C.border}`,background:'transparent',borderRadius:12,padding:'14px 0',cursor:'pointer',color:C.teal,fontWeight:700,fontSize:13,fontFamily:FONT,opacity:uploading?.5:1}}>
          {uploading?'Caricamento...':'+ Foto, planimetrie, documenti'}
        </button>
      </Cd>

      <Cd t="Note"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Descrivi il lavoro, accesso cantiere..." style={{width:'100%',minHeight:80,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px',fontSize:14,color:C.t1,fontFamily:FONT,resize:'vertical',outline:'none',boxSizing:'border-box'}}/></Cd>

      {/* Submit */}
      <button className="btn-glow" onClick={invia} disabled={!cliente.trim()||!indirizzo.trim()||sending}
        style={{width:'100%',background:(!cliente.trim()||!indirizzo.trim())?C.t3:`linear-gradient(135deg,${C.teal},${C.tealDark})`,color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',fontFamily:FONT,marginTop:8,opacity:sending?.6:1,boxShadow:`0 4px 24px ${C.teal}33`}}>
        {sending?'Invio in corso...':(isMarketplace?'Pubblica sul Marketplace':'Invia lavoro')}
      </button>
    </>
  );
}

// ═══ MAPPERS ══════════════════════════════════════════════════════════════════
function mapTipo(r){r=(r||'').toLowerCase();if(r.includes('portafinestra')||r.includes('balcon'))return'Portafinestra';if(r.includes('porta')||r.includes('door'))return'Porta';if(r.includes('scorr')||r.includes('slid'))return'Scorrevole';if(r.includes('velux')||r.includes('tetto'))return'Velux';if(r.includes('persian'))return'Persiana';if(r.includes('zanzar'))return'Zanzariera';if(r.includes('casson'))return'Cassonetto';return'Finestra';}
function mapMat(r){r=(r||'').toLowerCase();if(r.includes('allum')||r.includes('alu'))return'Alluminio';if(r.includes('legno')||r.includes('wood'))return'Legno';if(r.includes('acciaio')||r.includes('steel'))return'Acciaio';return'PVC';}

// ═══ PRIMITIVES ══════════════════════════════════════════════════════════════
function Shell({children}){return<div style={{minHeight:'100vh',background:C.bg,fontFamily:FONT}}>{children}</div>;}
function SectionTitle({children,style={}}){return<div style={{fontSize:12,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14,fontFamily:FONT,...style}}>{children}</div>;}
function Cd({t,children}){return<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'18px 20px',marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:C.t3,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,fontFamily:FONT}}>{t}</div>{children}</div>;}
function In({l,v,o,p,t}){return<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:500,color:C.t3,marginBottom:4,fontFamily:FONT}}>{l}</div><input value={v} onChange={e=>o(e.target.value)} placeholder={p} type={t||'text'} style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px',fontSize:14,color:C.t1,fontFamily:FONT,outline:'none',boxSizing:'border-box',transition:'.15s'}} onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.border}/></div>;}
function Sl({l,v,o,opts}){return<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:500,color:C.t3,marginBottom:4,fontFamily:FONT}}>{l}</div><select value={v} onChange={e=>o(e.target.value)} style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px',fontSize:14,color:C.t1,fontFamily:FONT,outline:'none',boxSizing:'border-box',appearance:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 14px center'}}>{opts.map(x=><option key={x} value={x}>{x}</option>)}</select></div>;}
function Chip({icon,text,accent}){return<div style={{display:'flex',alignItems:'center',gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent?C.teal:C.t3} strokeWidth="1.5"><path d={icon}/></svg><span style={{fontSize:11,color:accent?C.teal:C.t3,fontWeight:accent?600:400,fontFamily:FONT}}>{text}</span></div>;}
function FixedBtn({onClick,label}){return<button className="btn-glow" onClick={onClick} style={{position:'fixed',bottom:20,left:20,right:20,maxWidth:560,margin:'0 auto',background:`linear-gradient(135deg,${C.teal},${C.tealDark})`,color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',fontFamily:FONT,zIndex:100,boxShadow:`0 4px 24px ${C.teal}33`}}>{label}</button>;}
