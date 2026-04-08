// ContabilitaFreelance.tsx — Contabilità WOW per freelance
'use client';
// @ts-nocheck
import React, { useState } from 'react';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

// Dati mock — in prod da Supabase
const FATTURE_INIT = [
  {id:'FA-001',commessa:'Villa Colombo',azienda:'Walter Cozza',tipo:'acconto',importo:900,data:'2026-04-02',stato:'pagata',scadenza:'2026-04-02'},
  {id:'FA-002',commessa:'Ristrutturazione uffici',azienda:'Infissi Sud',tipo:'saldo',importo:2400,data:'2026-03-28',stato:'pagata',scadenza:'2026-03-28'},
  {id:'FA-003',commessa:'Villa Colombo',azienda:'Walter Cozza',tipo:'saldo',importo:900,data:'2026-04-30',stato:'da_emettere',scadenza:'2026-05-15'},
  {id:'FA-004',commessa:'Finestre condominio',azienda:'Serramenti Greco',tipo:'saldo',importo:3100,data:'2026-04-20',stato:'da_emettere',scadenza:'2026-05-20'},
  {id:'FA-005',commessa:'Porta balcone Martini',azienda:'Walter Cozza',tipo:'unica',importo:200,data:'2026-04-10',stato:'emessa',scadenza:'2026-04-25'},
];
const SPESE_INIT = [
  {id:'SP-01',desc:'Gasolio furgone',importo:85,cat:'carburante',data:'2026-04-07',ricorrente:false},
  {id:'SP-02',desc:'Pranzo cantiere',importo:12.50,cat:'vitto',data:'2026-04-07',ricorrente:false},
  {id:'SP-03',desc:'Silicone + schiuma',importo:38,cat:'materiale',data:'2026-04-05',ricorrente:false},
  {id:'SP-04',desc:'Pedaggio A14',importo:8.40,cat:'pedaggio',data:'2026-04-07',ricorrente:false},
  {id:'SP-05',desc:'Assicurazione furgone',importo:120,cat:'assicurazione',data:'2026-04-01',ricorrente:true},
  {id:'SP-06',desc:'Leasing Hilti',importo:180,cat:'leasing',data:'2026-04-01',ricorrente:true},
  {id:'SP-07',desc:'Commercialista',importo:150,cat:'professionale',data:'2026-04-01',ricorrente:true},
];
const SCADENZE_INIT = [
  {id:'SC-01',desc:'F24 INPS artigiani',importo:850,scadenza:'2026-05-16',stato:'da_pagare',tipo:'tasse',auto:true},
  {id:'SC-02',desc:'Fitto magazzino',importo:200,scadenza:'2026-05-01',stato:'da_pagare',tipo:'affitto',auto:false},
  {id:'SC-03',desc:'IVA trimestrale Q1',importo:1240,scadenza:'2026-05-16',stato:'da_pagare',tipo:'tasse',auto:true},
  {id:'SC-04',desc:'Rata leasing furgone',importo:380,scadenza:'2026-05-05',stato:'da_pagare',tipo:'leasing',auto:false},
  {id:'SC-05',desc:'INAIL premio',importo:420,scadenza:'2026-06-16',stato:'da_pagare',tipo:'tasse',auto:true},
  {id:'SC-06',desc:'Diritto annuale CCIAA',importo:120,scadenza:'2026-06-30',stato:'da_pagare',tipo:'tasse',auto:true},
  {id:'SC-07',desc:'IVA trimestrale Q2',importo:0,scadenza:'2026-08-20',stato:'da_pagare',tipo:'tasse',auto:true},
  {id:'SC-08',desc:'F24 INPS artigiani Q3',importo:850,scadenza:'2026-08-16',stato:'da_pagare',tipo:'tasse',auto:true},
  {id:'SC-09',desc:'Acconto IRPEF',importo:0,scadenza:'2026-11-30',stato:'da_pagare',tipo:'tasse',auto:true},
];
const MEZZI_INIT = [
  {id:'MZ-01',nome:'Fiat Ducato 2019',cat:'furgone',valore:18000,acquisto:'2022-03',targa:'FG 123 AB',km:87000,stato:'attivo',revisione:'2026-09-15',assicurazione:'2026-12-01'},
  {id:'MZ-02',nome:'Hilti TE 30-A36',cat:'utensile',valore:1200,acquisto:'2024-01',stato:'attivo'},
  {id:'MZ-03',nome:'Bosch GBH 18V-26',cat:'utensile',valore:450,acquisto:'2023-06',stato:'attivo'},
  {id:'MZ-04',nome:'Livella laser Bosch GLL 3-80',cat:'strumento',valore:380,acquisto:'2024-09',stato:'attivo'},
  {id:'MZ-05',nome:'Scala telescopica 4m',cat:'attrezzatura',valore:280,acquisto:'2023-01',stato:'attivo'},
];

