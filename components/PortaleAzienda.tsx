// @ts-nocheck
// PortaleAzienda.tsx — Dashboard completa per aziende che lavorano con il freelance
// URL: /azienda/[invite_code]
'use client';
import React, { useState, useEffect, useRef } from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';

async function sbGet(table: string, params: Record<string,string>) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${qs}`, {
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
  });
  return r.ok ? r.json() : [];
}
async function sbPost(table: string, body: object) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  });
  return r.ok ? r.json() : null;
}
async function sbUpload(path: string, file: File): Promise<string|null> {
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': file.type, 'x-upsert': 'true' },
      body: file,
    });
    if (!r.ok) return null;
    return `${SB_URL}/storage/v1/object/public/foto-vani/${path}`;
  } catch { return null; }
}

const DS = {
  bg: '#E8F4F4', topbar: '#0D1F1F', teal: '#28A0A0', tealDark: '#156060',
  card: '#fff', border: '#C8E4E4', text: '#0D1F1F', textMid: '#4A7070', textLight: '#8BBCBC',
  red: '#DC4444', green: '#1A9E73', amber: '#D08008', blue: '#3B7FE0',
};

const TIPI_VANO = ['Finestra','Portafinestra','Porta','Scorrevole','Velux','Persiana','Zanzariera','Cassonetto','Altro'];
const MATERIALI_OPT = ['PVC','Alluminio','Legno','Alluminio-Legno','Acciaio','Altro'];

const STATO_CONFIG: Record<string,{bg:string;color:string;label:string}> = {
  nuova:      { bg:'#FEF3C7', color:'#92400E', label:'In attesa' },
  vista:      { bg:'#DBEAFE', color:'#1E40AF', label:'Presa in carico' },
  accettata:  { bg:'#D1FAE5', color:'#065F46', label:'Accettata' },
  in_corso:   { bg:'#E0F2FE', color:'#0369A1', label:'In lavorazione' },
  completata: { bg:'#E0E7FF', color:'#3730A3', label:'Completata' },
  rifiutata:  { bg:'#FEE2E2', color:'#991B1B', label:'Rifiutata' },
  annullata:  { bg:'#F3F4F6', color:'#6B7280', label:'Annullata' },
};

interface Vano { id:number; tipo:string; materiale:string; larghezza:string; altezza:string; stanza:string; piano:string; note:string; }

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PortaleAzienda({ inviteCode }: { inviteCode: string }) {
  const [loading, setLoading] = useState(true);
  const [azienda, setAzienda] = useState<any>(null);
  const [operatore, setOperatore] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [richieste, setRichieste] = useState<any[]>([]);
  const [view, setView] = useState<'dashboard'|'nuovo'|'dettaglio'>('dashboard');
  const [selRichiesta, setSelRichiesta] = useState<any>(null);
  const [filtro, setFiltro] = useState('tutti');
  const [montaggi, setMontaggi] = useState<any[]>([]);
  const [fotoFasi, setFotoFasi] = useState<any[]>([]);
  const [firme, setFirme] = useState<any[]>([]);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const res = await sbGet('aziende_freelance', { invite_code: 'eq.' + inviteCode, limit: '1' });
      if (!res || res.length === 0) { setNotFound(true); setLoading(false); return; }
      const az = res[0];
      setAzienda(az);
      const opRes = await sbGet('operatori', { id: 'eq.' + az.operatore_id, limit: '1' });
      if (opRes?.[0]) setOperatore(opRes[0]);
      await loadRichieste(az.id);
      setLoading(false);
    })();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [inviteCode]);

  useEffect(() => {
    if (!azienda) return;
    pollRef.current = setInterval(() => loadRichieste(azienda.id), 30000);
    return () => clearInterval(pollRef.current);
  }, [azienda]);

  const loadRichieste = async (azId: string) => {
    const rl = await sbGet('richieste_lavoro', { azienda_fl_id: 'eq.' + azId, order: 'created_at.desc', limit: '100' });
    setRichieste(rl || []);
  };

  const openDettaglio = async (r: any) => {
    setSelRichiesta(r);
    setView('dettaglio');
    if (r.commessa_id) {
      const [mt, ft, fm] = await Promise.all([
        sbGet('montaggi', { commessa_id: 'eq.' + r.commessa_id, limit: '10' }),
        sbGet('allegati_vano', { select: '*', limit: '50' }),
        sbGet('firma_collaudo', { select: '*', limit: '10' }),
      ]);
      setMontaggi(mt || []);
      setFotoFasi((ft || []).filter((f: any) => f.fase));
      setFirme(fm || []);
    } else { setMontaggi([]); setFotoFasi([]); setFirme([]); }
  };

  const nomeFreelance = operatore ? `${operatore.nome} ${operatore.cognome}` : 'Montatore';
  const nuove = richieste.filter(r => r.stato === 'nuova' || r.stato === 'vista').length;
  const attivi = richieste.filter(r => ['accettata','in_corso'].includes(r.stato)).length;
  const completati = richieste.filter(r => r.stato === 'completata').length;
  const totBudget = richieste.filter(r => r.budget && !['rifiutata','annullata'].includes(r.stato)).reduce((s, r) => s + (r.budget || 0), 0);

  const filtered = filtro === 'tutti' ? richieste : richieste.filter(r => {
    if (filtro === 'attivi') return ['nuova','vista','accettata','in_corso'].includes(r.stato);
    if (filtro === 'completati') return r.stato === 'completata';
    return r.stato === filtro;
  });

  if (loading) return <FullScreen><Spinner/><P c={DS.textMid}>Caricamento portale...</P></FullScreen>;
  if (notFound) return (
    <FullScreen>
      <IconCircle bg="#FEE2E2"><XSvg c={DS.red} s={32}/></IconCircle>
      <P c={DS.text} w={700} s={20} mt={16}>Link non valido</P>
      <P c={DS.textMid} s={14} mt={8}>Contatta il montatore per un nuovo link.</P>
    </FullScreen>
  );

  const Topbar = () => (
    <div style={{background:DS.topbar,padding:'14px 20px',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(40,160,160,0.15)'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {view !== 'dashboard' && (
          <button onClick={() => { setView('dashboard'); setSelRichiesta(null); }}
            style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        <div style={{width:40,height:40,borderRadius:12,background:azienda?.colore||DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#fff'}}>{(azienda?.nome||'?')[0]}</div>
        <div style={{flex:1}}>
          <div style={{color:'#fff',fontWeight:700,fontSize:15}}>{azienda?.nome}</div>
          <div style={{color:DS.textLight,fontSize:11}}>Lavori con {nomeFreelance}</div>
        </div>
        {view === 'dashboard' && nuove > 0 && <div style={{background:DS.amber,color:'#fff',borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700}}>{nuove} in attesa</div>}
      </div>
    </div>
  );

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────
  if (view === 'dashboard') return (
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <Topbar/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 100px'}}>
        {/* KPI */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:16}}>
          {[
            {n:nuove,l:'In attesa',c:DS.amber,bg:'#FEF3C7'},
            {n:attivi,l:'Attivi',c:DS.blue,bg:'#DBEAFE'},
            {n:completati,l:'Completati',c:DS.green,bg:'#D1FAE5'},
            {n:totBudget,l:'Totale',c:DS.tealDark,bg:'#E0F2F1',cur:true},
          ].map((k,i)=>(
            <div key={i} style={{background:k.bg,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
              <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:k.cur?15:22,color:k.c}}>
                {k.cur?'\u20AC'+k.n.toLocaleString('it-IT'):k.n}
              </div>
              <div style={{fontSize:9,color:k.c,fontWeight:600,marginTop:2,textTransform:'uppercase',letterSpacing:.3}}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* Filtri */}
        <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
          {[{k:'tutti',l:'Tutti ('+richieste.length+')'},{k:'attivi',l:'Attivi ('+attivi+')'},{k:'completati',l:'Completati ('+completati+')'},{k:'rifiutata',l:'Rifiutati'}].map(f=>(
            <button key={f.k} onClick={()=>setFiltro(f.k)}
              style={{background:filtro===f.k?DS.teal:'#fff',color:filtro===f.k?'#fff':DS.textMid,border:`1.5px solid ${filtro===f.k?DS.teal:DS.border}`,
                borderRadius:20,padding:'6px 14px',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Lista lavori */}
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:40,color:DS.textLight,fontSize:14}}>Nessun lavoro {filtro!=='tutti'?'con questo filtro':'ancora'}</div>
        ):filtered.map((r: any) => {
          const st = STATO_CONFIG[r.stato]||STATO_CONFIG.nuova;
          const nVani = (r.vani_json||[]).length;
          const gg = r.data_preferita?Math.ceil((new Date(r.data_preferita).getTime()-Date.now())/86400000):null;
          return (
            <button key={r.id} onClick={()=>openDettaglio(r)}
              style={{width:'100%',background:DS.card,border:`1.5px solid ${r.urgente?DS.red:DS.border}`,borderRadius:14,padding:'14px 16px',marginBottom:10,cursor:'pointer',textAlign:'left',display:'block'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <div style={{flex:1,paddingRight:10}}>
                  <div style={{fontWeight:700,fontSize:15,color:DS.text}}>{r.cliente}</div>
                  <div style={{fontSize:12,color:DS.textMid,marginTop:2}}>{r.indirizzo}</div>
                </div>
                <div style={{background:st.bg,borderRadius:20,padding:'3px 10px',flexShrink:0}}>
                  <span style={{fontSize:10,fontWeight:700,color:st.color}}>{st.label}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                <span style={{fontSize:12,color:DS.textMid}}>{nVani} vani</span>
                {r.budget&&<span style={{fontSize:12,fontWeight:700,color:DS.teal}}>{'\u20AC'}{r.budget}</span>}
                {r.data_preferita&&<span style={{fontSize:11,color:gg!==null&&gg<0?DS.red:gg!==null&&gg<=2?DS.amber:DS.textLight}}>
                  {new Date(r.data_preferita).toLocaleDateString('it-IT',{day:'numeric',month:'short'})}
                  {gg!==null&&gg>=0&&gg<=3&&` (tra ${gg}gg)`}{gg!==null&&gg<0&&' (scaduto)'}
                </span>}
                {r.urgente&&<span style={{fontSize:10,fontWeight:700,color:DS.red,background:'#FEE2E2',borderRadius:4,padding:'1px 6px'}}>URGENTE</span>}
              </div>
              <div style={{fontSize:10,color:DS.textLight,marginTop:6}}>Inviato il {new Date(r.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})}</div>
            </button>
          );
        })}

        <button onClick={()=>setView('nuovo')}
          style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:568,margin:'0 auto',background:DS.teal,color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:100,boxShadow:'0 4px 20px rgba(40,160,160,.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuovo lavoro
        </button>
      </div>
    </div>
  );

  // ─── DETTAGLIO LAVORO ───────────────────────────────────────────────────────
  if (view==='dettaglio'&&selRichiesta) {
    const r=selRichiesta;
    const st=STATO_CONFIG[r.stato]||STATO_CONFIG.nuova;
    const vani=r.vani_json||[];
    const allegati=r.allegati_json||[];
    const montaggio=montaggi[0];
    const fotoPerFase=(fase:string)=>fotoFasi.filter((f:any)=>f.fase===fase);
    const firma=firme[0];

    return (
      <div style={{minHeight:'100vh',background:DS.bg,fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <Topbar/>
        <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 40px'}}>

          {/* Header */}
          <div style={{background:`linear-gradient(135deg,${st.bg},#fff)`,borderRadius:16,border:`2px solid ${st.color}22`,padding:16,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontWeight:800,fontSize:20,color:DS.text}}>{r.cliente}</div>
                <div style={{fontSize:13,color:DS.textMid,marginTop:4}}>{r.indirizzo}</div>
                {r.telefono_cliente&&<div style={{fontSize:12,color:DS.textMid,marginTop:2}}>Tel: {r.telefono_cliente}</div>}
              </div>
              <div style={{background:st.bg,borderRadius:12,padding:'6px 14px',border:`1.5px solid ${st.color}33`}}>
                <div style={{fontSize:12,fontWeight:800,color:st.color}}>{st.label}</div>
              </div>
            </div>
            {r.urgente&&<div style={{marginTop:10,background:'#FEE2E2',borderRadius:8,padding:'6px 12px',display:'inline-flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,fontWeight:700,color:DS.red}}>URGENTE</span>
            </div>}
          </div>

          {/* Timeline */}
          <Card title="Avanzamento">
            <div style={{display:'flex',gap:4,marginBottom:8}}>
              {['nuova','accettata','in_corso','completata'].map((s,i)=>{
                const idx=['nuova','vista','accettata','in_corso','completata'].indexOf(r.stato);
                const active=idx>=i;
                const isCur=(r.stato===s)||(r.stato==='vista'&&s==='nuova');
                return (<div key={s} style={{flex:1,textAlign:'center'}}>
                  <div style={{width:'100%',height:4,borderRadius:2,background:active?DS.teal:'#E5E7EB',marginBottom:4}}/>
                  <div style={{fontSize:9,color:active?DS.teal:DS.textLight,fontWeight:isCur?800:400}}>{s==='nuova'?'Inviata':s==='accettata'?'Accettata':s==='in_corso'?'In corso':'Completata'}</div>
                </div>);
              })}
            </div>
            {r.accettata_il&&<div style={{fontSize:11,color:DS.textMid}}>Accettata il {new Date(r.accettata_il).toLocaleDateString('it-IT')}</div>}
            {r.completata_il&&<div style={{fontSize:11,color:DS.green}}>Completata il {new Date(r.completata_il).toLocaleDateString('it-IT')}</div>}
            {r.stato==='rifiutata'&&r.motivo_rifiuto&&<div style={{background:'#FEE2E2',borderRadius:8,padding:'8px 12px',marginTop:8}}><div style={{fontSize:11,fontWeight:700,color:DS.red}}>Motivo:</div><div style={{fontSize:12,color:'#991B1B'}}>{r.motivo_rifiuto}</div></div>}
          </Card>

          {/* Info */}
          <Card title="Dettagli">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <InfoRow l="Data richiesta" v={r.data_preferita?new Date(r.data_preferita).toLocaleDateString('it-IT'):'Non specificata'}/>
              <InfoRow l="Ora" v={r.ora_preferita?.slice(0,5)||'Non specificata'}/>
              <InfoRow l="Budget" v={r.budget?`\u20AC${r.budget}`:'Non specificato'}/>
              <InfoRow l="Vani" v={`${vani.length}`}/>
            </div>
            {r.note&&<div style={{marginTop:10,background:'#F4FAFA',borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,fontWeight:600,color:DS.teal,marginBottom:2}}>Note</div><div style={{fontSize:13,color:DS.text,lineHeight:1.4}}>{r.note}</div></div>}
          </Card>

          {/* Vani */}
          {vani.length>0&&<Card title={`Vani (${vani.length})`}>
            {vani.map((v:any,i:number)=>(
              <div key={i} style={{background:'#F4FAFA',borderRadius:10,padding:12,marginBottom:8,border:`1px solid ${DS.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:13,color:DS.text}}>Vano {i+1} — {v.tipo}</span>
                  <span style={{fontSize:11,fontWeight:600,color:DS.teal,background:'#EEF8F8',borderRadius:4,padding:'1px 8px'}}>{v.materiale}</span>
                </div>
                <div style={{display:'flex',gap:12,fontSize:12,color:DS.textMid}}>
                  {v.larghezza&&v.altezza&&<span>{v.larghezza}x{v.altezza} mm</span>}
                  {v.stanza&&<span>{v.stanza}</span>}
                  {v.piano&&<span>Piano {v.piano}</span>}
                </div>
                {v.note&&<div style={{fontSize:12,color:DS.textMid,marginTop:4,fontStyle:'italic'}}>{v.note}</div>}
              </div>
            ))}
          </Card>}

          {/* Timer ore */}
          {montaggio&&<Card title="Ore lavoro">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,textAlign:'center'}}>
              <div><div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:DS.teal}}>{montaggio.ore_preventivate||'\u2014'}</div><div style={{fontSize:10,color:DS.textMid}}>Preventivate</div></div>
              <div><div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:montaggio.ore_reali>montaggio.ore_preventivate?DS.red:DS.green}}>{montaggio.ore_reali?montaggio.ore_reali.toFixed(1):'\u2014'}</div><div style={{fontSize:10,color:DS.textMid}}>Reali</div></div>
              <div><div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:DS.text}}>{montaggio.stato||'\u2014'}</div><div style={{fontSize:10,color:DS.textMid}}>Stato</div></div>
            </div>
          </Card>}

          {/* Foto fasi */}
          {fotoFasi.length>0&&<Card title="Documentazione fotografica">
            {['prima','durante','dopo'].map(fase=>{
              const fotos=fotoPerFase(fase);
              if(!fotos.length) return null;
              return (<div key={fase} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.teal,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{fase==='prima'?'Prima dei lavori':fase==='durante'?'Durante i lavori':'Dopo i lavori'} ({fotos.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {fotos.map((f:any,i:number)=><img key={i} src={f.file_url||f.url} alt={`${fase} ${i+1}`} style={{width:'100%',height:80,objectFit:'cover',borderRadius:8,border:`1px solid ${DS.border}`}}/>)}
                </div>
              </div>);
            })}
          </Card>}

          {/* Allegati */}
          {allegati.length>0&&<Card title={`Allegati (${allegati.length})`}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {allegati.map((a:any,i:number)=>(
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{borderRadius:8,overflow:'hidden',border:`1px solid ${DS.border}`,display:'block'}}>
                  {a.tipo==='img'?<img src={a.url} alt={a.nome} style={{width:'100%',height:80,objectFit:'cover',display:'block'}}/>:
                  <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',background:'#F4FAFA',flexDirection:'column',gap:4}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{fontSize:9,color:DS.textMid,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nome}</span>
                  </div>}
                </a>
              ))}
            </div>
          </Card>}

          {/* Firma */}
          {firma&&<Card title="Firma collaudo">
            <div style={{textAlign:'center'}}>
              <img src={firma.firma_url} alt="Firma" style={{maxWidth:'100%',maxHeight:150,border:`1px solid ${DS.border}`,borderRadius:8}}/>
              <div style={{fontSize:11,color:DS.textMid,marginTop:6}}>Firmato da {firma.firmato_da} il {firma.firmato_il?new Date(firma.firmato_il).toLocaleDateString('it-IT'):''}</div>
            </div>
          </Card>}
        </div>
      </div>
    );
  }

  // ─── NUOVO LAVORO ───────────────────────────────────────────────────────────
  if (view==='nuovo') return <NuovoLavoroForm azienda={azienda} nomeFreelance={nomeFreelance} inviteCode={inviteCode} onSent={()=>{loadRichieste(azienda.id);setView('dashboard');}} onBack={()=>setView('dashboard')}/>;
  return null;
}

// ─── FORM NUOVO LAVORO ───────────────────────────────────────────────────────
function NuovoLavoroForm({azienda,nomeFreelance,inviteCode,onSent,onBack}:any){
  const [cliente,setCliente]=useState('');
  const [indirizzo,setIndirizzo]=useState('');
  const [telCliente,setTelCliente]=useState('');
  const [emailCliente,setEmailCliente]=useState('');
  const [dataPreferita,setDataPreferita]=useState('');
  const [oraPreferita,setOraPreferita]=useState('');
  const [urgente,setUrgente]=useState(false);
  const [budget,setBudget]=useState('');
  const [note,setNote]=useState('');
  const [vani,setVani]=useState<Vano[]>([{id:1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const [allegati,setAllegati]=useState<any[]>([]);
  const [uploading,setUploading]=useState(false);
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);

  const addVano=()=>setVani(v=>[...v,{id:v.length+1,tipo:'Finestra',materiale:'PVC',larghezza:'',altezza:'',stanza:'',piano:'PT',note:''}]);
  const removeVano=(id:number)=>setVani(v=>v.filter(x=>x.id!==id));
  const updateVano=(id:number,f:string,val:string)=>setVani(v=>v.map(x=>x.id===id?{...x,[f]:val}:x));

  const handleUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=e.target.files;if(!files)return;
    setUploading(true);
    for(let i=0;i<files.length;i++){
      const f=files[i];
      const path=`portale/${inviteCode}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const url=await sbUpload(path,f);
      if(url)setAllegati(prev=>[...prev,{nome:f.name,url,tipo:f.type.startsWith('image')?'img':'file'}]);
    }
    setUploading(false);e.target.value='';
  };

  const invia=async()=>{
    if(!cliente.trim()||!indirizzo.trim())return;
    setSending(true);
    await sbPost('richieste_lavoro',{
      azienda_fl_id:azienda.id,operatore_id:azienda.operatore_id,
      cliente:cliente.trim(),indirizzo:indirizzo.trim(),
      telefono_cliente:telCliente,email_cliente:emailCliente,
      data_preferita:dataPreferita||null,ora_preferita:oraPreferita||null,
      urgente,budget:budget?parseFloat(budget):null,note,
      vani_json:vani.map(v=>({tipo:v.tipo,materiale:v.materiale,larghezza:v.larghezza?parseInt(v.larghezza):null,altezza:v.altezza?parseInt(v.altezza):null,stanza:v.stanza,piano:v.piano,note:v.note})),
      allegati_json:allegati,stato:'nuova',
    });
    setSending(false);setSent(true);setTimeout(()=>onSent(),1500);
  };

  if(sent)return(<FullScreen><IconCircle bg="#D1FAE5"><CheckSvg c="#1A9E73"/></IconCircle><P c="#0D1F1F" w={800} s={22} mt={16}>Richiesta inviata!</P><P c="#4A7070" s={14} mt={8}>{nomeFreelance} riceverà una notifica</P></FullScreen>);

  return(
    <div style={{minHeight:'100vh',background:'#E8F4F4',fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <div style={{background:'#0D1F1F',padding:'14px 20px',position:'sticky',top:0,zIndex:100}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#28A0A0',fontWeight:700,fontSize:13,padding:0,marginBottom:6}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Dashboard
        </button>
        <div style={{fontWeight:800,fontSize:18,color:'#fff'}}>Nuovo lavoro</div>
      </div>
      <div style={{maxWidth:600,margin:'0 auto',padding:'16px 16px 100px',display:'flex',flexDirection:'column',gap:12}}>
        <Card title="Dati cliente">
          <Input label="Nome cliente *" value={cliente} onChange={setCliente} placeholder="Mario Rossi"/>
          <Input label="Indirizzo cantiere *" value={indirizzo} onChange={setIndirizzo} placeholder="Via Roma 45, Cosenza"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input label="Telefono" value={telCliente} onChange={setTelCliente} placeholder="333 1234567" type="tel"/>
            <Input label="Email" value={emailCliente} onChange={setEmailCliente} placeholder="mario@email.it" type="email"/>
          </div>
        </Card>
        <Card title="Tempistiche">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input label="Data preferita" value={dataPreferita} onChange={setDataPreferita} type="date"/>
            <Input label="Ora preferita" value={oraPreferita} onChange={setOraPreferita} type="time"/>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
            <button onClick={()=>setUrgente(!urgente)} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',position:'relative',background:urgente?'#DC4444':'#D1D5DB',transition:'.2s'}}>
              <div style={{width:20,height:20,borderRadius:10,background:'#fff',position:'absolute',top:2,left:urgente?22:2,transition:'.2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
            </button>
            <span style={{fontSize:13,fontWeight:urgente?700:400,color:urgente?'#DC4444':'#4A7070'}}>{urgente?'URGENTE':'Urgente'}</span>
          </div>
        </Card>
        <Card title={`Vani (${vani.length})`}>
          {vani.map((v,i)=>(
            <div key={v.id} style={{background:'#F4FAFA',borderRadius:10,padding:12,marginBottom:10,border:'1px solid #C8E4E4',position:'relative'}}>
              {vani.length>1&&<button onClick={()=>removeVano(v.id)} style={{position:'absolute',top:8,right:8,background:'none',border:'none',cursor:'pointer',padding:4}}><XSvg c="#DC4444" s={16}/></button>}
              <div style={{fontSize:12,fontWeight:700,color:'#28A0A0',marginBottom:8}}>Vano {i+1}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <Sel label="Tipo" value={v.tipo} onChange={val=>updateVano(v.id,'tipo',val)} options={['Finestra','Portafinestra','Porta','Scorrevole','Velux','Persiana','Zanzariera','Cassonetto','Altro']}/>
                <Sel label="Materiale" value={v.materiale} onChange={val=>updateVano(v.id,'materiale',val)} options={['PVC','Alluminio','Legno','Alluminio-Legno','Acciaio','Altro']}/>
                <Input label="Larghezza mm" value={v.larghezza} onChange={val=>updateVano(v.id,'larghezza',val)} placeholder="1200" type="number"/>
                <Input label="Altezza mm" value={v.altezza} onChange={val=>updateVano(v.id,'altezza',val)} placeholder="1400" type="number"/>
                <Input label="Stanza" value={v.stanza} onChange={val=>updateVano(v.id,'stanza',val)} placeholder="Soggiorno"/>
                <Sel label="Piano" value={v.piano} onChange={val=>updateVano(v.id,'piano',val)} options={['PT','1','2','3','4','5','Interrato']}/>
              </div>
              <Input label="Note" value={v.note} onChange={val=>updateVano(v.id,'note',val)} placeholder="Controtelaio, davanzale..."/>
            </div>
          ))}
          <button onClick={addVano} style={{width:'100%',border:'2px dashed #C8E4E4',background:'transparent',borderRadius:10,padding:'10px 0',cursor:'pointer',color:'#28A0A0',fontWeight:700,fontSize:13}}>+ Aggiungi vano</button>
        </Card>
        <Card title="Budget"><Input label="Budget indicativo" value={budget} onChange={setBudget} placeholder="350" type="number"/></Card>
        <Card title={`Allegati (${allegati.length})`}>
          <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple style={{display:'none'}} onChange={handleUpload}/>
          {allegati.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
            {allegati.map((a:any,i:number)=>(<div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',border:'1px solid #C8E4E4'}}>
              {a.tipo==='img'?<img src={a.url} alt={a.nome} style={{width:'100%',height:80,objectFit:'cover',display:'block'}}/>:<div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',background:'#F4FAFA'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28A0A0" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>}
              <button onClick={()=>setAllegati(p=>p.filter((_:any,j:number)=>j!==i))} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'rgba(0,0,0,.5)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><XSvg c="#fff" s={10}/></button>
            </div>))}
          </div>}
          <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{width:'100%',border:'2px dashed #C8E4E4',background:'transparent',borderRadius:10,padding:'14px 0',cursor:'pointer',color:'#28A0A0',fontWeight:700,fontSize:13,opacity:uploading?.5:1}}>{uploading?'Caricamento...':'+ Foto, planimetrie, documenti'}</button>
        </Card>
        <Card title="Note"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Descrivi il lavoro..." style={{width:'100%',minHeight:80,border:'1.5px solid #C8E4E4',borderRadius:10,padding:'10px 12px',fontSize:14,fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box'}}/></Card>
      </div>
      <button onClick={invia} disabled={!cliente.trim()||!indirizzo.trim()||sending}
        style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:568,margin:'0 auto',background:(!cliente.trim()||!indirizzo.trim())?'#9CA3AF':'#28A0A0',color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:100,boxShadow:'0 4px 20px rgba(40,160,160,.4)',opacity:sending?.6:1}}>
        {sending?'Invio in corso...':`Invia a ${nomeFreelance}`}
      </button>
    </div>
  );
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function FullScreen({children}:any){return <div style={{minHeight:'100vh',background:'#E8F4F4',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>{children}</div>;}
function Spinner(){return<><div style={{width:40,height:40,border:'3px solid #C8E4E4',borderTop:'3px solid #28A0A0',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></>;}
function IconCircle({bg,children}:any){return <div style={{width:64,height:64,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center'}}>{children}</div>;}
function CheckSvg({c}:{c:string}){return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;}
function XSvg({c,s=16}:{c:string;s?:number}){return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;}
function P({c,w,s,mt,children}:any){return <div style={{color:c,fontWeight:w||400,fontSize:s||14,marginTop:mt||0}}>{children}</div>;}
function Card({title,children}:any){return <div style={{background:'#fff',borderRadius:14,border:'1.5px solid #C8E4E4',padding:'14px 16px',marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:'#0D1F1F',marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>{title}</div>{children}</div>;}
function Input({label,value,onChange,placeholder,type}:any){return <div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:600,color:'#4A7070',marginBottom:4}}>{label}</div><input value={value} onChange={(e:any)=>onChange(e.target.value)} placeholder={placeholder} type={type||'text'} style={{width:'100%',border:'1.5px solid #C8E4E4',borderRadius:8,padding:'9px 12px',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>;}
function Sel({label,value,onChange,options}:any){return <div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:600,color:'#4A7070',marginBottom:4}}>{label}</div><select value={value} onChange={(e:any)=>onChange(e.target.value)} style={{width:'100%',border:'1.5px solid #C8E4E4',borderRadius:8,padding:'9px 12px',fontSize:14,fontFamily:'inherit',outline:'none',background:'#fff',boxSizing:'border-box'}}>{options.map((o:string)=><option key={o} value={o}>{o}</option>)}</select></div>;}
function InfoRow({l,v}:any){return <div><div style={{fontSize:10,fontWeight:600,color:'#8BBCBC',marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0D1F1F'}}>{v}</div></div>;}
