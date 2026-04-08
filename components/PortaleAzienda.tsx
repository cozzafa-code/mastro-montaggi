// @ts-nocheck
"use client";
// PORTALE AZIENDA fliwoX v9 COMPLETO — mappa GPS, alert, approvazione spese,
// confronto prestazioni, agenda settimana, chiama/whatsapp, export PDF, problemi
import React, { useState, useMemo } from "react";

/* ═══════════════════════════════════════════
   DESIGN TOKENS — Apple iWork light
═══════════════════════════════════════════ */
const T = {
  bg: "#FFFFFF", bgAlt: "#FAFAFA", bgHover: "#F5F7F7",
  ink: "#1A1A1A", sub: "#6B7280", muted: "#9CA3AF",
  line: "#E5E7EB", lineLight: "#F0F0F0",
  teal: "#1A9E8F", tealLight: "rgba(26,158,143,0.08)", tealBorder: "rgba(26,158,143,0.2)",
  green: "#2D8A4E", greenLight: "rgba(45,138,78,0.08)",
  amber: "#C47D0A", amberLight: "rgba(196,125,10,0.08)",
  red: "#DC4444", redLight: "rgba(220,68,68,0.08)",
  blue: "#3B7FE0", blueLight: "rgba(59,127,224,0.08)",
  purple: "#7C3AED", purpleLight: "rgba(124,58,237,0.08)",
  radius: 8,
  mono: "'JetBrains Mono',monospace",
  font: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
};

/* ═══════════════════════════════════════════
   DATI DEMO COMPLETI
═══════════════════════════════════════════ */
const ALERT_DEMO = [
  { id: "a1", op: "Marco Ferretti", opId: "op1", testo: "Scorrevole pesante — serve rinforzo per telaio", tipo: "richiesta", ora: "08:32", commessa: "COM-2024-089", letto: false },
  { id: "a2", op: "Luca Mancini", opId: "op2", testo: "Materiali vetrina non ancora arrivati — consegna prevista 10/04", tipo: "blocco", ora: "07:58", commessa: "COM-2024-091", letto: false },
  { id: "a3", op: "Andrea Russo", opId: "op3", testo: "Rilievo Sig.ra Greco completato — 5 vani rilevati, preventivo pronto", tipo: "completato", ora: "10:15", commessa: "RIL-2024-155", letto: true },
  { id: "a4", op: "Marco Ferretti", opId: "op1", testo: "Certificazione Sicurezza cantiere scade il 06/2026 — rinnovare", tipo: "scadenza", ora: "auto", commessa: null, letto: true },
  { id: "a5", op: "Roberto Mazza", opId: "op8", testo: "Muro cavo alla Conad — servono tasselli chimici Fischer FIS V urgenti", tipo: "richiesta", ora: "07:12", commessa: "COM-2024-088", letto: false },
  { id: "a6", op: "Nicola Greco", opId: "op9", testo: "Assenza per malattia — certificato ricevuto, rientro previsto Gio 10/04", tipo: "blocco", ora: "auto", commessa: null, letto: false },
  { id: "a7", op: "Francesco Pellegrino", opId: "op6", testo: "Sicurezza cantiere scade 04/2026 — URGENTE rinnovare", tipo: "scadenza", ora: "auto", commessa: null, letto: false },
  { id: "a8", op: "Giuseppe Catanzaro", opId: "op4", testo: "Piano 1 Palazzo Ferrovia completato — 4 persiane su 12 montate", tipo: "completato", ora: "16:05", commessa: "COM-2024-095", letto: true },
  { id: "a9", op: "Domenico Bianchi", opId: "op10", testo: "Vetri Vetro Sud per COM-091 in arrivo domani 10/04 ore 10", tipo: "completato", ora: "15:30", commessa: "COM-2024-091", letto: true },
];

const PROBLEMI_DEMO = [
  { id: "p1", op: "Marco Ferretti", opId: "op1", commessa: "COM-2024-089", vano: "V2", data: "07/04 08:40", titolo: "Scorrevole ENERGETO 8000 troppo pesante per 1 persona", desc: "Il telaio della portafinestra scorrevole pesa circa 85kg. Impossibile posizionarlo da solo. Serve almeno 1 persona in piu per il sollevamento.", priorita: "alta", stato: "aperto", foto: "problema_scorrevole.jpg" },
  { id: "p2", op: "Marco Ferretti", opId: "op1", commessa: "COM-2024-089", vano: "V1", data: "05/04 10:15", titolo: "Fuori squadro muro 5mm lato sinistro", desc: "Il muro ha un fuori squadro di 5mm sul lato sinistro. Compensato con spessori e schiuma. Nessun impatto sulla tenuta.", priorita: "bassa", stato: "risolto", foto: "fuorisquadro_v1.jpg" },
  { id: "p3", op: "Luca Mancini", opId: "op2", commessa: "COM-2024-091", vano: "V1", data: "03/04 14:20", titolo: "Vetro stratificato non ancora consegnato", desc: "Il vetro 6+6 ordinato a Vetro Sud non e ancora arrivato. Consegna prevista 10/04 ma nessuna conferma tracking.", priorita: "alta", stato: "aperto", foto: null },
  { id: "p4", op: "Roberto Mazza", opId: "op8", commessa: "COM-2024-088", vano: "V1", data: "07/04 07:15", titolo: "Muro cavo — tasselli normali non reggono", desc: "Il muro laterale della serranda e cavo, i tasselli meccanici non tengono. Servono chimici Fischer FIS V. Salvatore porta i chimici entro le 9.", priorita: "alta", stato: "risolto", foto: "muro_cavo_conad.jpg" },
  { id: "p5", op: "Salvatore Morelli", opId: "op5", commessa: "COM-2024-096", vano: "V2", data: "08/04 09:40", titolo: "Cassonetto cucina troppo piccolo per motore", desc: "Il cassonetto esistente della cucina ha solo 14cm di spazio, il motore Somfy iO richiede minimo 16cm. Serve adattatore o riduzione cassonetto.", priorita: "alta", stato: "aperto", foto: "cassonetto_cucina.jpg" },
];

const MARKETPLACE_DEMO = [
  // I MIEI LAVORI PUBBLICATI
  { id: "MKT-001", tipo: "pubblicato", titolo: "Sostituzione 8 finestre PVC piano terra", zona: "Rende (CS)", cliente: "Cond. Via Marconi", budget: "da 2.800", scadenza: "15/04/2026", dettagli: "8 finestre 1 anta + ribalta, PVC bianco, misure standard. Materiali inclusi. Accesso facile piano terra.", offerte: [
    { da: "Infissi Calabria SRL", prezzo: 3200, valutazione: 4.6, tempoConsegna: "5 giorni", nota: "Disponibili dal 16/04" },
    { da: "Montatori Cosenza", prezzo: 2900, valutazione: 4.2, tempoConsegna: "3 giorni", nota: "Possiamo iniziare subito" },
    { da: "F.lli Ferraro", prezzo: 3400, valutazione: 4.8, tempoConsegna: "7 giorni", nota: "Inclusa garanzia 5 anni posa" },
  ], stato: "offerte_ricevute" },
  { id: "MKT-002", tipo: "pubblicato", titolo: "Montaggio persiane alluminio x6 secondo piano", zona: "Cosenza centro", cliente: "Palazzo Corso Mazzini", budget: "da 1.500", scadenza: "20/04/2026", dettagli: "6 persiane 2 ante alluminio CX55 gia in magazzino. Serve solo manodopera + ponteggio. Secondo piano, altezza 6mt.", offerte: [], stato: "aperto" },
  { id: "MKT-003", tipo: "pubblicato", titolo: "Installazione porta blindata + 2 porte interne", zona: "Castrolibero (CS)", cliente: "Sig. Ferraro", budget: "da 800", scadenza: "25/04/2026", dettagli: "Porta blindata Dierre classe 3 + 2 porte interne laminato. Materiali gia consegnati al cliente.", offerte: [
    { da: "Sicurezza Casa SAS", prezzo: 950, valutazione: 4.4, tempoConsegna: "2 giorni", nota: "Specializzati porte blindate" },
  ], stato: "offerte_ricevute" },

  // LAVORI DISPONIBILI CHE POSSO PRENDERE
  { id: "MKT-101", tipo: "disponibile", titolo: "Sostituzione 12 finestre alluminio taglio termico", zona: "Montalto Uffugo (CS)", azienda: "Serramenti Ferraro SRL", budget: "4.500 - 5.500", scadenza: "18/04/2026", dettagli: "12 finestre alluminio TT serie 65, demolizione vecchi infissi inclusa. Appartamento 3o piano con ascensore. Materiali forniti dal committente.", distanza: "12 km", stato: "aperto" },
  { id: "MKT-102", tipo: "disponibile", titolo: "Montaggio 4 vetrate scorrevoli villa", zona: "Cetraro (CS)", azienda: "Vetro Design di Russo", budget: "2.200 - 2.800", scadenza: "22/04/2026", dettagli: "4 vetrate scorrevoli alzanti Schuco ASS 70 HI, dimensioni max 3000x2400. Villa fronte mare, accesso carrabile. Serve esperienza con alzanti.", distanza: "65 km", stato: "aperto" },
  { id: "MKT-103", tipo: "disponibile", titolo: "Posa 20 zanzariere a rullo", zona: "Cosenza (CS)", azienda: "Casa Clima Calabria", budget: "1.000 - 1.400", scadenza: "30/04/2026", dettagli: "20 zanzariere a rullo laterale, misure gia rilevate. Condominio 4 piani con ascensore. Lavoro da completare in 2-3 giorni.", distanza: "3 km", stato: "aperto" },
  { id: "MKT-104", tipo: "disponibile", titolo: "Riparazione serranda commerciale urgente", zona: "Rende (CS)", azienda: "Ferramenta Mancuso", budget: "300 - 500", scadenza: "09/04/2026", dettagli: "Serranda avvolgibile bloccata, motore da verificare. Negozio chiuso, urgente. Serve entro domani.", distanza: "5 km", stato: "urgente" },

  // ASSEGNATI / COMPLETATI
  { id: "MKT-201", tipo: "preso", titolo: "Sostituzione 5 tapparelle motorizzate", zona: "Rende (CS)", azienda: "Edilcomfort SRL", prezzoAccettato: 1800, dataAssegnazione: "02/04/2026", stato: "in_corso", operatoreAssegnato: "Salvatore Morelli" },
  { id: "MKT-202", tipo: "preso", titolo: "Montaggio inferriata di sicurezza x3", zona: "Cosenza (CS)", azienda: "Sicurezza Totale", prezzoAccettato: 650, dataAssegnazione: "25/03/2026", stato: "completato", operatoreAssegnato: "Roberto Mazza" },
];


