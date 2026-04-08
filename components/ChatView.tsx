// ChatView build: 2026-04-03 20:40:29
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Mic, MicOff, Image, Paperclip, Video, Smile,
  Play, Pause, X, ChevronLeft, ArrowRight, Check,
  Phone, MessageSquare, FileText, Download, Plus
} from 'lucide-react';

// ─── DS ──────────────────────────────────────────────────────────────────────
const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

// ─── TIPI ────────────────────────────────────────────────────────────────────
type Fase = 'misura'|'preventivo'|'produzione'|'montaggio'|'fattura';
type MsgType = 'testo'|'foto'|'video'|'audio'|'file'|'sistema';

interface Allegato {
  tipo: MsgType;
  url: string;       // dataURL o object URL
  nome?: string;
  durata?: number;   // secondi per audio
  size?: string;
}

interface ChatMsg {
  id: number;
  autore: string;
  testo: string;
  ora: string;
  proprio: boolean;
  fase: Fase;
  allegati?: Allegato[];
}

interface Contatto {
  id: string;
  nome: string;
  ruolo: string;
  avatar: string;
  msgs: ChatMsg[];
}

// ─── MOCK ────────────────────────────────────────────────────────────────────
const FASI_META: Record<Fase, { label: string; stato: 'fatto'|'attivo'|'attesa' }> = {
  misura:     { label: 'Misura',     stato: 'fatto'  },
  preventivo: { label: 'Preventivo', stato: 'fatto'  },
  produzione: { label: 'Produzione', stato: 'fatto'  },
  montaggio:  { label: 'Montaggio',  stato: 'attivo' },
  fattura:    { label: 'Fattura',    stato: 'attesa' },
};

const THREAD_INIT: ChatMsg[] = [
  { id:1, autore:'Luigi Bianchi', testo:'Misure completate. Parete est +2cm di irregolarità.', ora:'18/03 09:15', proprio:false, fase:'misura' },
  { id:2, autore:'Lidia Cozza',   testo:'Preventivo approvato dal cliente. Procediamo.',       ora:'20/03 11:30', proprio:false, fase:'preventivo' },
  { id:3, autore:'Officina Sud',  testo:'Produzione completata. Tutto pronto per il montaggio.',ora:'28/03 16:00', proprio:false, fase:'produzione' },
  { id:4, autore:'Lidia Cozza',   testo:'Marco, porta i coprifili extra da 40mm.',             ora:'07:45',       proprio:false, fase:'montaggio' },
  { id:5, autore:'Marco Vito',    testo:'Ok, li ho già nel furgone.',                          ora:'07:52',       proprio:true,  fase:'montaggio' },
];

const CONTACTS_INIT: Contatto[] = [
  { id:'lidia',  nome:'Lidia Cozza',   ruolo:'Ufficio',     avatar:'LC', msgs:[{ id:1, autore:'Lidia Cozza', testo:'Tutto ok per domani?', ora:'ieri', proprio:false, fase:'montaggio' }] },
  { id:'luigi',  nome:'Luigi Bianchi', ruolo:'Misuratore',  avatar:'LB', msgs:[] },
  { id:'andrea', nome:'Andrea Neri',   ruolo:'Apprendista', avatar:'AN', msgs:[] },
];

const OP = { nome:'Marco Vito', avatar:'MV' };

// ─── GRUPPO ───────────────────────────────────────────────────────────────────
interface Gruppo {
  id: string; nome: string; avatar: string; colore: string;
  membri: string[]; msgs: ChatMsg[];
}
const GRUPPI_INIT: Gruppo[] = [
  { id:'cantiere-rossi', nome:'Cantiere Fam. Rossi', avatar:'CR', colore:'#28A0A0',
    membri:['Marco Vito','Luigi Bianchi','Andrea Neri'],
    msgs:[
      {id:1,autore:'Luigi Bianchi',testo:'Domani porto le lastre mancanti.',ora:'ieri 16:00',proprio:false,fase:'montaggio' as const},
      {id:2,autore:'Marco Vito',testo:'Ok, io arrivo alle 8:00.',ora:'ieri 16:15',proprio:true,fase:'montaggio' as const},
    ]},
  { id:'ufficio-team', nome:'Team Ufficio', avatar:'TU', colore:'#1A9E73',
    membri:['Marco Vito','Lidia Cozza'],
    msgs:[{id:1,autore:'Lidia Cozza',testo:'Riunione lunedì 9:00.',ora:'lun 09:00',proprio:false,fase:'montaggio' as const}]},
];
const COM_ID = 'COM-2024-047';

