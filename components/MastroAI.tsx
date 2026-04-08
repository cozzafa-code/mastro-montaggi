// ts-20260408brain3
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, ChevronDown,
  ClipboardList, AlertTriangle,
  Package, Mail, MessageSquare, Bell, Zap
} from 'lucide-react';

const DS = {
  topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73',
  red:'#DC4444', amber:'#D08008',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

// ── DB ERP (cervello unico Galassia) ──────────────────────────────
const ERP_URL = 'https://wdqhjnpnkhfarcvwnumk.supabase.co';
const ERP_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcWhqbnBua2hmYXJjdndudW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDg0ODYsImV4cCI6MjA4NjQ4NDQ4Nn0.UXN5-0qfV68nOG-n6HJWWU3twZlDJOyNW-jw5Wt6xNs';

async function fetchGalassiaKnowledge(): Promise<string> {
  try {
    const hdrs = { 'apikey': ERP_KEY, 'Authorization': 'Bearer ' + ERP_KEY };
    const [brainRes, vocRes, khRes, catRes] = await Promise.all([
      fetch(ERP_URL + '/rest/v1/ai_knowledge?attivo=eq.true&select=categoria,domanda,risposta,parole_chiave&order=volte_usato.desc&limit=100', { headers: hdrs }),
      fetch(ERP_URL + '/rest/v1/ai_vocabolario?select=termine_utente,termine_standard&limit=100', { headers: hdrs }),
      fetch(ERP_URL + '/rest/v1/catalogo_galassia?tipo_record=eq.know_how&select=nome,note,cat&limit=50', { headers: hdrs }),
      fetch(ERP_URL + '/rest/v1/catalogo_galassia?tipo_record=eq.articolo&select=nome,codice_articolo,cat,fornitore,note,campi_applicazione,valore_unitario&limit=400', { headers: hdrs }),
    ]);
    const brain = brainRes.ok ? await brainRes.json() : [];
    const voc = vocRes.ok ? await vocRes.json() : [];
    const kh = khRes.ok ? await khRes.json() : [];
    const cat = catRes.ok ? await catRes.json() : [];
    
    let knowledge = '';
    
    // Brain — sapere condiviso da tutti gli artigiani
    if (brain.length > 0) {
      knowledge += '\n\nSAPERE CONDIVISO MASTRO (' + brain.length + ' conoscenze apprese):\n';
      knowledge += brain.map((b: any) => '- [' + b.categoria + '] ' + (b.domanda ? 'D: ' + b.domanda + ' R: ' : '') + b.risposta).join('\n');
    }
    
    // Vocabolario artigiano — modi di dire
    if (voc.length > 0) {
      knowledge += '\n\nVOCABOLARIO ARTIGIANO:\n';
      knowledge += 'Quando un artigiano usa questi termini, sai cosa significano:\n';
      knowledge += voc.map((v: any) => '- "' + v.termine_utente + '" = ' + v.termine_standard).join('\n');
    }
    
    // Know-how dal catalogo
    if (kh.length > 0) {
      knowledge += '\n\nKNOW-HOW TECNICO GALASSIA (' + kh.length + ' schede):\n';
      knowledge += kh.map((k: any) => '- ' + k.nome + ': ' + (k.note || '')).join('\n');
    }
    
    // Catalogo articoli
    if (cat.length > 0) {
      const categories = Array.from(new Set(cat.map((c: any) => c.cat))).sort();
      knowledge += '\n\nCATALOGO GALASSIA MASTRO (' + cat.length + ' articoli, ' + categories.length + ' categorie):\n';
      knowledge += cat.map((c: any) => '- ' + c.nome + ' [' + c.codice_articolo + '] ' + c.fornitore + ' ' + c.cat + (c.valore_unitario > 0 ? ' ' + c.valore_unitario + 'eur' : '') + (c.note ? ' — ' + c.note.slice(0, 80) : '')).join('\n');
    }
    
    return knowledge;
  } catch (e) {
    console.error('[fetchGalassiaKnowledge]', e);
    return '';
  }
}

export interface CommessaCtx {
  operatore: { nome: string; ruolo: string };
  commessa: {
    id: string; cliente: string; indirizzo: string;
    telefono: string; dataAppuntamento: string; oraAppuntamento: string;
    note: string;
    vani: { nome: string; tipo: string; dimensioni: string; stato: string }[];
  };
  completate: number;
  totaleCheck: number;
  ordini: { desc: string; qty: number; stato: string }[];
}

type TipoMsg = 'intervento'|'ordine'|'email'|'urgente'|'info';
type Priorita = 'alta'|'media'|'bassa';

interface MsgIn {
  id: number; da: string; testo: string; ora: string;
  tipo: TipoMsg; priorita: Priorita; azione: string; letto: boolean;
}

interface AiMsg { id: number; role: 'user'|'ai'|'error'; text: string; ts: string; }

interface Props {
  open: boolean; onClose: () => void;
  ctx: CommessaCtx; onAction?: (action: string) => void;
}

const MSGS_MOCK: MsgIn[] = [
  { id:1, da:'Lidia Cozza', ora:'08:12', letto:false, tipo:'intervento', priorita:'alta',
    testo:'Marco, il cliente Rossi chiede se riesci a terminare entrambe le finestre oggi. Ha ospiti domani.',
    azione:'Conferma entro oggi se finisci i 3 vani o solo 2 — avvisa Lidia.' },
  { id:2, da:'Magazzino', ora:'07:55', letto:false, tipo:'ordine', priorita:'media',
    testo:'Ordine guarnizioni EPDM confermato. Consegna domani mattina 08:00 in cantiere.',
    azione:'Nessuna azione — materiale in arrivo domani.' },
  { id:3, da:'rossi@email.it', ora:'07:30', letto:true, tipo:'email', priorita:'bassa',
    testo:'Buongiorno, confermo l\'appuntamento di oggi alle 8:30. Sarò in casa tutto il giorno.',
    azione:'Cliente gia confermato, nessuna risposta necessaria.' },
  { id:4, da:'Ufficio', ora:'06:45', letto:false, tipo:'urgente', priorita:'alta',
    testo:'ATTENZIONE: verifica misure Porta Balcone prima di iniziare. Disegno aggiornato in CAD.',
    azione:'Apri MastroCad e controlla disegno Porta Balcone PRIMA di montare.' },
  { id:5, da:'Luigi Bianchi', ora:'ieri', letto:true, tipo:'info', priorita:'bassa',
    testo:'Note parete est nel CAD. Differenza 2cm gia compensata nel disegno.',
    azione:'Info gia gestita nel disegno CAD.' },
];

const TIPO_CFG: Record<TipoMsg,{label:string;col:string;bg:string;icon:React.ReactNode}> = {
  intervento:{ label:'Intervento', col:'#28A0A0', bg:'#EEF8F8', icon:<ClipboardList size={12}/> },
  ordine:    { label:'Ordine',     col:'#D08008', bg:'#FEF9EC', icon:<Package size={12}/> },
  email:     { label:'Email',      col:'#3B7FE0', bg:'#EEF4FF', icon:<Mail size={12}/> },
  urgente:   { label:'URGENTE',    col:'#DC4444', bg:'#FEF2F2', icon:<AlertTriangle size={12}/> },
  info:      { label:'Info',       col:'#4A7070', bg:'#F3F8F8', icon:<Bell size={12}/> },
};

const SUGGERIMENTI = ['Cosa faccio adesso?','Che vite uso per il CX65?','Leggi i messaggi urgenti','Quanto ci metto a finire?','Regole posa UNI 11673','Che guarnizione serve?','Ho un problema'];

function buildSystem(ctx: CommessaCtx, msgs: MsgIn[]): string {
  const nl = msgs.filter(m=>!m.letto);
  const vaniStr = ctx.commessa.vani.map(v=>`- ${v.nome}: ${v.tipo} ${v.dimensioni} stato:${v.stato}`).join("\n");
  const ordiniStr = ctx.ordini.map(o=>`- ${o.desc} qty:${o.qty} stato:${o.stato}`).join("\n");
  const msgsStr = nl.map(m=>`- ${m.da} [${m.tipo}]: ${m.testo}`).join("\n");
  return `Sei MASTRO AI, assistente operativo di ${ctx.operatore.nome} su fliwoX Montaggi.

REGOLE:
1. Sei un collega esperto di serramenti con 20 anni di esperienza, non un chatbot generico
2. Conosci tutto della giornata - rispondi sempre con dati concreti
3. Non dire mai non posso o non ho accesso - hai tutto quello che ti serve
4. Risposte brevi e dirette - sei su telefono in cantiere
5. Quando ti chiedono di contattare qualcuno dai il numero diretto
6. Quando ti chiedono cosa fare dai una sola azione concreta
7. Scrivi testo semplice, zero asterischi o cancelletti
8. IMPORTANTE: Quando ti chiedono consigli tecnici (tasselli, vetri, profili, guarnizioni) CHIEDI PRIMA il contesto necessario - tipo di muro, zona climatica, piano, tipo di profilo. Un esperto vero non spara risposte generiche, fa le domande giuste.
9. Se nel SAPERE CONDIVISO trovi una risposta che inizia con "PRIMA CHIEDI", segui quelle istruzioni e fai le domande indicate prima di rispondere.
10. Usa il VOCABOLARIO ARTIGIANO per capire termini dialettali o abbreviazioni degli artigiani.
11. Tutto quello che sai viene dalla Galassia MASTRO - il sapere condiviso di tutti gli artigiani italiani.

SITUAZIONE ATTUALE:
Operatore: ${ctx.operatore.nome} (${ctx.operatore.ruolo})
Commessa: ${ctx.commessa.id} - ${ctx.commessa.cliente}
Cantiere: ${ctx.commessa.indirizzo}
Tel cliente: ${ctx.commessa.telefono}
Orario: ${ctx.commessa.dataAppuntamento} ore ${ctx.commessa.oraAppuntamento}
Note: ${ctx.commessa.note}

VANI DA INSTALLARE:
${vaniStr}

AVANZAMENTO: ${ctx.completate} di ${ctx.totaleCheck} operazioni completate

ORDINI:
${ordiniStr}

MESSAGGI NON LETTI (${nl.length}):
${msgsStr}

CONTATTI DISPONIBILI:
- Cliente ${ctx.commessa.cliente}: ${ctx.commessa.telefono}
- Ufficio Lidia Cozza: +39 340 333 4444
- Misuratore Luigi Bianchi: +39 340 111 2222
- Magazzino: +39 340 555 6666

COSA SAI FARE:
- Leggere e riassumere i messaggi del team
- Dire il miglior ordine di installazione dei vani
- Spiegare come risolvere problemi tecnici di installazione serramenti (UNI 7697, UNI 11673, CAM 2026)
- Calcolare tempi stimati per completare la commessa
- Suggerire cosa dire al cliente
- Dare numeri di telefono di chiunque nella commessa
- Rispondere a domande tecniche su prodotti, materiali, normative del settore serramenti
- Cercare articoli nel catalogo Galassia MASTRO (codici, prezzi, fornitori, campi applicazione)
- Dare consigli su posa, guarnizioni, vetri, ferramenta, sigillanti, isolamento
- Spiegare compatibilita tra profili, ferramenta e accessori
- Calcolare trasmittanza Uw e verificare conformita zona climatica`;
}

export default function MastroAI({ open, onClose, ctx, onAction }: Props) {
  const [tab, setTab] = useState<'chat'|'messaggi'>('messaggi');
  const [galassiaKnowledge, setGalassiaKnowledge] = useState('');

  useEffect(() => {
    fetchGalassiaKnowledge().then(k => setGalassiaKnowledge(k));
  }, []);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recogRef = React.useRef<any>(null);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`]/g, '').slice(0, 300);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'it-IT'; utt.rate = 1.05; utt.pitch = 1;
    setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Microfono non supportato su questo browser'); return; }
    const r = new SR();
    r.lang = 'it-IT'; r.continuous = false; r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => {
      const txt = e.results[0][0].transcript;
      setInput(txt);
      setTimeout(() => send(txt), 100);
    };
    recogRef.current = r;
    r.start();
  };

  const stopListening = () => {
    recogRef.current?.stop();
    setListening(false);
  };
  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voce non supportata su questo browser'); return; }
    const r = new SR();
    r.lang = 'it-IT'; r.continuous = false; r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e: any) => { send(e.results[0][0].transcript); };
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
  };

  const stopVoice = () => { recogRef.current?.stop(); setListening(false); };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT'; u.rate = 1.05; u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const [msgs, setMsgs] = useState<AiMsg[]>([{
    id:1, role:'ai', ts:'ora',
    text:`Ciao ${ctx.operatore.nome.split(' ')[0]}! Ho analizzato la tua giornata.\n\nHai ${MSGS_MOCK.filter(m=>!m.letto).length} messaggi non letti — incluso uno URGENTE dall'ufficio sulla Porta Balcone.\n\nVuoi che ti dica cosa fare adesso?`,
  }]);
  const [inbox, setInbox] = useState<MsgIn[]>(MSGS_MOCK);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{role:'user'|'assistant';content:string}[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if(open && tab==='chat') setTimeout(()=>inputRef.current?.focus(),400); },[open,tab]);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,loading]);

  const markRead = (id:number) => setInbox(m=>m.map(x=>x.id===id?{...x,letto:true}:x));

  const send = useCallback(async (text?:string) => {
    const q = (text||input).trim();
    if(!q||loading) return;
    setInput('');
    if(tab!=='chat') setTab('chat');

    const um:AiMsg = { id:Date.now(), role:'user', text:q, ts:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}) };
    setMsgs(m=>[...m,um]);
    setLoading(true);

    const nh = [...history, {role:'user' as const, content:q}];
    try {
      const res = await fetch('/api/claude',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600, system:buildSystem(ctx,inbox) + galassiaKnowledge, messages:nh }),
      });
      if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error((e as {error?:{message?:string}})?.error?.message||`HTTP ${res.status}`); }
      const data = await res.json();
      const reply:string = (data?.content?.[0] as {text?:string})?.text ?? 'Nessuna risposta.';
      setHistory([...nh,{role:'assistant',content:reply}]);
      setMsgs(m=>[...m,{id:Date.now()+1,role:'ai',text:reply,ts:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}]);
      speak(reply);
      speakText(reply.slice(0,200));
    } catch(err:unknown) {
      const msg = err instanceof Error ? err.message : 'Errore';
      setMsgs(m=>[...m,{id:Date.now()+1,role:'error',text:`Errore: ${msg}`,ts:''}]);
    } finally { setLoading(false); }
  },[input,loading,history,ctx,inbox,tab]);

  if(!open) return null;
  const nonLetti = inbox.filter(m=>!m.letto).length;

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:300,backdropFilter:'blur(3px)'}}/>
      <div style={{position:'fixed',left:0,right:0,bottom:0,height:'92dvh',maxWidth:480,margin:'0 auto',background:'#fff',zIndex:301,borderRadius:'20px 20px 0 0',display:'flex',flexDirection:'column',boxShadow:'0 -8px 40px rgba(0,0,0,0.22)',animation:'aiSlideUp 180ms cubic-bezier(.32,.72,0,1)'}}>
        <style>{`@keyframes aiSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes aiPulse{0%,100%{transform:scale(.8);opacity:.4}50%{transform:scale(1.2);opacity:1}}@keyframes aiFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${DS.topbar},#1a3535)`,borderRadius:'20px 20px 0 0',padding:'14px 18px 12px',flexShrink:0}}>
          <div style={{width:40,height:4,background:'rgba(255,255,255,0.2)',borderRadius:2,margin:'0 auto 12px'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg,${DS.teal},${DS.green})`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 12px rgba(40,160,160,0.4)`}}>
                <Sparkles size={21} color="#fff"/>
              </div>
              <div>
                <div style={{color:'#fff',fontWeight:800,fontSize:17}}>MASTRO AI</div>
                <div style={{display:'flex',alignItems:'center',gap:5,marginTop:1}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:DS.green}}/>
                  <span style={{color:DS.textLight,fontSize:11}}>Assistente intelligente attivo</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:10,padding:'8px 10px',cursor:'pointer'}}>
              <ChevronDown size={18} color="#8BBCBC"/>
            </button>
          </div>
          <div style={{display:'flex',background:'rgba(255,255,255,0.08)',borderRadius:10,padding:3}}>
            {([['messaggi','Messaggi'],['chat','Chatta']] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                style={{flex:1,background:tab===id?DS.teal:'transparent',color:'#fff',border:'none',borderRadius:8,padding:'8px',cursor:'pointer',fontFamily:DS.ui,fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all 150ms'}}>
                {id==='messaggi'?<MessageSquare size={14}/>:<Sparkles size={14}/>}
                {label}
                {id==='messaggi'&&nonLetti>0&&<span style={{background:DS.red,color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{nonLetti}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tab messaggi */}
        {tab==='messaggi'&&(
          <div style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
            <div style={{background:`${DS.tealLight}`,border:`1px solid ${DS.border}`,borderRadius:12,padding:'10px 14px',display:'flex',gap:10,alignItems:'flex-start'}}>
              <Sparkles size={15} color={DS.teal} style={{flexShrink:0,marginTop:2}}/>
              <div style={{fontSize:13,color:DS.textMid,lineHeight:1.5}}>
                <strong style={{color:DS.teal}}>AI ha analizzato {inbox.length} messaggi.</strong> {nonLetti} non letti, {inbox.filter(m=>m.priorita==='alta').length} ad alta priorita.
                <button onClick={()=>send('Analizza tutti i messaggi e dimmi esattamente cosa devo fare adesso in ordine di priorita')} style={{display:'block',marginTop:6,background:'none',border:'none',color:DS.teal,fontWeight:700,fontSize:12,cursor:'pointer',padding:0,textDecoration:'underline',fontFamily:DS.ui}}>
                  ÔåÆ Chiedi all'AI cosa fare adesso
                </button>
              </div>
            </div>

            {[...inbox].sort((a,b)=>({alta:0,media:1,bassa:2}[a.priorita]-{alta:0,media:1,bassa:2}[b.priorita])).map(msg=>{
              const tc=TIPO_CFG[msg.tipo];
              return(
                <div key={msg.id} onClick={()=>markRead(msg.id)}
                  style={{background:msg.letto?'#fff':'linear-gradient(145deg,#fff,#f8fffe)',border:`1.5px solid ${msg.letto?DS.border:msg.priorita==='alta'?DS.red+'40':DS.teal+'30'}`,borderRadius:14,padding:'12px 14px',cursor:'pointer',animation:'aiFade 200ms ease-out',position:'relative'}}>
                  {!msg.letto&&<div style={{position:'absolute',top:10,right:10,width:8,height:8,borderRadius:'50%',background:msg.priorita==='alta'?DS.red:msg.priorita==='media'?DS.amber:DS.teal}}/>}
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <div style={{background:tc.bg,color:tc.col,border:`1px solid ${tc.col}30`,borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:700,fontFamily:DS.ui,display:'flex',alignItems:'center',gap:4}}>
                      {tc.icon}{tc.label}
                    </div>
                    <span style={{color:DS.textLight,fontSize:11,marginLeft:'auto'}}>{msg.ora}</span>
                  </div>
                  <div style={{fontWeight:700,color:DS.text,fontSize:13,marginBottom:3}}>{msg.da}</div>
                  <div style={{fontSize:13,color:DS.textMid,lineHeight:1.4,marginBottom:8}}>{msg.testo}</div>
                  <div style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:8,padding:'6px 10px',display:'flex',gap:8,alignItems:'flex-start'}}>
                    <Zap size={12} color={DS.teal} style={{flexShrink:0,marginTop:1}}/>
                    <div style={{fontSize:11,color:DS.teal,fontWeight:600,lineHeight:1.4}}>{msg.azione}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab chat */}
        {tab==='chat'&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:12}}>
              {msgs.map(msg=>(
                <div key={msg.id} style={{animation:'aiFade 200ms ease-out',display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',gap:8,alignItems:'flex-end'}}>
                  {msg.role==='ai'&&<div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${DS.teal},${DS.green})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginBottom:2}}><Sparkles size={14} color="#fff"/></div>}
                  <div style={{maxWidth:'84%',background:msg.role==='user'?DS.teal:msg.role==='error'?'#FEE2E2':'#f8fffe',borderRadius:msg.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',padding:'10px 13px',border:msg.role==='user'?'none':msg.role==='error'?`1px solid ${DS.red}40`:`1px solid ${DS.border}`}}>
                    <div style={{fontSize:13.5,color:msg.role==='user'?'#fff':msg.role==='error'?DS.red:DS.text,lineHeight:1.55,whiteSpace:'pre-wrap'}}>{msg.text}</div>
                    {msg.ts&&<div style={{fontSize:10,color:msg.role==='user'?'rgba(255,255,255,0.5)':DS.textLight,marginTop:4,textAlign:'right'}}>{msg.ts}</div>}
                  </div>
                </div>
              ))}
              {loading&&(
                <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                  <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${DS.teal},${DS.green})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Sparkles size={14} color="#fff"/></div>
                  <div style={{background:'#f8fffe',borderRadius:'14px 14px 14px 4px',padding:'12px 16px',border:`1px solid ${DS.border}`,display:'flex',gap:5,alignItems:'center'}}>
                    {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:DS.teal,animation:`aiPulse 1.3s ease-in-out ${i*0.22}s infinite`}}/>)}
                  </div>
                </div>
              )}
              {msgs.length<=2&&!loading&&(
                <div style={{marginTop:4}}>
                  <div style={{fontSize:11,color:DS.textLight,marginBottom:8,fontWeight:700,textTransform:'uppercase',letterSpacing:0.3}}>Suggerimenti rapidi</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {SUGGERIMENTI.map(s=>(
                      <button key={s} onClick={()=>send(s)} style={{background:'#f0fdfb',border:`1px solid ${DS.border}`,borderRadius:20,padding:'6px 12px',cursor:'pointer',fontSize:12,color:DS.teal,fontWeight:600,fontFamily:DS.ui}}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            <div style={{padding:'10px 14px',borderTop:`1px solid ${DS.border}`,background:'#fff',display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
              <div style={{flex:1,background:'#f8fffe',border:`1.5px solid ${input?DS.teal:DS.border}`,borderRadius:14,padding:'10px 14px',transition:'border-color 150ms'}}>
                <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                  placeholder={listening?"Sto ascoltando...":"Chiedi a MASTRO AI..."}
                  style={{width:'100%',background:'none',border:'none',outline:'none',fontSize:14,fontFamily:DS.ui,color:DS.text}}/>
              </div>
              <button onClick={listening?stopListening:startListening}
                style={{width:46,height:46,borderRadius:14,border:'none',cursor:'pointer',background:listening?'#DC4444':'rgba(40,160,160,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:listening?'0 4px 0 0 #A83030':'0 4px 0 0 #C8E4E4',transition:'all 150ms'}}>
                {listening
                  ?<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect x="5" y="5" width="14" height="14" rx="3"/></svg>
                  :<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28A0A0" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                }
              </button>
              <button onClick={()=>send()} disabled={!input.trim()||loading}
                style={{width:46,height:46,borderRadius:14,border:'none',cursor:input.trim()&&!loading?'pointer':'default',background:input.trim()&&!loading?`linear-gradient(135deg,${DS.teal},${DS.green})`:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:input.trim()&&!loading?`0 4px 0 0 ${DS.tealDark}`:'none',transition:'all 100ms'}}>
                <Send size={18} color={input.trim()&&!loading?'#fff':DS.textLight}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