const OPERATORI = [
  {
    id: "op1", nome: "Marco Ferretti", ruolo: "montatore", stato: "in_cantiere",
    telefono: "+39 345 678 9012", email: "marco.f@waltercozza.it",
    pin: "1234", assunto: "2019-03-15", contratto: "indeterminato",
    patente: "B", automezzo: "Fiat Ducato AB 123 CD",
    avatar: "MF", colore: "#1A9E8F",
    posizione: { lat: 39.3076, lng: 16.2501, aggiornamento: "08/04 08:42", indirizzo: "Via Roma 45, Cosenza" },
    kpi: { commesseAnno: 47, oreAnno: 1840, mediaGiorno: 8.2, ritardi: 2, valutazioneMedia: 4.7, reclami: 1, presenzeMese: 21, assenzeAnno: 4 },
    agenda: [
      { giorno: "Lun 07", commessa: "COM-2024-089", attivita: "Camera matrimoniale — scorrevole", ore: "08:00-16:30", colore: T["teal"] },
      { giorno: "Mar 08", commessa: "COM-2024-089", attivita: "Completare V2 + inizio V3 Cucina", ore: "08:00-17:00", colore: T["teal"] },
      { giorno: "Mer 09", commessa: "COM-2024-089", attivita: "V3 Cucina + V4 Bagno", ore: "08:00-16:00", colore: T["teal"] },
      { giorno: "Gio 10", commessa: "COM-2024-089", attivita: "Finiture + silicone + collaudo", ore: "08:00-14:00", colore: T["green"] },
      { giorno: "Ven 11", commessa: null, attivita: null, ore: null, colore: null },
    ],
    commesse: [
      {
        "id": "COM-2024-089", "cliente": "Fam. Bianchi", "indirizzo": "Via Garibaldi 12, Cosenza",
        "tipo": "Sostituzione infissi", "stato": "in_corso", "priorita": "alta",
        "dataInizio": "05/04/2026", "dataFine": "10/04/2026", "avanzamento": 65,
        "vani": [
          { "id": "V1", "nome": "Soggiorno", "tipo": "Finestra 2 ante", "dim": "1400x1600", "materiale": "PVC Aluplast IDEAL 7000", "stato": "montato", "oreReali": 3.5, "orePreviste": 3 },
          { "id": "V2", "nome": "Camera matrimoniale", "tipo": "Portafinestra scorrevole", "dim": "2200x2200", "materiale": "PVC Aluplast ENERGETO 8000", "stato": "in_corso", "oreReali": 2.0, "orePreviste": 4 },
          { "id": "V3", "nome": "Cucina", "tipo": "Finestra 1 anta + ribalta", "dim": "900x1200", "materiale": "PVC Aluplast IDEAL 7000", "stato": "da_fare", "oreReali": 0, "orePreviste": 2 },
          { "id": "V4", "nome": "Bagno", "tipo": "Vasistas", "dim": "600x800", "materiale": "PVC Aluplast IDEAL 7000", "stato": "da_fare", "oreReali": 0, "orePreviste": 1.5 },
        ],
        "documenti": [
          { "nome": "Ordine fornitore Aluplast", "tipo": "pdf", "data": "28/03", "peso": "245 KB" },
          { "nome": "Scheda tecnica IDEAL 7000", "tipo": "pdf", "data": "28/03", "peso": "1.2 MB" },
          { "nome": "Foto sopralluogo", "tipo": "zip", "data": "25/03", "peso": "8.4 MB" },
          { "nome": "Preventivo approvato", "tipo": "pdf", "data": "20/03", "peso": "180 KB" },
          { "nome": "DDT consegna materiali", "tipo": "pdf", "data": "04/04", "peso": "95 KB" },
        ],
        "foto": [
          { "src": "prima_soggiorno.jpg", "fase": "PRIMA", "vano": "V1", "data": "05/04 09:15", "nota": "Infisso esistente in legno, guarnizioni consumate" },
          { "src": "demolizione_soggiorno.jpg", "fase": "DEMOLIZIONE", "vano": "V1", "data": "05/04 10:30", "nota": "Controtelaio rimosso, muro pulito" },
          { "src": "montaggio_soggiorno.jpg", "fase": "MONTAGGIO", "vano": "V1", "data": "05/04 14:20", "nota": "Controtelaio nuovo posato, livellato" },
          { "src": "dopo_soggiorno.jpg", "fase": "DOPO", "vano": "V1", "data": "05/04 16:45", "nota": "Finestra montata, silicone fatto, anta regolata" },
          { "src": "prima_camera.jpg", "fase": "PRIMA", "vano": "V2", "data": "07/04 08:30", "nota": "Portafinestra scorrevole vecchia" },
          { "src": "demolizione_camera.jpg", "fase": "DEMOLIZIONE", "vano": "V2", "data": "07/04 10:00", "nota": "Binario rimosso" },
        ],
        "chat": [
          { "da": "Marco", "ora": "05/04 08:10", "testo": "Sono arrivato, inizio dal soggiorno", "tipo": "operatore" },
          { "da": "Ufficio", "ora": "05/04 08:12", "testo": "OK, buon lavoro. Ricordati le foto PRIMA", "tipo": "ufficio" },
          { "da": "Marco", "ora": "05/04 10:35", "testo": "Controtelaio soggiorno rimosso. Muro in buone condizioni, niente sorprese", "tipo": "operatore" },
          { "da": "Marco", "ora": "05/04 16:50", "testo": "Soggiorno completato, 4 foto caricate. Domani camera", "tipo": "operatore" },
          { "da": "Cliente", "ora": "06/04 09:00", "testo": "Buongiorno, domani potete iniziare dopo le 9?", "tipo": "cliente" },
          { "da": "Marco", "ora": "07/04 08:32", "testo": "Inizio camera matrimoniale. Scorrevole pesante, serve aiuto per il telaio", "tipo": "operatore" },
          { "da": "Ufficio", "ora": "07/04 08:35", "testo": "Mando Luca alle 10", "tipo": "ufficio" },
          { "da": "AI", "ora": "07/04 08:36", "testo": "Nota: per ENERGETO 8000 scorrevole, coppia serraggio ferramenta Roto = 2.5 Nm", "tipo": "ai" },
        ],
        "timeline": [
          { "data": "20/03", "evento": "Preventivo approvato dal cliente", "tipo": "milestone" },
          { "data": "25/03", "evento": "Sopralluogo tecnico — misure confermate", "tipo": "milestone" },
          { "data": "28/03", "evento": "Ordine materiali inviato ad Aluplast", "tipo": "ordine" },
          { "data": "03/04", "evento": "Materiali consegnati in magazzino — DDT verificato", "tipo": "consegna" },
          { "data": "04/04", "evento": "Materiali caricati sul Ducato — lista spunta OK", "tipo": "logistica" },
          { "data": "05/04", "evento": "Inizio cantiere — V1 Soggiorno completato", "tipo": "lavoro" },
          { "data": "07/04", "evento": "V2 Camera — in corso (scorrevole)", "tipo": "lavoro" },
          { "data": "08/04", "evento": "OGGI — previsto: completare V2 + inizio V3", "tipo": "oggi" },
        ],
        "materiali": [
          { "nome": "Viti ASSY 4x50 zincate", "qta": 48, "usate": 32, "um": "pz" },
          { "nome": "Silicone neutro bianco", "qta": 4, "usate": 2, "um": "tubi" },
          { "nome": "Schiuma PU bassa espansione", "qta": 3, "usate": 1, "um": "bombolette" },
          { "nome": "Nastro VKP PIU 25mm", "qta": 2, "usate": 1, "um": "rotoli" },
          { "nome": "Guarnizione EPDM nera", "qta": 10, "usate": 4, "um": "mt" },
          { "nome": "Tasselli Fischer FUR 10x80", "qta": 24, "usate": 12, "um": "pz" },
        ],
        "firme": [
          { "tipo": "Inizio lavori", "data": "05/04 08:15", "firmato": true, "chi": "Sig. Bianchi" },
          { "tipo": "Fine lavori parziale V1", "data": "05/04 16:50", "firmato": true, "chi": "Sig. Bianchi" },
          { "tipo": "Fine lavori totale", "data": null, "firmato": false, "chi": null },
          { "tipo": "Collaudo", "data": null, "firmato": false, "chi": null },
        ],
        "spese": [
          { "data": "05/04", "desc": "Colazione cantiere", "importo": 8.50, "cat": "Pasti", "stato": "approvata" },
          { "data": "05/04", "desc": "Tasselli aggiuntivi Brico", "importo": 12.90, "cat": "Materiale", "stato": "approvata" },
          { "data": "07/04", "desc": "Parcheggio ZTL Cosenza", "importo": 5.00, "cat": "Trasporto", "stato": "da_approvare" },
        ],
        "ore": [
          { "data": "05/04", "inizio": "08:00", "fine": "17:00", "pausa": 60, "nette": 8, "tipo": "cantiere" },
          { "data": "07/04", "inizio": "08:15", "fine": "16:30", "pausa": 45, "nette": 7.5, "tipo": "cantiere" },
          { "data": "08/04", "inizio": "08:00", "fine": null, "pausa": 0, "nette": 0, "tipo": "cantiere" },
        ],
      },
      {
        "id": "COM-2024-082", "cliente": "Condominio Via Verdi", "indirizzo": "Via Verdi 8, Rende",
        "tipo": "Persiane alluminio", "stato": "programmata", "priorita": "media",
        "dataInizio": "14/04/2026", "dataFine": "18/04/2026", "avanzamento": 0,
        "vani": [
          { "id": "V1", "nome": "App.1 Soggiorno", "tipo": "Persiana 2 ante", "dim": "1200x1600", "materiale": "Alluminio CX65", "stato": "da_fare", "oreReali": 0, "orePreviste": 2 },
          { "id": "V2", "nome": "App.1 Camera", "tipo": "Persiana 2 ante", "dim": "1000x1400", "materiale": "Alluminio CX65", "stato": "da_fare", "oreReali": 0, "orePreviste": 1.5 },
          { "id": "V3", "nome": "App.2 Soggiorno", "tipo": "Persiana 2 ante", "dim": "1200x1600", "materiale": "Alluminio CX65", "stato": "da_fare", "oreReali": 0, "orePreviste": 2 },
        ],
        "documenti": [
          { "nome": "Preventivo condominio", "tipo": "pdf", "data": "10/03", "peso": "320 KB" },
          { "nome": "Delibera assembleare", "tipo": "pdf", "data": "15/03", "peso": "450 KB" },
        ],
        "foto": [], "chat": [
          { "da": "Ufficio", "ora": "01/04", "testo": "Commessa assegnata. Materiali arrivano il 12/04", "tipo": "ufficio" },
          { "da": "Marco", "ora": "01/04", "testo": "OK, presa visione", "tipo": "operatore" },
        ],
        "timeline": [
          { "data": "10/03", "evento": "Preventivo inviato", "tipo": "milestone" },
          { "data": "15/03", "evento": "Delibera assembleare approvata", "tipo": "milestone" },
          { "data": "01/04", "evento": "Commessa assegnata a Marco", "tipo": "assegnazione" },
        ],
        "materiali": [], "firme": [], "spese": [], "ore": [],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 4, "oreNette": 168, "valutazione": 4.8, "ritardi": 0 },
      { "mese": "Feb", "commesse": 5, "oreNette": 152, "valutazione": 4.6, "ritardi": 1 },
      { "mese": "Mar", "commesse": 4, "oreNette": 176, "valutazione": 4.9, "ritardi": 0 },
      { "mese": "Apr", "commesse": 2, "oreNette": 56, "valutazione": 4.5, "ritardi": 1 },
    ],
    certificazioni: [
      { "nome": "Posa qualificata UNI 11673-1", "scadenza": "12/2026", "stato": "valida" },
      { "nome": "Sicurezza cantiere base", "scadenza": "06/2026", "stato": "in_scadenza" },
      { "nome": "Primo soccorso", "scadenza": "03/2027", "stato": "valida" },
    ],
    dotazioni: [
      { "nome": "Trapano Hilti TE 6-A22", "stato": "assegnato", "dal": "01/2024" },
      { "nome": "Livella laser Bosch GCL 2-50", "stato": "assegnato", "dal": "03/2024" },
      { "nome": "Kit sigillatura", "stato": "assegnato", "dal": "01/2024" },
      { "nome": "Fiat Ducato AB 123 CD", "stato": "assegnato", "dal": "06/2023" },
    ],
  },
  {
    id: "op2", nome: "Luca Mancini", ruolo: "montatore", stato: "disponibile",
    telefono: "+39 333 456 7890", email: "luca.m@waltercozza.it",
    pin: "5678", assunto: "2021-09-01", contratto: "determinato",
    patente: "B", automezzo: "Fiat Doblo CD 456 EF",
    avatar: "LM", colore: "#3B7FE0",
    posizione: { lat: 39.3316, lng: 16.2404, aggiornamento: "08/04 07:55", indirizzo: "Sede — Via Industriale, Cosenza" },
    kpi: { commesseAnno: 32, oreAnno: 1320, mediaGiorno: 7.8, ritardi: 5, valutazioneMedia: 4.2, reclami: 3, presenzeMese: 19, assenzeAnno: 8 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Mar 08", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Mer 09", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Gio 10", commessa: "COM-2024-089", attivita: "Supporto Marco — scorrevole camera", ore: "10:00-14:00", colore: T["teal"] },
      { giorno: "Ven 11", commessa: "COM-2024-091", attivita: "Vetrina Bar Sport", ore: "08:00-17:00", colore: T["blue"] },
    ],
    commesse: [
      {
        "id": "COM-2024-091", "cliente": "Bar Sport Centrale", "indirizzo": "Corso Mazzini 44, Cosenza",
        "tipo": "Vetrina commerciale", "stato": "in_attesa_materiali", "priorita": "media",
        "dataInizio": "11/04/2026", "dataFine": "12/04/2026", "avanzamento": 0,
        "vani": [
          { "id": "V1", "nome": "Vetrina frontale", "tipo": "Vetrata fissa temperata", "dim": "3000x2400", "materiale": "Alluminio CX70 + vetro stratificato 6+6", "stato": "da_fare", "oreReali": 0, "orePreviste": 6 },
        ],
        "documenti": [{ "nome": "Preventivo vetrina", "tipo": "pdf", "data": "01/04", "peso": "210 KB" }],
        "foto": [],
        "chat": [
          { "da": "Ufficio", "ora": "03/04", "testo": "Vetro stratificato ordinato a Vetro Sud. Consegna 10/04", "tipo": "ufficio" },
          { "da": "Luca", "ora": "03/04", "testo": "Serve ponteggio?", "tipo": "operatore" },
          { "da": "Ufficio", "ora": "03/04", "testo": "No, altezza interna 2.80. Ventose bastano", "tipo": "ufficio" },
        ],
        "timeline": [
          { "data": "01/04", "evento": "Preventivo confermato", "tipo": "milestone" },
          { "data": "03/04", "evento": "Ordine vetro a Vetro Sud", "tipo": "ordine" },
        ],
        "materiali": [
          { "nome": "Silicone strutturale", "qta": 6, "usate": 0, "um": "tubi" },
          { "nome": "Ventose 3 coppe", "qta": 2, "usate": 0, "um": "pz" },
        ],
        "firme": [], "spese": [], "ore": [],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 3, "oreNette": 148, "valutazione": 4.3, "ritardi": 1 },
      { "mese": "Feb", "commesse": 3, "oreNette": 136, "valutazione": 4.0, "ritardi": 2 },
      { "mese": "Mar", "commesse": 3, "oreNette": 160, "valutazione": 4.4, "ritardi": 1 },
      { "mese": "Apr", "commesse": 0, "oreNette": 0, "valutazione": 0, "ritardi": 0 },
    ],
    certificazioni: [
      { "nome": "Posa qualificata UNI 11673-1", "scadenza": "09/2026", "stato": "valida" },
      { "nome": "Lavori in quota", "scadenza": "05/2026", "stato": "in_scadenza" },
    ],
    dotazioni: [
      { "nome": "Trapano Makita DHP 486", "stato": "assegnato", "dal": "09/2021" },
      { "nome": "Fiat Doblo CD 456 EF", "stato": "assegnato", "dal": "09/2021" },
    ],
  },
  {
    id: "op3", nome: "Andrea Russo", ruolo: "tecnico_misure", stato: "in_sopralluogo",
    telefono: "+39 320 111 2233", email: "andrea.r@waltercozza.it",
    pin: "9012", assunto: "2020-01-10", contratto: "indeterminato",
    patente: "B", automezzo: "Fiat 500L GH 789 IJ",
    avatar: "AR", colore: "#7C3AED",
    posizione: { lat: 39.2900, lng: 16.2700, aggiornamento: "08/04 09:10", indirizzo: "Via Gramsci 22, Rende" },
    kpi: { commesseAnno: 62, oreAnno: 1560, mediaGiorno: 7.0, ritardi: 1, valutazioneMedia: 4.9, reclami: 0, presenzeMese: 22, assenzeAnno: 2 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Mar 08", commessa: "RIL-2024-155", attivita: "Rilievo Sig.ra Greco — 5 vani", ore: "09:00-12:00", colore: T["purple"] },
      { giorno: "Mer 09", commessa: "RIL-2024-156", attivita: "Rilievo condominio Via Mazzini", ore: "10:00-13:00", colore: T["purple"] },
      { giorno: "Gio 10", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Ven 11", commessa: "RIL-2024-157", attivita: "Rilievo villa Sig. De Luca", ore: "09:00-14:00", colore: T["purple"] },
    ],
    commesse: [
      {
        "id": "RIL-2024-155", "cliente": "Sig.ra Greco", "indirizzo": "Via Gramsci 22, Rende",
        "tipo": "Rilievo misure infissi", "stato": "in_corso", "priorita": "alta",
        "dataInizio": "08/04/2026", "dataFine": "08/04/2026", "avanzamento": 40,
        "vani": [
          { "id": "V1", "nome": "Soggiorno", "tipo": "Finestra 2 ante", "dim": "1380x1580", "materiale": "da definire", "stato": "in_corso", "oreReali": 0.5, "orePreviste": 0.5 },
          { "id": "V2", "nome": "Camera 1", "tipo": "Finestra 1 anta", "dim": "da rilevare", "materiale": "da definire", "stato": "da_fare", "oreReali": 0, "orePreviste": 0.3 },
          { "id": "V3", "nome": "Camera 2", "tipo": "Finestra 1 anta", "dim": "da rilevare", "materiale": "da definire", "stato": "da_fare", "oreReali": 0, "orePreviste": 0.3 },
          { "id": "V4", "nome": "Cucina", "tipo": "Finestra 1 anta + ribalta", "dim": "da rilevare", "materiale": "da definire", "stato": "da_fare", "oreReali": 0, "orePreviste": 0.3 },
          { "id": "V5", "nome": "Bagno", "tipo": "Vasistas", "dim": "da rilevare", "materiale": "da definire", "stato": "da_fare", "oreReali": 0, "orePreviste": 0.2 },
        ],
        "documenti": [],
        "foto": [
          { "src": "ril_soggiorno_1.jpg", "fase": "RILIEVO", "vano": "V1", "data": "08/04 09:20", "nota": "Luce muro 1380mm, altezza 1580mm, fuori squadro 3mm" },
        ],
        "chat": [
          { "da": "Andrea", "ora": "08/04 09:05", "testo": "Arrivato da Sig.ra Greco. Inizio rilievo", "tipo": "operatore" },
          { "da": "Andrea", "ora": "08/04 09:22", "testo": "Soggiorno: luce 1380x1580, fuori squadro 3mm lato dx. Muro 30cm", "tipo": "operatore" },
        ],
        "timeline": [{ "data": "08/04", "evento": "Inizio rilievo misure", "tipo": "lavoro" }],
        "materiali": [], "firme": [], "spese": [],
        "ore": [{ "data": "08/04", "inizio": "09:00", "fine": null, "pausa": 0, "nette": 0, "tipo": "sopralluogo" }],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 6, "oreNette": 154, "valutazione": 4.9, "ritardi": 0 },
      { "mese": "Feb", "commesse": 5, "oreNette": 140, "valutazione": 4.8, "ritardi": 1 },
      { "mese": "Mar", "commesse": 7, "oreNette": 168, "valutazione": 5.0, "ritardi": 0 },
      { "mese": "Apr", "commesse": 1, "oreNette": 8, "valutazione": 0, "ritardi": 0 },
    ],
    certificazioni: [
      { "nome": "Posa qualificata UNI 11673-1", "scadenza": "01/2027", "stato": "valida" },
      { "nome": "Termografia edifici livello 1", "scadenza": "11/2026", "stato": "valida" },
    ],
    dotazioni: [
      { "nome": "Metro laser Leica DISTO D2", "stato": "assegnato", "dal": "01/2020" },
      { "nome": "iPad Pro 12.9 + Apple Pencil", "stato": "assegnato", "dal": "03/2023" },
      { "nome": "Fiat 500L GH 789 IJ", "stato": "assegnato", "dal": "01/2020" },
    ],
  },
  {
    id: "op4", nome: "Giuseppe Catanzaro", ruolo: "montatore", stato: "in_cantiere",
    telefono: "+39 347 222 3344", email: "giuseppe.c@waltercozza.it",
    pin: "3456", assunto: "2018-06-20", contratto: "indeterminato",
    patente: "B", automezzo: "Fiat Ducato EF 567 GH",
    avatar: "GC", colore: "#E07B3B",
    posizione: { lat: 39.2950, lng: 16.2550, aggiornamento: "08/04 08:15", indirizzo: "Via Panebianco 88, Cosenza" },
    kpi: { commesseAnno: 51, oreAnno: 1920, mediaGiorno: 8.5, ritardi: 1, valutazioneMedia: 4.8, reclami: 0, presenzeMese: 22, assenzeAnno: 3 },
    agenda: [
      { giorno: "Lun 07", commessa: "COM-2024-095", attivita: "Persiane piano 2", ore: "08:00-16:00", colore: "#E07B3B" },
      { giorno: "Mar 08", commessa: "COM-2024-095", attivita: "Persiane piano 3 + finiture", ore: "08:00-17:00", colore: "#E07B3B" },
      { giorno: "Mer 09", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Gio 10", commessa: "COM-2024-098", attivita: "Zanzariere villa Ferraro", ore: "09:00-13:00", colore: "#2D8A4E" },
      { giorno: "Ven 11", commessa: "COM-2024-098", attivita: "Completamento zanzariere", ore: "08:00-12:00", colore: "#2D8A4E" },
    ],
    commesse: [
      { "id": "COM-2024-095", "cliente": "Palazzo Ferrovia", "indirizzo": "Piazza Matteotti 3, Cosenza", "tipo": "Persiane alluminio x12", "stato": "in_corso", "priorita": "alta", "dataInizio": "03/04/2026", "dataFine": "11/04/2026", "avanzamento": 75,
        "vani": [
          { "id": "V1", "nome": "Piano 1 App.A", "tipo": "Persiana 2 ante", "dim": "1200x1500", "materiale": "Alluminio CX55", "stato": "montato", "oreReali": 2, "orePreviste": 2 },
          { "id": "V2", "nome": "Piano 1 App.B", "tipo": "Persiana 2 ante", "dim": "1200x1500", "materiale": "Alluminio CX55", "stato": "montato", "oreReali": 1.5, "orePreviste": 2 },
          { "id": "V3", "nome": "Piano 2 App.A", "tipo": "Persiana 2 ante", "dim": "1200x1500", "materiale": "Alluminio CX55", "stato": "in_corso", "oreReali": 1, "orePreviste": 2 },
          { "id": "V4", "nome": "Piano 2 App.B", "tipo": "Persiana 2 ante", "dim": "1000x1400", "materiale": "Alluminio CX55", "stato": "da_fare", "oreReali": 0, "orePreviste": 1.5 },
        ],
        "documenti": [{ "nome": "Ordine CX55 Twin Systems", "tipo": "pdf", "data": "25/03", "peso": "310 KB" }],
        "foto": [
          { "src": "pers_p1a.jpg", "fase": "DOPO", "vano": "V1", "data": "04/04 15:30", "nota": "Persiana montata, cardini regolati" },
          { "src": "pers_p1b.jpg", "fase": "DOPO", "vano": "V2", "data": "05/04 11:00", "nota": "Completato secondo appartamento" },
        ],
        "chat": [
          { "da": "Giuseppe", "ora": "04/04 08:10", "testo": "Inizio piano 1, materiali tutti OK", "tipo": "operatore" },
          { "da": "Giuseppe", "ora": "07/04 16:00", "testo": "Piano 1 completato. Domani piano 2", "tipo": "operatore" },
        ],
        "timeline": [
          { "data": "25/03", "evento": "Ordine Twin Systems CX55", "tipo": "ordine" },
          { "data": "03/04", "evento": "Inizio lavori piano 1", "tipo": "lavoro" },
          { "data": "07/04", "evento": "Piano 1 completato", "tipo": "milestone" },
        ],
        "materiali": [
          { "nome": "Cardini regolabili CX55", "qta": 24, "usate": 12, "um": "pz" },
          { "nome": "Viti inox 5x40", "qta": 96, "usate": 48, "um": "pz" },
        ],
        "firme": [{ "tipo": "Inizio lavori", "data": "03/04 08:20", "firmato": true, "chi": "Amm. Ferrovia" }],
        "spese": [{ "data": "04/04", "desc": "Pranzo cantiere x2", "importo": 18.00, "cat": "Pasti", "stato": "approvata" }],
        "ore": [
          { "data": "04/04", "inizio": "08:00", "fine": "16:30", "pausa": 30, "nette": 8, "tipo": "cantiere" },
          { "data": "07/04", "inizio": "08:00", "fine": "16:00", "pausa": 30, "nette": 7.5, "tipo": "cantiere" },
        ],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 5, "oreNette": 176, "valutazione": 4.9, "ritardi": 0 },
      { "mese": "Feb", "commesse": 4, "oreNette": 160, "valutazione": 4.7, "ritardi": 0 },
      { "mese": "Mar", "commesse": 5, "oreNette": 180, "valutazione": 4.8, "ritardi": 1 },
      { "mese": "Apr", "commesse": 2, "oreNette": 64, "valutazione": 4.9, "ritardi": 0 },
    ],
    certificazioni: [
      { "nome": "Posa qualificata UNI 11673-1", "scadenza": "03/2027", "stato": "valida" },
      { "nome": "Sicurezza cantiere", "scadenza": "11/2026", "stato": "valida" },
    ],
    dotazioni: [
      { "nome": "Trapano Hilti TE 4-A22", "stato": "assegnato", "dal": "06/2018" },
      { "nome": "Fiat Ducato EF 567 GH", "stato": "assegnato", "dal": "06/2018" },
    ],
  },
  {
    id: "op5", nome: "Salvatore Morelli", ruolo: "montatore", stato: "in_cantiere",
    telefono: "+39 366 555 6677", email: "salvatore.m@waltercozza.it",
    pin: "4567", assunto: "2022-02-01", contratto: "determinato",
    patente: "B", automezzo: "Renault Kangoo IJ 890 KL",
    avatar: "SM", colore: "#DC4444",
    posizione: { lat: 39.3200, lng: 16.2300, aggiornamento: "08/04 08:50", indirizzo: "Via Popilia 156, Cosenza" },
    kpi: { commesseAnno: 28, oreAnno: 1100, mediaGiorno: 7.5, ritardi: 4, valutazioneMedia: 4.0, reclami: 2, presenzeMese: 18, assenzeAnno: 7 },
    agenda: [
      { giorno: "Lun 07", commessa: "COM-2024-096", attivita: "Tapparelle bagno+cucina", ore: "08:00-15:00", colore: "#DC4444" },
      { giorno: "Mar 08", commessa: "COM-2024-096", attivita: "Tapparelle camere", ore: "08:00-16:00", colore: "#DC4444" },
      { giorno: "Mer 09", commessa: "COM-2024-096", attivita: "Finiture e collaudo", ore: "08:00-12:00", colore: "#DC4444" },
      { giorno: "Gio 10", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Ven 11", commessa: "COM-2024-100", attivita: "Sostituzione tapparella singola", ore: "09:00-11:00", colore: "#C47D0A" },
    ],
    commesse: [
      { "id": "COM-2024-096", "cliente": "Fam. De Rosa", "indirizzo": "Via Popilia 156, Cosenza", "tipo": "Tapparelle motorizzate x6", "stato": "in_corso", "priorita": "media", "dataInizio": "07/04/2026", "dataFine": "09/04/2026", "avanzamento": 35,
        "vani": [
          { "id": "V1", "nome": "Soggiorno", "tipo": "Tapparella motorizzata", "dim": "1400x1600", "materiale": "Alluminio coibentato", "stato": "montato", "oreReali": 2, "orePreviste": 2 },
          { "id": "V2", "nome": "Cucina", "tipo": "Tapparella motorizzata", "dim": "900x1200", "materiale": "Alluminio coibentato", "stato": "in_corso", "oreReali": 1, "orePreviste": 1.5 },
          { "id": "V3", "nome": "Camera 1", "tipo": "Tapparella motorizzata", "dim": "1200x1400", "materiale": "Alluminio coibentato", "stato": "da_fare", "oreReali": 0, "orePreviste": 2 },
        ],
        "documenti": [{ "nome": "Scheda motore Somfy", "tipo": "pdf", "data": "01/04", "peso": "890 KB" }],
        "foto": [{ "src": "tapp_sogg.jpg", "fase": "DOPO", "vano": "V1", "data": "07/04 14:00", "nota": "Tapparella motorizzata funzionante" }],
        "chat": [{ "da": "Salvatore", "ora": "07/04 08:20", "testo": "Inizio tapparelle, motori Somfy tutti presenti", "tipo": "operatore" }],
        "timeline": [{ "data": "07/04", "evento": "Inizio installazione tapparelle", "tipo": "lavoro" }],
        "materiali": [{ "nome": "Motori Somfy iO 6/17", "qta": 6, "usate": 2, "um": "pz" }, { "nome": "Adattatori rullo 60mm", "qta": 6, "usate": 2, "um": "pz" }],
        "firme": [], "spese": [], "ore": [{ "data": "07/04", "inizio": "08:00", "fine": "15:30", "pausa": 30, "nette": 7, "tipo": "cantiere" }],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 3, "oreNette": 128, "valutazione": 4.1, "ritardi": 1 },
      { "mese": "Feb", "commesse": 2, "oreNette": 112, "valutazione": 3.8, "ritardi": 2 },
      { "mese": "Mar", "commesse": 3, "oreNette": 140, "valutazione": 4.2, "ritardi": 0 },
      { "mese": "Apr", "commesse": 1, "oreNette": 28, "valutazione": 4.0, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Posa qualificata UNI 11673-1", "scadenza": "02/2027", "stato": "valida" }],
    dotazioni: [{ "nome": "Trapano Bosch GSR 18V", "stato": "assegnato", "dal": "02/2022" }, { "nome": "Renault Kangoo IJ 890 KL", "stato": "assegnato", "dal": "02/2022" }],
  },
  {
    id: "op6", nome: "Francesco Pellegrino", ruolo: "montatore", stato: "disponibile",
    telefono: "+39 348 777 8899", email: "francesco.p@waltercozza.it",
    pin: "5670", assunto: "2020-11-15", contratto: "indeterminato",
    patente: "B", automezzo: "Fiat Ducato MN 012 OP",
    avatar: "FP", colore: "#2563EB",
    posizione: { lat: 39.3340, lng: 16.2450, aggiornamento: "08/04 07:50", indirizzo: "Sede — Via Industriale, Cosenza" },
    kpi: { commesseAnno: 39, oreAnno: 1580, mediaGiorno: 8.0, ritardi: 3, valutazioneMedia: 4.4, reclami: 1, presenzeMese: 20, assenzeAnno: 5 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Mar 08", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Mer 09", commessa: "COM-2024-101", attivita: "Porte interne ufficio", ore: "08:00-17:00", colore: "#2563EB" },
      { giorno: "Gio 10", commessa: "COM-2024-101", attivita: "Completamento porte", ore: "08:00-14:00", colore: "#2563EB" },
      { giorno: "Ven 11", commessa: null, attivita: null, ore: null, colore: null },
    ],
    commesse: [
      { "id": "COM-2024-101", "cliente": "Studio Legale Ferraro", "indirizzo": "Via XXIV Maggio 10, Cosenza", "tipo": "Porte interne x5", "stato": "programmata", "priorita": "bassa", "dataInizio": "09/04/2026", "dataFine": "10/04/2026", "avanzamento": 0,
        "vani": [
          { "id": "V1", "nome": "Ingresso", "tipo": "Porta a battente", "dim": "900x2100", "materiale": "Laminato rovere", "stato": "da_fare", "oreReali": 0, "orePreviste": 1.5 },
          { "id": "V2", "nome": "Ufficio 1", "tipo": "Porta a battente", "dim": "800x2100", "materiale": "Laminato rovere", "stato": "da_fare", "oreReali": 0, "orePreviste": 1.5 },
          { "id": "V3", "nome": "Ufficio 2", "tipo": "Porta scorrevole", "dim": "900x2100", "materiale": "Laminato rovere", "stato": "da_fare", "oreReali": 0, "orePreviste": 2.5 },
        ],
        "documenti": [{ "nome": "Preventivo porte", "tipo": "pdf", "data": "02/04", "peso": "180 KB" }],
        "foto": [], "chat": [], "timeline": [{ "data": "02/04", "evento": "Preventivo confermato", "tipo": "milestone" }],
        "materiali": [], "firme": [], "spese": [], "ore": [],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 4, "oreNette": 160, "valutazione": 4.5, "ritardi": 1 },
      { "mese": "Feb", "commesse": 3, "oreNette": 144, "valutazione": 4.3, "ritardi": 1 },
      { "mese": "Mar", "commesse": 4, "oreNette": 168, "valutazione": 4.5, "ritardi": 0 },
      { "mese": "Apr", "commesse": 0, "oreNette": 0, "valutazione": 0, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Posa qualificata UNI 11673-1", "scadenza": "11/2026", "stato": "valida" }, { "nome": "Sicurezza cantiere", "scadenza": "04/2026", "stato": "in_scadenza" }],
    dotazioni: [{ "nome": "Trapano DeWalt DCD796", "stato": "assegnato", "dal": "11/2020" }, { "nome": "Fiat Ducato MN 012 OP", "stato": "assegnato", "dal": "11/2020" }],
  },
  {
    id: "op7", nome: "Antonio Ferrara", ruolo: "tecnico_misure", stato: "disponibile",
    telefono: "+39 339 444 5566", email: "antonio.f@waltercozza.it",
    pin: "6789", assunto: "2023-03-01", contratto: "determinato",
    patente: "B", automezzo: "Fiat Panda QR 345 ST",
    avatar: "AF", colore: "#8B5CF6",
    posizione: { lat: 39.3300, lng: 16.2380, aggiornamento: "08/04 07:45", indirizzo: "Sede — Via Industriale, Cosenza" },
    kpi: { commesseAnno: 45, oreAnno: 1200, mediaGiorno: 6.5, ritardi: 0, valutazioneMedia: 4.9, reclami: 0, presenzeMese: 21, assenzeAnno: 3 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Mar 08", commessa: "RIL-2024-158", attivita: "Rilievo villa bifamiliare Mendicino", ore: "09:00-13:00", colore: "#8B5CF6" },
      { giorno: "Mer 09", commessa: "RIL-2024-159", attivita: "Rilievo negozio centro", ore: "10:00-12:00", colore: "#8B5CF6" },
      { giorno: "Gio 10", commessa: "RIL-2024-160", attivita: "Rilievo condominio 8 app", ore: "08:00-14:00", colore: "#8B5CF6" },
      { giorno: "Ven 11", commessa: null, attivita: null, ore: null, colore: null },
    ],
    commesse: [
      { "id": "RIL-2024-158", "cliente": "Fam. Spadafora", "indirizzo": "Via dei Pini 5, Mendicino", "tipo": "Rilievo infissi villa", "stato": "programmata", "priorita": "media", "dataInizio": "08/04/2026", "dataFine": "08/04/2026", "avanzamento": 0,
        "vani": [
          { "id": "V1", "nome": "Soggiorno", "tipo": "Portafinestra 2 ante", "dim": "da rilevare", "materiale": "da definire", "stato": "da_fare", "oreReali": 0, "orePreviste": 0.5 },
          { "id": "V2", "nome": "Camera", "tipo": "Finestra 2 ante", "dim": "da rilevare", "materiale": "da definire", "stato": "da_fare", "oreReali": 0, "orePreviste": 0.3 },
        ],
        "documenti": [], "foto": [], "chat": [], "timeline": [], "materiali": [], "firme": [], "spese": [], "ore": [],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 5, "oreNette": 120, "valutazione": 5.0, "ritardi": 0 },
      { "mese": "Feb", "commesse": 4, "oreNette": 100, "valutazione": 4.8, "ritardi": 0 },
      { "mese": "Mar", "commesse": 6, "oreNette": 130, "valutazione": 4.9, "ritardi": 0 },
      { "mese": "Apr", "commesse": 0, "oreNette": 0, "valutazione": 0, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Posa qualificata UNI 11673-1", "scadenza": "03/2028", "stato": "valida" }, { "nome": "Termografia livello 2", "scadenza": "03/2028", "stato": "valida" }],
    dotazioni: [{ "nome": "Metro laser Leica DISTO X4", "stato": "assegnato", "dal": "03/2023" }, { "nome": "iPad Air + Pencil", "stato": "assegnato", "dal": "03/2023" }, { "nome": "Fiat Panda QR 345 ST", "stato": "assegnato", "dal": "03/2023" }],
  },
  {
    id: "op8", nome: "Roberto Mazza", ruolo: "montatore", stato: "in_pausa",
    telefono: "+39 328 999 0011", email: "roberto.m@waltercozza.it",
    pin: "7890", assunto: "2017-01-10", contratto: "indeterminato",
    patente: "C", automezzo: "Iveco Daily UV 678 WX",
    avatar: "RM", colore: "#059669",
    posizione: { lat: 39.3100, lng: 16.2600, aggiornamento: "08/04 09:30", indirizzo: "Bar Centrale, Cosenza" },
    kpi: { commesseAnno: 55, oreAnno: 2050, mediaGiorno: 8.8, ritardi: 0, valutazioneMedia: 4.9, reclami: 0, presenzeMese: 22, assenzeAnno: 1 },
    agenda: [
      { giorno: "Lun 07", commessa: "COM-2024-088", attivita: "Serranda commerciale", ore: "07:00-16:00", colore: "#059669" },
      { giorno: "Mar 08", commessa: "COM-2024-088", attivita: "Automazione + collaudo", ore: "08:00-14:00", colore: "#059669" },
      { giorno: "Mer 09", commessa: "COM-2024-102", attivita: "Cancello scorrevole", ore: "07:30-17:00", colore: "#059669" },
      { giorno: "Gio 10", commessa: "COM-2024-102", attivita: "Automazione cancello", ore: "08:00-15:00", colore: "#059669" },
      { giorno: "Ven 11", commessa: "COM-2024-103", attivita: "Pergola bioclimatica", ore: "07:00-17:00", colore: "#059669" },
    ],
    commesse: [
      { "id": "COM-2024-088", "cliente": "Supermercato Conad", "indirizzo": "Via degli Stadi 20, Cosenza", "tipo": "Serranda motorizzata", "stato": "in_corso", "priorita": "alta", "dataInizio": "07/04/2026", "dataFine": "08/04/2026", "avanzamento": 60,
        "vani": [{ "id": "V1", "nome": "Ingresso principale", "tipo": "Serranda avvolgibile", "dim": "4000x3500", "materiale": "Acciaio zincato", "stato": "in_corso", "oreReali": 6, "orePreviste": 10 }],
        "documenti": [{ "nome": "Scheda motore Somfy Axovia", "tipo": "pdf", "data": "01/04", "peso": "1.1 MB" }],
        "foto": [{ "src": "serranda_base.jpg", "fase": "MONTAGGIO", "vano": "V1", "data": "07/04 14:00", "nota": "Guida laterale installata, rullo montato" }],
        "chat": [{ "da": "Roberto", "ora": "07/04 07:10", "testo": "Inizio serranda Conad. Servono tasselli chimici — muro cavo", "tipo": "operatore" }, { "da": "Ufficio", "ora": "07/04 07:15", "testo": "Spedisco Salvatore con i chimici entro le 9", "tipo": "ufficio" }],
        "timeline": [{ "data": "07/04", "evento": "Inizio installazione serranda", "tipo": "lavoro" }],
        "materiali": [{ "nome": "Tasselli chimici Fischer FIS V", "qta": 8, "usate": 4, "um": "pz" }, { "nome": "Motore Somfy Axovia 3S", "qta": 1, "usate": 0, "um": "pz" }],
        "firme": [], "spese": [{ "data": "07/04", "desc": "Colazione + pranzo cantiere", "importo": 22.50, "cat": "Pasti", "stato": "da_approvare" }],
        "ore": [{ "data": "07/04", "inizio": "07:00", "fine": "16:30", "pausa": 30, "nette": 9, "tipo": "cantiere" }],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 6, "oreNette": 192, "valutazione": 5.0, "ritardi": 0 },
      { "mese": "Feb", "commesse": 5, "oreNette": 176, "valutazione": 4.9, "ritardi": 0 },
      { "mese": "Mar", "commesse": 6, "oreNette": 188, "valutazione": 5.0, "ritardi": 0 },
      { "mese": "Apr", "commesse": 2, "oreNette": 72, "valutazione": 4.8, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Posa qualificata UNI 11673-1", "scadenza": "01/2027", "stato": "valida" }, { "nome": "Patentino saldatura", "scadenza": "06/2027", "stato": "valida" }, { "nome": "Lavori in quota", "scadenza": "09/2026", "stato": "valida" }],
    dotazioni: [{ "nome": "Saldatrice Lincoln MIG", "stato": "assegnato", "dal": "01/2017" }, { "nome": "Iveco Daily UV 678 WX", "stato": "assegnato", "dal": "01/2017" }],
  },
  {
    id: "op9", nome: "Nicola Greco", ruolo: "montatore", stato: "non_disponibile",
    telefono: "+39 351 222 3300", email: "nicola.g@waltercozza.it",
    pin: "8901", assunto: "2021-06-01", contratto: "determinato",
    patente: "B", automezzo: "Citroen Berlingo YZ 901 AB",
    avatar: "NG", colore: "#6B7280",
    posizione: { lat: 39.3316, lng: 16.2404, aggiornamento: "07/04 17:00", indirizzo: "Sede — Via Industriale, Cosenza" },
    kpi: { commesseAnno: 22, oreAnno: 880, mediaGiorno: 7.2, ritardi: 3, valutazioneMedia: 4.1, reclami: 2, presenzeMese: 14, assenzeAnno: 12 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: "Malattia", ore: null, colore: "#DC4444" },
      { giorno: "Mar 08", commessa: null, attivita: "Malattia", ore: null, colore: "#DC4444" },
      { giorno: "Mer 09", commessa: null, attivita: "Malattia", ore: null, colore: "#DC4444" },
      { giorno: "Gio 10", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Ven 11", commessa: null, attivita: null, ore: null, colore: null },
    ],
    commesse: [],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 2, "oreNette": 96, "valutazione": 4.0, "ritardi": 1 },
      { "mese": "Feb", "commesse": 2, "oreNette": 88, "valutazione": 4.2, "ritardi": 1 },
      { "mese": "Mar", "commesse": 3, "oreNette": 120, "valutazione": 4.1, "ritardi": 1 },
      { "mese": "Apr", "commesse": 0, "oreNette": 0, "valutazione": 0, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Posa qualificata UNI 11673-1", "scadenza": "06/2026", "stato": "in_scadenza" }],
    dotazioni: [{ "nome": "Citroen Berlingo YZ 901 AB", "stato": "assegnato", "dal": "06/2021" }],
  },
  {
    id: "op10", nome: "Domenico Bianchi", ruolo: "magazziniere", stato: "disponibile",
    telefono: "+39 340 111 0099", email: "domenico.b@waltercozza.it",
    pin: "0123", assunto: "2016-09-01", contratto: "indeterminato",
    patente: "C", automezzo: "Muletto sede",
    avatar: "DB", colore: "#CA8A04",
    posizione: { lat: 39.3318, lng: 16.2406, aggiornamento: "08/04 08:00", indirizzo: "Sede — Magazzino, Cosenza" },
    kpi: { commesseAnno: 0, oreAnno: 1760, mediaGiorno: 8.0, ritardi: 0, valutazioneMedia: 4.6, reclami: 0, presenzeMese: 22, assenzeAnno: 2 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: "Scarico merce Twin Systems", ore: "08:00-17:00", colore: "#CA8A04" },
      { giorno: "Mar 08", commessa: null, attivita: "Preparazione kit COM-089 + COM-096", ore: "08:00-17:00", colore: "#CA8A04" },
      { giorno: "Mer 09", commessa: null, attivita: "Inventario trimestrale", ore: "08:00-17:00", colore: "#CA8A04" },
      { giorno: "Gio 10", commessa: null, attivita: "Carico furgoni per Ven", ore: "08:00-17:00", colore: "#CA8A04" },
      { giorno: "Ven 11", commessa: null, attivita: "Ricezione vetri Vetro Sud", ore: "08:00-17:00", colore: "#CA8A04" },
    ],
    commesse: [],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 0, "oreNette": 176, "valutazione": 4.5, "ritardi": 0 },
      { "mese": "Feb", "commesse": 0, "oreNette": 168, "valutazione": 4.6, "ritardi": 0 },
      { "mese": "Mar", "commesse": 0, "oreNette": 176, "valutazione": 4.7, "ritardi": 0 },
      { "mese": "Apr", "commesse": 0, "oreNette": 56, "valutazione": 4.6, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Patentino muletto", "scadenza": "09/2027", "stato": "valida" }, { "nome": "Sicurezza magazzino", "scadenza": "09/2026", "stato": "valida" }],
    dotazioni: [{ "nome": "Muletto Toyota 1.5t", "stato": "assegnato", "dal": "09/2016" }, { "nome": "Pistola barcode Datalogic", "stato": "assegnato", "dal": "01/2024" }],
  },
  {
    id: "op11", nome: "Maria Conte", ruolo: "ufficio", stato: "disponibile",
    telefono: "+39 349 888 7766", email: "maria.c@waltercozza.it",
    pin: "1122", assunto: "2019-04-01", contratto: "indeterminato",
    patente: "B", automezzo: "—",
    avatar: "MC", colore: "#EC4899",
    posizione: { lat: 39.3316, lng: 16.2404, aggiornamento: "08/04 08:30", indirizzo: "Sede — Ufficio, Cosenza" },
    kpi: { commesseAnno: 0, oreAnno: 1760, mediaGiorno: 8.0, ritardi: 0, valutazioneMedia: 4.8, reclami: 0, presenzeMese: 22, assenzeAnno: 3 },
    agenda: [
      { giorno: "Lun 07", commessa: null, attivita: "Preventivi + ordini fornitori", ore: "09:00-18:00", colore: "#EC4899" },
      { giorno: "Mar 08", commessa: null, attivita: "Fatturazione + solleciti", ore: "09:00-18:00", colore: "#EC4899" },
      { giorno: "Mer 09", commessa: null, attivita: "Sopralluoghi telefono + planning", ore: "09:00-18:00", colore: "#EC4899" },
      { giorno: "Gio 10", commessa: null, attivita: "Ordini fornitori + DDT", ore: "09:00-18:00", colore: "#EC4899" },
      { giorno: "Ven 11", commessa: null, attivita: "Chiusura settimanale + report", ore: "09:00-18:00", colore: "#EC4899" },
    ],
    commesse: [],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 0, "oreNette": 176, "valutazione": 4.8, "ritardi": 0 },
      { "mese": "Feb", "commesse": 0, "oreNette": 168, "valutazione": 4.9, "ritardi": 0 },
      { "mese": "Mar", "commesse": 0, "oreNette": 176, "valutazione": 4.8, "ritardi": 0 },
      { "mese": "Apr", "commesse": 0, "oreNette": 56, "valutazione": 4.7, "ritardi": 0 },
    ],
    certificazioni: [],
    dotazioni: [{ "nome": "iMac 24 M3", "stato": "assegnato", "dal": "01/2024" }, { "nome": "Stampante HP LaserJet", "stato": "condiviso", "dal": "01/2019" }],
  },
  {
    id: "op12", nome: "Paolo Ferretti", ruolo: "montatore", stato: "in_cantiere",
    telefono: "+39 327 666 5544", email: "paolo.f@waltercozza.it",
    pin: "2233", assunto: "2024-01-15", contratto: "apprendistato",
    patente: "B", automezzo: "Con Marco (Ducato AB 123 CD)",
    avatar: "PF", colore: "#0891B2",
    posizione: { lat: 39.3076, lng: 16.2501, aggiornamento: "08/04 08:42", indirizzo: "Via Roma 45, Cosenza (con Marco)" },
    kpi: { commesseAnno: 18, oreAnno: 720, mediaGiorno: 7.5, ritardi: 1, valutazioneMedia: 4.3, reclami: 0, presenzeMese: 21, assenzeAnno: 2 },
    agenda: [
      { giorno: "Lun 07", commessa: "COM-2024-089", attivita: "Aiuto Marco — scorrevole", ore: "10:00-16:30", colore: "#0891B2" },
      { giorno: "Mar 08", commessa: "COM-2024-089", attivita: "Aiuto Marco — cucina + bagno", ore: "08:00-17:00", colore: "#0891B2" },
      { giorno: "Mer 09", commessa: "COM-2024-089", attivita: "Finiture con Marco", ore: "08:00-16:00", colore: "#0891B2" },
      { giorno: "Gio 10", commessa: null, attivita: null, ore: null, colore: null },
      { giorno: "Ven 11", commessa: "COM-2024-091", attivita: "Aiuto Luca — vetrina", ore: "08:00-17:00", colore: "#0891B2" },
    ],
    commesse: [
      { "id": "COM-2024-089", "cliente": "Fam. Bianchi (con Marco)", "indirizzo": "Via Garibaldi 12, Cosenza", "tipo": "Supporto montaggio", "stato": "in_corso", "priorita": "media", "dataInizio": "07/04/2026", "dataFine": "10/04/2026", "avanzamento": 50,
        "vani": [{ "id": "V2", "nome": "Camera (supporto)", "tipo": "Portafinestra scorrevole", "dim": "2200x2200", "materiale": "PVC Aluplast ENERGETO 8000", "stato": "in_corso", "oreReali": 3, "orePreviste": 4 }],
        "documenti": [], "foto": [],
        "chat": [{ "da": "Paolo", "ora": "07/04 10:05", "testo": "Arrivato da Marco. Iniziamo la scorrevole", "tipo": "operatore" }],
        "timeline": [{ "data": "07/04", "evento": "Supporto montaggio scorrevole con Marco", "tipo": "lavoro" }],
        "materiali": [], "firme": [], "spese": [],
        "ore": [{ "data": "07/04", "inizio": "10:00", "fine": "16:30", "pausa": 30, "nette": 6, "tipo": "cantiere" }],
      },
    ],
    storicoPrestazioni: [
      { "mese": "Gen", "commesse": 2, "oreNette": 140, "valutazione": 4.2, "ritardi": 0 },
      { "mese": "Feb", "commesse": 2, "oreNette": 136, "valutazione": 4.3, "ritardi": 1 },
      { "mese": "Mar", "commesse": 2, "oreNette": 152, "valutazione": 4.4, "ritardi": 0 },
      { "mese": "Apr", "commesse": 1, "oreNette": 24, "valutazione": 4.3, "ritardi": 0 },
    ],
    certificazioni: [{ "nome": "Posa qualificata UNI 11673-1", "scadenza": "01/2029", "stato": "valida" }],
    dotazioni: [{ "nome": "Kit base utensili", "stato": "assegnato", "dal": "01/2024" }],
  },
];


/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const statoColor = (s) => {
  const m = {
    in_cantiere:     { bg: T.greenLight,  fg: T.green,  label: "In cantiere" },
    disponibile:     { bg: T.tealLight,   fg: T.teal,   label: "Disponibile" },
    in_sopralluogo:  { bg: T.purpleLight, fg: T.purple, label: "In sopralluogo" },
    in_pausa:        { bg: T.amberLight,  fg: T.amber,  label: "In pausa" },
    non_disponibile: { bg: T.redLight,    fg: T.red,    label: "Non disponibile" },
  };
  return m[s] || { bg: T.bgAlt, fg: T.sub, label: s };
};
const statoVanoColor = (s) => {
  const m = { montato: { dot: T.green, label: "Montato" }, in_corso: { dot: T.amber, label: "In corso" }, da_fare: { dot: T.muted, label: "Da fare" } };
  return m[s] || { dot: T.muted, label: s };
};
const statoCommColor = (s) => {
  const m = { in_corso: { dot: T.green, label: "In corso" }, programmata: { dot: T.blue, label: "Programmata" }, in_attesa_materiali: { dot: T.amber, label: "Attesa materiali" }, completata: { dot: T.teal, label: "Completata" } };
  return m[s] || { dot: T.muted, label: s };
};
const tipoChatColor = (tipo) => {
  const m = { operatore: T.teal, ufficio: T.blue, cliente: T.green, ai: T.purple };
  return m[tipo] || T.sub;
};
const alertColor = (tipo) => {
  const m = { richiesta: { bg: T.amberLight, fg: T.amber, icon: "!" }, blocco: { bg: T.redLight, fg: T.red, icon: "X" }, completato: { bg: T.greenLight, fg: T.green, icon: "OK" }, scadenza: { bg: T.purpleLight, fg: T.purple, icon: "!" } };
  return m[tipo] || { bg: T.bgAlt, fg: T.sub, icon: "?" };
};
const fmtOre = (n) => n > 0 ? `${n.toFixed(1)}h` : "\u2014";

const Line = () => <div style={{ borderBottom: `1px solid ${T.line}` }} />;
const SectionTitle = ({ children }) => (
  <div style={{ padding: "14px 20px 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.muted }}>{children}</div>
);
const ProgressBar = ({ pct, height = 4 }) => (
  <div style={{ background: T.lineLight, borderRadius: height / 2, height, overflow: "hidden", flex: 1 }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: height / 2, background: pct >= 100 ? T.green : pct >= 50 ? T.teal : T.amber, transition: "width 0.3s" }} />
  </div>
);

/* ═══════════════════════════════════════════
   MINI MAPPA SVG
═══════════════════════════════════════════ */
const MiniMappa = ({ operatori, selOp, onSelect }) => {
  const minLat = 39.28, maxLat = 39.34, minLng = 16.23, maxLng = 16.28;
  const toX = (lng) => ((lng - minLng) / (maxLng - minLng)) * 240;
  const toY = (lat) => (1 - (lat - minLat) / (maxLat - minLat)) * 120;
  return (
    <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Mappa live</div>
      <svg viewBox="0 0 240 120" style={{ width: "100%", height: 120, background: T.bgAlt, borderRadius: 6, border: `1px solid ${T.lineLight}` }}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(p => <line key={`h${p}`} x1="0" y1={p*120} x2="240" y2={p*120} stroke={T.lineLight} strokeWidth="0.5" />)}
        {[0.25, 0.5, 0.75].map(p => <line key={`v${p}`} x1={p*240} y1="0" x2={p*240} y2="120" stroke={T.lineLight} strokeWidth="0.5" />)}
        {/* Operatori */}
        {operatori.map(o => {
          const x = toX(o.posizione.lng);
          const y = toY(o.posizione.lat);
          const sel = o.id === selOp;
          return (
            <g key={o.id} onClick={() => onSelect(o.id)} style={{ cursor: "pointer" }}>
              {sel && <circle cx={x} cy={y} r="14" fill={`${o.colore}20`} stroke={o.colore} strokeWidth="1" />}
              <circle cx={x} cy={y} r="6" fill={o.colore} stroke="#fff" strokeWidth="1.5" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="8" fontWeight="700" fill={T.ink}>{o.nome.split(" ")[0]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════
   CONFRONTO PRESTAZIONI
═══════════════════════════════════════════ */
const ConfrontoPrestazioni = () => {
  const maxOre = Math.max(...OPERATORI.map(o => o.kpi.oreAnno));
  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Confronto prestazioni</div>
      {/* Grafico a barre orizzontali */}
      {OPERATORI.map(o => {
        const pctOre = (o.kpi.oreAnno / maxOre) * 100;
        return (
          <div key={o.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: o.colore, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800 }}>{o.avatar}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.ink, flex: 1 }}>{o.nome}</span>
              <span style={{ fontSize: 10, color: T.sub, fontFamily: T.mono }}>{o.kpi.valutazioneMedia}/5</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ flex: 1, height: 6, background: T.lineLight, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pctOre}%`, height: "100%", borderRadius: 3, background: o.colore, opacity: 0.7 }} />
              </div>
              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.ink, minWidth: 46, textAlign: "right" }}>{o.kpi.oreAnno}h</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 10, color: T.sub }}>
              <span>{o.kpi.commesseAnno} commesse</span>
              <span>{o.kpi.mediaGiorno}h/giorno</span>
              <span style={{ color: o.kpi.ritardi > 3 ? T.red : T.sub }}>{o.kpi.ritardi} ritardi</span>
              <span style={{ color: o.kpi.reclami > 2 ? T.red : T.sub }}>{o.kpi.reclami} reclami</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════
   COMPONENTE PRINCIPALE
═══════════════════════════════════════════ */
export default function PortaleAzienda() {
  const [selOp, setSelOp] = useState(null);
  const [selComm, setSelComm] = useState(null);
  const [commTab, setCommTab] = useState("vani");
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState(ALERT_DEMO);
  const [problemi, setProblemi] = useState(PROBLEMI_DEMO);
  const [showConfronto, setShowConfronto] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [sideView, setSideView] = useState("operatori"); // operatori | marketplace

  const opFiltered = useMemo(() => {
    if (!search) return OPERATORI;
    const q = search.toLowerCase();
    return OPERATORI.filter(o => o.nome.toLowerCase().includes(q) || o.ruolo.includes(q));
  }, [search]);

  const op = OPERATORI.find(o => o.id === selOp);
  const comm = op?.commesse.find(c => c.id === selComm);
  const unreadAlerts = alerts.filter(a => !a.letto).length;

  // ── SIDEBAR ──
  const Sidebar = () => (
    <div style={{ width: 280, borderRight: `1px solid ${T.line}`, background: T.bgAlt, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>f</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>fliwoX</span>
          <span style={{ fontSize: 11, color: T.muted, marginLeft: "auto" }}>Portale</span>
          {/* Alert badge */}
          {unreadAlerts > 0 && (
            <div onClick={() => setShowAlerts(!showAlerts)} style={{ width: 20, height: 20, borderRadius: "50%", background: T.red, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>{unreadAlerts}</span>
            </div>
          )}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca operatore..."
          style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13, background: T.bg, outline: "none", color: T.ink, fontFamily: T.font }} />
      </div>

      {/* Alert panel */}
      {showAlerts && unreadAlerts > 0 && (
        <div style={{ borderBottom: `1px solid ${T.line}`, maxHeight: 200, overflowY: "auto" }}>
          {alerts.filter(a => !a.letto).map(a => {
            const ac = alertColor(a.tipo);
            return (
              <div key={a.id} onClick={() => { setSelOp(a.opId); setAlerts(prev => prev.map(x => x.id === a.id ? {...x, letto: true} : x)); }}
                style={{ padding: "8px 16px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer", background: ac.bg }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: ac.fg, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ac.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ac.fg }}>{a.op}</span>
                  <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>{a.ora}</span>
                </div>
                <div style={{ fontSize: 11, color: T.ink, lineHeight: 1.4 }}>{a.testo}</div>
                {a.commessa && <div style={{ fontSize: 10, color: T.teal, fontFamily: T.mono, marginTop: 2 }}>{a.commessa}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Mini mappa */}
      <MiniMappa operatori={OPERATORI} selOp={selOp} onSelect={(id) => { setSelOp(id); setSelComm(null); }} />

      {/* KPI azienda + confronto toggle */}
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${T.line}`, display: "flex", gap: 10, alignItems: "center" }}>
        <div><span style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{OPERATORI.length}</span><span style={{ fontSize: 10, color: T.muted, marginLeft: 3 }}>op</span></div>
        <div><span style={{ fontSize: 16, fontWeight: 700, color: T.green }}>{OPERATORI.filter(o => o.stato === "in_cantiere" || o.stato === "in_sopralluogo").length}</span><span style={{ fontSize: 10, color: T.muted, marginLeft: 3 }}>attivi</span></div>
        <div><span style={{ fontSize: 16, fontWeight: 700, color: T.amber }}>{OPERATORI.reduce((s, o) => s + o.commesse.filter(c => c.stato === "in_attesa_materiali").length, 0)}</span><span style={{ fontSize: 10, color: T.muted, marginLeft: 3 }}>bloccati</span></div>
        <div onClick={() => setShowConfronto(!showConfronto)} style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: T.teal, cursor: "pointer", padding: "3px 8px", borderRadius: 4, background: showConfronto ? T.tealLight : "transparent", border: `1px solid ${showConfronto ? T.tealBorder : "transparent"}` }}>
          {showConfronto ? "Lista" : "Confronta"}
        </div>
        <div onClick={() => setSideView(sideView === "marketplace" ? "operatori" : "marketplace")} style={{ fontSize: 10, fontWeight: 600, color: sideView === "marketplace" ? "#fff" : T.amber, cursor: "pointer", padding: "3px 8px", borderRadius: 4, background: sideView === "marketplace" ? T.amber : "transparent", border: `1px solid ${sideView === "marketplace" ? T.amber : "transparent"}` }}>
          MKT
        </div>
      </div>

      {/* Lista operatori o confronto */}
      {/* MARKETPLACE VIEW */}
      {sideView === "marketplace" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Miei lavori pubblicati */}
          <div style={{ padding: "10px 16px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.muted }}>
            Miei lavori pubblicati ({MARKETPLACE_DEMO.filter(m => m.tipo === "pubblicato").length})
          </div>
          {MARKETPLACE_DEMO.filter(m => m.tipo === "pubblicato").map(m => (
            <div key={m.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.amber, fontFamily: T.mono }}>{m.id}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: m.offerte && m.offerte.length > 0 ? T.green : T.muted, background: m.offerte && m.offerte.length > 0 ? T.greenLight : T.lineLight, padding: "1px 6px", borderRadius: 3 }}>
                  {m.offerte && m.offerte.length > 0 ? `${m.offerte.length} offerte` : "Nessuna offerta"}
                </span>
                <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>entro {m.scadenza}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{m.titolo}</div>
              <div style={{ fontSize: 10, color: T.sub }}>{m.zona} · Budget {m.budget}</div>
              {m.offerte && m.offerte.length > 0 && (
                <div style={{ marginTop: 6, borderTop: `1px solid ${T.lineLight}`, paddingTop: 6 }}>
                  {m.offerte.map((o, oi) => (
                    <div key={oi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 10 }}>
                      <span style={{ color: T.ink, fontWeight: 600, flex: 1 }}>{o.da}</span>
                      <span style={{ color: T.teal, fontWeight: 700, fontFamily: T.mono }}>{"\u20AC"}{o.prezzo}</span>
                      <span style={{ color: T.amber }}>{o.valutazione}/5</span>
                      <span style={{ color: T.sub }}>{o.tempoConsegna}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Lavori disponibili nella mia zona */}
          <div style={{ padding: "14px 16px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.muted }}>
            Disponibili nella mia zona ({MARKETPLACE_DEMO.filter(m => m.tipo === "disponibile").length})
          </div>
          {MARKETPLACE_DEMO.filter(m => m.tipo === "disponibile").map(m => (
            <div key={m.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.blue, fontFamily: T.mono }}>{m.id}</span>
                {m.stato === "urgente" && <span style={{ fontSize: 9, fontWeight: 800, color: T.red, background: T.redLight, padding: "1px 5px", borderRadius: 3 }}>URGENTE</span>}
                <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>{m.distanza}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{m.titolo}</div>
              <div style={{ fontSize: 10, color: T.sub, marginBottom: 2 }}>{m.zona} · da {m.azienda}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.green, fontFamily: T.mono }}>{"\u20AC"}{m.budget}</span>
                <span style={{ fontSize: 10, color: T.muted }}>entro {m.scadenza}</span>
              </div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 3, lineHeight: 1.4 }}>{m.dettagli}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                <div style={{ padding: "5px 12px", borderRadius: 5, background: T.teal, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Fai offerta</div>
                <div style={{ padding: "5px 12px", borderRadius: 5, background: T.lineLight, color: T.sub, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Dettagli</div>
              </div>
            </div>
          ))}

          {/* Lavori presi */}
          <div style={{ padding: "14px 16px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.muted }}>
            Lavori presi ({MARKETPLACE_DEMO.filter(m => m.tipo === "preso").length})
          </div>
          {MARKETPLACE_DEMO.filter(m => m.tipo === "preso").map(m => (
            <div key={m.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${T.lineLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, fontFamily: T.mono }}>{m.id}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: m.stato === "completato" ? T.green : T.amber, background: m.stato === "completato" ? T.greenLight : T.amberLight, padding: "1px 6px", borderRadius: 3 }}>
                  {m.stato === "completato" ? "Completato" : "In corso"}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{m.titolo}</div>
              <div style={{ fontSize: 10, color: T.sub }}>{m.zona} · da {m.azienda}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.teal, fontFamily: T.mono }}>{"\u20AC"}{m.prezzoAccettato}</span>
                <span style={{ fontSize: 10, color: T.sub }}>assegnato {m.dataAssegnazione}</span>
                <span style={{ fontSize: 10, color: T.ink, marginLeft: "auto" }}>{m.operatoreAssegnato}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {sideView === "operatori" && <div style={{ flex: 1, overflowY: "auto" }}>
        {showConfronto ? <ConfrontoPrestazioni /> : opFiltered.map(o => {
          const sc = statoColor(o.stato);
          const active = o.id === selOp;
          return (
            <div key={o.id} onClick={() => { setSelOp(o.id); setSelComm(null); setShowConfronto(false); }}
              style={{ padding: "12px 16px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer", background: active ? T.tealLight : "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: o.colore, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{o.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{o.nome}</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{o.ruolo === "montatore" ? "Montatore" : "Tecnico misure"}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: sc.fg, background: sc.bg, padding: "3px 8px", borderRadius: 4 }}>{sc.label}</span>
              </div>
              <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {o.commesse.slice(0, 3).map(c => {
                  const cc = statoCommColor(c.stato);
                  return <span key={c.id} style={{ fontSize: 10, color: T.sub, display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: cc.dot, display: "inline-block" }} />{c.id}
                  </span>;
                })}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );


  // ── DETTAGLIO OPERATORE ──
  const DettaglioOp = () => {
    if (!op) return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 14 }}>
        Seleziona un operatore dalla lista
      </div>
    );
    const sc = statoColor(op.stato);
    const speseMese = op.commesse.reduce((s, c) => s + c.spese.reduce((s2, sp) => s2 + sp.importo, 0), 0);
    const opProblemi = problemi.filter(p => p.opId === op.id);

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── HEADER OPERATORE + AZIONI ── */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.line}`, background: T.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: op.colore, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 800 }}>{op.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{op.nome}</div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{op.ruolo === "montatore" ? "Montatore" : "Tecnico misure"} · {op.automezzo}</div>
            </div>
            {/* ── BOTTONI AZIONE: Chiama, WhatsApp, Export PDF ── */}
            <div style={{ display: "flex", gap: 6 }}>
              <a href={`tel:${op.telefono.replace(/\s/g,"")}`} style={{ padding: "6px 12px", borderRadius: 6, background: T.greenLight, border: `1px solid ${T.green}30`, color: T.green, fontSize: 11, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                Chiama
              </a>
              <a href={`https://wa.me/${op.telefono.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener" style={{ padding: "6px 12px", borderRadius: 6, background: "#DCF8C6", border: "1px solid #25D36630", color: "#128C7E", fontSize: 11, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.546 4.093 1.503 5.818L.05 23.408a.5.5 0 00.607.607l5.59-1.452A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.94 0-3.763-.534-5.32-1.463l-.382-.226-3.96 1.03 1.05-3.84-.248-.395A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                WhatsApp
              </a>
              <div onClick={() => alert("Export PDF scheda " + op.nome + " — coming soon")} style={{ padding: "6px 12px", borderRadius: 6, background: T.blueLight, border: `1px solid ${T.blue}30`, color: T.blue, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                PDF
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: sc.fg, background: sc.bg, padding: "4px 10px", borderRadius: 5 }}>{sc.label}</span>
          </div>
          {/* KPI row */}
          <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Commesse", val: op.kpi.commesseAnno, color: T.ink },
              { label: "Ore anno", val: `${op.kpi.oreAnno}h`, color: T.ink },
              { label: "Media/g", val: `${op.kpi.mediaGiorno}h`, color: T.teal },
              { label: "Voto", val: `${op.kpi.valutazioneMedia}/5`, color: op.kpi.valutazioneMedia >= 4.5 ? T.green : T.amber },
              { label: "Ritardi", val: op.kpi.ritardi, color: op.kpi.ritardi > 3 ? T.red : T.ink },
              { label: "Reclami", val: op.kpi.reclami, color: op.kpi.reclami > 2 ? T.red : T.ink },
              { label: "Presenze", val: `${op.kpi.presenzeMese}/22`, color: T.ink },
              { label: "Spese", val: `\u20AC${speseMese.toFixed(0)}`, color: T.amber },
              { label: "Problemi", val: opProblemi.filter(p => p.stato === "aperto").length, color: opProblemi.filter(p => p.stato === "aperto").length > 0 ? T.red : T.ink },
            ].map((k, i) => (
              <div key={i} style={{ minWidth: 72 }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 2 }}>{k.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: k.color, fontFamily: T.mono }}>{k.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY 2 COLONNE ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* COLONNA SX */}
          <div style={{ width: 340, borderRight: `1px solid ${T.line}`, overflowY: "auto" }}>

            {/* ── AGENDA SETTIMANA ── */}
            <SectionTitle>Agenda settimana</SectionTitle>
            <div style={{ padding: "4px 20px 12px" }}>
              {(op.agenda || []).map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < 4 ? `1px solid ${T.lineLight}` : "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.ink, minWidth: 48, fontFamily: T.mono }}>{g.giorno}</span>
                  {g.commessa ? (
                    <div style={{ flex: 1, background: `${g.colore}12`, borderLeft: `3px solid ${g.colore}`, borderRadius: "0 4px 4px 0", padding: "4px 8px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: g.colore, fontFamily: T.mono }}>{g.commessa}</div>
                      <div style={{ fontSize: 10, color: T.sub }}>{g.attivita}</div>
                      <div style={{ fontSize: 9, color: T.muted }}>{g.ore}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: T.muted, fontStyle: "italic" }}>Libero</span>
                  )}
                </div>
              ))}
            </div>

            <Line />
            <SectionTitle>Commesse ({op.commesse.length})</SectionTitle>
            {op.commesse.map(c => {
              const cc = statoCommColor(c.stato);
              const active = c.id === selComm;
              const oreTot = c.vani.reduce((s, v) => s + v.oreReali, 0);
              const orePrev = c.vani.reduce((s, v) => s + v.orePreviste, 0);
              return (
                <div key={c.id} onClick={() => { setSelComm(c.id); setCommTab("vani"); }}
                  style={{ padding: "12px 20px", borderBottom: `1px solid ${T.lineLight}`, cursor: "pointer", background: active ? T.tealLight : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cc.dot }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.teal, fontFamily: T.mono }}>{c.id}</span>
                    <span style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>{c.priorita === "alta" ? "ALTA" : c.priorita === "media" ? "MEDIA" : "BASSA"}</span>
                    <span style={{ fontSize: 11, color: T.sub, marginLeft: "auto" }}>{cc.label}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{c.cliente}</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{c.tipo} · {c.indirizzo}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <ProgressBar pct={c.avanzamento} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.ink, fontFamily: T.mono, minWidth: 30, textAlign: "right" }}>{c.avanzamento}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: T.sub }}>
                    <span>{c.vani.length} vani</span>
                    <span>{fmtOre(oreTot)}/{fmtOre(orePrev)}</span>
                    <span>{c.foto.length} foto</span>
                    <span>{c.documenti.length} doc</span>
                    <span>{c.chat.length} msg</span>
                    <span>{c.spese.length} spese</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.sub, marginTop: 4 }}>{c.dataInizio} &rarr; {c.dataFine}</div>
                </div>
              );
            })}

            <Line />
            <SectionTitle>Posizione GPS</SectionTitle>
            <div style={{ padding: "8px 20px 14px" }}>
              <div style={{ fontSize: 12, color: T.ink }}>{op.posizione.indirizzo}</div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>Aggiornamento: {op.posizione.aggiornamento}</div>
            </div>

            <Line />
            <SectionTitle>Certificazioni</SectionTitle>
            {op.certificazioni.map((c, i) => (
              <div key={i} style={{ padding: "6px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.stato === "valida" ? T.green : T.amber }} />
                <span style={{ fontSize: 12, color: T.ink, flex: 1 }}>{c.nome}</span>
                <span style={{ fontSize: 10, color: c.stato === "in_scadenza" ? T.amber : T.sub, fontFamily: T.mono }}>{c.scadenza}</span>
              </div>
            ))}

            <Line />
            <SectionTitle>Dotazioni</SectionTitle>
            {op.dotazioni.map((d, i) => (
              <div key={i} style={{ padding: "6px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: T.ink, flex: 1 }}>{d.nome}</span>
                <span style={{ fontSize: 10, color: T.sub }}>dal {d.dal}</span>
              </div>
            ))}

            <Line />
            <SectionTitle>Storico prestazioni</SectionTitle>
            <div style={{ padding: "4px 20px 14px" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 56, marginBottom: 6 }}>
                {op.storicoPrestazioni.map((p, i) => {
                  const h = p.oreNette > 0 ? Math.max((p.oreNette / 180) * 52, 4) : 2;
                  return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", maxWidth: 28, height: h, borderRadius: 3, background: p.valutazione >= 4.5 ? T.teal : p.valutazione >= 4 ? T.blue : T.amber, opacity: 0.7 }} />
                  </div>;
                })}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {op.storicoPrestazioni.map((p, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: T.muted }}>{p.mese}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.ink, fontFamily: T.mono }}>{p.oreNette}h</div>
                    <div style={{ fontSize: 9, color: p.valutazione >= 4.5 ? T.green : T.sub }}>{p.valutazione > 0 ? `${p.valutazione}` : "\u2014"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* COLONNA DX — Dettaglio commessa */}
          <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
            {!comm ? (
              <div style={{ padding: 40, textAlign: "center", color: T.muted, fontSize: 13 }}>
                Seleziona una commessa
              </div>
            ) : (
              <>
                {/* Tabs — 10 tab incluso problemi */}
                <div style={{ display: "flex", borderBottom: `1px solid ${T.line}`, padding: "0 16px", position: "sticky", top: 0, background: T.bg, zIndex: 2, flexWrap: "wrap" }}>
                  {["vani", "foto", "documenti", "chat", "timeline", "materiali", "firme", "spese", "ore", "problemi"].map(tab => {
                    const hasAlert = tab === "problemi" && problemi.filter(p => p.opId === op.id && p.stato === "aperto").length > 0;
                    return (
                      <div key={tab} onClick={() => setCommTab(tab)}
                        style={{ padding: "10px 12px", fontSize: 11, fontWeight: commTab === tab ? 700 : 500, color: commTab === tab ? T.teal : T.sub, borderBottom: commTab === tab ? `2px solid ${T.teal}` : "2px solid transparent", cursor: "pointer", textTransform: "capitalize", position: "relative" }}>
                        {tab}
                        {hasAlert && <span style={{ position: "absolute", top: 6, right: 4, width: 6, height: 6, borderRadius: "50%", background: T.red }} />}
                      </div>
                    );
                  })}
                </div>

                {/* ── TAB VANI ── */}
                {commTab === "vani" && (
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                      {comm.vani.length} vani — {comm.vani.filter(v => v.stato === "montato").length} completati
                    </div>
                    {comm.vani.map((v, i) => {
                      const vc = statoVanoColor(v.stato);
                      return (
                        <React.Fragment key={v.id}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: vc.dot, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{v.id} · {v.nome}</span>
                                <span style={{ fontSize: 10, color: T.sub }}>{v.tipo}</span>
                              </div>
                              <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{v.dim} · {v.materiale}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 10, color: vc.dot === T.green ? T.green : T.sub, fontWeight: 600 }}>{vc.label}</div>
                              <div style={{ fontSize: 11, fontFamily: T.mono, color: T.ink }}>{fmtOre(v.oreReali)}/{fmtOre(v.orePreviste)}</div>
                            </div>
                          </div>
                          {i < comm.vani.length - 1 && <Line />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* ── TAB FOTO ── */}
                {commTab === "foto" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.foto.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna foto</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.foto.length} foto</div>
                      {comm.foto.map((f, i) => {
                        const fc = { PRIMA: T.blue, DEMOLIZIONE: T.red, MONTAGGIO: T.amber, DOPO: T.green, RILIEVO: T.purple }[f.fase] || T.sub;
                        return (
                          <React.Fragment key={i}>
                            <div style={{ padding: "10px 0", display: "flex", gap: 12 }}>
                              <div style={{ width: 56, height: 56, borderRadius: 6, background: T.lineLight, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: fc, background: `${fc}15`, padding: "1px 6px", borderRadius: 3 }}>{f.fase}</span>
                                  <span style={{ fontSize: 10, color: T.sub }}>Vano {f.vano}</span>
                                  <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>{f.data}</span>
                                </div>
                                <div style={{ fontSize: 12, color: T.ink }}>{f.nota}</div>
                              </div>
                            </div>
                            {i < comm.foto.length - 1 && <Line />}
                          </React.Fragment>
                        );
                      })}
                    </>}
                  </div>
                )}

                {/* ── TAB DOCUMENTI ── */}
                {commTab === "documenti" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.documenti.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun documento</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.documenti.length} documenti</div>
                      {comm.documenti.map((d, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 6, background: d.tipo === "pdf" ? T.redLight : T.blueLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: d.tipo === "pdf" ? T.red : T.blue, textTransform: "uppercase" }}>{d.tipo}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: T.ink }}>{d.nome}</div>
                              <div style={{ fontSize: 10, color: T.sub }}>{d.peso}</div>
                            </div>
                            <span style={{ fontSize: 10, color: T.muted }}>{d.data}</span>
                          </div>
                          {i < comm.documenti.length - 1 && <Line />}
                        </React.Fragment>
                      ))}
                    </>}
                  </div>
                )}

                {/* ── TAB CHAT ── */}
                {commTab === "chat" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.chat.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun messaggio</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.chat.length} messaggi</div>
                      {comm.chat.map((msg, i) => {
                        const col = tipoChatColor(msg.tipo);
                        return (
                          <React.Fragment key={i}>
                            <div style={{ padding: "8px 0", display: "flex", gap: 10 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: col, flexShrink: 0, marginTop: 6 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: col }}>{msg.da}</span>
                                  <span style={{ fontSize: 10, color: T.muted }}>{msg.ora}</span>
                                </div>
                                <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>{msg.testo}</div>
                              </div>
                            </div>
                            {i < comm.chat.length - 1 && <Line />}
                          </React.Fragment>
                        );
                      })}
                    </>}
                  </div>
                )}

                {/* ── TAB TIMELINE ── */}
                {commTab === "timeline" && (
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Timeline</div>
                    {comm.timeline.map((t, i) => (
                      <div key={i} style={{ padding: "8px 0", display: "flex", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.tipo === "oggi" ? T.teal : T.line, border: t.tipo === "oggi" ? `2px solid ${T.teal}` : `2px solid ${T.line}`, flexShrink: 0 }} />
                          {i < comm.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: T.lineLight, marginTop: 4 }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: 8 }}>
                          <div style={{ fontSize: 12, color: t.tipo === "oggi" ? T.teal : T.ink, fontWeight: t.tipo === "oggi" ? 700 : 400 }}>{t.evento}</div>
                        </div>
                        <span style={{ fontSize: 10, color: T.muted, fontFamily: T.mono }}>{t.data}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── TAB MATERIALI ── */}
                {commTab === "materiali" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.materiali.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun materiale</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{comm.materiali.length} materiali</div>
                      {comm.materiali.map((m, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: T.ink }}>{m.nome}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <ProgressBar pct={m.qta > 0 ? (m.usate / m.qta) * 100 : 0} height={3} />
                                <span style={{ fontSize: 10, color: T.sub, fontFamily: T.mono, minWidth: 55 }}>{m.usate}/{m.qta} {m.um}</span>
                              </div>
                            </div>
                          </div>
                          {i < comm.materiali.length - 1 && <Line />}
                        </React.Fragment>
                      ))}
                    </>}
                  </div>
                )}

                {/* ── TAB FIRME ── */}
                {commTab === "firme" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.firme.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna firma</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Firme</div>
                      {comm.firme.map((f, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.firmato ? T.green : T.muted }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: T.ink }}>{f.tipo}</div>
                              {f.firmato && <div style={{ fontSize: 10, color: T.sub }}>{f.chi} · {f.data}</div>}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 600, color: f.firmato ? T.green : T.muted }}>{f.firmato ? "Firmato" : "In attesa"}</span>
                          </div>
                          {i < comm.firme.length - 1 && <Line />}
                        </React.Fragment>
                      ))}
                    </>}
                  </div>
                )}

                {/* ── TAB SPESE — con approvazione inline ── */}
                {commTab === "spese" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.spese.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna spesa</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                        {comm.spese.length} spese · Totale: {"\u20AC"}{comm.spese.reduce((s, sp) => s + sp.importo, 0).toFixed(2)}
                      </div>
                      {comm.spese.map((sp, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: T.ink }}>{sp.desc}</div>
                              <div style={{ fontSize: 10, color: T.sub }}>{sp.cat} · {sp.data}</div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: T.mono }}>{"\u20AC"}{sp.importo.toFixed(2)}</span>
                            {sp.stato === "da_approvare" ? (
                              <div style={{ display: "flex", gap: 4 }}>
                                <div onClick={() => alert("Spesa approvata: " + sp.desc)} style={{ padding: "4px 10px", borderRadius: 4, background: T.greenLight, color: T.green, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1px solid ${T.green}30` }}>Approva</div>
                                <div onClick={() => alert("Spesa rifiutata: " + sp.desc)} style={{ padding: "4px 10px", borderRadius: 4, background: T.redLight, color: T.red, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1px solid ${T.red}30` }}>Rifiuta</div>
                              </div>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 600, color: T.green, background: T.greenLight, padding: "2px 6px", borderRadius: 3 }}>OK</span>
                            )}
                          </div>
                          {i < comm.spese.length - 1 && <Line />}
                        </React.Fragment>
                      ))}
                    </>}
                  </div>
                )}

                {/* ── TAB ORE ── */}
                {commTab === "ore" && (
                  <div style={{ padding: "12px 20px" }}>
                    {comm.ore.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessuna ora</div> : <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                        Ore · Totale: {fmtOre(comm.ore.reduce((s, o) => s + o.nette, 0))}
                      </div>
                      {comm.ore.map((o, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, fontFamily: T.mono, color: T.ink, minWidth: 42 }}>{o.data}</span>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: T.ink }}>{o.inizio}</span>
                              <span style={{ fontSize: 10, color: T.muted }}>{"\u2192"}</span>
                              <span style={{ fontSize: 12, color: o.fine ? T.ink : T.amber }}>{o.fine || "in corso"}</span>
                              {o.pausa > 0 && <span style={{ fontSize: 10, color: T.sub }}>({o.pausa}min)</span>}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.teal, fontFamily: T.mono }}>{o.nette > 0 ? fmtOre(o.nette) : "..."}</span>
                          </div>
                          {i < comm.ore.length - 1 && <Line />}
                        </React.Fragment>
                      ))}
                    </>}
                  </div>
                )}

                {/* ── TAB PROBLEMI ── */}
                {commTab === "problemi" && (() => {
                  const cProb = problemi.filter(p => p.opId === op.id && p.commessa === comm.id);
                  return (
                    <div style={{ padding: "12px 20px" }}>
                      {cProb.length === 0 ? <div style={{ color: T.muted, fontSize: 12, padding: 20, textAlign: "center" }}>Nessun problema segnalato</div> : <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                          {cProb.length} problemi — {cProb.filter(p => p.stato === "aperto").length} aperti
                        </div>
                        {cProb.map((p, i) => (
                          <React.Fragment key={p.id}>
                            <div style={{ padding: "12px 0" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.stato === "aperto" ? T.red : T.green }} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: p.stato === "aperto" ? T.red : T.green }}>{p.stato === "aperto" ? "APERTO" : "RISOLTO"}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: p.priorita === "alta" ? T.red : T.amber, background: p.priorita === "alta" ? T.redLight : T.amberLight, padding: "1px 6px", borderRadius: 3 }}>{p.priorita}</span>
                                <span style={{ fontSize: 10, color: T.sub, marginLeft: "auto" }}>{p.data}</span>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{p.titolo}</div>
                              <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.5 }}>{p.desc}</div>
                              {p.vano && <div style={{ fontSize: 10, color: T.teal, fontFamily: T.mono, marginTop: 4 }}>Vano: {p.vano}</div>}
                              {p.foto && (
                                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                  <div style={{ width: 40, height: 40, borderRadius: 4, background: T.lineLight, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                  </div>
                                  <span style={{ fontSize: 10, color: T.sub }}>{p.foto}</span>
                                </div>
                              )}
                            </div>
                            {i < cProb.length - 1 && <Line />}
                          </React.Fragment>
                        ))}
                      </>}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", fontFamily: T.font, color: T.ink, height: "100vh", overflow: "hidden", background: T.bg }}>
      <Sidebar />
      <DettaglioOp />
    </div>
  );
}