// ─── EMOJI PICKER ─────────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  { label:'Lavoro', emojis:['🔧','🪛','🪚','⚒️','🏗️','📐','📏','🪜','🧰','✅','❌','⚠️','📋','📄','💡'] },
  { label:'Facce',  emojis:['👍','👎','✌️','🤝','👏','💪','🙏','😊','😂','🤔','😅','😬','🤙','❤️','🔥'] },
  { label:'Numeri', emojis:['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','0️⃣','#️⃣','💯','✔️','‼️','❓'] },
];

function EmojiPicker({ onSelect, onClose }: { onSelect:(e:string)=>void; onClose:()=>void }) {
  const [group, setGroup] = useState(0);
  return (
    <div style={{ position:'absolute', bottom:60, left:0, right:0, background:'#fff', border:`1.5px solid ${DS.border}`, borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:100, overflow:'hidden' }}>
      <div style={{ display:'flex', borderBottom:`1px solid ${DS.border}`, padding:'8px 12px', gap:4 }}>
        {EMOJI_GROUPS.map((g,i)=>(
          <button key={i} onClick={()=>setGroup(i)}
            style={{ background:group===i?DS.tealLight:'none', border:'none', borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:12, color:group===i?DS.teal:DS.textMid, fontWeight:group===i?700:400 }}>
            {g.label}
          </button>
        ))}
        <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer' }}><X size={16} color={DS.textMid}/></button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', padding:'10px 12px', gap:2 }}>
        {EMOJI_GROUPS[group].emojis.map(e=>(
          <button key={e} onClick={()=>onSelect(e)}
            style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', padding:'4px', borderRadius:6, lineHeight:1 }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AUDIO PLAYER ─────────────────────────────────────────────────────────────
function AudioPlayer({ url, durata, proprio }: { url:string; durata?:number; proprio:boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const fmt = (s:number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:160 }}>
      <audio ref={audioRef} src={url}
        onTimeUpdate={()=>{ const a=audioRef.current!; setCurrentTime(a.currentTime); setProgress(a.currentTime/a.duration*100); }}
        onEnded={()=>{ setPlaying(false); setProgress(0); setCurrentTime(0); }}/>
      <button onClick={toggle}
        style={{ width:34, height:34, borderRadius:'50%', background:proprio?'rgba(255,255,255,0.25)':DS.teal, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {playing ? <Pause size={14} color="#fff"/> : <Play size={14} color="#fff"/>}
      </button>
      <div style={{ flex:1 }}>
        <div style={{ height:4, borderRadius:999, background:proprio?'rgba(255,255,255,0.25)':DS.border, overflow:'hidden' }}>
          <div style={{ height:4, background:proprio?'#fff':DS.teal, width:`${progress}%`, borderRadius:999, transition:'width 100ms' }}/>
        </div>
        <div style={{ fontSize:10, color:proprio?'rgba(255,255,255,0.7)':DS.textMid, marginTop:3 }}>
          {fmt(currentTime)} / {fmt(durata||0)}
        </div>
      </div>
      <Mic size={14} color={proprio?'rgba(255,255,255,0.6)':DS.textMid}/>
    </div>
  );
}

// ─── FILE ALLEGATO ────────────────────────────────────────────────────────────
function AllegatoPreview({ all, proprio }: { all:Allegato; proprio:boolean }) {
  if (all.tipo === 'foto') {
    return <img src={all.url} alt="foto" style={{ maxWidth:'100%', borderRadius:8, display:'block', marginTop:4 }}/>;
  }
  if (all.tipo === 'video') {
    return (
      <video src={all.url} controls style={{ maxWidth:'100%', borderRadius:8, display:'block', marginTop:4 }}/>
    );
  }
  if (all.tipo === 'audio') {
    return <div style={{ marginTop:4 }}><AudioPlayer url={all.url} durata={all.durata} proprio={proprio}/></div>;
  }
  // file generico
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4, background:proprio?'rgba(255,255,255,0.15)':'#f4fcfc', borderRadius:8, padding:'8px 10px' }}>
      <FileText size={18} color={proprio?'rgba(255,255,255,0.8)':DS.teal}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:proprio?'#fff':DS.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{all.nome||'file'}</div>
        {all.size&&<div style={{ fontSize:11, color:proprio?'rgba(255,255,255,0.6)':DS.textMid }}>{all.size}</div>}
      </div>
      <a href={all.url} download={all.nome} style={{ background:'none', border:'none', cursor:'pointer' }}>
        <Download size={16} color={proprio?'rgba(255,255,255,0.8)':DS.teal}/>
      </a>
    </div>
  );
}

// ─── BUBBLE MESSAGGIO ─────────────────────────────────────────────────────────
function Bubble({ msg }: { msg:ChatMsg }) {
  const { proprio } = msg;
  const isSistema = msg.autore === 'Sistema' || msg.autore === 'Ufficio';
  const bgSistema = msg.autore === 'Ufficio' ? '#FEF3C7' : '#f0f9f9';
  const borderSistema = msg.autore === 'Ufficio' ? `1px solid ${DS.amber}` : `1px solid ${DS.tealLight}`;
  const colorAutore = msg.autore === 'Ufficio' ? DS.amber : DS.teal;

  return (
    <div style={{ display:'flex', justifyContent:proprio?'flex-end':'flex-start', marginBottom:6 }}>
      <div style={{
        maxWidth:'82%',
        background: isSistema ? bgSistema : proprio ? DS.teal : '#fff',
        borderRadius: proprio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        padding:'9px 12px',
        border: isSistema ? borderSistema : proprio ? 'none' : `1px solid ${DS.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {!proprio && (
          <div style={{ fontSize:11, color:colorAutore, fontWeight:700, marginBottom:3 }}>{msg.autore}</div>
        )}
        {msg.testo && (
          <div style={{ fontSize:14, color:proprio?'#fff':DS.text, lineHeight:1.45, wordBreak:'break-word' }}>{msg.testo}</div>
        )}
        {msg.allegati?.map((all,i)=>(
          <AllegatoPreview key={i} all={all} proprio={proprio}/>
        ))}
        <div style={{ fontSize:10, color:proprio?'rgba(255,255,255,0.55)':DS.textLight, marginTop:4, textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
          {msg.ora}
          {proprio && <Check size={10} color="rgba(255,255,255,0.6)"/>}
        </div>
      </div>
    </div>
  );
}

// ─── INPUT BAR ────────────────────────────────────────────────────────────────
function InputBar({
  onSend,
  placeholder,
}: {
  onSend: (testo:string, allegati?:Allegato[]) => void;
  placeholder: string;
}) {
  const [testo, setTesto]           = useState('');
  const [showEmoji, setShowEmoji]   = useState(false);
  const [recording, setRecording]   = useState(false);
  const [recSec, setRecSec]         = useState(0);
  const [showAttach, setShowAttach] = useState(false);
  const fotoRef   = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLInputElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const mediaRef  = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recTimer  = useRef<ReturnType<typeof setInterval>|null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const handleSendText = () => {
    if (!testo.trim()) return;
    onSend(testo.trim());
    setTesto('');
    setShowEmoji(false);
  };

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>, tipo:MsgType) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const size = file.size > 1024*1024
        ? `${(file.size/1024/1024).toFixed(1)} MB`
        : `${Math.round(file.size/1024)} KB`;
      onSend('', [{ tipo, url, nome:file.name, size }]);
    });
    e.target.value = '';
    setShowAttach(false);
  };

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type:'audio/webm' });
        const url = URL.createObjectURL(blob);
        onSend('', [{ tipo:'audio', url, nome:'vocale.webm', durata:recSec }]);
        stream.getTracks().forEach(t=>t.stop());
        setRecSec(0);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      recTimer.current = setInterval(()=>setRecSec(s=>s+1), 1000);
    } catch { alert('Microfono non disponibile'); }
  };

  const stopRecord = () => {
    mediaRef.current?.stop();
    if (recTimer.current) clearInterval(recTimer.current);
    setRecording(false);
  };

  const fmtRec = (s:number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ position:'relative', background:'#fff', borderTop:`1px solid ${DS.border}`, padding:'8px 10px', flexShrink:0 }}>
      {showEmoji && (
        <EmojiPicker
          onSelect={e=>{ setTesto(t=>t+e); inputRef.current?.focus(); }}
          onClose={()=>setShowEmoji(false)}
        />
      )}
      {showAttach && (
        <div style={{ position:'absolute', bottom:64, left:10, background:'#fff', border:`1.5px solid ${DS.border}`, borderRadius:12, padding:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:50, display:'flex', gap:8 }}>
          {[
            { label:'Foto',  icon:<Image size={20} color={DS.teal}/>,     color:DS.tealLight, action:()=>fotoRef.current?.click() },
            { label:'Video', icon:<Video size={20} color='#3B7FE0'/>,     color:'#DBEAFE',    action:()=>videoRef.current?.click() },
            { label:'File',  icon:<Paperclip size={20} color={DS.amber}/>,color:'#FEF3C7',    action:()=>fileRef.current?.click()  },
          ].map(b=>(
            <button key={b.label} onClick={b.action}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, background:b.color, border:`1px solid ${DS.border}`, borderRadius:10, padding:'10px 14px', cursor:'pointer' }}>
              {b.icon}
              <span style={{ fontSize:11, color:DS.textMid, fontFamily:DS.ui }}>{b.label}</span>
            </button>
          ))}
          <button onClick={()=>setShowAttach(false)}
            style={{ position:'absolute', top:-8, right:-8, width:20, height:20, borderRadius:'50%', background:DS.textMid, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={12} color="#fff"/>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fotoRef}  type="file" accept="image/*"  capture="environment" multiple style={{ display:'none' }} onChange={e=>handleFile(e,'foto')}/>
      <input ref={videoRef} type="file" accept="video/*"  capture="environment" style={{ display:'none' }} onChange={e=>handleFile(e,'video')}/>
      <input ref={fileRef}  type="file" accept="*/*" multiple style={{ display:'none' }} onChange={e=>handleFile(e,'file')}/>

      {recording ? (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:DS.red, animation:'pulse 1s infinite' }}/>
          <span style={{ fontFamily:DS.mono, color:DS.red, fontWeight:700, fontSize:15 }}>{fmtRec(recSec)}</span>
          <span style={{ flex:1, color:DS.textMid, fontSize:13 }}>Registrazione in corso...</span>
          <button onClick={stopRecord}
            style={{ background:DS.red, border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#fff', fontWeight:700, fontSize:13, boxShadow:`0 3px 0 0 ${DS.redDark}` }}>
            <MicOff size={15}/> Invia
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={()=>{ setShowAttach(s=>!s); setShowEmoji(false); }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, flexShrink:0 }}>
            <Paperclip size={22} color={showAttach?DS.teal:DS.textMid}/>
          </button>
          <button onClick={()=>{ setShowEmoji(s=>!s); setShowAttach(false); }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, flexShrink:0 }}>
            <Smile size={22} color={showEmoji?DS.teal:DS.textMid}/>
          </button>
          <input
            ref={inputRef}
            value={testo}
            onChange={e=>setTesto(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&handleSendText()}
            placeholder={placeholder}
            style={{ flex:1, padding:'10px 12px', border:`1.5px solid ${DS.border}`, borderRadius:22, fontSize:14, fontFamily:DS.ui, outline:'none', background:'#f8fefe' }}
          />
          {testo.trim() ? (
            <button onClick={handleSendText}
              style={{ width:42, height:42, borderRadius:'50%', background:DS.teal, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 3px 0 0 ${DS.tealDark}` }}>
              <Send size={17} color="#fff"/>
            </button>
          ) : (
            <button onPointerDown={startRecord}
              style={{ width:42, height:42, borderRadius:'50%', background:DS.tealLight, border:`1.5px solid ${DS.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Mic size={17} color={DS.teal}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── THREAD VIEW ─────────────────────────────────────────────────────────────
function ThreadView({
  msgs,
  onSend,
  commessaId,
}: {
  msgs: ChatMsg[];
  onSend: (testo:string, allegati?:Allegato[]) => void;
  commessaId: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const fasedMsgs = (Object.keys(FASI_META) as Fase[]).map(fase => ({
    fase,
    meta: FASI_META[fase],
    msgs: msgs.filter(m => m.fase === fase),
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <div style={{ padding:'5px 14px', background:DS.tealLight, borderBottom:`1px solid ${DS.border}`, fontSize:11, color:DS.textMid, flexShrink:0 }}>
        {commessaId} · thread commessa
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 4px' }}>
        {fasedMsgs.map(({ fase, meta, msgs:fm }) => {
          if (fm.length === 0 && meta.stato === 'attesa') return null;
          const col = meta.stato === 'fatto' ? DS.green : meta.stato === 'attivo' ? DS.teal : DS.textLight;
          const bg  = meta.stato === 'fatto' ? '#D1FAE5' : meta.stato === 'attivo' ? DS.tealLight : '#f3f4f6';
          const bc  = meta.stato === 'fatto' ? DS.green : meta.stato === 'attivo' ? DS.teal : DS.border;
          return (
            <div key={fase} style={{ marginBottom:10 }}>
              {/* Separatore fase */}
              <div style={{ display:'flex', alignItems:'center', gap:8, margin:'4px 0 10px' }}>
                <div style={{ flex:1, height:1, background:col }}/>
                <div style={{ background:bg, border:`1px solid ${bc}`, borderRadius:20, padding:'3px 10px', display:'flex', alignItems:'center', gap:5 }}>
                  {meta.stato==='fatto' && <Check size={10} color={DS.green}/>}
                  {meta.stato==='attivo' && <div style={{ width:7, height:7, borderRadius:'50%', background:DS.teal }}/>}
                  <span style={{ fontSize:11, fontWeight:700, color:col }}>{meta.label.toUpperCase()}</span>
                  {meta.stato==='attivo' && <span style={{ fontSize:10, color:DS.teal }}>← ora</span>}
                </div>
                <div style={{ flex:1, height:1, background:col }}/>
              </div>
              {fm.length === 0 && (
                <div style={{ color:DS.textLight, fontSize:12, textAlign:'center', marginBottom:8, fontStyle:'italic' }}>Nessun messaggio</div>
              )}
              {fm.map(msg => <Bubble key={msg.id} msg={msg}/>)}
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <InputBar onSend={onSend} placeholder="Scrivi al team commessa..."/>
    </div>
  );
}

// ─── DIRECT VIEW ─────────────────────────────────────────────────────────────
function DirectView({
  contatto,
  onSend,
  onBack,
}: {
  contatto: Contatto;
  onSend: (testo:string, allegati?:Allegato[]) => void;
  onBack: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [contatto.msgs]);

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <div style={{ padding:'8px 14px', background:DS.tealLight, borderBottom:`1px solid ${DS.border}`, display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}><ChevronLeft size={20} color={DS.teal}/></button>
        <div style={{ width:34, height:34, borderRadius:'50%', background:DS.teal, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#fff' }}>{contatto.avatar}</div>
        <div>
          <div style={{ fontWeight:700, color:DS.text, fontSize:14 }}>{contatto.nome}</div>
          <div style={{ fontSize:11, color:DS.textMid }}>{contatto.ruolo}</div>
        </div>
        <a href={`tel:+39340111222`} style={{ marginLeft:'auto', background:DS.tealLight, border:`1px solid ${DS.border}`, borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', gap:5, textDecoration:'none', color:DS.teal, fontSize:12, fontWeight:600 }}>
          <Phone size={13}/> Chiama
        </a>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 4px' }}>
        {contatto.msgs.length === 0 && (
          <div style={{ color:DS.textMid, fontSize:13, textAlign:'center', marginTop:48 }}>Inizia la conversazione</div>
        )}
        {contatto.msgs.map(msg => <Bubble key={msg.id} msg={msg}/>)}
        <div ref={bottomRef}/>
      </div>
      <InputBar onSend={onSend} placeholder={`Scrivi a ${contatto.nome}...`}/>
    </div>
  );
}

// ─── MAIN CHAT VIEW ───────────────────────────────────────────────────────────
// ─── NUOVO GRUPPO ────────────────────────────────────────────────────────────
function NuovoGruppo({contatti,onSave,onBack}:{contatti:Contatto[];onSave:(nome:string,membri:string[])=>void;onBack:()=>void}){
  const [nome,setNome]=useState('');
  const [selected,setSelected]=useState<string[]>([]);
  const toggle=(n:string)=>setSelected(s=>s.includes(n)?s.filter(x=>x!==n):[...s,n]);
  return(
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div style={{padding:'8px 14px',background:DS.tealLight,borderBottom:`1px solid ${DS.border}`,display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><ChevronLeft size={20} color={DS.teal}/></button>
        <div style={{fontWeight:700,color:DS.text,fontSize:15}}>Nuovo gruppo</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12}}>
        <div>
          <label style={{display:'block',fontSize:12,color:DS.textMid,marginBottom:6}}>Nome del gruppo</label>
          <input value={nome} onChange={e=>setNome(e.target.value)} autoFocus placeholder="Es. Squadra Brindisi, Team Rossi..."
            style={{width:'100%',padding:'11px 12px',border:`1.5px solid ${DS.border}`,borderRadius:10,fontSize:15,fontFamily:DS.ui,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <div style={{fontSize:12,color:DS.textMid,marginBottom:10}}>Aggiungi membri</div>
          {contatti.map(c=>{
            const sel=selected.includes(c.nome);
            return(
              <button key={c.id} onClick={()=>toggle(c.nome)}
                style={{display:'flex',gap:12,alignItems:'center',width:'100%',background:sel?DS.tealLight:'#fff',border:`1.5px solid ${sel?DS.teal:DS.border}`,borderRadius:12,padding:'12px 14px',cursor:'pointer',marginBottom:8}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'#fff',flexShrink:0}}>{c.avatar}</div>
                <div style={{flex:1,textAlign:'left'}}>
                  <div style={{fontWeight:700,color:DS.text}}>{c.nome}</div>
                  <div style={{fontSize:12,color:DS.textMid}}>{c.ruolo}</div>
                </div>
                <div style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${sel?DS.teal:DS.border}`,background:sel?DS.teal:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {sel&&<Check size={13} color="#fff"/>}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={()=>{if(nome.trim())onSave(nome.trim(),selected);}}
          disabled={!nome.trim()||selected.length===0}
          style={{background:nome.trim()&&selected.length>0?DS.teal:DS.tealLight,color:nome.trim()&&selected.length>0?'#fff':DS.textLight,border:'none',borderRadius:12,padding:'14px',fontFamily:DS.ui,fontWeight:700,fontSize:15,cursor:nome.trim()&&selected.length>0?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:nome.trim()&&selected.length>0?`0 4px 0 0 ${DS.tealDark}`:'none'}}>
          <Check size={16}/> Crea gruppo {selected.length>0?`(${selected.length+1} membri)`:''}
        </button>
      </div>
    </div>
  );
}

export default function ChatView() {
  const [thread, setThread]     = useState<ChatMsg[]>(THREAD_INIT);
  const [contacts, setContacts] = useState<Contatto[]>(CONTACTS_INIT);
  const [mode, setMode]         = useState<'thread'|'direct'|'gruppi'>('thread');
  const [directId, setDirectId] = useState<string|null>(null);
  const [gruppi, setGruppi]     = useState<Gruppo[]>(GRUPPI_INIT);
  const [gruppoId, setGruppoId] = useState<string|null>(null);
  const [showNewGruppo, setShowNewGruppo] = useState(false);

  const now = () => new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });

  const sendThread = (testo:string, allegati?:Allegato[]) => {
    if (!testo.trim() && !allegati?.length) return;
    setThread(m => [...m, { id:Date.now(), autore:OP.nome, testo, ora:now(), proprio:true, fase:'montaggio', allegati }]);
  };

  const sendDirect = (testo:string, allegati?:Allegato[]) => {
    if ((!testo.trim() && !allegati?.length) || !directId) return;
    const msg: ChatMsg = { id:Date.now(), autore:OP.nome, testo, ora:now(), proprio:true, fase:'montaggio', allegati };
    setContacts(cs => cs.map(c => c.id === directId ? { ...c, msgs:[...c.msgs, msg] } : c));
  };

  const sendGruppo = (id:string, testo:string, allegati?:Allegato[]) => {
    if (!testo.trim() && !allegati?.length) return;
    const msg: ChatMsg = {id:Date.now(),autore:OP.nome,testo,ora:now(),proprio:true,fase:'montaggio',allegati};
    setGruppi(gs=>gs.map(g=>g.id===id?{...g,msgs:[...g.msgs,msg]}:g));
  };

  const unread = contacts.reduce((a,c)=>a+c.msgs.filter(m=>!m.proprio).length, 0);
  const unreadGruppi = gruppi.reduce((a,g)=>a+g.msgs.filter(m=>!m.proprio).length,0);
  const dc = contacts.find(c=>c.id===directId);

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      {/* Sub-tabs */}
      <div style={{ background:DS.topbar, display:'flex', padding:'0 8px', flexShrink:0 }}>
        {(['thread','direct'] as const).map(m=>(
          <button key={m} onClick={()=>{ setMode(m); setDirectId(null); }}
            style={{ background:'none', border:'none', color:mode===m?DS.teal:'#8BBCBC', fontFamily:DS.ui, fontWeight:mode===m?700:400, fontSize:13, padding:'11px 16px', cursor:'pointer', borderBottom:mode===m?`2px solid ${DS.teal}`:'2px solid transparent', position:'relative' }}>
            {m==='thread'?'COMMESSA':'DIRETTO'}
            {m==='direct'&&unread>0&&(
              <span style={{ position:'absolute', top:8, right:4, width:17, height:17, borderRadius:'50%', background:DS.red, color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>
            )}
          </button>
        ))}
      </div>

      {mode==='thread' && (
        <ThreadView msgs={thread} onSend={sendThread} commessaId={COM_ID}/>
      )}

      {mode==='direct' && !directId && (
        <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ color:DS.textMid, fontSize:13, marginBottom:4 }}>Messaggi diretti</div>
          {contacts.map(c => {
            const u = c.msgs.filter(m=>!m.proprio).length;
            const lastMsg = c.msgs[c.msgs.length-1];
            return (
              <button key={c.id} onClick={()=>setDirectId(c.id)}
                style={{ background:'linear-gradient(145deg,#fff,#f4fcfc)', border:`1.5px solid ${u>0?DS.teal:DS.border}`, borderRadius:14, padding:14, cursor:'pointer', display:'flex', gap:12, alignItems:'center', width:'100%', textAlign:'left', boxShadow:'0 2px 8px rgba(40,160,160,.06)' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:DS.teal, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color:'#fff', flexShrink:0 }}>{c.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:DS.text, fontSize:15 }}>{c.nome}</div>
                  <div style={{ fontSize:12, color:DS.textMid, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {lastMsg ? lastMsg.testo || '📎 Allegato' : c.ruolo}
                  </div>
                </div>
                {u>0 && <div style={{ background:DS.teal, color:'#fff', borderRadius:'50%', width:22, height:22, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{u}</div>}
                <ArrowRight size={16} color={DS.textLight}/>
              </button>
            );
          })}
        </div>
      )}

      {mode==='gruppi' && !gruppoId && !showNewGruppo && (
        <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <span style={{color:DS.textMid,fontSize:13}}>I tuoi gruppi</span>
            <button onClick={()=>setShowNewGruppo(true)}
              style={{background:DS.teal,border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:5,color:'#fff',fontSize:12,fontWeight:700,boxShadow:`0 3px 0 0 ${DS.tealDark}`}}>
              <Plus size={13}/> Nuovo gruppo
            </button>
          </div>
          {gruppi.map(g=>{
            const u=g.msgs.filter(m=>!m.proprio).length;
            const last=g.msgs[g.msgs.length-1];
            return(
              <button key={g.id} onClick={()=>setGruppoId(g.id)}
                style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',border:`1.5px solid ${u>0?DS.teal:DS.border}`,borderRadius:14,padding:14,cursor:'pointer',display:'flex',gap:12,alignItems:'center',width:'100%',textAlign:'left',boxShadow:'0 2px 8px rgba(40,160,160,.06)'}}>
                <div style={{width:46,height:46,borderRadius:14,background:g.colore,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:'#fff',flexShrink:0,position:'relative'}}>
                  {g.avatar}
                  <div style={{position:'absolute',bottom:-3,right:-3,width:16,height:16,borderRadius:'50%',background:'#fff',border:`2px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:8,color:DS.textMid}}>{g.membri.length}</span>
                  </div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:DS.text,fontSize:15}}>{g.nome}</div>
                  <div style={{fontSize:12,color:DS.textMid,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {last?`${last.proprio?'Tu':last.autore.split(' ')[0]}: ${last.testo.slice(0,28)}…`:g.membri.join(', ')}
                  </div>
                </div>
                {u>0&&<div style={{background:DS.teal,color:'#fff',borderRadius:'50%',width:22,height:22,fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{u}</div>}
              </button>
            );
          })}
        </div>
      )}

      {mode==='gruppi' && showNewGruppo && (
        <NuovoGruppo
          contatti={contacts}
          onSave={(nome,membri)=>{
            const g:Gruppo={id:Date.now().toString(),nome,avatar:nome.slice(0,2).toUpperCase(),colore:['#28A0A0','#1A9E73','#3B7FE0','#D08008','#DC4444'][Math.floor(Math.random()*5)],membri:[OP.nome,...membri],msgs:[]};
            setGruppi(gs=>[...gs,g]);
            setShowNewGruppo(false);
            setGruppoId(g.id);
          }}
          onBack={()=>setShowNewGruppo(false)}
        />
      )}

      {mode==='gruppi' && gruppoId && (()=>{
        const g=gruppi.find(x=>x.id===gruppoId);
        if(!g)return null;
        return(
          <div style={{display:'flex',flexDirection:'column',flex:1}}>
            <div style={{padding:'8px 14px',background:DS.tealLight,borderBottom:`1px solid ${DS.border}`,display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
              <button onClick={()=>setGruppoId(null)} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><ChevronLeft size={20} color={DS.teal}/></button>
              <div style={{width:36,height:36,borderRadius:10,background:g.colore,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'#fff'}}>{g.avatar}</div>
              <div>
                <div style={{fontWeight:700,color:DS.text,fontSize:14}}>{g.nome}</div>
                <div style={{fontSize:11,color:DS.textMid}}>{g.membri.join(', ')}</div>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'12px 12px 4px',display:'flex',flexDirection:'column',gap:6}}>
              {g.msgs.length===0&&<div style={{color:DS.textMid,fontSize:13,textAlign:'center',marginTop:40}}>Nessun messaggio ancora</div>}
              {g.msgs.map(msg=>(
                <div key={msg.id} style={{display:'flex',justifyContent:msg.proprio?'flex-end':'flex-start'}}>
                  <div style={{maxWidth:'82%',background:msg.proprio?DS.teal:'#fff',borderRadius:msg.proprio?'14px 14px 4px 14px':'14px 14px 14px 4px',padding:'8px 12px',border:msg.proprio?'none':`1px solid ${DS.border}`}}>
                    {!msg.proprio&&<div style={{fontSize:11,color:DS.teal,fontWeight:700,marginBottom:2}}>{msg.autore}</div>}
                    <div style={{fontSize:14,color:msg.proprio?'#fff':DS.text,lineHeight:1.4}}>{msg.testo}</div>
                    {msg.allegati?.map((all,i)=><AllegatoPreview key={i} all={all} proprio={msg.proprio}/>)}
                    <div style={{fontSize:10,color:msg.proprio?'rgba(255,255,255,0.55)':DS.textLight,marginTop:3,textAlign:'right',display:'flex',alignItems:'center',justifyContent:'flex-end',gap:3}}>{msg.ora}{msg.proprio&&<Check size={10} color="rgba(255,255,255,0.6)"/>}</div>
                  </div>
                </div>
              ))}
            </div>
            <InputBar onSend={(t,a)=>sendGruppo(g.id,t,a)} placeholder={`Scrivi a ${g.nome}...`}/>
          </div>
        );
      })()}

      {mode==='direct' && directId && dc && (
        <DirectView contatto={dc} onSend={sendDirect} onBack={()=>setDirectId(null)}/>
      )}
    </div>
  );
}
