'use client';
import React from 'react';

export default function MagazzinoDettaglio({artSel,movArt,C,pill,DS,setSelArt,setMovOpen,movOpen,newMov,setNewMov,eseguiMov,ordineOpen,setOrdineOpen,ordineArt,setOrdineArt}) {
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:DS.topbar,padding:'10px 16px',flexShrink:0}}>
        <button onClick={()=>{setSelArt('');setMovOpen('');}} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:DS.teal,fontWeight:700,fontSize:13,padding:0,marginBottom:10}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Magazzino
        </button>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:'#fff'}}>{artSel.nome}</div>
            <div style={{fontSize:11,color:DS.textLight,marginTop:2}}>{artSel.cat} · {artSel.fornitore}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:28,color:artSel.giacenza<=artSel.scorta_min?DS.red:DS.teal,lineHeight:1}}>{artSel.giacenza}</div>
            <div style={{fontSize:10,color:DS.textLight}}>{artSel.um} in stock</div>
          </div>
        </div>
        {artSel.giacenza<=artSel.scorta_min&&<div style={{marginTop:8,background:'rgba(220,68,68,0.15)',borderRadius:8,padding:'5px 10px',fontSize:11,color:DS.red,fontWeight:600}}>Sotto scorta minima ({artSel.scorta_min} {artSel.um})</div>}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
        {/* KPI */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[{l:'Giacenza',v:artSel.giacenza+' '+artSel.um,c:artSel.giacenza<=artSel.scorta_min?DS.red:DS.teal},{l:'Scorta min',v:artSel.scorta_min+' '+artSel.um,c:DS.textMid},{l:'Valore',v:'€'+((artSel.giacenza*artSel.valore_unitario).toFixed(0)),c:DS.green}].map(k=>(
            <div key={k.l} style={{...C,padding:10,textAlign:'center'}}>
              <div style={{fontSize:10,color:DS.textLight,fontWeight:600,marginBottom:4}}>{k.l}</div>
              <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:13,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Azioni rapide */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <button onClick={()=>setMovOpen('carico')} style={{background:DS.green,color:'#fff',border:'none',borderRadius:12,padding:'14px',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.greenDark,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Carico
          </button>
          <button onClick={()=>setMovOpen('scarico')} style={{background:DS.red,color:'#fff',border:'none',borderRadius:12,padding:'14px',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.redDark,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Scarico
          </button>
        </div>

        {/* Form movimento */}
        {movOpen&&(
          <div style={{...C,borderColor:movOpen==='carico'?DS.green:DS.red}}>
            <div style={{fontWeight:700,fontSize:13,color:movOpen==='carico'?DS.green:DS.red,marginBottom:10}}>{movOpen==='carico'?'+ Nuovo carico':'- Nuovo scarico'}</div>
            {[{k:'qty',p:'Quantita ('+artSel.um+')',t:'number'},{k:'data',p:'Data',t:'date'},{k:'note',p:'Note (opzionale)',t:'text'}].map(f=>(
              <input key={f.k} value={newMov[f.k]||''} onChange={e=>setNewMov((p)=>({...p,[f.k]:e.target.value}))} type={f.t} placeholder={f.p}
                style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:8,fontFamily:f.t==='number'?DS.mono:DS.ui}}/>
            ))}
            <select value={newMov.causale||''} onChange={e=>setNewMov((p)=>({...p,causale:e.target.value}))} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:13,outline:'none',background:'#fff',marginBottom:10}}>
              <option value="">Causale...</option>
              {(movOpen==='carico'?['acquisto','reso','inventario','donazione']:['commessa','uso_interno','scarto','inventario']).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setMovOpen('');setNewMov({});}} style={{flex:1,background:DS.tealLight,color:DS.textMid,border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer'}}>Annulla</button>
              <button onClick={eseguiMov} disabled={!newMov.qty} style={{flex:2,background:movOpen==='carico'?DS.green:DS.red,color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:newMov.qty?'pointer':'default',opacity:newMov.qty?1:0.5}}>Conferma</button>
            </div>
          </div>
        )}

        {/* Ordine rapido */}
        <button onClick={()=>{setOrdineOpen(true);setOrdineArt(artSel);}} style={{...C,display:'flex',alignItems:'center',gap:10,cursor:'pointer',border:'1.5px solid '+DS.border,padding:'12px 14px',width:'100%',textAlign:'left'}}>
          <div style={{width:36,height:36,borderRadius:8,background:'rgba(26,158,115,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13,color:DS.text}}>Ordine rapido fornitore</div>
            <div style={{fontSize:11,color:DS.textMid}}>Apre WhatsApp con messaggio pre-compilato</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.textLight} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Storico movimenti */}
        <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Storico movimenti</div>
        {movArt.length===0&&<div style={{...C,textAlign:'center',color:DS.textLight,fontSize:13,padding:20}}>Nessun movimento</div>}
        {movArt.map((m)=>(
          <div key={m.id} style={{...C,padding:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:15,color:m.tipo==='carico'?DS.green:DS.red}}>{m.tipo==='carico'?'+':'-'}{m.qty} {artSel.um}</span>
                {pill(m.tipo==='carico'?'rgba(26,158,115,0.1)':'rgba(220,68,68,0.1)',m.tipo==='carico'?DS.green:DS.red,m.tipo.toUpperCase())}
              </div>
              <span style={{fontSize:11,color:DS.textLight}}>{m.data?.slice(5).replace('-','/')}</span>
            </div>
            {m.causale&&<div style={{fontSize:11,color:DS.textMid,marginTop:3}}>{m.causale}{m.note?' · '+m.note:''}</div>}
          </div>
        ))}
      </div>

      {/* Modal ordine rapido */}
      {ordineOpen&&ordineArt&&(
        <div onClick={()=>setOrdineOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:600,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:480,margin:'0 auto'}}>
            <div style={{width:40,height:4,borderRadius:2,background:DS.border,margin:'0 auto 16px'}}/>
            <div style={{fontWeight:800,fontSize:16,color:DS.text,marginBottom:4}}>Ordine rapido</div>
            <div style={{fontSize:13,color:DS.textMid,marginBottom:16}}>{ordineArt.nome} · Fornitore: {ordineArt.fornitore}</div>
            <div style={{...C,marginBottom:16}}>
              <div style={{fontSize:12,color:DS.textMid,marginBottom:4}}>Messaggio WhatsApp pre-compilato:</div>
              <div style={{fontSize:13,color:DS.text,lineHeight:1.6,background:DS.tealLight,padding:'10px 12px',borderRadius:8}}>
                Buongiorno, sono Marco Vito — serramentista freelance. Vorrei ordinare: <strong>{ordineArt.nome}</strong>. Quantita: ___. Disponibilita e prezzo? Grazie.
              </div>
            </div>
            <a href={'https://wa.me/?text='+encodeURIComponent('Buongiorno, sono Marco Vito. Vorrei ordinare '+ordineArt.nome+'. Quantita: ___. Disponibilita e prezzo? Grazie.')}
              target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#25D366',color:'#fff',borderRadius:12,padding:'14px',fontWeight:700,fontSize:15,textDecoration:'none',boxShadow:'0 4px 0 0 #1da851'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.94 0C5.341 0 0 5.341 0 11.94c0 2.09.548 4.048 1.506 5.747L.057 24l6.456-1.426A11.905 11.905 0 0011.94 23.88C18.539 23.88 24 18.54 24 11.94 24 5.341 18.539 0 11.94 0zm0 21.786a9.805 9.805 0 01-5.031-1.382l-.36-.214-3.733.824.845-3.647-.235-.374a9.823 9.823 0 01-1.505-5.253c0-5.424 4.413-9.837 9.837-9.837 5.424 0 9.837 4.413 9.837 9.837 0 5.424-4.413 9.846-9.855 9.846z"/></svg>
              Apri WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
