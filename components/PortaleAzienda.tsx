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
const SC = (s) => ({in_cantiere:{bg:T.greenLight,fg:T.green,l:"Cantiere"},disponibile:{bg:T.tealLight,fg:T.teal,l:"Libero"},in_sopralluogo:{bg:T.purpleLight,fg:T.purple,l:"Sopralluogo"},in_pausa:{bg:T.amberLight,fg:T.amber,l:"Pausa"},non_disponibile:{bg:T.redLight,fg:T.red,l:"Assente"}}[s]||{bg:T.bgAlt,fg:T.sub,l:s});
const fh = (n) => n > 0 ? n.toFixed(1)+"h" : "\u2014";
const CC = (s) => ({in_corso:T.green,programmata:T.blue,in_attesa_materiali:T.amber,completata:T.teal}[s]||T.muted);
const chatC = (t) => ({op:T.teal,uff:T.blue,cli:T.green,ai:T.purple}[t]||T.sub);

const NAV = [
  {id:"dashboard",label:"Dashboard",icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},
  {id:"calendario",label:"Calendario",icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"},
  {id:"operatori",label:"Operatori",icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"},
  {id:"commesse",label:"Commesse",icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"},
  {id:"marketplace",label:"Marketplace",icon:"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"},
  {id:"problemi",label:"Problemi",icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"},
  {id:"spese",label:"Spese",icon:"M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"},
  {id:"documenti",label:"Documenti",icon:"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"},
];

export default function PortaleAzienda() {
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [selOp, setSelOp] = useState(null);
  const [selComm, setSelComm] = useState(null);
  const [tab, setTab] = useState("vani");
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  const op = selOp ? OPERATORI.find(o => o.id === selOp) : null;
  const comm = op && selComm ? op.commesse.find(c => c.id === selComm) : null;
  const tutteComm = OPERATORI.flatMap(o => o.commesse.map(c => ({...c, opNome: o.nome, opAvatar: o.avatar, opColore: o.colore, opId: o.id})));
  const tuttiProb = OPERATORI.flatMap(o => o.commesse.flatMap(c => (c.problemi||[]).filter(p => p.stato === "aperto").map(p => ({...p, opNome: o.nome, commId: c.id, cliente: c.cliente}))));
  const tutteSpese = OPERATORI.flatMap(o => o.commesse.flatMap(c => c.spese.map(s => ({...s, opNome: o.nome, commId: c.id, opId: o.id}))));
  const tuttiDoc = OPERATORI.flatMap(o => o.commesse.flatMap(c => c.doc.map(d => ({...d, opNome: o.nome, commId: c.id, cliente: c.cliente}))));
  const certScad = OPERATORI.flatMap(o => (o.cert||[]).filter(c => !c.ok).map(c => ({...c, opNome: o.nome})));

  const NavIcon = ({d}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

  /* ═══ SIDEBAR ═══ */
  const Sidebar = () => (
    <div style={{width:sideOpen?220:56,background:"#0D1F1F",display:"flex",flexDirection:"column",paddingTop:12,flexShrink:0,transition:"width .2s ease",overflow:"hidden"}}>
      {/* Logo + toggle */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 12px",marginBottom:16}}>
        <div style={{width:32,height:32,borderRadius:7,background:T.teal,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#fff",fontSize:14,fontWeight:800}}>f</span>
        </div>
        {sideOpen&&<span style={{fontSize:15,fontWeight:700,color:"#fff",flex:1}}>fliwoX</span>}
        <div onClick={()=>setSideOpen(!sideOpen)} style={{width:24,height:24,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(255,255,255,.4)",flexShrink:0}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{sideOpen?<path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>:<path d="M13 5l7 7-7 7M6 5l7 7-7 7"/>}</svg>
        </div>
      </div>
      {/* Nav items */}
      <div style={{display:"flex",flexDirection:"column",gap:2,padding:"0 8px"}}>
        {NAV.map(n => {
          const active = page === n.id && !selOp;
          const badge = n.id==="problemi"?tuttiProb.length:n.id==="spese"?tutteSpese.filter(s=>s.ok==="no").length:0;
          return (
            <div key={n.id} onClick={() => {setPage(n.id);setSelOp(null);setSelComm(null);}}
              style={{display:"flex",alignItems:"center",gap:10,padding:sideOpen?"10px 12px":"10px 0",borderRadius:6,cursor:"pointer",color:active?"#fff":"rgba(255,255,255,.45)",background:active?"rgba(255,255,255,.1)":"transparent",transition:"all .15s",position:"relative",justifyContent:sideOpen?"flex-start":"center"}}>
              <div style={{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",width:20}}><NavIcon d={n.icon}/></div>
              {sideOpen&&<span style={{fontSize:13,fontWeight:active?700:500,whiteSpace:"nowrap"}}>{n.label}</span>}
              {badge>0&&<span style={{position:sideOpen?"static":"absolute",top:sideOpen?undefined:2,right:sideOpen?undefined:0,marginLeft:sideOpen?"auto":0,minWidth:18,height:18,borderRadius:9,background:T.red,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
            </div>
          );
        })}
      </div>
      {/* Footer */}
      {sideOpen&&<div style={{marginTop:"auto",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>08 Apr 2026</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>{OPERATORI.length} operatori</div>
      </div>}
    </div>
  );

  /* ═══ DASHBOARD ═══ */
  const PageDashboard = () => {
    const inCant = OPERATORI.filter(o=>o.stato==="in_cantiere"||o.stato==="in_sopralluogo");
    const liberi = OPERATORI.filter(o=>o.stato==="disponibile"||o.stato==="in_pausa");
    const assenti = OPERATORI.filter(o=>o.stato==="non_disponibile");
    const commAttive = tutteComm.filter(c=>c.stato==="in_corso"||c.stato==="in_attesa_materiali");
    const giorni = ["Lun","Mar","Mer","Gio","Ven"];
    const giorniLabel = ["Lun 07","Mar 08 OGGI","Mer 09","Gio 10","Ven 11"];

    return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* HEADER */}
      <div style={{padding:"20px 28px 0",flexShrink:0}}>
        <div style={{fontSize:20,fontWeight:700}}>Centro Controllo</div>
        <div style={{fontSize:12,color:T.sub,marginTop:2}}>Martedi 8 Aprile 2026 · {OPERATORI.length} operatori · {tutteComm.length} commesse</div>
      </div>

      {/* BODY — 2 righe che riempiono tutto */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:"16px 28px 28px",gap:16}}>

        {/* ═══ RIGA 1: CHI STA DOVE ADESSO ═══ */}
        <div style={{background:T.bg,borderRadius:10,border:`1px solid ${T.line}`,padding:20,flexShrink:0}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:T.green}}>In campo adesso</span>
            <span style={{fontSize:12,color:T.sub,fontWeight:400}}>· {inCant.length} attivi · {liberi.length} liberi · {assenti.length} assenti</span>
            {tuttiProb.length>0&&<span style={{marginLeft:"auto",fontSize:11,fontWeight:600,color:T.red,background:T.redLight,padding:"3px 10px",borderRadius:5}}>{tuttiProb.length} problemi aperti</span>}
            {tutteSpese.filter(s=>s.ok==="no").length>0&&<span style={{fontSize:11,fontWeight:600,color:T.amber,background:T.amberLight,padding:"3px 10px",borderRadius:5}}>{tutteSpese.filter(s=>s.ok==="no").length} spese da approvare</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {OPERATORI.map(o => {
              const sc = SC(o.stato);
              const oggi = (o.agenda||[]).find(g=>g.g==="Mar");
              const commAtt = o.commesse.find(c=>c.stato==="in_corso");
              const prob = o.commesse.flatMap(c=>(c.problemi||[]).filter(p=>p.stato==="aperto"));
              return (
                <div key={o.id} onClick={()=>{setSelOp(o.id);setPage("operatori");}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:`1px solid ${prob.length>0?T.red+"50":T.lineLight}`,background:prob.length>0?T.redLight:o.stato==="non_disponibile"?"#f9f9f9":"transparent",cursor:"pointer",transition:"background .15s"}}>
                  <div style={{width:36,height:36,borderRadius:8,background:o.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800,flexShrink:0,position:"relative"}}>
                    {o.avatar}
                    <span style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:sc.fg,border:"2px solid #fff"}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:T.ink}}>{o.nome.split(" ")[0]}</span>
                      <span style={{fontSize:9,color:T.muted}}>{o.ruolo}</span>
                    </div>
                    <div style={{fontSize:11,color:oggi?.a?T.ink:T.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>
                      {oggi?.a||(o.stato==="non_disponibile"?"Assente":"Nessuna attivita")}
                    </div>
                    {prob.length>0&&<div style={{fontSize:9,color:T.red,fontWeight:600,marginTop:1}}>{prob[0].tit.substring(0,35)}...</div>}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {oggi?.c&&<div style={{fontSize:9,fontWeight:700,color:T.teal,fontFamily:T.mono,background:T.tealLight,padding:"2px 6px",borderRadius:3,marginBottom:2}}>{oggi.c}</div>}
                    {oggi?.h&&<div style={{fontSize:9,color:T.muted}}>{oggi.h}</div>}
                    {commAtt&&<div style={{fontSize:9,color:T.sub,fontFamily:T.mono}}>{commAtt.avanz}%</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ RIGA 2: 2 COLONNE — Lavori da completare + Prossimi giorni ═══ */}
        <div style={{flex:1,display:"flex",gap:16,overflow:"hidden",minHeight:0}}>

          {/* COL 1: LAVORI DA COMPLETARE */}
          <div style={{flex:1,background:T.bg,borderRadius:10,border:`1px solid ${T.line}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"16px 20px 10px",flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:700}}>Lavori da completare ({commAttive.length})</div>
              <div style={{fontSize:11,color:T.sub}}>Ordinate per urgenza</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0 20px 16px"}}>
              {commAttive.sort((a,b)=>{
                const prio = {alta:0,media:1,bassa:2};
                if(a.stato==="in_attesa_materiali"&&b.stato!=="in_attesa_materiali") return -1;
                return (prio[a.prio]||2)-(prio[b.prio]||2);
              }).map((c,i) => {
                const bloccata = c.stato === "in_attesa_materiali";
                const prob = (c.problemi||[]).filter(p=>p.stato==="aperto");
                return (
                  <div key={c.id+c.opNome} onClick={()=>{setSelOp(c.opId);setSelComm(c.id);setTab("vani");setPage("operatori");}}
                    style={{padding:"12px 0",borderBottom:i<commAttive.length-1?`1px solid ${T.lineLight}`:"none",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{c.id}</span>
                      {c.prio==="alta"&&<span style={{fontSize:9,fontWeight:700,color:T.red,background:T.redLight,padding:"1px 6px",borderRadius:3}}>ALTA</span>}
                      {bloccata&&<span style={{fontSize:9,fontWeight:700,color:T.amber,background:T.amberLight,padding:"1px 6px",borderRadius:3}}>BLOCCATA</span>}
                      {prob.length>0&&<span style={{fontSize:9,fontWeight:700,color:T.red,background:T.redLight,padding:"1px 6px",borderRadius:3}}>{prob.length} problema</span>}
                      <span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>{c.inizio} → {c.fine}</span>
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{c.cliente}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:1}}>{c.tipo} · {c.indirizzo}</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6}}>
                      <div style={{flex:1,height:5,background:T.lineLight,borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${c.avanz}%`,height:"100%",borderRadius:3,background:bloccata?T.amber:c.avanz>=80?T.green:T.teal}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:T.mono,color:T.ink}}>{c.avanz}%</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                      <div style={{width:20,height:20,borderRadius:4,background:c.opColore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:7,fontWeight:800}}>{c.opAvatar}</div>
                      <span style={{fontSize:10,color:T.sub}}>{c.opNome}</span>
                      <span style={{fontSize:10,color:T.sub,marginLeft:"auto"}}>{c.vani.length} vani · {c.vani.filter(v=>v.stato==="montato").length} fatti</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COL 2: PROSSIMI GIORNI */}
          <div style={{flex:1,background:T.bg,borderRadius:10,border:`1px solid ${T.line}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"16px 20px 10px",flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:700}}>Prossimi giorni</div>
              <div style={{fontSize:11,color:T.sub}}>Mercoledi, Giovedi, Venerdi</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0 20px 16px"}}>
              {[{g:"Mer 09",idx:2},{g:"Gio 10",idx:3},{g:"Ven 11",idx:4}].map(day => {
                const attivi = OPERATORI.filter(o=>{const ag=(o.agenda||[])[day.idx];return ag&&ag.a&&!ag.a.includes("Malattia");});
                const liberiG = OPERATORI.filter(o=>{const ag=(o.agenda||[])[day.idx];return !ag||!ag.a||ag.a.includes("Malattia");}).filter(o=>o.stato!=="non_disponibile");
                const isOpen = expandedDays[day.g] !== false;
                return (
                  <div key={day.g} style={{marginBottom:4}}>
                    <div onClick={()=>setExpandedDays(prev=>({...prev,[day.g]:!isOpen}))}
                      style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",cursor:"pointer",borderBottom:`1px solid ${T.lineLight}`,userSelect:"none"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2.5" style={{transform:isOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s"}}><path d="M9 18l6-6-6-6"/></svg>
                      <span style={{fontSize:14,fontWeight:700,color:T.ink}}>{day.g}</span>
                      <span style={{fontSize:11,color:T.teal,fontWeight:600}}>{attivi.length} attivi</span>
                      {liberiG.length>0&&<span style={{fontSize:11,color:T.muted}}>{liberiG.length} liberi</span>}
                    </div>
                    {isOpen&&<div style={{padding:"8px 0"}}>
                      {attivi.map(o => {
                        const ag = (o.agenda||[])[day.idx];
                        const rowKey = day.g+"-"+o.id;
                        const isExp = expandedRow === rowKey;
                        const commRef = ag.c ? o.commesse.find(c=>c.id.includes(ag.c.replace("COM-","COM-2024-").replace("RIL-","RIL-2024-"))) : null;
                        return (
                          <div key={o.id} style={{marginBottom:4}}>
                            <div onClick={()=>setExpandedRow(isExp?null:rowKey)}
                              style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:isExp?"6px 6px 0 0":6,background:`${ag.col||T.muted}08`,borderLeft:`3px solid ${ag.col||T.muted}`,cursor:"pointer"}}>
                              <div style={{width:26,height:26,borderRadius:6,background:o.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:800,flexShrink:0}}>{o.avatar}</div>
                              <span style={{fontSize:12,fontWeight:600,color:T.ink,minWidth:70}}>{o.nome.split(" ")[0]}</span>
                              <span style={{fontSize:11,color:T.sub,flex:1}}>{ag.a}</span>
                              {ag.c&&<span style={{fontSize:10,fontWeight:700,color:ag.col||T.teal,fontFamily:T.mono}}>{ag.c}</span>}
                              {ag.h&&<span style={{fontSize:10,color:T.muted}}>{ag.h}</span>}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{transform:isExp?"rotate(180deg)":"rotate(0deg)",transition:"transform .15s"}}><path d="M6 9l6 6 6-6"/></svg>
                            </div>
                            {isExp&&<div style={{background:`${ag.col||T.muted}05`,borderLeft:`3px solid ${ag.col||T.muted}`,borderRadius:"0 0 6px 0",padding:"10px 14px 12px"}}>
                              {/* Dettagli operatore per quel giorno */}
                              <div style={{display:"flex",gap:16,marginBottom:8}}>
                                <div><div style={{fontSize:9,color:T.muted}}>Telefono</div><div style={{fontSize:11,fontWeight:600}}>{o.telefono}</div></div>
                                <div><div style={{fontSize:9,color:T.muted}}>Mezzo</div><div style={{fontSize:11,fontWeight:600}}>{o.automezzo}</div></div>
                                <div><div style={{fontSize:9,color:T.muted}}>Ruolo</div><div style={{fontSize:11,fontWeight:600}}>{o.ruolo}</div></div>
                                <div><div style={{fontSize:9,color:T.muted}}>Voto</div><div style={{fontSize:11,fontWeight:600}}>{o.kpi.voto}/5</div></div>
                              </div>
                              {commRef&&<>
                                <div style={{borderTop:`1px solid ${T.lineLight}`,paddingTop:8,marginBottom:6}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                                    <span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{commRef.id}</span>
                                    <span style={{fontSize:12,fontWeight:600}}>{commRef.cliente}</span>
                                    {commRef.prio==="alta"&&<span style={{fontSize:8,fontWeight:700,color:T.red,background:T.redLight,padding:"1px 5px",borderRadius:3}}>ALTA</span>}
                                  </div>
                                  <div style={{fontSize:11,color:T.sub}}>{commRef.tipo} · {commRef.indirizzo}</div>
                                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                                    <div style={{flex:1,height:4,background:T.lineLight,borderRadius:2,overflow:"hidden"}}><div style={{width:`${commRef.avanz}%`,height:"100%",borderRadius:2,background:T.teal}}/></div>
                                    <span style={{fontSize:11,fontWeight:700,fontFamily:T.mono}}>{commRef.avanz}%</span>
                                  </div>
                                </div>
                                {/* Vani */}
                                <div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>VANI ({commRef.vani.length})</div>
                                  {commRef.vani.map(v=>{
                                    const vc={montato:T.green,in_corso:T.amber,da_fare:T.muted}[v.stato]||T.muted;
                                    return <div key={v.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${T.lineLight}`}}>
                                      <span style={{width:5,height:5,borderRadius:"50%",background:vc,flexShrink:0}}/>
                                      <span style={{fontSize:10,fontWeight:600,minWidth:24}}>{v.id}</span>
                                      <span style={{fontSize:10,flex:1}}>{v.nome} · {v.tipo}</span>
                                      <span style={{fontSize:9,color:T.sub}}>{v.dim}</span>
                                      <span style={{fontSize:9,color:T.sub,fontFamily:T.mono}}>{v.oreR>0?v.oreR.toFixed(1)+"h":"—"}/{v.oreP}h</span>
                                    </div>;
                                  })}
                                </div>
                                {/* Materiali */}
                                {commRef.materiali.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>MATERIALI</div>
                                  {commRef.materiali.map((m,mi)=><div key={mi} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:10}}>
                                    <span style={{flex:1}}>{m.n}</span>
                                    <span style={{fontFamily:T.mono,color:T.sub}}>{m.u}/{m.q} {m.um}</span>
                                  </div>)}
                                </div>}
                                {/* Problemi */}
                                {(commRef.problemi||[]).filter(p=>p.stato==="aperto").length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.red,marginBottom:4}}>PROBLEMI APERTI</div>
                                  {(commRef.problemi||[]).filter(p=>p.stato==="aperto").map((p,pi)=><div key={pi} style={{padding:"4px 0",borderBottom:`1px solid ${T.lineLight}`}}>
                                    <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{width:5,height:5,borderRadius:"50%",background:T.red}}/><span style={{fontSize:10,fontWeight:600,color:T.red}}>{p.tit}</span><span style={{fontSize:9,fontWeight:600,color:p.prio==="alta"?T.red:T.amber,marginLeft:"auto"}}>{p.prio}</span></div>
                                    <div style={{fontSize:9,color:T.sub,marginTop:1}}>{p.desc}</div>
                                  </div>)}
                                </div>}
                                {/* Documenti */}
                                {commRef.doc.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>DOCUMENTI ({commRef.doc.length})</div>
                                  {commRef.doc.map((d,di)=><div key={di} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",borderBottom:`1px solid ${T.lineLight}`}}>
                                    <div style={{width:20,height:20,borderRadius:4,background:d.t==="pdf"?T.redLight:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,fontWeight:800,color:d.t==="pdf"?T.red:T.blue}}>{d.t.toUpperCase()}</span></div>
                                    <span style={{fontSize:10,flex:1}}>{d.n}</span>
                                    <span style={{fontSize:9,color:T.muted}}>{d.d}</span>
                                  </div>)}
                                </div>}
                                {/* Foto */}
                                {commRef.foto.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>FOTO ({commRef.foto.length})</div>
                                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                    {commRef.foto.map((f,fi)=>{
                                      const fc={PRIMA:T.blue,DEMOLIZIONE:T.red,MONTAGGIO:T.amber,DOPO:T.green,RILIEVO:T.purple}[f.fase]||T.sub;
                                      return <div key={fi} style={{width:80,borderRadius:4,border:`1px solid ${T.line}`,overflow:"hidden"}}>
                                        <div style={{height:48,background:T.lineLight,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>
                                        <div style={{padding:"3px 4px"}}><div style={{fontSize:7,fontWeight:700,color:fc}}>{f.fase}</div><div style={{fontSize:7,color:T.muted}}>V{f.vano} {f.data}</div></div>
                                      </div>;
                                    })}
                                  </div>
                                </div>}
                                {/* Chat */}
                                {commRef.chat.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>CHAT ({commRef.chat.length})</div>
                                  {commRef.chat.slice(-4).map((m,mi)=>{
                                    const cc={op:T.teal,uff:T.blue,cli:T.green,ai:T.purple}[m.tipo]||T.sub;
                                    return <div key={mi} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:`1px solid ${T.lineLight}`}}>
                                      <span style={{width:4,height:4,borderRadius:"50%",background:cc,marginTop:5,flexShrink:0}}/>
                                      <div><div style={{display:"flex",gap:4}}><span style={{fontSize:9,fontWeight:600,color:cc}}>{m.da}</span><span style={{fontSize:8,color:T.muted}}>{m.ora}</span></div><div style={{fontSize:10,color:T.ink}}>{m.t}</div></div>
                                    </div>;
                                  })}
                                  {commRef.chat.length>4&&<div style={{fontSize:9,color:T.teal,cursor:"pointer",padding:"3px 0"}}>+ altri {commRef.chat.length-4} messaggi</div>}
                                </div>}
                                {/* Firme */}
                                {commRef.firme.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>FIRME</div>
                                  {commRef.firme.map((f,fi)=><div key={fi} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0"}}>
                                    <span style={{width:5,height:5,borderRadius:"50%",background:f.ok?T.green:T.muted}}/>
                                    <span style={{fontSize:10,flex:1}}>{f.tipo}</span>
                                    <span style={{fontSize:9,color:f.ok?T.green:T.muted}}>{f.ok?`${f.chi} ${f.data}`:"In attesa"}</span>
                                  </div>)}
                                </div>}
                                {/* Spese */}
                                {commRef.spese.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>SPESE ({commRef.spese.length}) · Tot {"\u20AC"}{commRef.spese.reduce((s,sp)=>s+sp.imp,0).toFixed(2)}</div>
                                  {commRef.spese.map((s,si)=><div key={si} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",borderBottom:`1px solid ${T.lineLight}`}}>
                                    <span style={{width:5,height:5,borderRadius:"50%",background:s.ok==="si"?T.green:T.amber}}/>
                                    <span style={{fontSize:10,flex:1}}>{s.desc} · {s.cat}</span>
                                    <span style={{fontSize:10,fontWeight:600,fontFamily:T.mono}}>{"\u20AC"}{s.imp.toFixed(2)}</span>
                                    {s.ok==="no"&&<div style={{display:"flex",gap:2}}><div onClick={(e)=>{e.stopPropagation();alert("OK")}} style={{padding:"2px 6px",borderRadius:3,background:T.greenLight,color:T.green,fontSize:8,fontWeight:700,cursor:"pointer"}}>OK</div><div onClick={(e)=>{e.stopPropagation();alert("NO")}} style={{padding:"2px 6px",borderRadius:3,background:T.redLight,color:T.red,fontSize:8,fontWeight:700,cursor:"pointer"}}>NO</div></div>}
                                  </div>)}
                                </div>}
                                {/* Ore */}
                                {commRef.ore.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>ORE · Tot {commRef.ore.reduce((s,o)=>s+o.nette,0).toFixed(1)}h</div>
                                  {commRef.ore.map((o2,oi)=><div key={oi} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:10}}>
                                    <span style={{fontFamily:T.mono,minWidth:32}}>{o2.d}</span>
                                    <span>{o2.in} {"\u2192"} {o2.out||"..."}</span>
                                    {o2.pausa>0&&<span style={{color:T.muted}}>({o2.pausa}m)</span>}
                                    <span style={{marginLeft:"auto",fontWeight:600,color:T.teal,fontFamily:T.mono}}>{o2.nette>0?o2.nette.toFixed(1)+"h":"..."}</span>
                                  </div>)}
                                </div>}
                                {/* Timeline */}
                                {commRef.timeline.length>0&&<div style={{marginTop:8}}>
                                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>TIMELINE</div>
                                  {commRef.timeline.map((t2,ti)=><div key={ti} style={{display:"flex",gap:6,padding:"2px 0",fontSize:10}}>
                                    <span style={{fontFamily:T.mono,color:T.muted,minWidth:36}}>{t2.d}</span>
                                    <span style={{color:t2.e.includes("OGGI")?T.teal:T.ink}}>{t2.e}</span>
                                  </div>)}
                                </div>}
                              </>}
                              {!commRef&&!ag.c&&<div style={{fontSize:11,color:T.sub,padding:"4px 0"}}>{ag.a}</div>}
                              <div style={{marginTop:10,display:"flex",gap:6,borderTop:`1px solid ${T.lineLight}`,paddingTop:8}}>
                                <a href={`tel:${o.telefono.replace(/\s/g,"")}`} style={{padding:"5px 12px",borderRadius:5,background:T.greenLight,color:T.green,fontSize:10,fontWeight:700,textDecoration:"none",border:`1px solid ${T.green}30`}}>Chiama</a>
                                <a href={`https://wa.me/${o.telefono.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener" style={{padding:"5px 12px",borderRadius:5,background:"#DCF8C6",color:"#128C7E",fontSize:10,fontWeight:700,textDecoration:"none"}}>WhatsApp</a>
                                <div onClick={(e)=>{e.stopPropagation();setSelOp(o.id);setSelComm(commRef?.id||null);setTab("vani");setPage("operatori");}} style={{padding:"5px 12px",borderRadius:5,background:T.tealLight,color:T.teal,fontSize:10,fontWeight:700,cursor:"pointer",border:`1px solid ${T.tealBorder}`}}>Apri commessa</div>
                              </div>
                            </div>}
                          </div>
                        );
                      })}
                      {liberiG.length>0&&(
                        <div style={{fontSize:11,color:T.muted,padding:"6px 12px",fontStyle:"italic"}}>
                          Liberi: {liberiG.map(o=>o.nome.split(" ")[0]).join(", ")}
                        </div>
                      )}
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );};


  /* ═══ CALENDARIO ═══ */
  const PageCalendario = () => {
    const [calView, setCalView] = useState("settimana");
    const [calFilter, setCalFilter] = useState("tutti");
    const [calExpanded, setCalExpanded] = useState(null);

    const giorni = ["Lun 07","Mar 08","Mer 09","Gio 10","Ven 11"];
    const filteredOps = calFilter === "tutti" ? OPERATORI : OPERATORI.filter(o => {
      if (calFilter === "cantiere") return o.stato === "in_cantiere" || o.stato === "in_sopralluogo";
      if (calFilter === "liberi") return o.stato === "disponibile" || o.stato === "in_pausa";
      if (calFilter === "montatori") return o.ruolo === "montatore" || o.ruolo === "apprendista";
      if (calFilter === "tecnici") return o.ruolo === "tecnico_misure";
      if (calFilter === "ufficio") return o.ruolo === "ufficio" || o.ruolo === "magazziniere";
      return true;
    });

    // Stats per giorno
    const statsGiorno = giorni.map((g,gi) => {
      const attivi = OPERATORI.filter(o => {const ag=(o.agenda||[])[gi]; return ag&&ag.a&&!ag.a.includes("Malattia");}).length;
      const liberi = OPERATORI.filter(o => {const ag=(o.agenda||[])[gi]; return !ag||!ag.a;}).length;
      const malattia = OPERATORI.filter(o => {const ag=(o.agenda||[])[gi]; return ag&&ag.a&&ag.a.includes("Malattia");}).length;
      return {attivi,liberi,malattia};
    });

    // Ore totali per giorno
    const oreGiorno = giorni.map((g,gi) => {
      return OPERATORI.reduce((tot,o) => {
        const ag = (o.agenda||[])[gi];
        if (!ag || !ag.h) return tot;
        const parts = ag.h.split("-");
        if (parts.length === 2) {
          const h1 = parseFloat(parts[0].replace(":",".")); 
          const h2 = parseFloat(parts[1].replace(":",".")); 
          return tot + Math.max(h2 - h1, 0);
        }
        return tot + 8;
      }, 0);
    });

    return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* HEADER */}
      <div style={{padding:"16px 28px",borderBottom:`1px solid ${T.line}`,background:T.bg,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
          <div style={{fontSize:20,fontWeight:700}}>Calendario</div>
          <div style={{fontSize:13,color:T.sub}}>Settimana 7-11 Aprile 2026</div>
          <div style={{display:"flex",gap:2,marginLeft:16}}>
            {["settimana","giorno"].map(v=>(
              <div key={v} onClick={()=>setCalView(v)} style={{padding:"5px 14px",borderRadius:5,fontSize:11,fontWeight:calView===v?700:500,color:calView===v?"#fff":T.sub,background:calView===v?T.teal:"transparent",cursor:"pointer",textTransform:"capitalize"}}>{v}</div>
            ))}
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {[{id:"tutti",l:"Tutti"},{id:"cantiere",l:"In campo"},{id:"liberi",l:"Liberi"},{id:"montatori",l:"Montatori"},{id:"tecnici",l:"Tecnici"},{id:"ufficio",l:"Ufficio/Mag."}].map(f=>(
              <div key={f.id} onClick={()=>setCalFilter(f.id)} style={{padding:"4px 10px",borderRadius:4,fontSize:10,fontWeight:calFilter===f.id?700:500,color:calFilter===f.id?T.teal:T.muted,background:calFilter===f.id?T.tealLight:"transparent",border:`1px solid ${calFilter===f.id?T.tealBorder:"transparent"}`,cursor:"pointer"}}>{f.l}</div>
            ))}
          </div>
        </div>
        {/* Stats riga */}
        <div style={{display:"grid",gridTemplateColumns:"160px repeat(5,1fr)",gap:0}}>
          <div style={{padding:"0 8px"}}>
            <div style={{fontSize:10,color:T.muted}}>Capacita</div>
            <div style={{fontSize:12,fontWeight:600}}>{filteredOps.length} persone</div>
          </div>
          {giorni.map((g,gi)=>{
            const st = statsGiorno[gi];
            const ore = oreGiorno[gi];
            const carico = st.attivi / Math.max(OPERATORI.length,1);
            return (
              <div key={g} style={{padding:"0 8px",borderLeft:`1px solid ${T.lineLight}`,textAlign:"center"}}>
                <div style={{display:"flex",gap:6,justifyContent:"center",fontSize:10}}>
                  <span style={{color:T.green,fontWeight:600}}>{st.attivi} att</span>
                  <span style={{color:T.muted}}>{st.liberi} lib</span>
                  {st.malattia>0&&<span style={{color:T.red}}>{st.malattia} mal</span>}
                </div>
                <div style={{height:3,background:T.lineLight,borderRadius:2,marginTop:4,overflow:"hidden"}}>
                  <div style={{width:`${carico*100}%`,height:"100%",borderRadius:2,background:carico>0.8?T.green:carico>0.5?T.teal:T.amber}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRIGLIA */}
      <div style={{flex:1,overflow:"auto",padding:"0 28px 28px"}}>
        <div style={{background:T.bg,borderRadius:10,border:`1px solid ${T.line}`,overflow:"hidden",minWidth:900}}>
          {/* Header giorni */}
          <div style={{display:"grid",gridTemplateColumns:"160px repeat(5,1fr)",borderBottom:`2px solid ${T.line}`,position:"sticky",top:0,background:T.bg,zIndex:2}}>
            <div style={{padding:"14px 16px",fontWeight:700,fontSize:12,color:T.muted,display:"flex",alignItems:"center",gap:6}}>
              Operatore
              <span style={{fontSize:10,color:T.muted,fontWeight:400}}>({filteredOps.length})</span>
            </div>
            {giorni.map((g,gi)=>(
              <div key={g} style={{padding:"10px 12px",textAlign:"center",borderLeft:`1px solid ${T.line}`,background:gi===1?"rgba(26,158,143,0.05)":"transparent"}}>
                <div style={{fontSize:14,fontWeight:700,color:gi===1?T.teal:T.ink}}>{g}{gi===1?" OGGI":""}</div>
                <div style={{fontSize:9,color:T.muted,marginTop:2}}>{statsGiorno[gi].attivi}/{OPERATORI.length} operativi</div>
              </div>
            ))}
          </div>

          {/* Righe operatori */}
          {filteredOps.map((o,oi)=>(
            <React.Fragment key={o.id}>
              <div style={{display:"grid",gridTemplateColumns:"160px repeat(5,1fr)",borderBottom:`1px solid ${T.lineLight}`,minHeight:72}}>
                {/* Nome operatore */}
                <div onClick={()=>{setSelOp(o.id);setPage("operatori");}} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderRight:`1px solid ${T.lineLight}`}}>
                  <div style={{width:34,height:34,borderRadius:7,background:o.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,flexShrink:0,position:"relative"}}>
                    {o.avatar}
                    <span style={{position:"absolute",bottom:-1,right:-1,width:9,height:9,borderRadius:"50%",background:SC(o.stato).fg,border:"2px solid #fff"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{o.nome.split(" ")[0]}</div>
                    <div style={{fontSize:9,color:T.muted}}>{o.ruolo}</div>
                  </div>
                </div>
                {/* Celle giorni */}
                {(o.agenda||[]).map((g,gi)=>{
                  const cellKey = o.id+"-"+gi;
                  const isExp = calExpanded === cellKey;
                  const commRef = g.c ? o.commesse.find(c=>c.id.includes(g.c.replace("COM-","COM-2024-").replace("RIL-","RIL-2024-"))) : null;
                  return (
                    <div key={gi} onClick={()=>setCalExpanded(isExp?null:cellKey)}
                      style={{padding:"6px 6px",borderLeft:`1px solid ${T.lineLight}`,background:gi===1?"rgba(26,158,143,0.03)":"transparent",cursor:g.a?"pointer":"default",display:"flex",alignItems:"stretch"}}>
                      {g.a?(
                        <div style={{width:"100%",background:`${g.col||T.muted}10`,borderLeft:`4px solid ${g.col||T.muted}`,borderRadius:"0 6px 6px 0",padding:"8px 10px",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative"}}>
                          {g.c&&<div style={{fontSize:10,fontWeight:700,color:g.col||T.muted,fontFamily:T.mono,marginBottom:2}}>{g.c}</div>}
                          <div style={{fontSize:11,color:T.ink,lineHeight:1.4,fontWeight:500}}>{g.a}</div>
                          {g.h&&<div style={{fontSize:10,color:T.muted,marginTop:2}}>{g.h}</div>}
                          {commRef&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                            <div style={{flex:1,height:3,background:"rgba(0,0,0,.06)",borderRadius:2,overflow:"hidden"}}><div style={{width:`${commRef.avanz}%`,height:"100%",borderRadius:2,background:g.col||T.teal,opacity:.6}}/></div>
                            <span style={{fontSize:8,fontWeight:600,fontFamily:T.mono,color:T.sub}}>{commRef.avanz}%</span>
                          </div>}
                          {g.a.includes("Malattia")&&<div style={{fontSize:9,color:T.red,marginTop:2}}>Certificato ricevuto</div>}
                        </div>
                      ):(
                        <div style={{width:"100%",borderRadius:6,background:T.lineLight,opacity:.12,minHeight:48}}/>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Riga espansa sotto l'operatore */}
              {calExpanded&&calExpanded.startsWith(o.id+"-")&&(()=>{
                const gi = parseInt(calExpanded.split("-").pop());
                const ag = (o.agenda||[])[gi];
                if (!ag||!ag.a) return null;
                const commRef = ag.c ? o.commesse.find(c=>c.id.includes(ag.c.replace("COM-","COM-2024-").replace("RIL-","RIL-2024-"))) : null;
                return (
                  <div style={{gridColumn:"1/-1",background:`${ag.col||T.muted}06`,borderBottom:`1px solid ${T.line}`,padding:"14px 20px"}}>
                    <div style={{display:"flex",gap:24}}>
                      {/* Info base */}
                      <div style={{minWidth:200}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:6}}>{o.nome} · {giorni[gi]}</div>
                        <div style={{display:"flex",gap:12,marginBottom:8}}>
                          <div><div style={{fontSize:9,color:T.muted}}>Telefono</div><div style={{fontSize:11}}>{o.telefono}</div></div>
                          <div><div style={{fontSize:9,color:T.muted}}>Mezzo</div><div style={{fontSize:11}}>{o.automezzo}</div></div>
                        </div>
                        {commRef&&<>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                            <span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{commRef.id}</span>
                            <span style={{fontSize:12,fontWeight:600}}>{commRef.cliente}</span>
                            {commRef.prio==="alta"&&<span style={{fontSize:8,fontWeight:700,color:T.red,background:T.redLight,padding:"1px 5px",borderRadius:3}}>ALTA</span>}
                          </div>
                          <div style={{fontSize:11,color:T.sub}}>{commRef.tipo} · {commRef.indirizzo}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                            <div style={{flex:1,height:5,background:T.lineLight,borderRadius:3,overflow:"hidden"}}><div style={{width:`${commRef.avanz}%`,height:"100%",borderRadius:3,background:T.teal}}/></div>
                            <span style={{fontSize:12,fontWeight:700,fontFamily:T.mono}}>{commRef.avanz}%</span>
                          </div>
                        </>}
                        {/* ═══ AZIONI DIRETTE ═══ */}
                        <div style={{marginTop:10,borderTop:`1px solid ${T.lineLight}`,paddingTop:10}}>
                          <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:6}}>AZIONI RAPIDE</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            <a href={`tel:${o.telefono.replace(/\s/g,"")}`} style={{padding:"6px 14px",borderRadius:5,background:T.green,color:"#fff",fontSize:10,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                              Chiama
                            </a>
                            <a href={`https://wa.me/${o.telefono.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener" style={{padding:"6px 14px",borderRadius:5,background:"#25D366",color:"#fff",fontSize:10,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                              WhatsApp
                            </a>
                            <a href={`mailto:${o.email||""}`} style={{padding:"6px 14px",borderRadius:5,background:T.blue,color:"#fff",fontSize:10,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              Email
                            </a>
                            <div onClick={()=>alert("Chat interna con " + o.nome + " sulla commessa " + (commRef?.id||""))} style={{padding:"6px 14px",borderRadius:5,background:T.teal,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                              Chat interna
                            </div>
                            {commRef&&<div onClick={()=>{setSelOp(o.id);setSelComm(commRef.id);setTab("vani");setPage("operatori");}} style={{padding:"6px 14px",borderRadius:5,background:T.ink,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              Apri commessa
                            </div>}
                          </div>
                          {/* Messaggio rapido */}
                          <div style={{marginTop:8,display:"flex",gap:6}}>
                            <input placeholder={`Scrivi a ${o.nome.split(" ")[0]}...`} style={{flex:1,padding:"7px 12px",borderRadius:5,border:`1px solid ${T.line}`,fontSize:11,outline:"none",color:T.ink,fontFamily:T.font}}/>
                            <div onClick={()=>alert("Messaggio inviato")} style={{padding:"7px 14px",borderRadius:5,background:T.teal,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>Invia</div>
                          </div>
                          {/* Quick actions */}
                          <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>
                            {["Manda foto stato lavori","Conferma arrivo cantiere","Materiali OK?","Serve aiuto?","Domani stesso orario?"].map((q,qi)=>(
                              <div key={qi} onClick={()=>alert("Inviato: "+q)} style={{padding:"4px 10px",borderRadius:12,border:`1px solid ${T.line}`,fontSize:9,color:T.sub,cursor:"pointer",background:T.bg}}>{q}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Vani + materiali */}
                      {commRef&&<div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:16}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>VANI ({commRef.vani.length})</div>
                            {commRef.vani.map(v=>{const vc={montato:T.green,in_corso:T.amber,da_fare:T.muted}[v.stato]||T.muted;return <div key={v.id} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 0",fontSize:10}}>
                              <span style={{width:5,height:5,borderRadius:"50%",background:vc}}/><span style={{fontWeight:600,minWidth:22}}>{v.id}</span><span style={{flex:1}}>{v.nome} · {v.tipo}</span><span style={{color:T.sub}}>{v.dim}</span>
                            </div>;})}
                          </div>
                          <div style={{minWidth:160}}>
                            {commRef.materiali.length>0&&<><div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4}}>MATERIALI</div>
                            {commRef.materiali.map((m,mi)=><div key={mi} style={{display:"flex",gap:4,padding:"2px 0",fontSize:10}}><span style={{flex:1}}>{m.n}</span><span style={{fontFamily:T.mono,color:T.sub}}>{m.u}/{m.q}</span></div>)}</>}
                            {commRef.doc.length>0&&<><div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:4,marginTop:8}}>DOCUMENTI</div>
                            {commRef.doc.map((d,di)=><div key={di} style={{display:"flex",gap:4,padding:"2px 0",fontSize:10}}><span style={{width:14,height:14,borderRadius:3,background:d.t==="pdf"?T.redLight:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:6,fontWeight:800,color:d.t==="pdf"?T.red:T.blue}}>{d.t}</span></span><span style={{flex:1}}>{d.n}</span></div>)}</>}
                          </div>
                        </div>
                        {/* ═══ WORKFLOW COMPLETO — chi ha fatto cosa ═══ */}
                        <div style={{marginTop:8}}>
                          <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:6}}>WORKFLOW — chi ha fatto cosa</div>
                          <div style={{position:"relative",paddingLeft:14}}>
                            <div style={{position:"absolute",left:5,top:0,bottom:0,width:1,background:T.lineLight}}/>
                            {/* Merge timeline + chat + spese + problemi in ordine cronologico */}
                            {[
                              ...commRef.timeline.map(t=>({time:t.d,type:"milestone",text:t.e})),
                              ...commRef.chat.map(m=>({time:m.ora,type:"chat",text:m.t,da:m.da,chatTipo:m.tipo})),
                              ...(commRef.problemi||[]).map(p=>({time:p.data,type:"problema",text:p.tit,desc:p.desc,prio:p.prio,stato:p.stato})),
                              ...commRef.spese.map(s=>({time:s.d,type:"spesa",text:s.desc,imp:s.imp,ok:s.ok,cat:s.cat})),
                              ...commRef.firme.filter(f=>f.ok).map(f=>({time:f.data,type:"firma",text:f.tipo,chi:f.chi})),
                            ].sort((a,b)=>a.time>b.time?1:-1).map((ev,ei)=>{
                              const dotColor = ev.type==="problema"?T.red:ev.type==="chat"?({op:T.teal,uff:T.blue,cli:T.green,ai:T.purple}[ev.chatTipo]||T.sub):ev.type==="spesa"?T.amber:ev.type==="firma"?T.green:T.teal;
                              return (
                                <div key={ei} style={{position:"relative",paddingLeft:12,paddingBottom:6,marginBottom:2}}>
                                  <div style={{position:"absolute",left:0,top:4,width:10,height:10,borderRadius:"50%",background:dotColor,border:"2px solid #fff",zIndex:1}}/>
                                  <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                                    <span style={{fontSize:8,color:T.muted,fontFamily:T.mono,minWidth:46,marginTop:1}}>{ev.time}</span>
                                    <div style={{flex:1}}>
                                      {ev.type==="chat"&&<div style={{fontSize:10}}><span style={{fontWeight:600,color:dotColor}}>{ev.da}</span> <span style={{color:T.ink}}>{ev.text}</span></div>}
                                      {ev.type==="milestone"&&<div style={{fontSize:10,color:T.teal,fontWeight:600}}>{ev.text}</div>}
                                      {ev.type==="problema"&&<div>
                                        <div style={{fontSize:10,fontWeight:700,color:T.red}}>{ev.stato==="aperto"?"PROBLEMA":"RISOLTO"}: {ev.text}</div>
                                        <div style={{fontSize:9,color:T.sub}}>{ev.desc}</div>
                                        {ev.stato==="aperto"&&<div style={{display:"flex",gap:3,marginTop:3}}>
                                          <div onClick={(e)=>{e.stopPropagation();alert("Risolto")}} style={{padding:"3px 8px",borderRadius:3,background:T.green,color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer"}}>Segna risolto</div>
                                          <div onClick={(e)=>{e.stopPropagation();alert("Rinforzo")}} style={{padding:"3px 8px",borderRadius:3,background:T.blue,color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer"}}>Mando rinforzo</div>
                                          <div onClick={(e)=>{e.stopPropagation();alert("Rispondi")}} style={{padding:"3px 8px",borderRadius:3,background:T.amber,color:"#fff",fontSize:8,fontWeight:700,cursor:"pointer"}}>Rispondi</div>
                                        </div>}
                                      </div>}
                                      {ev.type==="spesa"&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                                        <span style={{fontSize:10}}>{ev.text} · {ev.cat}</span>
                                        <span style={{fontSize:10,fontWeight:600,fontFamily:T.mono}}>{"\u20AC"}{ev.imp.toFixed(2)}</span>
                                        {ev.ok==="no"&&<>
                                          <div onClick={(e)=>{e.stopPropagation();alert("OK")}} style={{padding:"2px 6px",borderRadius:3,background:T.green,color:"#fff",fontSize:7,fontWeight:700,cursor:"pointer"}}>OK</div>
                                          <div onClick={(e)=>{e.stopPropagation();alert("NO")}} style={{padding:"2px 6px",borderRadius:3,background:T.red,color:"#fff",fontSize:7,fontWeight:700,cursor:"pointer"}}>NO</div>
                                        </>}
                                        {ev.ok==="si"&&<span style={{fontSize:8,color:T.green}}>Approvata</span>}
                                      </div>}
                                      {ev.type==="firma"&&<div style={{fontSize:10,color:T.green}}>{ev.text} — firmato da {ev.chi}</div>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>}
                    </div>
                  </div>
                );
              })()}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );};


  /* ═══ OPERATORI LIST ═══ */
  const PageOperatori = () => {
    if (selOp && op) return <DettaglioOp/>;
    return (
    <div style={{flex:1,overflowY:"auto",padding:28}}>
      <div style={{fontSize:20,fontWeight:700,marginBottom:16}}>Operatori ({OPERATORI.length})</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {OPERATORI.map(o=>{const sc=SC(o.stato);const oggi=(o.agenda||[]).find(g=>g.g==="Mar");return(
          <div key={o.id} onClick={()=>{setSelOp(o.id);setSelComm(null);}} style={{background:T.bg,border:`1px solid ${T.line}`,borderRadius:8,padding:"14px 16px",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:7,background:o.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:800}}>{o.avatar}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{o.nome}</div><div style={{fontSize:10,color:T.sub}}>{o.ruolo} · {o.automezzo}</div></div>
              <span style={{fontSize:9,fontWeight:600,color:sc.fg,background:sc.bg,padding:"3px 7px",borderRadius:4}}>{sc.l}</span>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:6}}>
              {[{l:"Ore",v:`${o.kpi.ore}h`},{l:"Media",v:`${o.kpi.media}h/g`},{l:"Voto",v:`${o.kpi.voto}/5`,c:o.kpi.voto>=4.5?T.green:T.amber},{l:"Ritardi",v:o.kpi.ritardi,c:o.kpi.ritardi>3?T.red:T.ink}].map((k,i)=><div key={i}><div style={{fontSize:8,color:T.muted}}>{k.l}</div><div style={{fontSize:11,fontWeight:600,color:k.c||T.ink,fontFamily:T.mono}}>{k.v}</div></div>)}
            </div>
            {oggi?.a&&<div style={{fontSize:10,color:sc.fg,background:sc.bg,borderRadius:4,padding:"4px 8px",marginBottom:4}}>{oggi.a}{oggi.c&&` · ${oggi.c}`}</div>}
            <div style={{fontSize:9,color:T.muted}}>{o.posizione.indirizzo}</div>
          </div>
        );})}
      </div>
    </div>
  );};

  /* ═══ DETTAGLIO OPERATORE ═══ */
  const DettaglioOp = () => (
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:12}}>
        <div onClick={()=>{setSelOp(null);setSelComm(null);}} style={{width:30,height:30,borderRadius:6,background:T.lineLight,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg></div>
        <div style={{width:40,height:40,borderRadius:8,background:op.colore,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:15,fontWeight:800}}>{op.avatar}</div>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700}}>{op.nome}</div><div style={{fontSize:11,color:T.sub}}>{op.ruolo} · {op.telefono} · {op.automezzo}</div></div>
        <a href={`tel:${op.telefono.replace(/\s/g,"")}`} style={{padding:"6px 12px",borderRadius:5,background:T.greenLight,color:T.green,fontSize:10,fontWeight:700,textDecoration:"none",border:`1px solid ${T.green}30`}}>Chiama</a>
        <a href={`https://wa.me/${op.telefono.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener" style={{padding:"6px 12px",borderRadius:5,background:"#DCF8C6",color:"#128C7E",fontSize:10,fontWeight:700,textDecoration:"none"}}>WA</a>
        <span style={{fontSize:10,fontWeight:600,color:SC(op.stato).fg,background:SC(op.stato).bg,padding:"3px 8px",borderRadius:4}}>{SC(op.stato).l}</span>
      </div>
      <div style={{padding:28}}>
        {!selComm?(
          <>
            <div style={{display:"flex",gap:14,marginBottom:16,flexWrap:"wrap"}}>
              {[{l:"Commesse",v:op.kpi.commesse},{l:"Ore",v:`${op.kpi.ore}h`},{l:"Media",v:`${op.kpi.media}h/g`,c:T.teal},{l:"Voto",v:`${op.kpi.voto}/5`,c:op.kpi.voto>=4.5?T.green:T.amber},{l:"Ritardi",v:op.kpi.ritardi,c:op.kpi.ritardi>3?T.red:T.ink},{l:"Presenze",v:`${op.kpi.presenze}/22`}].map((k,i)=><div key={i}><div style={{fontSize:9,color:T.muted}}>{k.l}</div><div style={{fontSize:14,fontWeight:700,color:k.c||T.ink,fontFamily:T.mono}}>{k.v}</div></div>)}
            </div>
            <div style={{display:"flex",gap:4,marginBottom:16}}>
              {(op.agenda||[]).map((g,i)=><div key={i} style={{flex:1,padding:"6px 8px",borderRadius:5,background:g.col?`${g.col}12`:T.lineLight,borderLeft:g.col?`3px solid ${g.col}`:"3px solid transparent"}}><div style={{fontSize:9,fontWeight:700,color:g.col||T.muted}}>{g.g}</div>{g.a&&<div style={{fontSize:9,color:T.sub}}>{g.a}</div>}{g.c&&<div style={{fontSize:8,color:g.col,fontFamily:T.mono}}>{g.c}</div>}</div>)}
            </div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Commesse ({op.commesse.length})</div>
            {op.commesse.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuna</div>:op.commesse.map(c=>(
              <div key={c.id} onClick={()=>{setSelComm(c.id);setTab("vani");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:`1px solid ${T.line}`,borderRadius:6,marginBottom:6,cursor:"pointer"}}>
                <span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{c.id}</span>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{c.cliente} · {c.tipo}</div><div style={{fontSize:10,color:T.sub}}>{c.vani.length} vani · {c.foto.length} foto · {c.chat.length} msg</div></div>
                <div style={{width:60}}><div style={{height:3,background:T.lineLight,borderRadius:2,overflow:"hidden"}}><div style={{width:`${c.avanz}%`,height:"100%",background:T.teal,borderRadius:2}}/></div><div style={{fontSize:10,textAlign:"right",fontFamily:T.mono,marginTop:2}}>{c.avanz}%</div></div>
              </div>
            ))}
            <div style={{display:"flex",gap:16,marginTop:16}}>
              <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:6}}>CERTIFICAZIONI</div>{(op.cert||[]).map((c,i)=><div key={i} style={{display:"flex",gap:6,padding:"3px 0",fontSize:11}}><span style={{width:5,height:5,borderRadius:"50%",background:c.ok?T.green:T.amber,marginTop:4}}/><span style={{flex:1}}>{c.n}</span><span style={{color:T.sub,fontFamily:T.mono,fontSize:10}}>{c.scad}</span></div>)}</div>
              <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:6}}>DOTAZIONI</div>{(op.dotaz||[]).map((d,i)=><div key={i} style={{fontSize:11,padding:"3px 0"}}>{d.n}</div>)}</div>
              <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:6}}>STORICO</div><div style={{display:"flex",gap:6}}>{(op.storico||[]).map((s,i)=><div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:32,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:"80%",height:Math.max((s.ore/200)*28,2),borderRadius:3,background:s.v>=4.5?T.teal:s.v>=4?T.blue:T.amber,opacity:.7}}/></div><div style={{fontSize:8,color:T.muted}}>{s.m}</div><div style={{fontSize:9,fontWeight:600,fontFamily:T.mono}}>{s.ore}h</div></div>)}</div></div>
            </div>
          </>
        ):(
          /* COMMESSA DETAIL */
          <>
            <div onClick={()=>setSelComm(null)} style={{display:"inline-flex",alignItems:"center",gap:5,marginBottom:12,cursor:"pointer",color:T.sub,fontSize:11}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>Indietro</div>
            <div style={{marginBottom:10}}><span style={{fontSize:14,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{comm.id}</span> <span style={{fontSize:15,fontWeight:700}}>{comm.cliente}</span> <span style={{fontSize:11,color:T.sub}}>· {comm.tipo} · {comm.indirizzo}</span></div>
            <div style={{display:"flex",gap:2,marginBottom:14,flexWrap:"wrap"}}>
              {["vani","foto","documenti","chat","timeline","materiali","firme","spese","ore","problemi"].map(t=>{
                const al=t==="problemi"&&(comm.problemi||[]).filter(p=>p.stato==="aperto").length>0;
                return <div key={t} onClick={()=>setTab(t)} style={{padding:"6px 12px",borderRadius:5,fontSize:11,fontWeight:tab===t?700:500,color:tab===t?"#fff":T.sub,background:tab===t?T.teal:"transparent",cursor:"pointer",textTransform:"capitalize",position:"relative"}}>{t}{al&&<span style={{position:"absolute",top:2,right:2,width:4,height:4,borderRadius:"50%",background:T.red}}/>}</div>;
              })}
            </div>
            {tab==="vani"&&comm.vani.map((v,i)=>{const vc={montato:{c:T.green,l:"OK"},in_corso:{c:T.amber,l:"In corso"},da_fare:{c:T.muted,l:"Da fare"}}[v.stato]||{c:T.muted,l:v.stato};return <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<comm.vani.length-1?`1px solid ${T.lineLight}`:"none"}}><span style={{width:6,height:6,borderRadius:"50%",background:vc.c}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{v.id} · {v.nome} <span style={{fontWeight:400,color:T.sub}}>{v.tipo}</span></div><div style={{fontSize:10,color:T.sub}}>{v.dim} · {v.mat}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:vc.c,fontWeight:600}}>{vc.l}</div><div style={{fontSize:10,fontFamily:T.mono}}>{fh(v.oreR)}/{fh(v.oreP)}</div></div></div>;})}
            {tab==="foto"&&(comm.foto.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuna foto</div>:comm.foto.map((f,i)=>{const fc={PRIMA:T.blue,DEMOLIZIONE:T.red,MONTAGGIO:T.amber,DOPO:T.green,RILIEVO:T.purple}[f.fase]||T.sub;return <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<comm.foto.length-1?`1px solid ${T.lineLight}`:"none"}}><div style={{width:44,height:44,borderRadius:5,background:T.lineLight,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div><div style={{flex:1}}><div style={{display:"flex",gap:5}}><span style={{fontSize:9,fontWeight:700,color:fc,background:`${fc}15`,padding:"1px 5px",borderRadius:3}}>{f.fase}</span><span style={{fontSize:9,color:T.sub}}>V{f.vano}</span><span style={{fontSize:9,color:T.muted,marginLeft:"auto"}}>{f.data}</span></div><div style={{fontSize:11,color:T.ink,marginTop:2}}>{f.nota}</div></div></div>;}))}
            {tab==="documenti"&&(comm.doc.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuno</div>:comm.doc.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<comm.doc.length-1?`1px solid ${T.lineLight}`:"none"}}><div style={{width:28,height:28,borderRadius:5,background:d.t==="pdf"?T.redLight:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,fontWeight:800,color:d.t==="pdf"?T.red:T.blue}}>{d.t.toUpperCase()}</span></div><span style={{fontSize:11,flex:1}}>{d.n}</span><span style={{fontSize:9,color:T.muted}}>{d.d}</span></div>))}
            {tab==="chat"&&(comm.chat.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuno</div>:comm.chat.map((m,i)=><div key={i} style={{display:"flex",gap:6,padding:"6px 0",borderBottom:i<comm.chat.length-1?`1px solid ${T.lineLight}`:"none"}}><span style={{width:5,height:5,borderRadius:"50%",background:chatC(m.tipo),marginTop:5,flexShrink:0}}/><div><div style={{display:"flex",gap:5}}><span style={{fontSize:10,fontWeight:600,color:chatC(m.tipo)}}>{m.da}</span><span style={{fontSize:9,color:T.muted}}>{m.ora}</span></div><div style={{fontSize:11}}>{m.t}</div></div></div>))}
            {tab==="timeline"&&comm.timeline.map((t,i)=><div key={i} style={{display:"flex",gap:10,padding:"6px 0"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",width:12}}><span style={{width:6,height:6,borderRadius:"50%",background:t.e.includes("OGGI")?T.teal:T.line}}/>{i<comm.timeline.length-1&&<div style={{width:1,flex:1,background:T.lineLight,marginTop:3}}/>}</div><span style={{fontSize:11,color:t.e.includes("OGGI")?T.teal:T.ink,fontWeight:t.e.includes("OGGI")?700:400,flex:1}}>{t.e}</span><span style={{fontSize:9,color:T.muted,fontFamily:T.mono}}>{t.d}</span></div>)}
            {tab==="materiali"&&(comm.materiali.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuno</div>:comm.materiali.map((m,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<comm.materiali.length-1?`1px solid ${T.lineLight}`:"none"}}><div style={{fontSize:11}}>{m.n}</div><div style={{display:"flex",gap:6,marginTop:3,alignItems:"center"}}><div style={{flex:1,height:3,background:T.lineLight,borderRadius:2,overflow:"hidden"}}><div style={{width:`${m.q>0?(m.u/m.q)*100:0}%`,height:"100%",borderRadius:2,background:T.teal}}/></div><span style={{fontSize:9,fontFamily:T.mono,color:T.sub}}>{m.u}/{m.q} {m.um}</span></div></div>))}
            {tab==="firme"&&(comm.firme.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuna</div>:comm.firme.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<comm.firme.length-1?`1px solid ${T.lineLight}`:"none"}}><span style={{width:6,height:6,borderRadius:"50%",background:f.ok?T.green:T.muted}}/><div style={{flex:1}}><div style={{fontSize:11}}>{f.tipo}</div>{f.ok&&<div style={{fontSize:9,color:T.sub}}>{f.chi} · {f.data}</div>}</div><span style={{fontSize:9,fontWeight:600,color:f.ok?T.green:T.muted}}>{f.ok?"Firmato":"Attesa"}</span></div>))}
            {tab==="spese"&&(comm.spese.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuna</div>:comm.spese.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<comm.spese.length-1?`1px solid ${T.lineLight}`:"none"}}><div style={{flex:1}}><div style={{fontSize:11}}>{s.desc}</div><div style={{fontSize:9,color:T.sub}}>{s.cat} · {s.d}</div></div><span style={{fontSize:12,fontWeight:600,fontFamily:T.mono}}>{"\u20AC"}{s.imp.toFixed(2)}</span>{s.ok==="no"?<div style={{display:"flex",gap:3}}><div onClick={()=>alert("OK")} style={{padding:"3px 8px",borderRadius:3,background:T.greenLight,color:T.green,fontSize:9,fontWeight:700,cursor:"pointer"}}>OK</div><div onClick={()=>alert("NO")} style={{padding:"3px 8px",borderRadius:3,background:T.redLight,color:T.red,fontSize:9,fontWeight:700,cursor:"pointer"}}>NO</div></div>:<span style={{fontSize:9,color:T.green}}>OK</span>}</div>))}
            {tab==="ore"&&(comm.ore.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuna</div>:comm.ore.map((o,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<comm.ore.length-1?`1px solid ${T.lineLight}`:"none"}}><span style={{fontSize:11,fontFamily:T.mono,minWidth:36}}>{o.d}</span><span style={{fontSize:11}}>{o.in} {"\u2192"} {o.out||"..."}</span>{o.pausa>0&&<span style={{fontSize:9,color:T.sub}}>({o.pausa}m)</span>}<span style={{fontSize:12,fontWeight:600,color:T.teal,fontFamily:T.mono,marginLeft:"auto"}}>{o.nette>0?fh(o.nette):"..."}</span></div>))}
            {tab==="problemi"&&(()=>{const pp=comm.problemi||[];return pp.length===0?<div style={{color:T.muted,fontSize:11}}>Nessuno</div>:pp.map((p,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<pp.length-1?`1px solid ${T.lineLight}`:"none"}}><div style={{display:"flex",gap:6,marginBottom:2}}><span style={{width:6,height:6,borderRadius:"50%",background:p.stato==="aperto"?T.red:T.green,marginTop:4}}/><span style={{fontSize:10,fontWeight:700,color:p.stato==="aperto"?T.red:T.green}}>{p.stato.toUpperCase()}</span><span style={{fontSize:9,color:T.muted,marginLeft:"auto"}}>{p.data}</span></div><div style={{fontSize:12,fontWeight:600}}>{p.tit}</div><div style={{fontSize:11,color:T.sub}}>{p.desc}</div></div>);})()}
          </>
        )}
      </div>
    </div>
  );

  /* ═══ COMMESSE GLOBALI ═══ */
  const PageCommesse = () => (
    <div style={{flex:1,overflowY:"auto",padding:28}}>
      <div style={{fontSize:20,fontWeight:700,marginBottom:16}}>Tutte le commesse ({tutteComm.length})</div>
      <div style={{background:T.bg,borderRadius:8,border:`1px solid ${T.line}`,overflow:"hidden"}}>
        {tutteComm.map((c,i)=>(
          <div key={c.id+c.opNome} onClick={()=>{setSelOp(c.opId);setSelComm(c.id);setTab("vani");setPage("operatori");}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:i<tutteComm.length-1?`1px solid ${T.lineLight}`:"none",cursor:"pointer"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:CC(c.stato),flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono,minWidth:90}}>{c.id}</span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{c.cliente}</div><div style={{fontSize:10,color:T.sub}}>{c.tipo} · {c.indirizzo}</div></div>
            <div style={{width:80}}><div style={{height:3,background:T.lineLight,borderRadius:2,overflow:"hidden"}}><div style={{width:`${c.avanz}%`,height:"100%",borderRadius:2,background:CC(c.stato)}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:2}}><span style={{fontSize:9,color:T.sub}}>{c.opNome}</span><span style={{fontSize:9,fontFamily:T.mono,fontWeight:600}}>{c.avanz}%</span></div></div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══ MARKETPLACE ═══ */
  const PageMarketplace = () => {
    const miei = MARKETPLACE.filter(m=>m.dir==="out");
    const disp = MARKETPLACE.filter(m=>m.dir==="in");
    const presi = MARKETPLACE.filter(m=>m.dir==="done");
    const totOfferte = miei.reduce((s,m)=>s+m.offerte.length,0);
    const totGuadagnato = presi.reduce((s,m)=>s+(m.prezzo||0),0);
    return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header ricco */}
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.line}`,background:T.bg}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
          <div style={{fontSize:18,fontWeight:700}}>Marketplace</div>
          <div style={{fontSize:12,color:T.sub}}>Borsa lavori tra serramentisti della rete fliwoX</div>
          <div onClick={()=>alert("Pubblica")} style={{marginLeft:"auto",padding:"8px 20px",borderRadius:6,background:T.amber,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Pubblica lavoro</div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {[{l:"Pubblicati",v:miei.length,c:T.amber},{l:"Offerte ricevute",v:totOfferte,c:T.green},{l:"Disponibili zona",v:disp.length,c:T.blue},{l:"Urgenti",v:disp.filter(m=>m.urgente).length,c:T.red},{l:"In corso",v:presi.filter(m=>m.stato==="in_corso").length,c:T.teal},{l:"Completati",v:presi.filter(m=>m.stato==="completato").length,c:T.green},{l:"Guadagnato MKT",v:`\u20AC${totGuadagnato}`,c:T.teal}].map((k,i)=>(
            <div key={i} style={{flex:1,background:T.bgAlt,borderRadius:6,padding:"8px 12px",border:`1px solid ${T.lineLight}`}}>
              <div style={{fontSize:8,color:T.muted,textTransform:"uppercase",letterSpacing:".04em"}}>{k.l}</div>
              <div style={{fontSize:18,fontWeight:700,color:k.c,fontFamily:T.mono}}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body 3 colonne che riempiono tutto */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* COL 1: Miei pubblicati */}
        <div style={{flex:1,borderRight:`1px solid ${T.line}`,overflowY:"auto",padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
            Miei pubblicati ({miei.length})
          </div>
          {miei.map(m=>(
            <div key={m.id} style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"12px 14px",marginBottom:10,background:T.bg}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:10,fontWeight:700,color:T.amber,fontFamily:T.mono}}>{m.id}</span>
                <span style={{fontSize:9,fontWeight:600,color:m.offerte.length>0?T.green:T.muted,background:m.offerte.length>0?T.greenLight:T.lineLight,padding:"1px 6px",borderRadius:3}}>{m.offerte.length>0?`${m.offerte.length} offerte`:"In attesa"}</span>
                <span style={{fontSize:9,color:T.muted,marginLeft:"auto"}}>entro {m.scad}</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{m.titolo}</div>
              <div style={{fontSize:10,color:T.sub}}>{m.zona} · Budget {m.budget}</div>
              <div style={{fontSize:10,color:T.sub,lineHeight:1.4,marginTop:4}}>{m.desc}</div>
              {m.offerte.length>0&&<div style={{borderTop:`1px solid ${T.lineLight}`,marginTop:8,paddingTop:6}}>
                {m.offerte.map((o,oi)=>(
                  <div key={oi} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:5,marginBottom:3,background:oi===0?T.tealLight:"transparent",border:oi===0?`1px solid ${T.tealBorder}`:"1px solid transparent"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{o.da}</div>
                      <div style={{fontSize:9,color:T.sub}}>{o.nota}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{"\u20AC"}{o.pr}</div>
                      <div style={{fontSize:8,color:T.sub}}>{o.v}/5 · {o.gg}</div>
                    </div>
                    <div onClick={()=>alert("Accetti "+o.da+"?")} style={{padding:"4px 10px",borderRadius:4,background:T.teal,color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",flexShrink:0}}>Accetta</div>
                  </div>
                ))}
              </div>}
            </div>
          ))}
        </div>

        {/* COL 2: Disponibili */}
        <div style={{flex:1,borderRight:`1px solid ${T.line}`,overflowY:"auto",padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Disponibili nella zona ({disp.length})
          </div>
          {disp.map(m=>(
            <div key={m.id} style={{border:`1px solid ${m.urgente?T.red:T.line}`,borderRadius:8,padding:"12px 14px",marginBottom:10,background:T.bg,position:"relative"}}>
              {m.urgente&&<div style={{position:"absolute",top:-1,right:10,background:T.red,color:"#fff",fontSize:8,fontWeight:800,padding:"2px 8px",borderRadius:"0 0 5px 5px"}}>URGENTE</div>}
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:10,fontWeight:700,color:T.blue,fontFamily:T.mono}}>{m.id}</span>
                <span style={{fontSize:9,color:T.muted}}>{m.km}</span>
                <span style={{fontSize:9,color:T.muted,marginLeft:"auto"}}>{m.scad}</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{m.titolo}</div>
              <div style={{fontSize:10,color:T.sub}}>{m.zona} · <span style={{fontWeight:600,color:T.ink}}>{m.azienda}</span></div>
              <div style={{fontSize:15,fontWeight:700,color:T.green,fontFamily:T.mono,margin:"4px 0"}}>{"\u20AC"}{m.budget}</div>
              <div style={{fontSize:10,color:T.sub,lineHeight:1.4,marginBottom:8}}>{m.desc}</div>
              <div style={{display:"flex",gap:6}}>
                <div onClick={()=>alert("Offerta")} style={{padding:"6px 14px",borderRadius:5,background:T.teal,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>Fai offerta</div>
                <div style={{padding:"6px 14px",borderRadius:5,background:T.lineLight,color:T.sub,fontSize:10,cursor:"pointer"}}>Dettagli</div>
              </div>
            </div>
          ))}
        </div>

        {/* COL 3: Presi + Statistiche */}
        <div style={{width:280,overflowY:"auto",padding:16,flexShrink:0}}>
          <div style={{fontSize:12,fontWeight:700,color:T.teal,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.teal} strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Lavori presi ({presi.length})
          </div>
          {presi.map(m=>(
            <div key={m.id} style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"10px 12px",marginBottom:8,background:T.bg}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:9,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{m.id}</span>
                <span style={{fontSize:8,fontWeight:600,color:m.stato==="completato"?T.green:T.amber,background:m.stato==="completato"?T.greenLight:T.amberLight,padding:"1px 5px",borderRadius:3}}>{m.stato}</span>
              </div>
              <div style={{fontSize:12,fontWeight:600}}>{m.titolo}</div>
              <div style={{fontSize:10,color:T.sub}}>{m.zona} · {m.assegnato}</div>
              <div style={{fontSize:14,fontWeight:700,color:T.teal,fontFamily:T.mono,marginTop:4}}>{"\u20AC"}{m.prezzo}</div>
            </div>
          ))}

          {/* Come funziona */}
          <div style={{marginTop:16,padding:"14px 12px",background:"rgba(26,158,143,0.04)",borderRadius:8,border:`1px solid ${T.tealBorder}`}}>
            <div style={{fontSize:11,fontWeight:700,color:T.teal,marginBottom:8}}>Come funziona</div>
            {[{n:"1",t:"Pubblica un lavoro che non riesci a fare"},{n:"2",t:"Ricevi offerte da altri serramentisti fliwoX"},{n:"3",t:"Accetti l'offerta migliore"},{n:"4",t:"Il lavoro esce dal marketplace e diventa commessa"}].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:T.teal,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.n}</div>
                <div style={{fontSize:10,color:T.sub,lineHeight:1.4}}>{s.t}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{marginTop:12,padding:"12px 12px",border:`1px solid ${T.line}`,borderRadius:8}}>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8}}>Riepilogo</div>
            {[{l:"Lavori pubblicati totali",v:"12"},{l:"Completati con successo",v:"8"},{l:"Totale guadagnato",v:`\u20AC${totGuadagnato}`},{l:"Valutazione media ricevuta",v:"4.7/5"},{l:"Tempo medio assegnazione",v:"2.3 giorni"}].map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<4?`1px solid ${T.lineLight}`:"none"}}>
                <span style={{fontSize:10,color:T.sub}}>{s.l}</span>
                <span style={{fontSize:10,fontWeight:600,color:T.ink,fontFamily:T.mono}}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );};

    /* ═══ PROBLEMI GLOBALI ═══ */
  const PageProblemi = () => {
    const all = OPERATORI.flatMap(o=>o.commesse.flatMap(c=>(c.problemi||[]).map(p=>({...p,opNome:o.nome,commId:c.id,cliente:c.cliente,opId:o.id}))));
    return (
    <div style={{flex:1,overflowY:"auto",padding:28}}>
      <div style={{fontSize:20,fontWeight:700,marginBottom:16}}>Problemi ({all.length})</div>
      {all.length===0?<div style={{color:T.green,fontSize:13,fontWeight:600}}>Nessun problema</div>:
      <div style={{background:T.bg,borderRadius:8,border:`1px solid ${T.line}`}}>
        {all.map((p,i)=>(
          <div key={i} onClick={()=>{setSelOp(p.opId);setSelComm(p.commId);setTab("problemi");setPage("operatori");}} style={{padding:"12px 16px",borderBottom:i<all.length-1?`1px solid ${T.lineLight}`:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:p.stato==="aperto"?T.red:T.green}}/>
              <span style={{fontSize:11,fontWeight:700,color:p.stato==="aperto"?T.red:T.green}}>{p.stato.toUpperCase()}</span>
              <span style={{fontSize:10,fontWeight:600,color:p.prio==="alta"?T.red:T.amber,background:p.prio==="alta"?T.redLight:T.amberLight,padding:"1px 6px",borderRadius:3}}>{p.prio}</span>
              <span style={{fontSize:10,color:T.teal,fontFamily:T.mono}}>{p.commId}</span>
              <span style={{fontSize:10,color:T.sub,marginLeft:"auto"}}>{p.opNome} · {p.data}</span>
            </div>
            <div style={{fontSize:13,fontWeight:600}}>{p.tit}</div>
            <div style={{fontSize:11,color:T.sub}}>{p.desc}</div>
          </div>
        ))}
      </div>}
    </div>
  );};

  /* ═══ SPESE GLOBALI ═══ */
  const PageSpese = () => (
    <div style={{flex:1,overflowY:"auto",padding:28}}>
      <div style={{fontSize:20,fontWeight:700,marginBottom:16}}>Spese ({tutteSpese.length}) · Totale: {"\u20AC"}{tutteSpese.reduce((s,sp)=>s+sp.imp,0).toFixed(2)}</div>
      <div style={{background:T.bg,borderRadius:8,border:`1px solid ${T.line}`}}>
        {tutteSpese.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:i<tutteSpese.length-1?`1px solid ${T.lineLight}`:"none"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:s.ok==="si"?T.green:T.amber}}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{s.desc}</div><div style={{fontSize:10,color:T.sub}}>{s.cat} · {s.d} · {s.opNome} · {s.commId}</div></div>
            <span style={{fontSize:13,fontWeight:600,fontFamily:T.mono}}>{"\u20AC"}{s.imp.toFixed(2)}</span>
            {s.ok==="no"?<div style={{display:"flex",gap:3}}><div onClick={()=>alert("OK")} style={{padding:"4px 10px",borderRadius:4,background:T.greenLight,color:T.green,fontSize:10,fontWeight:700,cursor:"pointer"}}>Approva</div><div onClick={()=>alert("NO")} style={{padding:"4px 10px",borderRadius:4,background:T.redLight,color:T.red,fontSize:10,fontWeight:700,cursor:"pointer"}}>Rifiuta</div></div>:<span style={{fontSize:10,color:T.green,fontWeight:600}}>Approvata</span>}
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══ DOCUMENTI GLOBALI ═══ */
  const PageDocumenti = () => (
    <div style={{flex:1,overflowY:"auto",padding:28}}>
      <div style={{fontSize:20,fontWeight:700,marginBottom:16}}>Documenti ({tuttiDoc.length})</div>
      <div style={{background:T.bg,borderRadius:8,border:`1px solid ${T.line}`}}>
        {tuttiDoc.map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:i<tuttiDoc.length-1?`1px solid ${T.lineLight}`:"none"}}>
            <div style={{width:30,height:30,borderRadius:5,background:d.t==="pdf"?T.redLight:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:800,color:d.t==="pdf"?T.red:T.blue}}>{d.t.toUpperCase()}</span></div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{d.n}</div><div style={{fontSize:10,color:T.sub}}>{d.commId} · {d.cliente} · {d.opNome}</div></div>
            <span style={{fontSize:10,color:T.muted}}>{d.d}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const getPage = () => {
    if (page==="dashboard") return <PageDashboard/>;
    if (page==="calendario") return <PageCalendario/>;
    if (page==="operatori") return <PageOperatori/>;
    if (page==="commesse") return <PageCommesse/>;
    if (page==="marketplace") return <PageMarketplace/>;
    if (page==="problemi") return <PageProblemi/>;
    if (page==="spese") return <PageSpese/>;
    if (page==="documenti") return <PageDocumenti/>;
    return <PageDashboard/>;
  };

  return (
    <div style={{display:"flex",fontFamily:T.font,color:T.ink,height:"100vh",overflow:"hidden",background:T.bgAlt}}>
      <Sidebar/>
      {getPage()}
    </div>
  );
}
