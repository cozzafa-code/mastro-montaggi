'use client';
import React from 'react';

const DS_LOCAL = {
  topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

export default function MagazzinoLista({articoli,movimenti,catalogo,vista,setVista,selArt,setSelArt,addOpen,setAddOpen,movOpen,setMovOpen,newMov,setNewMov,newArt,setNewArt,catSearch,setCatSearch,showCat,setShowCat,ordineOpen,setOrdineOpen,ordineArt,setOrdineArt,aiInput,setAiInput,aiLoading,aiItems,setAiItems,imgMagRef,imgMagB64,setImgMagB64,sottoScorta,valTotale,catFiltrato,bycat,eseguiMov,aggiungiDaCatalogo,estraiAI,salvaAI,C,pill,DS}) {
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header stats */}
      <div style={{background:DS.topbar,padding:'12px 16px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{color:'#fff',fontWeight:800,fontSize:15}}>Magazzino</div>
          <button onClick={()=>setAddOpen(v=>!v)} style={{background:DS.teal,color:'#fff',border:'none',borderRadius:10,padding:'7px 14px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.tealDark,display:'flex',alignItems:'center',gap:6}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Aggiungi
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[{l:'Articoli',v:String(articoli.length),c:DS.teal},{l:'Valore stock',v:'€'+valTotale.toFixed(0),c:DS.green},{l:'Sotto scorta',v:String(sottoScorta.length),c:sottoScorta.length>0?DS.red:DS.green}].map(k=>(
            <div key={k.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
              <div style={{fontSize:9,color:DS.textLight,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{k.l}</div>
              <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:15,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{background:DS.topbar,display:'flex',borderBottom:'1px solid rgba(40,160,160,0.2)',flexShrink:0}}>
        {[{id:'giacenza',l:'Giacenza'},{id:'movimenti',l:'Movimenti'},{id:'alert',l:'Alert'+(sottoScorta.length>0?' ('+sottoScorta.length+')':'')},{id:'ai',l:'+ AI'}].map(t=>(
          <button key={t.id} onClick={()=>setVista(t.id)} style={{flex:1,background:'none',border:'none',padding:'10px 4px',cursor:'pointer',color:vista===t.id?DS.teal:DS.textLight,fontSize:11,fontWeight:700,fontFamily:DS.ui,borderBottom:vista===t.id?'2px solid '+DS.teal:'2px solid transparent'}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>

        {/* Form aggiungi */}
        {addOpen&&(
          <div style={C}>
            <div style={{fontWeight:700,fontSize:13,color:DS.text,marginBottom:10}}>Aggiungi articolo</div>
            <div style={{fontSize:11,color:DS.teal,fontWeight:700,marginBottom:6}}>DAL CATALOGO GALASSIA</div>
            <input value={catSearch} onChange={e=>{setCatSearch(e.target.value);setShowCat(true);}} placeholder="Cerca nel catalogo (viti, silicone, nastro...)"
              style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:6}}/>
            {showCat&&catFiltrato.length>0&&(
              <div style={{border:'1.5px solid '+DS.border,borderRadius:8,overflow:'hidden',marginBottom:10,maxHeight:180,overflowY:'auto'}}>
                {catFiltrato.slice(0,8).map((c)=>(
                  <button key={c.id} onClick={()=>aggiungiDaCatalogo(c)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',padding:'10px 12px',background:'none',border:'none',borderBottom:'1px solid '+DS.border,cursor:'pointer',textAlign:'left'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{c.nome}</div>
                      <div style={{fontSize:10,color:DS.textMid}}>{c.fornitore} · {c.cat}</div>
                    </div>
                    <span style={{fontFamily:DS.mono,fontSize:12,color:DS.teal,fontWeight:700}}>€{c.valore_unitario}/{c.um}</span>
                  </button>
                ))}
              </div>
            )}
            <div style={{fontSize:11,color:DS.textMid,fontWeight:700,marginBottom:6,marginTop:4}}>OPPURE MANUALE</div>
            {[{k:'nome',p:'Nome articolo'},{k:'um',p:'Unita (pz, mt, kg...)'},{k:'giacenza',p:'Giacenza iniziale',t:'number'},{k:'scorta_min',p:'Scorta minima',t:'number'},{k:'valore_unitario',p:'Prezzo acquisto €',t:'number'},{k:'fornitore',p:'Fornitore'}].map(f=>(
              <input key={f.k} value={newArt[f.k]||''} onChange={e=>setNewArt((p)=>({...p,[f.k]:e.target.value}))} type={f.t||'text'} placeholder={f.p}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:12,outline:'none',boxSizing:'border-box',marginBottom:7,fontFamily:f.t==='number'?DS.mono:DS.ui}}/>
            ))}
            <select value={newArt.cat||'fissaggi'} onChange={e=>setNewArt((p)=>({...p,cat:e.target.value}))} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:12,outline:'none',background:'#fff',marginBottom:10}}>
              {['fissaggi','sigillanti','finiture','DPI','utensili','elettrico','altro'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setAddOpen(false);setNewArt({});setCatSearch('');setShowCat(false);}} style={{flex:1,background:DS.tealLight,color:DS.textMid,border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer'}}>Annulla</button>
              <button onClick={async()=>{
                if(!newArt.nome) return;
                const tmp='TMP-'+Date.now();
                const a={id:tmp,nome:newArt.nome,um:newArt.um||'pz',giacenza:Number(newArt.giacenza)||0,scorta_min:Number(newArt.scorta_min)||0,valore_unitario:Number(newArt.valore_unitario)||0,cat:newArt.cat||'altro',fornitore:newArt.fornitore||'—',note:''};
                setArticoli(p=>[...p,a]); setAddOpen(false); setNewArt({});
                const res=await sbPost('articoli_magazzino',{azienda_id:AZIENDA_ID,nome:a.nome,unita_misura:a.um,prezzo_acquisto:a.valore_unitario,scorta_attuale:a.giacenza,scorta_minima:a.scorta_min,categoria:a.cat,fornitore:a.fornitore});
                if(res?.[0]?.id) setArticoli(p=>p.map(x=>x.id===tmp?{...x,id:res[0].id}:x));
              }} style={{flex:2,background:DS.teal,color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.tealDark}}>
                Salva
              </button>
            </div>
          </div>
        )}

        {/* Alert sotto scorta */}
        {sottoScorta.length>0&&vista==='giacenza'&&(
          <div style={{background:'rgba(220,68,68,0.06)',border:'1.5px solid rgba(220,68,68,0.2)',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{fontSize:12,color:DS.red,fontWeight:600}}>{sottoScorta.length} {sottoScorta.length===1?'articolo sotto':'articoli sotto'} scorta minima</span>
            <button onClick={()=>setVista('alert')} style={{marginLeft:'auto',background:DS.red,color:'#fff',border:'none',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Vedi</button>
          </div>
        )}

        {/* Vista giacenza */}
        {vista==='giacenza'&&(
          Object.keys(bycat).length===0
            ? <div style={{...C,textAlign:'center',padding:32,color:DS.textLight,fontSize:13}}>Nessun articolo — aggiungi il primo</div>
            : Object.entries(bycat).map(([cat,items])=>(
              <div key={cat}>
                <div style={{fontSize:11,fontWeight:700,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5,marginBottom:6,marginTop:4,display:'flex',alignItems:'center',gap:6}}>
                  {cat}
                  <span style={{background:DS.tealLight,color:DS.teal,borderRadius:20,padding:'1px 7px',fontSize:9,fontWeight:700}}>{items.length}</span>
                </div>
                {items.map((a)=>(
                  <button key={a.id} onClick={()=>setSelArt(a.id)} style={{...C,textAlign:'left',cursor:'pointer',width:'100%',display:'block',marginBottom:6,border:'1.5px solid '+(a.giacenza<=a.scorta_min?DS.red:DS.border)}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{flex:1,paddingRight:8}}>
                        <div style={{fontWeight:600,fontSize:13,color:DS.text,marginBottom:3}}>{a.nome}</div>
                        <div style={{fontSize:11,color:DS.textMid}}>{a.fornitore} · €{a.valore_unitario}/{a.um}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:a.giacenza<=a.scorta_min?DS.red:DS.teal}}>{a.giacenza}</div>
                          <div style={{fontSize:9,color:DS.textLight}}>{a.um}</div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.border} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                    {a.giacenza<=a.scorta_min&&<div style={{marginTop:6,fontSize:10,color:DS.red,fontWeight:600}}>Scorta min: {a.scorta_min} {a.um}</div>}
                  </button>
                ))}
              </div>
            ))
        )}

        {/* Vista movimenti */}
        {vista==='movimenti'&&(
          movimenti.length===0
            ? <div style={{...C,textAlign:'center',padding:24,color:DS.textLight,fontSize:13}}>Nessun movimento</div>
            : movimenti.map((m)=>{
              const a=articoli.find(x=>x.id===m.articoloId);
              return (
                <div key={m.id} style={{...C,padding:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:14,color:m.tipo==='carico'?DS.green:DS.red}}>{m.tipo==='carico'?'+':'-'}{m.qty} {a?.um||''}</span>
                      {pill(m.tipo==='carico'?'rgba(26,158,115,0.1)':'rgba(220,68,68,0.1)',m.tipo==='carico'?DS.green:DS.red,m.tipo)}
                    </div>
                    <span style={{fontSize:11,color:DS.textLight}}>{m.data?.slice(5).replace('-','/')}</span>
                  </div>
                  <div style={{fontWeight:600,fontSize:12,color:DS.text}}>{a?.nome||'Articolo'}</div>
                  {m.causale&&<div style={{fontSize:11,color:DS.textMid,marginTop:2}}>{m.causale}</div>}
                </div>
              );
            })
        )}

        {/* Vista AI */}
        {vista==='ai'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <input ref={imgMagRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(!f) return;const r=new FileReader();r.onload=ev=>{setImgMagB64(String(ev.target?.result || chr(39)+chr(39)).split(',')[1]);};r.readAsDataURL(f);e.target.value='';}}/>
            <div style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'2px solid #28A0A0',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14}}>
              <div style={{fontWeight:800,fontSize:14,color:DS.text,marginBottom:4}}>Aggiungi articoli con AI</div>
              <div style={{fontSize:12,color:DS.textMid,marginBottom:10}}>Scrivi liberamente o carica foto del listino fornitore</div>
              {imgMagB64&&(<div style={{marginBottom:8,position:'relative'}}><img src={'data:image/jpeg;base64,'+imgMagB64} alt="" style={{width:'100%',maxHeight:120,objectFit:'cover',borderRadius:8}}/><button onClick={()=>setImgMagB64(null)} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.6)',border:'none',borderRadius:'50%',width:22,height:22,color:'#fff',cursor:'pointer',fontSize:14}}>x</button></div>)}
              <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Esempi: maniglia Hoppe cromo, viti 4.2x25, oppure incolla listino..." rows={4} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box',resize:'none',marginBottom:8}}/>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>imgMagRef.current?.click()} style={{flex:1,background:'#EEF8F8',color:'#28A0A0',border:'1.5px solid #C8E4E4',borderRadius:8,padding:'9px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Foto listino</button>
                <button onClick={estraiAI} disabled={aiLoading||(!aiInput.trim()&&!imgMagB64)} style={{flex:2,background:aiLoading||(!aiInput.trim()&&!imgMagB64)?'#C8E4E4':'#28A0A0',color:'#fff',border:'none',borderRadius:8,padding:'9px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:aiLoading||(!aiInput.trim()&&!imgMagB64)?'none':'0 3px 0 0 #156060'}}>
                  {aiLoading?'Analisi AI...':'Estrai articoli'}
                </button>
              </div>
            </div>
            {aiItems&&aiItems.length>0&&(
              <div style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14}}>
                <div style={{fontWeight:700,fontSize:13,color:DS.text,marginBottom:8}}>{aiItems.length} articoli trovati</div>
                {aiItems.map((item,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #C8E4E4'}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:DS.text}}>{item.nome}</div><div style={{fontSize:10,color:DS.textMid}}>{item.cat}{item.fornitore?' · '+item.fornitore:''}</div></div>
                    <div style={{textAlign:'right',marginLeft:8}}>{item.qty>0&&<div style={{fontSize:12,fontFamily:'"JetBrains Mono",monospace',color:'#28A0A0',fontWeight:700}}>{item.qty} {item.um}</div>}{item.prezzo>0&&<div style={{fontSize:10,fontFamily:'"JetBrains Mono",monospace',color:'#4A7070'}}>€{item.prezzo}</div>}</div>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <button onClick={()=>{setAiItems(null);setAiInput('');setImgMagB64(null);}} style={{flex:1,background:'#EEF8F8',color:'#4A7070',border:'none',borderRadius:8,padding:'9px',fontWeight:700,cursor:'pointer'}}>Annulla</button>
                  <button onClick={salvaAI} style={{flex:2,background:'#1A9E73',color:'#fff',border:'none',borderRadius:8,padding:'9px',fontWeight:700,cursor:'pointer',boxShadow:'0 3px 0 0 #0F7A56'}}>Salva in magazzino</button>
                </div>
              </div>
            )}
            {aiItems&&aiItems.length===0&&<div style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',padding:20,textAlign:'center',color:'#8BBCBC',fontSize:13}}>Nessun articolo trovato</div>}
            {!aiItems&&!aiLoading&&(
              <div style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#8BBCBC',marginBottom:8}}>ESEMPI RAPIDI</div>
                {['maniglia Hoppe cromo 200mm €18, cerniere acciaio €4, silicone neutro €6','viti autofilettanti 4.2x25 conf 200pz €12, tasselli fischer 8x80 €18','guarnizione EPDM 8mm 50mt €85, schiuma poliuretanica 6 tubi €42'].map((ex,i)=>(
                  <button key={i} onClick={()=>setAiInput(ex)} style={{display:'block',width:'100%',textAlign:'left',background:'#EEF8F8',border:'1px solid #C8E4E4',borderRadius:8,padding:'8px 10px',cursor:'pointer',marginBottom:6,fontSize:12,color:'#0D1F1F'}}>{ex}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista alert */}
        {vista==='alert'&&(
          sottoScorta.length===0
            ? <div style={{...C,textAlign:'center',padding:32}}>
                <div style={{fontSize:32,marginBottom:8}}>├ö┬ú├┤</div>
                <div style={{fontWeight:700,color:DS.green,fontSize:15}}>Tutto in ordine</div>
                <div style={{fontSize:12,color:DS.textMid,marginTop:4}}>Nessun articolo sotto scorta</div>
              </div>
            : sottoScorta.map((a)=>(
              <button key={a.id} onClick={()=>setSelArt(a.id)} style={{...C,textAlign:'left',cursor:'pointer',width:'100%',display:'block',border:'1.5px solid '+DS.red,borderRadius:14,marginBottom:6}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:DS.text,marginBottom:3}}>{a.nome}</div>
                    <div style={{fontSize:11,color:DS.red,fontWeight:600}}>Giacenza: {a.giacenza} · Minimo: {a.scorta_min} {a.um}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setOrdineOpen(true);setOrdineArt(a);}} style={{background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'6px 10px',fontSize:11,fontWeight:700,cursor:'pointer',flexShrink:0}}>
                    Ordina
                  </button>
                </div>
              </button>
            ))
        )}
      </div>

      {/* Modal ordine rapido da alert */}
      {ordineOpen&&ordineArt&&!selArt&&(
        <div onClick={()=>setOrdineOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:600,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:480,margin:'0 auto'}}>
            <div style={{width:40,height:4,borderRadius:2,background:DS.border,margin:'0 auto 16px'}}/>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>Ordine rapido</div>
            <div style={{fontSize:13,color:DS.textMid,marginBottom:16}}>{ordineArt.nome}</div>
            <a href={'https://wa.me/?text='+encodeURIComponent('Buongiorno, vorrei ordinare: '+ordineArt.nome+'. Quantita: ___. Disponibilita e prezzo? Grazie, Marco Vito.')}
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
