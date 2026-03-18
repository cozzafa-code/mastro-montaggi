"use client";
// @ts-nocheck
// MASTRO MONTAGGI v3 — Richieste multimedia + Workflow timeline completo

import React, { useState, useRef, useEffect } from "react";

const TEAL="#1A9E73", DARK="#1A1A1C", RED="#DC4444", AMBER="#E8A020", BLUE="#3B7FE0", PURPLE="#8B5CF6", ORANGE="#F97316";
const FF="Inter,system-ui,sans-serif", FM="JetBrains Mono,monospace";

// ─── DATI DEMO ───────────────────────────────────────────────
const MONTAGGI_DEMO = [
  {
    id:"m1", cmId:"cm001", code:"S-0042",
    cliente:"Anna", cognome:"Russo",
    indirizzo:"Via Roma 12", comune:"Cosenza", piano:"3 piano int.4",
    tel:"339 1234567",
    data: new Date().toISOString().split("T")[0],
    oraInizio:"08:30", oraFine:"16:00",
    stato:"in_corso", urgenza:false,
    operatori:["Marco Vito","Luigi Perri"],
    tempoStimato:450,
    note:"Accesso dal portone laterale. Parcheggio sul retro. Campanello RUSSO.",
    sistema:"Schuco AWS 90 SI+",
    importo:8450, acconto:2535, saldo:5915,
    vani:[
      {id:"v1",nome:"Salone",tipo:"Scorrevole HST 2 ante",mis:"2400x2200",col:"RAL 7016",uw:"1.1",note:"Smontare vecchio serramento"},
      {id:"v2",nome:"Camera",tipo:"Finestra 2 ante",mis:"1400x1400",col:"RAL 7016",uw:"1.3",note:""},
      {id:"v3",nome:"Cameretta",tipo:"Finestra 1 anta",mis:"1000x1200",col:"RAL 7016",uw:"1.3",note:"Zanzariera inclusa"},
      {id:"v4",nome:"Bagno",tipo:"Vasistas",mis:"600x600",col:"RAL 9010",uw:"1.4",note:"Solo vetro opaco"},
    ],
    materiali:[
      {cod:"SCH-001",desc:"Profilo Schuco AWS90 traverso",qty:8,um:"cad"},
      {cod:"VET-001",desc:"Vetro camera 4/16/4 Basso Em.",qty:4,um:"mq"},
      {cod:"FER-001",desc:"Ferramenta anta battente Roto",qty:3,um:"set"},
      {cod:"ACC-001",desc:"Zanzariera laterale 1000x1200",qty:1,um:"cad"},
    ],
    checklist:[
      {id:"c1",testo:"Carico materiali su furgone",fatto:true,obbligatorio:true,fase:"carico"},
      {id:"c2",testo:"DPI caricati",fatto:true,obbligatorio:true,fase:"carico"},
      {id:"c3",testo:"Scheda tecnica stampata",fatto:true,obbligatorio:false,fase:"carico"},
      {id:"p1",testo:"Sopralluogo vani: conferma misure",fatto:true,obbligatorio:true,fase:"posa"},
      {id:"p2",testo:"Smontaggio infissi vecchi",fatto:false,obbligatorio:false,fase:"posa"},
      {id:"p3",testo:"Posa vano 1 - Salone",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p4",testo:"Posa vano 2 - Camera",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p5",testo:"Posa vano 3 - Cameretta",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p6",testo:"Posa vano 4 - Bagno",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p7",testo:"Sigillatura esterna",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"q1",testo:"Test apertura ogni anta",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q2",testo:"Regolazione cerniere 3D",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q3",testo:"Verifica guarnizioni",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"q4",testo:"Nessuna infiltrazione",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"s1",testo:"Raccolta materiale eccedente",fatto:false,obbligatorio:true,fase:"scarico"},
      {id:"s2",testo:"Smaltimento imballi",fatto:false,obbligatorio:true,fase:"scarico"},
      {id:"s3",testo:"Foto documentazione",fatto:false,obbligatorio:true,fase:"scarico"},
      {id:"s4",testo:"Firma cliente",fatto:false,obbligatorio:true,fase:"scarico"},
    ],
    foto:[], materialiRichiesti:[],
    preventivo:{numero:"PREV-2026-042",data:"5 Feb 2026",validita:"30 giorni",note:"Prezzi IVA 10% inclusa. Smontaggio incluso."},
    workflow:[
      {id:"w1",chi:"Paolo Greco",ruolo:"Geometra",azione:"Sopralluogo e rilievo misure",data:"7 Feb 2026",ora:"09:30",stato:"fatto",note:"4 vani rilevati. Misure confermate."},
      {id:"w2",chi:"Fabio Cozza",ruolo:"Preventivista",azione:"Preventivo redatto e inviato",data:"8 Feb 2026",ora:"11:00",stato:"fatto",note:"Preventivo PREV-2026-042 inviato via WhatsApp"},
      {id:"w3",chi:"Anna Russo",ruolo:"Cliente",azione:"Preventivo firmato e acconto pagato",data:"10 Feb 2026",ora:"14:30",stato:"fatto",note:"Acconto €2.535 pagato. Commessa confermata."},
      {id:"w4",chi:"Lidia Cozza",ruolo:"Resp. Ordini",azione:"Ordine Schuco inviato",data:"11 Feb 2026",ora:"09:00",stato:"fatto",note:"Ordine N.2026-089 inviato. Consegna prevista 20 Feb."},
      {id:"w5",chi:"Antonio Bruno",ruolo:"Magazziniere",azione:"Materiale ricevuto e verificato",data:"20 Feb 2026",ora:"08:00",stato:"fatto",note:"Tutto ok. Profili, vetri e ferramenta in magazzino."},
      {id:"w6",chi:"Antonio Bruno",ruolo:"Magazziniere",azione:"Carico furgone Marco Vito",data:"18 Mar 2026",ora:"07:30",stato:"fatto",note:"8 profili, 4 lastre vetro, ferramenta, consumabili"},
      {id:"w7",chi:"Marco Vito",ruolo:"Montatore",azione:"Inizio montaggio",data:"18 Mar 2026",ora:"08:30",stato:"in_corso",note:"Cantiere aperto. 4 vani da installare."},
      {id:"w8",chi:"Marco Vito",ruolo:"Montatore",azione:"Collaudo e firma cliente",data:"18 Mar 2026",ora:"—",stato:"attesa",note:""},
      {id:"w9",chi:"Fabio Cozza",ruolo:"Ufficio",azione:"Emissione fattura saldo",data:"—",ora:"—",stato:"attesa",note:"Saldo €5.915 da incassare"},
    ]
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
    note:"URGENTE: cliente aspetta muratore nel pomeriggio. Solo mattina.",
    sistema:"Aluplast 76mm PVC",
    importo:3200, acconto:960, saldo:2240,
    vani:[
      {id:"v5",nome:"Cucina",tipo:"Finestra 2 ante",mis:"1200x1400",col:"RAL 9010",uw:"1.3",note:""},
      {id:"v6",nome:"Salotto",tipo:"Porta finestra",mis:"900x2200",col:"RAL 9010",uw:"1.3",note:"Maniglia alzante"},
    ],
    materiali:[{cod:"ALU-001",desc:"Profilo PVC Aluplast 76",qty:10,um:"ml"},{cod:"VET-002",desc:"Vetro camera 4/16/4",qty:2,um:"mq"}],
    checklist:[
      {id:"c1",testo:"Carico materiali",fatto:false,obbligatorio:true,fase:"carico"},
      {id:"p1",testo:"Posa cucina",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"p2",testo:"Posa porta finestra salotto",fatto:false,obbligatorio:true,fase:"posa"},
      {id:"q1",testo:"Collaudo apertura",fatto:false,obbligatorio:true,fase:"collaudo"},
      {id:"s1",testo:"Firma cliente",fatto:false,obbligatorio:true,fase:"scarico"},
    ],
    foto:[], materialiRichiesti:[],
    preventivo:{numero:"PREV-2026-039",data:"1 Feb 2026",validita:"30 giorni",note:""},
    workflow:[
      {id:"w1",chi:"Paolo Greco",ruolo:"Geometra",azione:"Sopralluogo misure",data:"2 Feb 2026",ora:"10:00",stato:"fatto",note:"2 vani. Misure ok."},
      {id:"w2",chi:"Fabio Cozza",ruolo:"Preventivista",azione:"Preventivo inviato",data:"3 Feb 2026",ora:"09:00",stato:"fatto",note:""},
      {id:"w3",chi:"Mario Esposito",ruolo:"Cliente",azione:"Acconto pagato",data:"5 Feb 2026",ora:"15:00",stato:"fatto",note:"Acconto €960"},
      {id:"w4",chi:"Lidia Cozza",ruolo:"Resp. Ordini",azione:"Ordine Aluplast inviato",data:"6 Feb 2026",ora:"09:00",stato:"fatto",note:""},
      {id:"w5",chi:"Antonio Bruno",ruolo:"Magazziniere",azione:"Materiale in magazzino",data:"15 Feb 2026",ora:"08:00",stato:"fatto",note:""},
      {id:"w6",chi:"Marco Vito",ruolo:"Montatore",azione:"Montaggio",data:"19 Mar 2026",ora:"09:00",stato:"attesa",note:""},
    ]
  },
];

