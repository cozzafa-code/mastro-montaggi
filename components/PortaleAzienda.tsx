// @ts-nocheck
"use client";
// PORTALE AZIENDA fliwoX v10 — layout flat, topbar nav, zero sidebar
import React, { useState, useMemo } from "react";

const T = {
  bg: "#FFFFFF", bgAlt: "#F9FAFB", ink: "#1A1A1A", sub: "#6B7280", muted: "#9CA3AF",
  line: "#E5E7EB", lineLight: "#F3F4F6",
  teal: "#1A9E8F", tealLight: "rgba(26,158,143,0.08)", tealBorder: "rgba(26,158,143,0.2)",
  green: "#2D8A4E", greenLight: "rgba(45,138,78,0.08)",
  amber: "#C47D0A", amberLight: "rgba(196,125,10,0.08)",
  red: "#DC4444", redLight: "rgba(220,68,68,0.08)",
  blue: "#3B7FE0", blueLight: "rgba(59,127,224,0.08)",
  purple: "#7C3AED", purpleLight: "rgba(124,58,237,0.08)",
  mono: "'JetBrains Mono',monospace",
  font: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
};

/* ══════════ DATA ══════════ */
const OPERATORI = [
  { id:"op1", nome:"Marco Ferretti", ruolo:"montatore", stato:"in_cantiere", telefono:"+39 345 678 9012", automezzo:"Ducato AB 123 CD", avatar:"MF", colore:"#1A9E8F",
    posizione:{ indirizzo:"Via Roma 45, Cosenza", agg:"08:42" },
    kpi:{ commesse:47, ore:1840, media:8.2, voto:4.7, ritardi:2, reclami:1, presenze:21 },
    agenda:[{g:"Lun",c:"COM-089",a:"Camera scorrevole",h:"08-16:30",col:T.teal},{g:"Mar",c:"COM-089",a:"V2+V3 Cucina",h:"08-17",col:T.teal},{g:"Mer",c:"COM-089",a:"V3+V4 Bagno",h:"08-16",col:T.teal},{g:"Gio",c:"COM-089",a:"Finiture+collaudo",h:"08-14",col:T.green},{g:"Ven",c:null,a:null,h:null,col:null}],
    commesse:[
      { id:"COM-2024-089", cliente:"Fam. Bianchi", indirizzo:"Via Garibaldi 12, Cosenza", tipo:"Sostituzione infissi", stato:"in_corso", prio:"alta", inizio:"05/04", fine:"10/04", avanz:65,
        vani:[
          {id:"V1",nome:"Soggiorno",tipo:"Finestra 2 ante",dim:"1400x1600",mat:"PVC Aluplast IDEAL 7000",stato:"montato",oreR:3.5,oreP:3},
          {id:"V2",nome:"Camera",tipo:"Portafinestra scorrevole",dim:"2200x2200",mat:"PVC Aluplast ENERGETO 8000",stato:"in_corso",oreR:2,oreP:4},
          {id:"V3",nome:"Cucina",tipo:"Finestra 1 anta",dim:"900x1200",mat:"PVC Aluplast IDEAL 7000",stato:"da_fare",oreR:0,oreP:2},
          {id:"V4",nome:"Bagno",tipo:"Vasistas",dim:"600x800",mat:"PVC Aluplast IDEAL 7000",stato:"da_fare",oreR:0,oreP:1.5},
        ],
        doc:[{n:"Ordine Aluplast",t:"pdf",d:"28/03"},{n:"Scheda IDEAL 7000",t:"pdf",d:"28/03"},{n:"Foto sopralluogo",t:"zip",d:"25/03"},{n:"Preventivo",t:"pdf",d:"20/03"},{n:"DDT materiali",t:"pdf",d:"04/04"}],
        foto:[{fase:"PRIMA",vano:"V1",data:"05/04 09:15",nota:"Legno vecchio, guarnizioni consumate"},{fase:"DEMOLIZIONE",vano:"V1",data:"05/04 10:30",nota:"Controtelaio rimosso"},{fase:"MONTAGGIO",vano:"V1",data:"05/04 14:20",nota:"Controtelaio nuovo posato"},{fase:"DOPO",vano:"V1",data:"05/04 16:45",nota:"Finestra montata, silicone OK"},{fase:"PRIMA",vano:"V2",data:"07/04 08:30",nota:"Scorrevole vecchia"},{fase:"DEMOLIZIONE",vano:"V2",data:"07/04 10:00",nota:"Binario rimosso"}],
        chat:[{da:"Marco",ora:"05/04 08:10",t:"Arrivato, inizio soggiorno",tipo:"op"},{da:"Ufficio",ora:"05/04 08:12",t:"OK. Ricordati foto PRIMA",tipo:"uff"},{da:"Marco",ora:"05/04 10:35",t:"Controtelaio rimosso. Muro OK",tipo:"op"},{da:"Marco",ora:"05/04 16:50",t:"Soggiorno completato, 4 foto",tipo:"op"},{da:"Cliente",ora:"06/04 09:00",t:"Domani dopo le 9?",tipo:"cli"},{da:"Marco",ora:"07/04 08:32",t:"Scorrevole pesante, serve aiuto",tipo:"op"},{da:"Ufficio",ora:"07/04 08:35",t:"Mando Luca alle 10",tipo:"uff"},{da:"AI",ora:"07/04 08:36",t:"ENERGETO 8000: coppia Roto 2.5Nm",tipo:"ai"}],
        timeline:[{d:"20/03",e:"Preventivo approvato"},{d:"25/03",e:"Sopralluogo misure"},{d:"28/03",e:"Ordine Aluplast"},{d:"03/04",e:"Materiali in magazzino"},{d:"04/04",e:"Caricati sul Ducato"},{d:"05/04",e:"V1 Soggiorno completato"},{d:"07/04",e:"V2 Camera in corso"},{d:"08/04",e:"OGGI: completare V2 + V3"}],
        materiali:[{n:"Viti ASSY 4x50",q:48,u:32,um:"pz"},{n:"Silicone bianco",q:4,u:2,um:"tubi"},{n:"Schiuma PU",q:3,u:1,um:"bomb"},{n:"Nastro VKP",q:2,u:1,um:"rot"},{n:"Guarnizione EPDM",q:10,u:4,um:"mt"},{n:"Tasselli Fischer",q:24,u:12,um:"pz"}],
        firme:[{tipo:"Inizio lavori",data:"05/04 08:15",ok:true,chi:"Sig. Bianchi"},{tipo:"Fine V1",data:"05/04 16:50",ok:true,chi:"Sig. Bianchi"},{tipo:"Fine totale",data:null,ok:false,chi:null},{tipo:"Collaudo",data:null,ok:false,chi:null}],
        spese:[{d:"05/04",desc:"Colazione",imp:8.50,cat:"Pasti",ok:"si"},{d:"05/04",desc:"Tasselli Brico",imp:12.90,cat:"Materiale",ok:"si"},{d:"07/04",desc:"Parcheggio ZTL",imp:5.00,cat:"Trasporto",ok:"no"}],
        ore:[{d:"05/04",in:"08:00",out:"17:00",pausa:60,nette:8},{d:"07/04",in:"08:15",out:"16:30",pausa:45,nette:7.5},{d:"08/04",in:"08:00",out:null,pausa:0,nette:0}],
        problemi:[{tit:"Scorrevole troppo pesante per 1 persona",desc:"Telaio 85kg, serve rinforzo",prio:"alta",stato:"aperto",data:"07/04"},{tit:"Fuori squadro 5mm lato sx",desc:"Compensato con spessori",prio:"bassa",stato:"risolto",data:"05/04"}],
      },
      { id:"COM-2024-082", cliente:"Cond. Via Verdi", indirizzo:"Via Verdi 8, Rende", tipo:"Persiane alluminio", stato:"programmata", prio:"media", inizio:"14/04", fine:"18/04", avanz:0,
        vani:[{id:"V1",nome:"App.1 Sogg.",tipo:"Persiana 2 ante",dim:"1200x1600",mat:"AL CX65",stato:"da_fare",oreR:0,oreP:2},{id:"V2",nome:"App.1 Cam.",tipo:"Persiana 2 ante",dim:"1000x1400",mat:"AL CX65",stato:"da_fare",oreR:0,oreP:1.5}],
        doc:[{n:"Preventivo",t:"pdf",d:"10/03"},{n:"Delibera",t:"pdf",d:"15/03"}], foto:[], chat:[], timeline:[], materiali:[], firme:[], spese:[], ore:[], problemi:[],
      },
    ],
    cert:[{n:"UNI 11673-1",scad:"12/2026",ok:true},{n:"Sicurezza cantiere",scad:"06/2026",ok:false},{n:"Primo soccorso",scad:"03/2027",ok:true}],
    dotaz:[{n:"Hilti TE 6-A22"},{n:"Bosch GCL 2-50"},{n:"Kit sigillatura"},{n:"Ducato AB 123 CD"}],
    storico:[{m:"Gen",ore:168,v:4.8},{m:"Feb",ore:152,v:4.6},{m:"Mar",ore:176,v:4.9},{m:"Apr",ore:56,v:4.5}],
  },
  { id:"op2", nome:"Luca Mancini", ruolo:"montatore", stato:"disponibile", telefono:"+39 333 456 7890", automezzo:"Doblo CD 456 EF", avatar:"LM", colore:"#3B7FE0",
    posizione:{ indirizzo:"Sede, Cosenza", agg:"07:55" }, kpi:{ commesse:32, ore:1320, media:7.8, voto:4.2, ritardi:5, reclami:3, presenze:19 },
    agenda:[{g:"Lun",c:null,a:null,h:null,col:null},{g:"Mar",c:null,a:null,h:null,col:null},{g:"Mer",c:null,a:null,h:null,col:null},{g:"Gio",c:"COM-089",a:"Supporto Marco",h:"10-14",col:T.teal},{g:"Ven",c:"COM-091",a:"Vetrina Bar Sport",h:"08-17",col:T.blue}],
    commesse:[
      { id:"COM-2024-091", cliente:"Bar Sport", indirizzo:"Corso Mazzini 44, Cosenza", tipo:"Vetrina commerciale", stato:"in_attesa_materiali", prio:"media", inizio:"11/04", fine:"12/04", avanz:0,
        vani:[{id:"V1",nome:"Vetrina",tipo:"Vetrata fissa",dim:"3000x2400",mat:"AL CX70 + vetro 6+6",stato:"da_fare",oreR:0,oreP:6}],
        doc:[{n:"Preventivo",t:"pdf",d:"01/04"}], foto:[], chat:[{da:"Ufficio",ora:"03/04",t:"Vetro ordinato Vetro Sud. Consegna 10/04",tipo:"uff"},{da:"Luca",ora:"03/04",t:"Serve ponteggio?",tipo:"op"},{da:"Ufficio",ora:"03/04",t:"No, 2.80m. Ventose bastano",tipo:"uff"}],
        timeline:[{d:"01/04",e:"Preventivo OK"},{d:"03/04",e:"Ordine vetro"}], materiali:[{n:"Silicone strutturale",q:6,u:0,um:"tubi"},{n:"Ventose 3 coppe",q:2,u:0,um:"pz"}],
        firme:[], spese:[], ore:[], problemi:[{tit:"Vetro non consegnato",desc:"6+6 Vetro Sud, previsto 10/04 ma nessun tracking",prio:"alta",stato:"aperto",data:"03/04"}],
      },
    ],
    cert:[{n:"UNI 11673-1",scad:"09/2026",ok:true},{n:"Lavori in quota",scad:"05/2026",ok:false}],
    dotaz:[{n:"Makita DHP 486"},{n:"Doblo CD 456 EF"}],
    storico:[{m:"Gen",ore:148,v:4.3},{m:"Feb",ore:136,v:4.0},{m:"Mar",ore:160,v:4.4},{m:"Apr",ore:0,v:0}],
  },
  { id:"op3", nome:"Andrea Russo", ruolo:"tecnico_misure", stato:"in_sopralluogo", telefono:"+39 320 111 2233", automezzo:"500L GH 789 IJ", avatar:"AR", colore:"#7C3AED",
    posizione:{ indirizzo:"Via Gramsci 22, Rende", agg:"09:10" }, kpi:{ commesse:62, ore:1560, media:7.0, voto:4.9, ritardi:1, reclami:0, presenze:22 },
    agenda:[{g:"Lun",c:null,a:null,h:null,col:null},{g:"Mar",c:"RIL-155",a:"Rilievo Greco 5 vani",h:"09-12",col:T.purple},{g:"Mer",c:"RIL-156",a:"Condominio Mazzini",h:"10-13",col:T.purple},{g:"Gio",c:null,a:null,h:null,col:null},{g:"Ven",c:"RIL-157",a:"Villa De Luca",h:"09-14",col:T.purple}],
    commesse:[
      { id:"RIL-2024-155", cliente:"Sig.ra Greco", indirizzo:"Via Gramsci 22, Rende", tipo:"Rilievo misure", stato:"in_corso", prio:"alta", inizio:"08/04", fine:"08/04", avanz:40,
        vani:[{id:"V1",nome:"Soggiorno",tipo:"Fin. 2 ante",dim:"1380x1580",mat:"da definire",stato:"in_corso",oreR:0.5,oreP:0.5},{id:"V2",nome:"Camera 1",tipo:"Fin. 1 anta",dim:"da rilevare",mat:"da definire",stato:"da_fare",oreR:0,oreP:0.3},{id:"V3",nome:"Camera 2",tipo:"Fin. 1 anta",dim:"da rilevare",mat:"da definire",stato:"da_fare",oreR:0,oreP:0.3},{id:"V4",nome:"Cucina",tipo:"Fin. ribalta",dim:"da rilevare",mat:"da definire",stato:"da_fare",oreR:0,oreP:0.3},{id:"V5",nome:"Bagno",tipo:"Vasistas",dim:"da rilevare",mat:"da definire",stato:"da_fare",oreR:0,oreP:0.2}],
        doc:[], foto:[{fase:"RILIEVO",vano:"V1",data:"08/04 09:20",nota:"1380x1580, fuori squadro 3mm"}],
        chat:[{da:"Andrea",ora:"09:05",t:"Arrivato. Inizio rilievo",tipo:"op"},{da:"Andrea",ora:"09:22",t:"Sogg: 1380x1580, squadro 3mm dx, muro 30cm",tipo:"op"}],
        timeline:[{d:"08/04",e:"Inizio rilievo"}], materiali:[], firme:[], spese:[], ore:[{d:"08/04",in:"09:00",out:null,pausa:0,nette:0}], problemi:[],
      },
    ],
    cert:[{n:"UNI 11673-1",scad:"01/2027",ok:true},{n:"Termografia liv.1",scad:"11/2026",ok:true}],
    dotaz:[{n:"Leica DISTO D2"},{n:"iPad Pro 12.9"},{n:"500L GH 789 IJ"}],
    storico:[{m:"Gen",ore:154,v:4.9},{m:"Feb",ore:140,v:4.8},{m:"Mar",ore:168,v:5.0},{m:"Apr",ore:8,v:0}],
  },
  { id:"op4", nome:"Giuseppe Catanzaro", ruolo:"montatore", stato:"in_cantiere", telefono:"+39 347 222 3344", automezzo:"Ducato EF 567 GH", avatar:"GC", colore:"#E07B3B",
    posizione:{ indirizzo:"P.zza Matteotti 3, Cosenza", agg:"08:15" }, kpi:{ commesse:51, ore:1920, media:8.5, voto:4.8, ritardi:1, reclami:0, presenze:22 },
    agenda:[{g:"Lun",c:"COM-095",a:"Persiane piano 2",h:"08-16",col:"#E07B3B"},{g:"Mar",c:"COM-095",a:"Piano 3 + finiture",h:"08-17",col:"#E07B3B"},{g:"Mer",c:null,a:null,h:null,col:null},{g:"Gio",c:"COM-098",a:"Zanzariere Ferraro",h:"09-13",col:T.green},{g:"Ven",c:"COM-098",a:"Completamento",h:"08-12",col:T.green}],
    commesse:[{ id:"COM-2024-095", cliente:"Palazzo Ferrovia", indirizzo:"P.zza Matteotti 3, Cosenza", tipo:"Persiane AL x12", stato:"in_corso", prio:"alta", inizio:"03/04", fine:"11/04", avanz:75, vani:[{id:"V1",nome:"P1 App.A",tipo:"Persiana",dim:"1200x1500",mat:"AL CX55",stato:"montato",oreR:2,oreP:2},{id:"V2",nome:"P1 App.B",tipo:"Persiana",dim:"1200x1500",mat:"AL CX55",stato:"montato",oreR:1.5,oreP:2},{id:"V3",nome:"P2 App.A",tipo:"Persiana",dim:"1200x1500",mat:"AL CX55",stato:"in_corso",oreR:1,oreP:2},{id:"V4",nome:"P2 App.B",tipo:"Persiana",dim:"1000x1400",mat:"AL CX55",stato:"da_fare",oreR:0,oreP:1.5}], doc:[], foto:[], chat:[], timeline:[], materiali:[], firme:[], spese:[], ore:[], problemi:[] }],
    cert:[{n:"UNI 11673-1",scad:"03/2027",ok:true}], dotaz:[{n:"Hilti TE 4-A22"},{n:"Ducato EF 567 GH"}], storico:[{m:"Gen",ore:176,v:4.9},{m:"Feb",ore:160,v:4.7},{m:"Mar",ore:180,v:4.8},{m:"Apr",ore:64,v:4.9}],
  },
  { id:"op5", nome:"Salvatore Morelli", ruolo:"montatore", stato:"in_cantiere", telefono:"+39 366 555 6677", automezzo:"Kangoo IJ 890 KL", avatar:"SM", colore:"#DC4444",
    posizione:{ indirizzo:"Via Popilia 156, Cosenza", agg:"08:50" }, kpi:{ commesse:28, ore:1100, media:7.5, voto:4.0, ritardi:4, reclami:2, presenze:18 },
    agenda:[{g:"Lun",c:"COM-096",a:"Tapparelle bagno+cucina",h:"08-15",col:"#DC4444"},{g:"Mar",c:"COM-096",a:"Tapparelle camere",h:"08-16",col:"#DC4444"},{g:"Mer",c:"COM-096",a:"Finiture",h:"08-12",col:"#DC4444"},{g:"Gio",c:null,a:null,h:null,col:null},{g:"Ven",c:"COM-100",a:"Tapparella singola",h:"09-11",col:T.amber}],
    commesse:[{ id:"COM-2024-096", cliente:"Fam. De Rosa", indirizzo:"Via Popilia 156", tipo:"Tapparelle x6", stato:"in_corso", prio:"media", inizio:"07/04", fine:"09/04", avanz:35, vani:[{id:"V1",nome:"Soggiorno",tipo:"Tapp. motor.",dim:"1400x1600",mat:"AL coibentato",stato:"montato",oreR:2,oreP:2},{id:"V2",nome:"Cucina",tipo:"Tapp. motor.",dim:"900x1200",mat:"AL coibentato",stato:"in_corso",oreR:1,oreP:1.5},{id:"V3",nome:"Camera",tipo:"Tapp. motor.",dim:"1200x1400",mat:"AL coibentato",stato:"da_fare",oreR:0,oreP:2}], doc:[], foto:[], chat:[], timeline:[], materiali:[{n:"Motori Somfy iO",q:6,u:2,um:"pz"}], firme:[], spese:[], ore:[], problemi:[{tit:"Cassonetto cucina troppo piccolo",desc:"14cm, motore richiede 16cm",prio:"alta",stato:"aperto",data:"08/04"}] }],
    cert:[{n:"UNI 11673-1",scad:"02/2027",ok:true}], dotaz:[{n:"Bosch GSR 18V"},{n:"Kangoo IJ 890 KL"}], storico:[{m:"Gen",ore:128,v:4.1},{m:"Feb",ore:112,v:3.8},{m:"Mar",ore:140,v:4.2},{m:"Apr",ore:28,v:4.0}],
  },
  { id:"op6", nome:"Francesco Pellegrino", ruolo:"montatore", stato:"disponibile", telefono:"+39 348 777 8899", automezzo:"Ducato MN 012 OP", avatar:"FP", colore:"#2563EB",
    posizione:{ indirizzo:"Sede, Cosenza", agg:"07:50" }, kpi:{ commesse:39, ore:1580, media:8.0, voto:4.4, ritardi:3, reclami:1, presenze:20 },
    agenda:[{g:"Lun",c:null,a:null,h:null,col:null},{g:"Mar",c:null,a:null,h:null,col:null},{g:"Mer",c:"COM-101",a:"Porte ufficio",h:"08-17",col:"#2563EB"},{g:"Gio",c:"COM-101",a:"Completamento",h:"08-14",col:"#2563EB"},{g:"Ven",c:null,a:null,h:null,col:null}],
    commesse:[{ id:"COM-2024-101", cliente:"Studio Ferraro", indirizzo:"Via XXIV Maggio 10", tipo:"Porte interne x5", stato:"programmata", prio:"bassa", inizio:"09/04", fine:"10/04", avanz:0, vani:[{id:"V1",nome:"Ingresso",tipo:"Battente",dim:"900x2100",mat:"Laminato rovere",stato:"da_fare",oreR:0,oreP:1.5}], doc:[], foto:[], chat:[], timeline:[], materiali:[], firme:[], spese:[], ore:[], problemi:[] }],
    cert:[{n:"UNI 11673-1",scad:"11/2026",ok:true},{n:"Sicurezza cantiere",scad:"04/2026",ok:false}], dotaz:[{n:"DeWalt DCD796"},{n:"Ducato MN 012 OP"}], storico:[{m:"Gen",ore:160,v:4.5},{m:"Feb",ore:144,v:4.3},{m:"Mar",ore:168,v:4.5},{m:"Apr",ore:0,v:0}],
  },
  { id:"op7", nome:"Roberto Mazza", ruolo:"montatore", stato:"in_pausa", telefono:"+39 328 999 0011", automezzo:"Daily UV 678 WX", avatar:"RM", colore:"#059669",
    posizione:{ indirizzo:"Bar Centrale, Cosenza", agg:"09:30" }, kpi:{ commesse:55, ore:2050, media:8.8, voto:4.9, ritardi:0, reclami:0, presenze:22 },
    agenda:[{g:"Lun",c:"COM-088",a:"Serranda Conad",h:"07-16",col:"#059669"},{g:"Mar",c:"COM-088",a:"Automazione",h:"08-14",col:"#059669"},{g:"Mer",c:"COM-102",a:"Cancello scorrevole",h:"07:30-17",col:"#059669"},{g:"Gio",c:"COM-102",a:"Automazione cancello",h:"08-15",col:"#059669"},{g:"Ven",c:"COM-103",a:"Pergola bioclimatica",h:"07-17",col:"#059669"}],
    commesse:[{ id:"COM-2024-088", cliente:"Conad", indirizzo:"Via Stadi 20, Cosenza", tipo:"Serranda motorizzata", stato:"in_corso", prio:"alta", inizio:"07/04", fine:"08/04", avanz:60, vani:[{id:"V1",nome:"Ingresso",tipo:"Serranda avvolg.",dim:"4000x3500",mat:"Acciaio zincato",stato:"in_corso",oreR:6,oreP:10}], doc:[], foto:[], chat:[{da:"Roberto",ora:"07:10",t:"Inizio serranda. Muro cavo, servono chimici",tipo:"op"},{da:"Ufficio",ora:"07:15",t:"Salvatore porta chimici entro 9",tipo:"uff"}], timeline:[], materiali:[{n:"Chimici Fischer FIS V",q:8,u:4,um:"pz"},{n:"Somfy Axovia 3S",q:1,u:0,um:"pz"}], firme:[], spese:[{d:"07/04",desc:"Pranzo cantiere",imp:22.50,cat:"Pasti",ok:"no"}], ore:[{d:"07/04",in:"07:00",out:"16:30",pausa:30,nette:9}], problemi:[] }],
    cert:[{n:"UNI 11673-1",scad:"01/2027",ok:true},{n:"Saldatura",scad:"06/2027",ok:true},{n:"Lavori in quota",scad:"09/2026",ok:true}], dotaz:[{n:"Saldatrice Lincoln"},{n:"Daily UV 678 WX"}], storico:[{m:"Gen",ore:192,v:5.0},{m:"Feb",ore:176,v:4.9},{m:"Mar",ore:188,v:5.0},{m:"Apr",ore:72,v:4.8}],
  },
  { id:"op8", nome:"Nicola Greco", ruolo:"montatore", stato:"non_disponibile", telefono:"+39 351 222 3300", automezzo:"Berlingo YZ 901 AB", avatar:"NG", colore:"#6B7280",
    posizione:{ indirizzo:"Sede, Cosenza", agg:"07/04 17:00" }, kpi:{ commesse:22, ore:880, media:7.2, voto:4.1, ritardi:3, reclami:2, presenze:14 },
    agenda:[{g:"Lun",c:null,a:"Malattia",h:null,col:T.red},{g:"Mar",c:null,a:"Malattia",h:null,col:T.red},{g:"Mer",c:null,a:"Malattia",h:null,col:T.red},{g:"Gio",c:null,a:null,h:null,col:null},{g:"Ven",c:null,a:null,h:null,col:null}],
    commesse:[], cert:[{n:"UNI 11673-1",scad:"06/2026",ok:false}], dotaz:[{n:"Berlingo YZ 901 AB"}], storico:[{m:"Gen",ore:96,v:4.0},{m:"Feb",ore:88,v:4.2},{m:"Mar",ore:120,v:4.1},{m:"Apr",ore:0,v:0}],
  },
  { id:"op9", nome:"Domenico Bianchi", ruolo:"magazziniere", stato:"disponibile", telefono:"+39 340 111 0099", automezzo:"Muletto sede", avatar:"DB", colore:"#CA8A04",
    posizione:{ indirizzo:"Magazzino, Cosenza", agg:"08:00" }, kpi:{ commesse:0, ore:1760, media:8.0, voto:4.6, ritardi:0, reclami:0, presenze:22 },
    agenda:[{g:"Lun",c:null,a:"Scarico Twin Systems",h:"08-17",col:"#CA8A04"},{g:"Mar",c:null,a:"Kit COM-089+096",h:"08-17",col:"#CA8A04"},{g:"Mer",c:null,a:"Inventario",h:"08-17",col:"#CA8A04"},{g:"Gio",c:null,a:"Carico furgoni",h:"08-17",col:"#CA8A04"},{g:"Ven",c:null,a:"Ricezione vetri",h:"08-17",col:"#CA8A04"}],
    commesse:[], cert:[{n:"Patentino muletto",scad:"09/2027",ok:true}], dotaz:[{n:"Toyota 1.5t"},{n:"Datalogic barcode"}], storico:[{m:"Gen",ore:176,v:4.5},{m:"Feb",ore:168,v:4.6},{m:"Mar",ore:176,v:4.7},{m:"Apr",ore:56,v:4.6}],
  },
  { id:"op10", nome:"Maria Conte", ruolo:"ufficio", stato:"disponibile", telefono:"+39 349 888 7766", automezzo:"--", avatar:"MC", colore:"#EC4899",
    posizione:{ indirizzo:"Ufficio, Cosenza", agg:"08:30" }, kpi:{ commesse:0, ore:1760, media:8.0, voto:4.8, ritardi:0, reclami:0, presenze:22 },
    agenda:[{g:"Lun",c:null,a:"Preventivi+ordini",h:"09-18",col:"#EC4899"},{g:"Mar",c:null,a:"Fatturazione",h:"09-18",col:"#EC4899"},{g:"Mer",c:null,a:"Planning",h:"09-18",col:"#EC4899"},{g:"Gio",c:null,a:"Ordini+DDT",h:"09-18",col:"#EC4899"},{g:"Ven",c:null,a:"Chiusura+report",h:"09-18",col:"#EC4899"}],
    commesse:[], cert:[], dotaz:[{n:"iMac 24 M3"},{n:"HP LaserJet"}], storico:[{m:"Gen",ore:176,v:4.8},{m:"Feb",ore:168,v:4.9},{m:"Mar",ore:176,v:4.8},{m:"Apr",ore:56,v:4.7}],
  },
  { id:"op11", nome:"Paolo Ferretti", ruolo:"apprendista", stato:"in_cantiere", telefono:"+39 327 666 5544", automezzo:"Con Marco", avatar:"PF", colore:"#0891B2",
    posizione:{ indirizzo:"Via Roma 45, Cosenza (con Marco)", agg:"08:42" }, kpi:{ commesse:18, ore:720, media:7.5, voto:4.3, ritardi:1, reclami:0, presenze:21 },
    agenda:[{g:"Lun",c:"COM-089",a:"Aiuto Marco",h:"10-16:30",col:"#0891B2"},{g:"Mar",c:"COM-089",a:"Cucina+bagno",h:"08-17",col:"#0891B2"},{g:"Mer",c:"COM-089",a:"Finiture",h:"08-16",col:"#0891B2"},{g:"Gio",c:null,a:null,h:null,col:null},{g:"Ven",c:"COM-091",a:"Aiuto Luca vetrina",h:"08-17",col:"#0891B2"}],
    commesse:[], cert:[{n:"UNI 11673-1",scad:"01/2029",ok:true}], dotaz:[{n:"Kit base utensili"}], storico:[{m:"Gen",ore:140,v:4.2},{m:"Feb",ore:136,v:4.3},{m:"Mar",ore:152,v:4.4},{m:"Apr",ore:24,v:4.3}],
  },
];