const TABS = [{id:'home',l:'Home'},{id:'fatture',l:'Fatture'},{id:'spese',l:'Spese'},{id:'mezzi',l:'Mezzi'},{id:'scadenze',l:'Scadenze'}];
const C = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid '+DS.border,boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};
const pill = (bg:any,col:any,txt:any) => <span style={{background:bg,color:col,borderRadius:20,padding:'2px 9px',fontSize:10,fontWeight:700}}>{txt}</span>;

export default function ContabilitaFreelance() {
  const [tab, setTab] = useState('home');
  const [fatture, setFatture] = useState(FATTURE_INIT);
  const [spese, setSpese] = useState(SPESE_INIT);
  const [scadenze, setScadenze] = useState(SCADENZE_INIT);
  const [mezzi] = useState(MEZZI_INIT);
  const [periodo, setPeriodo] = useState('mese');
  const [addSpesa, setAddSpesa] = useState(false);
  const [newSpesa, setNewSpesa] = useState<any>({});
  const [showExport, setShowExport] = useState(false);

  // Calcoli
  const incassato = fatture.filter(f=>f.stato==='pagata').reduce((s:any,f:any)=>s+f.importo,0);
  const daIncassare = fatture.filter(f=>f.stato!=='pagata').reduce((s:any,f:any)=>s+f.importo,0);
  const totSpese = spese.reduce((s:any,x:any)=>s+x.importo,0);
  const speseRic = spese.filter(s=>s.ricorrente).reduce((s:any,x:any)=>s+x.importo,0);
  const speseVar = totSpese - speseRic;
  const margine = incassato - totSpese;
  const scadDaPagare = scadenze.filter(s=>s.stato==='da_pagare');
  const totScad = scadDaPagare.reduce((s:any,x:any)=>s+x.importo,0);
  const patrimonio = mezzi.reduce((s:any,m:any)=>s+m.valore,0);
  const fmt = (n:any) => n.toLocaleString('it-IT');
  const ivaStimata = Math.round(incassato * 0.22);
  const inpsStimata = Math.round(incassato * 0.26);
  const nettoStimato = incassato - totSpese - ivaStimata - inpsStimata;

  // ─── HOME ──────────────────────────────────────────────────
  const renderHome = () => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {/* Cashflow veloce */}
      <div style={{...C,padding:16,background:'linear-gradient(135deg,#0D1F1F,#1a3535)',border:'none'}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Il tuo mese</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.6)'}}>Netto stimato</div>
            <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:28,color:nettoStimato>=0?DS.green:DS.red}}>EUR {fmt(nettoStimato)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>dopo IVA + INPS</div>
            <div style={{fontFamily:DS.mono,fontSize:12,color:'rgba(255,255,255,0.4)'}}>IVA ~EUR {fmt(ivaStimata)} · INPS ~EUR {fmt(inpsStimata)}</div>
          </div>
        </div>
      </div>

      {/* 4 KPI */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={{...C,background:'linear-gradient(135deg,#1A9E73,#0F7A56)',border:'none',padding:12}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.7)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Incassato</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:22,color:'#fff'}}>EUR {fmt(incassato)}</div>
        </div>
        <div style={{...C,background:'linear-gradient(135deg,'+DS.teal+','+DS.tealDark+')',border:'none',padding:12}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.7)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Da incassare</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:22,color:'#fff'}}>EUR {fmt(daIncassare)}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>{fatture.filter(f=>f.stato!=='pagata').length} fatture aperte</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={{...C,padding:10,textAlign:'center'}}>
          <div style={{fontSize:9,color:DS.textLight,fontWeight:700,textTransform:'uppercase'}}>Spese</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.red}}>EUR {fmt(totSpese)}</div>
          <div style={{fontSize:10,color:DS.textLight}}>fisse EUR {fmt(speseRic)} · var EUR {fmt(speseVar)}</div>
        </div>
        <div style={{...C,padding:10,textAlign:'center'}}>
          <div style={{fontSize:9,color:DS.textLight,fontWeight:700,textTransform:'uppercase'}}>Margine lordo</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:margine>=0?DS.green:DS.red}}>EUR {fmt(margine)}</div>
        </div>
      </div>

      {/* Alert scadenze */}
      {scadDaPagare.length>0&&(
        <div style={{...C,borderColor:'rgba(220,68,68,0.2)',background:'rgba(220,68,68,0.03)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13,color:DS.red}}>Prossime scadenze</div>
            <span style={{fontFamily:DS.mono,fontWeight:800,color:DS.red}}>EUR {fmt(totScad)}</span>
          </div>
          {scadDaPagare.slice(0,3).map(s=>(
            <div key={s.id} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(220,68,68,0.08)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:DS.text}}>{s.desc}</div>
                <div style={{fontSize:10,color:DS.textMid}}>{s.scadenza}</div>
              </div>
              <span style={{fontFamily:DS.mono,fontWeight:700,color:DS.red}}>EUR {fmt(s.importo)}</span>
            </div>
          ))}
          <button onClick={()=>setTab('scadenze')} style={{marginTop:8,width:'100%',background:DS.red,color:'#fff',border:'none',borderRadius:10,padding:10,fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.redDark}}>
            Vedi tutte le scadenze
          </button>
        </div>
      )}

      {/* Tasse stimate */}
      <div style={{...C,borderColor:'rgba(40,160,160,0.2)'}}>
        <div style={{fontWeight:700,fontSize:13,color:DS.text,marginBottom:8}}>Previsione tasse</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          <div style={{padding:8,background:'rgba(220,68,68,0.05)',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:DS.textLight}}>IVA stimata (22%)</div>
            <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:14,color:DS.red}}>EUR {fmt(ivaStimata)}</div>
          </div>
          <div style={{padding:8,background:'rgba(220,68,68,0.05)',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:DS.textLight}}>INPS stimati (26%)</div>
            <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:14,color:DS.red}}>EUR {fmt(inpsStimata)}</div>
          </div>
        </div>
        <div style={{marginTop:8,padding:8,background:'rgba(26,158,115,0.05)',borderRadius:8,textAlign:'center'}}>
          <div style={{fontSize:10,color:DS.textLight}}>Netto stimato in tasca</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:nettoStimato>=0?DS.green:DS.red}}>EUR {fmt(nettoStimato)}</div>
        </div>
        <div style={{fontSize:10,color:DS.textLight,marginTop:6,textAlign:'center'}}>Stime su incassato. Consulta il tuo commercialista per i dati esatti.</div>
      </div>

      {/* Export */}
      <button onClick={()=>setShowExport(true)} style={{...C,display:'flex',alignItems:'center',gap:10,cursor:'pointer',width:'100%',textAlign:'left',border:'1.5px solid '+DS.border}}>
        <div style={{width:36,height:36,borderRadius:8,background:DS.tealLight,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:DS.text}}>Esporta per commercialista</div>
          <div style={{fontSize:11,color:DS.textMid}}>PDF riepilogo mensile con fatture e spese</div>
        </div>
      </button>
    </div>
  );

  // ─── FATTURE ───────────────────────────────────────────────
  const renderFatture = () => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
        {[{l:'Pagate',v:fatture.filter(f=>f.stato==='pagata').length,c:DS.green},{l:'Emesse',v:fatture.filter(f=>f.stato==='emessa').length,c:DS.amber},{l:'Da emettere',v:fatture.filter(f=>f.stato==='da_emettere').length,c:DS.red}].map(k=>(
          <div key={k.l} style={{...C,padding:8,textAlign:'center'}}>
            <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:20,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:DS.textLight,fontWeight:600}}>{k.l}</div>
          </div>
        ))}
      </div>
      <button style={{background:DS.green,color:'#fff',border:'none',borderRadius:12,padding:'12px',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.greenDark,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuova fattura
      </button>
      {fatture.map(f=>(
        <div key={f.id} style={{...C,border:'1.5px solid '+(f.stato==='pagata'?'rgba(26,158,115,0.15)':f.stato==='emessa'?'rgba(208,128,8,0.15)':DS.border)}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.text}}>{f.commessa}</div>
              <div style={{fontSize:11,color:DS.textMid}}>{f.azienda} · {f.tipo} · {f.data}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:f.stato==='pagata'?DS.green:f.stato==='emessa'?DS.amber:DS.teal}}>EUR {fmt(f.importo)}</div>
              {pill(f.stato==='pagata'?'rgba(26,158,115,0.1)':f.stato==='emessa'?'rgba(208,128,8,0.1)':'rgba(40,160,160,0.1)',f.stato==='pagata'?DS.green:f.stato==='emessa'?DS.amber:DS.teal,f.stato==='pagata'?'PAGATA':f.stato==='emessa'?'EMESSA':'DA EMETTERE')}
            </div>
          </div>
          {f.stato!=='pagata'&&(
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {f.stato==='da_emettere'&&<button onClick={()=>setFatture(p=>p.map(x=>x.id===f.id?{...x,stato:'emessa'}:x))} style={{flex:1,background:DS.amber,color:'#fff',border:'none',borderRadius:8,padding:'8px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 #A06005'}}>Emetti</button>}
              {f.stato==='emessa'&&<button onClick={()=>setFatture(p=>p.map(x=>x.id===f.id?{...x,stato:'pagata'}:x))} style={{flex:1,background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'8px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.greenDark}}>Segna pagata</button>}
              <button style={{padding:'8px 12px',background:DS.tealLight,border:'none',borderRadius:8,cursor:'pointer'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ─── SPESE ─────────────────────────────────────────────────
  const categorie = ['carburante','materiale','vitto','pedaggio','assicurazione','leasing','professionale','altro'];
  const catColors:any = {carburante:'#3B7FE0',materiale:DS.teal,vitto:DS.amber,pedaggio:'#8B5CF6',assicurazione:DS.red,leasing:'#6366F1',professionale:'#0EA5E9',altro:DS.textMid};
  const renderSpese = () => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
        {[{l:'Totale',v:totSpese,c:DS.red},{l:'Fisse',v:speseRic,c:DS.amber},{l:'Variabili',v:speseVar,c:DS.teal}].map(k=>(
          <div key={k.l} style={{...C,padding:8,textAlign:'center'}}>
            <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:k.c}}>EUR {fmt(k.v)}</div>
            <div style={{fontSize:9,color:DS.textLight,fontWeight:600}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Barra categorie */}
      <div style={{...C,padding:10}}>
        <div style={{display:'flex',height:8,borderRadius:4,overflow:'hidden',marginBottom:8}}>
          {categorie.map(cat=>{
            const tot = spese.filter(s=>s.cat===cat).reduce((s:any,x:any)=>s+x.importo,0);
            if(!tot) return null;
            return <div key={cat} style={{width:(tot/totSpese*100)+'%',background:catColors[cat]||DS.textMid,minWidth:2}}/>;
          })}
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {categorie.map(cat=>{
            const tot = spese.filter(s=>s.cat===cat).reduce((s:any,x:any)=>s+x.importo,0);
            if(!tot) return null;
            return <span key={cat} style={{fontSize:10,color:catColors[cat]||DS.textMid,fontWeight:600}}>{cat} EUR {fmt(tot)}</span>;
          })}
        </div>
      </div>

      <button onClick={()=>setAddSpesa(true)} style={{background:DS.teal,color:'#fff',border:'none',borderRadius:12,padding:'12px',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.tealDark,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Aggiungi spesa
      </button>

      {addSpesa&&(
        <div style={C}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Nuova spesa</div>
          <input value={newSpesa.desc||''} onChange={e=>setNewSpesa((p:any)=>({...p,desc:e.target.value}))} placeholder="Descrizione" style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:8}}/>
          <input value={newSpesa.importo||''} onChange={e=>setNewSpesa((p:any)=>({...p,importo:e.target.value}))} type="number" placeholder="Importo EUR" style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:8,fontFamily:DS.mono}}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
            {categorie.map(cat=>(
              <button key={cat} onClick={()=>setNewSpesa((p:any)=>({...p,cat}))} style={{padding:'6px 10px',borderRadius:16,border:'1.5px solid '+(newSpesa.cat===cat?catColors[cat]:DS.border),background:newSpesa.cat===cat?catColors[cat]+'15':'#fff',color:newSpesa.cat===cat?catColors[cat]:DS.textMid,fontSize:11,fontWeight:600,cursor:'pointer'}}>{cat}</button>
            ))}
          </div>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:DS.textMid,marginBottom:10,cursor:'pointer'}}>
            <input type="checkbox" checked={newSpesa.ric||false} onChange={e=>setNewSpesa((p:any)=>({...p,ric:e.target.checked}))}/>
            Spesa ricorrente (mensile)
          </label>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{setAddSpesa(false);setNewSpesa({});}} style={{flex:1,background:DS.tealLight,color:DS.textMid,border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer'}}>Annulla</button>
            <button onClick={()=>{if(!newSpesa.desc||!newSpesa.importo)return;setSpese(p=>[{id:'SP-'+Date.now(),desc:newSpesa.desc,importo:Number(newSpesa.importo),cat:newSpesa.cat||'altro',data:new Date().toISOString().slice(0,10),ricorrente:!!newSpesa.ric},...p]);setAddSpesa(false);setNewSpesa({});}} style={{flex:2,background:DS.teal,color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.tealDark}}>Salva</button>
          </div>
        </div>
      )}

      {spese.map(s=>(
        <div key={s.id} style={{...C,padding:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{s.desc}</div>
            <div style={{fontSize:10,color:DS.textMid}}>{s.data} · {s.cat}{s.ricorrente?' · ricorrente':''}</div>
          </div>
          <span style={{fontFamily:DS.mono,fontWeight:700,fontSize:15,color:DS.red}}>EUR {fmt(s.importo)}</span>
        </div>
      ))}
    </div>
  );

  // ─── MEZZI ─────────────────────────────────────────────────
  const renderMezzi = () => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{...C,textAlign:'center',padding:12}}>
        <div style={{fontSize:9,color:DS.textLight,fontWeight:700,textTransform:'uppercase'}}>Patrimonio attrezzature</div>
        <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:24,color:DS.teal}}>EUR {fmt(patrimonio)}</div>
        <div style={{fontSize:10,color:DS.textMid}}>{mezzi.length} mezzi/attrezzature</div>
      </div>
      {mezzi.map(m=>(
        <div key={m.id} style={{...C,padding:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:DS.text}}>{m.nome}</div>
              <div style={{fontSize:11,color:DS.textMid}}>{m.cat} · {m.acquisto}</div>
              {m.targa&&<div style={{fontSize:11,color:DS.textMid}}>Targa: {m.targa} · {fmt(m.km)} km</div>}
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:DS.teal}}>EUR {fmt(m.valore)}</div>
              {pill('rgba(26,158,115,0.1)',DS.green,m.stato)}
            </div>
          </div>
          {(m.revisione||m.assicurazione)&&(
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {m.revisione&&<div style={{flex:1,padding:'5px 8px',background:'rgba(208,128,8,0.07)',borderRadius:8,fontSize:10,color:DS.amber,fontWeight:600}}>Rev: {m.revisione}</div>}
              {m.assicurazione&&<div style={{flex:1,padding:'5px 8px',background:'rgba(40,160,160,0.07)',borderRadius:8,fontSize:10,color:DS.teal,fontWeight:600}}>Ass: {m.assicurazione}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ─── SCADENZE ──────────────────────────────────────────────
  const renderScadenze = () => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={{...C,textAlign:'center',padding:10}}>
          <div style={{fontSize:9,color:DS.textLight,fontWeight:700,textTransform:'uppercase'}}>Da pagare</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:20,color:DS.red}}>EUR {fmt(totScad)}</div>
        </div>
        <div style={{...C,textAlign:'center',padding:10}}>
          <div style={{fontSize:9,color:DS.textLight,fontWeight:700,textTransform:'uppercase'}}>Scadenze</div>
          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:20,color:DS.amber}}>{scadDaPagare.length}</div>
        </div>
      </div>
      <button style={{background:DS.teal,color:'#fff',border:'none',borderRadius:12,padding:'12px',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.tealDark,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Aggiungi scadenza
      </button>
      {scadenze.sort((a,b)=>a.scadenza.localeCompare(b.scadenza)).map(s=>(
        <div key={s.id} style={{...C,border:'1.5px solid '+(s.stato==='pagato'?'rgba(26,158,115,0.15)':'rgba(220,68,68,0.15)'),padding:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{s.desc}</div>
              <div style={{fontSize:11,color:DS.textMid}}>{s.tipo} · Scadenza {s.scadenza}</div>
            </div>
            <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:s.stato==='pagato'?DS.green:DS.red}}>EUR {fmt(s.importo)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            {pill(s.stato==='pagato'?'rgba(26,158,115,0.1)':'rgba(220,68,68,0.1)',s.stato==='pagato'?DS.green:DS.red,s.stato==='pagato'?'PAGATO':'DA PAGARE')}
            {s.stato!=='pagato'&&<button onClick={()=>setScadenze(p=>p.map(x=>x.id===s.id?{...x,stato:'pagato'}:x))} style={{background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',fontWeight:700,fontSize:11,cursor:'pointer',boxShadow:'0 2px 0 0 '+DS.greenDark}}>Segna pagato</button>}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── EXPORT MODAL ──────────────────────────────────────────
  const renderExport = () => (
    <div onClick={()=>setShowExport(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:480,margin:'0 auto'}}>
        <div style={{width:40,height:4,borderRadius:2,background:DS.border,margin:'0 auto 16px'}}/>
        <div style={{fontWeight:800,fontSize:16,color:DS.text,marginBottom:16}}>Esporta per commercialista</div>
        {[{l:'Riepilogo mensile PDF',d:'Fatture + spese + margine',f:'pdf'},{l:'Fatture emesse CSV',d:'Per import in fattura elettronica',f:'csv'},{l:'Registro spese Excel',d:'Tutte le spese con categorie',f:'xlsx'}].map(e=>(
          <button key={e.f} style={{...C,display:'flex',alignItems:'center',gap:10,cursor:'pointer',width:'100%',textAlign:'left',marginBottom:8,border:'1.5px solid '+DS.border}}>
            <div style={{width:36,height:36,borderRadius:8,background:DS.tealLight,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:DS.text}}>{e.l}</div>
              <div style={{fontSize:11,color:DS.textMid}}>{e.d}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:DS.topbar,padding:'12px 16px 0',flexShrink:0}}>
        <div style={{color:'#fff',fontWeight:800,fontSize:15,marginBottom:10}}>Contabilita</div>
        <div style={{display:'flex',overflowX:'auto',gap:0}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,background:'none',border:'none',padding:'8px 14px',color:tab===t.id?DS.teal:'rgba(139,188,188,0.5)',fontWeight:tab===t.id?700:400,fontSize:13,cursor:'pointer',borderBottom:tab===t.id?'2px solid '+DS.teal:'2px solid transparent',fontFamily:DS.ui}}>
              {t.l}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
        {tab==='home'&&renderHome()}
        {tab==='fatture'&&renderFatture()}
        {tab==='spese'&&renderSpese()}
        {tab==='mezzi'&&renderMezzi()}
        {tab==='scadenze'&&renderScadenze()}
      </div>
      {showExport&&renderExport()}
    </div>
  );
}
