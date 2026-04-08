// ts-20260405h
'use client';
import React, { useState } from 'react';
import {
  Home, Calendar, ClipboardList, TrendingUp, Settings,
  Building2, Clock, MapPin, Phone, ChevronRight, Plus,
  Check, AlertCircle, ArrowUp, ArrowDown, FileText,
  Wrench, Package, Euro, Wallet, BarChart2, Bell, X
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
const gridBg: React.CSSProperties = {
  backgroundImage:`repeating-linear-gradient(0deg,rgba(40,160,160,.10) 0px,rgba(40,160,160,.10) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(40,160,160,.10) 0px,rgba(40,160,160,.10) 1px,transparent 1px,transparent 32px)`,
  backgroundColor:DS.bg,
};
const card: React.CSSProperties = {
  background:'linear-gradient(145deg,#fff,#f4fcfc)',
  borderRadius:14, border:`1.5px solid ${DS.border}`,
  boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:14,
};
const bp = (bg:string, sh:string, p=false): React.CSSProperties => ({
  background:bg, color:'#fff', border:'none', borderRadius:10,
  padding:'11px 16px', fontFamily:DS.ui, fontWeight:700, fontSize:14,
  cursor:'pointer', display:'flex', alignItems:'center', gap:8,
  boxShadow:p?'none':`0 4px 0 0 ${sh}`,
  transform:p?'translateY(3px)':'none', transition:'all 80ms',
});

type FView = 'home'|'lavori'|'ordini'|'contabilita'|'mercato'|'impostazioni';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const AZIENDE = [
  {id:'AZ1', nome:'Walter Cozza Serramenti', citta:'Cosenza', colore:DS.teal,   avatar:'WC'},
  {id:'AZ2', nome:'Infissi Sud Srl',          citta:'Brindisi', colore:DS.blue,  avatar:'IS'},
  {id:'AZ3', nome:'Serramenti Greco',         citta:'Taranto',  colore:DS.amber, avatar:'SG'},
];

const COMMESSE = [
  {id:'COM-047', aziendaId:'AZ1', cliente:'Fam. Rossi',    data:'2026-04-05', importo:850,  stato:'in_corso',   pagato:false, vani:3, tipo:'Montaggio PVC'},
  {id:'COM-048', aziendaId:'AZ1', cliente:'Cond. Verdi',   data:'2026-04-08', importo:1200, stato:'da_fare',    pagato:false, vani:6, tipo:'Montaggio alluminio'},
  {id:'COM-031', aziendaId:'AZ2', cliente:'Studio Greco',  data:'2026-03-28', importo:650,  stato:'completato', pagato:true,  vani:2, tipo:'Sostituzione finestre'},
  {id:'COM-029', aziendaId:'AZ2', cliente:'Sig. Martini',  data:'2026-03-20', importo:420,  stato:'completato', pagato:false, vani:1, tipo:'Porta balcone'},
  {id:'COM-012', aziendaId:'AZ3', cliente:'Cond. Europa',  data:'2026-03-10', importo:2100, stato:'completato', pagato:true,  vani:8, tipo:'Ristrutturazione completa'},
];

const ORDINI_FL = [
  {id:'ORD-001', commessaId:'COM-047', aziendaId:'AZ1', desc:'Guarnizioni EPDM 8mm', qty:10, stato:'confermato', data:'2026-04-04'},
  {id:'ORD-002', commessaId:'COM-047', aziendaId:'AZ1', desc:'Coprifili alluminio 40mm', qty:6, stato:'in_arrivo', data:'2026-04-05'},
  {id:'ORD-003', commessaId:'COM-048', aziendaId:'AZ1', desc:'Viti acciaio inox M6', qty:50, stato:'bozza', data:'2026-04-06'},
  {id:'ORD-004', commessaId:'COM-031', aziendaId:'AZ2', desc:'Silicone neutro bianco', qty:4, stato:'consegnato', data:'2026-03-27'},
];

const MOVIMENTI = [
  {id:'M1', tipo:'entrata', desc:'Pagamento COM-031 — Infissi Sud', importo:650,  data:'2026-03-30', aziendaId:'AZ2'},
  {id:'M2', tipo:'entrata', desc:'Acconto COM-012 — Serramenti Greco', importo:1050, data:'2026-03-15', aziendaId:'AZ3'},
  {id:'M3', tipo:'uscita',  desc:'Carburante furgone', importo:85,   data:'2026-04-03', aziendaId:null},
  {id:'M4', tipo:'uscita',  desc:'Attrezzi — cacciaviti set', importo:45,   data:'2026-04-01', aziendaId:null},
  {id:'M5', tipo:'entrata', desc:'Saldo COM-012 — Serramenti Greco', importo:1050, data:'2026-04-02', aziendaId:'AZ3'},
];


// ─── MERCATO LAVORI DISPONIBILI ─────────────────────────────────────────────
const LAVORI_DISP = [
  {id:'LD-001', aziendaId:'AZ1', titolo:'Montaggio infissi PVC', cliente:'Studio Arch. Bianchi',
   data:'2026-04-10', ore:6, vani:4, budget:380, zona:'Lecce', urgente:false, stato:'aperto'},
  {id:'LD-002', aziendaId:'AZ2', titolo:'Sostituzione porta balcone', cliente:'Sig.ra Martini',
   data:'2026-04-08', ore:3, vani:1, budget:200, zona:'Brindisi', urgente:true, stato:'aperto'},
  {id:'LD-003', aziendaId:'AZ3', titolo:'Montaggio zanzariere', cliente:'Cond. Verdi',
   data:'2026-04-12', ore:4, vani:6, budget:150, zona:'Taranto', urgente:false, stato:'aperto'},
  {id:'LD-004', aziendaId:'AZ1', titolo:'Ristrutturazione finestre villa', cliente:'Fam. Colombo',
   data:'2026-04-15', ore:8, vani:5, budget:620, zona:'Cosenza', urgente:false, stato:'aperto'},
];

type OffertaStato = 'bozza'|'inviata'|'accettata'|'rifiutata';
type Offerta = {id:string; lavId:string; importo:string; nota:string; stato:OffertaStato; data:string};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function az(id:string|null){ return AZIENDE.find(a=>a.id===id); }
function fmt(n:number){ return '€'+n.toLocaleString('it-IT'); }

// ─── HOME FREELANCE ───────────────────────────────────────────────────────────
function HomeFreelance({onNav}:{onNav:(v:FView)=>void}){
  const now = new Date();
  const ora = now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  const giorno = now.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});

  const totGuadagnato = MOVIMENTI.filter(m=>m.tipo==='entrata').reduce((a,m)=>a+m.importo,0);
  const totUscite = MOVIMENTI.filter(m=>m.tipo==='uscita').reduce((a,m)=>a+m.importo,0);
  const daIncassare = COMMESSE.filter(c=>c.stato==='completato'&&!c.pagato).reduce((a,c)=>a+c.importo,0);
  const lavoriOggi = COMMESSE.filter(c=>c.stato==='in_corso');

  return(
    <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:0}}>
      {/* Header vetro */}
      <div style={{background:'linear-gradient(180deg,rgba(13,31,31,0.98),rgba(13,31,31,0.92))',padding:'14px 16px 16px',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(139,188,188,0.6)'}}>{ora} · {giorno}</div>
            <div style={{fontWeight:800,color:'#F2F1EC',fontSize:20,marginTop:2}}>Marco Vito</div>
            <div style={{fontSize:11,color:DS.teal,marginTop:1}}>Montatore Freelance · {AZIENDE.length} aziende</div>
          </div>
          <div style={{background:'rgba(26,158,115,0.2)',border:'1px solid rgba(26,158,115,0.4)',borderRadius:20,padding:'5px 12px',fontSize:11,fontWeight:700,color:'#4AE8A8'}}>
            ÔùÅ Attivo
          </div>
        </div>
        {/* KPI row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[
            {label:'Incassato',val:fmt(totGuadagnato-totUscite),col:'#4AE8A8'},
            {label:'Da incassare',val:fmt(daIncassare),col:'#F5B942'},
            {label:'Lavori attivi',val:lavoriOggi.length+'',col:DS.teal},
          ].map((k,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 10px',border:'1px solid rgba(40,160,160,0.15)'}}>
              <div style={{fontSize:9,color:'rgba(139,188,188,0.6)',marginBottom:3}}>{k.label}</div>
              <div style={{fontFamily:DS.mono,fontWeight:700,fontSize:14,color:k.col}}>{k.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12,padding:'14px 14px 24px'}}>
        {/* Aziende */}
        <div style={{fontSize:11,color:DS.textMid,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,display:'flex',alignItems:'center',gap:5}}>
          <Building2 size={11} color={DS.teal}/> Le mie aziende
        </div>
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
          {AZIENDE.map(a=>{
            const comm=COMMESSE.filter(c=>c.aziendaId===a.id);
            const attive=comm.filter(c=>c.stato!=='completato').length;
            const daInc=comm.filter(c=>c.stato==='completato'&&!c.pagato).reduce((x,c)=>x+c.importo,0);
            return(
              <div key={a.id} style={{...card,flexShrink:0,minWidth:160,borderLeft:`4px solid ${a.colore}`}}>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:a.colore,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,color:'#fff',flexShrink:0}}>{a.avatar}</div>
                  <div>
                    <div style={{fontWeight:700,color:DS.text,fontSize:12,lineHeight:1.2}}>{a.nome}</div>
                    <div style={{fontSize:10,color:DS.textMid}}>{a.citta}</div>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                  <span style={{color:DS.textMid}}>{comm.length} comm.</span>
                  {attive>0&&<span style={{color:a.colore,fontWeight:700}}>{attive} attive</span>}
                </div>
                {daInc>0&&<div style={{fontSize:10,color:DS.amber,marginTop:3,fontWeight:700}}>Da incassare {fmt(daInc)}</div>}
              </div>
            );
          })}
        </div>

        {/* Lavoro di oggi */}
        {lavoriOggi.length>0&&<>
          <div style={{fontSize:11,color:DS.textMid,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,display:'flex',alignItems:'center',gap:5}}>
            <Wrench size={11} color={DS.teal}/> Oggi al cantiere
          </div>
          {lavoriOggi.map(c=>{
            const a=az(c.aziendaId);
            return(
              <div key={c.id} style={{...card,border:`2px solid ${DS.teal}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,color:DS.text,fontSize:15}}>{c.cliente}</div>
                    <div style={{fontSize:12,color:DS.textMid,marginTop:2}}>{c.tipo} · {c.vani} vani</div>
                  </div>
                  <div style={{fontFamily:DS.mono,fontWeight:700,fontSize:16,color:DS.green}}>{fmt(c.importo)}</div>
                </div>
                {a&&<div style={{fontSize:11,color:a.colore,fontWeight:600,display:'flex',gap:5,alignItems:'center'}}>
                  <Building2 size={10}/> {a.nome}
                </div>}
              </div>
            );
          })}
        </>}

        {/* Pagamenti in attesa */}
        {daIncassare>0&&<>
          <div style={{fontSize:11,color:DS.textMid,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,display:'flex',alignItems:'center',gap:5}}>
            <AlertCircle size={11} color={DS.amber}/> Da incassare
          </div>
          <div style={{...card,border:`1.5px solid ${DS.amber}33`}}>
            {COMMESSE.filter(c=>c.stato==='completato'&&!c.pagato).map((c,i,arr)=>{
              const a=az(c.aziendaId);
              return(
                <div key={c.id} style={{display:'flex',gap:10,alignItems:'center',padding:'9px 0',borderBottom:i<arr.length-1?`1px solid ${DS.border}`:'none'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:DS.amber,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:DS.text,fontWeight:600}}>{c.cliente} — {c.id}</div>
                    <div style={{fontSize:11,color:DS.textMid}}>{a?.nome} · completato {c.data.slice(5).replace('-','/')}</div>
                  </div>
                  <span style={{fontFamily:DS.mono,fontWeight:700,color:DS.amber,fontSize:13}}>{fmt(c.importo)}</span>
                </div>
              );
            })}
            <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${DS.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:DS.textMid}}>Totale da incassare</span>
              <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:DS.amber}}>{fmt(daIncassare)}</span>
            </div>
          </div>
        </>}

        {/* Azioni rapide */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {label:'I miei lavori',icon:<ClipboardList size={16}/>,color:DS.teal,sh:DS.tealDark,v:'lavori' as FView},
            {label:'Contabilità',icon:<TrendingUp size={16}/>,color:DS.green,sh:DS.greenDark,v:'contabilita' as FView},
            {label:'Ordini',icon:<Package size={16}/>,color:DS.amber,sh:DS.amberDark,v:'ordini' as FView},
            {label:'Impostazioni',icon:<Settings size={16}/>,color:DS.blue,sh:'#2563EB',v:'impostazioni' as FView},
          ].map(a=>(
            <button key={a.label} onClick={()=>onNav(a.v)}
              style={{...card,border:`1.5px solid ${a.color}33`,cursor:'pointer',display:'flex',flexDirection:'column',gap:8,alignItems:'flex-start',boxShadow:`0 4px 0 0 ${a.color}33`}}>
              <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${a.color},${a.sh})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
                {a.icon}
              </div>
              <span style={{fontWeight:700,color:DS.text,fontSize:13}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LAVORI ───────────────────────────────────────────────────────────────────
function MieiLavori(){
  const [filtro,setFiltro]=useState<'tutti'|'in_corso'|'da_fare'|'completato'>('tutti');
  const [filtroAz,setFiltroAz]=useState<string|null>(null);
  const comm=COMMESSE.filter(c=>
    (filtro==='tutti'||c.stato===filtro)&&
    (!filtroAz||c.aziendaId===filtroAz)
  );
  const statoLabel:Record<string,string>={in_corso:'In corso',da_fare:'Da fare',completato:'Completato'};
  const statoCol:Record<string,string>={in_corso:DS.teal,da_fare:DS.amber,completato:DS.green};

  return(
    <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12}}>
      {/* Filtro stato */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
        {(['tutti','in_corso','da_fare','completato'] as const).map(f=>(
          <button key={f} onClick={()=>setFiltro(f)}
            style={{flexShrink:0,background:filtro===f?DS.teal:DS.tealLight,color:filtro===f?'#fff':DS.teal,border:`1px solid ${filtro===f?DS.teal:DS.border}`,borderRadius:20,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:filtro===f?700:400,fontFamily:DS.ui}}>
            {f==='tutti'?'Tutti':statoLabel[f]}
          </button>
        ))}
      </div>
      {/* Filtro azienda */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
        <button onClick={()=>setFiltroAz(null)} style={{flexShrink:0,background:!filtroAz?DS.topbar:'#fff',color:!filtroAz?'#fff':DS.textMid,border:`1px solid ${DS.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:11,fontFamily:DS.ui}}>Tutte</button>
        {AZIENDE.map(a=>(
          <button key={a.id} onClick={()=>setFiltroAz(filtroAz===a.id?null:a.id)}
            style={{flexShrink:0,background:filtroAz===a.id?a.colore:'#fff',color:filtroAz===a.id?'#fff':DS.textMid,border:`1px solid ${filtroAz===a.id?a.colore:DS.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:11,fontFamily:DS.ui}}>
            {a.avatar}
          </button>
        ))}
      </div>
      {comm.map(c=>{
        const a=az(c.aziendaId);
        const col=statoCol[c.stato]||DS.textMid;
        return(
          <div key={c.id} style={{...card,borderLeft:`4px solid ${col}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,color:DS.text,fontSize:15}}>{c.cliente}</div>
                <div style={{fontSize:12,color:DS.textMid,marginTop:2}}>{c.tipo} · {c.vani} vani · {c.data.slice(5).replace('-','/')}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:col}}>{fmt(c.importo)}</span>
                {c.pagato?<span style={{fontSize:10,color:DS.green,fontWeight:700,background:'#D1FAE5',borderRadius:20,padding:'1px 8px'}}>PAGATO</span>
                :<span style={{fontSize:10,color:DS.amber,fontWeight:700,background:'#FEF3C7',borderRadius:20,padding:'1px 8px'}}>DA PAGARE</span>}
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:11,color:a?.colore||DS.textMid,fontWeight:600,display:'flex',gap:4,alignItems:'center'}}>
                <Building2 size={10}/>{a?.nome}
              </div>
              <span style={{fontSize:11,color:col,fontWeight:700,background:col+'22',borderRadius:20,padding:'2px 8px'}}>{statoLabel[c.stato]}</span>
            </div>
          </div>
        );
      })}
      {comm.length===0&&<div style={{...card,textAlign:'center',color:DS.textMid,padding:32}}>Nessuna commessa trovata</div>}
    </div>
  );
}

