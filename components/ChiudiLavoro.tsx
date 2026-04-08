'use client';
import React, { useState, useRef, useCallback } from 'react';
import {
  Camera, Check, X, ChevronRight, ChevronLeft,
  Receipt, Pen, Send, AlertCircle, CheckCircle,
  Zap, Image, Plus, Trash2, RotateCcw, Clock,
  ArrowRight, Building2, FileText
} from 'lucide-react';

const DS = {
  topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

const card: React.CSSProperties = {
  background:'linear-gradient(145deg,#fff,#f4fcfc)',
  borderRadius:14, border:`1.5px solid ${DS.border}`,
  boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:16,
};

const btn = (bg:string, shadow:string, pressed=false): React.CSSProperties => ({
  background:bg, color:'#fff', border:'none', borderRadius:12,
  padding:'13px 20px', fontFamily:DS.ui, fontWeight:700, fontSize:15,
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
  boxShadow:pressed?'none':`0 5px 0 0 ${shadow}`,
  transform:pressed?'translateY(4px)':'translateY(0)',
  transition:'box-shadow 80ms,transform 80ms', width:'100%',
});

// ─── TIPI ─────────────────────────────────────────────────────────────────────
type Step = 'foto'|'spese'|'firma'|'sync'|'done';

interface FotoLavoro {
  id: number;
  dataUrl: string;
  nome: string;
  timestamp: string;
}

interface Spesa {
  id: number;
  descrizione: string;
  importo: string;
  fotoUrl?: string;
  categoria: 'materiale'|'carburante'|'vitto'|'altro';
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
const STEPS: {id:Step; label:string; icon:React.ReactNode}[] = [
  {id:'foto',  label:'Foto',   icon:<Camera size={14}/>},
  {id:'spese', label:'Spese',  icon:<Receipt size={14}/>},
  {id:'firma', label:'Firma',  icon:<Pen size={14}/>},
  {id:'sync',  label:'Sync',   icon:<ArrowRight size={14}/>},
];

function StepBar({current}:{current:Step}){
  const idx = STEPS.findIndex(s=>s.id===current);
  return(
    <div style={{display:'flex',alignItems:'center',padding:'12px 16px',background:'#f8fefe',borderBottom:`1px solid ${DS.border}`}}>
      {STEPS.map((s,i)=>(
        <React.Fragment key={s.id}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <div style={{
              width:30,height:30,borderRadius:'50%',
              background:i<idx?DS.green:i===idx?DS.teal:'#e5e7eb',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#fff',
              boxShadow:i===idx?`0 0 0 4px rgba(40,160,160,0.2)`:'none',
            }}>
              {i<idx?<Check size={14}/>:s.icon}
            </div>
            <span style={{fontSize:9,color:i<=idx?DS.teal:DS.textLight,fontWeight:i===idx?700:400}}>{s.label}</span>
          </div>
          {i<STEPS.length-1&&<div style={{flex:1,height:2,background:i<idx?DS.green:DS.border,margin:'0 6px',marginBottom:14}}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── STEP 1: FOTO PROOF OF WORK ───────────────────────────────────────────────
function StepFoto({commessaId, vani, onNext}:{commessaId:string; vani:{nome:string}[]; onNext:(foto:FotoLavoro[])=>void}){
  const [foto, setFoto] = useState<FotoLavoro[]>([]);
  const [bpId, setBpId] = useState('');
  const fotoRef = useRef<HTMLInputElement>(null);

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setFoto(prev=>[...prev, {
          id: Date.now()+Math.random(),
          dataUrl: ev.target?.result as string,
          nome: file.name,
          timestamp: new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}),
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const canProceed = foto.length >= vani.length;

  return(
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:14}}>
      <div style={card}>
        <div style={{fontWeight:700,color:DS.text,fontSize:16,marginBottom:6}}>
          Foto stato finale — {commessaId}
        </div>
        <div style={{fontSize:13,color:DS.textMid,marginBottom:12,lineHeight:1.5}}>
          Scatta almeno <strong>{vani.length} foto</strong> — una per vano completato.
          Queste foto sono la prova del lavoro eseguito e vengono allegate al verbale di collaudo.
        </div>
        {/* Checklist vani */}
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
          {vani.map((v,i)=>{
            const hasFoto = foto.length > i;
            return(
              <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 10px',borderRadius:8,background:hasFoto?'#D1FAE5':'#f3f4f6',border:`1px solid ${hasFoto?DS.green:DS.border}`}}>
                {hasFoto?<CheckCircle size={16} color={DS.green}/>:<AlertCircle size={16} color={DS.textLight}/>}
                <span style={{fontSize:13,color:hasFoto?DS.green:DS.textMid,fontWeight:hasFoto?600:400}}>{v.nome}</span>
                {hasFoto&&<span style={{marginLeft:'auto',fontSize:11,color:DS.green}}>{foto[i]?.timestamp}</span>}
              </div>
            );
          })}
        </div>
        {/* Griglia foto */}
        {foto.length>0&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
            {foto.map(f=>(
              <div key={f.id} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'1',border:`1.5px solid ${DS.border}`}}>
                <img src={f.dataUrl} alt={f.nome} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                <button onClick={()=>setFoto(prev=>prev.filter(x=>x.id!==f.id))}
                  style={{position:'absolute',top:3,right:3,width:22,height:22,borderRadius:'50%',background:'rgba(0,0,0,0.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <X size={12} color="#fff"/>
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Bottone fotocamera */}
        <input ref={fotoRef} type="file" accept="image/*" capture="environment" multiple style={{display:'none'}} onChange={handleFile}/>
        <button onClick={()=>fotoRef.current?.click()}
          style={{background:DS.tealLight,border:`2px dashed ${DS.teal}`,borderRadius:10,padding:'12px',width:'100%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,color:DS.teal,fontWeight:700,fontSize:14,fontFamily:DS.ui}}>
          <Camera size={18}/> {foto.length===0?'Scatta foto cantiere':foto.length<vani.length?`Aggiungi ancora ${vani.length-foto.length} foto`:'Aggiungi altra foto'}
        </button>
      </div>

      {!canProceed&&(
        <div style={{background:'#FEF3C7',border:`1px solid #F0D040`,borderRadius:10,padding:'10px 14px',fontSize:13,color:DS.amber,display:'flex',gap:8,alignItems:'center'}}>
          <AlertCircle size={14}/> Obbligatorio: {vani.length-foto.length} foto mancanti prima di procedere
        </div>
      )}

      <button disabled={!canProceed}
        onPointerDown={()=>setBpId('f-next')} onPointerUp={()=>{setBpId('');if(canProceed)onNext(foto);}}
        style={{...btn(canProceed?DS.teal:'#e5e7eb',canProceed?DS.tealDark:'#ccc',bpId==='f-next'),color:canProceed?'#fff':DS.textLight}}>
        <Check size={16}/> Foto complete — vai a Spese
      </button>
    </div>
  );
}

// ─── STEP 2: MASTRO SPESE ─────────────────────────────────────────────────────
const CAT_LABELS: Record<Spesa['categoria'],string> = {
  materiale:'Materiale extra', carburante:'Carburante', vitto:'Pasto/Vitto', altro:'Altro'
};

function StepSpese({onNext, onSkip}:{onNext:(spese:Spesa[])=>void; onSkip:()=>void}){
  const [spese, setSpese] = useState<Spesa[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc]   = useState('');
  const [importo, setImporto] = useState('');
  const [cat, setCat]     = useState<Spesa['categoria']>('materiale');
  const [fotoSpesa, setFotoSpesa] = useState<string|null>(null);
  const [bpId, setBpId]   = useState('');
  const scontrinoRef      = useRef<HTMLInputElement>(null);

  const handleScontrino = (e:React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setFotoSpesa(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const addSpesa = () => {
    if (!desc.trim() || !importo) return;
    setSpese(prev=>[...prev,{id:Date.now(),descrizione:desc.trim(),importo,categoria:cat,fotoUrl:fotoSpesa??undefined}]);
    setDesc(''); setImporto(''); setFotoSpesa(null); setShowForm(false);
  };

  const totale = spese.reduce((a,s)=>a+parseFloat(s.importo||'0'),0);

  return(
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:14}}>
      <div style={card}>
        <div style={{fontWeight:700,color:DS.text,fontSize:16,marginBottom:6}}>MASTRO SPESE</div>
        <div style={{fontSize:13,color:DS.textMid,marginBottom:12}}>
          Hai sostenuto spese? Aggiungile — vanno in coda di approvazione al titolare.
        </div>
        {spese.length>0&&(
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
            {spese.map(s=>(
              <div key={s.id} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 12px',borderRadius:10,background:DS.tealLight,border:`1px solid ${DS.border}`}}>
                {s.fotoUrl&&<img src={s.fotoUrl} alt="scontrino" style={{width:36,height:36,borderRadius:6,objectFit:'cover',flexShrink:0}}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,color:DS.text,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.descrizione}</div>
                  <div style={{fontSize:11,color:DS.textMid}}>{CAT_LABELS[s.categoria]}</div>
                </div>
                <div style={{fontFamily:DS.mono,fontWeight:700,color:DS.text,fontSize:14}}>€{parseFloat(s.importo).toFixed(2)}</div>
                <button onClick={()=>setSpese(prev=>prev.filter(x=>x.id!==s.id))} style={{background:'none',border:'none',cursor:'pointer',padding:2}}>
                  <Trash2 size={14} color={DS.red}/>
                </button>
              </div>
            ))}
            <div style={{textAlign:'right',fontFamily:DS.mono,fontWeight:700,color:DS.text,fontSize:15,paddingRight:4}}>
              Totale: €{totale.toFixed(2)}
            </div>
          </div>
        )}

        {showForm?(
          <div style={{background:'#f8fefe',border:`1.5px solid ${DS.teal}`,borderRadius:10,padding:12}}>
            <input value={desc} onChange={e=>setDesc(e.target.value)} autoFocus placeholder="Descrizione spesa..."
              style={{width:'100%',padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',marginBottom:8,boxSizing:'border-box'}}/>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <div style={{position:'relative',width:100}}>
                <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:DS.textMid,fontSize:14}}>€</span>
                <input type="number" value={importo} onChange={e=>setImporto(e.target.value)} placeholder="0.00" step="0.01" min="0"
                  style={{width:'100%',padding:'9px 10px 9px 22px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.mono,outline:'none',boxSizing:'border-box'}}/>
              </div>
              <select value={cat} onChange={e=>setCat(e.target.value as Spesa['categoria'])}
                style={{flex:1,padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:13,fontFamily:DS.ui,outline:'none',background:'#fff'}}>
                {(Object.keys(CAT_LABELS) as Spesa['categoria'][]).map(k=>(
                  <option key={k} value={k}>{CAT_LABELS[k]}</option>
                ))}
              </select>
            </div>
            {/* Foto scontrino */}
            <input ref={scontrinoRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleScontrino}/>
            <button onClick={()=>scontrinoRef.current?.click()}
              style={{background:fotoSpesa?DS.tealLight:'#fff',border:`1.5px dashed ${fotoSpesa?DS.teal:DS.border}`,borderRadius:8,padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,color:fotoSpesa?DS.teal:DS.textMid,fontSize:13,fontFamily:DS.ui,width:'100%',justifyContent:'center',marginBottom:8}}>
              <Camera size={14}/> {fotoSpesa?'Scontrino allegato ✓':'Foto scontrino (opzionale)'}
            </button>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setShowForm(false);setDesc('');setImporto('');setFotoSpesa(null);}}
                style={{flex:1,background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:8,padding:'9px',cursor:'pointer',color:DS.teal,fontWeight:600,fontSize:13,fontFamily:DS.ui}}>
                Annulla
              </button>
              <button onClick={addSpesa} disabled={!desc.trim()||!importo}
                style={{flex:2,background:desc.trim()&&importo?DS.teal:'#e5e7eb',border:'none',borderRadius:8,padding:'9px',cursor:desc.trim()&&importo?'pointer':'default',color:desc.trim()&&importo?'#fff':DS.textLight,fontWeight:700,fontSize:13,fontFamily:DS.ui,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                <Plus size={14}/> Aggiungi spesa
              </button>
            </div>
          </div>
        ):(
          <button onClick={()=>setShowForm(true)}
            style={{background:'#fff',border:`1.5px dashed ${DS.border}`,borderRadius:10,padding:'11px',width:'100%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,color:DS.textMid,fontSize:14,fontFamily:DS.ui,fontWeight:600}}>
            <Plus size={16}/> Aggiungi spesa
          </button>
        )}
      </div>

      <div style={{display:'flex',gap:10}}>
        <button onClick={onSkip}
          style={{flex:1,background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:12,padding:'12px',cursor:'pointer',color:DS.teal,fontWeight:700,fontSize:14,fontFamily:DS.ui}}>
          Nessuna spesa
        </button>
        <button onClick={()=>onNext(spese)}
          onPointerDown={()=>setBpId('s-next')} onPointerUp={()=>setBpId('')}
          style={{...btn(DS.teal,DS.tealDark,bpId==='s-next'),flex:2}}>
          <Check size={16}/> {spese.length>0?`Invia ${spese.length} spese`:'Avanti'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: FIRMA DIGITALE ───────────────────────────────────────────────────
function StepFirma({commessaId, cliente, onNext}:{commessaId:string; cliente:string; onNext:(firmaUrl:string)=>void}){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const [hasFirma, setHasFirma] = useState(false);
  const [bpId, setBpId] = useState('');

  const getPos = (e:React.PointerEvent, canvas:HTMLCanvasElement):{x:number;y:number} => {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    return {x:(e.clientX-r.left)*scaleX, y:(e.clientY-r.top)*scaleY};
  };

  const onStart = (e:React.PointerEvent) => {
    const c = canvasRef.current; if(!c)return;
    drawing.current = true;
    const ctx = c.getContext('2d')!;
    const p = getPos(e,c);
    ctx.beginPath(); ctx.moveTo(p.x,p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e:React.PointerEvent) => {
    if(!drawing.current) return;
    const c = canvasRef.current; if(!c)return;
    const ctx = c.getContext('2d')!;
    ctx.strokeStyle = DS.teal; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = getPos(e,c);
    ctx.lineTo(p.x,p.y); ctx.stroke();
    setHasFirma(true);
  };
  const onEnd = () => { drawing.current = false; };
  const clear = () => {
    const c = canvasRef.current; if(!c)return;
    c.getContext('2d')!.clearRect(0,0,c.width,c.height);
    setHasFirma(false);
  };

  const submit = () => {
    const c = canvasRef.current; if(!c||!hasFirma)return;
    onNext(c.toDataURL('image/png'));
  };

  return(
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:14}}>

      {/* ── VERBALE DI COLLAUDO ── */}
      <div style={{...card,border:`2px solid ${DS.teal}`}}>
        {/* Intestazione azienda */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${DS.border}`}}>
          <div>
            <div style={{fontWeight:800,color:DS.topbar,fontSize:15}}>Walter Cozza Serramenti</div>
            <div style={{fontSize:11,color:DS.textMid,marginTop:2}}>Via Esempio 1 · Cosenza · P.IVA 01234567890</div>
          </div>
          <div style={{background:DS.teal,color:'#fff',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700}}>COLLAUDO</div>
        </div>
        {/* Dati commessa */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14,fontSize:12}}>
          <div><span style={{color:DS.textMid}}>Commessa</span><br/><strong style={{fontFamily:DS.mono,color:DS.text}}>{commessaId}</strong></div>
          <div><span style={{color:DS.textMid}}>Cliente</span><br/><strong style={{color:DS.text}}>{cliente}</strong></div>
          <div><span style={{color:DS.textMid}}>Data collaudo</span><br/><strong style={{color:DS.text}}>{new Date().toLocaleDateString('it-IT')}</strong></div>
          <div><span style={{color:DS.textMid}}>Operatore</span><br/><strong style={{color:DS.text}}>Marco Vito</strong></div>
        </div>
        {/* Lavori eseguiti */}
        <div style={{fontWeight:700,color:DS.text,fontSize:13,marginBottom:8}}>Lavori eseguiti</div>
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
          {VANI_MOCK.map((v,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'#f4fcfc',borderRadius:8,border:`1px solid ${DS.border}`}}>
              <CheckCircle size={16} color={DS.green}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:DS.text,fontSize:13}}>{v.nome}</div>
                <div style={{fontSize:11,color:DS.textMid}}>Installazione completata</div>
              </div>
              <div style={{fontSize:10,color:DS.green,fontWeight:700}}>✓ OK</div>
            </div>
          ))}
        </div>
        {/* Dichiarazione */}
        <div style={{background:'#f0fff8',borderRadius:8,padding:'10px 12px',border:`1px solid ${DS.green}22`,fontSize:12,color:DS.textMid,lineHeight:1.6,marginBottom:14}}>
          Il sottoscritto <strong>{cliente}</strong> dichiara di aver verificato i lavori elencati e di approvarli come eseguiti a regola d'arte, conformemente al preventivo approvato. Il verbale firmato verrà inviato via email.
        </div>
        {/* Canvas firma */}
        <div style={{fontWeight:700,color:DS.text,fontSize:13,marginBottom:8}}>Firma del cliente</div>
        <div style={{border:`2px solid ${hasFirma?DS.teal:DS.border}`,borderRadius:12,overflow:'hidden',marginBottom:8,background:'#fafffe',position:'relative'}}>
          {!hasFirma&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <span style={{color:DS.textLight,fontSize:14,fontStyle:'italic'}}>Firma qui</span>
            </div>
          )}
          <canvas ref={canvasRef} width={600} height={160}
            style={{width:'100%',height:160,display:'block',touchAction:'none',cursor:'crosshair'}}
            onPointerDown={onStart} onPointerMove={onMove} onPointerUp={onEnd} onPointerLeave={onEnd}/>
        </div>
        <button onClick={clear}
          style={{background:'none',border:'none',cursor:'pointer',color:DS.textMid,fontSize:12,display:'flex',alignItems:'center',gap:5,padding:'2px 0',marginBottom:4}}>
          <RotateCcw size={12}/> Cancella e rifai
        </button>
      </div>

      {!hasFirma&&(
        <div style={{background:'#FEF3C7',border:`1px solid #F0D040`,borderRadius:10,padding:'10px 14px',fontSize:13,color:DS.amber,display:'flex',gap:8,alignItems:'center'}}>
          <AlertCircle size={14}/> Il cliente deve firmare per procedere
        </div>
      )}

      <button disabled={!hasFirma}
        onPointerDown={()=>setBpId('firma-ok')} onPointerUp={()=>{setBpId('');submit();}}
        style={{...btn(hasFirma?DS.green:'#e5e7eb',hasFirma?DS.greenDark:'#ccc',bpId==='firma-ok'),color:hasFirma?'#fff':DS.textLight}}>
        <CheckCircle size={16}/> Firma e invia verbale
      </button>
    </div>
  );
}

// ─── STEP 4: SYNC ERP ─────────────────────────────────────────────────────────
function StepSync({commessaId, nFoto, nSpese, hasFirma, onDone}:{
  commessaId:string; nFoto:number; nSpese:number; hasFirma:boolean; onDone:()=>void;
}){
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [steps, setSteps] = useState([
    {id:'foto',   label:`Caricamento ${nFoto} foto`,          done:false, color:DS.teal},
    {id:'firma',  label:'Firma digitale salvata',              done:false, color:DS.teal},
    {id:'pdf',    label:'Verbale di collaudo generato',        done:false, color:DS.teal},
    {id:'email',  label:'Invio email al cliente',              done:false, color:DS.teal},
    {id:'erp',    label:'Commessa avanzata → Fattura in ERP',  done:false, color:DS.green},
    ...(nSpese>0?[{id:'spese', label:`${nSpese} spese in coda approvazione`, done:false, color:DS.amber}]:[]),
  ]);
  const [bpId, setBpId] = useState('');

  const startSync = async () => {
    setSyncing(true);
    for (let i=0; i<steps.length; i++) {
      await new Promise(r=>setTimeout(r, 600+Math.random()*400));
      setSteps(prev=>prev.map((s,j)=>j===i?{...s,done:true}:s));
    }
    setSyncDone(true);
    setSyncing(false);
  };

  if (syncDone) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,gap:16}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:'#D1FAE5',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <CheckCircle size={38} color={DS.green}/>
      </div>
      <div style={{textAlign:'center'}}>
        <div style={{fontWeight:700,color:DS.text,fontSize:20,marginBottom:6}}>Lavoro completato!</div>
        <div style={{color:DS.textMid,fontSize:14,lineHeight:1.6}}>
          Commessa <strong>{commessaId}</strong> chiusa.<br/>
          L'ufficio ha ricevuto tutto automaticamente.<br/>
          La commessa è avanzata a <strong style={{color:DS.teal}}>Fatturazione</strong>.
        </div>
      </div>
      <button onPointerDown={()=>setBpId('done')} onPointerUp={()=>{setBpId('');onDone();}}
        style={{...btn(DS.teal,DS.tealDark,bpId==='done'),marginTop:8}}>
        <Check size={16}/> Torna alla Home
      </button>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:14}}>
      <div style={card}>
        <div style={{fontWeight:700,color:DS.text,fontSize:16,marginBottom:14}}>Riepilogo lavoro</div>
        {[
          {icon:<Image size={14} color={DS.teal}/>,    label:`${nFoto} foto cantiere`,        val:nFoto>0?'✓':'—'},
          {icon:<Pen size={14} color={DS.teal}/>,      label:'Firma cliente',                  val:hasFirma?'✓':'—'},
          {icon:<Receipt size={14} color={DS.amber}/>, label:`${nSpese} spese da approvare`,   val:nSpese>0?`€?`:'0'},
          {icon:<Building2 size={14} color={DS.green}/>,label:'Prossima fase ERP',             val:'Fattura'},
        ].map((r,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:i<3?`1px solid ${DS.border}`:'none'}}>
            {r.icon}
            <span style={{flex:1,fontSize:13,color:DS.textMid}}>{r.label}</span>
            <span style={{fontWeight:700,color:DS.text,fontSize:14}}>{r.val}</span>
          </div>
        ))}
      </div>

      {/* Log sync */}
      {(syncing||syncDone)&&(
        <div style={card}>
          <div style={{fontWeight:600,color:DS.text,fontSize:13,marginBottom:10}}>Sincronizzazione in corso...</div>
          {steps.map(s=>(
            <div key={s.id} style={{display:'flex',gap:10,alignItems:'center',padding:'6px 0'}}>
              <div style={{width:18,height:18,borderRadius:'50%',background:s.done?s.color:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background 300ms'}}>
                {s.done&&<Check size={11} color="#fff"/>}
              </div>
              <span style={{fontSize:13,color:s.done?DS.text:DS.textLight,transition:'color 300ms'}}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {!syncing&&!syncDone&&(
        <button onPointerDown={()=>setBpId('sync')} onPointerUp={()=>{setBpId('');startSync();}}
          style={{...btn(DS.green,DS.greenDark,bpId==='sync')}}>
          <Send size={16}/> Chiudi e sincronizza con ERP
        </button>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const VANI_MOCK = [
  {nome:'Finestra Camera'},
  {nome:'Porta Balcone'},
  {nome:'Finestra Bagno'},
];

interface Props {
  commessaId?: string;
  cliente?: string;
  onClose: () => void;
  inline?: boolean;
}

export default function ChiudiLavoro({ commessaId='COM-2024-047', cliente='Fam. Rossi', onClose, inline=false }:Props) {
  const [step, setStep] = useState<Step>('foto');
  const [foto, setFoto] = useState<FotoLavoro[]>([]);
  const [spese, setSpese] = useState<Spesa[]>([]);
  const [firmaUrl, setFirmaUrl] = useState('');

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F2F9F9'}}>
      {/* Header — nascosto se inline */}
      {!inline&&(
      <div style={{background:DS.topbar,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:2}}>
          <ChevronLeft size={22} color="#fff"/>
        </button>
        <div>
          <div style={{color:'#fff',fontWeight:700,fontSize:15}}>Chiudi lavoro</div>
          <div style={{color:'#8BBCBC',fontSize:11}}>{commessaId} · {cliente}</div>
        </div>
        <div style={{marginLeft:'auto',background:'rgba(40,160,160,0.2)',borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700,color:DS.teal}}>
          Collaudo
        </div>
      </div>
      )}
      <StepBar current={step}/>

      {step==='foto'&&<StepFoto commessaId={commessaId} vani={VANI_MOCK} onNext={f=>{setFoto(f);setStep('spese');}}/>}
      {step==='spese'&&<StepSpese onNext={s=>{setSpese(s);setStep('firma');}} onSkip={()=>setStep('firma')}/>}
      {step==='firma'&&<StepFirma commessaId={commessaId} cliente={cliente} onNext={url=>{setFirmaUrl(url);setStep('sync');}}/>}
      {step==='sync'&&<StepSync commessaId={commessaId} nFoto={foto.length} nSpese={spese.length} hasFirma={!!firmaUrl} onDone={onClose}/>}
    </div>
  );
}
// cb
