'use client';
import React from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const AZIENDA_ID = 'ccca51c1-656b-4e7c-a501-55753e20da29';
const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

import MagazzinoDettaglio from './MagazzinoDettaglio.jsx';
import MagazzinoLista from './MagazzinoLista.jsx';

function MagazzinoFreelance() {
  const [articoli, setArticoli] = React.useState<any[]>([]);
  const [movimenti, setMovimenti] = React.useState<any[]>([]);
  const [catalogo, setCatalogo] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [vista, setVista] = React.useState('giacenza');
  const [selArt, setSelArt] = React.useState('');
  const [addOpen, setAddOpen] = React.useState<boolean>(false);
  const [movOpen, setMovOpen] = React.useState('');
  const [newMov, setNewMov] = React.useState<any>({});
  const [newArt, setNewArt] = React.useState<any>({});
  const [catSearch, setCatSearch] = React.useState('');
  const [showCat, setShowCat] = React.useState<boolean>(false);
  const [ordineOpen, setOrdineOpen] = React.useState<boolean>(false);
  const [ordineArt, setOrdineArt] = React.useState<any>(null);



  const sbGet = async (table: string, params: any = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const r = await fetch(`${SB_URL}/rest/v1/${table}${qs?'?'+qs:''}`, {
        headers: {'apikey': SB_KEY, 'Authorization': 'Bearer '+SB_KEY}
      });
      return r.ok ? r.json() : [];
    } catch { return []; }
  };

  const sbPost = async (table: string, body: any) => {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {'apikey': SB_KEY, 'Authorization': 'Bearer '+SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation'},
        body: JSON.stringify(body)
      });
      return r.ok ? r.json() : null;
    } catch { return null; }
  };

  const sbPatch = async (table: string, id: string, body: any) => {
    try {
      await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {'apikey': SB_KEY, 'Authorization': 'Bearer '+SB_KEY, 'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
    } catch {}
  };

  React.useEffect(() => {
    let m = true;
    (async () => {
      const [arts, movs, cat] = await Promise.all([
        sbGet('articoli_magazzino', {'azienda_id': 'eq.'+AZIENDA_ID, 'order': 'categoria.asc,nome.asc', 'select': '*'}),
        sbGet('movimenti_magazzino', {'azienda_id': 'eq.'+AZIENDA_ID, 'order': 'created_at.desc', 'limit': '100', 'select': '*'}),
        sbGet('catalogo_galassia', {'tipo_record': 'eq.articolo', 'order': 'cat.asc,nome.asc', 'select': 'id,nome,um,valore_unitario,cat,fornitore,codice_articolo'}),
      ]);
      if (m) {
        setArticoli((arts||[]).map((a:any) => ({
          id:a.id, nome:a.nome, um:a.unita_misura||'pz',
          giacenza:Number(a.scorta_attuale)||0, scorta_min:Number(a.scorta_minima)||0,
          valore_unitario:Number(a.prezzo_acquisto)||0, cat:a.categoria||'altro',
          fornitore:a.fornitore||'—', note:a.note||'',
        })));
        setMovimenti((movs||[]).map((m:any) => ({
          id:m.id, articoloId:m.articolo_id, tipo:m.tipo,
          qty:Number(m.quantita), data:m.data||m.created_at?.slice(0,10),
          causale:m.causale||'', commessaId:m.commessa_id||null, note:m.note||'',
        })));
        setCatalogo(cat||[]);
        setLoading(false);
      }
    })();
    return () => { m = false; };
  }, []);

  const eseguiMov = async () => {
    if (!newMov.qty || !selArt || !movOpen) return;
    const qty = Number(newMov.qty);
    const art = articoli.find(a => a.id === selArt);
    if (movOpen === 'scarico' && (!art || art.giacenza < qty)) return;
    const nuova = movOpen === 'carico' ? (art?.giacenza||0)+qty : (art?.giacenza||0)-qty;
    setArticoli(p => p.map(a => a.id===selArt?{...a,giacenza:nuova}:a));
    setMovimenti(p => [{id:'MOV-'+Date.now(),articoloId:selArt,tipo:movOpen,qty,data:newMov.data||new Date().toISOString().slice(0,10),causale:newMov.causale||'acquisto',note:newMov.note||''},...p]);
    setMovOpen(''); setNewMov({});
    await sbPost('movimenti_magazzino', {azienda_id:AZIENDA_ID,articolo_id:selArt,tipo:movOpen,quantita:qty,causale:newMov.causale||'acquisto',data:newMov.data||new Date().toISOString().slice(0,10),note:newMov.note||''});
    await sbPatch('articoli_magazzino', selArt, {scorta_attuale:nuova});
  };

  const aggiungiDaCatalogo = async (cat: any) => {
    const exist = articoli.find(a => a.nome === cat.nome);
    if (exist) { setSelArt(exist.id); setMovOpen('carico'); setShowCat(false); setAddOpen(false); return; }
    const tmp = 'TMP-'+Date.now();
    const nuovo = {id:tmp,nome:cat.nome,um:cat.um||'pz',giacenza:0,scorta_min:0,valore_unitario:cat.valore_unitario||0,cat:cat.cat||'altro',fornitore:cat.fornitore||'—',note:''};
    setArticoli(p => [...p, nuovo]);
    setShowCat(false); setAddOpen(false);
    const res = await sbPost('articoli_magazzino', {azienda_id:AZIENDA_ID,nome:cat.nome,unita_misura:cat.um||'pz',prezzo_acquisto:cat.valore_unitario||0,scorta_attuale:0,scorta_minima:0,categoria:cat.cat||'altro',fornitore:cat.fornitore||'—',galassia_id:cat.id});
    if (res?.[0]?.id) setArticoli(p => p.map(a => a.id===tmp?{...a,id:res[0].id}:a));
  };

  const [aiInput, setAiInput] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [aiItems, setAiItems] = React.useState<any[]|null>(null);
  const imgMagRef = React.useRef<HTMLInputElement>(null);
  const [imgMagB64, setImgMagB64] = React.useState<string|null>(null);

  const estraiAI = async () => {
    if (!aiInput.trim() && !imgMagB64) return;
    setAiLoading(true); setAiItems(null);
    try {
      const msgs = imgMagB64
        ? [{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:imgMagB64}},{type:'text',text:aiInput||'Estrai articoli con nome quantita unita misura prezzo.'}]}]
        : [{role:'user',content:aiInput}];
      const r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:800,
          system:'Estrai articoli. Rispondi SOLO con JSON: [{"nome":"","qty":1,"um":"pz","prezzo":0,"cat":"fissaggi","fornitore":""}].',
          messages:msgs})
      });
      const d = await r.json();
      const txt = (d.content?.[0]?.text||'[]').replace(/```json|```/g,'').trim();
      setAiItems(JSON.parse(txt));
    } catch(e) { alert('Errore AI'); }
    setAiLoading(false);
  };

  const salvaAI = async () => {
    if (!aiItems?.length) return;
    const newItems = aiItems.filter((item:any) => !articoli.find(a=>a.nome.toLowerCase()===item.nome.toLowerCase()));
    for (const item of newItems) {
      const tmp='TMP-'+Date.now()+'-'+Math.random();
      const n={id:tmp,nome:item.nome,um:item.um||'pz',giacenza:Number(item.qty)||0,scorta_min:0,valore_unitario:Number(item.prezzo)||0,cat:item.cat||'altro',fornitore:item.fornitore||'',note:''};
      setArticoli((p:any[])=>[...p,n]);
      const res = await sbPost('articoli_magazzino',{azienda_id:AZIENDA_ID,nome:n.nome,unita_misura:n.um,prezzo_acquisto:n.valore_unitario,scorta_attuale:n.giacenza,scorta_minima:0,categoria:n.cat,fornitore:n.fornitore});
      if(res?.[0]?.id) setArticoli((p:any[])=>p.map((a:any)=>a.id===tmp?{...a,id:res[0].id}:a));
    }
    setAiItems(null); setAiInput(''); setImgMagB64(null);
  };

  const artSel = selArt ? articoli.find(a => a.id === selArt) : null;
  const sottoScorta = articoli.filter(a => a.giacenza <= a.scorta_min);
  const valTotale = articoli.reduce((s,a) => s + a.giacenza*a.valore_unitario, 0);
  const catFiltrato = catalogo.filter((c:any) => !catSearch || c.nome.toLowerCase().includes(catSearch.toLowerCase())).filter((c:any) => !articoli.find(a => a.nome===c.nome));
  const bycat = articoli.reduce((acc:any,a) => { acc[a.cat]=[...(acc[a.cat]||[]),a]; return acc; }, {});
  const movArt = selArt ? movimenti.filter(m => m.articoloId===selArt) : [];

  const C: any = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid '+DS.border,boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};
  const pill = (bg:string,col:string,txt:string) => <span style={{background:bg,color:col,borderRadius:20,padding:'2px 9px',fontSize:10,fontWeight:700}}>{txt}</span>;

  // ─ RENDER ─


  if (loading) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid '+DS.border,borderTopColor:DS.teal,animation:'spin 0.8s linear infinite'}}/>
      <div style={{fontSize:13,color:DS.textMid}}>Carico magazzino...</div>
    </div>
  );
  if (artSel) return (
    <MagazzinoDettaglio artSel={artSel} movArt={movArt} C={C} pill={pill} DS={DS}
      setSelArt={setSelArt} setMovOpen={setMovOpen} movOpen={movOpen}
      newMov={newMov} setNewMov={setNewMov} eseguiMov={eseguiMov}
      ordineOpen={ordineOpen} setOrdineOpen={setOrdineOpen}
      ordineArt={ordineArt} setOrdineArt={setOrdineArt}
    />
  );
  return (
    <MagazzinoLista
      articoli={articoli} movimenti={movimenti} catalogo={catalogo}
      vista={vista} setVista={setVista} selArt={selArt} setSelArt={setSelArt}
      addOpen={addOpen} setAddOpen={setAddOpen} movOpen={movOpen} setMovOpen={setMovOpen}
      newMov={newMov} setNewMov={setNewMov} newArt={newArt} setNewArt={setNewArt}
      catSearch={catSearch} setCatSearch={setCatSearch} showCat={showCat} setShowCat={setShowCat}
      ordineOpen={ordineOpen} setOrdineOpen={setOrdineOpen} ordineArt={ordineArt} setOrdineArt={setOrdineArt}
      aiInput={aiInput} setAiInput={setAiInput} aiLoading={aiLoading} aiItems={aiItems} setAiItems={setAiItems}
      imgMagRef={imgMagRef} imgMagB64={imgMagB64} setImgMagB64={setImgMagB64}
      sottoScorta={sottoScorta} valTotale={valTotale} catFiltrato={catFiltrato} bycat={bycat}
      eseguiMov={eseguiMov} aggiungiDaCatalogo={aggiungiDaCatalogo} estraiAI={estraiAI} salvaAI={salvaAI}
      C={C} pill={pill} DS={DS}
    />
  );
}

export default MagazzinoFreelance;