// ─── ORDINI ───────────────────────────────────────────────────────────────────
function MieiOrdini(){
  const statoCol:Record<string,string>={bozza:DS.textMid,confermato:DS.teal,in_arrivo:DS.amber,consegnato:DS.green};
  const statoLabel:Record<string,string>={bozza:'Bozza',confermato:'Confermato',in_arrivo:'In arrivo',consegnato:'Consegnato'};
  return(
    <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:10}}>
      {ORDINI_FL.map(o=>{
        const c=COMMESSE.find(x=>x.id===o.commessaId);
        const a=az(o.aziendaId);
        const col=statoCol[o.stato]||DS.textMid;
        return(
          <div key={o.id} style={{...card,borderLeft:`4px solid ${col}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{fontWeight:700,color:DS.text,fontSize:14}}>{o.desc}</div>
              <span style={{fontSize:10,color:col,fontWeight:700,background:col+'22',borderRadius:20,padding:'2px 8px'}}>{statoLabel[o.stato]}</span>
            </div>
            <div style={{fontSize:12,color:DS.textMid}}>qty {o.qty} · {o.data.slice(5).replace('-','/')}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
              <div style={{fontSize:11,color:a?.colore,fontWeight:600,display:'flex',gap:4,alignItems:'center'}}>
                <Building2 size={10}/>{a?.nome}
              </div>
              <div style={{fontSize:11,color:DS.textMid}}>{c?.id} — {c?.cliente}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CONTABILIT├Ç ──────────────────────────────────────────────────────────────
function Contabilita(){
  const [tab,setTab]=useState<'movimenti'|'riepilogo'>('riepilogo');
  const entrate=MOVIMENTI.filter(m=>m.tipo==='entrata').reduce((a,m)=>a+m.importo,0);
  const uscite=MOVIMENTI.filter(m=>m.tipo==='uscita').reduce((a,m)=>a+m.importo,0);
  const netto=entrate-uscite;
  const daFatturare=COMMESSE.filter(c=>c.stato==='completato'&&!c.pagato).reduce((a,c)=>a+c.importo,0);

  return(
    <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
      {/* Tab */}
      <div style={{background:DS.topbar,display:'flex',padding:'0 8px',flexShrink:0}}>
        {(['riepilogo','movimenti'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{background:'none',border:'none',color:tab===t?DS.teal:'#8BBCBC',fontFamily:DS.ui,fontWeight:tab===t?700:400,fontSize:13,padding:'11px 16px',cursor:'pointer',borderBottom:tab===t?`2px solid ${DS.teal}`:'2px solid transparent'}}>
            {t==='riepilogo'?'RIEPILOGO':'MOVIMENTI'}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12}}>
        {tab==='riepilogo'&&<>
          {/* KPI grandi */}
          {[
            {label:'Entrate totali',val:entrate,col:DS.green,icon:<ArrowUp size={16}/>},
            {label:'Uscite totali',val:uscite,col:DS.red,icon:<ArrowDown size={16}/>},
            {label:'Netto',val:netto,col:netto>=0?DS.green:DS.red,icon:<TrendingUp size={16}/>},
            {label:'Da fatturare',val:daFatturare,col:DS.amber,icon:<FileText size={16}/>},
          ].map((k,i)=>(
            <div key={i} style={{...card,display:'flex',alignItems:'center',gap:14,border:`1.5px solid ${k.col}33`}}>
              <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${k.col}22,${k.col}11)`,display:'flex',alignItems:'center',justifyContent:'center',color:k.col,flexShrink:0}}>
                {k.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:DS.textMid}}>{k.label}</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:22,color:k.col}}>{fmt(k.val)}</div>
              </div>
            </div>
          ))}
          {/* Per azienda */}
          <div style={{fontSize:11,color:DS.textMid,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginTop:4}}>Per azienda</div>
          {AZIENDE.map(a=>{
            const comm=COMMESSE.filter(c=>c.aziendaId===a.id);
            const incassato=comm.filter(c=>c.pagato).reduce((x,c)=>x+c.importo,0);
            const daInc=comm.filter(c=>c.stato==='completato'&&!c.pagato).reduce((x,c)=>x+c.importo,0);
            return(
              <div key={a.id} style={{...card,borderLeft:`4px solid ${a.colore}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{fontWeight:700,color:DS.text}}>{a.nome}</div>
                  <span style={{fontFamily:DS.mono,fontWeight:700,color:DS.green,fontSize:14}}>{fmt(incassato)}</span>
                </div>
                {daInc>0&&<div style={{fontSize:12,color:DS.amber}}>Da incassare: {fmt(daInc)}</div>}
                <div style={{fontSize:11,color:DS.textMid,marginTop:4}}>{comm.length} commesse · {comm.filter(c=>c.pagato).length} pagate</div>
              </div>
            );
          })}
        </>}
        {tab==='movimenti'&&MOVIMENTI.sort((a,b)=>b.data.localeCompare(a.data)).map(m=>{
          const a=az(m.aziendaId);
          const isE=m.tipo==='entrata';
          return(
            <div key={m.id} style={{...card,display:'flex',gap:12,alignItems:'center'}}>
              <div style={{width:36,height:36,borderRadius:10,background:isE?'#D1FAE5':'#FEE2E2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {isE?<ArrowUp size={16} color={DS.green}/>:<ArrowDown size={16} color={DS.red}/>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:DS.text,fontSize:13}}>{m.desc}</div>
                <div style={{fontSize:11,color:DS.textMid,marginTop:2}}>{m.data.slice(5).replace('-','/')}{a?` · ${a.nome}`:''}</div>
              </div>
              <span style={{fontFamily:DS.mono,fontWeight:700,color:isE?DS.green:DS.red,fontSize:15}}>{isE?'+':'-'}{fmt(m.importo)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── IMPOSTAZIONI ─────────────────────────────────────────────────────────────
function ImpostazioniFreelance({onCambiaTipo}:{onCambiaTipo:()=>void}){
  return(
    <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12}}>
      <div style={{...card,background:DS.topbar,padding:'14px 16px'}}>
        <div style={{color:'#fff',fontWeight:800,fontSize:16}}>Marco Vito</div>
        <div style={{color:DS.teal,fontSize:12,marginTop:2}}>Montatore Freelance</div>
        <div style={{color:'rgba(139,188,188,0.5)',fontSize:11,marginTop:4}}>P.IVA: 01234567890</div>
      </div>
      {[
        {label:'Le mie aziende',desc:'Gestisci aziende collegate',icon:<Building2 size={16} color={DS.teal}/>},
        {label:'Tariffe orarie',desc:'Imposta le tue tariffe per tipo di lavoro',icon:<Euro size={16} color={DS.green}/>},
        {label:'Notifiche',desc:'Nuovi lavori, pagamenti, scadenze',icon:<Bell size={16} color={DS.amber}/>},
        {label:'Cambio modalita',desc:'Passa a modalita dipendente',icon:<Settings size={16} color={DS.textMid}/>},
      ].map((s,i)=>(
        <button key={i} onClick={i===3?onCambiaTipo:undefined}
          style={{...card,width:'100%',textAlign:'left',cursor:'pointer',display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:40,height:40,borderRadius:10,background:DS.tealLight,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {s.icon}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:DS.text,fontSize:14}}>{s.label}</div>
            <div style={{fontSize:12,color:DS.textMid,marginTop:2}}>{s.desc}</div>
          </div>
          <ChevronRight size={16} color={DS.textLight}/>
        </button>
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

// ─── MERCATO LAVORI ──────────────────────────────────────────────────────────
function MercatoLavori() {
  const [sel, setSel] = useState<string|null>(null);
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [importo, setImporto] = useState('');
  const [nota, setNota] = useState('');
  const [inviata, setInviata] = useState<string|null>(null);

  const lavSel = LAVORI_DISP.find(l=>l.id===sel);
  const offertaSel = offerte.find(o=>o.lavId===sel);
  const azienda = (id:string) => AZIENDE.find(a=>a.id===id);

  const inviaOfferta = () => {
    if (!importo || !sel) return;
    const nuova: Offerta = {
      id: 'OFF-'+Date.now(), lavId:sel,
      importo, nota, stato:'inviata', data: new Date().toLocaleDateString('it-IT'),
    };
    setOfferte(prev=>[...prev.filter(o=>o.lavId!==sel), nuova]);
    setInviata(sel);
    setTimeout(()=>setInviata(null), 2000);
    setImporto(''); setNota(''); setSel(null);
  };

  if (sel && lavSel) {
    const az = azienda(lavSel.aziendaId);
    return (
      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
        <button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:DS.teal,fontWeight:700,fontSize:13,fontFamily:DS.ui,padding:0,marginBottom:4}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Indietro
        </button>
        <div style={{...card}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:16,color:DS.text}}>{lavSel.titolo}</div>
            {lavSel.urgente&&<span style={{background:DS.red,color:'#fff',borderRadius:20,padding:'2px 10px',fontSize:10,fontWeight:700}}>URGENTE</span>}
          </div>
          <div style={{color:DS.textMid,fontSize:13,marginBottom:4}}>{lavSel.cliente}</div>
          <div style={{display:'flex',gap:12,fontSize:12,color:DS.textLight,marginBottom:12}}>
            <span>📅 {lavSel.data.slice(5).replace('-','/')}</span>
            <span>🕐 {lavSel.ore}h</span>
            <span>🪟 {lavSel.vani} vani</span>
            <span>📍 {lavSel.zona}</span>
          </div>
          <div style={{background:DS.tealLight,borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,color:DS.textMid,fontWeight:600}}>Budget cliente</span>
            <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.teal}}>€{lavSel.budget}</span>
          </div>
          {az&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,padding:'8px 10px',background:'rgba(40,160,160,0.07)',borderRadius:8}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:az.colore,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{az.avatar}</div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:DS.text}}>{az.nome}</div>
              <div style={{fontSize:10,color:DS.textMid}}>{az.citta}</div>
            </div>
          </div>}
        </div>

        {offertaSel ? (
          <div style={{...card,borderColor:DS.green,background:'linear-gradient(145deg,#f0fff8,#e8f8f2)'}}>
            <div style={{fontWeight:700,color:DS.green,marginBottom:4}}>✓ Offerta inviata</div>
            <div style={{fontSize:13,color:DS.textMid}}>Il tuo prezzo: <strong style={{color:DS.text}}>€{offertaSel.importo}</strong></div>
            {offertaSel.nota&&<div style={{fontSize:12,color:DS.textMid,marginTop:4}}>{offertaSel.nota}</div>}
            <div style={{fontSize:11,color:DS.textLight,marginTop:6}}>Inviata il {offertaSel.data} — in attesa di risposta</div>
          </div>
        ) : (
          <div style={{...card}}>
            <div style={{fontWeight:700,color:DS.text,fontSize:15,marginBottom:12}}>La tua offerta</div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:12,color:DS.textMid,marginBottom:6,fontWeight:600}}>Il mio prezzo (€)</div>
              <input value={importo} onChange={e=>setImporto(e.target.value)} type="number"
                placeholder="es. 350"
                style={{width:'100%',padding:'12px 14px',borderRadius:10,border:`1.5px solid ${DS.border}`,fontFamily:DS.mono,fontSize:16,fontWeight:700,color:DS.text,outline:'none',boxSizing:'border-box'}}/>
              {importo&&Number(importo)<lavSel.budget&&<div style={{fontSize:11,color:DS.green,marginTop:4}}>Sotto il budget — buone chance</div>}
              {importo&&Number(importo)>lavSel.budget&&<div style={{fontSize:11,color:DS.amber,marginTop:4}}>Sopra il budget — motiva il prezzo</div>}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:DS.textMid,marginBottom:6,fontWeight:600}}>Note (opzionale)</div>
              <textarea value={nota} onChange={e=>setNota(e.target.value)}
                placeholder="es. Disponibile anche sabato mattina..."
                rows={2}
                style={{width:'100%',padding:'10px 14px',borderRadius:10,border:`1.5px solid ${DS.border}`,fontFamily:DS.ui,fontSize:13,color:DS.text,outline:'none',resize:'none',boxSizing:'border-box'}}/>
            </div>
            <button onClick={inviaOfferta} disabled={!importo}
              style={{...bp(importo?DS.teal:DS.tealLight, importo?DS.tealDark:DS.border),width:'100%',justifyContent:'center',opacity:importo?1:0.6}}>
              Invia offerta
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{fontWeight:700,color:DS.text,fontSize:15,marginBottom:4}}>Lavori disponibili</div>
      <div style={{fontSize:12,color:DS.textMid,marginBottom:8}}>Valuta e fai la tua offerta</div>
      {LAVORI_DISP.map(lav=>{
        const az = azienda(lav.aziendaId);
        const off = offerte.find(o=>o.lavId===lav.id);
        return(
          <button key={lav.id} onClick={()=>setSel(lav.id)}
            style={{...card,textAlign:'left',cursor:'pointer',width:'100%',border:`1.5px solid ${lav.urgente?DS.red:DS.border}`,padding:14,
              boxShadow:lav.urgente?`0 2px 8px rgba(220,68,68,0.15)`:'0 2px 8px rgba(40,160,160,.08)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{fontWeight:700,color:DS.text,fontSize:14,flex:1,paddingRight:8}}>{lav.titolo}</div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                {lav.urgente&&<span style={{background:DS.red,color:'#fff',borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700,whiteSpace:'nowrap'}}>URGENTE</span>}
                <span style={{fontFamily:DS.mono,fontWeight:800,color:DS.teal,fontSize:15}}>€{lav.budget}</span>
              </div>
            </div>
            <div style={{fontSize:12,color:DS.textMid,marginBottom:6}}>{lav.cliente} · {lav.data.slice(5).replace('-','/')}</div>
            <div style={{display:'flex',gap:10,fontSize:11,color:DS.textLight}}>
              <span>🪟 {lav.vani} vani</span>
              <span>🕐 {lav.ore}h</span>
              <span>📍 {lav.zona}</span>
            </div>
            {off&&<div style={{marginTop:8,padding:'5px 10px',background:DS.tealLight,borderRadius:8,fontSize:11,color:DS.teal,fontWeight:600}}>✓ Offerta inviata — €{off.importo}</div>}
            {az&&<div style={{marginTop:8,fontSize:11,color:DS.textLight}}>da {az.nome}</div>}
          </button>
        );
      })}
    </div>
  );
}

const NAV_FL = [
  {id:'home',label:'Home',icon:Home},
  {id:'lavori',label:'Lavori',icon:ClipboardList},
  {id:'ordini',label:'Ordini',icon:Package},
  {id:'contabilita',label:'Conti',icon:TrendingUp},
  {id:'mercato',label:'Mercato',icon:BarChart2},
  {id:'impostazioni',label:'Setup',icon:Settings},
];

interface Props { onCambiaTipo: () => void; }

export default function FreelanceApp({ onCambiaTipo }: Props) {
  const [view,setView]=useState<FView>('home');

  return(
    <div style={{...gridBg,minHeight:'100dvh',maxWidth:420,margin:'0 auto',display:'flex',flexDirection:'column',fontFamily:DS.ui}}>
      {/* Topbar */}
      <div style={{background:'linear-gradient(135deg,rgba(13,31,31,0.97),rgba(20,45,45,0.97))',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(40,160,160,0.2)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <svg width="30" height="30" viewBox="0 0 200 200" fill="none">
            <rect x="95" y="15" width="10" height="10" rx="2" fill="#2FA7A2"/>
            <rect x="130" y="25" width="10" height="10" rx="2" fill="#7ED957"/>
            <rect x="155" y="50" width="10" height="10" rx="2" fill="#F59E0B"/>
            <g transform="rotate(8 100 100)">
              <rect x="55" y="55" width="90" height="90" rx="22" fill="#2FA7A2"/>
              <path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
              <path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
            </g>
          </svg>
          <div>
            <span style={{color:'#F2F1EC',fontWeight:800,fontSize:16}}>fliwoX</span>
            <span style={{color:DS.teal,fontWeight:600,fontSize:12,marginLeft:6}}>Freelance</span>
          </div>
        </div>
        <div style={{background:'rgba(40,160,160,0.15)',border:'1px solid rgba(40,160,160,0.3)',borderRadius:20,padding:'4px 12px',fontSize:10,fontWeight:700,color:DS.teal}}>
          {AZIENDE.length} aziende
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {view==='home'&&<HomeFreelance onNav={setView}/>}
        {view==='lavori'&&<MieiLavori/>}
        {view==='ordini'&&<MieiOrdini/>}
        {view==='contabilita'&&<Contabilita/>}
        {view==='mercato'&&<MercatoLavori/>}
        {view==='impostazioni'&&<ImpostazioniFreelance onCambiaTipo={onCambiaTipo}/>}
      </div>

      {/* Bottom nav */}
      <div style={{background:DS.topbar,display:'flex',borderTop:'1px solid rgba(40,160,160,0.2)',flexShrink:0}}>
        {NAV_FL.map(item=>{
          const a=view===item.id;
          return(
            <button key={item.id} onClick={()=>setView(item.id as FView)}
              style={{flex:1,background:'none',border:'none',padding:'9px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,boxShadow:a?`inset 0 -3px 0 ${DS.teal}`:'none'}}>
              <item.icon size={20} color={a?DS.teal:'#8BBCBC'}/>
              <span style={{fontSize:9,color:a?DS.teal:'#8BBCBC'}}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
