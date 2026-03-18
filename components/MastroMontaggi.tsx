"use client";
// @ts-nocheck
// MASTRO MONTAGGI â€” App satellite per montatori
// Deploy: mastro-montaggi.vercel.app
// Login: PIN 4 cifre
// Device: smartphone ottimizzato, offline-ready

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// â”€â”€â”€ DESIGN SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TEAL = "#1A9E73";
const DARK = "#1A1A1C";
const RED  = "#DC4444";
const AMBER = "#E8A020";
const BLUE = "#3B7FE0";
const PURPLE = "#8B5CF6";
const FF = "Inter, system-ui, sans-serif";
const FM = "JetBrains Mono, monospace";

// â”€â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Montaggio {
  id: string;
  cmId: string;
  code: string;
  cliente: string;
  cognome?: string;
  indirizzo: string;
  comune: string;
  data: string;
  oraInizio?: string;
  oraFine?: string;
  stato: "programmato" | "in_corso" | "completato" | "bloccato";
  urgenza?: boolean;
  squadra?: string;
  operatori?: string[];
  vani?: any[];
  misure?: any;
  note?: string;
  checklist?: ChecklistItem[];
  foto?: Foto[];
  materialiRichiesti?: RichiestaMateriale[];
  tempoStimato?: number; // minuti
  tempoReale?: number;
}

interface ChecklistItem {
  id: string;
  testo: string;
  fatto: boolean;
  obbligatorio: boolean;
  fase: "carico" | "posa" | "scarico" | "collaudo";
}

interface Foto {
  id: string;
  url: string;
  fase: string;
  vanoId?: string;
  nota?: string;
  ts: string;
}

interface RichiestaMateriale {
  id: string;
  desc: string;
  qty: number;
  um: string;
  urgenza: "normale" | "urgente" | "bloccante";
  note?: string;
  disegno?: string; // base64
  fotoUrl?: string;
  stato: "inviata" | "confermata" | "spedita";
  ts: string;
}

// â”€â”€â”€ CHECKLIST DEFAULT (configurabile per azienda) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CHECKLIST_DEFAULT: ChecklistItem[] = [
  // CARICO
  { id:"c1", testo:"Verifica materiali in magazzino", fatto:false, obbligatorio:true,  fase:"carico" },
  { id:"c2", testo:"Carico su furgone completato",    fatto:false, obbligatorio:true,  fase:"carico" },
  { id:"c3", testo:"DPI caricati (guanti, occhiali)", fatto:false, obbligatorio:true,  fase:"carico" },
  { id:"c4", testo:"Attrezzi e consumabili",          fatto:false, obbligatorio:false, fase:"carico" },
  { id:"c5", testo:"Scheda tecnica vani stampata",    fatto:false, obbligatorio:false, fase:"carico" },
  // POSA
  { id:"p1", testo:"Sopralluogo vani confermato",     fatto:false, obbligatorio:true,  fase:"posa" },
  { id:"p2", testo:"Smontaggio infissi vecchi",       fatto:false, obbligatorio:false, fase:"posa" },
  { id:"p3", testo:"Posa vano 1 completata",          fatto:false, obbligatorio:true,  fase:"posa" },
  { id:"p4", testo:"Sigillatura e rifinitura",        fatto:false, obbligatorio:true,  fase:"posa" },
  { id:"p5", testo:"Regolazione apertura/chiusura",   fatto:false, obbligatorio:true,  fase:"posa" },
  { id:"p6", testo:"Pulizia vani al termine",         fatto:false, obbligatorio:false, fase:"posa" },
  // COLLAUDO
  { id:"q1", testo:"Test apertura ogni anta",         fatto:false, obbligatorio:true,  fase:"collaudo" },
  { id:"q2", testo:"Verifica guarnizioni",            fatto:false, obbligatorio:true,  fase:"collaudo" },
  { id:"q3", testo:"Test tapparelle/veneziane",       fatto:false, obbligatorio:false, fase:"collaudo" },
  { id:"q4", testo:"Verifica zanzariere",             fatto:false, obbligatorio:false, fase:"collaudo" },
  { id:"q5", testo:"Nessuna infiltrazione visibile",  fatto:false, obbligatorio:true,  fase:"collaudo" },
  // SCARICO
  { id:"s1", testo:"Materiale eccedente riconsegnato",fatto:false, obbligatorio:true,  fase:"scarico" },
  { id:"s2", testo:"Imballi e rifiuti smaltiti",      fatto:false, obbligatorio:true,  fase:"scarico" },
  { id:"s3", testo:"Firma cliente acquisita",         fatto:false, obbligatorio:true,  fase:"scarico" },
  { id:"s4", testo:"Foto finali scattate",            fatto:false, obbligatorio:true,  fase:"scarico" },
];

