// @ts-nocheck
// PortaleAzienda.tsx v3 — Gestione completa multi-freelance + marketplace
'use client';
import React, { useState, useEffect, useRef } from 'react';
import ImportaCommessa from './ImportaCommessa';
import type { CommessaImportata } from './ImportaCommessa';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';

const sb = {
  get: async (t,p={}) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${new URLSearchParams(p)}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}}); return r.ok?r.json():[]; } catch{return[];} },
  post: async (t,b) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(b)}); return r.ok?r.json():null; } catch{return null;} },
  patch: async (t,id,b) => { try { await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(b)}); } catch{} },
  upload: async (path,file) => { try { const r=await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Content-Type':file.type,'x-upsert':'true'},body:file}); return r.ok?`${SB_URL}/storage/v1/object/public/foto-vani/${path}`:null; } catch{return null;} },
};

const DS={bg:'#E8F4F4',topbar:'#0D1F1F',teal:'#28A0A0',tealDark:'#156060',card:'#fff',border:'#C8E4E4',text:'#0D1F1F',textMid:'#4A7070',textLight:'#8BBCBC',red:'#DC4444',green:'#1A9E73',amber:'#D08008',blue:'#3B7FE0'};

const STATO_CFG={nuova:{bg:'#FEF3C7',c:'#92400E',l:'In attesa'},vista:{bg:'#DBEAFE',c:'#1E40AF',l:'Presa in carico'},accettata:{bg:'#D1FAE5',c:'#065F46',l:'Accettata'},in_corso:{bg:'#E0F2FE',c:'#0369A1',l:'In lavorazione'},completata:{bg:'#E0E7FF',c:'#3730A3',l:'Completata'},rifiutata:{bg:'#FEE2E2',c:'#991B1B',l:'Rifiutata'},annullata:{bg:'#F3F4F6',c:'#6B7280',l:'Annullata'}};
const DOC_TIPI=['planimetria','specifiche','contratto','preventivo','rapporto','foto','certificato','altro'];
const TIPI_VANO=['Finestra','Portafinestra','Porta','Scorrevole','Velux','Persiana','Zanzariera','Cassonetto','Altro'];
const MAT_OPT=['PVC','Alluminio','Legno','Alluminio-Legno','Acciaio','Altro'];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PortaleAzienda({inviteCode}:{inviteCode:string}) {
  const [loading,setLoading]=useState(true);
  const [azienda,setAzienda]=useState(null);
  const [notFound,setNotFound]=useState(false);
  // Tutti i freelance collegati a questa azienda
  const [freelancers,setFreelancers]=useState([]);
  const [richieste,setRichieste]=useState([]);
  const [documenti,setDocumenti]=useState([]);
  const [candidature,setCandidature]=useState([]);
  // Views
  const [view,setView]=useState('dashboard'); // dashboard | freelancer | dettaglio | nuovo | marketplace
  const [selFreelancer,setSelFreelancer]=useState(null);
  const [selRichiesta,setSelRichiesta]=useState(null);
  const [filtro,setFiltro]=useState('tutti');
  const [montaggi,setMontaggi]=useState([]);
  const [fotoFasi,setFotoFasi]=useState([]);
  const [firme,setFirme]=useState([]);
  const pollRef=useRef(null);

  useEffect(()=>{
    (async()=>{
      // Load azienda
      const azRes=await sb.get('aziende_freelance',{invite_code:'eq.'+inviteCode,limit:'1'});
      if(!azRes?.length){setNotFound(true);setLoading(false);return;}
      const az=azRes[0];
      setAzienda(az);
      // L'azienda potrebbe avere DIVERSI invite codes per diversi freelance
      // Oppure un unico portale che mostra tutti i freelance collegati
      // Approccio: carica TUTTE le aziende_freelance con lo stesso nome/email
      const allAz=await sb.get('aziende_freelance',{nome:'eq.'+az.nome,attiva:'eq.true'});
      // Per ogni azienda_freelance, carica l'operatore
      const opIds=[...new Set((allAz||[]).map(a=>a.operatore_id))];
      const ops=[];
      for(const oid of opIds){
        const o=await sb.get('operatori',{id:'eq.'+oid,limit:'1'});
        if(o?.[0]) ops.push({...o[0],azienda_fl_id:(allAz||[]).find(a=>a.operatore_id===oid)?.id});
      }
      setFreelancers(ops);
      // Carica tutte le richieste
      const azIds=(allAz||[]).map(a=>a.id);
      if(azIds.length>0){
        const allRl=[];
        for(const aid of azIds){
          const rl=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+aid,order:'created_at.desc',limit:'100'});
          allRl.push(...(rl||[]));
        }
        allRl.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
        setRichieste(allRl);
      }
      setLoading(false);
    })();
    return()=>{if(pollRef.current)clearInterval(pollRef.current);};
  },[inviteCode]);

  // Polling
  useEffect(()=>{
    if(!azienda)return;
    pollRef.current=setInterval(()=>reloadRichieste(),30000);
    return()=>clearInterval(pollRef.current);
  },[azienda]);

  const reloadRichieste=async()=>{
    if(!azienda)return;
    const allAz=await sb.get('aziende_freelance',{nome:'eq.'+azienda.nome,attiva:'eq.true'});
    const allRl=[];
    for(const a of (allAz||[])){
      const rl=await sb.get('richieste_lavoro',{azienda_fl_id:'eq.'+a.id,order:'created_at.desc',limit:'100'});
      allRl.push(...(rl||[]));
    }
    allRl.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    setRichieste(allRl);
  };

  const openDettaglio=async(r)=>{
    setSelRichiesta(r);setView('dettaglio');
    // Load docs
    const docs=await sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'});
    setDocumenti(docs||[]);
    // Load candidature marketplace
    const cands=await sb.get('candidature_marketplace',{richiesta_id:'eq.'+r.id,order:'created_at.desc'});
    // Enrichi con dati operatore
    const enriched=[];
    for(const c of (cands||[])){
      const op=await sb.get('operatori',{id:'eq.'+c.operatore_id,limit:'1'});
      enriched.push({...c,operatore:op?.[0]||null});
    }
    setCandidature(enriched);
    // Load montaggio data
    if(r.commessa_id){
      const [mt,ft,fm]=await Promise.all([
        sb.get('montaggi',{commessa_id:'eq.'+r.commessa_id,limit:'10'}),
        sb.get('allegati_vano',{select:'*',limit:'50'}),
        sb.get('firma_collaudo',{select:'*',limit:'10'}),
      ]);
      setMontaggi(mt||[]);setFotoFasi((ft||[]).filter(f=>f.fase));setFirme(fm||[]);
    } else {setMontaggi([]);setFotoFasi([]);setFirme([]);}
  };

  const getFreelancerName=(opId)=>{const f=freelancers.find(x=>x.id===opId);return f?`${f.nome} ${f.cognome}`:'—';};
  const richiestePerFreelancer=(opId)=>richieste.filter(r=>r.operatore_id===opId);

  // KPI globali
  const nuove=richieste.filter(r=>['nuova','vista'].includes(r.stato)).length;
  const attivi=richieste.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
  const completati=richieste.filter(r=>r.stato==='completata').length;
  const totBudget=richieste.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(r.budget||0),0);

  const filtered=filtro==='tutti'?richieste:filtro==='attivi'?richieste.filter(r=>['nuova','vista','accettata','in_corso'].includes(r.stato)):filtro==='completati'?richieste.filter(r=>r.stato==='completata'):richieste.filter(r=>r.stato===filtro);

  if(loading)return<Full><Spinner/><P c={DS.textMid}>Caricamento portale...</P></Full>;
  if(notFound)return<Full><IC bg="#FEE2E2"><XS c={DS.red} s={32}/></IC><P c={DS.text} w={700} s={20} mt={16}>Link non valido</P><P c={DS.textMid} mt={8}>Contatta il montatore per un nuovo link.</P></Full>;

  // ─── TOPBAR ─────────────────────────────────────────────────────────────────
  const Top=()=>(
    <div style={{background:DS.topbar,padding:'14px 20px',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(40,160,160,0.15)'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {view!=='dashboard'&&<button onClick={()=>{setView('dashboard');setSelFreelancer(null);setSelRichiesta(null);}} style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>}
        <div style={{width:40,height:40,borderRadius:12,background:azienda?.colore||DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#fff'}}>{(azienda?.nome||'?')[0]}</div>
        <div style={{flex:1}}>
          <div style={{color:'#fff',fontWeight:700,fontSize:15}}>{azienda?.nome}</div>
          <div style={{color:DS.textLight,fontSize:11}}>{freelancers.length} serramentist{freelancers.length===1?'a':'i'} collegat{freelancers.length===1?'o':'i'}</div>
        </div>
      </div>
    </div>
  );

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────
  if(view==='dashboard')return(
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <Top/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 100px'}}>
        {/* KPI globali */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:16}}>
          {[{n:nuove,l:'In attesa',c:DS.amber,bg:'#FEF3C7'},{n:attivi,l:'Attivi',c:DS.blue,bg:'#DBEAFE'},{n:completati,l:'Completati',c:DS.green,bg:'#D1FAE5'},{n:totBudget,l:'Totale',c:DS.tealDark,bg:'#E0F2F1',cur:1}].map((k,i)=>(
            <div key={i} style={{background:k.bg,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
              <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:k.cur?15:22,color:k.c}}>{k.cur?'\u20AC'+k.n.toLocaleString('it-IT'):k.n}</div>
              <div style={{fontSize:9,color:k.c,fontWeight:600,marginTop:2,textTransform:'uppercase',letterSpacing:.3}}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* I MIEI SERRAMENTISTI */}
        <div style={{fontSize:12,fontWeight:700,color:DS.text,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>I miei serramentisti</div>
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:12,marginBottom:16}}>
          {freelancers.map((f)=>{
            const fRich=richiestePerFreelancer(f.id);
            const fAtt=fRich.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
            const fComp=fRich.filter(r=>r.stato==='completata').length;
            return(
              <button key={f.id} onClick={()=>{setSelFreelancer(f);setView('freelancer');}}
                style={{minWidth:140,background:DS.card,border:`1.5px solid ${DS.border}`,borderRadius:14,padding:14,cursor:'pointer',textAlign:'left',flexShrink:0}}>
                <div style={{width:36,height:36,borderRadius:10,background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff',marginBottom:8}}>
                  {(f.nome||'?')[0]}{(f.cognome||'?')[0]}
                </div>
                <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{f.nome} {f.cognome}</div>
                <div style={{fontSize:11,color:DS.textMid,marginTop:2}}>{f.ruolo||'montatore'}</div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <span style={{fontSize:10,fontWeight:600,color:DS.blue}}>{fAtt} attivi</span>
                  <span style={{fontSize:10,fontWeight:600,color:DS.green}}>{fComp} fatti</span>
                </div>
              </button>
            );
          })}
          {/* Card marketplace */}
          <button onClick={()=>setView('marketplace')}
            style={{minWidth:140,background:'linear-gradient(135deg,#0D1F1F,#1a3a3a)',border:'2px solid #28A0A0',borderRadius:14,padding:14,cursor:'pointer',textAlign:'left',flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(40,160,160,.2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div style={{fontWeight:700,fontSize:13,color:'#fff'}}>Marketplace</div>
            <div style={{fontSize:11,color:'rgba(139,188,188,.6)',marginTop:2}}>Pubblica per tutti</div>
          </button>
        </div>

        {/* Filtri + lista lavori globale */}
        <div style={{fontSize:12,fontWeight:700,color:DS.text,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Tutti i lavori</div>
        <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
          {[{k:'tutti',l:`Tutti (${richieste.length})`},{k:'attivi',l:`Attivi (${attivi})`},{k:'completati',l:`Completati (${completati})`}].map(f=>(
            <button key={f.k} onClick={()=>setFiltro(f.k)} style={{background:filtro===f.k?DS.teal:'#fff',color:filtro===f.k?'#fff':DS.textMid,border:`1.5px solid ${filtro===f.k?DS.teal:DS.border}`,borderRadius:20,padding:'6px 14px',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{f.l}</button>
          ))}
        </div>
        {filtered.length===0?<P c={DS.textLight} s={14} mt={40} align="center">Nessun lavoro</P>:
        filtered.map(r=><RichiestaCard key={r.id} r={r} freelancerName={getFreelancerName(r.operatore_id)} onClick={()=>openDettaglio(r)}/>)}

        {/* FAB */}
        <div style={{position:'fixed',bottom:16,right:16,display:'flex',flexDirection:'column',gap:8,zIndex:100}}>
          <button onClick={()=>setView('marketplace')} style={{width:52,height:52,borderRadius:16,background:'#0D1F1F',border:`2px solid ${DS.teal}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,.3)'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </button>
          <button onClick={()=>setView('nuovo')} style={{width:52,height:52,borderRadius:16,background:DS.teal,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(40,160,160,.4)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ─── VISTA SINGOLO FREELANCER ───────────────────────────────────────────────
  if(view==='freelancer'&&selFreelancer){
    const fRich=richiestePerFreelancer(selFreelancer.id);
    const fAtt=fRich.filter(r=>['accettata','in_corso'].includes(r.stato)).length;
    const fComp=fRich.filter(r=>r.stato==='completata').length;
    const fBudget=fRich.filter(r=>r.budget&&!['rifiutata','annullata'].includes(r.stato)).reduce((s,r)=>s+(r.budget||0),0);
    return(
      <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <Top/>
        <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 100px'}}>
          {/* Profilo freelancer */}
          <div style={{background:'linear-gradient(135deg,#0D1F1F,#1a3a3a)',borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff'}}>
                {(selFreelancer.nome||'?')[0]}{(selFreelancer.cognome||'?')[0]}
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:18,color:'#fff'}}>{selFreelancer.nome} {selFreelancer.cognome}</div>
                <div style={{fontSize:12,color:'rgba(139,188,188,.6)',marginTop:2}}>{selFreelancer.ruolo||'Montatore'}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:16}}>
              {[{n:fAtt,l:'Attivi',c:DS.blue},{n:fComp,l:'Completati',c:DS.green},{n:fBudget,l:'Totale \u20AC',c:'#F2F1EC',cur:1}].map((k,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:k.cur?16:22,color:k.c}}>{k.cur?'\u20AC'+k.n.toLocaleString('it-IT'):k.n}</div>
                  <div style={{fontSize:9,color:'rgba(139,188,188,.5)',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lavori di questo freelancer */}
          <div style={{fontSize:12,fontWeight:700,color:DS.text,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Lavori ({fRich.length})</div>
          {fRich.length===0?<P c={DS.textLight} s={14}>Nessun lavoro ancora</P>:
          fRich.map(r=><RichiestaCard key={r.id} r={r} onClick={()=>openDettaglio(r)}/>)}

          {/* Bottone invia lavoro a questo freelancer */}
          <button onClick={()=>{setView('nuovo');}} style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:568,margin:'0 auto',background:DS.teal,color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:100,boxShadow:'0 4px 20px rgba(40,160,160,.4)'}}>
            Invia lavoro a {selFreelancer.nome}
          </button>
        </div>
      </div>
    );
  }

  // ─── DETTAGLIO LAVORO ───────────────────────────────────────────────────────
  if(view==='dettaglio'&&selRichiesta){
    const r=selRichiesta;
    const st=STATO_CFG[r.stato]||STATO_CFG.nuova;
    const vani=r.vani_json||[];
    const allegati=r.allegati_json||[];
    const montaggio=montaggi[0];
    const fotoPerFase=fase=>fotoFasi.filter(f=>f.fase===fase);
    const firma=firme[0];
    const isMarketplace=r.tipo_invio==='marketplace';

    return(
      <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <Top/>
        <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 40px'}}>
          {/* Header */}
          <div style={{background:`linear-gradient(135deg,${st.bg},#fff)`,borderRadius:16,border:`2px solid ${st.c}22`,padding:16,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontWeight:800,fontSize:20,color:DS.text}}>{r.cliente}</div>
                <div style={{fontSize:13,color:DS.textMid,marginTop:4}}>{r.indirizzo}</div>
                {r.telefono_cliente&&<div style={{fontSize:12,color:DS.textMid,marginTop:2}}>Tel: {r.telefono_cliente}</div>}
                <div style={{fontSize:11,color:DS.teal,marginTop:4,fontWeight:600}}>Assegnato a: {getFreelancerName(r.operatore_id)}</div>
              </div>
              <div style={{background:st.bg,borderRadius:12,padding:'6px 14px',border:`1.5px solid ${st.c}33`}}>
                <div style={{fontSize:12,fontWeight:800,color:st.c}}>{st.l}</div>
              </div>
            </div>
            {r.urgente&&<div style={{marginTop:10,background:'#FEE2E2',borderRadius:8,padding:'6px 12px',display:'inline-flex',alignItems:'center',gap:6}}><span style={{fontSize:12,fontWeight:700,color:DS.red}}>URGENTE</span></div>}
            {isMarketplace&&<div style={{marginTop:6,background:'#E0F2FE',borderRadius:8,padding:'4px 10px',display:'inline-flex',alignItems:'center',gap:4}}><span style={{fontSize:11,fontWeight:700,color:DS.blue}}>MARKETPLACE</span></div>}
          </div>

          {/* Timeline */}
          <Cd t="Avanzamento">
            <div style={{display:'flex',gap:4,marginBottom:8}}>
              {['nuova','accettata','in_corso','completata'].map((s,i)=>{
                const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);
                return(<div key={s} style={{flex:1,textAlign:'center'}}>
                  <div style={{width:'100%',height:4,borderRadius:2,background:idx>=i?DS.teal:'#E5E7EB',marginBottom:4}}/>
                  <div style={{fontSize:9,color:idx>=i?DS.teal:DS.textLight,fontWeight:r.stato===s?800:400}}>{s==='nuova'?'Inviata':s==='accettata'?'Accettata':s==='in_corso'?'In corso':'Completata'}</div>
                </div>);
              })}
            </div>
          </Cd>

          {/* Info */}
          <Cd t="Dettagli">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <IR l="Data" v={r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'N/D'}/>
              <IR l="Ora" v={r.ora_preferita?.slice(0,5)||'N/D'}/>
              <IR l="Budget" v={r.budget?`\u20AC${r.budget}`:'N/D'}/>
              <IR l="Vani" v={`${vani.length}`}/>
            </div>
            {r.note&&<div style={{marginTop:10,background:'#F4FAFA',borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,fontWeight:600,color:DS.teal,marginBottom:2}}>Note</div><div style={{fontSize:13,color:DS.text,lineHeight:1.4}}>{r.note}</div></div>}
          </Cd>

          {/* Candidature marketplace */}
          {isMarketplace&&candidature.length>0&&<Cd t={`Candidature (${candidature.length})`}>
            {candidature.map(c=>(
              <div key={c.id} style={{background:'#F4FAFA',borderRadius:10,padding:12,marginBottom:8,border:`1.5px solid ${c.stato==='accettata'?DS.green:DS.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div>
                    <span style={{fontWeight:700,fontSize:13,color:DS.text}}>{c.operatore?`${c.operatore.nome} ${c.operatore.cognome}`:'—'}</span>
                    {c.prezzo_proposto&&<span style={{fontSize:12,fontWeight:700,color:DS.teal,marginLeft:8}}>{'\u20AC'}{c.prezzo_proposto}</span>}
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:c.stato==='accettata'?DS.green:c.stato==='rifiutata'?DS.red:DS.amber,background:c.stato==='accettata'?'#D1FAE5':c.stato==='rifiutata'?'#FEE2E2':'#FEF3C7',borderRadius:4,padding:'2px 8px'}}>
                    {c.stato==='candidata'?'In attesa':c.stato==='accettata'?'Scelto':c.stato}
                  </span>
                </div>
                {c.messaggio&&<div style={{fontSize:12,color:DS.textMid,marginTop:4}}>{c.messaggio}</div>}
                {c.stato==='candidata'&&(
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button onClick={async()=>{
                      await sb.patch('candidature_marketplace',c.id,{stato:'accettata',accettata_il:new Date().toISOString()});
                      await sb.patch('richieste_lavoro',r.id,{stato:'accettata',operatore_id:c.operatore_id,accettata_il:new Date().toISOString(),marketplace_aperta:false});
                      setCandidature(prev=>prev.map(x=>x.id===c.id?{...x,stato:'accettata'}:x.stato==='candidata'?{...x,stato:'rifiutata'}:x));
                    }} style={{flex:1,background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'8px 0',fontSize:12,fontWeight:700,cursor:'pointer'}}>Scegli questo</button>
                    <button onClick={async()=>{
                      await sb.patch('candidature_marketplace',c.id,{stato:'rifiutata'});
                      setCandidature(prev=>prev.map(x=>x.id===c.id?{...x,stato:'rifiutata'}:x));
                    }} style={{background:'#FEE2E2',color:DS.red,border:'none',borderRadius:8,padding:'8px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>No</button>
                  </div>
                )}
              </div>
            ))}
          </Cd>}

          {/* Vani */}
          {vani.length>0&&<Cd t={`Vani (${vani.length})`}>{vani.map((v,i)=><VanoRow key={i} v={v} i={i}/>)}</Cd>}

          {/* Ore lavoro */}
          {montaggio&&<Cd t="Ore lavoro">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,textAlign:'center'}}>
              <div><div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:DS.teal}}>{montaggio.ore_preventivate||'\u2014'}</div><div style={{fontSize:10,color:DS.textMid}}>Prev.</div></div>
              <div><div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:montaggio.ore_reali>montaggio.ore_preventivate?DS.red:DS.green}}>{montaggio.ore_reali?montaggio.ore_reali.toFixed(1):'\u2014'}</div><div style={{fontSize:10,color:DS.textMid}}>Reali</div></div>
              <div><div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:DS.text}}>{montaggio.stato||'\u2014'}</div><div style={{fontSize:10,color:DS.textMid}}>Stato</div></div>
            </div>
          </Cd>}

          {/* Documenti */}
          <DocSection richiesta_id={r.id} documenti={documenti} onReload={async()=>{const d=await sb.get('documenti_lavoro',{richiesta_id:'eq.'+r.id,order:'created_at.desc'});setDocumenti(d||[]);}}/>

          {/* Foto fasi */}
          {fotoFasi.length>0&&<Cd t="Documentazione fotografica">
            {['prima','durante','dopo'].map(fase=>{
              const fotos=fotoPerFase(fase);if(!fotos.length)return null;
              return(<div key={fase} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.teal,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{fase==='prima'?'Prima':fase==='durante'?'Durante':'Dopo'} ({fotos.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>{fotos.map((f,i)=><img key={i} src={f.file_url||f.url} alt="" style={{width:'100%',height:80,objectFit:'cover',borderRadius:8,border:`1px solid ${DS.border}`}}/>)}</div>
              </div>);
            })}
          </Cd>}

          {/* Firma */}
          {firma&&<Cd t="Firma collaudo"><div style={{textAlign:'center'}}><img src={firma.firma_url} alt="Firma" style={{maxWidth:'100%',maxHeight:150,border:`1px solid ${DS.border}`,borderRadius:8}}/><div style={{fontSize:11,color:DS.textMid,marginTop:6}}>Firmato da {firma.firmato_da}</div></div></Cd>}
        </div>
      </div>
    );
  }

  // ─── MARKETPLACE ────────────────────────────────────────────────────────────
  if(view==='marketplace')return <MarketplaceView azienda={azienda} onBack={()=>setView('dashboard')} onSent={()=>{reloadRichieste();setView('dashboard');}}/>;

  // ─── NUOVO LAVORO DIRETTO ───────────────────────────────────────────────────
  if(view==='nuovo')return <NuovoForm azienda={azienda} freelancers={freelancers} selFreelancer={selFreelancer} inviteCode={inviteCode} onSent={()=>{reloadRichieste();setView('dashboard');}} onBack={()=>setView(selFreelancer?'freelancer':'dashboard')}/>;

  return null;
}

// ─── DOCUMENTO SECTION (upload + lista) ───────────────────────────────────────
function DocSection({richiesta_id,documenti,onReload}){
  const [uploading,setUploading]=useState(false);
  const [tipoDoc,setTipoDoc]=useState('foto');
  const fileRef=useRef(null);

  const handleUpload=async(e)=>{
    const files=e.target.files;if(!files)return;
    setUploading(true);
    for(let i=0;i<files.length;i++){
      const f=files[i];
      const path=`docs/${richiesta_id}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const url=await sb.upload(path,f);
      if(url){
        await sb.post('documenti_lavoro',{richiesta_id,caricato_da:'azienda',tipo:tipoDoc,nome:f.name,url});
      }
    }
    setUploading(false);
    e.target.value='';
    onReload();
  };

  return(
    <Cd t={`Documenti (${documenti.length})`}>
      {documenti.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
        {documenti.map(d=>(
          <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:10,background:'#F4FAFA',borderRadius:8,padding:'8px 12px',border:`1px solid ${DS.border}`,textDecoration:'none'}}>
            <div style={{width:32,height:32,borderRadius:8,background:d.caricato_da==='azienda'?'#DBEAFE':'#D1FAE5',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.caricato_da==='azienda'?DS.blue:DS.green} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:DS.text}}>{d.nome}</div>
              <div style={{fontSize:10,color:DS.textMid}}>{d.tipo} · {d.caricato_da} · {new Date(d.created_at).toLocaleDateString('it-IT')}</div>
            </div>
          </a>
        ))}
      </div>}
      <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xlsx,.dwg" multiple style={{display:'none'}} onChange={handleUpload}/>
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
        {['foto','planimetria','specifiche','contratto','certificato','altro'].map(t=>(
          <button key={t} onClick={()=>setTipoDoc(t)} style={{fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:20,border:`1px solid ${tipoDoc===t?DS.teal:DS.border}`,background:tipoDoc===t?'#EEF8F8':'#fff',color:tipoDoc===t?DS.teal:DS.textMid,cursor:'pointer'}}>{t}</button>
        ))}
      </div>
      <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{width:'100%',border:`2px dashed ${DS.border}`,background:'transparent',borderRadius:10,padding:'12px 0',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13,opacity:uploading?.5:1}}>
        {uploading?'Caricamento...':'+ Carica documento'}
      </button>
    </Cd>
  );
}

// ─── MARKETPLACE VIEW ─────────────────────────────────────────────────────────
function MarketplaceView({azienda,onBack,onSent}){
  const [cliente,setCliente]=useState('');
  const [indirizzo,setIndirizzo]=useState('');
  const [budget,setBudget]=useState('');
  const [note,setNote]=useState('');
  const [vani,setVani]=useState([{id:1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const [urgente,setUrgente]=useState(false);
  const [dataP,setDataP]=useState('');
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);

  const addV=()=>setVani(v=>[...v,{id:v.length+1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const rmV=id=>setVani(v=>v.filter(x=>x.id!==id));
  const upV=(id,f,val)=>setVani(v=>v.map(x=>x.id===id?{...x,[f]:val}:x));

  const pubblica=async()=>{
    if(!cliente.trim()||!indirizzo.trim())return;
    setSending(true);
    await sb.post('richieste_lavoro',{
      azienda_fl_id:azienda.id,
      operatore_id:azienda.operatore_id, // inizialmente associato al primo freelance, poi cambiato quando si sceglie
      cliente:cliente.trim(),indirizzo:indirizzo.trim(),
      data_preferita:dataP||null,urgente,
      budget:budget?parseFloat(budget):null,note,
      vani_json:vani.map(v=>({tipo:v.tipo,materiale:v.materiale,larghezza:v.larghezza?parseInt(v.larghezza):null,altezza:v.altezza?parseInt(v.altezza):null,stanza:v.stanza,piano:v.piano,note:v.note})),
      tipo_invio:'marketplace',marketplace_aperta:true,stato:'nuova',
    });
    setSending(false);setSent(true);setTimeout(()=>onSent(),1500);
  };

  if(sent)return<Full><IC bg="#D1FAE5"><CS c={DS.green}/></IC><P c={DS.text} w={800} s={22} mt={16}>Pubblicato!</P><P c={DS.textMid} mt={8}>Tutti i serramentisti vedranno la richiesta</P></Full>;

  return(
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <div style={{background:DS.topbar,padding:'14px 20px',position:'sticky',top:0,zIndex:100}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:DS.teal,fontWeight:700,fontSize:13,padding:0,marginBottom:6}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Dashboard
        </button>
        <div style={{fontWeight:800,fontSize:18,color:'#fff'}}>Pubblica sul Marketplace</div>
        <div style={{fontSize:12,color:'rgba(139,188,188,.6)',marginTop:2}}>Tutti i serramentisti freelance potranno candidarsi</div>
      </div>
      <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 100px',display:'flex',flexDirection:'column',gap:12}}>
        <Cd t="Dati cliente">
          <In l="Nome cliente *" v={cliente} o={setCliente} p="Mario Rossi"/>
          <In l="Indirizzo cantiere *" v={indirizzo} o={setIndirizzo} p="Via Roma 45, Cosenza"/>
        </Cd>
        <Cd t="Tempistiche">
          <In l="Data preferita" v={dataP} o={setDataP} t="date"/>
          <Tog v={urgente} o={()=>setUrgente(!urgente)} l="Urgente"/>
        </Cd>
        <Cd t={`Vani (${vani.length})`}>
          {vani.map((v,i)=><VanoForm key={v.id} v={v} i={i} onUpdate={upV} onRemove={rmV} canRemove={vani.length>1}/>)}
          <button onClick={addV} style={{width:'100%',border:`2px dashed ${DS.border}`,background:'transparent',borderRadius:10,padding:'10px 0',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13}}>+ Aggiungi vano</button>
        </Cd>
        <Cd t="Budget"><In l="Budget indicativo (\u20AC)" v={budget} o={setBudget} p="350" t="number"/></Cd>
        <Cd t="Note"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Descrivi il lavoro..." style={{width:'100%',minHeight:80,border:`1.5px solid ${DS.border}`,borderRadius:10,padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box'}}/></Cd>
      </div>
      <button onClick={pubblica} disabled={!cliente.trim()||!indirizzo.trim()||sending}
        style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:568,margin:'0 auto',background:(!cliente.trim()||!indirizzo.trim())?'#9CA3AF':'#0D1F1F',color:'#fff',border:`2px solid ${DS.teal}`,borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:100,boxShadow:'0 4px 20px rgba(0,0,0,.3)',opacity:sending?.6:1}}>
        {sending?'Pubblicazione...':'Pubblica sul Marketplace'}
      </button>
    </div>
  );
}

// ─── FORM NUOVO LAVORO DIRETTO ────────────────────────────────────────────────
function NuovoForm({azienda,freelancers,selFreelancer,inviteCode,onSent,onBack}){
  const [target,setTarget]=useState(selFreelancer?.id||freelancers[0]?.id||'');
  const [cliente,setCliente]=useState('');
  const [indirizzo,setIndirizzo]=useState('');
  const [telC,setTelC]=useState('');const [emailC,setEmailC]=useState('');
  const [dataP,setDataP]=useState('');const [oraP,setOraP]=useState('');
  const [urgente,setUrgente]=useState(false);const [budget,setBudget]=useState('');const [note,setNote]=useState('');
  const [vani,setVani]=useState([{id:1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const [allegati,setAllegati]=useState([]);const [uploading,setUploading]=useState(false);
  const [sending,setSending]=useState(false);const [sent,setSent]=useState(false);
  const fileRef=useRef(null);

  const addV=()=>setVani(v=>[...v,{id:v.length+1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const rmV=id=>setVani(v=>v.filter(x=>x.id!==id));
  const upV=(id,f,val)=>setVani(v=>v.map(x=>x.id===id?{...x,[f]:val}:x));

  const handleUp=async e=>{const files=e.target.files;if(!files)return;setUploading(true);for(let i=0;i<files.length;i++){const f=files[i];const path=`portale/${inviteCode}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const url=await sb.upload(path,f);if(url)setAllegati(p=>[...p,{nome:f.name,url,tipo:f.type.startsWith('image')?'img':'file'}]);}setUploading(false);e.target.value='';};

  const invia=async()=>{
    if(!cliente.trim()||!indirizzo.trim()||!target)return;
    setSending(true);
    // Trova l'azienda_freelance per questo operatore
    const azfl=await sb.get('aziende_freelance',{operatore_id:'eq.'+target,nome:'eq.'+azienda.nome,limit:'1'});
    const azFlId=azfl?.[0]?.id||azienda.id;
    await sb.post('richieste_lavoro',{
      azienda_fl_id:azFlId,operatore_id:target,
      cliente:cliente.trim(),indirizzo:indirizzo.trim(),telefono_cliente:telC,email_cliente:emailC,
      data_preferita:dataP||null,ora_preferita:oraP||null,urgente,
      budget:budget?parseFloat(budget):null,note,
      vani_json:vani.map(v=>({tipo:v.tipo,materiale:v.materiale,larghezza:v.larghezza?parseInt(v.larghezza):null,altezza:v.altezza?parseInt(v.altezza):null,stanza:v.stanza,piano:v.piano,note:v.note})),
      allegati_json:allegati,tipo_invio:'diretto',stato:'nuova',
    });
    setSending(false);setSent(true);setTimeout(()=>onSent(),1500);
  };

  const targetName=freelancers.find(f=>f.id===target);
  const [showImport,setShowImport]=useState(false);

  const handleImport=(data)=>{
    if(data.cliente) setCliente(data.cliente);
    if(data.indirizzo) setIndirizzo(data.indirizzo);
    if(data.telefono) setTelC(data.telefono);
    if(data.email) setEmailC(data.email);
    if(data.note) setNote(data.note);
    if(data.vani?.length>0){
      setVani(data.vani.map((v,i)=>({id:i+1,tipo:v.tipo||'Finestra',materiale:v.materiale||'PVC',larghezza:v.larghezza?String(v.larghezza):'',altezza:v.altezza?String(v.altezza):'',stanza:v.stanza||'',piano:v.piano||'PT',note:[v.note,v.colore_int?'Int:'+v.colore_int:'',v.colore_est?'Est:'+v.colore_est:'',v.vetro?'Vetro:'+v.vetro:'',v.sistema?'Sistema:'+v.sistema:''].filter(Boolean).join(' · ')})));
    }
    setShowImport(false);
  };

  if(sent)return<Full><IC bg="#D1FAE5"><CS c={DS.green}/></IC><P c={DS.text} w={800} s={22} mt={16}>Inviata!</P><P c={DS.textMid} mt={8}>{targetName?`${targetName.nome} ${targetName.cognome}`:'Il montatore'} riceverà una notifica</P></Full>;

  return(
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      {showImport&&<ImportaCommessa onImport={handleImport} onClose={()=>setShowImport(false)}/>}
      <div style={{background:DS.topbar,padding:'14px 20px',position:'sticky',top:0,zIndex:100}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:DS.teal,fontWeight:700,fontSize:13,padding:0,marginBottom:6}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Indietro
        </button>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:800,fontSize:18,color:'#fff'}}>Nuovo lavoro</div>
          <button onClick={()=>setShowImport(true)} style={{background:'rgba(40,160,160,.15)',border:`1.5px solid ${DS.teal}`,borderRadius:10,padding:'6px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style={{fontSize:12,fontWeight:700,color:DS.teal}}>Importa</span>
          </button>
        </div>
      </div>
      <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 100px',display:'flex',flexDirection:'column',gap:12}}>
        {/* Scegli freelancer */}
        {freelancers.length>1&&<Cd t="Assegna a">
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {freelancers.map(f=>(
              <button key={f.id} onClick={()=>setTarget(f.id)}
                style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:10,border:`2px solid ${target===f.id?DS.teal:DS.border}`,background:target===f.id?'#EEF8F8':'#fff',cursor:'pointer'}}>
                <div style={{width:28,height:28,borderRadius:8,background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'}}>{(f.nome||'?')[0]}{(f.cognome||'?')[0]}</div>
                <span style={{fontSize:13,fontWeight:target===f.id?700:400,color:target===f.id?DS.teal:DS.text}}>{f.nome} {f.cognome}</span>
              </button>
            ))}
          </div>
        </Cd>}
        <Cd t="Dati cliente">
          <In l="Nome cliente *" v={cliente} o={setCliente} p="Mario Rossi"/>
          <In l="Indirizzo cantiere *" v={indirizzo} o={setIndirizzo} p="Via Roma 45, Cosenza"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <In l="Telefono" v={telC} o={setTelC} p="333 1234567" t="tel"/>
            <In l="Email" v={emailC} o={setEmailC} p="mario@email.it" t="email"/>
          </div>
        </Cd>
        <Cd t="Tempistiche">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <In l="Data preferita" v={dataP} o={setDataP} t="date"/>
            <In l="Ora preferita" v={oraP} o={setOraP} t="time"/>
          </div>
          <Tog v={urgente} o={()=>setUrgente(!urgente)} l="Urgente"/>
        </Cd>
        <Cd t={`Vani (${vani.length})`}>
          {vani.map((v,i)=><VanoForm key={v.id} v={v} i={i} onUpdate={upV} onRemove={rmV} canRemove={vani.length>1}/>)}
          <button onClick={addV} style={{width:'100%',border:`2px dashed ${DS.border}`,background:'transparent',borderRadius:10,padding:'10px 0',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13}}>+ Aggiungi vano</button>
        </Cd>
        <Cd t="Budget"><In l="Budget indicativo (\u20AC)" v={budget} o={setBudget} p="350" t="number"/></Cd>
        <Cd t={`Allegati (${allegati.length})`}>
          <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple style={{display:'none'}} onChange={handleUp}/>
          {allegati.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>{allegati.map((a,i)=>(<div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',border:`1px solid ${DS.border}`}}>{a.tipo==='img'?<img src={a.url} alt="" style={{width:'100%',height:80,objectFit:'cover',display:'block'}}/>:<div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',background:'#F4FAFA'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>}<button onClick={()=>setAllegati(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'rgba(0,0,0,.5)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><XS c="#fff" s={10}/></button></div>))}</div>}
          <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{width:'100%',border:`2px dashed ${DS.border}`,background:'transparent',borderRadius:10,padding:'14px 0',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:13,opacity:uploading?.5:1}}>{uploading?'Caricamento...':'+ Foto, planimetrie, documenti'}</button>
        </Cd>
        <Cd t="Note"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Descrivi il lavoro..." style={{width:'100%',minHeight:80,border:`1.5px solid ${DS.border}`,borderRadius:10,padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box'}}/></Cd>
      </div>
      <button onClick={invia} disabled={!cliente.trim()||!indirizzo.trim()||sending}
        style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:568,margin:'0 auto',background:(!cliente.trim()||!indirizzo.trim())?'#9CA3AF':DS.teal,color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:100,boxShadow:'0 4px 20px rgba(40,160,160,.4)',opacity:sending?.6:1}}>
        {sending?'Invio...':'Invia lavoro'}
      </button>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function RichiestaCard({r,freelancerName,onClick}){
  const st=STATO_CFG[r.stato]||STATO_CFG.nuova;const nV=(r.vani_json||[]).length;
  const isMkt=r.tipo_invio==='marketplace';
  return(
    <button onClick={onClick} style={{width:'100%',background:'#fff',border:`1.5px solid ${r.urgente?'#DC4444':'#C8E4E4'}`,borderRadius:14,padding:'14px 16px',marginBottom:10,cursor:'pointer',textAlign:'left',display:'block'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
        <div style={{flex:1,paddingRight:10}}>
          <div style={{fontWeight:700,fontSize:15,color:'#0D1F1F'}}>{r.cliente}</div>
          <div style={{fontSize:12,color:'#4A7070',marginTop:2}}>{r.indirizzo}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
          <div style={{background:st.bg,borderRadius:20,padding:'3px 10px'}}><span style={{fontSize:10,fontWeight:700,color:st.c}}>{st.l}</span></div>
          {isMkt&&<span style={{fontSize:9,fontWeight:700,color:'#3B7FE0',background:'#DBEAFE',borderRadius:4,padding:'1px 6px'}}>MKT</span>}
        </div>
      </div>
      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <span style={{fontSize:12,color:'#4A7070'}}>{nV} vani</span>
        {r.budget&&<span style={{fontSize:12,fontWeight:700,color:'#28A0A0'}}>{'\u20AC'}{r.budget}</span>}
        {freelancerName&&<span style={{fontSize:11,color:'#8BBCBC'}}>{freelancerName}</span>}
        {r.urgente&&<span style={{fontSize:10,fontWeight:700,color:'#DC4444',background:'#FEE2E2',borderRadius:4,padding:'1px 6px'}}>URGENTE</span>}
      </div>
    </button>
  );
}

function VanoRow({v,i}){return<div style={{background:'#F4FAFA',borderRadius:10,padding:12,marginBottom:8,border:'1px solid #C8E4E4'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}><span style={{fontWeight:700,fontSize:13,color:'#0D1F1F'}}>Vano {i+1} — {v.tipo}</span><span style={{fontSize:11,fontWeight:600,color:'#28A0A0',background:'#EEF8F8',borderRadius:4,padding:'1px 8px'}}>{v.materiale}</span></div><div style={{display:'flex',gap:12,fontSize:12,color:'#4A7070'}}>{v.larghezza&&v.altezza&&<span>{v.larghezza}x{v.altezza} mm</span>}{v.stanza&&<span>{v.stanza}</span>}{v.piano&&<span>P. {v.piano}</span>}</div>{v.note&&<div style={{fontSize:12,color:'#4A7070',marginTop:4,fontStyle:'italic'}}>{v.note}</div>}</div>;}

function VanoForm({v,i,onUpdate,onRemove,canRemove}){
  return(<div style={{background:'#F4FAFA',borderRadius:10,padding:12,marginBottom:10,border:'1px solid #C8E4E4',position:'relative'}}>
    {canRemove&&<button onClick={()=>onRemove(v.id)} style={{position:'absolute',top:8,right:8,background:'none',border:'none',cursor:'pointer',padding:4}}><XS c="#DC4444" s={16}/></button>}
    <div style={{fontSize:12,fontWeight:700,color:'#28A0A0',marginBottom:8}}>Vano {i+1}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
      <Sl l="Tipo" v={v.tipo} o={val=>onUpdate(v.id,'tipo',val)} opts={TIPI_VANO}/>
      <Sl l="Materiale" v={v.materiale} o={val=>onUpdate(v.id,'materiale',val)} opts={MAT_OPT}/>
      <In l="Larghezza mm" v={v.larghezza} o={val=>onUpdate(v.id,'larghezza',val)} p="1200" t="number"/>
      <In l="Altezza mm" v={v.altezza} o={val=>onUpdate(v.id,'altezza',val)} p="1400" t="number"/>
      <In l="Stanza" v={v.stanza} o={val=>onUpdate(v.id,'stanza',val)} p="Soggiorno"/>
      <Sl l="Piano" v={v.piano} o={val=>onUpdate(v.id,'piano',val)} opts={['PT','1','2','3','4','5','Interrato']}/>
    </div>
    <In l="Note" v={v.note} o={val=>onUpdate(v.id,'note',val)} p="Controtelaio, davanzale..."/>
  </div>);
}

function Tog({v,o,l}){return<div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}><button onClick={o} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',position:'relative',background:v?'#DC4444':'#D1D5DB',transition:'.2s'}}><div style={{width:20,height:20,borderRadius:10,background:'#fff',position:'absolute',top:2,left:v?22:2,transition:'.2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/></button><span style={{fontSize:13,fontWeight:v?700:400,color:v?'#DC4444':'#4A7070'}}>{v?l.toUpperCase():l}</span></div>;}

// Primitives
function Full({children}){return<div style={{minHeight:'100vh',background:'#E8F4F4',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>{children}</div>;}
function Spinner(){return<><div style={{width:40,height:40,border:'3px solid #C8E4E4',borderTop:'3px solid #28A0A0',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></>;}
function IC({bg,children}){return<div style={{width:64,height:64,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center'}}>{children}</div>;}
function CS({c}){return<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;}
function XS({c,s=16}){return<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;}
function P({c,w,s,mt,align,children}){return<div style={{color:c,fontWeight:w||400,fontSize:s||14,marginTop:mt||0,textAlign:align||'left'}}>{children}</div>;}
function Cd({t,children}){return<div style={{background:'#fff',borderRadius:14,border:'1.5px solid #C8E4E4',padding:'14px 16px',marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:'#0D1F1F',marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>{t}</div>{children}</div>;}
function In({l,v,o,p,t}){return<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:600,color:'#4A7070',marginBottom:4}}>{l}</div><input value={v} onChange={e=>o(e.target.value)} placeholder={p} type={t||'text'} style={{width:'100%',border:'1.5px solid #C8E4E4',borderRadius:8,padding:'9px 12px',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>;}
function Sl({l,v,o,opts}){return<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:600,color:'#4A7070',marginBottom:4}}>{l}</div><select value={v} onChange={e=>o(e.target.value)} style={{width:'100%',border:'1.5px solid #C8E4E4',borderRadius:8,padding:'9px 12px',fontSize:14,fontFamily:'inherit',outline:'none',background:'#fff',boxSizing:'border-box'}}>{opts.map(x=><option key={x} value={x}>{x}</option>)}</select></div>;}
function IR({l,v}){return<div><div style={{fontSize:10,fontWeight:600,color:'#8BBCBC',marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0D1F1F'}}>{v}</div></div>;}
