'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  X, Zap, ClipboardList, Camera, MapPin, Phone,
  Package, Receipt, Settings, LogOut, ChevronRight,
  Mic, MicOff, Send, Bot, Sparkles, Clock, AlertTriangle,
  FileText, CheckCircle, Navigation
} from 'lucide-react';

const DS = {
  topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

interface AiMsg { id: number; role: 'user'|'ai'; text: string; ts: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  operatore: { nome: string; ruolo: string; avatar: string };
  commessa: { id: string; cliente: string; vani: number; pct: number };
  onNavigate: (view: string) => void;
}

// ─── AZIONI RAPIDE ────────────────────────────────────────────────────────────
const AZIONI = [
  { id:'commessa',  label:'Apri lavoro',       icon:<ClipboardList size={17}/>, color:'#28A0A0', hint:'Commessa COM-2024-047' },
  { id:'firma',     label:'Chiudi lavoro',      icon:<CheckCircle size={17}/>,   color:'#1A9E73', hint:'Firma + report finale' },
  { id:'blocco',    label:'Segnala problema',   icon:<AlertTriangle size={17}/>, color:'#DC4444', hint:'Notifica immediata ufficio' },
  { id:'ordini',    label:'Ordina materiale',   icon:<Package size={17}/>,       color:'#D08008', hint:'Richiesta magazzino/fornitore' },
  { id:'foto',      label:'Scatta foto',        icon:<Camera size={17}/>,        color:'#3B7FE0', hint:'Documenta il cantiere' },
  { id:'naviga',    label:'Naviga',             icon:<Navigation size={17}/>,    color:'#0F766E', hint:'Apri Google Maps' },
];

const RISPOSTE_AI: Record<string, string> = {
  'misure': 'Le misure di Finestra Camera sono 120×140cm. Porta Balcone 90×210cm. Finestra Bagno 60×90cm. Per irregolarità parete est: compensare +2cm sul lato sinistro.',
  'ordine': 'Puoi ordinare materiale dalla tab ORDINI nella commessa, oppure dimmi cosa ti serve e lo aggiungo subito.',
  'problema': 'Per segnalare un blocco lavoro usa "Segnala problema" nel menu. Scegli il tipo, aggiungi una foto e notifica l\'ufficio in un tap.',
  'firma': 'Il flusso di chiusura lavoro ha 4 step: 1) Foto proof per ogni vano 2) MASTRO SPESE 3) Firma digitale cliente 4) Sync ERP automatico.',
  'default': 'Sono MASTRO AI, il tuo assistente di cantiere. Posso aiutarti con misure, ordini, procedure di montaggio e segnalazioni. Come posso aiutarti?',
};

function getAiRisposta(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('misur') || m.includes('dimension')) return RISPOSTE_AI['misure'];
  if (m.includes('ordin') || m.includes('material') || m.includes('coprifil')) return RISPOSTE_AI['ordine'];
  if (m.includes('problem') || m.includes('blocc') || m.includes('non riesce')) return RISPOSTE_AI['problema'];
  if (m.includes('firm') || m.includes('chiu') || m.includes('collaud')) return RISPOSTE_AI['firma'];
  return RISPOSTE_AI['default'];
}