// â”€â”€â”€ DEMO DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MONTAGGI_DEMO: Montaggio[] = [
  {
    id:"m1", cmId:"cm001", code:"S-0042",
    cliente:"Anna", cognome:"Russo", indirizzo:"Via Roma 12", comune:"Cosenza",
    data: new Date().toISOString().split("T")[0],
    oraInizio:"08:30", oraFine:"16:00",
    stato:"programmato", urgenza:false,
    operatori:["Marco","Luigi"],
    tempoStimato:450,
    note:"Cliente disponibile tutto il giorno. Accesso dal portone laterale.",
    vani:[
      {id:"v1",nome:"Salone",tipo:"Scorrevole HST",mis:"2400Ã—2200",col:"RAL 7016",uw:"1.1"},
      {id:"v2",nome:"Camera",tipo:"Finestra 2 ante",mis:"1400Ã—1400",col:"RAL 7016",uw:"1.3"},
      {id:"v3",nome:"Cameretta",tipo:"Finestra 1 anta",mis:"1000Ã—1200",col:"RAL 7016",uw:"1.3"},
      {id:"v4",nome:"Bagno",tipo:"Vasistas",mis:"600Ã—600",col:"RAL 9010",uw:"1.4"},
    ],
    checklist: JSON.parse(JSON.stringify(CHECKLIST_DEFAULT)),
    foto:[], materialiRichiesti:[],
  },
  {
    id:"m2", cmId:"cm002", code:"S-0039",
    cliente:"Mario", cognome:"Esposito", indirizzo:"Corso Mazzini 88", comune:"Rende",
    data: new Date(Date.now()+86400000).toISOString().split("T")[0],
    oraInizio:"09:00", oraFine:"13:00",
    stato:"programmato", urgenza:true,
    operatori:["Marco"],
    tempoStimato:240,
    note:"Solo mattina. 2 finestre piano terra.",
    vani:[
      {id:"v5",nome:"Cucina",tipo:"Finestra 2 ante",mis:"1200Ã—1400",col:"RAL 9010",uw:"1.3"},
      {id:"v6",nome:"Salotto",tipo:"Porta finestra",mis:"900Ã—2200",col:"RAL 9010",uw:"1.3"},
    ],
    checklist: JSON.parse(JSON.stringify(CHECKLIST_DEFAULT)),
    foto:[], materialiRichiesti:[],
  },
];

const CONTATTI_DEMO = [
  {ruolo:"Geometra misure", nome:"Paolo Greco",    tel:"333 1111111"},
  {ruolo:"Preventivista",   nome:"Fabio Cozza",    tel:"339 9999999"},
  {ruolo:"Responsabile ordini", nome:"Lidia Cozza",tel:"347 2222222"},
  {ruolo:"Magazziniere",    nome:"Antonio Bruno",  tel:"320 3333333"},
  {ruolo:"Responsabile prod.", nome:"Luigi Russo",  tel:"333 4444444"},
];