// ─── LOGIN PIN ────────────────────────────────────────────────
function LoginPIN({onLogin}:{onLogin:(n:string)=>void}) {
  const [pin,setPin]=useState(""); const [err,setErr]=useState(false);
  const PINS:Record<string,string>={"1234":"Marco Vito","5678":"Luigi Perri","9012":"Antonio Bruno","3456":"Sara Greco"};
  const press=(n:string)=>{
    if(pin.length>=4)return; const p=pin+n; setPin(p); setErr(false);
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

// ─── RICHIESTA MATERIALI MULTIMEDIA ──────────────────────────
function RichiestaMaterialiModal({onSave,onClose}:{onSave:(r:any)=>void;onClose:()=>void}) {
  const [desc,setDesc]=useState(""); const [qty,setQty]=useState("1"); const [um,setUm]=useState("pz");
  const [urgenza,setUrgenza]=useState<"normale"|"urgente"|"bloccante">("normale");
  const [note,setNote]=useState("");
  const [mediaTab,setMediaTab]=useState<"nessuno"|"disegno"|"foto"|"video"|"vocale">("nessuno");
  // Canvas disegno
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [drawing,setDrawing]=useState(false);
  const last=useRef({x:0,y:0});
  // Foto con disegno sopra
  const [fotoBase,setFotoBase]=useState<string|null>(null);
  const canvasFotoRef=useRef<HTMLCanvasElement>(null);
  const [drawingFoto,setDrawingFoto]=useState(false);
  const lastFoto=useRef({x:0,y:0});
  const [penColor,setPenColor]=useState(RED);
  // Video
  const [videoUrl,setVideoUrl]=useState<string|null>(null);
  // Vocale
  const [isRecording,setIsRecording]=useState(false);
  const [audioUrl,setAudioUrl]=useState<string|null>(null);
  const [recTime,setRecTime]=useState(0);
  const mediaRecRef=useRef<MediaRecorder|null>(null);
  const chunksRef=useRef<BlobPart[]>([]);
  const timerRef=useRef<any>();

  // Canvas draw handlers
  const startD=(e:any,ref:any,lastR:any,setD:any)=>{setD(true);const r=ref.current!.getBoundingClientRect();const t=e.touches?.[0]||e;lastR.current={x:t.clientX-r.left,y:t.clientY-r.top};};
  const moveD=(e:any,ref:any,lastR:any,isD:boolean,color:string="black")=>{
    if(!isD||!ref.current)return; e.preventDefault();
    const ctx=ref.current.getContext("2d")!;
    const r=ref.current.getBoundingClientRect();
    const t=e.touches?.[0]||e; const x=t.clientX-r.left,y=t.clientY-r.top;
    ctx.beginPath();ctx.moveTo(lastR.current.x,lastR.current.y);ctx.lineTo(x,y);
    ctx.strokeStyle=color;ctx.lineWidth=3;ctx.lineCap="round";ctx.stroke();
    lastR.current={x,y};
  };
  const clearCanvas=(ref:any)=>{const ctx=ref.current?.getContext("2d");if(ctx&&ref.current)ctx.clearRect(0,0,ref.current.width,ref.current.height);};

  // Carica foto e disegna sopra
  const loadFoto=(file:File)=>{
    const r=new FileReader();
    r.onload=()=>{
      setFotoBase(r.result as string);
      setTimeout(()=>{
        if(canvasFotoRef.current){
          const img=new Image();
          img.onload=()=>{
            const ctx=canvasFotoRef.current!.getContext("2d")!;
            canvasFotoRef.current!.width=img.naturalWidth>500?500:img.naturalWidth;
            canvasFotoRef.current!.height=img.naturalHeight*(canvasFotoRef.current!.width/img.naturalWidth);
            ctx.drawImage(img,0,0,canvasFotoRef.current!.width,canvasFotoRef.current!.height);
          };
          img.src=r.result as string;
        }
      },100);
    };
    r.readAsDataURL(file);
  };

  // Registrazione vocale
  const startRec=async()=>{
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mr=new MediaRecorder(stream);
      mediaRecRef.current=mr; chunksRef.current=[];
      mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
      mr.onstop=()=>{
        const blob=new Blob(chunksRef.current,{type:"audio/webm"});
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t=>t.stop());
      };
      mr.start(); setIsRecording(true); setRecTime(0);
      timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000);
    } catch(e){alert("Microfono non disponibile");}
  };
  const stopRec=()=>{
    mediaRecRef.current?.stop(); setIsRecording(false); clearInterval(timerRef.current);
  };

  const getMedia=()=>{
    if(mediaTab==="disegno"&&canvasRef.current)return{tipo:"disegno",url:canvasRef.current.toDataURL()};
    if(mediaTab==="foto"&&canvasFotoRef.current)return{tipo:"foto_annotata",url:canvasFotoRef.current.toDataURL()};
    if(mediaTab==="video"&&videoUrl)return{tipo:"video",url:videoUrl};
    if(mediaTab==="vocale"&&audioUrl)return{tipo:"vocale",url:audioUrl};
    return null;
  };

  const save=()=>{
    if(!desc.trim())return;
    onSave({id:Date.now().toString(),desc,qty:parseInt(qty)||1,um,urgenza,note,media:getMedia(),stato:"inviata",ts:new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})});
  };

  const urgC:Record<string,string>={normale:TEAL,urgente:AMBER,bloccante:RED};

  return (
    <div style={{position:"fixed" as any,inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",flexDirection:"column" as any,justifyContent:"flex-end"}}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",maxHeight:"96vh",display:"flex",flexDirection:"column" as any,fontFamily:FF}}>
        {/* Header */}
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid #E5E3DC",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:17,fontWeight:600,color:DARK}}>Richiedi materiale</div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",border:"none",background:"#F4F6F8",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
          </div>
        </div>
        {/* Contenuto scrollabile */}
        <div style={{flex:1,overflowY:"auto" as any,padding:"14px 16px"}}>
          {/* Urgenza */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {(["normale","urgente","bloccante"] as const).map(u=>(
              <div key={u} onClick={()=>setUrgenza(u)} style={{padding:"11px 6px",borderRadius:10,border:`2px solid ${urgenza===u?urgC[u]:"#E5E3DC"}`,background:urgenza===u?urgC[u]+"10":"transparent",textAlign:"center" as any,cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:600,color:urgenza===u?urgC[u]:DARK,textTransform:"capitalize" as any}}>{u}</div>
              </div>
            ))}
          </div>
          {/* Descrizione */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Cosa serve *</div>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Es. Lamiera angolare 200x100mm, profilo speciale..." style={{width:"100%",padding:"11px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FF,outline:"none",color:DARK,boxSizing:"border-box" as any}}/>
          </div>
          {/* Qty + Um */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Quantita</div>
              <input type="number" value={qty} onChange={e=>setQty(e.target.value)} min="1" style={{width:"100%",padding:"11px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:16,fontFamily:FM,outline:"none",color:DARK}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Unita</div>
              <select value={um} onChange={e=>setUm(e.target.value)} style={{width:"100%",padding:"11px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:14,fontFamily:FF,outline:"none",color:DARK,background:"#fff"}}>
                {["pz","ml","mq","kg","set","rotolo","litri"].map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          {/* Note */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:5}}>Note</div>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Dimensioni, colore, codice articolo..." style={{width:"100%",padding:"10px 12px",border:"1px solid #E5E3DC",borderRadius:9,fontSize:13,fontFamily:FF,outline:"none",color:DARK,resize:"none" as any,boxSizing:"border-box" as any}}/>
          </div>

          {/* MEDIA SELECTOR */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,marginBottom:8}}>Allegato (opzionale)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:12}}>
              {[
                {id:"nessuno",l:"Nessuno",c:"#6B7280"},
                {id:"disegno",l:"Disegno",c:BLUE},
                {id:"foto",l:"Foto",c:TEAL},
                {id:"video",l:"Video",c:PURPLE},
                {id:"vocale",l:"Vocale",c:ORANGE},
              ].map(btn=>(
                <div key={btn.id} onClick={()=>setMediaTab(btn.id as any)}
                  style={{padding:"8px 4px",borderRadius:9,border:`2px solid ${mediaTab===btn.id?btn.c:"#E5E3DC"}`,background:mediaTab===btn.id?btn.c+"10":"transparent",textAlign:"center" as any,cursor:"pointer"}}>
                  <div style={{fontSize:11,fontWeight:600,color:mediaTab===btn.id?btn.c:"#6B7280"}}>{btn.l}</div>
                </div>
              ))}
            </div>

            {/* DISEGNO LIBERO */}
            {mediaTab==="disegno"&&(
              <div style={{border:"1px solid #E5E3DC",borderRadius:12,overflow:"hidden",background:"#FAFAFA"}}>
                <div style={{padding:"8px 12px",borderBottom:"1px solid #E5E3DC",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#F8FAFC"}}>
                  <span style={{fontSize:12,fontWeight:500,color:DARK}}>Disegna il pezzo che serve</span>
                  <button onClick={()=>clearCanvas(canvasRef)} style={{padding:"4px 10px",borderRadius:6,background:"#F4F6F8",border:"none",fontSize:11,cursor:"pointer",color:"#6B7280"}}>Cancella</button>
                </div>
                <canvas ref={canvasRef} width={400} height={280}
                  style={{width:"100%",height:280,display:"block",touchAction:"none" as any,cursor:"crosshair"}}
                  onMouseDown={e=>startD(e,canvasRef,last,setDrawing)}
                  onMouseMove={e=>moveD(e,canvasRef,last,drawing)}
                  onMouseUp={()=>setDrawing(false)} onMouseLeave={()=>setDrawing(false)}
                  onTouchStart={e=>startD(e,canvasRef,last,setDrawing)}
                  onTouchMove={e=>moveD(e,canvasRef,last,drawing)}
                  onTouchEnd={()=>setDrawing(false)}/>
              </div>
            )}

            {/* FOTO CON ANNOTAZIONI */}
            {mediaTab==="foto"&&(
              <div style={{border:"1px solid #E5E3DC",borderRadius:12,overflow:"hidden"}}>
                {!fotoBase?(
                  <label style={{display:"flex",flexDirection:"column" as any,alignItems:"center",justifyContent:"center",padding:"28px 20px",background:"#F8FAFC",cursor:"pointer",textAlign:"center" as any}}>
                    <div style={{fontSize:36,marginBottom:8}}>📷</div>
                    <div style={{fontSize:14,fontWeight:500,color:DARK,marginBottom:4}}>Scatta o scegli foto</div>
                    <div style={{fontSize:12,color:"#9CA3AF"}}>Poi potrai disegnare sopra</div>
                    <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files?.[0])loadFoto(e.target.files[0]);}}/>
                  </label>
                ):(
                  <div>
                    <div style={{padding:"8px 12px",borderBottom:"1px solid #E5E3DC",display:"flex",gap:6,alignItems:"center",background:"#F8FAFC",flexWrap:"wrap" as any}}>
                      <span style={{fontSize:12,fontWeight:500,color:DARK,marginRight:4}}>Disegna sopra:</span>
                      {[RED,"#1A9E73","#3B7FE0","#F97316","#1A1A1C"].map(c=>(
                        <div key={c} onClick={()=>setPenColor(c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:`2px solid ${penColor===c?"#fff":"transparent"}`,cursor:"pointer",outline:penColor===c?`2px solid ${c}`:"none"}}/>
                      ))}
                      <button onClick={()=>clearCanvas(canvasFotoRef)} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,background:"#F4F6F8",border:"none",fontSize:11,cursor:"pointer",color:"#6B7280"}}>Reset</button>
                      <button onClick={()=>setFotoBase(null)} style={{padding:"4px 10px",borderRadius:6,background:RED+"10",border:"none",fontSize:11,cursor:"pointer",color:RED}}>Cambia foto</button>
                    </div>
                    <canvas ref={canvasFotoRef}
                      style={{width:"100%",display:"block",touchAction:"none" as any,cursor:"crosshair"}}
                      onMouseDown={e=>startD(e,canvasFotoRef,lastFoto,setDrawingFoto)}
                      onMouseMove={e=>moveD(e,canvasFotoRef,lastFoto,drawingFoto,penColor)}
                      onMouseUp={()=>setDrawingFoto(false)} onMouseLeave={()=>setDrawingFoto(false)}
                      onTouchStart={e=>startD(e,canvasFotoRef,lastFoto,setDrawingFoto)}
                      onTouchMove={e=>moveD(e,canvasFotoRef,lastFoto,drawingFoto,penColor)}
                      onTouchEnd={()=>setDrawingFoto(false)}/>
                  </div>
                )}
              </div>
            )}

            {/* VIDEO */}
            {mediaTab==="video"&&(
              <div style={{border:"1px solid #E5E3DC",borderRadius:12,overflow:"hidden"}}>
                {!videoUrl?(
                  <label style={{display:"flex",flexDirection:"column" as any,alignItems:"center",justifyContent:"center",padding:"28px 20px",background:"#F8FAFC",cursor:"pointer",textAlign:"center" as any}}>
                    <div style={{width:56,height:56,borderRadius:16,background:PURPLE+"15",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    </div>
                    <div style={{fontSize:14,fontWeight:500,color:DARK,marginBottom:4}}>Registra o scegli video</div>
                    <div style={{fontSize:12,color:"#9CA3AF"}}>Max 30 secondi consigliati</div>
                    <input type="file" accept="video/*" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files?.[0])setVideoUrl(URL.createObjectURL(e.target.files[0]));}}/>
                  </label>
                ):(
                  <div style={{padding:12}}>
                    <video src={videoUrl} controls style={{width:"100%",borderRadius:8}}/>
                    <button onClick={()=>setVideoUrl(null)} style={{marginTop:8,width:"100%",padding:"8px",borderRadius:8,background:RED+"10",border:"none",fontSize:12,color:RED,cursor:"pointer"}}>Rimuovi video</button>
                  </div>
                )}
              </div>
            )}

            {/* VOCALE */}
            {mediaTab==="vocale"&&(
              <div style={{border:"1px solid #E5E3DC",borderRadius:12,padding:16,background:"#F8FAFC",textAlign:"center" as any}}>
                {!audioUrl?(
                  <>
                    <div style={{width:72,height:72,borderRadius:"50%",background:isRecording?RED:ORANGE,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",cursor:"pointer",boxShadow:isRecording?`0 0 0 8px ${RED}30`:"none",transition:"all .3s"}} onClick={isRecording?stopRec:startRec}>
                      {isRecording?(
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                      ):(
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
                      )}
                    </div>
                    {isRecording?(
                      <div>
                        <div style={{fontSize:18,fontWeight:700,color:RED,fontFamily:FM}}>{String(Math.floor(recTime/60)).padStart(2,"0")}:{String(recTime%60).padStart(2,"0")}</div>
                        <div style={{fontSize:13,color:RED,marginTop:4}}>Registrazione in corso... tocca per fermare</div>
                      </div>
                    ):(
                      <div>
                        <div style={{fontSize:14,fontWeight:500,color:DARK}}>Tocca per registrare</div>
                        <div style={{fontSize:12,color:"#9CA3AF",marginTop:4}}>Descrivi a voce cosa serve</div>
                      </div>
                    )}
                  </>
                ):(
                  <div>
                    <audio src={audioUrl} controls style={{width:"100%",marginBottom:8}}/>
                    <button onClick={()=>{setAudioUrl(null);setRecTime(0);}} style={{width:"100%",padding:"8px",borderRadius:8,background:RED+"10",border:"none",fontSize:12,color:RED,cursor:"pointer"}}>Registra di nuovo</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer fisso */}
        <div style={{padding:"12px 16px",borderTop:"1px solid #E5E3DC",flexShrink:0,background:"#fff"}}>
          <button onClick={save} disabled={!desc.trim()}
            style={{width:"100%",padding:"15px",borderRadius:14,background:!desc.trim()?"#E5E3DC":urgenza==="bloccante"?RED:urgenza==="urgente"?AMBER:TEAL,color:!desc.trim()?"#9CA3AF":"#fff",border:"none",fontSize:15,fontWeight:600,cursor:!desc.trim()?"not-allowed":"pointer",fontFamily:FF}}>
            {urgenza==="bloccante"?"URGENTISSIMO — Invia al magazzino":urgenza==="urgente"?"Invia urgente al magazzino":"Invia richiesta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WORKFLOW TIMELINE ────────────────────────────────────────
function WorkflowTimeline({workflow}:{workflow:any[]}) {
  const statoC:Record<string,string>={fatto:TEAL,in_corso:AMBER,attesa:"#D1D5DB"};
  const statoLabel:Record<string,string>={fatto:"Fatto",in_corso:"In corso",attesa:"In attesa"};
  return (
    <div>
      <div style={{fontSize:12,color:"#6B7280",marginBottom:16}}>Storico completo della commessa — chi ha fatto cosa e quando</div>
      {workflow.map((step,i)=>{
        const sc=statoC[step.stato]||"#D1D5DB";
        const isCurr=step.stato==="in_corso";
        const isDone=step.stato==="fatto";
        return (
          <div key={step.id} style={{display:"flex",gap:12,marginBottom:0}}>
            {/* Timeline line */}
            <div style={{display:"flex",flexDirection:"column" as any,alignItems:"center",width:32,flexShrink:0}}>
              <div style={{width:isCurr?28:20,height:isCurr?28:20,borderRadius:"50%",background:isDone?TEAL:isCurr?AMBER:"#F4F6F8",border:`2px solid ${sc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:isCurr?`0 0 0 4px ${AMBER}25`:isDone?`0 0 0 3px ${TEAL}15`:"none",transition:"all .2s"}}>
                {isDone&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                {isCurr&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                {!isDone&&!isCurr&&<div style={{width:6,height:6,borderRadius:"50%",background:"#D1D5DB"}}/>}
              </div>
              {i<workflow.length-1&&<div style={{width:2,flex:1,minHeight:24,background:isDone?TEAL+"30":"#E5E3DC",marginTop:2}}/>}
            </div>
            {/* Contenuto */}
            <div style={{flex:1,paddingBottom:16}}>
              <div style={{background:isCurr?AMBER+"06":isDone?"#fff":"#F8FAFC",borderRadius:12,padding:"12px 14px",border:`1px solid ${isCurr?AMBER+"30":isDone?TEAL+"20":"#E5E3DC"}`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:isDone||isCurr?DARK:"#9CA3AF"}}>{step.azione}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                      <div style={{width:22,height:22,borderRadius:6,background:sc+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:sc,flexShrink:0}}>{step.chi[0]}</div>
                      <span style={{fontSize:12,color:"#6B7280"}}>{step.chi}</span>
                      <span style={{fontSize:10,color:"#9CA3AF"}}>· {step.ruolo}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right" as any,flexShrink:0,marginLeft:8}}>
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:sc+"15",color:sc,fontWeight:600}}>{statoLabel[step.stato]}</span>
                    {step.data!=="—"&&<div style={{fontSize:10,color:"#9CA3AF",marginTop:3}}>{step.data}</div>}
                    {step.ora!=="—"&&<div style={{fontSize:10,color:"#9CA3AF"}}>{step.ora}</div>}
                  </div>
                </div>
                {step.note&&<div style={{fontSize:11,color:isDone?"#6B7280":"#9CA3AF",background:isDone?"#F8FAFC":"transparent",borderRadius:6,padding:isDone?"5px 8px":"0",marginTop:isDone?4:0,lineHeight:1.4}}>{step.note}</div>}
              </div>
            </div>
          </div>
        );
      })}
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
        <div style={{fontSize:13,color:"#6B7280",marginBottom:14}}>Il/La signor/a {cliente} conferma la corretta installazione e accetta il lavoro.</div>
        <canvas ref={canvasRef} width={460} height={160} style={{width:"100%",height:160,border:"2px solid #E5E3DC",borderRadius:12,background:"#FAFAFA",touchAction:"none" as any,display:"block"}} onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={move} onTouchEnd={stop}/>
        <div style={{borderTop:"1px dashed #D1D5DB",margin:"6px 0 14px",textAlign:"center" as any,fontSize:10,color:"#9CA3AF"}}>firma qui sopra</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={clear} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #E5E3DC",background:"transparent",fontSize:13,cursor:"pointer",fontFamily:FF,color:"#6B7280"}}>Cancella</button>
          <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #E5E3DC",background:"transparent",fontSize:13,cursor:"pointer",fontFamily:FF,color:"#6B7280"}}>Annulla</button>
          <button onClick={()=>{if(hasFirma&&canvasRef.current)onFirma(canvasRef.current.toDataURL());}} disabled={!hasFirma} style={{flex:2,padding:"11px",borderRadius:10,background:hasFirma?TEAL:"#E5E3DC",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:hasFirma?"pointer":"not-allowed",fontFamily:FF}}>Conferma firma</button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKLIST ────────────────────────────────────────────────
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
        <div key={item.id} onClick={()=>onToggle(item.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,marginBottom:6,background:item.fatto?TEAL+"08":"#fff",border:`1px solid ${item.fatto?TEAL+"30":"#E5E3DC"}`,cursor:"pointer",WebkitUserSelect:"none" as any}}>
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

// ─── DETTAGLIO MONTAGGIO ──────────────────────────────────────
function DettaglioMontaggio({m,operatore,onBack,onUpdate}:{m:any;operatore:string;onBack:()=>void;onUpdate:(m:any)=>void}) {
  const [tab,setTab]=useState<"info"|"vani"|"checklist"|"richieste"|"foto"|"preventivo"|"workflow"|"team">("info");
  const [checkFase,setCheckFase]=useState<"carico"|"posa"|"collaudo"|"scarico">("carico");
  const [showRichiesta,setShowRichiesta]=useState(false);
  const [showFirma,setShowFirma]=useState(false);
  const [timer,setTimer]=useState(0);
  const [timerOn,setTimerOn]=useState(false);
  const timerRef=useRef<any>();
  useEffect(()=>{if(timerOn)timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);else clearInterval(timerRef.current);return()=>clearInterval(timerRef.current);},[timerOn]);
  const fmtTimer=(s:number)=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const toggleCheck=(id:string)=>onUpdate({...m,checklist:(m.checklist||[]).map((c:any)=>c.id===id?{...c,fatto:!c.fatto}:c)});
  const totDone=(m.checklist||[]).filter((c:any)=>c.fatto).length;
  const totTot=(m.checklist||[]).length;
  const fmtE=(n:number)=>"€"+n.toLocaleString("it-IT");
  const statoC:Record<string,string>={programmato:BLUE,in_corso:AMBER,completato:TEAL,bloccato:RED};
  const TABS=[["info","Info"],["vani","Vani"],["checklist","Lista"],["richieste","Richieste"],["foto","Foto"],["preventivo","Preventivo"],["workflow","Workflow"],["team","Team"]];

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:FF}}>
      <div style={{background:DARK,padding:"14px 16px 0",position:"sticky" as any,top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <button onClick={onBack} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{"<"}</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{m.cliente} {m.cognome}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{m.code} · {m.comune} · {m.oraInizio}–{m.oraFine}</div>
          </div>
          <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:statoC[m.stato]+"25",color:statoC[m.stato],fontWeight:600}}>{m.stato}</span>
        </div>
        <div style={{height:3,background:"rgba(255,255,255,0.1)",borderRadius:2,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${totTot>0?Math.round(totDone/totTot*100):0}%`,background:TEAL,borderRadius:2}}/>
        </div>
        {m.stato==="programmato"&&<button onClick={()=>{onUpdate({...m,stato:"in_corso"});setTimerOn(true);}} style={{width:"100%",padding:"11px",background:TEAL,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FF}}>Inizia montaggio</button>}
        {m.stato==="in_corso"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
          <div style={{padding:"8px",textAlign:"center" as any}}><div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:FM}}>{fmtTimer(timer)}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>tempo trascorso</div></div>
          <button onClick={()=>setShowFirma(true)} style={{padding:"8px",background:TEAL,color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FF}}>Completa + Firma</button>
        </div>}
        {m.stato==="completato"&&<div style={{padding:"10px",background:TEAL+"20",textAlign:"center" as any}}><span style={{fontSize:13,fontWeight:600,color:TEAL}}>Montaggio completato</span></div>}
        <div style={{display:"flex",overflowX:"auto" as any,scrollbarWidth:"none" as any}}>
          {TABS.map(([id,l])=>(
            <div key={id} onClick={()=>setTab(id as any)} style={{padding:"9px 11px",fontSize:11,fontWeight:tab===id?600:400,color:tab===id?"#fff":"rgba(255,255,255,0.4)",borderBottom:`2px solid ${tab===id?TEAL:"transparent"}`,cursor:"pointer",whiteSpace:"nowrap" as any,flexShrink:0}}>
              {l}{id==="richieste"&&(m.materialiRichiesti||[]).length>0&&<span style={{marginLeft:3,fontSize:9,background:AMBER,color:"#fff",borderRadius:8,padding:"0 4px"}}>{(m.materialiRichiesti||[]).length}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:16,paddingBottom:80}}>
        {tab==="info"&&<>
          {m.urgenza&&<div style={{background:RED+"08",border:`1px solid ${RED}25`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,fontWeight:500,color:RED}}>URGENTE</div>}
          {[{l:"Indirizzo",v:`${m.indirizzo}, ${m.comune}`},{l:"Piano",v:m.piano},{l:"Telefono",v:m.tel},{l:"Orario",v:`${m.oraInizio} - ${m.oraFine}`},{l:"Sistema",v:m.sistema},{l:"Saldo da incassare",v:fmtE(m.saldo)}].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,marginBottom:5,background:"#fff",border:"1px solid #E5E3DC"}}>
              <span style={{fontSize:13,color:"#6B7280"}}>{r.l}</span>
              <span style={{fontSize:13,fontWeight:500,color:i===5?AMBER:DARK}}>{r.v}</span>
            </div>
          ))}
          {m.note&&<div style={{background:"#FFF8E7",border:"1px solid #FDE68A",borderRadius:10,padding:"12px 14px",marginTop:8}}><div style={{fontSize:11,fontWeight:700,color:AMBER,marginBottom:4}}>NOTE</div><div style={{fontSize:13,color:DARK,lineHeight:1.6}}>{m.note}</div></div>}
          <a href={`https://maps.google.com/?q=${encodeURIComponent(m.indirizzo+", "+m.comune)}`} target="_blank" rel="noreferrer" style={{display:"block",marginTop:12,padding:"13px",borderRadius:12,background:BLUE,color:"#fff",textAlign:"center" as any,textDecoration:"none",fontSize:14,fontWeight:600}}>Apri in Google Maps</a>
          <a href={`tel:${m.tel}`} style={{display:"block",marginTop:8,padding:"13px",borderRadius:12,background:"#F8FAFC",color:TEAL,textAlign:"center" as any,textDecoration:"none",fontSize:14,fontWeight:600,border:`1px solid ${TEAL}30`}}>Chiama cliente</a>
        </>}

        {tab==="vani"&&<>
          {m.vani.map((v:any,i:number)=>(
            <div key={i} style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:8,border:"1px solid #E5E3DC"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:15,fontWeight:600,color:DARK}}>{v.nome}</span><span style={{fontSize:12,fontWeight:600,color:TEAL}}>Uw {v.uw}</span></div>
              <div style={{fontSize:13,color:DARK,marginBottom:6}}>{v.tipo}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap" as any}}>
                <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#F4F6F8",color:"#6B7280"}}>{v.mis} mm</span>
                <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"#F4F6F8",color:"#6B7280"}}>{v.col}</span>
              </div>
              {v.note&&<div style={{fontSize:11,color:AMBER,marginTop:6,fontWeight:500}}>Note: {v.note}</div>}
            </div>
          ))}
          <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:0.5,margin:"16px 0 8px"}}>Materiali da montare</div>
          {m.materiali.map((mat:any,i:number)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,marginBottom:4,background:"#fff",border:"1px solid #E5E3DC"}}>
              <div><div style={{fontSize:12,fontWeight:500,color:DARK}}>{mat.desc}</div><div style={{fontSize:10,color:"#9CA3AF"}}>{mat.cod}</div></div>
              <div style={{fontSize:14,fontWeight:700,color:DARK,fontFamily:FM}}>{mat.qty} {mat.um}</div>
            </div>
          ))}
        </>}

        {tab==="checklist"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
            {(["carico","posa","collaudo","scarico"] as const).map(f=>{
              const d=(m.checklist||[]).filter((c:any)=>c.fase===f&&c.fatto).length;
              const t=(m.checklist||[]).filter((c:any)=>c.fase===f).length;
              return <div key={f} onClick={()=>setCheckFase(f)} style={{padding:"8px 4px",borderRadius:10,border:`1.5px solid ${checkFase===f?TEAL:"#E5E3DC"}`,background:checkFase===f?TEAL+"08":"#fff",textAlign:"center" as any,cursor:"pointer"}}>
                <div style={{fontSize:11,fontWeight:600,color:checkFase===f?TEAL:DARK,textTransform:"capitalize" as any}}>{f}</div>
                <div style={{fontSize:10,color:d===t?TEAL:"#9CA3AF",marginTop:2}}>{d}/{t}</div>
              </div>;
            })}
          </div>
          <ChecklistFase items={m.checklist||[]} onToggle={toggleCheck} fase={checkFase}/>
        </>}

        {tab==="richieste"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:DARK}}>Richieste al magazzino</span>
            <button onClick={()=>setShowRichiesta(true)} style={{padding:"9px 16px",borderRadius:9,background:TEAL,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FF}}>+ Richiedi</button>
          </div>
          {(m.materialiRichiesti||[]).length===0&&<div style={{textAlign:"center" as any,padding:"40px 20px",color:"#9CA3AF",borderRadius:12,border:"2px dashed #E5E3DC"}}>
            <div style={{fontSize:13,marginBottom:4}}>Nessuna richiesta inviata</div>
            <div style={{fontSize:11}}>Puoi inviare testo, foto annotata, video o vocale</div>
          </div>}
          {(m.materialiRichiesti||[]).map((r:any,i:number)=>{
            const uc:Record<string,string>={normale:TEAL,urgente:AMBER,bloccante:RED};
            return (
              <div key={i} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1.5px solid ${uc[r.urgenza]}25`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:500,color:DARK,flex:1}}>{r.desc}</span>
                  <span style={{fontSize:14,fontWeight:700,fontFamily:FM,color:DARK,marginLeft:8}}>{r.qty} {r.um}</span>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:r.media||r.note?8:0,flexWrap:"wrap" as any}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:uc[r.urgenza]+"12",color:uc[r.urgenza],fontWeight:600}}>{r.urgenza}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#F4F6F8",color:"#6B7280"}}>{r.stato}</span>
                  {r.media&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:BLUE+"12",color:BLUE,fontWeight:500}}>{r.media.tipo}</span>}
                  <span style={{fontSize:10,color:"#9CA3AF",marginLeft:"auto"}}>{r.ts}</span>
                </div>
                {r.note&&<div style={{fontSize:11,color:"#6B7280",marginBottom:r.media?6:0}}>{r.note}</div>}
                {r.media?.tipo==="disegno"&&<img src={r.media.url} style={{width:"100%",borderRadius:8,border:"1px solid #E5E3DC"}} alt="disegno"/>}
                {r.media?.tipo==="foto_annotata"&&<img src={r.media.url} style={{width:"100%",borderRadius:8,border:"1px solid #E5E3DC"}} alt="foto annotata"/>}
                {r.media?.tipo==="video"&&<video src={r.media.url} controls style={{width:"100%",borderRadius:8}}/>}
                {r.media?.tipo==="vocale"&&<audio src={r.media.url} controls style={{width:"100%"}}/>}
              </div>
            );
          })}
        </>}

        {tab==="foto"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:DARK}}>Foto cantiere ({(m.foto||[]).length})</span>
            <label style={{padding:"9px 16px",borderRadius:9,background:TEAL,color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>
              Scatta foto
              <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>onUpdate({...m,foto:[...(m.foto||[]),{id:Date.now().toString(),url:r.result as string,ts:new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}]});r.readAsDataURL(file);}}/>
            </label>
          </div>
          {(m.foto||[]).length===0&&<div style={{textAlign:"center" as any,padding:"40px 20px",color:"#9CA3AF",borderRadius:12,border:"2px dashed #E5E3DC"}}><div style={{fontSize:13}}>Scatta foto prima/durante/dopo ogni vano</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {(m.foto||[]).map((f:any,i:number)=>(
              <div key={i} style={{borderRadius:12,overflow:"hidden",aspectRatio:"4/3",position:"relative" as any}}>
                <img src={f.url} style={{width:"100%",height:"100%",objectFit:"cover" as any}} alt=""/>
                <div style={{position:"absolute" as any,bottom:0,left:0,right:0,background:"rgba(0,0,0,0.5)",padding:"4px 8px",fontSize:10,color:"#fff"}}>{f.ts}</div>
              </div>
            ))}
          </div>
        </>}

        {tab==="preventivo"&&<>
          <div style={{background:"#F8FAFC",borderRadius:12,padding:"14px 16px",marginBottom:14,border:"1px solid #E5E3DC"}}>
            {[{l:"Numero",v:m.preventivo.numero},{l:"Data",v:m.preventivo.data},{l:"Sistema",v:m.sistema},{l:"Vani",v:`${m.vani.length}`}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #E5E3DC":"none"}}>
                <span style={{fontSize:12,color:"#6B7280"}}>{r.l}</span><span style={{fontSize:12,fontWeight:500,color:DARK}}>{r.v}</span>
              </div>
            ))}
          </div>
          {m.vani.map((v:any,i:number)=>(
            <div key={i} style={{padding:"10px 14px",borderRadius:10,marginBottom:5,background:"#fff",border:"1px solid #E5E3DC"}}>
              <div style={{fontSize:13,fontWeight:500,color:DARK}}>{v.nome} — {v.tipo}</div>
              <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{v.mis} mm · {v.col} · Uw {v.uw}</div>
            </div>
          ))}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #E5E3DC",padding:"14px",marginTop:10}}>
            {[{l:"Imponibile",v:fmtE(Math.round(m.importo/1.1))},{l:"IVA 10%",v:fmtE(Math.round(m.importo/11))}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"#6B7280"}}>{r.l}</span><span style={{fontSize:12,fontFamily:FM,color:DARK}}>{r.v}</span></div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid #E5E3DC",marginBottom:8}}><span style={{fontSize:15,fontWeight:700,color:DARK}}>TOTALE</span><span style={{fontSize:17,fontWeight:700,fontFamily:FM,color:DARK}}>{fmtE(m.importo)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:TEAL}}>Acconto pagato</span><span style={{fontSize:12,fontFamily:FM,color:TEAL}}>- {fmtE(m.acconto)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #E5E3DC"}}><span style={{fontSize:15,fontWeight:700,color:AMBER}}>SALDO DA INCASSARE</span><span style={{fontSize:17,fontWeight:700,fontFamily:FM,color:AMBER}}>{fmtE(m.saldo)}</span></div>
          </div>
          {m.preventivo.note&&<div style={{background:"#FFF8E7",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 14px",marginTop:10,fontSize:12,color:"#92400E"}}>{m.preventivo.note}</div>}
        </>}

        {tab==="workflow"&&<WorkflowTimeline workflow={m.workflow||[]}/>}

        {tab==="team"&&<>
          {[{ruolo:"Responsabile preventivo",nome:"Fabio Cozza",tel:"+39 0984 123456"},{ruolo:"Geometra misure",nome:"Paolo Greco",tel:"333 2222222"},{ruolo:"Resp. ordini",nome:"Lidia Cozza",tel:"347 3333333"},{ruolo:"Magazziniere",nome:"Antonio Bruno",tel:"320 4444444"}].map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,marginBottom:6,background:"#fff",border:"1px solid #E5E3DC"}}>
              <div style={{width:38,height:38,borderRadius:10,background:TEAL+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:TEAL,flexShrink:0}}>{c.nome[0]}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:DARK}}>{c.nome}</div><div style={{fontSize:11,color:"#6B7280"}}>{c.ruolo}</div></div>
              <a href={`tel:${c.tel}`} style={{width:36,height:36,borderRadius:9,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .89h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.83a16 16 0 006.29 6.29l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </a>
            </div>
          ))}
          <div style={{marginTop:16,background:RED+"06",borderRadius:12,padding:"14px",border:`1px solid ${RED}20`}}>
            <div style={{fontSize:13,fontWeight:600,color:RED,marginBottom:8}}>Segnala problema urgente</div>
            <textarea placeholder="Descrivi il problema..." rows={3} style={{width:"100%",padding:"10px 12px",border:`1px solid ${RED}25`,borderRadius:9,fontSize:13,fontFamily:FF,outline:"none",color:DARK,resize:"none" as any,background:"#fff",boxSizing:"border-box" as any}}/>
            <button style={{marginTop:8,width:"100%",padding:"11px",borderRadius:9,background:RED,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FF}}>Invia segnalazione urgente</button>
          </div>
        </>}
      </div>
      {showRichiesta&&<RichiestaMaterialiModal onSave={(r)=>{onUpdate({...m,materialiRichiesti:[...(m.materialiRichiesti||[]),r]});setShowRichiesta(false);}} onClose={()=>setShowRichiesta(false)}/>}
      {showFirma&&<FirmaCanvas cliente={`${m.cliente} ${m.cognome}`} onFirma={(firma)=>{onUpdate({...m,stato:"completato",firmaCliente:firma});setShowFirma(false);setTimerOn(false);}} onClose={()=>setShowFirma(false)}/>}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────
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
          {m.urgenza&&<span style={{fontSize:11,fontWeight:700,color:RED,background:RED+"10",padding:"1px 6px",borderRadius:4,marginBottom:4,display:"inline-block"}}>URGENTE</span>}
          <div style={{fontSize:16,fontWeight:700,color:DARK}}>{m.cliente} {m.cognome}</div>
          <div style={{fontSize:12,color:"#6B7280"}}>{m.indirizzo}, {m.comune}</div>
        </div>
        <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:statoC[m.stato]+"12",color:statoC[m.stato],fontWeight:600,flexShrink:0,marginLeft:8}}>{m.stato}</span>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:8,flexWrap:"wrap" as any}}>
        <span style={{fontSize:12,color:"#6B7280"}}>Ore {m.oraInizio}–{m.oraFine}</span>
        <span style={{fontSize:12,color:"#6B7280"}}>{m.vani.length} vani</span>
        <span style={{fontSize:12,fontWeight:600,color:AMBER,marginLeft:"auto"}}>Saldo {fmtE(m.saldo)}</span>
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
            <div style={{width:34,height:34,borderRadius:9,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#fff"}}>{operatore[0]}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:"#fff"}}>Ciao, {operatore.split(" ")[0]}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>MASTRO MONTAGGI</div></div>
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
        {oggi.length>0&&<><div style={{fontSize:11,fontWeight:700,color:TEAL,textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10}}>Oggi · {new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"})}</div>{oggi.map((m:any)=><Card key={m.id} m={m}/>)}</>}
        {oggi.length===0&&<div style={{textAlign:"center" as any,padding:"28px 20px",background:"#fff",borderRadius:14,border:"1px solid #E5E3DC",marginBottom:16}}><div style={{fontSize:14,fontWeight:600,color:DARK,marginBottom:4}}>Nessun montaggio oggi</div><div style={{fontSize:12,color:"#9CA3AF"}}>Buona giornata, {operatore.split(" ")[0]}</div></div>}
        {domani.length>0&&<><div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10,marginTop:8}}>Domani</div>{domani.map((m:any)=><Card key={m.id} m={m}/>)}</>}
        {altri.length>0&&<><div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as any,letterSpacing:1,marginBottom:10,marginTop:8}}>Prossimi</div>{altri.map((m:any)=><Card key={m.id} m={m}/>)}</>}
      </div>
      <button style={{position:"fixed" as any,bottom:24,right:16,width:54,height:54,borderRadius:16,background:RED,color:"#fff",border:"none",fontSize:22,cursor:"pointer",boxShadow:"0 4px 16px rgba(220,68,68,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,fontWeight:900}}>!</button>
    </div>
  );
}

export default function MastroMontaggi() {
  const [operatore,setOperatore]=useState<string|null>(null);
  const [montaggi,setMontaggi]=useState(MONTAGGI_DEMO);
  const [sel,setSel]=useState<any>(null);
  const upd=(u:any)=>{setMontaggi(ms=>ms.map(m=>m.id===u.id?u:m));if(sel?.id===u.id)setSel(u);};
  if(!operatore)return <LoginPIN onLogin={setOperatore}/>;
  if(sel)return <DettaglioMontaggio m={sel} operatore={operatore} onBack={()=>setSel(null)} onUpdate={upd}/>;
  return <HomeCalendario montaggi={montaggi} operatore={operatore} onSelect={setSel} onLogout={()=>setOperatore(null)}/>;
}