const MARKETPLACE = [
  { id:"MKT-001", dir:"out", titolo:"Sostituzione 8 finestre PVC piano terra", zona:"Rende (CS)", budget:"da 2.800", scad:"15/04", desc:"8 finestre 1 anta, PVC bianco, misure standard. Materiali inclusi. Piano terra.", offerte:[{da:"Infissi Calabria SRL",pr:3200,v:4.6,gg:"5gg",nota:"Disponibili 16/04"},{da:"Montatori Cosenza",pr:2900,v:4.2,gg:"3gg",nota:"Subito"},{da:"F.lli Ferraro",pr:3400,v:4.8,gg:"7gg",nota:"Garanzia 5 anni"}] },
  { id:"MKT-002", dir:"out", titolo:"Persiane alluminio x6 secondo piano", zona:"Cosenza centro", budget:"da 1.500", scad:"20/04", desc:"6 persiane CX55, materiali in magazzino. Solo manodopera + ponteggio.", offerte:[] },
  { id:"MKT-003", dir:"out", titolo:"Porta blindata + 2 porte interne", zona:"Castrolibero (CS)", budget:"da 800", scad:"25/04", desc:"Dierre classe 3 + 2 laminato. Materiali dal cliente.", offerte:[{da:"Sicurezza Casa",pr:950,v:4.4,gg:"2gg",nota:"Specializzati blindate"}] },
  { id:"MKT-101", dir:"in", titolo:"12 finestre alluminio TT serie 65", zona:"Montalto Uffugo", azienda:"Serramenti Ferraro SRL", budget:"4.500-5.500", scad:"18/04", desc:"Demolizione inclusa. 3o piano con ascensore. Materiali dal committente.", km:"12 km", urgente:false },
  { id:"MKT-102", dir:"in", titolo:"4 vetrate scorrevoli alzanti villa", zona:"Cetraro (CS)", azienda:"Vetro Design di Russo", budget:"2.200-2.800", scad:"22/04", desc:"Schuco ASS 70 HI, 3000x2400. Villa mare. Esperienza alzanti.", km:"65 km", urgente:false },
  { id:"MKT-103", dir:"in", titolo:"20 zanzariere a rullo condominio", zona:"Cosenza", azienda:"Casa Clima Calabria", budget:"1.000-1.400", scad:"30/04", desc:"Laterali, misure rilevate. 4 piani con ascensore. 2-3 giorni.", km:"3 km", urgente:false },
  { id:"MKT-104", dir:"in", titolo:"Riparazione serranda commerciale", zona:"Rende (CS)", azienda:"Ferramenta Mancuso", budget:"300-500", scad:"09/04", desc:"Serranda bloccata, motore da verificare. Negozio chiuso. URGENTE.", km:"5 km", urgente:true },
  { id:"MKT-201", dir:"done", titolo:"5 tapparelle motorizzate", zona:"Rende", azienda:"Edilcomfort SRL", prezzo:1800, assegnato:"Salvatore Morelli", stato:"in_corso" },
  { id:"MKT-202", dir:"done", titolo:"Inferriata sicurezza x3", zona:"Cosenza", azienda:"Sicurezza Totale", prezzo:650, assegnato:"Roberto Mazza", stato:"completato" },
];