// â”€â”€â”€ LOGIN PIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LoginPIN({ onLogin }: { onLogin:(nome:string)=>void }) {
  const [pin, setPin] = useState("");
  const [errore, setErrore] = useState(false);

  const OPERATORI_PIN: Record<string,string> = {
    "1234":"Marco Vito",
    "5678":"Luigi Perri",
    "9012":"Antonio Bruno",
    "3456":"Sara Greco",
  };

  const pressNum = (n:string) => {
    if(pin.length>=4) return;
    const newPin = pin+n;
    setPin(newPin);
    setErrore(false);
    if(newPin.length===4) {
      setTimeout(()=>{
        const nome = OPERATORI_PIN[newPin];
        if(nome) { onLogin(nome); }
        else { setErrore(true); setPin(""); }
      },300);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",flexDirection:"column" as any,alignItems:"center",justifyContent:"center",padding:20,fontFamily:FF}}>
      <div style={{marginBottom:32,textAlign:"center" as any}}>
        <div style={{width:56,height:56,borderRadius:14,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff",margin:"0 auto 16px"}}>M</div>
        <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>MASTRO MONTAGGI</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:4}}>Inserisci il tuo PIN</div>
      </div>
      {/* Punti PIN */}
      <div style={{display:"flex",gap:14,marginBottom:32}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:16,height:16,borderRadius:"50%",background:i<pin.length?TEAL:"rgba(255,255,255,0.15)",transition:"background .15s"}}/>
        ))}
      </div>
      {errore&&<div style={{color:RED,fontSize:13,marginBottom:16,fontWeight:500}}>PIN non riconosciuto</div>}
      {/* Tastiera */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:240}}>
        {["1","2","3","4","5","6","7","8","9","","0","âŒ«"].map((n,i)=>(
          <div key={i} onClick={()=>{ if(n==="âŒ«"){setPin(p=>p.slice(0,-1));setErrore(false);}else if(n)pressNum(n); }}
            style={{height:64,borderRadius:14,background:n?"rgba(255,255,255,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:n==="âŒ«"?20:22,fontWeight:500,color:"#fff",cursor:n?"pointer":"default",userSelect:"none" as any,WebkitUserSelect:"none" as any,transition:"background .1s",fontFamily:n==="âŒ«"?FF:FM}}
            onTouchStart={e=>{if(n)(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.2)";}}
            onTouchEnd={e=>{if(n)(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.1)";}}
          >{n}</div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ SCHEDA VANO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SchedaVano({ vano }: { vano:any }) {
  return (
    <div style={{background:"#F8FAFC",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid #E5E3DC"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:14,fontWeight:600,color:DARK}}>{vano.nome}</span>
        <span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:TEAL+"15",color:TEAL,fontWeight:500}}>Uw {vano.uw}</span>
      </div>
      <div style={{fontSize:12,color:"#6B7280"}}>{vano.tipo}</div>
      <div style={{display:"flex",gap:12,marginTop:4}}>
        <span style={{fontSize:11,color:"#6B7280"}}>ðŸ“ {vano.mis} mm</span>
        <span style={{fontSize:11,color:"#6B7280"}}>ðŸŽ¨ {vano.col}</span>
      </div>
    </div>
  );
}

// â”€â”€â”€ CHECKLIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChecklistView({ items, onToggle, fase }: { items:ChecklistItem[]; onToggle:(id:string)=>void; fase:string }) {
  const filtered = items.filter(i=>i.fase===fase);
  const done = filtered.filter(i=>i.fatto).length;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5}}>{fase.charAt(0).toUpperCase()+fase.slice(1)}</span>
        <span style={{fontSize:11,color:done===filtered.length?TEAL:AMBER}}>{done}/{filtered.length}</span>
      </div>
      {filtered.map(item=>(
        <div key={item.id} onClick={()=>onToggle(item.id)}
          style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:10,marginBottom:6,background:item.fatto?TEAL+"08":"#fff",border:`1px solid ${item.fatto?TEAL+"30":"#E5E3DC"}`,cursor:"pointer",WebkitUserSelect:"none" as any}}>
          <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${item.fatto?TEAL:"#D1D5DB"}`,background:item.fatto?TEAL:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
            {item.fatto&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
          </div>
          <span style={{fontSize:13,color:item.fatto?"#6B7280":DARK,textDecoration:item.fatto?"line-through":"none",flex:1,lineHeight:1.4}}>{item.testo}</span>
          {item.obbligatorio&&!item.fatto&&<div style={{width:6,height:6,borderRadius:"50%",background:RED,flexShrink:0}}/>}
        </div>
      ))}
    </div>
  );
}

// â”€â”€â”€ RICHIESTA MATERIALI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RichiestaMaterialiForm({ onSave, onClose }: { onSave:(r:any)=>void; onClose:()=>void }) {
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [um, setUm] = useState("pz");
  const [urgenza, setUrgenza] = useState<"normale"|"urgente"|"bloccante">("normale");
  const [note, setNote] = useState("");
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({x:0,y:0});

  const startDraw = (e:any) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const t = e.touches?.[0]||e;
    lastPos.current = {x:t.clientX-rect.left, y:t.clientY-rect.top};
  };
  const draw = (e:any) => {
    if(!isDrawing||!canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d")!;
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0]||e;
    const x=t.clientX-rect.left, y=t.clientY-rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x,y);
    ctx.strokeStyle=DARK; ctx.lineWidth=2; ctx.lineCap="round";
    ctx.stroke();
    lastPos.current={x,y};
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if(ctx&&canvasRef.current) ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
  };

  const save = () => {
    if(!desc.trim()) return;
    const disegno = drawing&&canvasRef.current ? canvasRef.current.toDataURL() : undefined;
    onSave({ id:Date.now().toString(), desc, qty:parseInt(qty)||1, um, urgenza, note, disegno, stato:"inviata", ts:new Date().toISOString() });
  };

  const urgColors = { normale:TEAL, urgente:AMBER, bloccante:RED };

  return (
    <div style={{position:"fixed" as any,inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto" as any,fontFamily:FF}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:16,fontWeight:600,color:DARK}}>Richiesta materiali</span>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",border:"none",background:"#F4F6F8",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>Ã—</button>
        </div>
        {/* Urgenza */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {(["normale","urgente","bloccante"] as const).map(u=>(
            <div key={u} onClick={()=>setUrgenza(u)} style={{padding:"8px",borderRadius:9,border:`1.5px solid ${urgenza===u?urgColors[u]:"#E5E3DC"}`,background:urgenza===u?urgColors[u]+"10":"transparent",textAlign:"center" as any,cursor:"pointer"}}>
              <div style={{fontSize:16,marginBottom:2}}>{u==="normale"?"âœ…":u==="urgente"?"âš¡":"ðŸš¨"}</div>
              <div style={{fontSize:11,fontWeight:500,color:urgenza===u?urgColors[u]:DARK,textTransform:"capitalize" as any}}>{u}</div>
            </div>
          ))}
        </div>
        {/* Descrizione */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Cosa serve</div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Es. Lamiera angolare 200Ã—100 mm..." style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FF,outline:"none",color:DARK}}/>
        </div>
        {/* QuantitÃ  */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>QuantitÃ </div>
            <input type="number" value={qty} onChange={e=>setQty(e.target.value)} min="1" style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FM,outline:"none",color:DARK}}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>UnitÃ </div>
            <select value={um} onChange={e=>setUm(e.target.value)} style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FF,outline:"none",color:DARK,background:"#fff"}}>
              {["pz","ml","mq","kg","set","rotolo"].map(u=><option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        {/* Note */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Note aggiuntive</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Dimensioni, colore, riferimento commessa..." style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:13,fontFamily:FF,outline:"none",color:DARK,resize:"none" as any}}/>
        </div>
        {/* Disegno */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5}}>Schizzo / Disegno</div>
            <div style={{display:"flex",gap:6}}>
              <div onClick={()=>setDrawing(d=>!d)} style={{padding:"4px 10px",borderRadius:6,background:drawing?TEAL:DARK,color:"#fff",fontSize:11,fontWeight:500,cursor:"pointer"}}>{drawing?"Nascondi":"Disegna"}</div>
              {drawing&&<div onClick={clearCanvas} style={{padding:"4px 10px",borderRadius:6,background:"#F4F6F8",color:"#6B7280",fontSize:11,cursor:"pointer"}}>Cancella</div>}
            </div>
          </div>
          {drawing&&(
            <canvas ref={canvasRef} width={320} height={200}
              style={{width:"100%",height:200,border:"1px solid #E5E3DC",borderRadius:10,background:"#FAFAFA",touchAction:"none" as any,cursor:"crosshair"}}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            />
          )}
        </div>
        <button onClick={save} style={{width:"100%",padding:"14px",borderRadius:12,background:urgenza==="bloccante"?RED:urgenza==="urgente"?AMBER:TEAL,color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FF}}>
          {urgenza==="bloccante"?"ðŸš¨ Invia â€” URGENTISSIMO":urgenza==="urgente"?"âš¡ Invia urgente":"âœ“ Invia richiesta"}
        </button>
      </div>
    </div>
  );
}

// â”€â”€â”€ FIRMA CLIENTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FirmaCliente({ cliente, onFirma, onClose }: { cliente:string; onFirma:(dataUrl:string)=>void; onClose:()=>void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasFirma, setHasFirma] = useState(false);
  const last = useRef({x:0,y:0});

  const start = (e:any) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const t = e.touches?.[0]||e;
    last.current = {x:t.clientX-rect.left,y:t.clientY-rect.top};
  };
  const move = (e:any) => {
    if(!isDrawing||!canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d")!;
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0]||e;
    const x=t.clientX-rect.left,y=t.clientY-rect.top;
    ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(x,y);
    ctx.strokeStyle=DARK; ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.stroke();
    last.current={x,y}; setHasFirma(true);
  };
  const stop = () => setIsDrawing(false);
  const clear = () => {
    const ctx=canvasRef.current?.getContext("2d");
    if(ctx&&canvasRef.current){ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);setHasFirma(false);}
  };

  return (
    <div style={{position:"fixed" as any,inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:20,width:"100%",maxWidth:480,fontFamily:FF}}>
        <div style={{fontSize:16,fontWeight:600,color:DARK,marginBottom:4}}>Firma del cliente</div>
        <div style={{fontSize:13,color:"#6B7280",marginBottom:14}}>Il cliente {cliente} conferma la corretta installazione</div>
        <div style={{marginBottom:6,fontSize:11,color:"#6B7280"}}>Firma qui sotto</div>
        <canvas ref={canvasRef} width={440} height={180}
          style={{width:"100%",height:180,border:"2px solid #E5E3DC",borderRadius:12,background:"#FAFAFA",touchAction:"none" as any,cursor:"crosshair",display:"block"}}
          onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={move} onTouchEnd={stop}
        />
        <div style={{borderTop:"1px dashed #D1D5DB",margin:"8px 0",textAlign:"center" as any,fontSize:11,color:"#9CA3AF"}}>firma qui sopra</div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={clear} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #E5E3DC",background:"transparent",fontSize:13,color:"#6B7280",cursor:"pointer",fontFamily:FF}}>Cancella</button>
          <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #E5E3DC",background:"transparent",fontSize:13,color:"#6B7280",cursor:"pointer",fontFamily:FF}}>Annulla</button>
          <button onClick={()=>{if(hasFirma&&canvasRef.current)onFirma(canvasRef.current.toDataURL());}} disabled={!hasFirma}
            style={{flex:2,padding:"11px",borderRadius:10,background:hasFirma?TEAL:"#E5E3DC",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:hasFirma?"pointer":"not-allowed",fontFamily:FF}}>
            Conferma firma
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ DETTAGLIO MONTAGGIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DettaglioMontaggio({ m, operatore, onBack, onUpdate }: { m:Montaggio; operatore:string; onBack:()=>void; onUpdate:(m:Montaggio)=>void }) {
  const [tab, setTab] = useState<"info"|"vani"|"checklist"|"materiali"|"foto"|"team">("info");
  const [checkFase, setCheckFase] = useState<"carico"|"posa"|"collaudo"|"scarico">("carico");
  const [showRichiesta, setShowRichiesta] = useState(false);
  const [showFirma, setShowFirma] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(()=>{
    if(timerOn) timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  },[timerOn]);

  const fmtTimer=(s:number)=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const toggleCheck=(id:string)=>{
    const upd={...m,checklist:(m.checklist||[]).map(c=>c.id===id?{...c,fatto:!c.fatto}:c)};
    onUpdate(upd);
  };

  const aggiungiRichiesta=(r:any)=>{
    const upd={...m,materialiRichiesti:[...(m.materialiRichiesti||[]),r]};
    onUpdate(upd); setShowRichiesta(false);
  };

  const inizia=()=>{ onUpdate({...m,stato:"in_corso"}); setTimerOn(true); };
  const completa=()=>{ setShowFirma(true); };

  const statoInfo = {
    programmato:{ l:"Programmato", c:BLUE, bg:BLUE+"10" },
    in_corso:   { l:"In corso",    c:AMBER, bg:AMBER+"10" },
    completato: { l:"Completato",  c:TEAL, bg:TEAL+"10" },
    bloccato:   { l:"Bloccato",    c:RED,  bg:RED+"10" },
  }[m.stato];

  const checkDone=(fase:string)=>(m.checklist||[]).filter(c=>c.fase===fase&&c.fatto).length;
  const checkTot=(fase:string)=>(m.checklist||[]).filter(c=>c.fase===fase).length;

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:FF}}>
      {/* HEADER */}
      <div style={{background:DARK,padding:"14px 16px 0",position:"sticky" as any,top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>â€¹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{m.cliente} {m.cognome||""}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{m.code} Â· {m.comune} Â· {m.oraInizio}â€“{m.oraFine}</div>
          </div>
          <span style={{fontSize:11,fontWeight:500,padding:"3px 8px",borderRadius:100,background:statoInfo.bg,color:statoInfo.c}}>{statoInfo.l}</span>
        </div>
        {/* CTA principale */}
        {m.stato==="programmato"&&(
          <button onClick={inizia} style={{width:"100%",padding:"12px",borderRadius:"0 0 0 0",background:TEAL,color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FF,marginBottom:0}}>
            â–¶ Inizia montaggio
          </button>
        )}
        {m.stato==="in_corso"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
            <div style={{padding:"10px",textAlign:"center" as any,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:FM}}>{fmtTimer(timer)}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Tempo trascorso</div>
            </div>
            <button onClick={completa} style={{padding:"10px",background:TEAL,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FF,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
              âœ“ Completa
            </button>
          </div>
        )}
        {/* Tabs */}
        <div style={{display:"flex",overflowX:"auto" as any,scrollbarWidth:"none" as any,marginTop:m.stato==="programmato"||m.stato==="in_corso"?0:8}}>
          {[["info","Info"],["vani","Vani"],["checklist","Lista"],["materiali","Materiali"],["foto","Foto"],["team","Team"]].map(([id,l])=>(
            <div key={id} onClick={()=>setTab(id as any)} style={{padding:"10px 14px",fontSize:12,fontWeight:tab===id?600:400,color:tab===id?"#fff":"rgba(255,255,255,0.4)",borderBottom:`2px solid ${tab===id?TEAL:"transparent"}`,cursor:"pointer",whiteSpace:"nowrap" as any,flexShrink:0}}>
              {l}
              {id==="materiali"&&(m.materialiRichiesti||[]).length>0&&<span style={{marginLeft:4,fontSize:10,background:AMBER,color:"#fff",borderRadius:8,padding:"0 5px",fontWeight:700}}>{m.materialiRichiesti!.length}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* CONTENUTO TAB */}
      <div style={{padding:16}}>

        {tab==="info"&&<>
          {m.urgenza&&<div style={{background:RED+"10",border:`1px solid ${RED}30`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:18}}>ðŸš¨</span>
            <span style={{fontSize:13,fontWeight:500,color:RED}}>Montaggio urgente</span>
          </div>}
          {[
            {l:"Indirizzo",v:`${m.indirizzo}, ${m.comune}`},
            {l:"Data",v:m.data},
            {l:"Orario",v:`${m.oraInizio||"â€”"} â†’ ${m.oraFine||"â€”"}`},
            {l:"Tempo stimato",v:m.tempoStimato?`${Math.floor(m.tempoStimato/60)}h ${m.tempoStimato%60}m`:"â€”"},
            {l:"Vani da installare",v:`${(m.vani||[]).length}`},
            {l:"Operatori",v:(m.operatori||[]).join(", ")||"â€”"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,marginBottom:4,background:"#fff",border:"1px solid #E5E3DC"}}>
              <span style={{fontSize:13,color:"#6B7280"}}>{r.l}</span>
              <span style={{fontSize:13,fontWeight:500,color:DARK}}>{r.v}</span>
            </div>
          ))}
          {m.note&&<div style={{background:"#FFF8E7",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 14px",marginTop:8}}>
            <div style={{fontSize:11,fontWeight:600,color:AMBER,marginBottom:4}}>NOTE</div>
            <div style={{fontSize:13,color:DARK,lineHeight:1.5}}>{m.note}</div>
          </div>}
          {/* GPS */}
          <a href={`https://maps.google.com/?q=${encodeURIComponent(m.indirizzo+", "+m.comune)}`} target="_blank" rel="noreferrer"
            style={{display:"block",marginTop:12,padding:"12px",borderRadius:12,background:BLUE,color:"#fff",textAlign:"center" as any,textDecoration:"none",fontSize:14,fontWeight:600}}>
            ðŸ“ Apri in Google Maps
          </a>
        </>}

        {tab==="vani"&&<>
          <div style={{fontSize:13,color:"#6B7280",marginBottom:12}}>{(m.vani||[]).length} vani da installare</div>
          {(m.vani||[]).map((v:any)=><SchedaVano key={v.id} vano={v}/>)}
        </>}

        {tab==="checklist"&&<>
          {/* Selezione fase */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
            {(["carico","posa","collaudo","scarico"] as const).map(f=>{
              const done=checkDone(f), tot=checkTot(f);
              return (
                <div key={f} onClick={()=>setCheckFase(f)}
                  style={{padding:"8px 4px",borderRadius:10,border:`1.5px solid ${checkFase===f?TEAL:"#E5E3DC"}`,background:checkFase===f?TEAL+"08":"#fff",textAlign:"center" as any,cursor:"pointer"}}>
                  <div style={{fontSize:11,fontWeight:600,color:checkFase===f?TEAL:DARK,textTransform:"capitalize" as any}}>{f}</div>
                  <div style={{fontSize:10,color:done===tot?TEAL:"#9CA3AF",marginTop:2}}>{done}/{tot}</div>
                </div>
              );
            })}
          </div>
          <ChecklistView items={m.checklist||[]} onToggle={toggleCheck} fase={checkFase}/>
        </>}

        {tab==="materiali"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:DARK}}>Richieste materiali</span>
            <button onClick={()=>setShowRichiesta(true)} style={{padding:"8px 14px",borderRadius:9,background:TEAL,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FF}}>+ Richiedi</button>
          </div>
          {(m.materialiRichiesti||[]).length===0&&(
            <div style={{textAlign:"center" as any,padding:"40px 20px",color:"#9CA3AF"}}>
              <div style={{fontSize:32,marginBottom:8}}>ðŸ“¦</div>
              <div style={{fontSize:13}}>Nessuna richiesta inviata</div>
            </div>
          )}
          {(m.materialiRichiesti||[]).map((r:any,i:number)=>{
            const uc={normale:TEAL,urgente:AMBER,bloccante:RED}[r.urgenza as string]||TEAL;
            return (
              <div key={i} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${uc}30`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:500,color:DARK,flex:1}}>{r.desc}</span>
                  <span style={{fontSize:12,fontWeight:500,fontFamily:FM,color:DARK,marginLeft:8}}>{r.qty} {r.um}</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:100,background:uc+"12",color:uc,fontWeight:600}}>{r.urgenza}</span>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:100,background:"#F4F6F8",color:"#6B7280"}}>{r.stato}</span>
                </div>
                {r.disegno&&<img src={r.disegno} style={{width:"100%",borderRadius:8,marginTop:8,border:"1px solid #E5E3DC"}} alt="schizzo"/>}
              </div>
            );
          })}
        </>}

        {tab==="foto"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:DARK}}>Foto cantiere</span>
            <label style={{padding:"8px 14px",borderRadius:9,background:TEAL,color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>
              ðŸ“· Scatta
              <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{
                const file=e.target.files?.[0];
                if(!file) return;
                const reader=new FileReader();
                reader.onload=()=>{
                  const upd={...m,foto:[...(m.foto||[]),{id:Date.now().toString(),url:reader.result as string,fase:"posa",ts:new Date().toISOString()}]};
                  onUpdate(upd);
                };
                reader.readAsDataURL(file);
              }}/>
            </label>
          </div>
          {(m.foto||[]).length===0&&(
            <div style={{textAlign:"center" as any,padding:"40px 20px",color:"#9CA3AF"}}>
              <div style={{fontSize:40,marginBottom:8}}>ðŸ“·</div>
              <div style={{fontSize:13}}>Scatta foto durante il montaggio</div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {(m.foto||[]).map((f:any,i:number)=>(
              <div key={i} style={{borderRadius:12,overflow:"hidden",aspectRatio:"4/3",background:"#F4F6F8",position:"relative" as any}}>
                <img src={f.url} style={{width:"100%",height:"100%",objectFit:"cover" as any}} alt=""/>
                <div style={{position:"absolute" as any,bottom:4,left:4,fontSize:9,background:"rgba(0,0,0,0.5)",color:"#fff",padding:"2px 6px",borderRadius:4}}>{f.fase}</div>
              </div>
            ))}
          </div>
        </>}

        {tab==="team"&&<>
          <div style={{fontSize:13,color:"#6B7280",marginBottom:12}}>Contatti diretti del lavoro</div>
          {CONTATTI_DEMO.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,marginBottom:6,background:"#fff",border:"1px solid #E5E3DC"}}>
              <div style={{width:38,height:38,borderRadius:10,background:TEAL+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:TEAL,flexShrink:0}}>{c.nome[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:DARK}}>{c.nome}</div>
                <div style={{fontSize:11,color:"#6B7280"}}>{c.ruolo}</div>
              </div>
              <a href={`tel:${c.tel}`} style={{width:36,height:36,borderRadius:9,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .89h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.83a16 16 0 006.29 6.29l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </a>
            </div>
          ))}
          {/* Segnala criticitÃ  */}
          <div style={{marginTop:16,padding:"14px",borderRadius:12,background:RED+"06",border:`1px solid ${RED}20`}}>
            <div style={{fontSize:13,fontWeight:600,color:RED,marginBottom:6}}>ðŸš¨ Segnala criticitÃ </div>
            <textarea placeholder="Descrivi il problema..." rows={2} style={{width:"100%",padding:"8px 10px",border:`1px solid ${RED}30`,borderRadius:8,fontSize:13,fontFamily:FF,outline:"none",color:DARK,resize:"none" as any,background:"#fff"}}/>
            <button style={{marginTop:8,width:"100%",padding:"10px",borderRadius:9,background:RED,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FF}}>Invia segnalazione urgente</button>
          </div>
        </>}
      </div>

      {showRichiesta&&<RichiestaMaterialiForm onSave={aggiungiRichiesta} onClose={()=>setShowRichiesta(false)}/>}
      {showFirma&&<FirmaCliente cliente={`${m.cliente} ${m.cognome||""}`} onFirma={firma=>{onUpdate({...m,stato:"completato"});setShowFirma(false);setTimerOn(false);}} onClose={()=>setShowFirma(false)}/>}
    </div>
  );
}

// â”€â”€â”€ HOME CALENDARIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HomeCalendario({ montaggi, operatore, onSelect, onLogout }: { montaggi:Montaggio[]; operatore:string; onSelect:(m:Montaggio)=>void; onLogout:()=>void }) {
  const TODAY = new Date().toISOString().split("T")[0];
  const TOMORROW = new Date(Date.now()+86400000).toISOString().split("T")[0];

  const oggi   = montaggi.filter(m=>m.data===TODAY);
  const domani = montaggi.filter(m=>m.data===TOMORROW);
  const altri  = montaggi.filter(m=>m.data!==TODAY&&m.data!==TOMORROW&&m.data>=TODAY);

  const Card = ({m}:{m:Montaggio}) => {
    const statoC={programmato:BLUE,in_corso:AMBER,completato:TEAL,bloccato:RED}[m.stato];
    return (
      <div onClick={()=>onSelect(m)} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${m.urgenza?RED+"40":"#E5E3DC"}`,boxShadow:m.urgenza?"0 0 0 1px "+RED+"20":"none",cursor:"pointer",WebkitUserSelect:"none" as any}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              {m.urgenza&&<span style={{fontSize:14}}>ðŸš¨</span>}
              <span style={{fontSize:15,fontWeight:600,color:DARK}}>{m.cliente} {m.cognome||""}</span>
            </div>
            <div style={{fontSize:12,color:"#6B7280"}}>{m.indirizzo}, {m.comune}</div>
          </div>
          <span style={{fontSize:11,padding:"3px 8px",borderRadius:100,background:statoC+"12",color:statoC,fontWeight:500,flexShrink:0,marginLeft:8}}>{m.stato.replace("_"," ")}</span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:12,color:"#6B7280"}}>ðŸ• {m.oraInizio||"â€”"}â€“{m.oraFine||"â€”"}</span>
          <span style={{fontSize:12,color:"#6B7280"}}>ðŸªŸ {(m.vani||[]).length} vani</span>
          {m.tempoStimato&&<span style={{fontSize:12,color:"#6B7280"}}>â± {Math.floor(m.tempoStimato/60)}h</span>}
        </div>
        <div style={{marginTop:8,height:3,background:"#F4F6F8",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.round(((m.checklist||[]).filter(c=>c.fatto).length/Math.max((m.checklist||[]).length,1))*100)}%`,background:TEAL,borderRadius:2}}/>
        </div>
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:FF}}>
      {/* TOPBAR */}
      <div style={{background:DARK,padding:"16px 16px 12px",position:"sticky" as any,top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff"}}>M</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>Ciao, {operatore.split(" ")[0]}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>MASTRO MONTAGGI</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{textAlign:"center",padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:18,fontWeight:700,color:oggi.length>0?TEAL:"rgba(255,255,255,0.4)",fontFamily:FM}}>{oggi.length}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>oggi</div>
            </div>
            <div style={{textAlign:"center",padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.6)",fontFamily:FM}}>{domani.length}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>domani</div>
            </div>
            <button onClick={onLogout} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.5)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>â»</button>
          </div>
        </div>
      </div>

      <div style={{padding:16}}>
        {/* OGGI */}
        {oggi.length>0&&<>
          <div style={{fontSize:12,fontWeight:700,color:TEAL,textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10}}>Oggi Â· {new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"})}</div>
          {oggi.map(m=><Card key={m.id} m={m}/>)}
        </>}

        {oggi.length===0&&<div style={{textAlign:"center" as any,padding:"32px 20px",background:"#fff",borderRadius:14,border:"1px solid #E5E3DC",marginBottom:16}}>
          <div style={{fontSize:32,marginBottom:8}}>âœ…</div>
          <div style={{fontSize:14,fontWeight:500,color:DARK}}>Nessun montaggio oggi</div>
          <div style={{fontSize:12,color:"#9CA3AF",marginTop:4}}>Buona giornata {operatore.split(" ")[0]}!</div>
        </div>}

        {/* DOMANI */}
        {domani.length>0&&<>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10,marginTop:8}}>Domani</div>
          {domani.map(m=><Card key={m.id} m={m}/>)}
        </>}

        {/* ALTRI */}
        {altri.length>0&&<>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10,marginTop:8}}>Prossimi</div>
          {altri.map(m=><Card key={m.id} m={m}/>)}
        </>}

        {montaggi.length===0&&<div style={{textAlign:"center" as any,padding:"60px 20px",color:"#9CA3AF"}}>
          <div style={{fontSize:40,marginBottom:12}}>ðŸ”§</div>
          <div style={{fontSize:15,fontWeight:500,color:DARK}}>Nessun montaggio programmato</div>
        </div>}
      </div>

      {/* FAB urgenza */}
      <button style={{position:"fixed" as any,bottom:24,right:16,width:52,height:52,borderRadius:16,background:RED,color:"#fff",border:"none",fontSize:22,cursor:"pointer",boxShadow:"0 4px 16px rgba(220,68,68,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
        ðŸš¨
      </button>
    </div>
  );
}

// â”€â”€â”€ ROOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function MastroMontaggi() {
  const [operatore, setOperatore] = useState<string|null>(null);
  const [montaggi, setMontaggi] = useState<Montaggio[]>(MONTAGGI_DEMO);
  const [sel, setSel] = useState<Montaggio|null>(null);

  const aggiorna = (updated: Montaggio) => {
    setMontaggi(ms => ms.map(m => m.id===updated.id ? updated : m));
    if(sel?.id===updated.id) setSel(updated);
  };

  if(!operatore) return <LoginPIN onLogin={setOperatore}/>;
  if(sel) return <DettaglioMontaggio m={sel} operatore={operatore} onBack={()=>setSel(null)} onUpdate={aggiorna}/>;
  return <HomeCalendario montaggi={montaggi} operatore={operatore} onSelect={setSel} onLogout={()=>setOperatore(null)}/>;
}
