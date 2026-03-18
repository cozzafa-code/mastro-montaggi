"use client";
// @ts-nocheck
// MASTRO MONTAGGI v2 — App montatori completa
// Calendario, dettaglio commessa, checklist, PDF preventivo, firma cliente, materiali

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const TEAL="#1A9E73", DARK="#1A1A1C", RED="#DC4444", AMBER="#E8A020", BLUE="#3B7FE0", PURPLE="#8B5CF6", ORANGE="#F97316";
const FF="Inter,system-ui,sans-serif", FM="JetBrains Mono,monospace";

// ─── DATI DEMO RICCHI ────────────────────────────────────────
const MONTAGGI_DEMO = [
  {
    id:"m1", cmId:"cm001", code:"S-0042",
    cliente:"Anna", cognome:"Russo",
    indirizzo:"Via Roma 12", comune:"Cosenza", piano:"3 piano int.4",
    tel:"339 1234567",
    data: new Date().toISOString().split("T")[0],
    oraInizio:"08:30", oraFine:"16:00",
    stato:"programmato", urgenza:false,
    operatori:["Marco Vito","Luigi Perri"],
    tempoStimato:450,
    note:"Cliente disponibile tutto il giorno. Accesso dal portone laterale. Parcheggio disponibile sul retro. Campanello nome RUSSO.",
    sistema:"Schuco AWS 90 SI+",
    importo:8450,
    acconto:2535,
    saldo:5915,
    vani:[
      {id:"v1",nome:"Salone",tipo:"Scorrevole HST 2 ante",mis:"2400x2200",col:"RAL 7016 Antracite",uw:"1.1",note:"Smontare vecchio serramento"},
      {id:"v2",nome:"Camera",tipo:"Finestra 2 ante battenti",mis:"1400x1400",col:"RAL 7016 Antracite",uw:"1.3",note:""},
      {id:"v3",nome:"Cameretta",tipo:"Finestra 1 anta",mis:"1000x1200",col:"RAL 7016 Antracite",uw:"1.3",note:"Zanzariera inclusa"},
      {id:"v4",nome:"Bagno",tipo:"Vasistas",mis:"600x600",col:"RAL 9010 Bianco",uw:"1.4",note:"Solo vetro opaco"},
    ],
    materiali:[
      {cod:"SCH-001",desc:"Profilo Schuco AWS90 SI+ traverso",qty:8,um:"cad",peso:"3.2 kg/cad"},
      {cod:"SCH-002",desc:"Profilo Schuco AWS90 SI+ montante",qty:8,um:"cad",peso:"3.8 kg/cad"},
      {cod:"VET-001",desc:"Vetro camera 4/16/4 Basso Emissivo",qty:4,um:"mq",peso:"22 kg/mq"},
      {cod:"FER-001",desc:"Ferramenta anta battente Roto",qty:3,um:"set",peso:"0.8 kg/set"},
      {cod:"ACC-001",desc:"Zanzariera laterale 1000x1200",qty:1,um:"cad",peso:"2.1 kg"},
      {cod:"CON-001",desc:"Silicone neutro grigio RAL7016",qty:4,um:"pz",peso:""},
      {cod:"CON-002",desc:"Schiuma poliuretanica",qty:2,um:"pz",peso:""},
      {cod:"CON-003",desc:"Nastro adesivo da costruzione",qty:1,um:"rotolo",peso:""},
    ],
    checklist:[
      // CARICO
      {id:"c1",testo:"Verifica materiali in magazzino",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"c2",testo:"Carico profili su furgone",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"c3",testo:"Carico vetri (proteggere con cartoni)",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"c4",testo:"Ferramenta e accessori",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"c5",testo:"Consumabili (silicone, schiuma, nastri)",fatto:false,obbligatorio:false,fase:"carico"},
      {id:"c6",testo:"DPI: guanti, occhiali, scarpe antiinfortunio",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"c7",testo:"Attrezzi: trapano, livella, flessibile",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"c8",testo:"Scheda tecnica vani stampata",fatto:false,obbligatorio:false,fase:"carico"},
      // POSA
      {id:"p1",testo:"Sopralluogo vani: conferma misure",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p2",testo:"Smontaggio infissi vecchi vano 1",fatto:false,obbligatorio:false,fase:"posa"},
      {id:"p3",testo:"Smontaggio infissi vecchi vano 2",fatto:false,obbligatorio:false,fase:"posa"},
      {id:"p4",testo:"Posa e fissaggio telaio vano 1 (Salone)",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p5",testo:"Posa e fissaggio telaio vano 2 (Camera)",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p6",testo:"Posa e fissaggio vano 3 (Cameretta)",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p7",testo:"Posa e fissaggio vano 4 (Bagno)",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p8",testo:"Sigillatura esterna con silicone",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p9",testo:"Sigillatura interna con schiuma",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p10",testo:"Pulizia vani al termine",fatto:false,obbligatorio:false,fase:"posa"},
      // COLLAUDO
      {id:"q1",testo:"Test apertura/chiusura ogni anta",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q2",testo:"Regolazione cerniere 3D",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q3",testo:"Verifica guarnizioni perimetrali",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q4",testo:"Test scorrevole (forza apertura)",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q5",testo:"Verifica zanzariera",fatto:false,obbligatorio:false,fase:"collaudo"},
      {id:"q6",testo:"Nessuna infiltrazione visibile",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q7",testo:"Verifica livellatura e piombo",fatto:false,obbligatorio:true,fase:"collaudo"},
      // SCARICO
      {id:"s1",testo:"Raccolta materiale eccedente",fatto:false,obbligatorio:true,fase:"scarico"},
      {id:"s2",testo:"Smaltimento imballi e vecchi serramenti",fatto:false,obbligatorio:true,fase:"scarico"},
      {id:"s3",testo:"Pulizia finale appartamento",fatto:false,obbligatorio:false,fase:"scarico"},
      {id:"s4",testo:"Foto documentazione completata",fatto:false,obbligatorio:true,fase:"scarico"},
      {id:"s5",testo:"Firma cliente acquisita",fatto:false,obbligatorio:true,fase:"scarico"},
    ],
    foto:[], materialiRichiesti:[],
    preventivo:{
      numero:"PREV-2026-042",
      data:"5 Feb 2026",
      validita:"30 giorni",
      note:"Prezzi IVA 10% inclusa. Smontaggio e smaltimento vecchi serramenti incluso.",
    }
  },
  {
    id:"m2", cmId:"cm002", code:"S-0039",
    cliente:"Mario", cognome:"Esposito",
    indirizzo:"Corso Mazzini 88", comune:"Rende", piano:"PT",
    tel:"347 9876543",
    data: new Date(Date.now()+86400000).toISOString().split("T")[0],
    oraInizio:"09:00", oraFine:"13:00",
    stato:"programmato", urgenza:true,
    operatori:["Marco Vito"],
    tempoStimato:240,
    note:"Solo mattina. 2 finestre piano terra. URGENTE: cliente aspetta muratore nel pomeriggio.",
    sistema:"Aluplast 76mm PVC",
    importo:3200,
    acconto:960,
    saldo:2240,
    vani:[
      {id:"v5",nome:"Cucina",tipo:"Finestra 2 ante",mis:"1200x1400",col:"RAL 9010 Bianco",uw:"1.3",note:""},
      {id:"v6",nome:"Salotto",tipo:"Porta finestra 1 anta",mis:"900x2200",col:"RAL 9010 Bianco",uw:"1.3",note:"Maniglia alzante"},
    ],
    materiali:[
      {cod:"ALU-001",desc:"Profilo PVC Aluplast 76mm",qty:10,um:"ml",peso:""},
      {cod:"VET-002",desc:"Vetro camera 4/16/4",qty:2,um:"mq",peso:""},
      {cod:"FER-002",desc:"Maniglia alzante PVC",qty:1,um:"pz",peso:""},
    ],
    checklist:[
      {id:"c1",testo:"Carico materiali",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"p1",testo:"Posa vano cucina",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p2",testo:"Posa porta finestra salotto",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"q1",testo:"Collaudo apertura/chiusura",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"s1",testo:"Firma cliente",fatto:false,obbligatorio:true,fase:"scarico"},
    ],
    foto:[], materialiRichiesti:[],
    preventivo:{numero:"PREV-2026-039",data:"1 Feb 2026",validita:"30 giorni",note:""}
  },
];

// ─── LOGIN PIN ────────────────────────────────────────────────
function LoginPIN({onLogin}:{onLogin:(n:string)=>void}) {
  const [pin,setPin]=useState(""); const [err,setErr]=useState(false);
  const PINS:Record<string,string>={"1234":"Marco Vito","5678":"Luigi Perri","9012":"Antonio Bruno","3456":"Sara Greco"};
  const press=(n:string)=>{
    if(pin.length>=4)return;
    const p=pin+n; setPin(p); setErr(false);
    if(p.length===4){setTimeout(()=>{if(PINS[p])onLogin(PINS[p]);else{setErr(true);setPin("");}},300);}
  };
  return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",flexDirection:"column" as any,alignItems:"center",justifyContent:"center",padding:20,fontFamily:FF}}>
      <div style={{marginBottom:32,textAlign:"center" as any}}>
        <div style={{width:60,height:60,borderRadius:16,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",margin:"0 auto 16px"}}>M</div>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:1}}>MASTRO MONTAGGI</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:4}}>Inserisci il tuo PIN</div>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:32}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:18,height:18,borderRadius:"50%",background:i<pin.length?TEAL:"rgba(255,255,255,0.15)",transition:"background .15s"}}/>)}
      </div>
      {err&&<div style={{color:RED,fontSize:13,marginBottom:16,fontWeight:500}}>PIN non riconosciuto</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:280}}>
        {["1","2","3","4","5","6","7","8","9","","0","<"].map((n,i)=>(
          <div key={i} onClick={()=>{if(n==="<"){setPin(p=>p.slice(0,-1));setErr(false);}else if(n)press(n);}}
            style={{height:72,borderRadius:16,background:n?"rgba(255,255,255,0.09)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:500,color:"#fff",cursor:n?"pointer":"default",userSelect:"none" as any,WebkitUserSelect:"none" as any}}
            onTouchStart={e=>{if(n)(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.2)";}}
            onTouchEnd={e=>{if(n)(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.09)";}}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHECKLIST FASE ──────────────────────────────────────────
function ChecklistFase({items,onToggle,fase}:{items:any[];onToggle:(id:string)=>void;fase:string}) {
  const filtered=items.filter(i=>i.fase===fase);
  const done=filtered.filter(i=>i.fatto).length;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5}}>{fase}</span>
        <span style={{fontSize:12,fontWeight:600,color:done===filtered.length?TEAL:AMBER}}>{done}/{filtered.length}</span>
      </div>
      {filtered.map(item=>(
        <div key={item.id} onClick={()=>onToggle(item.id)}
          style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,marginBottom:6,background:item.fatto?TEAL+"08":"#fff",border:`1px solid ${item.fatto?TEAL+"30":"#E5E3DC"}`,cursor:"pointer",WebkitUserSelect:"none" as any}}>
          <div style={{width:24,height:24,borderRadius:7,border:`2px solid ${item.fatto?TEAL:"#D1D5DB"}`,background:item.fatto?TEAL:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
            {item.fatto&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
          </div>
          <span style={{fontSize:13,color:item.fatto?"#9CA3AF":DARK,textDecoration:item.fatto?"line-through":"none",flex:1,lineHeight:1.4}}>{item.testo}</span>
          {item.obbligatorio&&!item.fatto&&<div style={{width:6,height:6,borderRadius:"50%",background:RED,flexShrink:0}}/>}
        </div>
      ))}
    </div>
  );
}

// ─── FIRMA CANVAS ─────────────────────────────────────────────
function FirmaCanvas({cliente,onFirma,onClose}:{cliente:string;onFirma:(d:string)=>void;onClose:()=>void}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [drawing,setDrawing]=useState(false);
  const [hasFirma,setHasFirma]=useState(false);
  const last=useRef({x:0,y:0});
  const start=(e:any)=>{setDrawing(true);const r=canvasRef.current!.getBoundingClientRect();const t=e.touches?.[0]||e;last.current={x:t.clientX-r.left,y:t.clientY-r.top};};
  const move=(e:any)=>{if(!drawing||!canvasRef.current)return;e.preventDefault();const ctx=canvasRef.current.getContext("2d")!;const r=canvasRef.current.getBoundingClientRect();const t=e.touches?.[0]||e;const x=t.clientX-r.left,y=t.clientY-r.top;ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(x,y);ctx.strokeStyle=DARK;ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();last.current={x,y};setHasFirma(true);};
  const stop=()=>setDrawing(false);
  const clear=()=>{const ctx=canvasRef.current?.getContext("2d");if(ctx&&canvasRef.current){ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);setHasFirma(false);}};
  return (
    <div style={{position:"fixed" as any,inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:20,width:"100%",maxWidth:500,fontFamily:FF}}>
        <div style={{fontSize:17,fontWeight:600,color:DARK,marginBottom:4}}>Firma del cliente</div>
        <div style={{fontSize:13,color:"#6B7280",marginBottom:14}}>Il/La signor/a {cliente} conferma la corretta installazione dei serramenti e accetta il lavoro eseguito.</div>
        <div style={{fontSize:11,color:"#9CA3AF",marginBottom:4}}>Firma qui sotto</div>
        <canvas ref={canvasRef} width={460} height={180}
          style={{width:"100%",height:180,border:"2px solid #E5E3DC",borderRadius:12,background:"#FAFAFA",touchAction:"none" as any,display:"block"}}
          onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={move} onTouchEnd={stop}/>
        <div style={{borderTop:"1px dashed #D1D5DB",margin:"6px 0 14px",textAlign:"center" as any,fontSize:10,color:"#9CA3AF"}}>firma qui sopra</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={clear} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #E5E3DC",background:"transparent",fontSize:13,cursor:"pointer",fontFamily:FF,color:"#6B7280"}}>Cancella</button>
          <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #E5E3DC",background:"transparent",fontSize:13,cursor:"pointer",fontFamily:FF,color:"#6B7280"}}>Annulla</button>
          <button onClick={()=>{if(hasFirma&&canvasRef.current)onFirma(canvasRef.current.toDataURL());}} disabled={!hasFirma}
            style={{flex:2,padding:"11px",borderRadius:10,background:hasFirma?TEAL:"#E5E3DC",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:hasFirma?"pointer":"not-allowed",fontFamily:FF}}>
            Conferma firma
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RICHIESTA MATERIALI ──────────────────────────────────────
function RichiestaMaterialiModal({onSave,onClose}:{onSave:(r:any)=>void;onClose:()=>void}) {
  const [desc,setDesc]=useState(""); const [qty,setQty]=useState("1"); const [um,setUm]=useState("pz");
  const [urgenza,setUrgenza]=useState<"normale"|"urgente"|"bloccante">("normale");
  const [note,setNote]=useState("");
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [showCanvas,setShowCanvas]=useState(false);
  const [drawing,setDrawing]=useState(false);
  const last=useRef({x:0,y:0});
  const startD=(e:any)=>{setDrawing(true);const r=canvasRef.current!.getBoundingClientRect();const t=e.touches?.[0]||e;last.current={x:t.clientX-r.left,y:t.clientY-r.top};};
  const moveD=(e:any)=>{if(!drawing||!canvasRef.current)return;e.preventDefault();const ctx=canvasRef.current.getContext("2d")!;const r=canvasRef.current.getBoundingClientRect();const t=e.touches?.[0]||e;const x=t.clientX-r.left,y=t.clientY-r.top;ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(x,y);ctx.strokeStyle=DARK;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();last.current={x,y};};
  const stopD=()=>setDrawing(false);
  const clearD=()=>{const ctx=canvasRef.current?.getContext("2d");if(ctx&&canvasRef.current)ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);};
  const save=()=>{
    if(!desc.trim())return;
    const disegno=showCanvas&&canvasRef.current?canvasRef.current.toDataURL():undefined;
    onSave({id:Date.now().toString(),desc,qty:parseInt(qty)||1,um,urgenza,note,disegno,stato:"inviata",ts:new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})});
  };
  const urgC:Record<string,string>={normale:TEAL,urgente:AMBER,bloccante:RED};
  return (
    <div style={{position:"fixed" as any,inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",width:"100%",maxHeight:"92vh",overflowY:"auto" as any,fontFamily:FF}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:600,color:DARK}}>Richiedi materiale</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",border:"none",background:"#F4F6F8",fontSize:18,cursor:"pointer"}}>x</button>
        </div>
        {/* Urgenza */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {(["normale","urgente","bloccante"] as const).map(u=>(
            <div key={u} onClick={()=>setUrgenza(u)} style={{padding:"10px 6px",borderRadius:10,border:`1.5px solid ${urgenza===u?urgC[u]:"#E5E3DC"}`,background:urgenza===u?urgC[u]+"10":"transparent",textAlign:"center" as any,cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:600,color:urgenza===u?urgC[u]:DARK,textTransform:"capitalize" as any}}>{u}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Cosa serve</div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Es. Lamiera angolare 200x100mm, profilo speciale..." style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FF,outline:"none",color:DARK,boxSizing:"border-box" as any}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Quantita</div>
            <input type="number" value={qty} onChange={e=>setQty(e.target.value)} min="1" style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:15,fontFamily:FM,outline:"none",color:DARK}}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Unita</div>
            <select value={um} onChange={e=>setUm(e.target.value)} style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FF,outline:"none",color:DARK,background:"#fff"}}>
              {["pz","ml","mq","kg","set","rotolo"].map(u=><option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Note aggiuntive</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Dimensioni, colore, riferimento..." style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:13,fontFamily:FF,outline:"none",color:DARK,resize:"none" as any,boxSizing:"border-box" as any}}/>
        </div>
        {/* Schizzo */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5}}>Schizzo (opzionale)</div>
            <div style={{display:"flex",gap:6}}>
              <div onClick={()=>setShowCanvas(s=>!s)} style={{padding:"4px 10px",borderRadius:6,background:showCanvas?DARK:TEAL,color:"#fff",fontSize:11,fontWeight:500,cursor:"pointer"}}>{showCanvas?"Nascondi":"Disegna"}</div>
              {showCanvas&&<div onClick={clearD} style={{padding:"4px 10px",borderRadius:6,background:"#F4F6F8",color:"#6B7280",fontSize:11,cursor:"pointer"}}>Cancella</div>}
            </div>
          </div>
          {showCanvas&&<canvas ref={canvasRef} width={340} height={200} style={{width:"100%",height:200,border:"1px solid #E5E3DC",borderRadius:10,background:"#FAFAFA",touchAction:"none" as any,cursor:"crosshair"}} onMouseDown={startD} onMouseMove={moveD} onMouseUp={stopD} onMouseLeave={stopD} onTouchStart={startD} onTouchMove={moveD} onTouchEnd={stopD}/>}
        </div>
        <button onClick={save} style={{width:"100%",padding:"14px",borderRadius:12,background:urgenza==="bloccante"?RED:urgenza==="urgente"?AMBER:TEAL,color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FF}}>
          {urgenza==="bloccante"?"URGENTISSIMO — Invia":urgenza==="urgente"?"Invia urgente":"Invia richiesta"}
        </button>
      </div>
    </div>
  );
}

// ─── DETTAGLIO PREVENTIVO ─────────────────────────────────────
function PreventivoView({m}:{m:any}) {
  const fmtE=(n:number)=>"€"+n.toLocaleString("it-IT");
  return (
    <div>
      <div style={{background:"#F8FAFC",borderRadius:12,padding:"14px 16px",marginBottom:14,border:"1px solid #E5E3DC"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:10}}>Documento</div>
        {[{l:"Numero",v:m.preventivo.numero},{l:"Data",v:m.preventivo.data},{l:"Validita",v:m.preventivo.validita},{l:"Sistema",v:m.sistema},{l:"Nr. vani",v:`${m.vani.length}`}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid #E5E3DC":"none"}}>
            <span style={{fontSize:12,color:"#6B7280"}}>{r.l}</span>
            <span style={{fontSize:12,fontWeight:500,color:DARK}}>{r.v}</span>
          </div>
        ))}
      </div>
      {/* Vani e prezzi */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E5E3DC",overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"10px 14px",background:"#F8FAFC",borderBottom:"1px solid #E5E3DC",fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5}}>Voci</div>
        {m.vani.map((v:any,i:number)=>(
          <div key={i} style={{padding:"10px 14px",borderBottom:i<m.vani.length-1?"1px solid #E5E3DC":"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:13,fontWeight:500,color:DARK}}>{v.nome} — {v.tipo}</span>
            </div>
            <div style={{fontSize:11,color:"#6B7280"}}>{v.mis} mm · {v.col} · Uw {v.uw} W/m2K</div>
          </div>
        ))}
        <div style={{padding:"12px 14px",background:"#F8FAFC",borderTop:"1px solid #E5E3DC"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:"#6B7280"}}>Imponibile</span>
            <span style={{fontSize:12,color:DARK,fontFamily:FM}}>{fmtE(Math.round(m.importo/1.1))}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:"#6B7280"}}>IVA 10%</span>
            <span style={{fontSize:12,color:DARK,fontFamily:FM}}>{fmtE(Math.round(m.importo/11))}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:14,fontWeight:700,color:DARK}}>TOTALE</span>
            <span style={{fontSize:16,fontWeight:700,color:DARK,fontFamily:FM}}>{fmtE(m.importo)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:TEAL}}>Acconto pagato</span>
            <span style={{fontSize:12,fontWeight:500,color:TEAL,fontFamily:FM}}>- {fmtE(m.acconto)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid #E5E3DC"}}>
            <span style={{fontSize:14,fontWeight:700,color:AMBER}}>SALDO DA INCASSARE</span>
            <span style={{fontSize:16,fontWeight:700,color:AMBER,fontFamily:FM}}>{fmtE(m.saldo)}</span>
          </div>
        </div>
      </div>
      {m.preventivo.note&&<div style={{background:"#FFF8E7",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#92400E"}}>{m.preventivo.note}</div>}
    </div>
  );
}

// ─── DETTAGLIO MONTAGGIO ──────────────────────────────────────
function DettaglioMontaggio({m,operatore,onBack,onUpdate}:{m:any;operatore:string;onBack:()=>void;onUpdate:(m:any)=>void}) {
  const [tab,setTab]=useState<"info"|"vani"|"checklist"|"materiali"|"foto"|"preventivo"|"team">("info");
  const [checkFase,setCheckFase]=useState<"carico"|"posa"|"collaudo"|"scarico">("carico");
  const [showRichiesta,setShowRichiesta]=useState(false);
  const [showFirma,setShowFirma]=useState(false);
  const [timer,setTimer]=useState(0);
  const [timerOn,setTimerOn]=useState(false);
  const timerRef=useRef<any>();
  useEffect(()=>{if(timerOn)timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);else clearInterval(timerRef.current);return()=>clearInterval(timerRef.current);},[timerOn]);
  const fmtTimer=(s:number)=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const toggleCheck=(id:string)=>onUpdate({...m,checklist:(m.checklist||[]).map((c:any)=>c.id===id?{...c,fatto:!c.fatto}:c)});
  const checkDone=(f:string)=>(m.checklist||[]).filter((c:any)=>c.fase===f&&c.fatto).length;
  const checkTot=(f:string)=>(m.checklist||[]).filter((c:any)=>c.fase===f).length;
  const totDone=(m.checklist||[]).filter((c:any)=>c.fatto).length;
  const totTot=(m.checklist||[]).length;
  const fmtE=(n:number)=>"€"+n.toLocaleString("it-IT");
  const statoC:Record<string,string>={programmato:BLUE,in_corso:AMBER,completato:TEAL,bloccato:RED};

  const TABS=[["info","Info"],["vani","Vani"],["checklist","Lista"],["materiali","Richieste"],["foto","Foto"],["preventivo","Preventivo"],["team","Team"]];

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:FF}}>
      {/* HEADER */}
      <div style={{background:DARK,padding:"14px 16px 0",position:"sticky" as any,top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={onBack} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{"<"}</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{m.cliente} {m.cognome}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{m.code} · {m.comune} · {m.oraInizio}–{m.oraFine}</div>
          </div>
          <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:statoC[m.stato]+"25",color:statoC[m.stato],fontWeight:600}}>{m.stato}</span>
        </div>
        {/* Progress globale */}
        <div style={{marginBottom:8}}>
          <div style={{height:3,background:"rgba(255,255,255,0.1)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${totTot>0?Math.round(totDone/totTot*100):0}%`,background:TEAL,borderRadius:2,transition:"width .3s"}}/>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:3}}>{totDone}/{totTot} operazioni completate</div>
        </div>
        {/* CTA */}
        {m.stato==="programmato"&&(
          <button onClick={()=>{onUpdate({...m,stato:"in_corso"});setTimerOn(true);}} style={{width:"100%",padding:"11px",background:TEAL,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FF,marginBottom:0}}>
            Inizia montaggio
          </button>
        )}
        {m.stato==="in_corso"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
            <div style={{padding:"9px",textAlign:"center" as any,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FM}}>{fmtTimer(timer)}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>Tempo trascorso</div>
            </div>
            <button onClick={()=>setShowFirma(true)} style={{padding:"9px",background:TEAL,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FF,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
              Completa + Firma
            </button>
          </div>
        )}
        {m.stato==="completato"&&(
          <div style={{padding:"10px 14px",background:TEAL+"20",textAlign:"center" as any,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            <span style={{fontSize:13,fontWeight:600,color:TEAL}}>Montaggio completato</span>
          </div>
        )}
        {/* Tabs */}
        <div style={{display:"flex",overflowX:"auto" as any,scrollbarWidth:"none" as any}}>
          {TABS.map(([id,l])=>(
            <div key={id} onClick={()=>setTab(id as any)} style={{padding:"9px 12px",fontSize:11,fontWeight:tab===id?600:400,color:tab===id?"#fff":"rgba(255,255,255,0.4)",borderBottom:`2px solid ${tab===id?TEAL:"transparent"}`,cursor:"pointer",whiteSpace:"nowrap" as any,flexShrink:0}}>
              {l}
              {id==="materiali"&&(m.materialiRichiesti||[]).length>0&&<span style={{marginLeft:4,fontSize:9,background:AMBER,color:"#fff",borderRadius:8,padding:"0 5px"}}>{(m.materialiRichiesti||[]).length}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:16,paddingBottom:80}}>
        {/* INFO */}
        {tab==="info"&&<>
          {m.urgenza&&<div style={{background:RED+"08",border:`1px solid ${RED}25`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,fontWeight:500,color:RED}}>URGENTE — priorita massima</div>}
          {[{l:"Indirizzo",v:`${m.indirizzo}, ${m.comune}`},{l:"Piano",v:m.piano},{l:"Telefono",v:m.tel},{l:"Orario",v:`${m.oraInizio} - ${m.oraFine}`},{l:"Operatori",v:(m.operatori||[]).join(", ")},{l:"Sistema",v:m.sistema},{l:"Saldo da incassare",v:fmtE(m.saldo)}].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,marginBottom:5,background:"#fff",border:"1px solid #E5E3DC"}}>
              <span style={{fontSize:13,color:"#6B7280"}}>{r.l}</span>
              <span style={{fontSize:13,fontWeight:500,color:i===6?AMBER:DARK}}>{r.v}</span>
            </div>
          ))}
          {m.note&&<div style={{background:"#FFF8E7",border:"1px solid #FDE68A",borderRadius:10,padding:"12px 14px",marginTop:8}}>
            <div style={{fontSize:11,fontWeight:700,color:AMBER,marginBottom:4}}>NOTE</div>
            <div style={{fontSize:13,color:DARK,lineHeight:1.6}}>{m.note}</div>
          </div>}
          <a href={`https://maps.google.com/?q=${encodeURIComponent(m.indirizzo+", "+m.comune)}`} target="_blank" rel="noreferrer"
            style={{display:"block",marginTop:12,padding:"13px",borderRadius:12,background:BLUE,color:"#fff",textAlign:"center" as any,textDecoration:"none",fontSize:14,fontWeight:600}}>
            Apri in Google Maps
          </a>
          <a href={`tel:${m.tel}`}
            style={{display:"block",marginTop:8,padding:"13px",borderRadius:12,background:"#F8FAFC",color:TEAL,textAlign:"center" as any,textDecoration:"none",fontSize:14,fontWeight:600,border:`1px solid ${TEAL}30`}}>
            Chiama cliente
          </a>
        </>}

        {/* VANI */}
        {tab==="vani"&&<>
          <div style={{fontSize:12,color:"#6B7280",marginBottom:12}}>{m.vani.length} vani da installare</div>
          {m.vani.map((v:any,i:number)=>(
            <div key={i} style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:8,border:"1px solid #E5E3DC"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <span style={{fontSize:15,fontWeight:600,color:DARK}}>{v.nome}</span>
                <span style={{fontSize:12,fontWeight:600,color:TEAL}}>Uw {v.uw}</span>
              </div>
              <div style={{fontSize:13,color:DARK,marginBottom:4}}>{v.tipo}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as any}}>
                <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#F4F6F8",color:"#6B7280"}}>{v.mis} mm</span>
                <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#F4F6F8",color:"#6B7280"}}>{v.col}</span>
              </div>
              {v.note&&<div style={{fontSize:11,color:AMBER,marginTop:6,fontWeight:500}}>Note: {v.note}</div>}
            </div>
          ))}
          {/* Materiali */}
          <div style={{fontSize:12,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,margin:"16px 0 8px"}}>Lista materiali</div>
          {m.materiali.map((mat:any,i:number)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"#fff",border:"1px solid #E5E3DC",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:DARK}}>{mat.desc}</div>
                <div style={{fontSize:10,color:"#9CA3AF"}}>{mat.cod}</div>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:DARK,fontFamily:FM}}>{mat.qty} {mat.um}</div>
            </div>
          ))}
        </>}

        {/* CHECKLIST */}
        {tab==="checklist"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
            {(["carico","posa","collaudo","scarico"] as const).map(f=>{
              const d=checkDone(f),t=checkTot(f);
              return (
                <div key={f} onClick={()=>setCheckFase(f)} style={{padding:"8px 4px",borderRadius:10,border:`1.5px solid ${checkFase===f?TEAL:"#E5E3DC"}`,background:checkFase===f?TEAL+"08":"#fff",textAlign:"center" as any,cursor:"pointer"}}>
                  <div style={{fontSize:11,fontWeight:600,color:checkFase===f?TEAL:DARK,textTransform:"capitalize" as any}}>{f}</div>
                  <div style={{fontSize:10,color:d===t?TEAL:"#9CA3AF",marginTop:2}}>{d}/{t}</div>
                </div>
              );
            })}
          </div>
          <ChecklistFase items={m.checklist||[]} onToggle={toggleCheck} fase={checkFase}/>
        </>}

        {/* MATERIALI RICHIESTI */}
        {tab==="materiali"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:DARK}}>Richieste al magazzino</span>
            <button onClick={()=>setShowRichiesta(true)} style={{padding:"8px 14px",borderRadius:9,background:TEAL,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FF}}>+ Richiedi</button>
          </div>
          {(m.materialiRichiesti||[]).length===0&&<div style={{textAlign:"center" as any,padding:"40px 20px",color:"#9CA3AF"}}><div style={{fontSize:32,marginBottom:8}}>[ ]</div><div style={{fontSize:13}}>Nessuna richiesta inviata</div></div>}
          {(m.materialiRichiesti||[]).map((r:any,i:number)=>{
            const uc:Record<string,string>={normale:TEAL,urgente:AMBER,bloccante:RED};
            return (
              <div key={i} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${uc[r.urgenza]}30`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:500,color:DARK,flex:1}}>{r.desc}</span>
                  <span style={{fontSize:13,fontWeight:700,color:DARK,fontFamily:FM,marginLeft:8}}>{r.qty} {r.um}</span>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:r.disegno?8:0}}>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:100,background:uc[r.urgenza]+"12",color:uc[r.urgenza],fontWeight:600}}>{r.urgenza}</span>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:100,background:"#F4F6F8",color:"#6B7280"}}>{r.stato}</span>
                  <span style={{fontSize:10,color:"#9CA3AF",marginLeft:"auto"}}>{r.ts}</span>
                </div>
                {r.disegno&&<img src={r.disegno} style={{width:"100%",borderRadius:8,border:"1px solid #E5E3DC"}} alt="schizzo"/>}
                {r.note&&<div style={{fontSize:11,color:"#6B7280",marginTop:4}}>{r.note}</div>}
              </div>
            );
          })}
        </>}

        {/* FOTO */}
        {tab==="foto"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:DARK}}>Foto cantiere ({(m.foto||[]).length})</span>
            <label style={{padding:"8px 14px",borderRadius:9,background:TEAL,color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>
              Scatta foto
              <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{
                const file=e.target.files?.[0];
                if(!file)return;
                const r=new FileReader();
                r.onload=()=>onUpdate({...m,foto:[...(m.foto||[]),{id:Date.now().toString(),url:r.result as string,ts:new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}]});
                r.readAsDataURL(file);
              }}/>
            </label>
          </div>
          {(m.foto||[]).length===0&&<div style={{textAlign:"center" as any,padding:"40px 20px",color:"#9CA3AF",borderRadius:12,border:"2px dashed #E5E3DC"}}><div style={{fontSize:13}}>Scatta foto durante il montaggio</div><div style={{fontSize:11,marginTop:4}}>Prima / Durante / Dopo ogni vano</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {(m.foto||[]).map((f:any,i:number)=>(
              <div key={i} style={{borderRadius:12,overflow:"hidden",aspectRatio:"4/3",background:"#F4F6F8",position:"relative" as any}}>
                <img src={f.url} style={{width:"100%",height:"100%",objectFit:"cover" as any}} alt=""/>
                <div style={{position:"absolute" as any,bottom:0,left:0,right:0,background:"rgba(0,0,0,0.5)",padding:"4px 8px",fontSize:10,color:"#fff"}}>{f.ts}</div>
              </div>
            ))}
          </div>
        </>}

        {/* PREVENTIVO */}
        {tab==="preventivo"&&<PreventivoView m={m}/>}

        {/* TEAM */}
        {tab==="team"&&<>
          <div style={{fontSize:12,color:"#6B7280",marginBottom:12}}>Contatti del lavoro</div>
          {[{ruolo:"Responsabile preventivo",nome:"Fabio Cozza",tel:"+39 0984 123456"},{ruolo:"Geometra misure",nome:"Paolo Greco",tel:"333 2222222"},{ruolo:"Responsabile ordini",nome:"Lidia Cozza",tel:"347 3333333"},{ruolo:"Magazziniere",nome:"Antonio Bruno",tel:"320 4444444"}].map((c,i)=>(
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
          {/* Criticita */}
          <div style={{marginTop:16,background:RED+"06",borderRadius:12,padding:"14px",border:`1px solid ${RED}20`}}>
            <div style={{fontSize:13,fontWeight:600,color:RED,marginBottom:8}}>Segnala problema urgente</div>
            <textarea placeholder="Descrivi il problema (infiltrazioni, misure errate, materiale mancante...)" rows={3} style={{width:"100%",padding:"10px 12px",border:`1px solid ${RED}25`,borderRadius:9,fontSize:13,fontFamily:FF,outline:"none",color:DARK,resize:"none" as any,background:"#fff",boxSizing:"border-box" as any}}/>
            <button style={{marginTop:8,width:"100%",padding:"11px",borderRadius:9,background:RED,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FF}}>Invia segnalazione urgente</button>
          </div>
        </>}
      </div>

      {showRichiesta&&<RichiestaMaterialiModal onSave={(r)=>{onUpdate({...m,materialiRichiesti:[...(m.materialiRichiesti||[]),r]});setShowRichiesta(false);}} onClose={()=>setShowRichiesta(false)}/>}
      {showFirma&&<FirmaCanvas cliente={`${m.cliente} ${m.cognome}`} onFirma={(firma)=>{onUpdate({...m,stato:"completato",firmaCliente:firma});setShowFirma(false);setTimerOn(false);}} onClose={()=>setShowFirma(false)}/>}
    </div>
  );
}

// ─── HOME CALENDARIO ──────────────────────────────────────────
function HomeCalendario({montaggi,operatore,onSelect,onLogout}:any) {
  const TODAY=new Date().toISOString().split("T")[0];
  const TOMORROW=new Date(Date.now()+86400000).toISOString().split("T")[0];
  const oggi=montaggi.filter((m:any)=>m.data===TODAY);
  const domani=montaggi.filter((m:any)=>m.data===TOMORROW);
  const altri=montaggi.filter((m:any)=>m.data!==TODAY&&m.data!==TOMORROW&&m.data>=TODAY);
  const statoC:Record<string,string>={programmato:BLUE,in_corso:AMBER,completato:TEAL,bloccato:RED};
  const fmtE=(n:number)=>"€"+n.toLocaleString("it-IT");

  const Card=({m}:{m:any})=>(
    <div onClick={()=>onSelect(m)} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${m.urgenza?RED+"40":"#E5E3DC"}`,cursor:"pointer",WebkitUserSelect:"none" as any}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            {m.urgenza&&<span style={{fontSize:11,fontWeight:700,color:RED,background:RED+"10",padding:"1px 6px",borderRadius:4}}>URGENTE</span>}
            <span style={{fontSize:16,fontWeight:700,color:DARK}}>{m.cliente} {m.cognome}</span>
          </div>
          <div style={{fontSize:12,color:"#6B7280"}}>{m.indirizzo}, {m.comune}</div>
        </div>
        <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:statoC[m.stato]+"12",color:statoC[m.stato],fontWeight:600,flexShrink:0,marginLeft:8}}>{m.stato}</span>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap" as any}}>
        <span style={{fontSize:12,color:"#6B7280"}}>Ore {m.oraInizio}-{m.oraFine}</span>
        <span style={{fontSize:12,color:"#6B7280"}}>{m.vani.length} vani</span>
        <span style={{fontSize:12,color:"#6B7280"}}>{m.sistema}</span>
        <span style={{fontSize:12,fontWeight:500,color:AMBER,marginLeft:"auto"}}>Saldo {fmtE(m.saldo)}</span>
      </div>
      <div style={{height:4,background:"#F4F6F8",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.round(((m.checklist||[]).filter((c:any)=>c.fatto).length/Math.max((m.checklist||[]).length,1))*100)}%`,background:TEAL,borderRadius:2}}/>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:FF}}>
      <div style={{background:DARK,padding:"16px 16px 12px",position:"sticky" as any,top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#fff",flexShrink:0}}>{operatore[0]}</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>Ciao, {operatore.split(" ")[0]}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>MASTRO MONTAGGI</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {[{l:"oggi",v:oggi.length},{l:"domani",v:domani.length}].map((k,i)=>(
              <div key={i} style={{textAlign:"center" as any,padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:18,fontWeight:700,color:k.v>0?TEAL:"rgba(255,255,255,0.3)",fontFamily:FM}}>{k.v}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{k.l}</div>
              </div>
            ))}
            <button onClick={onLogout} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:11,fontFamily:FF}}>Esci</button>
          </div>
        </div>
      </div>
      <div style={{padding:16}}>
        {oggi.length>0&&<>
          <div style={{fontSize:11,fontWeight:700,color:TEAL,textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10}}>Oggi · {new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"})}</div>
          {oggi.map((m:any)=><Card key={m.id} m={m}/>)}
        </>}
        {oggi.length===0&&<div style={{textAlign:"center" as any,padding:"28px 20px",background:"#fff",borderRadius:14,border:"1px solid #E5E3DC",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:600,color:DARK,marginBottom:4}}>Nessun montaggio oggi</div>
          <div style={{fontSize:12,color:"#9CA3AF"}}>Buona giornata, {operatore.split(" ")[0]}</div>
        </div>}
        {domani.length>0&&<>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10,marginTop:8}}>Domani</div>
          {domani.map((m:any)=><Card key={m.id} m={m}/>)}
        </>}
        {altri.length>0&&<>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10,marginTop:8}}>Prossimi</div>
          {altri.map((m:any)=><Card key={m.id} m={m}/>)}
        </>}
      </div>
      {/* FAB urgenza */}
      <button style={{position:"fixed" as any,bottom:24,right:16,width:54,height:54,borderRadius:16,background:RED,color:"#fff",border:"none",fontSize:22,cursor:"pointer",boxShadow:"0 4px 16px rgba(220,68,68,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,fontWeight:700}}>!</button>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function MastroMontaggi() {
  const [operatore,setOperatore]=useState<string|null>(null);
  const [montaggi,setMontaggi]=useState(MONTAGGI_DEMO);
  const [sel,setSel]=useState<any>(null);
  const upd=(updated:any)=>{setMontaggi(ms=>ms.map(m=>m.id===updated.id?updated:m));if(sel?.id===updated.id)setSel(updated);};
  if(!operatore)return <LoginPIN onLogin={setOperatore}/>;
  if(sel)return <DettaglioMontaggio m={sel} operatore={operatore} onBack={()=>setSel(null)} onUpdate={upd}/>;
  return <HomeCalendario montaggi={montaggi} operatore={operatore} onSelect={setSel} onLogout={()=>setOperatore(null)}/>;
}