/* ══════════ HELPERS ══════════ */
const SC = (s) => ({in_cantiere:{bg:T.greenLight,fg:T.green,l:"In cantiere"},disponibile:{bg:T.tealLight,fg:T.teal,l:"Disponibile"},in_sopralluogo:{bg:T.purpleLight,fg:T.purple,l:"Sopralluogo"},in_pausa:{bg:T.amberLight,fg:T.amber,l:"In pausa"},non_disponibile:{bg:T.redLight,fg:T.red,l:"Non disp."}}[s]||{bg:T.bgAlt,fg:T.sub,l:s});
const VC = (s) => ({montato:{c:T.green,l:"OK"},in_corso:{c:T.amber,l:"In corso"},da_fare:{c:T.muted,l:"Da fare"}}[s]||{c:T.muted,l:s});
const CC = (s) => ({in_corso:T.green,programmata:T.blue,in_attesa_materiali:T.amber,completata:T.teal}[s]||T.muted);
const chatC = (t) => ({op:T.teal,uff:T.blue,cli:T.green,ai:T.purple}[t]||T.sub);
const fh = (n) => n > 0 ? n.toFixed(1)+"h" : "\u2014";
const Line = () => <div style={{borderBottom:`1px solid ${T.line}`}}/>;

/* ══════════ MAIN ══════════ */
export default function PortaleAzienda() {
  const [page, setPage] = useState("team"); // team | marketplace
  const [selOp, setSelOp] = useState(null);
  const [selComm, setSelComm] = useState(null);
  const [tab, setTab] = useState("vani");
  const [search, setSearch] = useState("");

  const ops = useMemo(() => {
    if (!search) return OPERATORI;
    const q = search.toLowerCase();
    return OPERATORI.filter(o => o.nome.toLowerCase().includes(q) || o.ruolo.includes(q));
  }, [search]);

  const op = OPERATORI.find(o => o.id === selOp);
  const comm = op?.commesse?.find(c => c.id === selComm);

  /* ══════════ TOPBAR ══════════ */
  const Topbar = () => (
    <div style={{background:"#0D1F1F",padding:"0 24px",display:"flex",alignItems:"center",height:52,gap:16,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:28,height:28,borderRadius:6,background:T.teal,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:"#fff",fontSize:13,fontWeight:800}}>f</span>
        </div>
        <span style={{fontSize:16,fontWeight:700,color:"#fff"}}>fliwoX</span>
        <span style={{fontSize:11,color:"rgba(255,255,255,.4)",marginLeft:4}}>Portale Azienda</span>
      </div>
      <div style={{display:"flex",gap:2,marginLeft:24}}>
        {[{id:"team",label:"Team",count:OPERATORI.length},{id:"marketplace",label:"Marketplace",count:MARKETPLACE.length}].map(p => (
          <div key={p.id} onClick={() => {setPage(p.id);setSelOp(null);setSelComm(null);}}
            style={{padding:"8px 18px",borderRadius:6,fontSize:13,fontWeight:page===p.id?700:500,color:page===p.id?"#fff":"rgba(255,255,255,.5)",background:page===p.id?"rgba(255,255,255,.1)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            {p.label}
            <span style={{fontSize:10,fontWeight:700,background:page===p.id?"rgba(255,255,255,.15)":"rgba(255,255,255,.06)",padding:"1px 6px",borderRadius:3}}>{p.count}</span>
          </div>
        ))}
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:16,alignItems:"center"}}>
        {[{l:"Attivi",v:OPERATORI.filter(o=>o.stato==="in_cantiere"||o.stato==="in_sopralluogo").length,c:T.green},{l:"Disponibili",v:OPERATORI.filter(o=>o.stato==="disponibile").length,c:T.teal},{l:"Bloccati",v:OPERATORI.reduce((s,o)=>s+o.commesse.filter(c=>c.stato==="in_attesa_materiali").length,0),c:T.amber}].map((k,i) => (
          <div key={i} style={{textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:k.c,fontFamily:T.mono}}>{k.v}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ══════════ TEAM PAGE ══════════ */
  const TeamPage = () => (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Search bar */}
      <div style={{padding:"12px 24px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca operatore..."
          style={{padding:"8px 14px",borderRadius:6,border:`1px solid ${T.line}`,fontSize:13,background:T.bg,outline:"none",color:T.ink,fontFamily:T.font,width:240}}/>
        <span style={{fontSize:12,color:T.sub}}>{ops.length} operatori</span>
      </div>

      {!selOp ? (
        /* ── GRIGLIA OPERATORI ── */
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
            {ops.map(o => {
              const sc = SC(o.stato);
              const commAtt = o.commesse.filter(c=>c.stato==="in_corso"||c.stato==="in_attesa_materiali");
              return (
                <div key={o.id} onClick={()=>{setSelOp(o.id);setSelComm(null);}}
                  style={{background:T.bg,border:`1px solid ${T.line}`,borderRadius:10,padding:"16px 20px",cursor:"pointer",transition:"box-shadow .15s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                  {/* Header */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:8,background:o.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800}}>{o.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{o.nome}</div>
                      <div style={{fontSize:11,color:T.sub}}>{o.ruolo} · {o.automezzo}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:600,color:sc.fg,background:sc.bg,padding:"3px 8px",borderRadius:4}}>{sc.l}</span>
                  </div>
                  {/* KPI mini */}
                  <div style={{display:"flex",gap:12,marginBottom:8}}>
                    {[{l:"Ore",v:`${o.kpi.ore}h`},{l:"Media",v:`${o.kpi.media}h/g`},{l:"Voto",v:`${o.kpi.voto}/5`,c:o.kpi.voto>=4.5?T.green:o.kpi.voto>=4?T.ink:T.amber},{l:"Ritardi",v:o.kpi.ritardi,c:o.kpi.ritardi>3?T.red:T.ink}].map((k,i)=>(
                      <div key={i}>
                        <div style={{fontSize:9,color:T.muted}}>{k.l}</div>
                        <div style={{fontSize:12,fontWeight:600,color:k.c||T.ink,fontFamily:T.mono}}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Agenda settimana mini */}
                  <div style={{display:"flex",gap:3,marginBottom:8}}>
                    {(o.agenda||[]).map((g,i) => (
                      <div key={i} style={{flex:1,height:20,borderRadius:3,background:g.col?`${g.col}20`:T.lineLight,borderLeft:g.col?`2px solid ${g.col}`:"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:8,fontWeight:600,color:g.col||T.muted}}>{g.g}</span>
                      </div>
                    ))}
                  </div>
                  {/* Commesse attive */}
                  {commAtt.length > 0 && (
                    <div style={{borderTop:`1px solid ${T.lineLight}`,paddingTop:8}}>
                      {commAtt.map(c => (
                        <div key={c.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:CC(c.stato)}}/>
                          <span style={{fontSize:10,fontWeight:600,color:T.teal,fontFamily:T.mono}}>{c.id}</span>
                          <span style={{fontSize:10,color:T.sub,flex:1}}>{c.cliente}</span>
                          <span style={{fontSize:10,fontWeight:600,color:T.ink,fontFamily:T.mono}}>{c.avanz}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Posizione */}
                  <div style={{fontSize:10,color:T.muted,marginTop:6}}>{o.posizione.indirizzo} · {o.posizione.agg}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── DETTAGLIO OPERATORE ── */
        <div style={{flex:1,overflowY:"auto"}}>
          {/* Back + header */}
          <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:16}}>
            <div onClick={()=>{setSelOp(null);setSelComm(null);}} style={{width:32,height:32,borderRadius:6,background:T.lineLight,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </div>
            <div style={{width:44,height:44,borderRadius:10,background:op.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:800}}>{op.avatar}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:700,color:T.ink}}>{op.nome}</div>
              <div style={{fontSize:12,color:T.sub}}>{op.ruolo} · {op.telefono} · {op.automezzo}</div>
            </div>
            <a href={`tel:${op.telefono.replace(/\s/g,"")}`} style={{padding:"6px 14px",borderRadius:6,background:T.greenLight,color:T.green,fontSize:11,fontWeight:700,textDecoration:"none",border:`1px solid ${T.green}30`}}>Chiama</a>
            <a href={`https://wa.me/${op.telefono.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener" style={{padding:"6px 14px",borderRadius:6,background:"#DCF8C6",color:"#128C7E",fontSize:11,fontWeight:700,textDecoration:"none"}}>WhatsApp</a>
            <span style={{fontSize:11,fontWeight:600,color:SC(op.stato).fg,background:SC(op.stato).bg,padding:"4px 10px",borderRadius:5}}>{SC(op.stato).l}</span>
          </div>

          {/* KPI + Agenda row */}
          <div style={{padding:"12px 24px",borderBottom:`1px solid ${T.line}`,display:"flex",gap:24,alignItems:"flex-start"}}>
            {/* KPI */}
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[{l:"Commesse",v:op.kpi.commesse},{l:"Ore anno",v:`${op.kpi.ore}h`},{l:"Media/g",v:`${op.kpi.media}h`,c:T.teal},{l:"Voto",v:`${op.kpi.voto}/5`,c:op.kpi.voto>=4.5?T.green:T.amber},{l:"Ritardi",v:op.kpi.ritardi,c:op.kpi.ritardi>3?T.red:T.ink},{l:"Reclami",v:op.kpi.reclami,c:op.kpi.reclami>2?T.red:T.ink},{l:"Presenze",v:`${op.kpi.presenze}/22`}].map((k,i)=>(
                <div key={i} style={{minWidth:60}}>
                  <div style={{fontSize:9,color:T.muted}}>{k.l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:k.c||T.ink,fontFamily:T.mono}}>{k.v}</div>
                </div>
              ))}
            </div>
            {/* Mini agenda */}
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              {(op.agenda||[]).map((g,i)=>(
                <div key={i} style={{width:56,padding:"4px 6px",borderRadius:4,background:g.col?`${g.col}12`:T.lineLight,borderLeft:g.col?`2px solid ${g.col}`:"2px solid transparent"}}>
                  <div style={{fontSize:9,fontWeight:700,color:g.col||T.muted}}>{g.g}</div>
                  {g.c && <div style={{fontSize:8,color:T.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Commesse grid */}
          <div style={{padding:24}}>
            {!selComm ? (
              <>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>Commesse assegnate ({op.commesse.length})</div>
                {op.commesse.length === 0 ? <div style={{color:T.muted,fontSize:12}}>Nessuna commessa assegnata</div> :
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:12}}>
                  {op.commesse.map(c => (
                    <div key={c.id} onClick={()=>{setSelComm(c.id);setTab("vani");}} style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"14px 18px",cursor:"pointer"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:CC(c.stato)}}/>
                        <span style={{fontSize:12,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{c.id}</span>
                        <span style={{fontSize:10,fontWeight:600,color:c.prio==="alta"?T.red:T.amber}}>{c.prio.toUpperCase()}</span>
                        <span style={{fontSize:11,color:T.sub,marginLeft:"auto"}}>{c.inizio} &rarr; {c.fine}</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{c.cliente}</div>
                      <div style={{fontSize:11,color:T.sub,marginTop:2}}>{c.tipo} · {c.indirizzo}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                        <div style={{flex:1,height:4,background:T.lineLight,borderRadius:2,overflow:"hidden"}}>
                          <div style={{width:`${c.avanz}%`,height:"100%",borderRadius:2,background:c.avanz>=100?T.green:c.avanz>=50?T.teal:T.amber}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:600,fontFamily:T.mono}}>{c.avanz}%</span>
                      </div>
                      <div style={{display:"flex",gap:10,marginTop:6,fontSize:10,color:T.sub}}>
                        <span>{c.vani.length} vani</span><span>{c.foto.length} foto</span><span>{c.doc.length} doc</span><span>{c.chat.length} msg</span>
                        {c.problemi?.filter(p=>p.stato==="aperto").length>0 && <span style={{color:T.red,fontWeight:600}}>{c.problemi.filter(p=>p.stato==="aperto").length} problemi</span>}
                      </div>
                    </div>
                  ))}
                </div>}

                {/* Extra info */}
                <div style={{marginTop:24,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
                  {/* Certificazioni */}
                  <div style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"14px 18px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Certificazioni</div>
                    {(op.cert||[]).map((c,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0"}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:c.ok?T.green:T.amber}}/>
                        <span style={{fontSize:12,color:T.ink,flex:1}}>{c.n}</span>
                        <span style={{fontSize:10,color:c.ok?T.sub:T.amber,fontFamily:T.mono}}>{c.scad}</span>
                      </div>
                    ))}
                  </div>
                  {/* Dotazioni */}
                  <div style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"14px 18px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Dotazioni</div>
                    {(op.dotaz||[]).map((d,i)=>(
                      <div key={i} style={{fontSize:12,color:T.ink,padding:"3px 0"}}>{d.n}</div>
                    ))}
                  </div>
                  {/* Storico */}
                  <div style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"14px 18px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Storico</div>
                    <div style={{display:"flex",gap:8}}>
                      {(op.storico||[]).map((s,i)=>(
                        <div key={i} style={{flex:1,textAlign:"center"}}>
                          <div style={{height:40,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                            <div style={{width:"80%",height:Math.max((s.ore/200)*36,2),borderRadius:3,background:s.v>=4.5?T.teal:s.v>=4?T.blue:T.amber,opacity:.7}}/>
                          </div>
                          <div style={{fontSize:9,color:T.muted,marginTop:2}}>{s.m}</div>
                          <div style={{fontSize:10,fontWeight:600,fontFamily:T.mono}}>{s.ore}h</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ── DETTAGLIO COMMESSA ── */
              <>
                <div onClick={()=>setSelComm(null)} style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,cursor:"pointer",color:T.sub,fontSize:12}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  Torna alle commesse
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{comm.id}</span>
                    <span style={{fontSize:16,fontWeight:700,color:T.ink}}>{comm.cliente}</span>
                    <span style={{fontSize:12,color:T.sub,marginLeft:8}}>{comm.tipo} · {comm.indirizzo}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{display:"flex",gap:2,marginBottom:16,flexWrap:"wrap"}}>
                  {["vani","foto","documenti","chat","timeline","materiali","firme","spese","ore","problemi"].map(t => {
                    const alert = t==="problemi" && comm.problemi?.filter(p=>p.stato==="aperto").length>0;
                    return <div key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:6,fontSize:12,fontWeight:tab===t?700:500,color:tab===t?"#fff":T.sub,background:tab===t?T.teal:"transparent",cursor:"pointer",textTransform:"capitalize",position:"relative"}}>
                      {t}{alert && <span style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:T.red}}/>}
                    </div>;
                  })}
                </div>

                {/* Tab content */}
                {tab==="vani" && comm.vani.map((v,i)=>{const vc=VC(v.stato);return(
                  <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<comm.vani.length-1?`1px solid ${T.lineLight}`:"none"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:vc.c}}/>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{v.id} · {v.nome} <span style={{fontWeight:400,color:T.sub}}>{v.tipo}</span></div><div style={{fontSize:11,color:T.sub}}>{v.dim} · {v.mat}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:vc.c,fontWeight:600}}>{vc.l}</div><div style={{fontSize:11,fontFamily:T.mono}}>{fh(v.oreR)}/{fh(v.oreP)}</div></div>
                  </div>
                )})}

                {tab==="foto" && (comm.foto.length===0?<div style={{color:T.muted,fontSize:12}}>Nessuna foto</div>:comm.foto.map((f,i)=>{
                  const fc={PRIMA:T.blue,DEMOLIZIONE:T.red,MONTAGGIO:T.amber,DOPO:T.green,RILIEVO:T.purple}[f.fase]||T.sub;
                  return <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<comm.foto.length-1?`1px solid ${T.lineLight}`:"none"}}>
                    <div style={{width:52,height:52,borderRadius:6,background:T.lineLight,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>
                    <div style={{flex:1}}><div style={{display:"flex",gap:6,marginBottom:2}}><span style={{fontSize:10,fontWeight:700,color:fc,background:`${fc}15`,padding:"1px 6px",borderRadius:3}}>{f.fase}</span><span style={{fontSize:10,color:T.sub}}>V{f.vano}</span><span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>{f.data}</span></div><div style={{fontSize:12,color:T.ink}}>{f.nota}</div></div>
                  </div>;
                }))}

                {tab==="documenti" && (comm.doc.length===0?<div style={{color:T.muted,fontSize:12}}>Nessun documento</div>:comm.doc.map((d,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<comm.doc.length-1?`1px solid ${T.lineLight}`:"none"}}>
                    <div style={{width:32,height:32,borderRadius:6,background:d.t==="pdf"?T.redLight:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:800,color:d.t==="pdf"?T.red:T.blue,textTransform:"uppercase"}}>{d.t}</span></div>
                    <span style={{fontSize:12,color:T.ink,flex:1}}>{d.n}</span><span style={{fontSize:10,color:T.muted}}>{d.d}</span>
                  </div>
                )))}

                {tab==="chat" && (comm.chat.length===0?<div style={{color:T.muted,fontSize:12}}>Nessun messaggio</div>:comm.chat.map((m,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<comm.chat.length-1?`1px solid ${T.lineLight}`:"none"}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:chatC(m.tipo),marginTop:6,flexShrink:0}}/>
                    <div><div style={{display:"flex",gap:6,marginBottom:1}}><span style={{fontSize:11,fontWeight:600,color:chatC(m.tipo)}}>{m.da}</span><span style={{fontSize:10,color:T.muted}}>{m.ora}</span></div><div style={{fontSize:12,color:T.ink,lineHeight:1.5}}>{m.t}</div></div>
                  </div>
                )))}

                {tab==="timeline" && comm.timeline.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:12,padding:"8px 0"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:14}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:t.e.includes("OGGI")?T.teal:T.line,border:t.e.includes("OGGI")?`2px solid ${T.teal}`:`2px solid ${T.line}`}}/>
                      {i<comm.timeline.length-1&&<div style={{width:1,flex:1,background:T.lineLight,marginTop:4}}/>}
                    </div>
                    <div style={{flex:1}}><div style={{fontSize:12,color:t.e.includes("OGGI")?T.teal:T.ink,fontWeight:t.e.includes("OGGI")?700:400}}>{t.e}</div></div>
                    <span style={{fontSize:10,color:T.muted,fontFamily:T.mono}}>{t.d}</span>
                  </div>
                ))}

                {tab==="materiali" && (comm.materiali.length===0?<div style={{color:T.muted,fontSize:12}}>Nessun materiale</div>:comm.materiali.map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<comm.materiali.length-1?`1px solid ${T.lineLight}`:"none"}}>
                    <div style={{flex:1}}><div style={{fontSize:12,color:T.ink}}>{m.n}</div><div style={{display:"flex",gap:8,marginTop:4,alignItems:"center"}}><div style={{flex:1,height:3,background:T.lineLight,borderRadius:2,overflow:"hidden"}}><div style={{width:`${m.q>0?(m.u/m.q)*100:0}%`,height:"100%",borderRadius:2,background:T.teal}}/></div><span style={{fontSize:10,fontFamily:T.mono,color:T.sub}}>{m.u}/{m.q} {m.um}</span></div></div>
                  </div>
                )))}

                {tab==="firme" && (comm.firme.length===0?<div style={{color:T.muted,fontSize:12}}>Nessuna firma</div>:comm.firme.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<comm.firme.length-1?`1px solid ${T.lineLight}`:"none"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:f.ok?T.green:T.muted}}/><div style={{flex:1}}><div style={{fontSize:12,color:T.ink}}>{f.tipo}</div>{f.ok&&<div style={{fontSize:10,color:T.sub}}>{f.chi} · {f.data}</div>}</div><span style={{fontSize:10,fontWeight:600,color:f.ok?T.green:T.muted}}>{f.ok?"Firmato":"Attesa"}</span>
                  </div>
                )))}

                {tab==="spese" && (comm.spese.length===0?<div style={{color:T.muted,fontSize:12}}>Nessuna spesa</div>:<>
                  <div style={{fontSize:12,color:T.sub,marginBottom:8}}>Totale: {"\u20AC"}{comm.spese.reduce((s,sp)=>s+sp.imp,0).toFixed(2)}</div>
                  {comm.spese.map((sp,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<comm.spese.length-1?`1px solid ${T.lineLight}`:"none"}}>
                      <div style={{flex:1}}><div style={{fontSize:12,color:T.ink}}>{sp.desc}</div><div style={{fontSize:10,color:T.sub}}>{sp.cat} · {sp.d}</div></div>
                      <span style={{fontSize:13,fontWeight:600,fontFamily:T.mono}}>{"\u20AC"}{sp.imp.toFixed(2)}</span>
                      {sp.ok==="no"?<div style={{display:"flex",gap:4}}><div onClick={()=>alert("OK "+sp.desc)} style={{padding:"4px 10px",borderRadius:4,background:T.greenLight,color:T.green,fontSize:10,fontWeight:700,cursor:"pointer"}}>Approva</div><div onClick={()=>alert("NO "+sp.desc)} style={{padding:"4px 10px",borderRadius:4,background:T.redLight,color:T.red,fontSize:10,fontWeight:700,cursor:"pointer"}}>Rifiuta</div></div>:<span style={{fontSize:10,color:T.green,fontWeight:600}}>OK</span>}
                    </div>
                  ))}</>
                )}

                {tab==="ore" && (comm.ore.length===0?<div style={{color:T.muted,fontSize:12}}>Nessuna ora</div>:<>
                  <div style={{fontSize:12,color:T.sub,marginBottom:8}}>Totale: {fh(comm.ore.reduce((s,o)=>s+o.nette,0))}</div>
                  {comm.ore.map((o,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<comm.ore.length-1?`1px solid ${T.lineLight}`:"none"}}>
                      <span style={{fontSize:12,fontFamily:T.mono,minWidth:40}}>{o.d}</span>
                      <span style={{fontSize:12}}>{o.in} {"\u2192"} <span style={{color:o.out?T.ink:T.amber}}>{o.out||"..."}</span></span>
                      {o.pausa>0&&<span style={{fontSize:10,color:T.sub}}>({o.pausa}min)</span>}
                      <span style={{fontSize:13,fontWeight:600,color:T.teal,fontFamily:T.mono,marginLeft:"auto"}}>{o.nette>0?fh(o.nette):"..."}</span>
                    </div>
                  ))}</>
                )}

                {tab==="problemi" && (()=>{
                  const pp = comm.problemi||[];
                  return pp.length===0?<div style={{color:T.muted,fontSize:12}}>Nessun problema</div>:<>
                    {pp.map((p,i)=>(
                      <div key={i} style={{padding:"12px 0",borderBottom:i<pp.length-1?`1px solid ${T.lineLight}`:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{width:7,height:7,borderRadius:"50%",background:p.stato==="aperto"?T.red:T.green}}/>
                          <span style={{fontSize:11,fontWeight:700,color:p.stato==="aperto"?T.red:T.green}}>{p.stato==="aperto"?"APERTO":"RISOLTO"}</span>
                          <span style={{fontSize:10,fontWeight:600,color:p.prio==="alta"?T.red:T.amber,background:p.prio==="alta"?T.redLight:T.amberLight,padding:"1px 6px",borderRadius:3}}>{p.prio}</span>
                          <span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>{p.data}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:T.ink,marginBottom:2}}>{p.tit}</div>
                        <div style={{fontSize:12,color:T.sub,lineHeight:1.5}}>{p.desc}</div>
                      </div>
                    ))}</>
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ══════════ MARKETPLACE PAGE ══════════ */
  const MktPage = () => (
    <div style={{flex:1,overflowY:"auto",padding:24}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
        <div style={{fontSize:18,fontWeight:700,color:T.ink}}>Marketplace fliwoX</div>
        <div style={{fontSize:12,color:T.sub}}>Borsa lavori tra serramentisti</div>
        <div onClick={()=>alert("Pubblica lavoro")} style={{marginLeft:"auto",padding:"8px 20px",borderRadius:6,background:T.amber,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Pubblica lavoro</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        {/* COLONNA SX — I miei */}
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:12}}>I miei lavori pubblicati ({MARKETPLACE.filter(m=>m.dir==="out").length})</div>
          {MARKETPLACE.filter(m=>m.dir==="out").map(m=>(
            <div key={m.id} style={{border:`1px solid ${T.line}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:T.amber,fontFamily:T.mono}}>{m.id}</span>
                <span style={{fontSize:11,fontWeight:600,color:m.offerte.length>0?T.green:T.muted,background:m.offerte.length>0?T.greenLight:T.lineLight,padding:"2px 8px",borderRadius:4}}>{m.offerte.length>0?`${m.offerte.length} offerte`:"In attesa"}</span>
                <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>entro {m.scad}</span>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:4}}>{m.titolo}</div>
              <div style={{fontSize:12,color:T.sub,marginBottom:4}}>{m.zona} · Budget {m.budget}</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.5}}>{m.desc}</div>
              {m.offerte.length>0&&<div style={{borderTop:`1px solid ${T.line}`,marginTop:10,paddingTop:10}}>
                {m.offerte.map((o,oi)=>(
                  <div key={oi} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",borderRadius:6,marginBottom:4,background:oi===0?T.tealLight:"transparent",border:oi===0?`1px solid ${T.tealBorder}`:`1px solid transparent`}}>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{o.da}</div><div style={{fontSize:11,color:T.sub}}>{o.nota}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{"\u20AC"}{o.pr}</div><div style={{fontSize:10,color:T.sub}}>{o.v}/5 · {o.gg}</div></div>
                    <div onClick={()=>alert("Accetti "+o.da+"?")} style={{padding:"6px 14px",borderRadius:6,background:T.teal,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Accetta</div>
                  </div>
                ))}
              </div>}
            </div>
          ))}
          {/* Presi */}
          <div style={{fontSize:13,fontWeight:700,color:T.teal,marginTop:20,marginBottom:12}}>Lavori presi ({MARKETPLACE.filter(m=>m.dir==="done").length})</div>
          {MARKETPLACE.filter(m=>m.dir==="done").map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",border:`1px solid ${T.line}`,borderRadius:8,marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,marginBottom:2}}><span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{m.id}</span><span style={{fontSize:10,fontWeight:600,color:m.stato==="completato"?T.green:T.amber,background:m.stato==="completato"?T.greenLight:T.amberLight,padding:"1px 6px",borderRadius:3}}>{m.stato==="completato"?"Completato":"In corso"}</span></div>
                <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{m.titolo}</div>
                <div style={{fontSize:11,color:T.sub}}>{m.zona} · {m.assegnato}</div>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{"\u20AC"}{m.prezzo}</div>
            </div>
          ))}
        </div>

        {/* COLONNA DX — Disponibili */}
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.blue,marginBottom:12}}>Disponibili nella mia zona ({MARKETPLACE.filter(m=>m.dir==="in").length})</div>
          {MARKETPLACE.filter(m=>m.dir==="in").map(m=>(
            <div key={m.id} style={{border:`1px solid ${m.urgente?T.red:T.line}`,borderRadius:10,padding:"16px 20px",marginBottom:12,position:"relative"}}>
              {m.urgente&&<div style={{position:"absolute",top:-1,right:16,background:T.red,color:"#fff",fontSize:10,fontWeight:800,padding:"2px 10px",borderRadius:"0 0 6px 6px"}}>URGENTE</div>}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:T.blue,fontFamily:T.mono}}>{m.id}</span>
                <span style={{fontSize:11,color:T.muted}}>{m.km}</span>
                <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>entro {m.scad}</span>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:4}}>{m.titolo}</div>
              <div style={{fontSize:12,color:T.sub,marginBottom:2}}>{m.zona} · <span style={{fontWeight:600,color:T.ink}}>{m.azienda}</span></div>
              <div style={{fontSize:16,fontWeight:700,color:T.green,fontFamily:T.mono,margin:"6px 0"}}>{"\u20AC"}{m.budget}</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.5,marginBottom:10}}>{m.desc}</div>
              <div style={{display:"flex",gap:8}}>
                <div onClick={()=>alert("Offerta per "+m.titolo)} style={{padding:"8px 20px",borderRadius:6,background:T.teal,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Fai offerta</div>
                <div style={{padding:"8px 20px",borderRadius:6,background:T.lineLight,color:T.sub,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${T.line}`}}>Dettagli</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",fontFamily:T.font,color:T.ink,height:"100vh",overflow:"hidden",background:T.bgAlt}}>
      <Topbar/>
      {page==="team"?<TeamPage/>:<MktPage/>}
    </div>
  );
}