export default function SideDrawer({ open, onClose, operatore, commessa, onNavigate }: Props) {
  const [tab, setTab] = useState<'menu'|'ai'>('menu');
  const [aiMsgs, setAiMsgs] = useState<AiMsg[]>([
    { id: 1, role:'ai', text:'Ciao Marco! Sono MASTRO AI. Chiedimi misure, procedure di montaggio, o come gestire un problema sul cantiere.', ts:'ora' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && tab === 'ai') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, tab]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMsgs]);

  const sendMsg = () => {
    if (!input.trim() || loading) return;
    const userMsg: AiMsg = { id: Date.now(), role: 'user', text: input.trim(), ts: new Date().toLocaleTimeString('it-IT', {hour:'2-digit',minute:'2-digit'}) };
    setAiMsgs(m => [...m, userMsg]);
    const q = input.trim();
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const risposta = getAiRisposta(q);
      setAiMsgs(m => [...m, { id: Date.now()+1, role:'ai', text: risposta, ts: new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}) }]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  };

  const handleAzione = (id: string) => {
    onClose();
    if (id === 'naviga') {
      window.open('https://www.google.com/maps/dir/?api=1&destination=Via+Roma+12+Brindisi', '_blank');
      return;
    }
    onNavigate(id);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, backdropFilter:'blur(2px)' }}
      />

      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, width:300,
        background:'#fff', zIndex:201, display:'flex', flexDirection:'column',
        boxShadow:'-4px 0 32px rgba(0,0,0,0.18)',
        animation:'slideIn 200ms ease-out',
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{ background:DS.topbar, padding:'14px 16px', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:DS.teal, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:14 }}>
                {operatore.avatar}
              </div>
              <div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{operatore.nome}</div>
                <div style={{ color:DS.textLight, fontSize:11 }}>{operatore.ruolo}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
              <X size={20} color="#8BBCBC"/>
            </button>
          </div>
          {/* Commessa pill */}
          <div style={{ background:'rgba(40,160,160,0.15)', borderRadius:8, padding:'8px 12px', border:`1px solid rgba(40,160,160,0.3)` }}>
            <div style={{ color:DS.teal, fontSize:11, fontWeight:700, marginBottom:2 }}>{commessa.id} · {commessa.cliente}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ flex:1, height:4, borderRadius:999, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                <div style={{ height:4, background:DS.teal, width:`${commessa.pct}%`, borderRadius:999 }}/>
              </div>
              <span style={{ color:DS.textLight, fontSize:11, fontFamily:DS.mono }}>{commessa.pct}%</span>
            </div>
          </div>
          {/* Tab switcher */}
          <div style={{ display:'flex', gap:0, marginTop:12, background:'rgba(255,255,255,0.08)', borderRadius:8, padding:3 }}>
            {[{id:'menu',label:'Azioni rapide'},{id:'ai',label:'MASTRO AI'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id as 'menu'|'ai')}
                style={{ flex:1, background:tab===t.id?DS.teal:'none', color:tab===t.id?'#fff':DS.textLight, border:'none', borderRadius:6, padding:'7px 8px', cursor:'pointer', fontFamily:DS.ui, fontWeight:700, fontSize:12, transition:'all 150ms' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* MENU TAB */}
        {tab === 'menu' && (
          <div style={{ flex:1, overflowY:'auto', padding:14 }}>
            <div style={{ fontSize:11, color:DS.textMid, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>
              Azioni cantiere
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {AZIONI.map(a => (
                <button key={a.id} onClick={() => handleAzione(a.id)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'linear-gradient(145deg,#fff,#f4fcfc)', borderRadius:12, border:`1.5px solid ${DS.border}`, cursor:'pointer', textAlign:'left', boxShadow:'0 2px 6px rgba(40,160,160,.06)' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${a.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${a.color}30` }}>
                    <span style={{ color:a.color }}>{a.icon}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:DS.text, fontSize:14 }}>{a.label}</div>
                    <div style={{ fontSize:11, color:DS.textMid, marginTop:1 }}>{a.hint}</div>
                  </div>
                  <ChevronRight size={14} color={DS.textLight}/>
                </button>
              ))}
            </div>

            {/* Stato rapido */}
            <div style={{ fontSize:11, color:DS.textMid, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>
              Stato cantiere
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {[
                { label:'Vani totali', val:commessa.vani, color:DS.teal },
                { label:'Avanzamento', val:`${commessa.pct}%`, color:DS.green },
              ].map(s=>(
                <div key={s.label} style={{ background:'linear-gradient(145deg,#fff,#f4fcfc)', borderRadius:10, border:`1.5px solid ${DS.border}`, padding:'10px 12px' }}>
                  <div style={{ fontFamily:DS.mono, fontWeight:700, fontSize:20, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:11, color:DS.textMid, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop:`1px solid ${DS.border}`, paddingTop:14 }}>
              <button onClick={()=>setTab('ai')}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:`${DS.teal}10`, borderRadius:10, border:`1px solid ${DS.teal}30`, cursor:'pointer', width:'100%', marginBottom:8 }}>
                <Sparkles size={16} color={DS.teal}/>
                <span style={{ color:DS.teal, fontWeight:700, fontSize:13, fontFamily:DS.ui }}>Apri MASTRO AI</span>
              </button>
              <button style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', borderRadius:10, border:`1px solid ${DS.border}`, cursor:'pointer', width:'100%' }}>
                <Settings size={16} color={DS.textMid}/>
                <span style={{ color:DS.textMid, fontWeight:600, fontSize:13, fontFamily:DS.ui }}>Impostazioni</span>
              </button>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {tab === 'ai' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header AI */}
            <div style={{ padding:'10px 14px', background:DS.tealLight, borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:DS.teal, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bot size={15} color="#fff"/>
              </div>
              <div>
                <div style={{ fontWeight:700, color:DS.text, fontSize:13 }}>MASTRO AI</div>
                <div style={{ fontSize:10, color:DS.teal }}>Assistente cantiere</div>
              </div>
              <div style={{ marginLeft:'auto', width:8, height:8, borderRadius:'50%', background:DS.green, boxShadow:`0 0 0 3px rgba(26,158,115,0.2)` }}/>
            </div>

            {/* Messaggi */}
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
              {/* Suggerimenti rapidi */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['Misure vani','Come ordino?','Chiudi lavoro'].map(s=>(
                  <button key={s} onClick={()=>{setInput(s);}}
                    style={{ background:DS.tealLight, border:`1px solid ${DS.border}`, borderRadius:20, padding:'4px 10px', cursor:'pointer', fontSize:11, color:DS.teal, fontWeight:600, fontFamily:DS.ui }}>
                    {s}
                  </button>
                ))}
              </div>

              {aiMsgs.map(msg=>(
                <div key={msg.id} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start', gap:8, alignItems:'flex-end' }}>
                  {msg.role==='ai'&&(
                    <div style={{ width:24, height:24, borderRadius:6, background:DS.teal, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginBottom:2 }}>
                      <Bot size={13} color="#fff"/>
                    </div>
                  )}
                  <div style={{ maxWidth:'82%', background:msg.role==='user'?DS.teal:'#fff', borderRadius:msg.role==='user'?'12px 12px 4px 12px':'12px 12px 12px 4px', padding:'9px 12px', border:msg.role==='user'?'none':`1px solid ${DS.border}`, boxShadow:msg.role==='ai'?'0 1px 4px rgba(0,0,0,.06)':'none' }}>
                    <div style={{ fontSize:13, color:msg.role==='user'?'#fff':DS.text, lineHeight:1.5 }}>{msg.text}</div>
                    <div style={{ fontSize:9, color:msg.role==='user'?'rgba(255,255,255,0.55)':DS.textLight, marginTop:4, textAlign:'right' }}>{msg.ts}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:DS.teal, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bot size={13} color="#fff"/>
                  </div>
                  <div style={{ background:'#fff', borderRadius:'12px 12px 12px 4px', padding:'10px 14px', border:`1px solid ${DS.border}`, display:'flex', gap:4, alignItems:'center' }}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:DS.teal, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`, opacity:0.7 }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEnd}/>
            </div>

            {/* Input AI */}
            <div style={{ padding:'10px 12px', borderTop:`1px solid ${DS.border}`, background:'#fff', display:'flex', gap:8, flexShrink:0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                placeholder="Chiedi a MASTRO AI..."
                style={{ flex:1, padding:'10px 12px', border:`1.5px solid ${DS.border}`, borderRadius:10, fontSize:13, fontFamily:DS.ui, outline:'none', background:'#fafffe' }}
              />
              <button onClick={sendMsg} disabled={!input.trim()||loading}
                style={{ background:input.trim()&&!loading?DS.teal:'#e5e7eb', border:'none', borderRadius:10, padding:'0 14px', cursor:input.trim()&&!loading?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:input.trim()&&!loading?`0 3px 0 0 ${DS.tealDark}`:'none' }}>
                <Send size={15} color={input.trim()&&!loading?'#fff':DS.textLight}/>
              </button>
            </div>
            <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.3);opacity:1}}`}</style>
          </div>
        )}
      </div>
    </>
  );
}
