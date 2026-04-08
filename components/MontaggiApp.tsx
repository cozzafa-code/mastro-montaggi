// ts-20260408realdata
'use client';

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç SUPABASE CONFIG ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';
const AZIENDA_ID = 'ccca51c1-656b-4e7c-a501-55753e20da29';

async function sbFetch(table: string, params?: Record<string,string>): Promise<any[]> {
  try {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const r = await fetch(`${SB_URL}/rest/v1/${table}${qs}`, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }
    });
    if (!r.ok) throw new Error(`sbFetch ${table}: ${r.status}`);
    return r.json();
  } catch (e) {
    console.error('[sbFetch]', e);
    return [];
  }
}

async function sbInsert(table: string, body: object): Promise<any> {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  } catch (e) {
    console.error('[sbInsert]', e);
    return null;
  }
}

async function sbPatch(table: string, id: string, body: object): Promise<void> {
  try {
    await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('[sbPatch]', e);
  }
}

// ═══ DATI REALI DA SUPABASE ═══════════════════════════════════════
function useMontaggiData(operatorePin: string) {
  const [dbCommesse, setDbCommesse] = React.useState<any[]>([]);
  const [dbVani, setDbVani] = React.useState<any[]>([]);
  const [dbMontaggi, setDbMontaggi] = React.useState<any[]>([]);
  const [dbOperatore, setDbOperatore] = React.useState<any>(null);
  const [dbLoading, setDbLoading] = React.useState(true);

  React.useEffect(() => {
    if (!operatorePin) return;
    (async () => {
      try {
        const opRes = await sbFetch('operatori', { pin: 'eq.' + operatorePin, limit: '1' });
        const op = opRes[0];
        if (!op) { setDbLoading(false); return; }
        setDbOperatore(op);
        const azId = op.azienda_id;
        const [cmRes, vaniRes, montRes] = await Promise.all([
          sbFetch('commesse', { azienda_id: 'eq.' + azId, order: 'code.desc', limit: '50' }),
          sbFetch('vani', { select: '*', limit: '200' }),
          sbFetch('montaggi', { azienda_id: 'eq.' + azId, order: 'data_montaggio.desc', limit: '50' }),
        ]);
        // Filtra montaggi assegnati a questo operatore (per operatore_id o in squadra)
        const miei = (montRes || []).filter((m: any) => 
          m.operatore_id === op.id || (m.squadra && m.squadra.includes(op.id))
        );
        setDbCommesse(cmRes || []);
        setDbVani(vaniRes || []);
        setDbMontaggi(miei);
        // Popola FL_COMMESSE solo con commesse che hanno montaggi assegnati a questo operatore
        const mieiCommessaIds = new Set(miei.map((m: any) => m.commessa_id));
        const mieCommesse = (cmRes || []).filter((c: any) => mieiCommessaIds.has(c.id));
        FL_COMMESSE.length = 0;
        mieCommesse.forEach((c: any) => FL_COMMESSE.push({
          id: c.id, aziendaId: azId, titolo: (c.code||'') + ' — ' + (c.cliente||''),
          cliente: c.cliente||'', vani: 0, importo: 0, incassato: 0,
          stato: c.fase==='chiusura'?'completato':'in_corso', avanzamento: 50, data: c.fase_start||'',
        }));
        FL_AZIENDE.length = 0;
        FL_AZIENDE.push({ id: azId, nome: (op.nome||'')+' '+(op.cognome||''), citta:'', avatar:(op.nome?.[0]||'')+(op.cognome?.[0]||''), colore:'#28A0A0' });
        // Aggiorna OP e COM
        OP.nome = (op.nome||'')+' '+(op.cognome||'');
        OP.ruolo = op.ruolo || 'montatore';
        OP.avatar = (op.nome?.[0]||'')+(op.cognome?.[0]||'');
        const oggi = new Date().toISOString().slice(0,10);
        const montOggi = miei.find((m:any)=>m.data_montaggio===oggi);
        const cmOggi = montOggi ? (cmRes||[]).find((c:any)=>c.id===montOggi.commessa_id) : (cmRes||[])[0];
        if (cmOggi) {
          COM.id = cmOggi.code || cmOggi.id;
          COM.cliente = cmOggi.cliente || '';
          COM.indirizzo = cmOggi.indirizzo || '';
          COM.telefono = cmOggi.telefono || '';
          COM.email = cmOggi.email || '';
          COM.dataAppuntamento = montOggi?.data_montaggio || oggi;
          COM.oraAppuntamento = montOggi?.ora_inizio?.slice(0,5) || '08:00';
          COM.note = '';
          const cmVani = (vaniRes||[]).filter((v:any)=>v.commessa_id===cmOggi.id);
          if (cmVani.length > 0) {
            COM.vani = cmVani.map((v:any,i:number) => ({
              id:i+1, nome:v.nome||'Vano '+(i+1), tipo:v.tipo||'Finestra',
              stato:'da_fare' as const, materiale:(v.sistema||'pvc').toLowerCase() as any,
              formato:'finestra' as any, dimensioni:'',
            }));
          }
        }
      } catch (e) { console.error('[useMontaggiData]', e); }
      setDbLoading(false);
    })();
  }, [operatorePin]);
  return { dbCommesse, dbVani, dbMontaggi, dbOperatore, dbLoading };
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Home, Calendar, FileText, Clock, MapPin, Phone, Mail,
  Camera, Paperclip, Send, Download, Ruler, ShoppingCart,
  Wrench, Receipt, MessageCircle, Play, Pause, Square,
  AlertCircle, CheckCircle, Plus, Image, Navigation,
  ClipboardList, Pen, Package, Pencil, BarChart2, FileCheck, Euro, TrendingUp, ShoppingBag, Warehouse, MoreHorizontal, Settings, GripVertical,
  LogIn, MessageSquare, ArrowRight, Building2,
  ChevronLeft, ChevronRight, Bell, Circle,
  X, Check, TriangleAlert, Zap
} from 'lucide-react';
import MastroCad from './MastroCad';
import HomeControlCenter from './HomeControlCenter';
import ChiudiLavoro from './ChiudiLavoro';
import { CardVanoIndicatori, type Materiale, type FormatoSerramento } from './MastroMateriali';
import MastroAI, { type CommessaCtx } from './MastroAI';
import MastroFAB from './MastroFAB';
import SpesaQuick from './SpesaQuick';
import DisegnoCanvas from './DisegnoCanvas';
import RiepilogoWidget from './RiepilogoWidget';
import ContabilitaFreelance from './ContabilitaFreelance';
import AgendaView from './AgendaView';
import ReportCommessa from './ReportCommessa';
import GalassiaAI from './GalassiaAI';
import MagazzinoWow from './MagazzinoWow';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};
const gridBg: React.CSSProperties = {
  backgroundImage:`repeating-linear-gradient(0deg,rgba(40,160,160,.10) 0px,rgba(40,160,160,.10) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(40,160,160,.10) 0px,rgba(40,160,160,.10) 1px,transparent 1px,transparent 32px)`,
  backgroundColor:DS.bg,
};
const card: React.CSSProperties = {
  background:'linear-gradient(145deg,#fff,#f4fcfc)',
  borderRadius:14, border:`1.5px solid ${DS.border}`,
  boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:14,
};
const bp=(p=false,bg=DS.teal,sh=DS.tealDark): React.CSSProperties=>({
  background:bg,color:'#fff',border:'none',borderRadius:10,
  padding:'11px 18px',fontFamily:DS.ui,fontWeight:700,fontSize:14,
  cursor:'pointer',display:'flex',alignItems:'center',gap:8,
  boxShadow:p?'none':`0 5px 0 0 ${sh}`,
  transform:p?'translateY(4px)':'translateY(0)',
  transition:'box-shadow 80ms, transform 80ms',
});
const bpG  = (p=false) => bp(p,DS.green,DS.greenDark);
const bpA  = (p=false) => bp(p,DS.amber,DS.amberDark);
const bpGh = (p=false): React.CSSProperties => ({...bp(p,DS.tealLight,DS.border),color:DS.teal,boxShadow:p?'none':`0 4px 0 0 ${DS.border}`});

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TIPI ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
type Fase = 'misura'|'preventivo'|'produzione'|'montaggio'|'fattura';
type ChatMsg = {id:number;autore:string;testo:string;ora:string;proprio:boolean;fase:Fase};
type OrdineItem = {id:number;desc:string;qty:number;dest:'magazzino'|'fornitore';stato:'bozza'|'inviato'|'confermato'};
type Task = {id:number;testo:string;urgente:boolean;fatto:boolean};
type View = 'home'|'agenda'|'commessa'|'chat'|'bacheca'|'commesse_fl'|'fatture'|'ordini_fl'|'magazzino_fl'|'impostazioni_fl';
type CTab = 'info'|'vani'|'workflow'|'checklist'|'documenti'|'ordini'|'chat'|'collaudo';

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç MOCK ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
let OP = {nome:'Marco Vito',ruolo:'Montatore Senior',avatar:'MV',tipo:'interno' as 'interno'|'esterno'};
let COM: any = {
  id:'COM-2024-047', cliente:'Fam. Rossi',
  indirizzo:'Via Roma 12, Brindisi BR 72100',
  telefono:'+39 331 456 7890', email:'rossi@email.it',
  dataAppuntamento:'2026-04-04', oraAppuntamento:'08:30',
  note:'Condominio — citofono piano terra. Parcheggio sul retro.',
  vani:[
    {id:1,nome:'Finestra Camera',  tipo:'Finestra 120x140',    stato:'completato' as const, materiale:'pvc'       as Materiale, formato:'finestra'      as FormatoSerramento, dimensioni:'120×140'},
    {id:2,nome:'Porta Balcone',    tipo:'Portafinestra 90x210',stato:'in_corso'   as const, materiale:'alluminio' as Materiale, formato:'portafinestra' as FormatoSerramento, dimensioni:'90×210'},
    {id:3,nome:'Finestra Bagno',   tipo:'Finestra 60x90',      stato:'da_fare'    as const, materiale:'pvc'       as Materiale, formato:'finestra'      as FormatoSerramento, dimensioni:'60×90'},
  ],
};
const FASI: {id:Fase;label:string;stato:'fatto'|'attivo'|'attesa'}[] = [
  {id:'misura',     label:'Misura',     stato:'fatto'},
  {id:'preventivo', label:'Preventivo', stato:'fatto'},
  {id:'produzione', label:'Produzione', stato:'fatto'},
  {id:'montaggio',  label:'Montaggio',  stato:'attivo'},
  {id:'fattura',    label:'Fattura',    stato:'attesa'},
];
const WF = [
  {ruolo:'Misuratore',   nome:'Luigi Bianchi',icona:<Ruler size={14}/>,       stato:'fatto', data:'18/03',tel:'+39 340 111 2222',email:'luigi@mastro.it'},
  {ruolo:'Preventivista',nome:'Lidia Cozza',  icona:<FileText size={14}/>,    stato:'fatto', data:'20/03',tel:'+39 340 333 4444',email:'lidia@mastro.it'},
  {ruolo:'Produzione',   nome:'Officina Sud', icona:<ShoppingCart size={14}/>,stato:'fatto', data:'28/03',tel:'+39 340 555 6666',email:'officina@sud.it'},
  {ruolo:'Montaggio',    nome:'Marco Vito',   icona:<Wrench size={14}/>,      stato:'attivo',data:'',     tel:'+39 340 777 8888',email:'marco@mastro.it'},
  {ruolo:'Fatturazione', nome:'Ufficio',      icona:<Receipt size={14}/>,     stato:'attesa',data:'',     tel:'',email:''},
];
const CL_INIT = [
  {id:1,testo:'Verifica misure sul posto',    completata:false,allegati:[] as string[]},
  {id:2,testo:'Rimozione infisso esistente',  completata:false,allegati:[] as string[]},
  {id:3,testo:'Preparazione controtelaio',    completata:false,allegati:[] as string[]},
  {id:4,testo:'Installazione nuovo infisso',  completata:false,allegati:[] as string[]},
  {id:5,testo:'Sigillatura e finitura',       completata:false,allegati:[] as string[]},
  {id:6,testo:'Test apertura/chiusura',       completata:false,allegati:[] as string[]},
  {id:7,testo:'Foto fine lavoro',             completata:false,allegati:[] as string[]},
];
const THREAD_INIT: ChatMsg[] = [
  {id:1,autore:'Luigi Bianchi',testo:'Misure completate. Parete est +2cm.',     ora:'18/03 09:15',proprio:false,fase:'misura'},
  {id:2,autore:'Lidia Cozza',  testo:'Preventivo approvato. Procediamo.',       ora:'20/03 11:30',proprio:false,fase:'preventivo'},
  {id:3,autore:'Officina Sud', testo:'Produzione completata, tutto pronto.',    ora:'28/03 16:00',proprio:false,fase:'produzione'},
  {id:4,autore:'Lidia Cozza',  testo:'Marco, porta i coprifili extra da 40mm.',ora:'07:45',       proprio:false,fase:'montaggio'},
  {id:5,autore:'Marco Vito',   testo:'Ok, li ho già nel furgone.',              ora:'07:52',       proprio:true, fase:'montaggio'},
];
const CONTACTS_INIT = [
  {id:'lidia', nome:'Lidia Cozza',  ruolo:'Ufficio',    avatar:'LC', msgs:[{id:1,autore:'Lidia Cozza',testo:'Tutto ok per domani?',ora:'ieri',proprio:false}] as ChatMsg[]},
  {id:'luigi', nome:'Luigi Bianchi',ruolo:'Misuratore', avatar:'LB', msgs:[] as ChatMsg[]},
  {id:'andrea',nome:'Andrea Neri',  ruolo:'Apprendista',avatar:'AN', msgs:[] as ChatMsg[]},
];
const ORDINI_INIT: OrdineItem[] = [
  {id:1,desc:'Coprifili alluminio 40mm',  qty:6, dest:'magazzino',stato:'confermato'},
  {id:2,desc:'Guarnizioni EPDM 8mm',      qty:10,dest:'magazzino',stato:'inviato'},
  {id:3,desc:'Lastra lamiera 60x90 1.5mm',qty:2, dest:'fornitore', stato:'bozza'},
];
const TASKS_INIT: Task[] = [
  {id:1,testo:'Conferma appuntamento Condominio Verdi',urgente:true, fatto:false},
  {id:2,testo:'Invio preventivo Studio Greco',         urgente:true, fatto:false},
  {id:3,testo:'Riordino stock guarnizioni',            urgente:false,fatto:false},
];
const AVVIO_ITEMS = [
  'Arrivo confermato sul posto',
  'Documenti commessa verificati',
  'Materiale controllato nel furgone',
  'Foto stato iniziale del cantiere',
  'Cliente presente o contattato',
];
const WEEK = [
  {label:'Lun 31',events:[]},
  {label:'Mar 1', events:[{ora:'09:00',cliente:'Sig. Marini',vani:2}]},
  {label:'Mer 2', events:[]},
  {label:'Gio 3', events:[{ora:'08:30',cliente:'Fam. Rossi',vani:3}],oggi:true},
  {label:'Ven 4', events:[{ora:'08:00',cliente:'Cond. Verdi',vani:6}]},
  {label:'Sab 5', events:[]},
  {label:'Dom 6', events:[]},
];

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç HOOKS ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function useTimer() {
  const KEY='fliwox_timer';
  const [running,setRunning]=useState(false);
  const [elapsed,setElapsed]=useState(()=>{
    try{const s=localStorage.getItem(KEY);return s?parseInt(s,10):0;}catch{return 0;}
  });
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const saveRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const start=()=>{
    if(!running){
      setRunning(true);
      ref.current=setInterval(()=>setElapsed(e=>{
        const n=e+1;
        try{localStorage.setItem(KEY,String(n));}catch{}
        return n;
      }),1000);
    }
  };
  const pause=()=>{
    if(ref.current)clearInterval(ref.current);
    setRunning(false);
    try{localStorage.setItem(KEY,String(elapsed));}catch{}
  };
  const stop=()=>{pause();setElapsed(0);try{localStorage.removeItem(KEY);}catch{}};
  const fmt=(s:number)=>`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return{running,elapsed,start,pause,stop,fmt};
}

function ora(){return new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});}

const NAV=[
  {id:'home',    label:'Home',   icon:Home},
  {id:'agenda',  label:'Agenda', icon:Calendar},
  {id:'commessa',label:'Lavoro', icon:ClipboardList},
  {id:'chat',    label:'Chat',   icon:MessageSquare},
];
const NAV_FL=[
  {id:'home',    label:'Home',    icon:Home},
  {id:'agenda',  label:'Agenda',  icon:Calendar},
  {id:'commessa',label:'Lavoro',  icon:ClipboardList},
  {id:'bacheca', label:'Bacheca', icon:BarChart2},
  {id:'__menu',  label:'Altro',   icon:MoreHorizontal},
];
const MENU_FL_ITEMS = [
  {id:'commesse_fl', label:'Commesse',    icon:FileCheck},
  {id:'ordini_fl',   label:'Ordini',      icon:ShoppingBag},
  {id:'magazzino_fl',label:'Magazzino',   icon:Warehouse},
  {id:'fatture',     label:'Contabilità', icon:Euro},
  {id:'impostazioni_fl',label:'Impostazioni',icon:Settings},
];


// ├ö├Â├ç├ö├Â├ç├ö├Â├ç FLIWOX LOGO SVG ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function FliwoxLogo({size=32}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="95" y="15" width="10" height="10" rx="2" fill="#2FA7A2"/>
      <rect x="130" y="25" width="10" height="10" rx="2" fill="#7ED957"/>
      <rect x="155" y="50" width="10" height="10" rx="2" fill="#F59E0B"/>
      <rect x="165" y="95" width="10" height="10" rx="2" fill="#7ED957"/>
      <rect x="155" y="140" width="10" height="10" rx="2" fill="#F59E0B"/>
      <rect x="130" y="165" width="10" height="10" rx="2" fill="#7ED957"/>
      <rect x="95" y="175" width="10" height="10" rx="2" fill="#2FA7A2"/>
      <rect x="60" y="165" width="10" height="10" rx="2" fill="#F59E0B"/>
      <rect x="35" y="140" width="10" height="10" rx="2" fill="#7ED957"/>
      <rect x="25" y="95" width="10" height="10" rx="2" fill="#F59E0B"/>
      <rect x="35" y="50" width="10" height="10" rx="2" fill="#7ED957"/>
      <rect x="60" y="25" width="10" height="10" rx="2" fill="#F59E0B"/>
      <g transform="rotate(8 100 100)">
        <rect x="55" y="55" width="90" height="90" rx="22" fill="#2FA7A2"/>
        <path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
        <path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç APP ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
// ├ö├Â├ç├ö├Â├ç├ö├Â├ç MERCATO LAVORI (montatore esterno) ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const LAVORI_DISPONIBILI = [
  {id:'L001',cliente:'Studio Arch. Bianchi',tipo:'Montaggio infissi PVC',vani:4,indirizzo:'Via Roma 45, Lecce',data:'2026-04-10',ore:6,budget:380,descrizione:'4 finestre PVC bianco 70x120, controtelaio gia posato. Accesso pianterreno.',urgente:false},
  {id:'L002',cliente:'Sig.ra Martini',tipo:'Sostituzione porta balcone',vani:1,indirizzo:'Corso Italia 12, Brindisi',data:'2026-04-08',ore:3,budget:200,descrizione:'Portafinestra alluminio 90x210. Cliente chiede di completare in giornata.',urgente:true},
  {id:'L003',cliente:'Cond. Verdi',tipo:'Montaggio zanzariere',vani:6,indirizzo:'Via Mazzini 8, Taranto',data:'2026-04-12',ore:4,budget:150,descrizione:'6 zanzariere plisse. Appartamenti al 2 e 3 piano senza ascensore.',urgente:false},
];



// ├ö├Â├ç├ö├Â├ç├ö├Â├ç DATI MERCATO (solo freelance) ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const AZIENDE_FL = [
  {id:'AZ1', nome:'Walter Cozza Serramenti', citta:'Cosenza', colore:'#28A0A0', avatar:'WC'},
  {id:'AZ2', nome:'Infissi Sud Srl', citta:'Brindisi', colore:'#3B7FE0', avatar:'IS'},
  {id:'AZ3', nome:'Serramenti Greco', citta:'Taranto', colore:'#D08008', avatar:'SG'},
];
const LAVORI_DISP = [
  {id:'LD-001',aziendaId:'AZ1',titolo:'Montaggio infissi PVC',cliente:'Studio Arch. Bianchi',data:'2026-04-10',ore:6,vani:4,budget:380,zona:'Lecce',urgente:false},
  {id:'LD-002',aziendaId:'AZ2',titolo:'Sostituzione porta balcone',cliente:'Sig.ra Martini',data:'2026-04-08',ore:3,vani:1,budget:200,zona:'Brindisi',urgente:true},
  {id:'LD-003',aziendaId:'AZ3',titolo:'Montaggio zanzariere',cliente:'Cond. Verdi',data:'2026-04-12',ore:4,vani:6,budget:150,zona:'Taranto',urgente:false},
  {id:'LD-004',aziendaId:'AZ1',titolo:'Ristrutturazione finestre villa',cliente:'Fam. Colombo',data:'2026-04-15',ore:8,vani:5,budget:620,zona:'Cosenza',urgente:false},
];
type Offerta = {id:string;lavId:string;importo:string;nota:string;stato:string;data:string};

function MercatoLavori() {
  const [sel,setSel] = useState<string|null>(null);
  const [offerte,setOfferte] = useState<Offerta[]>([]);
  const [importo,setImporto] = useState('');
  const [nota,setNota] = useState('');
  const lavSel = LAVORI_DISP.find(l=>l.id===sel);
  const offertaSel = offerte.find(o=>o.lavId===sel);
  const az = (id:string) => AZIENDE_FL.find(a=>a.id===id);

  const inviaOfferta = () => {
    if(!importo||!sel) return;
    setOfferte(prev=>[...prev.filter(o=>o.lavId!==sel),{id:'OFF-'+Date.now(),lavId:sel,importo,nota,stato:'inviata',data:new Date().toLocaleDateString('it-IT')}]);
    setImporto(''); setNota(''); setSel(null);
  };

  const cardStyle: React.CSSProperties = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};

  if(sel&&lavSel) {
    const a = az(lavSel.aziendaId);
    return(
      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
        <button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#28A0A0',fontWeight:700,fontSize:13,padding:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Indietro
        </button>
        <div style={cardStyle}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:16,color:'#0D1F1F'}}>{lavSel.titolo}</div>
            {lavSel.urgente&&<span style={{background:'#DC4444',color:'#fff',borderRadius:20,padding:'2px 10px',fontSize:10,fontWeight:700}}>URGENTE</span>}
          </div>
          <div style={{color:'#4A7070',fontSize:13,marginBottom:8}}>{lavSel.cliente}</div>
          <div style={{display:'flex',gap:10,fontSize:11,color:'#8BBCBC',marginBottom:12,flexWrap:'wrap'}}>
            <span>{lavSel.data.slice(5).replace('-','/')}</span>
            <span>{lavSel.ore}h</span>
            <span>{lavSel.vani} vani</span>
            <span>{lavSel.zona}</span>
          </div>
          <div style={{background:'#EEF8F8',borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,color:'#4A7070',fontWeight:600}}>Budget</span>
            <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:18,color:'#28A0A0'}}>€{lavSel.budget}</span>
          </div>
          {a&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,padding:'8px 10px',background:'rgba(40,160,160,0.07)',borderRadius:8}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:a.colore,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{a.avatar}</div>
            <div><div style={{fontSize:12,fontWeight:700,color:'#0D1F1F'}}>{a.nome}</div><div style={{fontSize:10,color:'#4A7070'}}>{a.citta}</div></div>
          </div>}
        </div>
        {offertaSel ? (
          <div style={{...cardStyle,borderColor:'#1A9E73'}}>
            <div style={{fontSize:13,color:'#4A7070'}}>Il tuo prezzo: <strong>€{offertaSel.importo}</strong></div>
            {offertaSel.nota&&<div style={{fontSize:12,color:'#4A7070',marginTop:4}}>{offertaSel.nota}</div>}
          </div>
        ):(
          <div style={cardStyle}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>La tua offerta</div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:12,color:'#4A7070',marginBottom:6,fontWeight:600}}>Il mio prezzo (€)</div>
              <input value={importo} onChange={e=>setImporto(e.target.value)} type="number" placeholder="es. 350"
                style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1.5px solid #C8E4E4',fontFamily:'"JetBrains Mono",monospace',fontSize:16,fontWeight:700,outline:'none',boxSizing:'border-box'}}/>
              {importo&&Number(importo)<lavSel.budget&&<div style={{fontSize:11,color:'#1A9E73',marginTop:4}}>Sotto il budget — buone chance</div>}
              {importo&&Number(importo)>lavSel.budget&&<div style={{fontSize:11,color:'#D08008',marginTop:4}}>Sopra il budget — motiva il prezzo</div>}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:'#4A7070',marginBottom:6,fontWeight:600}}>Note (opzionale)</div>
              <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="es. Disponibile anche sabato..." rows={2}
                style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #C8E4E4',fontSize:13,outline:'none',resize:'none',boxSizing:'border-box'}}/>
            </div>
            <button onClick={inviaOfferta} disabled={!importo}
              style={{background:importo?'#28A0A0':'#EEF8F8',color:importo?'#fff':'#8BBCBC',border:'none',borderRadius:10,padding:'12px 18px',fontWeight:700,fontSize:14,cursor:importo?'pointer':'default',width:'100%',boxShadow:importo?'0 4px 0 0 #156060':'none'}}>
              Invia offerta
            </button>
          </div>
        )}
      </div>
    );
  }

  return(
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>Lavori disponibili</div>
      <div style={{fontSize:12,color:'#4A7070',marginBottom:8}}>Valuta e fai la tua offerta</div>
      {LAVORI_DISP.map(lav=>{
        const a = az(lav.aziendaId);
        const off = offerte.find(o=>o.lavId===lav.id);
        return(
          <button key={lav.id} onClick={()=>setSel(lav.id)}
            style={{...cardStyle,textAlign:'left',cursor:'pointer',width:'100%',border:`1.5px solid ${lav.urgente?'#DC4444':'#C8E4E4'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:14,flex:1,paddingRight:8}}>{lav.titolo}</div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                {lav.urgente&&<span style={{background:'#DC4444',color:'#fff',borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700}}>URGENTE</span>}
                <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,color:'#28A0A0',fontSize:15}}>€{lav.budget}</span>
              </div>
            </div>
            <div style={{fontSize:12,color:'#4A7070',marginBottom:6}}>{lav.cliente} · {lav.data.slice(5).replace('-','/')}</div>
            <div style={{display:'flex',gap:10,fontSize:11,color:'#8BBCBC'}}>
              <span>{lav.vani} vani</span><span>{lav.ore}h</span><span>{lav.zona}</span>
            </div>
            {a&&<div style={{marginTop:6,fontSize:11,color:'#8BBCBC'}}>da {a.nome}</div>}
          </button>
        );
      })}
    </div>
  );
}


// ├ö├Â├ç├ö├Â├ç├ö├Â├ç DATI MOCK FREELANCE ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
let FL_AZIENDE: any[] = [
  {id:'AZ1', nome:'Walter Cozza Serramenti', citta:'Cosenza', avatar:'WC', colore:'#28A0A0'},
  {id:'AZ2', nome:'Infissi Sud Srl',          citta:'Brindisi', avatar:'IS', colore:'#3B7FE0'},
  {id:'AZ3', nome:'Serramenti Greco',         citta:'Taranto',  avatar:'SG', colore:'#D08008'},
];

// Tipo canale: 'erp' = da MASTRO ERP/Misure con tutto | 'email' = allegati liberi | 'interfaccia' = checklist fornitore
const FL_BACHECA = [
  {id:'B001', aziendaId:'AZ1', titolo:'Montaggio 120 infissi PVC', cliente:'Condominio Europa',
   indirizzo:'Via Roma 45, Cosenza', vani:12, budget:3200, scadenza:'2026-04-15',
   urgente:false, stato:'aperto', canale:'erp',
   report:'12 finestre PVC bianco RAL9016. Controtelaio già posato. Piano terra e primo piano. Accesso da cortile interno.',
   misure:[
     {vano:'Finestra Camera 1', dim:'120×140', tipo:'Finestra', mat:'PVC', note:'Davanzale esistente da rimuovere'},
     {vano:'Finestra Camera 2', dim:'120×140', tipo:'Finestra', mat:'PVC', note:''},
     {vano:'Porta balcone Soggiorno', dim:'90×210', tipo:'Portafinestra', mat:'PVC', note:'Doppia anta'},
   ],
   allegati:[
     {tipo:'pdf', nome:'Rilievo_COM047_Condominio_Europa.pdf', src:'#', tag:'misure'},
     {tipo:'pdf', nome:'Preventivo_firmato.pdf', src:'#', tag:'contratto'},
     {tipo:'img', nome:'foto_vano_01.jpg', src:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', tag:'foto'},
     {tipo:'img', nome:'foto_vano_02.jpg', src:'https://images.unsplash.com/photo-1601084881623-cdf9a8ea242c?w=400', tag:'foto'},
     {tipo:'dwg', nome:'DisegnoTecnico_COM047.svg', src:'#', tag:'disegno'},
   ],
   checklist_richiesta:[],
   chat:[] as any[],
  },
  {id:'B002', aziendaId:'AZ2', titolo:'Sostituzione porta balcone urgente', cliente:'Sig.ra Martini',
   indirizzo:'Via Mazzini 5, Brindisi', vani:1, budget:200, scadenza:'2026-04-08',
   urgente:true, stato:'aperto', canale:'email',
   report:'Porta balcone 90×210 alluminio. Cliente disponibile solo mattina. Telaio esistente da rimuovere con attenzione (parete cartongesso). Accesso 3° piano senza ascensore.',
   misure:[
     {vano:'Porta balcone principale', dim:'90×210', tipo:'Portafinestra', mat:'Alluminio', note:'Parete cartongesso — massima attenzione'},
   ],
   allegati:[
     {tipo:'img', nome:'foto_porta_fronte.jpg', src:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', tag:'foto'},
     {tipo:'pdf', nome:'email_commessa.pdf', src:'#', tag:'email'},
   ],
   checklist_richiesta:['Foto ante rimozione','Misura controtelaio esistente','Foto parete dopo rimozione'],
   chat:[] as any[],
  },
  {id:'B003', aziendaId:'AZ3', titolo:'Montaggio zanzariere su misura', cliente:'Cond. Verdi',
   indirizzo:'Viale Kennedy 12, Taranto', vani:6, budget:150, scadenza:'2026-04-12',
   urgente:false, stato:'offerta_inviata', canale:'interfaccia',
   report:'6 finestre standard piano 2° e 3°. Zanzariere plissettate. Misure già prese dal serramentista. Accessibilità: scale strette, no ascensore.',
   misure:[
     {vano:'Finestra A1', dim:'80×120', tipo:'Finestra', mat:'PVC', note:''},
     {vano:'Finestra A2', dim:'80×120', tipo:'Finestra', mat:'PVC', note:''},
     {vano:'Finestra B1', dim:'100×140', tipo:'Finestra', mat:'PVC', note:'Anta unica'},
     {vano:'Finestra B2', dim:'100×140', tipo:'Finestra', mat:'PVC', note:'Anta unica'},
     {vano:'Porta balcone C1', dim:'90×210', tipo:'Portafinestra', mat:'PVC', note:''},
     {vano:'Porta balcone C2', dim:'90×210', tipo:'Portafinestra', mat:'PVC', note:''},
   ],
   allegati:[
     {tipo:'pdf', nome:'Foglio_misure_Cond_Verdi.pdf', src:'#', tag:'misure'},
     {tipo:'img', nome:'foto_prospetto.jpg', src:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400', tag:'foto'},
   ],
   checklist_richiesta:['Scheda misure firmata','Foto ante posa','Foto post posa con cliente','DDT materiale'],
   chat:[
     {id:1, autore:'Serramenti Greco', avatar:'SG', testo:'Le misure sono già tutte nel PDF. Hai bisogno di altro?', ora:'10:30', proprio:false},
     {id:2, autore:'Marco Vito', avatar:'MV', testo:'Perfetto, confermo disponibilità per il 12. Porto zanzariere plissé mod. LUX.', ora:'10:45', proprio:true},
   ] as any[],
  },
];

let FL_COMMESSE: any[] = [
  {id:'FC-001', aziendaId:'AZ1', titolo:'Montaggio villa Colombo', cliente:'Fam. Colombo',
   vani:5, importo:1800, incassato:900, stato:'in_corso', avanzamento:60, data:'2026-04-01'},
  {id:'FC-002', aziendaId:'AZ2', titolo:'Ristrutturazione uffici', cliente:'Studio Bianchi',
   vani:8, importo:2400, incassato:2400, stato:'completato', avanzamento:100, data:'2026-03-15'},
  {id:'FC-003', aziendaId:'AZ3', titolo:'Finestre condominio', cliente:'Cond. Rosa',
   vani:10, importo:3100, incassato:0, stato:'da_fare', avanzamento:0, data:'2026-04-20'},
];

const FL_FATTURE = [
  {id:'FT-001', commessaId:'FC-001', aziendaId:'AZ1', tipo:'acconto', importo:900, data:'2026-04-02', stato:'pagata'},
  {id:'FT-002', commessaId:'FC-002', aziendaId:'AZ2', tipo:'saldo',   importo:2400, data:'2026-03-28', stato:'pagata'},
  {id:'FT-003', commessaId:'FC-001', aziendaId:'AZ1', tipo:'saldo',   importo:900,  data:'2026-04-30', stato:'da_emettere'},
  {id:'FT-004', commessaId:'FC-003', aziendaId:'AZ3', tipo:'acconto', importo:1550, data:'2026-04-21', stato:'da_emettere'},
];

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç SPESE PER COMMESSA ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const FL_SPESE_INIT = [
  {id:'SP-001',commessaId:'FC-001',desc:'Silicone neutro bianco',importo:28,cat:'materiali',data:'2026-04-02'},
  {id:'SP-002',commessaId:'FC-001',desc:'Carburante A/R',importo:45,cat:'trasporto',data:'2026-04-01'},
  {id:'SP-003',commessaId:'FC-002',desc:'Fresa per controtelaio',importo:12,cat:'attrezzatura',data:'2026-03-20'},
];

const FL_ORDINI_INIT = [
  {id:'ORD-001',commessaId:'FC-001',aziendaId:'AZ-001',tipo:'commessa',desc:'Maniglie Hoppe cromo x4',qty:4,um:'pz',importo:72,stato:'confermato',data:'2026-04-01',fornitore:'Hoppe Italia',note:''},
  {id:'ORD-002',commessaId:'FC-001',aziendaId:'AZ-001',tipo:'commessa',desc:'Guarnizioni EPDM 8mm 20mt',qty:20,um:'mt',importo:38,stato:'inviato',data:'2026-04-02',fornitore:'Wuerth',note:''},
  {id:'ORD-003',commessaId:'FC-002',aziendaId:'AZ-002',tipo:'commessa',desc:'Coprifili alluminio 40mm x6',qty:6,um:'pz',importo:54,stato:'bozza',data:'2026-04-05',fornitore:'',note:'Verificare colore'},
  {id:'ORD-004',commessaId:null,aziendaId:null,tipo:'personale',desc:'Silicone neutro bianco 12 tubi',qty:12,um:'pz',importo:96,stato:'confermato',data:'2026-04-03',fornitore:'Wuerth',note:'Stock magazzino'},
];

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç BACHECA FREELANCE ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const CANALE_BADGE: Record<string,{label:string;color:string;bg:string}> = {
  erp:         {label:'MASTRO ERP',  color:'#28A0A0', bg:'rgba(40,160,160,0.12)'},
  email:       {label:'Via Email',   color:'#D08008', bg:'rgba(208,128,8,0.12)'},
  interfaccia: {label:'Interfaccia', color:'#3B7FE0', bg:'rgba(59,127,224,0.12)'},
};

function IconFile({tipo}:{tipo:string}) {
  const col = tipo==='img'?'#28A0A0':tipo==='pdf'?'#DC4444':tipo==='dwg'?'#3B7FE0':'#D08008';
  return (
    <div style={{width:36,height:36,borderRadius:8,background:`${col}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
        {tipo==='img'?<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>
        :tipo==='dwg'?<><polyline points="14 2 14 8 20 8"/><path d="M20 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10l6 6v12a2 2 0 0 1-2 2z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></>
        :<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
      </svg>
    </div>
  );
}

function DettaglioLavoro({lavoro, onBack, offerta, setOfferta, nota, setNota, onInviaOfferta, offInviata, chatLog, onInviaChat}: {
  lavoro:any; onBack:()=>void; offerta:string; setOfferta:(v:string)=>void;
  nota:string; setNota:(v:string)=>void; onInviaOfferta:()=>void; offInviata:any;
  chatLog:any[]; onInviaChat:(msg:any)=>void;
}) {
  const [tab, setTab] = React.useState('info');
  const [chatMsg, setChatMsg] = React.useState('');
  const [lightbox, setLightbox] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState('');
  const [recSecs, setRecSecs] = React.useState(0);
  const mediaRef = React.useRef<MediaRecorder|null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imgInputRef = React.useRef<HTMLInputElement>(null);
  const az = FL_AZIENDE.find(a=>a.id===lavoro.aziendaId);
  const badge = CANALE_BADGE[lavoro.canale] || CANALE_BADGE.email;
  const allChat = [...(lavoro.chat||[]), ...chatLog];
  const foto = (lavoro.allegati||[]).filter((x:any)=>x.tipo==='img');
  const docs = (lavoro.allegati||[]).filter((x:any)=>x.tipo!=='img');
  const nMisure = (lavoro.misure||[]).length;
  const nAllegati = (lavoro.allegati||[]).length;
  const nChat = allChat.length;
  const C: React.CSSProperties = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:`1.5px solid ${DS.border}`,boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};

  const sendChat = () => {
    if(audioUrl) {
      onInviaChat({testo:'', tipo:'audio', audioUrl, durataAudio:recSecs});
      setAudioUrl(''); setRecSecs(0);
      return;
    }
    if(!chatMsg.trim()) return;
    onInviaChat({testo:chatMsg.trim(), tipo:'testo'});
    setChatMsg('');
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      mr.ondataavailable = (e:any) => { if(e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {type:'audio/webm'});
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t:any)=>t.stop());
        clearInterval(timerRef.current);
      };
      mr.start();
      setIsRecording(true); setRecSecs(0);
      timerRef.current = setInterval(()=>setRecSecs((s:number)=>s+1), 1000);
    } catch(e) { alert('Microfono non disponibile'); }
  };

  const stopRec = () => {
    if(mediaRef.current) mediaRef.current.stop();
    setIsRecording(false);
  };

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>, tipo:string) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    onInviaChat({testo:'', tipo, fileUrl:url, fileName:file.name, fileSize:Math.round(file.size/1024)+'kb'});
    e.target.value = '';
  };

  const fmtSecs = (s:number) => Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0');

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* TOPBAR */}
      <div style={{background:DS.topbar,padding:'10px 16px',flexShrink:0}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:DS.teal,fontWeight:700,fontSize:13,padding:0,marginBottom:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Bacheca
        </button>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{flex:1,paddingRight:8}}>
            <div style={{fontWeight:800,fontSize:15,color:'#fff',marginBottom:2}}>{lavoro.titolo}</div>
            <div style={{fontSize:12,color:DS.textLight}}>{lavoro.cliente} · {lavoro.indirizzo}</div>
          </div>
          {lavoro.urgente&&<span style={{background:DS.red,color:'#fff',borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700}}>URGENTE</span>}
        </div>
        <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap',alignItems:'center'}}>
          <span style={{background:badge.bg,color:badge.color,borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700}}>{badge.label}</span>
          <span style={{background:'rgba(255,255,255,0.08)',color:DS.textLight,borderRadius:20,padding:'3px 10px',fontSize:10}}>{lavoro.vani} vani</span>
          <span style={{background:'rgba(255,255,255,0.08)',color:DS.textLight,borderRadius:20,padding:'3px 10px',fontSize:10}}>Scad. {lavoro.scadenza.slice(5).replace('-','/')}</span>
          <span style={{marginLeft:'auto',fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.teal}}>€{lavoro.budget}</span>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{background:DS.topbar,display:'flex',borderBottom:'1px solid rgba(40,160,160,0.2)',flexShrink:0}}>
        {[
          {id:'info',     label:'Info'},
          {id:'misure',   label:'Misure ('+nMisure+')'},
          {id:'allegati', label:'Allegati ('+nAllegati+')'},
          {id:'chat',     label:nChat>0?'Chat ('+nChat+')':'Chat'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,background:'none',border:'none',padding:'10px 4px',cursor:'pointer',
              color:tab===t.id?DS.teal:DS.textLight,fontSize:10,fontWeight:700,fontFamily:DS.ui,
              borderBottom:tab===t.id?'2px solid '+DS.teal:'2px solid transparent'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>

        {tab==='info'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {az&&(
              <div style={C}>
                <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Azienda richiedente</div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:az.colore,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0}}>{az.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:DS.text}}>{az.nome}</div>
                    <div style={{fontSize:12,color:DS.textMid}}>{az.citta}</div>
                  </div>
                  <button onClick={()=>setTab('chat')} style={{background:DS.teal,border:'none',borderRadius:8,padding:'8px 12px',cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.tealDark}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>
              </div>
            )}
            <div style={C}>
              <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Report tecnico</div>
              <div style={{fontSize:13,color:DS.textMid,lineHeight:1.7}}>{lavoro.report}</div>
            </div>
            {lavoro.checklist_richiesta&&lavoro.checklist_richiesta.length>0&&(
              <div style={{...C,borderColor:DS.teal}}>
                <div style={{fontSize:11,color:DS.teal,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Documenti richiesti</div>
                {lavoro.checklist_richiesta.map((item:string,i:number)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:i<lavoro.checklist_richiesta.length-1?'1px solid '+DS.border:'none'}}>
                    <div style={{width:18,height:18,borderRadius:4,border:'2px solid '+DS.border,flexShrink:0}}/>
                    <span style={{fontSize:13,color:DS.text}}>{item}</span>
                  </div>
                ))}
              </div>
            )}
            {foto.length>0&&(
              <div style={C}>
                <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Foto ({foto.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {foto.slice(0,4).map((f:any,i:number)=>(
                    <button key={i} onClick={()=>setLightbox(f.src)} style={{border:'none',padding:0,cursor:'pointer',borderRadius:8,overflow:'hidden',aspectRatio:'4/3',background:DS.tealLight,display:'block'}}>
                      <img src={f.src} alt={f.nome} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {offInviata?(
              <div style={{...C,borderColor:DS.green}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:12,color:DS.textMid,marginBottom:2}}>Offerta inviata</div>
                    <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:22,color:DS.green}}>€{offInviata.importo}</div>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                {offInviata.nota&&<div style={{fontSize:12,color:DS.textMid,marginTop:8,padding:'8px 10px',background:DS.tealLight,borderRadius:8}}>{offInviata.nota}</div>}
              </div>
            ):(
              <div style={C}>
                <div style={{fontWeight:700,fontSize:14,color:DS.text,marginBottom:12}}>La tua offerta</div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,color:DS.textMid,marginBottom:6,fontWeight:600}}>Prezzo (€)</div>
                  <input value={offerta} onChange={e=>setOfferta(e.target.value)} type="number" placeholder="es. 2800"
                    style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1.5px solid '+DS.border,fontFamily:DS.mono,fontSize:18,fontWeight:700,color:DS.text,outline:'none',boxSizing:'border-box'}}/>
                  {offerta&&Number(offerta)<lavoro.budget&&<div style={{fontSize:11,color:DS.green,marginTop:4,fontWeight:600}}>Sotto budget — buone chance</div>}
                  {offerta&&Number(offerta)>lavoro.budget&&<div style={{fontSize:11,color:DS.amber,marginTop:4,fontWeight:600}}>Sopra budget — motiva bene</div>}
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:DS.textMid,marginBottom:6,fontWeight:600}}>Note</div>
                  <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Disponibilità, attrezzatura, esperienza..." rows={3}
                    style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid '+DS.border,fontSize:13,color:DS.text,outline:'none',resize:'none',boxSizing:'border-box',fontFamily:DS.ui}}/>
                </div>
                <button onClick={onInviaOfferta} disabled={!offerta}
                  style={{background:offerta?DS.teal:DS.tealLight,color:offerta?'#fff':DS.textLight,border:'none',borderRadius:10,padding:'13px',fontWeight:700,fontSize:15,cursor:offerta?'pointer':'default',width:'100%',boxShadow:offerta?'0 5px 0 0 '+DS.tealDark:'none',fontFamily:DS.ui}}>
                  Invia offerta
                </button>
              </div>
            )}
          </div>
        )}

        {tab==='misure'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{...C,background:'rgba(40,160,160,0.04)',borderColor:DS.teal}}>
              <div style={{fontSize:11,color:DS.teal,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Rilievo — {nMisure} vani</div>
              <div style={{fontSize:12,color:DS.textMid}}>{lavoro.canale==='erp'?'Da MASTRO Misure — verificato':lavoro.canale==='email'?'Inviato via email':'Da interfaccia azienda'}</div>
            </div>
            {(lavoro.misure||[]).map((m:any,i:number)=>(
              <div key={i} style={C}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:DS.text}}>{m.vano}</div>
                    <div style={{fontSize:11,color:DS.textMid,marginTop:1}}>{m.tipo} · {m.mat}</div>
                  </div>
                  <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:15,color:DS.teal,background:DS.tealLight,padding:'4px 10px',borderRadius:8}}>{m.dim}</div>
                </div>
                {m.note&&(
                  <div style={{display:'flex',gap:6,padding:'6px 8px',background:'rgba(208,128,8,0.08)',borderRadius:8}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.amber} strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{fontSize:12,color:DS.amber,fontWeight:600}}>{m.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab==='allegati'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {foto.length>0&&(
              <div>
                <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Foto ({foto.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {foto.map((f:any,i:number)=>(
                    <button key={i} onClick={()=>setLightbox(f.src)} style={{border:'none',padding:0,cursor:'pointer',borderRadius:10,overflow:'hidden',aspectRatio:'4/3',background:DS.tealLight,display:'block'}}>
                      <img src={f.src} alt={f.nome} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {docs.length>0&&(
              <div>
                <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Documenti ({docs.length})</div>
                {docs.map((d:any,i:number)=>(
                  <div key={i} style={{...C,display:'flex',alignItems:'center',gap:10,padding:10,marginBottom:6}}>
                    <IconFile tipo={d.tipo}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:DS.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.nome}</div>
                      <div style={{fontSize:10,color:DS.textLight,textTransform:'uppercase',marginTop:2}}>{d.tag}</div>
                    </div>
                    <button style={{background:DS.tealLight,border:'1.5px solid '+DS.border,borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:11,color:DS.teal,fontWeight:700}}>Apri</button>
                  </div>
                ))}
              </div>
            )}
            <button style={{background:'transparent',border:'2px dashed '+DS.border,borderRadius:14,padding:14,display:'flex',alignItems:'center',gap:10,cursor:'pointer',width:'100%',textAlign:'left'}}>
              <div style={{width:36,height:36,borderRadius:8,background:DS.tealLight,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:DS.teal}}>Carica documento / foto</div>
                <div style={{fontSize:11,color:DS.textLight}}>PDF, JPG, PNG, DWG</div>
              </div>
            </button>
          </div>
        )}

        {tab==='chat'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <input ref={imgInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={(e:any)=>handleFile(e,'img')}/>
            <input ref={fileInputRef} type="file" style={{display:'none'}} onChange={(e:any)=>handleFile(e,'file')}/>

            {allChat.length===0&&(
              <div style={{textAlign:'center',padding:32,color:DS.textLight,fontSize:13}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DS.border} strokeWidth="1.5" strokeLinecap="round" style={{display:'block',margin:'0 auto 8px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Nessun messaggio
              </div>
            )}

            {allChat.map((m:any,mi:number)=>(
              <div key={m.id||mi} style={{display:'flex',justifyContent:m.proprio?'flex-end':'flex-start',gap:8,alignItems:'flex-end'}}>
                {!m.proprio&&<div style={{width:28,height:28,borderRadius:'50%',background:az?az.colore:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.avatar||'?'}</div>}
                <div style={{maxWidth:'78%'}}>
                  {!m.proprio&&<div style={{fontSize:10,color:DS.textLight,marginBottom:2,fontWeight:600}}>{m.autore}</div>}
                  <div style={{background:m.proprio?DS.teal:'#fff',borderRadius:m.proprio?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:m.tipo==='img'?'4px':'9px 13px',border:m.proprio?'none':'1.5px solid '+DS.border,overflow:'hidden'}}>
                    {m.tipo==='img'&&m.fileUrl&&(
                      <button onClick={()=>setLightbox(m.fileUrl)} style={{border:'none',padding:0,cursor:'pointer',display:'block'}}>
                        <img src={m.fileUrl} alt={m.fileName||'foto'} style={{maxWidth:220,maxHeight:160,borderRadius:8,display:'block',objectFit:'cover'}}/>
                      </button>
                    )}
                    {m.tipo==='audio'&&m.audioUrl&&(
                      <div style={{display:'flex',alignItems:'center',gap:8,padding:'2px 0'}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={m.proprio?'#fff':DS.teal} strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        <audio src={m.audioUrl} controls style={{height:28,width:150}}/>
                        <span style={{fontSize:10,color:m.proprio?'rgba(255,255,255,0.7)':DS.textLight}}>{fmtSecs(m.durataAudio||0)}</span>
                      </div>
                    )}
                    {m.tipo==='file'&&(
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={m.proprio?'#fff':DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:m.proprio?'#fff':DS.text}}>{m.fileName}</div>
                          <div style={{fontSize:10,color:m.proprio?'rgba(255,255,255,0.6)':DS.textLight}}>{m.fileSize}</div>
                        </div>
                      </div>
                    )}
                    {(!m.tipo||m.tipo==='testo')&&m.testo&&(
                      <div style={{fontSize:13,color:m.proprio?'#fff':DS.text,lineHeight:1.5}}>{m.testo}</div>
                    )}
                    <div style={{fontSize:10,color:m.proprio?'rgba(255,255,255,0.5)':DS.textLight,marginTop:3,textAlign:'right'}}>{m.ora}</div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{borderTop:'1px solid '+DS.border,paddingTop:10,display:'flex',flexDirection:'column',gap:8}}>
              {isRecording&&(
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'rgba(220,68,68,0.08)',borderRadius:10,border:'1.5px solid rgba(220,68,68,0.3)'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:DS.red}}/>
                  <span style={{fontSize:13,color:DS.red,fontWeight:600,flex:1}}>Registrazione {fmtSecs(recSecs)}</span>
                  <button onClick={stopRec} style={{background:DS.red,color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:700,fontSize:12}}>Stop</button>
                </div>
              )}
              {audioUrl&&!isRecording&&(
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:DS.tealLight,borderRadius:10,border:'1.5px solid '+DS.border}}>
                  <audio src={audioUrl} controls style={{height:28,flex:1}}/>
                  <span style={{fontSize:11,color:DS.textMid,whiteSpace:'nowrap'}}>{fmtSecs(recSecs)}</span>
                  <button onClick={()=>{setAudioUrl('');setRecSecs(0);}} style={{background:'none',border:'none',cursor:'pointer',color:DS.red,fontSize:18,padding:'0 4px',lineHeight:1}}>x</button>
                </div>
              )}
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button onClick={()=>imgInputRef.current&&imgInputRef.current.click()} style={{background:DS.tealLight,border:'1.5px solid '+DS.border,borderRadius:10,padding:'10px',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </button>
                <button onClick={()=>fileInputRef.current&&fileInputRef.current.click()} style={{background:DS.tealLight,border:'1.5px solid '+DS.border,borderRadius:10,padding:'10px',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                {!audioUrl&&(
                  <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey)sendChat();}}
                    placeholder="Scrivi all'azienda..."
                    style={{flex:1,padding:'11px 14px',border:'1.5px solid '+DS.border,borderRadius:10,fontSize:13,fontFamily:DS.ui,outline:'none'}}/>
                )}
                {audioUrl&&<div style={{flex:1}}/>}
                {!chatMsg.trim()&&!audioUrl&&!isRecording&&(
                  <button onClick={startRec} style={{background:DS.tealLight,border:'1.5px solid '+DS.border,borderRadius:10,padding:'10px',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  </button>
                )}
                {(chatMsg.trim()||audioUrl)&&(
                  <button onClick={sendChat} style={{background:DS.teal,color:'#fff',border:'none',borderRadius:10,padding:'11px 14px',cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.tealDark,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                )}
              </div>
              {az&&(
                <a href={'mailto:info@'+az.nome.toLowerCase().replace(/\s+/g,'')+'.it?subject=Re: '+encodeURIComponent(lavoro.titolo)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',background:DS.tealLight,borderRadius:10,border:'1.5px solid '+DS.border,textDecoration:'none',marginTop:2}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span style={{fontSize:12,color:DS.teal,fontWeight:600}}>Invia email a {az.nome}</span>
                </a>
              )}
            </div>
          </div>
        )}

      </div>

      {lightbox&&(
        <div onClick={()=>setLightbox('')} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <button onClick={()=>setLightbox('')} style={{position:'absolute',top:16,right:16,background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:36,height:36,cursor:'pointer',color:'#fff',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          <img src={lightbox} alt="" style={{maxWidth:'100%',maxHeight:'85vh',borderRadius:12,objectFit:'contain'}}/>
        </div>
      )}
    </div>
  );
}

function BachecaFreelance() {
  const [sel, setSel] = React.useState('');
  const [offerta, setOfferta] = React.useState('');
  const [nota, setNota] = React.useState('');
  const [offerte, setOfferte] = React.useState<any>({});
  const [chatLogs, setChatLogs] = React.useState<any>({});

  const lavoro = FL_BACHECA.find(b=>b.id===sel);

  const inviaOfferta = () => {
    if(!offerta||!sel) return;
    setOfferte((p:any)=>({...p,[sel]:{importo:offerta,nota}}));
    setOfferta(''); setNota('');
  };

  const inviaChat = (msg:any) => {
    if(!msg||!sel) return;
    const m = typeof msg==='string'
      ? {id:Date.now(),autore:'Marco Vito',avatar:'MV',testo:msg,tipo:'testo',ora:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}),proprio:true}
      : {...msg,id:Date.now(),autore:'Marco Vito',avatar:'MV',proprio:true,ora:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})};
    setChatLogs((p:any)=>({...p,[sel]:[...(p[sel]||[]),m]}));
  };

  if(sel&&lavoro) {
    return (
      <DettaglioLavoro
        lavoro={lavoro}
        onBack={()=>setSel('')}
        offerta={offerta}
        setOfferta={setOfferta}
        nota={nota}
        setNota={setNota}
        onInviaOfferta={inviaOfferta}
        offInviata={offerte[sel]}
        chatLog={chatLogs[sel]||[]}
        onInviaChat={inviaChat}
      />
    );
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{fontWeight:700,fontSize:15,color:DS.text,marginBottom:2}}>Bacheca lavori</div>
      <div style={{fontSize:12,color:DS.textMid,marginBottom:4}}>Lavori proposti dalle aziende</div>
      {FL_BACHECA.map(lav=>{
        const a = FL_AZIENDE.find(x=>x.id===lav.aziendaId);
        const badge = CANALE_BADGE[lav.canale]||CANALE_BADGE.email;
        const offInviata = offerte[lav.id];
        return (
          <button key={lav.id} onClick={()=>setSel(lav.id)}
            style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid '+(lav.urgente?DS.red:DS.border),boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14,textAlign:'left',cursor:'pointer',width:'100%',display:'block'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{fontWeight:800,fontSize:14,color:DS.text,flex:1,paddingRight:8,lineHeight:1.3}}>{lav.titolo}</div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                {lav.urgente&&<span style={{background:DS.red,color:'#fff',borderRadius:20,padding:'1px 7px',fontSize:9,fontWeight:700}}>URGENTE</span>}
                <span style={{fontFamily:DS.mono,fontWeight:800,color:DS.teal,fontSize:16}}>€{lav.budget}</span>
              </div>
            </div>
            <div style={{fontSize:12,color:DS.textMid,marginBottom:6}}>{lav.cliente} · {lav.scadenza.slice(5).replace('-','/')}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{background:badge.bg,color:badge.color,borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700}}>{badge.label}</span>
              <span style={{background:DS.tealLight,color:DS.teal,borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:600}}>{lav.vani} vani</span>
              {lav.allegati&&lav.allegati.length>0&&<span style={{background:DS.tealLight,color:DS.teal,borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:600}}>{lav.allegati.length} allegati</span>}
              {offInviata&&<span style={{background:'rgba(26,158,115,0.1)',color:DS.green,borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700}}>Offerta €{offInviata.importo}</span>}
            </div>
            {a&&<div style={{marginTop:8,fontSize:11,color:DS.textLight}}>da {a.nome} · {a.citta}</div>}
          </button>
        );
      })}
    </div>
  );
}

const PIANO_ATTUALE = 'START';
const PIANI_ORDER = ['BASE','START','PRO','TITAN'];
function PianoLock({minPiano,children,label}:{minPiano:'START'|'PRO'|'TITAN';children:React.ReactNode;label?:string}) {
  const ok = PIANI_ORDER.indexOf(PIANO_ATTUALE) >= PIANI_ORDER.indexOf(minPiano);
  if (ok) return <>{children}</>;
  return (
    <div style={{position:'relative',userSelect:'none'}}>
      <div style={{filter:'blur(2px)',pointerEvents:'none',opacity:0.5}}>{children}</div>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(13,31,31,0.8)',borderRadius:12}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EEF8F8" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <div style={{color:'#EEF8F8',fontWeight:800,fontSize:11,marginTop:6}}>{label||'Piano '+minPiano}</div>
        <div style={{color:'rgba(238,248,248,0.6)',fontSize:9,marginTop:2}}>Upgrade</div>
      </div>
    </div>
  );
}

function CommesseFreelance() {
  const [selId, setSelId] = React.useState<string|null>(null);
  const [tab, setTab] = React.useState<'info'|'spese'|'checklist'>('info');
  const [spese, setSpese] = React.useState(FL_SPESE_INIT);
  const [nuovaSpesa, setNuovaSpesa] = React.useState({desc:'',importo:'',cat:'materiali'});
  const [addSpesa, setAddSpesa] = React.useState(false);
  const [importXml, setImportXml] = React.useState<{step:'idle'|'preview'|'saving'|'done';data:any}>({step:'idle',data:null});
  const xmlRef = React.useRef<HTMLInputElement>(null);

  // Parser XML Opera → vani MASTRO
  const parseOperaXml = (xmlStr: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const job = doc.querySelector('job');
    if (!job) throw new Error('Nessun job trovato nel file XML');
    const getT = (el: Element|null, tag: string) => el?.querySelector(tag)?.textContent?.trim() || '';
    const jobName = getT(job, 'job_name');
    const barcode = getT(job, 'job_barcode_id');
    const customer = job.querySelector('job_customer');
    const clienteNome = getT(customer, 'cst_name');
    const clienteAddr = getT(customer, 'cst_address');
    const clienteCity = getT(customer, 'cst_city');
    const prezzo = parseFloat(getT(job, 'job_last_saved_price')) || 0;
    const components = Array.from(job.querySelectorAll('job_components > component'));
    const vani = components.map((cmp, idx) => {
      const pos = getT(cmp, 'cmp_position') || String(idx+1);
      const desc = getT(cmp, 'cmp_description') || getT(cmp, 'cmp_description_base') || 'Vano ' + pos;
      const series = getT(cmp, 'cmp_series');
      const w = parseInt(getT(cmp, 'cmp_width')) || 0;
      const h = parseInt(getT(cmp, 'cmp_height')) || 0;
      const vetro = getT(cmp, 'cmp_panes');
      const qty = parseInt(getT(cmp, 'cmp_quantity')) || 1;
      const prezzo_cmp = parseFloat(getT(cmp, 'cmp_price')) || 0;
      const allColors = Array.from(cmp.querySelectorAll('color'));
      const colInt = allColors.find(c=>c.querySelector('col_type')?.textContent?.trim()==='internal')?.querySelector('col_name')?.textContent?.trim() || '';
      const colExt = allColors.find(c=>c.querySelector('col_type')?.textContent?.trim()==='external')?.querySelector('col_name')?.textContent?.trim() || '';
      return { pos, desc, series, w, h, vetro, qty, prezzo: prezzo_cmp, colInt, colExt };
    });
    return { jobName, barcode, clienteNome, clienteAddr, clienteCity, prezzo, vani };
  };

  const onXmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = parseOperaXml(ev.target?.result as string);
        setImportXml({ step: 'preview', data });
      } catch(err: any) {
        alert('Errore parsing XML: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const salvaImportazione = async () => {
    if (!importXml.data) return;
    setImportXml(p => ({ ...p, step: 'saving' }));
    const d = importXml.data;
    const nuova = {
      azienda_id: AZIENDA_ID,
      titolo: d.jobName || 'Commessa Opera ' + d.barcode,
      cliente: d.clienteNome,
      indirizzo: [d.clienteAddr, d.clienteCity].filter(Boolean).join(', '),
      importo: d.prezzo,
      n_vani: d.vani.length,
      sistema: d.vani[0]?.series || '',
      fonte: 'opera_xml',
      barcode_opera: d.barcode,
      stato: 'da_fare',
      vani_json: JSON.stringify(d.vani),
    };
    await sbInsert('commesse', nuova);
    setImportXml({ step: 'done', data: d });
    setTimeout(() => setImportXml({ step: 'idle', data: null }), 2500);
  };

  const sel = FL_COMMESSE.find(c=>c.id===selId);
  const az = (id:string) => FL_AZIENDE.find(a=>a.id===id);
  const totale = FL_COMMESSE.reduce((s,c)=>s+c.importo,0);
  const incassato = FL_COMMESSE.reduce((s,c)=>s+c.incassato,0);
  const c: React.CSSProperties = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};

  const aggiungiSpesa = () => {
    if(!nuovaSpesa.desc||!nuovaSpesa.importo||!selId) return;
    setSpese(p=>[...p,{id:'SP-'+Date.now(),commessaId:selId,desc:nuovaSpesa.desc,importo:Number(nuovaSpesa.importo),cat:nuovaSpesa.cat,data:new Date().toLocaleDateString('it-IT')}]);
    setNuovaSpesa({desc:'',importo:'',cat:'materiali'});
    setAddSpesa(false);
  };

  // DETTAGLIO COMMESSA
  if(sel) {
    const a = az(sel.aziendaId);
    const speseComm = spese.filter(s=>s.commessaId===sel.id);
    const totSpese = speseComm.reduce((s,x)=>s+x.importo,0);
    const margine = sel.incassato - totSpese;
    const TABS = [{id:'info',label:'Info'},{id:'spese',label:`Spese (€${totSpese})`},{id:'checklist',label:'Checklist'}];
    const CHECKLIST = ['Verifica misure','Rimozione infisso esistente','Preparazione controtelaio','Installazione','Sigillatura','Test apertura/chiusura','Foto fine lavoro'];
    const CATS = ['materiali','trasporto','attrezzatura','vitto','altro'];

    return(
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'12px 16px',background:'#fff',borderBottom:'1px solid #C8E4E4'}}>
          <button onClick={()=>{setSelId(null);setTab('info');}} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#28A0A0',fontWeight:700,fontSize:13,padding:0,marginBottom:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Commesse
          </button>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:'#0D1F1F'}}>{sel.titolo}</div>
              <div style={{fontSize:12,color:'#4A7070',marginTop:2}}>{sel.cliente} · {a?.nome}</div>
            </div>
            <span style={{
              background:sel.stato==='completato'?'rgba(26,158,115,0.1)':sel.stato==='in_corso'?'rgba(40,160,160,0.1)':'rgba(208,128,8,0.1)',
              color:sel.stato==='completato'?'#1A9E73':sel.stato==='in_corso'?'#28A0A0':'#D08008',
              borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700
            }}>{sel.stato==='completato'?'Completato':sel.stato==='in_corso'?'In corso':'Da fare'}</span>
          </div>
          {/* Barra avanzamento */}
          <div style={{background:'#EEF8F8',borderRadius:6,height:8,marginTop:10,overflow:'hidden'}}>
            <div style={{background:'#28A0A0',height:'100%',width:`${sel.avanzamento}%`,borderRadius:6}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginTop:4}}>
            <span style={{color:'#4A7070'}}>{sel.avanzamento}% completato</span>
            <span style={{color:'#28A0A0',fontWeight:700,fontFamily:'"JetBrains Mono",monospace'}}>€{sel.importo.toLocaleString('it-IT')}</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{display:'flex',background:'#0D1F1F',flexShrink:0}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              style={{flex:1,background:'none',border:'none',padding:'10px 4px',cursor:'pointer',color:tab===t.id?'#28A0A0':'#8BBCBC',fontSize:11,fontWeight:700,borderBottom:tab===t.id?'2px solid #28A0A0':'2px solid transparent'}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>

          {/* TAB INFO */}
          {tab==='info'&&(<>
            {/* KPI margine */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {[
                {label:'Importo',val:`€${sel.importo.toLocaleString('it-IT')}`,color:'#28A0A0'},
                {label:'Incassato',val:`€${sel.incassato.toLocaleString('it-IT')}`,color:'#1A9E73'},
                {label:'Margine',val:`€${margine.toLocaleString('it-IT')}`,color:margine>0?'#1A9E73':'#DC4444'},
              ].map(k=>(
                <div key={k.label} style={{...c,padding:10,textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#4A7070',marginBottom:4}}>{k.label}</div>
                  <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:12,color:k.color}}>{k.val}</div>
                </div>
              ))}
            </div>
            {/* Dettagli */}
            <div style={c}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Dettagli commessa</div>
              {[
                {label:'Azienda',val:a?.nome+' — '+a?.citta},
                {label:'Cliente',val:sel.cliente},
                {label:'Vani',val:sel.vani+' vani'},
                {label:'Data',val:sel.data.slice(5).replace('-','/')},
                {label:'Spese totali',val:`€${totSpese.toLocaleString('it-IT')}`},
                {label:'Da incassare',val:`€${Math.max(0,sel.importo-sel.incassato).toLocaleString('it-IT')}`},
              ].map(r=>(
                <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #EEF8F8'}}>
                  <span style={{fontSize:12,color:'#4A7070'}}>{r.label}</span>
                  <span style={{fontSize:12,fontWeight:600,color:'#0D1F1F'}}>{r.val}</span>
                </div>
              ))}
            </div>
          </>)}

          {/* TAB SPESE */}
          {tab==='spese'&&(<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:700,fontSize:13}}>Spese commessa</div>
              <button onClick={()=>setAddSpesa(v=>!v)} style={{background:'#28A0A0',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:700,cursor:'pointer',boxShadow:'0 3px 0 0 #156060'}}>+ Aggiungi</button>
            </div>

            {addSpesa&&(
              <div style={c}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Nuova spesa</div>
                <input value={nuovaSpesa.desc} onChange={e=>setNuovaSpesa(p=>({...p,desc:e.target.value}))}
                  placeholder="Descrizione" style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:8}}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <input value={nuovaSpesa.importo} onChange={e=>setNuovaSpesa(p=>({...p,importo:e.target.value}))}
                    type="number" placeholder="€ importo" style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:13,outline:'none',fontFamily:'"JetBrains Mono",monospace'}}/>
                  <select value={nuovaSpesa.cat} onChange={e=>setNuovaSpesa(p=>({...p,cat:e.target.value}))}
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:13,outline:'none',background:'#fff'}}>
                    {['materiali','trasporto','attrezzatura','vitto','altro'].map(cat=>(
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button onClick={aggiungiSpesa} disabled={!nuovaSpesa.desc||!nuovaSpesa.importo}
                  style={{background:'#28A0A0',color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,fontSize:13,cursor:'pointer',width:'100%',boxShadow:'0 3px 0 0 #156060'}}>
                  Salva spesa
                </button>
              </div>
            )}

            {/* Totale spese */}
            <div style={{...c,borderColor:'#D08008',background:'linear-gradient(145deg,#fffbf0,#fff8e8)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:13,color:'#4A7070',fontWeight:600}}>Totale spese</span>
                <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:16,color:'#D08008'}}>€{totSpese.toLocaleString('it-IT')}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                <span style={{fontSize:12,color:'#4A7070'}}>Margine netto</span>
                <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:700,fontSize:13,color:margine>0?'#1A9E73':'#DC4444'}}>€{margine.toLocaleString('it-IT')}</span>
              </div>
            </div>

            {speseComm.length===0&&<div style={{textAlign:'center',color:'#8BBCBC',fontSize:13,padding:24}}>Nessuna spesa registrata</div>}
            {speseComm.map(s=>(
              <div key={s.id} style={c}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:'#0D1F1F'}}>{s.desc}</div>
                    <div style={{fontSize:11,color:'#8BBCBC',marginTop:2}}>{s.cat} · {s.data}</div>
                  </div>
                  <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:15,color:'#DC4444'}}>-€{s.importo}</span>
                </div>
              </div>
            ))}
          </>)}

          {/* TAB CHECKLIST */}
          {tab==='checklist'&&(<>
            <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>Checklist lavoro</div>
            {['Verifica misure sul posto','Rimozione infisso esistente','Preparazione controtelaio','Installazione nuovo infisso','Sigillatura e finitura','Test apertura/chiusura','Foto fine lavoro','Firma cliente'].map((item,i)=>{
              const done = sel.avanzamento > (i/8)*100;
              return(
                <div key={i} style={{...c,display:'flex',alignItems:'center',gap:12,padding:12}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:done?'#28A0A0':'#EEF8F8',border:`2px solid ${done?'#28A0A0':'#C8E4E4'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {done&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{fontSize:13,color:done?'#4A7070':'#0D1F1F',textDecoration:done?'line-through':'none'}}>{item}</span>
                </div>
              );
            })}
          </>)}
        </div>
      </div>
    );
  }

  // LISTA COMMESSE
  return(
    <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
      {/* KPI */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {[
          {label:'Totale',val:`€${totale.toLocaleString('it-IT')}`,color:'#28A0A0'},
          {label:'Incassato',val:`€${incassato.toLocaleString('it-IT')}`,color:'#1A9E73'},
          {label:'Da avere',val:`€${(totale-incassato).toLocaleString('it-IT')}`,color:'#D08008'},
        ].map(k=>(
          <div key={k.label} style={{...c,padding:10,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#4A7070',marginBottom:4}}>{k.label}</div>
            <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:13,color:k.color}}>{k.val}</div>
          </div>
        ))}
      </div>

      <PianoLock minPiano="PRO" label="Import Opera XML — Piano PRO">
      <input ref={xmlRef} type="file" accept=".xml" style={{display:'none'}} onChange={onXmlFile}/>
      <button onClick={()=>xmlRef.current?.click()} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(40,160,160,0.06)',border:'1.5px dashed #C8E4E4',borderRadius:14,padding:'12px 14px',cursor:'pointer',width:'100%',textAlign:'left'}}>
        <div style={{width:36,height:36,borderRadius:8,background:'#28A0A0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#28A0A0'}}>Importa da Opera XML</div>
          <div style={{fontSize:11,color:'#4A7070'}}>Carica file commessa_cnc_*.xml da Opera</div>
        </div>
      </button>

      {/* MODAL PREVIEW IMPORT */}
      {importXml.step==='preview'&&importXml.data&&(
        <div style={{background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'2px solid #28A0A0',padding:16,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{fontWeight:800,fontSize:15,color:'#0D1F1F',marginBottom:2}}>Anteprima importazione</div>
          <div style={{background:'#EEF8F8',borderRadius:10,padding:'10px 14px',display:'flex',flexDirection:'column',gap:4}}>
            <div style={{fontSize:13,fontWeight:700,color:'#0D1F1F'}}>{importXml.data.jobName}</div>
            <div style={{fontSize:12,color:'#4A7070'}}>{importXml.data.clienteNome} {importXml.data.clienteCity&&'· '+importXml.data.clienteCity}</div>
            <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
              <span style={{background:'rgba(40,160,160,0.1)',color:'#28A0A0',borderRadius:20,padding:'2px 9px',fontSize:10,fontWeight:700}}>{importXml.data.vani.length} vani</span>
              <span style={{background:'rgba(40,160,160,0.1)',color:'#28A0A0',borderRadius:20,padding:'2px 9px',fontSize:10,fontWeight:700,fontFamily:'"JetBrains Mono",monospace'}}>€{importXml.data.prezzo.toLocaleString('it-IT')}</span>
              <span style={{background:'rgba(40,160,160,0.1)',color:'#28A0A0',borderRadius:20,padding:'2px 9px',fontSize:10,fontWeight:700}}>#{importXml.data.barcode}</span>
            </div>
          </div>
          <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:6}}>
            {importXml.data.vani.map((v:any,i:number)=>(
              <div key={i} style={{background:'#fff',border:'1px solid #C8E4E4',borderRadius:10,padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'#0D1F1F'}}>{v.pos}. {v.desc}</div>
                  <div style={{fontSize:10,color:'#4A7070'}}>{v.series} {v.w>0&&'· '+v.w+'×'+v.h+' mm'} {v.colInt&&'· '+v.colInt}</div>
                </div>
                {v.prezzo>0&&<span style={{fontSize:12,fontFamily:'"JetBrains Mono",monospace',fontWeight:700,color:'#28A0A0',flexShrink:0,marginLeft:8}}>€{v.prezzo}</span>}
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <button onClick={()=>setImportXml({step:'idle',data:null})} style={{flex:1,background:'#EEF8F8',color:'#4A7070',border:'none',borderRadius:10,padding:'10px',fontWeight:700,cursor:'pointer'}}>Annulla</button>
            <button onClick={salvaImportazione} style={{flex:2,background:'#28A0A0',color:'#fff',border:'none',borderRadius:10,padding:'10px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 0 0 #156060'}}>Importa commessa</button>
          </div>
        </div>
      )}
      {importXml.step==='saving'&&<div style={{textAlign:'center',padding:'16px',color:'#28A0A0',fontWeight:700,fontSize:14}}>Salvataggio in corso...</div>}
      {importXml.step==='done'&&<div style={{textAlign:'center',padding:'16px',background:'rgba(26,158,115,0.1)',borderRadius:12,color:'#1A9E73',fontWeight:700,fontSize:14}}>Commessa importata con successo!</div>}
      </PianoLock>

      {FL_AZIENDE.map(azn=>{
        const comm = FL_COMMESSE.filter(co=>co.aziendaId===azn.id);
        if(!comm.length) return null;
        return(
          <div key={azn.id}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,marginTop:4}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:azn.colore,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{azn.avatar}</div>
              <div style={{fontWeight:700,fontSize:13,color:'#0D1F1F'}}>{azn.nome}</div>
              <div style={{fontSize:11,color:'#8BBCBC'}}>{azn.citta}</div>
            </div>
            {comm.map(co=>(
              <button key={co.id} onClick={()=>{setSelId(co.id);setTab('info');}}
                style={{...c,textAlign:'left',cursor:'pointer',width:'100%',marginBottom:8,display:'block'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:13,color:'#0D1F1F',flex:1,paddingRight:8}}>{co.titolo}</div>
                  <span style={{
                    background:co.stato==='completato'?'rgba(26,158,115,0.1)':co.stato==='in_corso'?'rgba(40,160,160,0.1)':'rgba(208,128,8,0.1)',
                    color:co.stato==='completato'?'#1A9E73':co.stato==='in_corso'?'#28A0A0':'#D08008',
                    borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700,whiteSpace:'nowrap'
                  }}>{co.stato==='completato'?'Completato':co.stato==='in_corso'?'In corso':'Da fare'}</span>
                </div>
                <div style={{fontSize:12,color:'#4A7070',marginBottom:8}}>{co.cliente} · {co.vani} vani · {co.data.slice(5).replace('-','/')}</div>
                <div style={{background:'#EEF8F8',borderRadius:6,height:6,marginBottom:6,overflow:'hidden'}}>
                  <div style={{background:'#28A0A0',height:'100%',width:`${co.avanzamento}%`,borderRadius:6}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                  <span style={{color:'#4A7070'}}>{co.avanzamento}% · tocca per dettaglio</span>
                  <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:700,color:'#28A0A0'}}>€{co.importo.toLocaleString('it-IT')}</span>
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç FATTURE FREELANCE ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç

const FL_SPESE_GENERALI_INIT = [
  {id:'SG-001',desc:'Carburante furgone',importo:120,cat:'trasporto',data:'2026-04-01',ricorrente:false},
  {id:'SG-002',desc:'Leasing furgone',importo:380,cat:'leasing',data:'2026-04-05',ricorrente:true},
  {id:'SG-003',desc:'Assicurazione furgone',importo:95,cat:'assicurazione',data:'2026-04-10',ricorrente:true},
  {id:'SG-004',desc:'Fitto magazzino attrezzature',importo:200,cat:'affitto',data:'2026-04-01',ricorrente:true},
  {id:'SG-005',desc:'Trapano avvitatore Hilti',importo:450,cat:'attrezzatura',data:'2026-03-15',ricorrente:false},
];

const FL_ATTREZZATURE_INIT = [
  {id:'AT-001',nome:'Furgone Fiat Ducato',valore:18000,acquisto:'2024-01-15',cat:'veicoli',note:'Leasing 48 mesi',stato:'attiva',targa:'BR 423 KL',prossima_revisione:'2026-06-15',km:48500},
  {id:'AT-002',nome:'Trapano avvitatore Hilti TE 30',valore:850,acquisto:'2026-03-15',cat:'utensili',note:'',stato:'attiva',targa:null,prossima_revisione:null,km:null},
  {id:'AT-003',nome:'Scala alluminio 7m',valore:320,acquisto:'2023-06-10',cat:'attrezzatura',note:'',stato:'attiva',targa:null,prossima_revisione:null,km:null},
  {id:'AT-004',nome:'Livella laser Bosch',valore:280,acquisto:'2024-09-20',cat:'strumenti',note:'',stato:'da_revisionare',targa:null,prossima_revisione:null,km:null},
];

const FL_MANUTENZIONI_INIT = [
  {id:'MN-001',attrId:'AT-001',tipo:'tagliando',desc:'Tagliando 45.000km',costo:280,data:'2026-03-10',officina:'Fiat Brindisi',prossima:'2026-09-10',km:45000},
  {id:'MN-002',attrId:'AT-001',tipo:'pneumatici',desc:'4 pneumatici estivi',costo:420,data:'2025-04-15',officina:'Euromaster',prossima:null,km:38000},
  {id:'MN-003',attrId:'AT-001',tipo:'revisione',desc:'Revisione ministeriale',costo:95,data:'2024-06-20',officina:'Motorizzazione BR',prossima:'2026-06-15',km:null},
  {id:'MN-004',attrId:'AT-002',tipo:'pulizia',desc:'Pulizia SDS',costo:0,data:'2026-04-01',officina:'Interno',prossima:null,km:null},
  {id:'MN-005',attrId:'AT-004',tipo:'calibrazione',desc:'Ricalibrazione laser',costo:45,data:'2026-03-28',officina:'Bosch Service',prossima:'2026-09-28',km:null},
];

const STATO_ATTR_COLOR: Record<string,{bg:string;text:string;label:string}> = {
  attiva:        {bg:'rgba(26,158,115,0.1)',  text:'#1A9E73', label:'Attiva'},
  da_revisionare:{bg:'rgba(208,128,8,0.1)',   text:'#D08008', label:'Da revisionare'},
  in_riparazione:{bg:'rgba(220,68,68,0.1)',   text:'#DC4444', label:'In riparazione'},
  dismessa:      {bg:'rgba(139,188,188,0.1)', text:'#8BBCBC', label:'Dismessa'},
};


const FL_SCADENZIARIO_INIT = [
  {id:'SC-001',desc:'Leasing furgone',importo:380,scadenza:'2026-04-05',stato:'pagato',cat:'leasing'},
  {id:'SC-002',desc:'F24 INPS artigiani',importo:850,scadenza:'2026-05-16',stato:'da_pagare',cat:'tasse'},
  {id:'SC-003',desc:'Assicurazione furgone',importo:95,scadenza:'2026-04-10',stato:'pagato',cat:'assicurazione'},
  {id:'SC-004',desc:'Fitto magazzino',importo:200,scadenza:'2026-05-01',stato:'da_pagare',cat:'affitto'},
  {id:'SC-005',desc:'IVA trimestrale Q1',importo:1240,scadenza:'2026-05-16',stato:'da_pagare',cat:'tasse'},
];


// ├ö├Â├ç├ö├Â├ç├ö├Â├ç ORDINI FREELANCE ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const FL_MAGAZZINO_INIT = [
  {id:'MAG-001',nome:'Silicone neutro bianco',um:'pz',giacenza:8,scorta_min:5,valore_unitario:4.5,cat:'sigillanti',fornitore:'Wuerth'},
  {id:'MAG-002',nome:'Viti autofilettanti 4.2x25',um:'pz',giacenza:120,scorta_min:50,valore_unitario:0.15,cat:'fissaggi',fornitore:'Wuerth'},
  {id:'MAG-003',nome:'Guarnizione EPDM 8mm',um:'mt',giacenza:3,scorta_min:10,valore_unitario:1.8,cat:'guarnizioni',fornitore:'Alco'},
  {id:'MAG-004',nome:'Schiuma poliuretanica',um:'pz',giacenza:4,scorta_min:3,valore_unitario:8.0,cat:'sigillanti',fornitore:'Wuerth'},
  {id:'MAG-005',nome:'Coprifilo alluminio 40mm',um:'mt',giacenza:22,scorta_min:10,valore_unitario:3.2,cat:'finiture',fornitore:'Alupress'},
];

const STATO_ORDINE_COLOR: Record<string,string> = {
  bozza:'#D08008', inviato:'#28A0A0', confermato:'#1A9E73', consegnato:'#156060', pagato:'#0F7A56',
};
const STATO_ORDINE_LABEL: Record<string,string> = {
  bozza:'Bozza', inviato:'Inviato', confermato:'Confermato', consegnato:'Consegnato', pagato:'Pagato',
};

function OrdiniFreelance() {
  const [ordini, setOrdini] = React.useState(FL_ORDINI_INIT);
  const [filtro, setFiltro] = React.useState<'tutti'|'commessa'|'personale'>('tutti');
  const [raggruppamento, setRaggruppamento] = React.useState<'commessa'|'azienda'|'stato'>('commessa');
  const [selOrdine, setSelOrdine] = React.useState<string|null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newOrdine, setNewOrdine] = React.useState<Record<string,string>>({tipo:'commessa',stato:'bozza'});
  const [galassia, setGalassia] = React.useState<any[]>([]);
  const [galSearch, setGalSearch] = React.useState('');
  const [galResults, setGalResults] = React.useState<any[]>([]);
  const [galOpen, setGalOpen] = React.useState(false);
  const [galPreview, setGalPreview] = React.useState<string|null>(null);
  const [addGalOpen, setAddGalOpen] = React.useState(false);
  const [newGal, setNewGal] = React.useState<Record<string,string>>({});
  const [galAllegati, setGalAllegati] = React.useState<any[]>([]);

  const loadAllegati=async(artId:string)=>{
    try{
      const r=await fetch(SB_URL+'/rest/v1/allegati_galassia?articolo_galassia_id=eq.'+artId+'&order=tipo,created_at.desc',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}});
      if(r.ok)setGalAllegati(await r.json());
    }catch(e){setGalAllegati([]);}
  };

  const togglePreview=(id:string)=>{
    if(galPreview===id){setGalPreview(null);setGalAllegati([]);}
    else{setGalPreview(id);loadAllegati(id);}
  };

  React.useEffect(()=>{
    (async()=>{
      try{
        const r=await fetch(SB_URL+'/rest/v1/catalogo_galassia?tipo_record=eq.articolo&select=id,nome,codice_articolo,cat,fornitore,um,valore_unitario,note,campi_applicazione,compatibilita_sistemi,scheda_tecnica_url,materiale,superficie&order=nome&limit=500',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}});
        if(r.ok){const d=await r.json();setGalassia(d);}
      }catch(e){console.error('[galassia]',e);}
    })();
  },[]);

  // Fuzzy match: calcola similarità tra due stringhe (0-1)
  const fuzzy=(a:string,b:string):number=>{
    if(!a||!b)return 0;
    const al=a.toLowerCase(),bl=b.toLowerCase();
    if(al===bl)return 1;
    if(al.includes(bl)||bl.includes(al))return 0.9;
    // Bigram similarity
    const bigrams=(s:string)=>{const r=new Set<string>();for(let i=0;i<s.length-1;i++)r.add(s.slice(i,i+2));return r;};
    const ab=bigrams(al),bb=bigrams(bl);
    let match=0;
    ab.forEach(bg=>{if(bb.has(bg))match++;});
    return ab.size+bb.size>0?(2*match)/(ab.size+bb.size):0;
  };

  const searchGal=(q:string)=>{
    setGalSearch(q);
    setNewOrdine((p:any)=>({...p,desc:q}));
    if(q.length<2){setGalResults([]);setGalOpen(false);return;}
    const s=q.toLowerCase();
    const words=s.split(/\s+/).filter(Boolean);
    // Score each article: exact match > includes > fuzzy
    const scored=galassia.map((g:any)=>{
      const nome=(g.nome||'').toLowerCase();
      const cod=(g.codice_articolo||'').toLowerCase();
      const forn=(g.fornitore||'').toLowerCase();
      const cat=(g.cat||'').toLowerCase();
      let score=0;
      // Exact includes
      if(nome.includes(s)||cod.includes(s)||forn.includes(s)) score=1;
      // Multi-word: all words found somewhere
      else if(words.length>1&&words.every((w:string)=>nome.includes(w)||forn.includes(w)||cat.includes(w))) score=0.95;
      // Single word fuzzy on each field
      else{
        const maxF=Math.max(
          ...words.map((w:string)=>Math.max(fuzzy(w,nome),fuzzy(w,forn),fuzzy(w,cat),
            ...nome.split(/\s+/).map((nw:string)=>fuzzy(w,nw)),
            ...forn.split(/\s+/).map((fw:string)=>fuzzy(w,fw))
          ))
        );
        if(maxF>0.45) score=maxF;
      }
      return{g,score};
    }).filter(x=>x.score>0.4).sort((a,b)=>b.score-a.score).slice(0,10);
    setGalResults(scored.map(x=>x.g));
    setGalOpen(scored.length>0);
  };

  const pickGal=(g:any)=>{
    setNewOrdine((p:any)=>({...p,desc:g.nome,fornitore:g.fornitore||'',um:g.um||'pz',importo:g.valore_unitario?String(g.valore_unitario):'',galassia_id:g.id}));
    setGalSearch(g.nome);
    setGalOpen(false);
  };

  const az = (id:string|null) => id ? FL_AZIENDE.find(a=>a.id===id) : null;
  const comm = (id:string|null) => id ? FL_COMMESSE.find(c=>c.id===id) : null;

  const ordiniFiltrati = ordini.filter(o => filtro==='tutti' || o.tipo===filtro);
  const ordSel = selOrdine ? ordini.find(o=>o.id===selOrdine) : null;

  const totCommesse = ordini.filter(o=>o.tipo==='commessa').reduce((s,o)=>s+o.importo,0);
  const totPersonali = ordini.filter(o=>o.tipo==='personale').reduce((s,o)=>s+o.importo,0);
  const daBozza = ordini.filter(o=>o.stato==='bozza').length;

  const C: React.CSSProperties = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};
  const CB = (borderColor='#C8E4E4'): React.CSSProperties => ({...C,borderColor,cursor:'pointer',textAlign:'left',width:'100%',display:'block'});

  const StatoBadge = ({stato}:{stato:string}) => (
    <span style={{background:`${STATO_ORDINE_COLOR[stato]}20`,color:STATO_ORDINE_COLOR[stato],borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700}}>
      {STATO_ORDINE_LABEL[stato]}
    </span>
  );

  const avanzaStato = (id:string) => {
    const seq = ['bozza','inviato','confermato','consegnato','pagato'];
    setOrdini(p=>p.map(o=>{
      if(o.id!==id) return o;
      const idx = seq.indexOf(o.stato);
      return {...o, stato: seq[Math.min(idx+1,seq.length-1)]};
    }));
  };

  // DETTAGLIO ORDINE
  if(ordSel) {
    const a = az(ordSel.aziendaId);
    const co = comm(ordSel.commessaId);
    return(
      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
        <button onClick={()=>setSelOrdine(null)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#28A0A0',fontWeight:700,fontSize:13,padding:0,marginBottom:4}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Ordini
        </button>

        <div style={C}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div style={{flex:1,paddingRight:8}}>
              <div style={{fontWeight:800,fontSize:16,color:'#0D1F1F'}}>{ordSel.desc}</div>
              <div style={{fontSize:12,color:'#4A7070',marginTop:4}}>{ordSel.fornitore}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:'#28A0A0'}}>€{ordSel.importo.toLocaleString('it-IT')}</div>
              <StatoBadge stato={ordSel.stato}/>
            </div>
          </div>

          <div style={{background:'rgba(40,160,160,0.06)',borderRadius:10,padding:12,marginBottom:12}}>
            {[
              {k:'Tipo ordine', v:ordSel.tipo==='commessa'?'Per commessa':'Personale'},
              {k:'Quantità', v:`${(ordSel as any).qty||'-'} ${(ordSel as any).um||''}`},
              {k:'Data ordine', v:ordSel.data},
              {k:'Fornitore', v:ordSel.fornitore},
              ...(co?[{k:'Commessa', v:co.titolo},{k:'Cliente', v:co.cliente}]:[]),
              ...(a?[{k:'Azienda', v:a.nome}]:[]),
              ...(ordSel.note?[{k:'Note', v:ordSel.note}]:[]),
            ].map(({k,v})=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(40,160,160,0.1)'}}>
                <span style={{fontSize:12,color:'#4A7070'}}>{k}</span>
                <span style={{fontSize:12,fontWeight:600,color:'#0D1F1F',textAlign:'right',maxWidth:'60%'}}>{v}</span>
              </div>
            ))}
          </div>

          {/* WhatsApp fornitore */}
          {ordSel.stato==='bozza'&&ordSel.fornitore&&ordSel.fornitore!=='—'&&(
            <button onClick={()=>{
              const msg=encodeURIComponent(
                `Buongiorno, vorrei ordinare:\n\n`+
                `Articolo: ${ordSel.desc}\n`+
                `Quantita: ${(ordSel as any).qty||'-'} ${(ordSel as any).um||'pz'}\n`+
                (ordSel.note?`Note: ${ordSel.note}\n`:'')+
                `\nGrazie, cordiali saluti.\n— Inviato da MASTRO`
              );
              window.open(`https://wa.me/?text=${msg}`,'_blank');
            }}
              style={{background:'#25D366',color:'#fff',border:'none',borderRadius:10,padding:'13px',fontWeight:700,fontSize:14,cursor:'pointer',width:'100%',boxShadow:'0 4px 0 0 #1DA851',fontFamily:'system-ui',marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.462A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.592-5.927-1.621l-.424-.254-2.744.868.882-2.686-.278-.443A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z"/></svg>
              Invia ordine via WhatsApp
            </button>
          )}

          {/* Avanza stato */}
          {ordSel.stato!=='pagato'&&(
            <button onClick={()=>{avanzaStato(ordSel.id);setSelOrdine(null);}}
              style={{background:'#28A0A0',color:'#fff',border:'none',borderRadius:10,padding:'13px',fontWeight:700,fontSize:14,cursor:'pointer',width:'100%',boxShadow:'0 4px 0 0 #156060',fontFamily:'system-ui',marginBottom:8}}>
              Avanza → {STATO_ORDINE_LABEL[(['bozza','inviato','confermato','consegnato','pagato'] as string[])
                [Math.min((['bozza','inviato','confermato','consegnato','pagato'] as string[]).indexOf(ordSel.stato)+1,4)]]}
            </button>
          )}
          {ordSel.stato==='pagato'&&(
            <div style={{textAlign:'center',padding:12,background:'rgba(26,158,115,0.1)',borderRadius:10,color:'#1A9E73',fontWeight:700,fontSize:13}}>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LISTA ORDINI
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Filtri tipo */}
      <div style={{display:'flex',background:'#0D1F1F',borderBottom:'1px solid rgba(40,160,160,0.2)',flexShrink:0}}>
        {(['tutti','commessa','personale'] as const).map(f=>(
          <button key={f} onClick={()=>setFiltro(f)}
            style={{flex:1,background:'none',border:'none',padding:'10px 4px',cursor:'pointer',
              color:filtro===f?'#28A0A0':'#8BBCBC',fontSize:11,fontWeight:700,
              borderBottom:filtro===f?'2px solid #28A0A0':'2px solid transparent'}}>
            {f==='tutti'?'Tutti':f==='commessa'?'Per commessa':'Personali'}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>

        {/* KPI */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[
            {label:'Commesse',val:`€${totCommesse}`,color:'#28A0A0'},
            {label:'Personali',val:`€${totPersonali}`,color:'#3B7FE0'},
            {label:'In bozza',val:`${daBozza} ord.`,color:'#8BBCBC'},
          ].map(k=>(
            <div key={k.label} style={{...C,padding:10,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#4A7070',marginBottom:4,fontWeight:600}}>{k.label}</div>
              <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:13,color:k.color}}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Bottone aggiungi */}
        <button onClick={()=>setAddOpen(v=>!v)}
          style={{background:'#28A0A0',color:'#fff',border:'none',borderRadius:10,padding:'11px',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 0 0 #156060',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          + Nuovo ordine
        </button>

        {/* Form nuovo ordine */}
        {addOpen&&(
          <div style={C}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Nuovo ordine</div>
            
            {/* Tipo */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              {(['commessa','personale'] as const).map(t=>(
                <button key={t} onClick={()=>setNewOrdine(p=>({...p,tipo:t}))}
                  style={{padding:'8px',borderRadius:8,border:`2px solid ${newOrdine.tipo===t?'#28A0A0':'#C8E4E4'}`,background:newOrdine.tipo===t?'#EEF8F8':'#fff',cursor:'pointer',fontWeight:700,fontSize:12,color:newOrdine.tipo===t?'#28A0A0':'#4A7070'}}>
                  {t==='commessa'?'Per commessa':'Personale'}
                </button>
              ))}
            </div>

            <div style={{position:'relative',marginBottom:7}}>
              <input value={galSearch||newOrdine.desc||''} onChange={e=>searchGal(e.target.value)}
                onFocus={()=>{if(galResults.length)setGalOpen(true);}}
                placeholder={galassia.length>0?`Cerca tra ${galassia.length} articoli Galassia...`:'Caricamento catalogo...'}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:galOpen?'2px solid #28A0A0':'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'system-ui',background:galOpen?'#EEF8F8':'#fff'}}/>
              {galOpen&&galResults.length>0&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1.5px solid #28A0A0',borderRadius:'0 0 10px 10px',boxShadow:'0 8px 24px rgba(0,0,0,.15)',zIndex:100,maxHeight:360,overflowY:'auto'}}>
                  <div style={{padding:'6px 12px',background:'#EEF8F8',fontSize:10,fontWeight:700,color:'#28A0A0',borderBottom:'1px solid #C8E4E4'}}>Catalogo Galassia — tocca per dettagli, seleziona per ordinare</div>
                  {galResults.map((g:any)=>(
                    <div key={g.id} style={{borderBottom:'1px solid #EEF8F8'}}>
                      <div style={{display:'flex',alignItems:'center',padding:'10px 12px',cursor:'pointer'}}
                        onClick={()=>togglePreview(g.id)}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:'#0D1F1F',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.nome}</div>
                          <div style={{fontSize:10,color:'#8BBCBC',marginTop:2}}>{g.cat} — {g.fornitore}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                          {g.valore_unitario>0&&<span style={{fontFamily:'"JetBrains Mono",monospace',fontSize:12,fontWeight:700,color:'#D08008'}}>{String.fromCharCode(8364)}{Number(g.valore_unitario).toFixed(2)}</span>}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8BBCBC" strokeWidth="2" style={{transform:galPreview===g.id?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                      {galPreview===g.id&&(
                        <div style={{padding:'0 12px 12px',background:'#F8FCFC'}}>
                          {/* Mini scheda tecnica */}
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 12px',fontSize:11,marginBottom:8}}>
                            {g.materiale&&<div><span style={{color:'#8BBCBC'}}>Materiale:</span> <span style={{color:'#0D1F1F',fontWeight:600}}>{g.materiale}</span></div>}
                            {g.superficie&&<div><span style={{color:'#8BBCBC'}}>Superficie:</span> <span style={{color:'#0D1F1F',fontWeight:600}}>{g.superficie}</span></div>}
                            <div><span style={{color:'#8BBCBC'}}>UM:</span> <span style={{color:'#0D1F1F',fontWeight:600}}>{g.um}</span></div>
                            <div><span style={{color:'#8BBCBC'}}>Codice:</span> <span style={{fontFamily:'"JetBrains Mono",monospace',color:'#0D1F1F',fontWeight:600,fontSize:10}}>{g.codice_articolo}</span></div>
                          </div>
                          {/* Note tecniche */}
                          {g.note&&<div style={{fontSize:11,color:'#0D1F1F',lineHeight:1.5,background:'#fff',borderRadius:8,padding:'8px 10px',border:'1px solid #C8E4E4',marginBottom:8,maxHeight:80,overflowY:'auto'}}>{g.note}</div>}
                          {/* Campi applicazione */}
                          {g.campi_applicazione&&g.campi_applicazione.length>0&&(
                            <div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:8}}>
                              {g.campi_applicazione.map((c:string)=>(
                                <span key={c} style={{background:'#EEF8F8',color:'#28A0A0',padding:'2px 8px',borderRadius:10,fontSize:9,fontWeight:600}}>{c}</span>
                              ))}
                            </div>
                          )}
                          {/* Compatibilità sistemi */}
                          {g.compatibilita_sistemi&&g.compatibilita_sistemi.length>0&&(
                            <div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:8}}>
                              <span style={{fontSize:9,color:'#8BBCBC',fontWeight:700}}>Compatibile:</span>
                              {g.compatibilita_sistemi.map((s:string)=>(
                                <span key={s} style={{background:'#FFF8E8',color:'#D08008',padding:'2px 8px',borderRadius:10,fontSize:9,fontWeight:600}}>{s}</span>
                              ))}
                            </div>
                          )}
                          {/* Scheda tecnica link */}
                          {g.scheda_tecnica_url&&(
                            <a href={g.scheda_tecnica_url} target="_blank" rel="noreferrer"
                              style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#28A0A0',fontWeight:700,textDecoration:'none',marginBottom:8}}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#28A0A0" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              Scheda tecnica PDF
                            </a>
                          )}
                          {/* Allegati dalla comunita */}
                          {galAllegati.length>0&&(
                            <div style={{marginBottom:8}}>
                              <div style={{fontSize:9,fontWeight:700,color:'#8BBCBC',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>Documenti e foto ({galAllegati.length})</div>
                              {galAllegati.map((al:any)=>(
                                <a key={al.id} href={al.url} target="_blank" rel="noreferrer"
                                  style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',background:'#fff',borderRadius:6,border:'1px solid #C8E4E4',marginBottom:3,textDecoration:'none'}}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={al.tipo==='foto_prodotto'||al.tipo==='foto_confezione'||al.tipo==='foto_etichetta'?'#1A9E73':al.tipo==='video'?'#DC4444':'#28A0A0'} strokeWidth="2">
                                    {al.tipo.startsWith('foto')?<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>
                                    :al.tipo==='video'?<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>
                                    :<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
                                  </svg>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:11,fontWeight:600,color:'#0D1F1F',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{al.nome}</div>
                                    <div style={{fontSize:9,color:'#8BBCBC'}}>{al.tipo.replace(/_/g,' ')} {al.caricato_da?'— '+al.caricato_da:''}</div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                          {/* Bottone seleziona */}
                          <button onClick={()=>pickGal(g)}
                            style={{width:'100%',background:'#28A0A0',color:'#fff',border:'none',borderRadius:8,padding:'9px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 #156060',fontFamily:'system-ui'}}>
                            Seleziona per ordine
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={()=>{setGalOpen(false);setAddGalOpen(true);setNewGal({nome:galSearch,fornitore:newOrdine.fornitore||'',cat:'',materiale:'',superficie:'',um:'pz',prezzo:'',note:'',campi:''});}}
                    style={{width:'100%',background:'#FFF8E8',border:'none',borderTop:'1px solid #E8DCC0',padding:'8px 12px',cursor:'pointer',textAlign:'left',fontSize:11,color:'#D08008',fontWeight:600}}>
                    Non trovo l'articolo — aggiungo al catalogo Galassia
                  </button>
                </div>
              )}
              {galSearch.length>=2&&galResults.length===0&&!galOpen&&!addGalOpen&&(
                <div style={{background:'#FFF3E0',border:'1px solid #FFD180',borderRadius:8,padding:'8px 12px',marginTop:4,marginBottom:4}}>
                  <div style={{fontSize:11,color:'#E65100',marginBottom:6}}>Nessun articolo trovato per "{galSearch}".</div>
                  <button onClick={()=>{setAddGalOpen(true);setNewGal({nome:galSearch,fornitore:'',cat:'',materiale:'',superficie:'',um:'pz',prezzo:'',note:'',campi:''});}}
                    style={{background:'#D08008',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',fontSize:11,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 0 0 #A06005'}}>
                    Aggiungi al catalogo Galassia
                  </button>
                </div>
              )}
            </div>

            {/* ÔöÇÔöÇ FORM NUOVO ARTICOLO GALASSIA ÔöÇÔöÇ */}
            {addGalOpen&&(
              <div style={{background:'linear-gradient(145deg,#fff,#FFF8E8)',borderRadius:14,border:'2px solid #D08008',padding:14,marginBottom:10,boxShadow:'0 4px 0 0 #E8DCC0'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{fontWeight:800,fontSize:13,color:'#D08008'}}>Nuovo articolo — Catalogo Galassia</div>
                  <button onClick={()=>setAddGalOpen(false)} style={{background:'none',border:'none',fontSize:18,color:'#8BBCBC',cursor:'pointer'}}>x</button>
                </div>
                <div style={{fontSize:10,color:'#8BBCBC',marginBottom:10,lineHeight:1.4}}>Questo articolo sara visibile a tutti gli utenti MASTRO. Inserisci dati corretti.</div>

                {[
                  {k:'nome',p:'Nome articolo *',ph:'es. Cerniera Maico 3D Regolabile'},
                  {k:'fornitore',p:'Fornitore / Marca',ph:'es. Maico, Roto, Wurth'},
                  {k:'codice',p:'Codice articolo',ph:'es. MC-CERN-3D'},
                  {k:'cat',p:'Categoria',ph:'es. cerniere, viti, guarnizioni, sigillanti'},
                  {k:'materiale',p:'Materiale',ph:'es. acciaio, PVC, alluminio, EPDM'},
                  {k:'superficie',p:'Superficie / Finitura',ph:'es. zincato, anodizzato, RAL9010'},
                  {k:'um',p:'Unita misura',ph:'pz, ml, mq, kg, rl, kit'},
                  {k:'prezzo',p:'Prezzo riferimento (opzionale)',ph:'es. 14.00'},
                ].map(f=>(
                  <div key={f.k} style={{marginBottom:6}}>
                    <label style={{fontSize:10,fontWeight:600,color:'#4A7070',display:'block',marginBottom:2}}>{f.p}</label>
                    <input value={newGal[f.k]||''} onChange={e=>setNewGal(p=>({...p,[f.k]:e.target.value}))}
                      placeholder={f.ph} type={f.k==='prezzo'?'number':'text'}
                      style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:f.k==='prezzo'||f.k==='codice'?'"JetBrains Mono",monospace':'system-ui'}}/>
                  </div>
                ))}

                <div style={{marginBottom:6}}>
                  <label style={{fontSize:10,fontWeight:600,color:'#4A7070',display:'block',marginBottom:2}}>Note tecniche</label>
                  <textarea value={newGal.note||''} onChange={e=>setNewGal(p=>({...p,note:e.target.value}))}
                    placeholder="Descrizione tecnica, portata, dimensioni, istruzioni uso..."
                    style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'system-ui',resize:'vertical',minHeight:60}}/>
                </div>

                <div style={{marginBottom:6}}>
                  <label style={{fontSize:10,fontWeight:600,color:'#4A7070',display:'block',marginBottom:2}}>Campi di applicazione (separati da virgola)</label>
                  <input value={newGal.campi||''} onChange={e=>setNewGal(p=>({...p,campi:e.target.value}))}
                    placeholder="es. PVC, alluminio, legno, posa, montaggio"
                    style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
                </div>

                <div style={{marginBottom:10}}>
                  <label style={{fontSize:10,fontWeight:600,color:'#4A7070',display:'block',marginBottom:2}}>Link scheda tecnica PDF (opzionale)</label>
                  <input value={newGal.scheda_url||''} onChange={e=>setNewGal(p=>({...p,scheda_url:e.target.value}))}
                    placeholder="https://..."
                    style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
                </div>

                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setAddGalOpen(false)}
                    style={{flex:1,background:'#EEF8F8',color:'#4A7070',border:'none',borderRadius:8,padding:'10px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Annulla</button>
                  <button onClick={async()=>{
                    if(!newGal.nome){return;}
                    const campiArr=(newGal.campi||'').split(',').map((s:string)=>s.trim()).filter(Boolean);
                    const body={
                      nome:newGal.nome,
                      codice_articolo:newGal.codice||('USR-'+Date.now().toString(36).toUpperCase()),
                      cat:newGal.cat||'varie',
                      fornitore:newGal.fornitore||'',
                      materiale:newGal.materiale||null,
                      superficie:newGal.superficie||null,
                      um:newGal.um||'pz',
                      valore_unitario:newGal.prezzo?Number(newGal.prezzo):0,
                      note:newGal.note||null,
                      campi_applicazione:campiArr.length>0?campiArr:null,
                      scheda_tecnica_url:newGal.scheda_url||null,
                      tipo_record:'articolo',
                      galassia:true,
                    };
                    try{
                      const r=await fetch(SB_URL+'/rest/v1/catalogo_galassia',{
                        method:'POST',
                        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return=representation'},
                        body:JSON.stringify(body)
                      });
                      if(r.ok){
                        const inserted=await r.json();
                        const item=inserted[0]||inserted;
                        setGalassia((p:any)=>[...p,item]);
                        setNewOrdine((p:any)=>({...p,desc:newGal.nome,fornitore:newGal.fornitore||'',um:newGal.um||'pz',importo:newGal.prezzo||''}));
                        setGalSearch(newGal.nome);
                        setAddGalOpen(false);
                        setNewGal({});
                      }else{console.error('Errore inserimento Galassia',await r.text());}
                    }catch(e){console.error('[addGalassia]',e);}
                  }}
                    style={{flex:2,background:'#D08008',color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 #A06005'}}>
                    Salva nel catalogo Galassia
                  </button>
                </div>
              </div>
            )}
            {[
              {k:'fornitore',p:'Fornitore',t:'text'},
              {k:'qty',p:'Quantit\u00e0',t:'number'},
              {k:'um',p:'Unit\u00e0 misura (pz, mt, kg...)',t:'text'},
              {k:'importo',p:'Importo \u20ac',t:'number'},
              {k:'data',p:'Data ordine',t:'date'},
            ].map(f=>(
              <input key={f.k} value={newOrdine[f.k]||''} onChange={e=>setNewOrdine((p:any)=>({...p,[f.k]:e.target.value}))}
                type={f.t} placeholder={f.p}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box',marginBottom:7,fontFamily:f.t==='number'?'"JetBrains Mono",monospace':'system-ui'}}/>
            ))}

            {newOrdine.tipo==='commessa'&&(
              <select value={newOrdine.commessaId||''} onChange={e=>setNewOrdine(p=>({...p,commessaId:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',background:'#fff',marginBottom:7}}>
                <option value="">Seleziona commessa</option>
                {FL_COMMESSE.map(c=><option key={c.id} value={c.id}>{c.titolo} — {c.cliente}</option>)}
              </select>
            )}

            <input value={newOrdine.note||''} onChange={e=>setNewOrdine(p=>({...p,note:e.target.value}))}
              placeholder="Note (opzionale)"
              style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #C8E4E4',fontSize:12,outline:'none',boxSizing:'border-box',marginBottom:10}}/>

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setAddOpen(false);setNewOrdine({tipo:'commessa',stato:'bozza'});}}
                style={{flex:1,background:'#EEF8F8',color:'#4A7070',border:'none',borderRadius:8,padding:'10px',fontWeight:700,fontSize:13,cursor:'pointer'}}>Annulla</button>
              <button onClick={()=>{
                if(!newOrdine.desc||!newOrdine.importo) return;
                const co = newOrdine.tipo==='commessa' ? FL_COMMESSE.find(c=>c.id===newOrdine.commessaId) : null;
                setOrdini((p:any[])=>[{
                  id:'ORD-FL-'+Date.now(),
                  tipo:newOrdine.tipo as 'commessa'|'personale',
                  commessaId:newOrdine.commessaId||null,
                  aziendaId:co?.aziendaId||null,
                  fornitore:newOrdine.fornitore||'—',
                  desc:newOrdine.desc,
                  qty:Number(newOrdine.qty)||1,
                  um:newOrdine.um||'pz',
                  importo:Number(newOrdine.importo),
                  stato:'bozza',
                  data:newOrdine.data||new Date().toISOString().slice(0,10),
                  note:newOrdine.note||'',
                },...p]);
                setAddOpen(false);setNewOrdine({tipo:'commessa',stato:'bozza'});
              }} style={{flex:2,background:'#28A0A0',color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 3px 0 0 #156060'}}>Salva ordine</button>
            </div>
          </div>
        )}

        {/* Lista per commessa */}
        {filtro!=='personale'&&(<>
          <div style={{fontWeight:700,fontSize:13,color:'#0D1F1F',marginTop:4}}>Per commessa</div>
          {FL_COMMESSE.map(co=>{
            const ords = ordiniFiltrati.filter(o=>o.commessaId===co.id);
            if(!ords.length) return null;
            const totCo = ords.reduce((s,o)=>s+o.importo,0);
            const a = az(co.aziendaId);
            return(
              <div key={co.id}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:'#0D1F1F'}}>{co.titolo}</div>
                    <div style={{fontSize:11,color:'#4A7070'}}>{a?.nome} · {co.cliente}</div>
                  </div>
                  <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:700,fontSize:13,color:'#28A0A0'}}>€{totCo}</span>
                </div>
                {ords.map(o=>(
                  <button key={o.id} onClick={()=>setSelOrdine(o.id)}
                    style={{...CB(STATO_ORDINE_COLOR[o.stato]+'40'),marginBottom:6}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{flex:1,paddingRight:8}}>
                        <div style={{fontWeight:600,fontSize:13,color:'#0D1F1F'}}>{o.desc}</div>
                        <div style={{display:'flex',gap:6,alignItems:'center',marginTop:4}}>
                          <StatoBadge stato={o.stato}/>
                          <span style={{fontSize:10,color:'#8BBCBC'}}>{o.qty} {o.um} · {o.fornitore}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:700,fontSize:13,color:'#28A0A0'}}>€{o.importo}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8E4E4" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </>)}

        {/* Lista personali */}
        {filtro!=='commessa'&&(<>
          <div style={{fontWeight:700,fontSize:13,color:'#0D1F1F',marginTop:filtro==='tutti'?8:4}}>Ordini personali</div>
          <div style={{fontSize:11,color:'#4A7070',marginBottom:4}}>Attrezzature e materiali per uso proprio</div>
          {ordiniFiltrati.filter(o=>o.tipo==='personale').map(o=>(
            <button key={o.id} onClick={()=>setSelOrdine(o.id)}
              style={{...CB(STATO_ORDINE_COLOR[o.stato]+'40'),marginBottom:6}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{flex:1,paddingRight:8}}>
                  <div style={{fontWeight:600,fontSize:13,color:'#0D1F1F'}}>{o.desc}</div>
                  <div style={{display:'flex',gap:6,alignItems:'center',marginTop:4}}>
                    <StatoBadge stato={o.stato}/>
                    <span style={{fontSize:10,color:'#8BBCBC'}}>{o.qty} {o.um} · {o.fornitore}</span>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:700,fontSize:13,color:'#3B7FE0'}}>€{o.importo}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8E4E4" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            </button>
          ))}
        </>)}

      </div>
    </div>
  );
}


// ├ö├Â├ç├ö├Â├ç├ö├Â├ç MAGAZZINO FREELANCE ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç CATALOGO GALASSIA (mock — in prod da Supabase ERP) ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const CATALOGO_GALASSIA = [
  {id:'CAT-001',nome:'Silicone neutro bianco',   um:'cartucce',  valore_unitario:5.5,  cat:'sigillanti',  fornitore:'Chimiver'},
  {id:'CAT-002',nome:'Silicone acetico trasparente',um:'cartucce',valore_unitario:4.8,  cat:'sigillanti',  fornitore:'Dow'},
  {id:'CAT-003',nome:'Tasselli Fischer SX 6',    um:'pz',        valore_unitario:0.18, cat:'fissaggi',    fornitore:'Fischer'},
  {id:'CAT-004',nome:'Tasselli Fischer SX 8',    um:'pz',        valore_unitario:0.25, cat:'fissaggi',    fornitore:'Fischer'},
  {id:'CAT-005',nome:'Tasselli Fischer SX 10',   um:'pz',        valore_unitario:0.35, cat:'fissaggi',    fornitore:'Fischer'},
  {id:'CAT-006',nome:'Schiuma poliuretanica',    um:'bombolette',valore_unitario:8.5,  cat:'sigillanti',  fornitore:'Soudal'},
  {id:'CAT-007',nome:'Schiuma poliuretanica pro',um:'bombolette',valore_unitario:11.5, cat:'sigillanti',  fornitore:'Soudal'},
  {id:'CAT-008',nome:'Guanti anti-taglio S',     um:'paia',      valore_unitario:5.5,  cat:'DPI',         fornitore:'3M'},
  {id:'CAT-009',nome:'Guanti anti-taglio L',     um:'paia',      valore_unitario:6.0,  cat:'DPI',         fornitore:'3M'},
  {id:'CAT-010',nome:'Viti inox M6x60',          um:'pz',        valore_unitario:0.18, cat:'fissaggi',    fornitore:'Ferramenta Greco'},
  {id:'CAT-011',nome:'Viti inox M8x80',          um:'pz',        valore_unitario:0.28, cat:'fissaggi',    fornitore:'Ferramenta Greco'},
  {id:'CAT-012',nome:'Coprifili alluminio 40mm', um:'mt',        valore_unitario:4.2,  cat:'finiture',    fornitore:'Edilco'},
  {id:'CAT-013',nome:'Coprifili alluminio 60mm', um:'mt',        valore_unitario:5.8,  cat:'finiture',    fornitore:'Edilco'},
  {id:'CAT-014',nome:'Nastro adesivo EPDM',      um:'rotoli',    valore_unitario:12.0, cat:'sigillanti',  fornitore:'Tremco'},
  {id:'CAT-015',nome:'Biadesivo strutturale',    um:'rotoli',    valore_unitario:18.5, cat:'sigillanti',  fornitore:'Sika'},
  {id:'CAT-016',nome:'Distanziali PVC 5mm',      um:'pz',        valore_unitario:0.12, cat:'fissaggi',    fornitore:'Edilco'},
  {id:'CAT-017',nome:'Distanziali PVC 10mm',     um:'pz',        valore_unitario:0.15, cat:'fissaggi',    fornitore:'Edilco'},
  {id:'CAT-018',nome:'Coppella PVC bianca',      um:'pz',        valore_unitario:0.08, cat:'finiture',    fornitore:'Edilco'},
];


function FattureFreelance() {
  const [sez, setSez] = React.useState('dashboard');
  const [fatture, setFatture] = React.useState<any[]>([...FL_FATTURE]);
  const [spese, setSpese] = React.useState<any[]>([...FL_SPESE_GENERALI_INIT]);
  const [attrezzature, setAttrezzature] = React.useState<any[]>([...FL_ATTREZZATURE_INIT]);
  const [scadenziario, setScadenziario] = React.useState<any[]>([...FL_SCADENZIARIO_INIT]);
  const [addSpesaOpen, setAddSpesaOpen] = React.useState(false);
  const [newSpesa, setNewSpesa] = React.useState<any>({});
  const [selFattura, setSelFattura] = React.useState('');

  const C: React.CSSProperties = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid '+DS.border,boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};

  const totIncassato = fatture.filter(f=>f.stato==='pagata').reduce((s,f)=>s+f.importo,0);
  const totDaIncassare = fatture.filter(f=>f.stato!=='pagata').reduce((s,f)=>s+f.importo,0);
  const totSpeseMese = spese.filter(s=>s.data?.startsWith('2026-04')).reduce((s,x)=>s+x.importo,0);
  const scadenzeProssime = scadenziario.filter(s=>s.stato==='da_pagare');
  const totScadenze = scadenzeProssime.reduce((s,x)=>s+x.importo,0);
  const margine = totIncassato - totSpeseMese;

  const pill = (bg:string,col:string,txt:string) => <span style={{background:bg,color:col,borderRadius:20,padding:'2px 9px',fontSize:10,fontWeight:700}}>{txt}</span>;

  const SEZIONI = [
    {id:'dashboard',l:'Home'},
    {id:'fatture',l:'Fatture'},
    {id:'spese',l:'Spese'},
    {id:'attrezzature',l:'Mezzi'},
    {id:'scadenziario',l:'Scadenze'},
  ];

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{background:DS.topbar,padding:'12px 16px 0',flexShrink:0}}>
        <div style={{color:'#fff',fontWeight:800,fontSize:15,marginBottom:10}}>Contabilità</div>
        <div style={{display:'flex',overflowX:'auto',gap:0,paddingBottom:0}}>
          {SEZIONI.map(s=>(
            <button key={s.id} onClick={()=>setSez(s.id)} style={{flexShrink:0,background:'none',border:'none',padding:'8px 14px',cursor:'pointer',color:sez===s.id?DS.teal:'#8BBCBC',fontSize:11,fontWeight:700,fontFamily:DS.ui,borderBottom:sez===s.id?'2px solid '+DS.teal:'2px solid transparent',whiteSpace:'nowrap'}}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>

        {/* DASHBOARD */}
        {sez==='dashboard'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {/* KPI principali */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{...C,background:'linear-gradient(135deg,#1A9E73,#0F7A56)',border:'none'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Incassato</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:24,color:'#fff'}}>€{totIncassato.toLocaleString('it-IT')}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.6)',marginTop:2}}>questo mese</div>
              </div>
              <div style={{...C,background:'linear-gradient(135deg,'+DS.teal+','+DS.tealDark+')',border:'none'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Da incassare</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:24,color:'#fff'}}>€{totDaIncassare.toLocaleString('it-IT')}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.6)',marginTop:2}}>{fatture.filter(f=>f.stato!=='pagata').length} fatture aperte</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={C}>
                <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Spese aprile</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:20,color:DS.red}}>€{totSpeseMese.toLocaleString('it-IT')}</div>
              </div>
              <div style={C}>
                <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Margine</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:20,color:margine>=0?DS.green:DS.red}}>€{margine.toLocaleString('it-IT')}</div>
              </div>
            </div>

            {/* Scadenze urgenti */}
            {scadenzeProssime.length>0&&(
              <div style={{...C,borderColor:'rgba(208,128,8,0.3)',background:'rgba(208,128,8,0.04)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.amber}}>Scadenze da pagare</div>
                  <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:14,color:DS.amber}}>€{totScadenze}</span>
                </div>
                {scadenzeProssime.map((s:any)=>(
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(208,128,8,0.15)'}}>
                    <div>
                      <div style={{fontSize:13,color:DS.text,fontWeight:600}}>{s.desc}</div>
                      <div style={{fontSize:10,color:DS.textMid}}>Scadenza {s.scadenza?.slice(5).replace('-','/')}</div>
                    </div>
                    <span style={{fontFamily:DS.mono,fontWeight:700,color:DS.amber}}>€{s.importo}</span>
                  </div>
                ))}
                <button onClick={()=>setSez('scadenziario')} style={{marginTop:10,width:'100%',background:DS.amber,color:'#fff',border:'none',borderRadius:8,padding:'9px',fontWeight:700,fontSize:12,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.amberDark}}>
                  Gestisci scadenze
                </button>
              </div>
            )}

            {/* Ultime fatture */}
            <div style={{fontSize:11,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Ultime fatture</div>
            {fatture.slice(0,4).map(f=>{
              const comm = FL_COMMESSE.find(c=>c.id===f.commessaId);
              const az = FL_AZIENDE.find(a=>a.id===f.aziendaId);
              return (
                <button key={f.id} onClick={()=>{setSelFattura(f.id);setSez('fatture');}} style={{...C,textAlign:'left',cursor:'pointer',width:'100%',display:'block',padding:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                    <div style={{flex:1,paddingRight:8}}>
                      <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{comm?.titolo||f.id}</div>
                      <div style={{fontSize:11,color:DS.textMid}}>{az?.nome||''} · {f.tipo}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:f.stato==='pagata'?DS.green:DS.teal}}>€{f.importo}</div>
                      {pill(f.stato==='pagata'?'rgba(26,158,115,0.1)':'rgba(40,160,160,0.1)',f.stato==='pagata'?DS.green:DS.teal,f.stato==='pagata'?'Pagata':'Da emettere')}
                    </div>
                  </div>
                  <div style={{fontSize:10,color:DS.textLight}}>{f.data}</div>
                </button>
              );
            })}
            <button onClick={()=>setSez('fatture')} style={{background:'none',border:'none',color:DS.teal,fontWeight:700,fontSize:12,cursor:'pointer',padding:'4px 0'}}>Tutte le fatture →</button>

            {/* Spesa rapida */}
            <button onClick={()=>{setAddSpesaOpen(true);setSez('spese');}} style={{display:'flex',alignItems:'center',gap:10,background:DS.tealLight,border:'1.5px dashed '+DS.border,borderRadius:14,padding:'12px 14px',cursor:'pointer',width:'100%',textAlign:'left'}}>
              <div style={{width:36,height:36,borderRadius:8,background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:DS.teal}}>Registra spesa rapida</div>
                <div style={{fontSize:11,color:DS.textMid}}>Carburante, materiali, pranzo...</div>
              </div>
            </button>
          </div>
        )}

        {/* FATTURE */}
        {sez==='fatture'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{...C,textAlign:'center'}}>
                <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Pagate</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.green}}>€{totIncassato}</div>
              </div>
              <div style={{...C,textAlign:'center'}}>
                <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>In attesa</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.teal}}>€{totDaIncassare}</div>
              </div>
            </div>
            {fatture.map(f=>{
              const comm=FL_COMMESSE.find(c=>c.id===f.commessaId);
              const az=FL_AZIENDE.find(a=>a.id===f.aziendaId);
              const isPagata=f.stato==='pagata';
              return (
                <div key={f.id} style={{...C,border:'1.5px solid '+(isPagata?'rgba(26,158,115,0.2)':DS.border)}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,color:DS.text,marginBottom:2}}>{comm?.titolo||f.commessaId}</div>
                      <div style={{fontSize:12,color:DS.textMid}}>{az?.nome} · {f.tipo} · {f.data}</div>
                    </div>
                    <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:isPagata?DS.green:DS.teal}}>€{f.importo}</div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    {pill(isPagata?'rgba(26,158,115,0.1)':'rgba(40,160,160,0.1)',isPagata?DS.green:DS.teal,isPagata?'Pagata':'Da emettere')}
                    {!isPagata&&(
                      <button onClick={()=>setFatture(p=>p.map(x=>x.id===f.id?{...x,stato:'pagata'}:x))} style={{background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 0 0 '+DS.greenDark}}>
                        Segna pagata
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SPESE */}
        {sez==='spese'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{...C,textAlign:'center'}}>
              <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Spese aprile 2026</div>
              <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:24,color:DS.red}}>€{totSpeseMese}</div>
            </div>
            <button onClick={()=>setAddSpesaOpen(v=>!v)} style={{background:DS.teal,color:'#fff',border:'none',borderRadius:12,padding:'12px',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 0 0 '+DS.tealDark,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Aggiungi spesa
            </button>
            {addSpesaOpen&&(
              <div style={C}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Nuova spesa</div>
                {[{k:'desc',p:'Descrizione'},{k:'importo',p:'Importo €',t:'number'},{k:'data',p:'Data',t:'date'}].map(f=>(
                  <input key={f.k} value={newSpesa[f.k]||''} onChange={e=>setNewSpesa((p:any)=>({...p,[f.k]:e.target.value}))} type={f.t||'text'} placeholder={f.p}
                    style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:8,fontFamily:f.t==='number'?DS.mono:DS.ui}}/>
                ))}
                <select value={newSpesa.cat||'trasporto'} onChange={e=>setNewSpesa((p:any)=>({...p,cat:e.target.value}))} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid '+DS.border,fontSize:13,outline:'none',background:'#fff',marginBottom:10}}>
                  {['trasporto','materiali','attrezzatura','leasing','tasse','pranzo','altro'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{setAddSpesaOpen(false);setNewSpesa({});}} style={{flex:1,background:DS.tealLight,color:DS.textMid,border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer'}}>Annulla</button>
                  <button onClick={()=>{
                    if(!newSpesa.desc||!newSpesa.importo) return;
                    setSpese(p=>[...p,{id:'SG-'+Date.now(),desc:newSpesa.desc,importo:Number(newSpesa.importo),cat:newSpesa.cat||'altro',data:newSpesa.data||new Date().toISOString().slice(0,10),ricorrente:false}]);
                    setAddSpesaOpen(false);setNewSpesa({});
                  }} style={{flex:2,background:DS.teal,color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer',boxShadow:'0 3px 0 0 '+DS.tealDark}}>Salva</button>
                </div>
              </div>
            )}
            {['trasporto','materiali','attrezzatura','leasing','tasse','pranzo','altro'].map(cat=>{
              const items=spese.filter(s=>s.cat===cat);
              if(!items.length) return null;
              const tot=items.reduce((s,x)=>s+x.importo,0);
              return (
                <div key={cat}>
                  <div style={{fontSize:11,fontWeight:700,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5,marginBottom:6,display:'flex',justifyContent:'space-between'}}>
                    {cat} <span style={{fontFamily:DS.mono,color:DS.red}}>€{tot}</span>
                  </div>
                  {items.map(s=>(
                    <div key={s.id} style={{...C,padding:10,marginBottom:6}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{s.desc}</div>
                          <div style={{fontSize:10,color:DS.textMid}}>{s.data?.slice(5).replace('-','/')} {s.ricorrente?'· ricorrente':''}</div>
                        </div>
                        <span style={{fontFamily:DS.mono,fontWeight:700,fontSize:15,color:DS.red}}>€{s.importo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ATTREZZATURE */}
        {sez==='attrezzature'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{...C,textAlign:'center'}}>
              <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Patrimonio attrezzature</div>
              <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:24,color:DS.teal}}>€{attrezzature.reduce((s,a)=>s+a.valore,0).toLocaleString('it-IT')}</div>
            </div>
            {attrezzature.map(a=>(
              <div key={a.id} style={{...C,padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:DS.text}}>{a.nome}</div>
                    <div style={{fontSize:11,color:DS.textMid,marginTop:2}}>{a.cat} · Acquisto {a.acquisto?.slice(0,7)}</div>
                    {a.targa&&<div style={{fontSize:11,color:DS.textMid}}>Targa: {a.targa} · {a.km?.toLocaleString('it-IT')} km</div>}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:DS.teal}}>€{a.valore?.toLocaleString('it-IT')}</div>
                    {pill(a.stato==='attiva'?'rgba(26,158,115,0.1)':'rgba(220,68,68,0.1)',a.stato==='attiva'?DS.green:DS.red,a.stato)}
                  </div>
                </div>
                {a.prossima_revisione&&(
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',background:'rgba(208,128,8,0.07)',borderRadius:8}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.amber} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{fontSize:11,color:DS.amber,fontWeight:600}}>Revisione: {a.prossima_revisione.slice(5).replace('-','/')+'/'+a.prossima_revisione.slice(0,4)}</span>
                  </div>
                )}
                {a.note&&<div style={{fontSize:11,color:DS.textMid,marginTop:6}}>{a.note}</div>}
              </div>
            ))}
          </div>
        )}

        {/* SCADENZIARIO */}
        {sez==='scadenziario'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{...C,textAlign:'center'}}>
                <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Da pagare</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.red}}>€{totScadenze}</div>
              </div>
              <div style={{...C,textAlign:'center'}}>
                <div style={{fontSize:10,color:DS.textLight,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Scadenze</div>
                <div style={{fontFamily:DS.mono,fontWeight:800,fontSize:18,color:DS.amber}}>{scadenzeProssime.length}</div>
              </div>
            </div>
            {scadenziario.map(s=>(
              <div key={s.id} style={{...C,border:'1.5px solid '+(s.stato==='pagato'?'rgba(26,158,115,0.15)':DS.border),padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:DS.text}}>{s.desc}</div>
                    <div style={{fontSize:11,color:DS.textMid}}>Scadenza {s.scadenza?.slice(5).replace('-','/')+'/'+s.scadenza?.slice(0,4)} · {s.cat}</div>
                  </div>
                  <span style={{fontFamily:DS.mono,fontWeight:800,fontSize:16,color:s.stato==='pagato'?DS.green:DS.red}}>€{s.importo}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  {pill(s.stato==='pagato'?'rgba(26,158,115,0.1)':'rgba(220,68,68,0.1)',s.stato==='pagato'?DS.green:DS.red,s.stato==='pagato'?'Pagato':'Da pagare')}
                  {s.stato!=='pagato'&&(
                    <button onClick={()=>setScadenziario(p=>p.map(x=>x.id===s.id?{...x,stato:'pagato'}:x))} style={{background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 0 0 '+DS.greenDark}}>
                      Segna pagato
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


function HomeFreelanceDashboard({onNav}:{onNav:(v:string)=>void}) {
  const oggi = new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
  const [pressed,setPressed] = React.useState('');
  const [meteoTemp, setMeteoTemp] = React.useState<number|null>(null);
  const [meteoDesc, setMeteoDesc] = React.useState('');
  const [meteoIcona, setMeteoIcona] = React.useState<'sole'|'nuvole'|'pioggia'>('sole');

  React.useEffect(()=>{
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Brindisi,IT&units=metric&lang=it&appid=4d8fb5b93d4af21d66a2948a49b7a7e7')
      .then(r=>r.json()).then(d=>{
        if(d.cod===200){
          setMeteoTemp(Math.round(d.main.temp));
          setMeteoDesc(d.weather[0].description);
          const id=d.weather[0].id;
          setMeteoIcona(id>=500?'pioggia':id>=801?'nuvole':'sole');
        } else { setMeteoTemp(22); setMeteoDesc('Soleggiato'); }
      }).catch(()=>{ setMeteoTemp(22); setMeteoDesc('Soleggiato'); });
  },[]);

  const daIncassare = FL_FATTURE.filter(f=>f.stato==='da_emettere').reduce((s,f)=>s+f.importo,0);
  const lavoriAperti = FL_BACHECA.filter(b=>b.stato==='aperto').length;
  const commesseAttive = FL_COMMESSE.filter(c=>c.stato==='in_corso').length;
  const sottoScorta = FL_MAGAZZINO_INIT.filter((a:any)=>a.giacenza<=a.scorta_min).length;
  const scadenzeBrevi = FL_SCADENZIARIO_INIT.filter(s=>s.stato==='da_pagare').length;

  // Bottone 3D helper
  const btn3d = (id:string, bg:string, sh:string, extra?:React.CSSProperties): React.CSSProperties => ({
    background: bg, color:'#fff', border:'none', borderRadius:12, cursor:'pointer',
    boxShadow: pressed===id ? 'none' : `0 5px 0 0 ${sh}`,
    transform: pressed===id ? 'translateY(4px)' : 'translateY(0)',
    transition:'box-shadow 80ms, transform 80ms',
    fontFamily:'system-ui,-apple-system,sans-serif', fontWeight:700,
    ...extra,
  });

  const btn3dGhost = (id:string): React.CSSProperties => ({
    background:'#EEF8F8', color:'#28A0A0', border:'1.5px solid #C8E4E4',
    borderRadius:12, cursor:'pointer',
    boxShadow: pressed===id ? 'none' : '0 4px 0 0 #A8CCCC',
    transform: pressed===id ? 'translateY(3px)' : 'translateY(0)',
    transition:'box-shadow 80ms, transform 80ms',
    fontFamily:'system-ui,-apple-system,sans-serif', fontWeight:700,
  });

  const C: React.CSSProperties = {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:14,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:14};

  const MeteoIcon = () => {
    if(meteoIcona==='pioggia') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="16" y1="19" x2="16" y2="21"/></svg>;
    if(meteoIcona==='nuvole') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>;
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>;
  };

  return(
    <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>

      {/* Vetro sabbiato */}
      <div style={{
        background:'linear-gradient(180deg,rgba(13,31,31,0.98) 0%,rgba(15,38,38,0.96) 50%,rgba(13,31,31,0.94) 100%)',
        backdropFilter:'blur(20px) saturate(180%)',
        WebkitBackdropFilter:'blur(20px) saturate(180%)',
        borderBottom:'1px solid rgba(40,160,160,0.15)',
        padding:'16px 16px 20px',
        display:'flex',flexDirection:'column',gap:16,
      }}>
        {/* Riga 1: saluto + meteo */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(139,188,188,0.6)',letterSpacing:0.3,textTransform:'capitalize',marginBottom:4}}>{oggi}</div>
            <div style={{fontWeight:800,color:'#F2F1EC',fontSize:22,letterSpacing:-0.5,lineHeight:1}}>Marco Vito</div>
            <div style={{fontSize:11,color:'rgba(139,188,188,0.5)',marginTop:4}}>Montatore Freelance</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(40,160,160,0.2)',borderRadius:14,padding:'10px 14px',textAlign:'center',minWidth:72}}>
            <MeteoIcon/>
            <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:20,color:'#F2F1EC',lineHeight:1,marginTop:4}}>{meteoTemp??'--'}{String.fromCharCode(176)}C</div>
            <div style={{fontSize:9,color:'rgba(139,188,188,0.6)',marginTop:3,textTransform:'capitalize',lineHeight:1.2}}>{meteoDesc||'Brindisi'}</div>
          </div>
        </div>

        {/* KPI — bottoni 3D scuri */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,paddingRight:48}}>
          {[
            {id:'k1',l:'commesse',v:`${commesseAttive}`,c:'#28A0A0',sh:'rgba(40,160,160,0.6)',nav:'commesse_fl'},
            {id:'k2',l:'in bacheca',v:`${lavoriAperti}`,c:'#1A9E73',sh:'rgba(26,158,115,0.6)',nav:'bacheca'},
            {id:'k3',l:'da incassare',v:`€${daIncassare.toLocaleString('it-IT')}`,c:'#F5B942',sh:'rgba(208,128,8,0.6)',nav:'fatture'},
          ].map(k=>(
            <button key={k.id}
              onPointerDown={()=>setPressed(k.id)}
              onPointerUp={()=>{setPressed('');onNav(k.nav);}}
              style={{background:'rgba(255,255,255,0.10)',border:'1px solid rgba(40,160,160,0.25)',borderRadius:12,padding:'12px 6px',cursor:'pointer',textAlign:'center',
                boxShadow:pressed===k.id?'none':`0 4px 0 0 ${k.sh}`,
                transform:pressed===k.id?'translateY(3px)':'translateY(0)',
                transition:'box-shadow 80ms,transform 80ms',
              }}>
              <div style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:17,color:k.c,lineHeight:1}}>{k.v}</div>
              <div style={{fontSize:9,color:'rgba(139,188,188,0.55)',marginTop:5,letterSpacing:0.3}}>{k.l}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:12}}>

        {/* Commessa oggi */}
        {FL_COMMESSE.filter(c=>c.stato==='in_corso').slice(0,1).map(co=>(
          <div key={co.id} style={C}>
            <div style={{fontSize:11,color:'#28A0A0',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>OGGI AL CANTIERE</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontWeight:800,fontSize:16,color:'#0D1F1F'}}>{co.titolo}</div>
                <div style={{fontSize:12,color:'#4A7070',marginTop:2}}>{co.cliente}</div>
              </div>
              <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,fontSize:16,color:'#28A0A0'}}>€{co.importo.toLocaleString('it-IT')}</span>
            </div>
            <div style={{background:'#EEF8F8',borderRadius:6,height:8,overflow:'hidden',marginBottom:6}}>
              <div style={{background:'#28A0A0',height:'100%',width:`${co.avanzamento}%`,borderRadius:6}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#4A7070',marginBottom:12}}>
              <span>{co.avanzamento}% completato</span><span>{co.vani} vani</span>
            </div>
            <button
              onPointerDown={()=>setPressed('apri')}
              onPointerUp={()=>{setPressed('');onNav('commessa');}}
              style={{...btn3d('apri','#28A0A0','#156060'),width:'100%',padding:'13px',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              Apri lavoro
            </button>
          </div>
        ))}

        {/* Nuovi lavori bacheca */}
        {FL_BACHECA.filter(b=>b.stato==='aperto').length>0&&(
          <div style={C}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:11,color:'#1A9E73',fontWeight:700,letterSpacing:0.5}}>NUOVI LAVORI</div>
              <button onClick={()=>onNav('bacheca')} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#28A0A0',fontWeight:700}}>Vedi tutti →</button>
            </div>
            {FL_BACHECA.filter(b=>b.stato==='aperto').slice(0,2).map((lav,i)=>(
              <button key={lav.id}
                onPointerDown={()=>setPressed('lav'+i)}
                onPointerUp={()=>{setPressed('');onNav('bacheca');}}
                style={{width:'100%',background:'rgba(40,160,160,0.05)',
                  border:`1.5px solid ${lav.urgente?'#DC4444':'#C8E4E4'}`,
                  borderRadius:10,padding:'11px',marginBottom:6,cursor:'pointer',textAlign:'left',
                  boxShadow:pressed==='lav'+i?'none':`0 4px 0 0 ${lav.urgente?'#A83030':'#A8CCCC'}`,
                  transform:pressed==='lav'+i?'translateY(3px)':'translateY(0)',
                  transition:'box-shadow 80ms,transform 80ms',
                }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{flex:1,paddingRight:8}}>
                    <div style={{fontWeight:600,fontSize:13,color:'#0D1F1F'}}>{lav.titolo}</div>
                    <div style={{fontSize:11,color:'#4A7070',marginTop:2}}>{lav.cliente} · {lav.vani} vani</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {lav.urgente&&<div style={{fontSize:9,fontWeight:700,color:'#DC4444',marginBottom:2}}>URGENTE</div>}
                    <span style={{fontFamily:'"JetBrains Mono",monospace',fontWeight:800,color:'#28A0A0'}}>€{lav.budget}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Alert */}
        {(scadenzeBrevi>0||sottoScorta>0)&&(
          <div style={{...C,borderColor:'#D08008'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#D08008',marginBottom:8,letterSpacing:0.5}}>ATTENZIONE</div>
            {scadenzeBrevi>0&&<button onClick={()=>onNav('fatture')} style={{width:'100%',background:'none',border:'none',cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:sottoScorta>0?'1px solid #EEF8F8':'none'}}>
              <span style={{fontSize:12,color:'#0D1F1F'}}>{scadenzeBrevi} scadenze da pagare</span>
              <span style={{fontSize:12,color:'#D08008',fontWeight:700}}>→</span>
            </button>}
            {sottoScorta>0&&<button onClick={()=>onNav('magazzino_fl')} style={{width:'100%',background:'none',border:'none',cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',padding:'6px 0'}}>
              <span style={{fontSize:12,color:'#0D1F1F'}}>{sottoScorta} articoli sotto scorta</span>
              <span style={{fontSize:12,color:'#DC4444',fontWeight:700}}>→</span>
            </button>}
          </div>
        )}

        {/* Riepilogo configurabile */}
        <RiepilogoWidget commesse={FL_COMMESSE} fatture={FL_FATTURE} spese={[]} aziende={FL_AZIENDE}/>

      </div>
    </div>
  );
}

function PausaModal({onConferma,onAnnulla}:{onConferma:(motivo:string)=>void;onAnnulla:()=>void}){
  const [motivo,setMotivo]=React.useState('');
  const [custom,setCustom]=React.useState('');
  const MOTIVI=['Pranzo','Problema tecnico','Cliente assente','Attesa materiali','Fine turno','Altro'];
  const DS_MODAL = {teal:'#28A0A0',tealDark:'#156060',border:'#C8E4E4',text:'#0D1F1F',textMid:'#4A7070',red:'#DC4444'};
  return(
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(13,31,31,0.85)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:420,padding:24}}>
        <div style={{fontWeight:800,fontSize:17,color:DS_MODAL.text,marginBottom:16}}>Motivo pausa</div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
          {MOTIVI.map(m=>(
            <button key={m} onClick={()=>setMotivo(m)}
              style={{padding:'11px 14px',borderRadius:10,border:`2px solid ${motivo===m?DS_MODAL.teal:DS_MODAL.border}`,background:motivo===m?'#EEF8F8':'#fff',fontWeight:600,fontSize:13,color:motivo===m?DS_MODAL.teal:DS_MODAL.text,cursor:'pointer',textAlign:'left'}}>
              {m}
            </button>
          ))}
          {motivo==='Altro'&&(
            <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Specifica..."
              style={{padding:'10px 12px',borderRadius:8,border:`1.5px solid ${DS_MODAL.border}`,fontSize:13,outline:'none'}}/>
          )}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onAnnulla} style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${DS_MODAL.border}`,background:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>Annulla</button>
          <button onClick={()=>motivo&&onConferma(motivo==='Altro'?custom||motivo:motivo)}
            style={{flex:2,padding:'12px',borderRadius:10,border:'none',background:DS_MODAL.teal,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:`0 4px 0 0 ${DS_MODAL.tealDark}`}}>
            Conferma pausa
          </button>
        </div>
      </div>
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç BLOCCO MODAL ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function BloccoModal({commessaId,onClose,onSegnala}:{commessaId:string;onClose:()=>void;onSegnala:(tipo:string,nota:string)=>void}){
  const [tipo,setTipo]=React.useState('');
  const [nota,setNota]=React.useState('');
  const TIPI=[{id:'struttura',label:'Problema strutturale'},{id:'materiale',label:'Materiale mancante'},{id:'cliente',label:'Cliente assente'},{id:'misure',label:'Misure errate'},{id:'altro',label:'Altro problema'}];
  const DS_M={teal:'#28A0A0',tealDark:'#156060',border:'#C8E4E4',text:'#0D1F1F',red:'#DC4444',redDark:'#A83030'};
  return(
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(13,31,31,0.85)',display:'flex',alignItems:'flex-end'}}>
      <div style={{background:'#fff',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:420,padding:24}}>
        <div style={{fontWeight:800,fontSize:17,color:DS_M.text,marginBottom:4}}>Segnala blocco</div>
        <div style={{fontSize:12,color:'#4A7070',marginBottom:16}}>{commessaId}</div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {TIPI.map(t=>(
            <button key={t.id} onClick={()=>setTipo(t.id)}
              style={{padding:'11px 14px',borderRadius:10,border:`2px solid ${tipo===t.id?DS_M.red:DS_M.border}`,background:tipo===t.id?'rgba(220,68,68,0.08)':'#fff',fontWeight:600,fontSize:13,color:tipo===t.id?DS_M.red:DS_M.text,cursor:'pointer',textAlign:'left'}}>
              {t.label}
            </button>
          ))}
        </div>
        <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Note aggiuntive (opzionale)" rows={2}
          style={{width:'100%',padding:'10px 12px',borderRadius:8,border:`1.5px solid ${DS_M.border}`,fontSize:13,outline:'none',resize:'none',boxSizing:'border-box',marginBottom:14}}/>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${DS_M.border}`,background:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>Annulla</button>
          <button onClick={()=>tipo&&onSegnala(tipo,nota)} disabled={!tipo}
            style={{flex:2,padding:'12px',borderRadius:10,border:'none',background:tipo?DS_M.red:'#EEF8F8',color:tipo?'#fff':'#8BBCBC',fontWeight:700,fontSize:14,cursor:tipo?'pointer':'default',boxShadow:tipo?`0 4px 0 0 ${DS_M.redDark}`:'none'}}>
            Segnala blocco
          </button>
        </div>
      </div>
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç CAD ORDINE MODAL ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function CadOrdineModal({imgData,vanoId,vanoNome,onClose,onCrea}:{imgData:string;vanoId:number;vanoNome:string;onClose:()=>void;onCrea:(desc:string)=>void}){
  const [desc,setDesc]=React.useState('Ordine da disegno — '+vanoNome);
  const DS_M={teal:'#28A0A0',tealDark:'#156060',border:'#C8E4E4',text:'#0D1F1F'};
  return(
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(13,31,31,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:380,padding:20}}>
        <div style={{fontWeight:800,fontSize:16,color:DS_M.text,marginBottom:12}}>Crea ordine dal disegno</div>
        <img src={imgData} style={{width:'100%',borderRadius:8,marginBottom:12,border:`1px solid ${DS_M.border}`}} alt="Disegno CAD"/>
        <input value={desc} onChange={e=>setDesc(e.target.value)}
          style={{width:'100%',padding:'10px 12px',borderRadius:8,border:`1.5px solid ${DS_M.border}`,fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:14}}/>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'11px',borderRadius:10,border:`2px solid ${DS_M.border}`,background:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>Annulla</button>
          <button onClick={()=>onCrea(desc)} style={{flex:2,padding:'11px',borderRadius:10,border:'none',background:DS_M.teal,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:`0 3px 0 0 ${DS_M.tealDark}`}}>
            Crea ordine
          </button>
        </div>
      </div>
    </div>
  );
}


// ├ö├Â├ç├ö├Â├ç├ö├Â├ç PIPELINE FREELANCE DEFAULT ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
const PIPELINE_FL_DEFAULT = [
  {id:'bacheca',   nome:'Bacheca',        ico:'IN',  attiva:true,  custom:false, emailTemplate:null, checklistMontaggio:[], automazioni:[], gateRequisiti:[], gateBloccante:false, checklistObbligatoria:false},
  {id:'offerta',   nome:'Offerta inviata', ico:'OUT', attiva:true,  custom:false, emailTemplate:{oggetto:'Offerta lavoro - {{cliente}}',corpo:'Gentile cliente,\nAllego la mia offerta.',attiva:false,destinatario:'cliente'}, checklistMontaggio:[], automazioni:[{tipo:'genera_pdf'}], gateRequisiti:[], gateBloccante:false, checklistObbligatoria:false},
  {id:'accettata', nome:'Accettata',       ico:'OK',  attiva:true,  custom:false, emailTemplate:{oggetto:'Conferma accettazione - {{cliente}}',corpo:'Gentile cliente,\nConfermo la sua accettazione.',attiva:true,destinatario:'cliente'}, checklistMontaggio:[], automazioni:[{tipo:'crea_task'},{tipo:'notifica_cliente'}], gateRequisiti:[{tipo:'acconto_ricevuto'}], gateBloccante:false, checklistObbligatoria:false},
  {id:'esecuzione',nome:'In esecuzione',   ico:'WRK', attiva:true,  custom:false, emailTemplate:null, checklistMontaggio:['Verifica misure vano','Foto prima dei lavori','Controllo materiali'], automazioni:[{tipo:'notifica_cliente'}], gateRequisiti:[{tipo:'materiali_arrivati'}], gateBloccante:true, checklistObbligatoria:false},
  {id:'collaudo',  nome:'Collaudo',        ico:'CHK', attiva:true,  custom:false, emailTemplate:{oggetto:'Lavori completati - {{cliente}}',corpo:'Gentile cliente,\nI lavori sono stati completati.',attiva:false,destinatario:'cliente'}, checklistMontaggio:['Foto fine lavoro','Verbale firmato','Pulizia cantiere'], automazioni:[{tipo:'genera_pdf'}], gateRequisiti:[{tipo:'checklist_completa'},{tipo:'firma_cliente'}], gateBloccante:true, checklistObbligatoria:true},
  {id:'fattura',   nome:'Fattura emessa',  ico:'FAT', attiva:true,  custom:false, emailTemplate:{oggetto:'Fattura n.{{num}} - {{cliente}}',corpo:'Gentile cliente,\nIn allegato la fattura.',attiva:true,destinatario:'cliente'}, checklistMontaggio:[], automazioni:[{tipo:'genera_pdf'},{tipo:'follow_up'}], gateRequisiti:[{tipo:'documenti_ok'}], gateBloccante:true, checklistObbligatoria:false},
  {id:'chiusura',  nome:'Chiusa',          ico:'END', attiva:true,  custom:false, emailTemplate:null, checklistMontaggio:[], automazioni:[], gateRequisiti:[], gateBloccante:false, checklistObbligatoria:false},
];

function ImpostazioniFreelance() {
  const [pipeline, setPipeline] = React.useState<any[]>(PIPELINE_FL_DEFAULT);
  const [expanded, setExpanded] = React.useState<string|null>(null);
  const [phaseTab, setPhaseTab] = React.useState('email');
  const [mainTab, setMainTab] = React.useState<'flusso'|'profilo'|'notifiche'>('flusso');
  const [saved, setSaved] = React.useState(false);

  const PRI = '#28A0A0';
  const GRN = '#1A9E73';
  const sub = '#4A7070';
  const S = {
    card: {background:'linear-gradient(145deg,#fff,#f4fcfc)',borderRadius:12,border:'1.5px solid #C8E4E4',boxShadow:'0 2px 8px rgba(40,160,160,.08)',padding:'10px 12px',marginBottom:0} as React.CSSProperties,
    input: {background:'#fff',border:'1px solid #C8E4E4',borderRadius:8,padding:'7px 10px',fontSize:12,outline:'none',fontFamily:'system-ui,sans-serif',width:'100%',boxSizing:'border-box' as const} as React.CSSProperties,
  };

  const upd = (i:number, patch:any) => setPipeline(db=>db.map((x,j)=>j===i?{...x,...patch}:x));

  const GATE_OPTIONS = [
    {value:'offerta_inviata',label:'Offerta inviata'},
    {value:'acconto_ricevuto',label:'Acconto ricevuto'},
    {value:'materiali_arrivati',label:'Materiali arrivati'},
    {value:'documenti_ok',label:'Documenti completi'},
    {value:'checklist_completa',label:'Checklist completata'},
    {value:'firma_cliente',label:'Firma cliente'},
  ];
  const AUTO_OPTIONS = [
    {value:'notifica_cliente',label:'Notifica cliente'},
    {value:'notifica_team',label:'Notifica team'},
    {value:'genera_pdf',label:'Genera PDF'},
    {value:'crea_task',label:'Crea task'},
    {value:'follow_up',label:'Follow-up cliente'},
    {value:'verifica_magazzino',label:'Verifica magazzino'},
  ];

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Tab principali */}
      <div style={{background:'#0D1F1F',display:'flex',borderBottom:'1px solid rgba(40,160,160,0.2)',flexShrink:0}}>
        {(['flusso','profilo','notifiche'] as const).map(t=>(
          <button key={t} onClick={()=>setMainTab(t)}
            style={{flex:1,background:'none',border:'none',padding:'10px 4px',cursor:'pointer',
              color:mainTab===t?PRI:'#8BBCBC',fontSize:11,fontWeight:700,
              borderBottom:mainTab===t?`2px solid ${PRI}`:'2px solid transparent'}}>
            {t==='flusso'?'Pipeline fasi':t==='profilo'?'Profilo':'Notifiche'}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:6}}>

        {mainTab==='flusso'&&(<>
          <div style={{fontSize:12,color:sub,padding:'0 2px 6px',lineHeight:1.5}}>
            Personalizza il flusso di lavoro. Ogni fase controlla <span style={{color:PRI,fontWeight:700}}>email</span> + <span style={{color:'#E8A020',fontWeight:700}}>checklist</span> + <span style={{color:GRN,fontWeight:700}}>automazioni</span>.
          </div>

          {pipeline.map((p,i)=>{
            const isExp = expanded===p.id;
            return(
              <div key={p.id} style={{marginBottom:2, opacity:p.attiva===false?0.45:1}}>

                {/* HEADER ACCORDION — identico all'ERP */}
                <div style={{...S.card, borderRadius:isExp?'10px 10px 0 0':10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>

                    {/* Frecce riordino */}
                    <div style={{display:'flex',flexDirection:'column',gap:0,flexShrink:0}}>
                      <div onClick={e=>{e.stopPropagation();if(i===0)return;const a=[...pipeline];[a[i-1],a[i]]=[a[i],a[i-1]];setPipeline(a);}}
                        style={{cursor:i===0?'default':'pointer',opacity:i===0?0.2:1,lineHeight:1,userSelect:'none'}}><svg width='10' height='8' viewBox='0 0 10 8' fill='none' stroke='#28A0A0' strokeWidth='1.5'><polyline points='2,6 5,2 8,6'/></svg></div>
                      <div onClick={e=>{e.stopPropagation();if(i===pipeline.length-1)return;const a=[...pipeline];[a[i],a[i+1]]=[a[i+1],a[i]];setPipeline(a);}}
                        style={{cursor:i===pipeline.length-1?'default':'pointer',opacity:i===pipeline.length-1?0.2:1,lineHeight:1,userSelect:'none'}}><svg width='10' height='8' viewBox='0 0 10 8' fill='none' stroke='#28A0A0' strokeWidth='1.5'><polyline points='2,2 5,6 8,2'/></svg></div>
                    </div>

                    <div style={{width:32,height:32,borderRadius:8,background:'#EEF8F8',border:'1px solid #C8E4E4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:9,fontWeight:800,color:'#28A0A0'}}>{p.ico}</span>
                    </div>

                    {/* Nome (NON input — solo testo) */}
                    <span onClick={()=>setExpanded(isExp?null:p.id)} style={{flex:1,fontSize:14,fontWeight:700,color:'#0D1F1F',cursor:'pointer'}}>{p.nome}</span>

                    <div onClick={()=>setExpanded(isExp?null:p.id)} style={{width:26,height:26,borderRadius:6,background:'#EEF8F8',border:'1px solid #C8E4E4',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#28A0A0" strokeWidth="2.5" strokeLinecap="round">{isExp?<polyline points="18 15 12 9 6 15"/>:<polyline points="6 9 12 15 18 9"/>}</svg>
                    </div>
                    {/* Toggle attiva/disattiva */}
                    <div onClick={e=>{e.stopPropagation();if(p.id==='chiusura')return;upd(i,{attiva:!p.attiva});}}
                      style={{width:36,height:20,borderRadius:10,background:p.attiva!==false?GRN:'#C8E4E4',cursor:p.id==='chiusura'?'default':'pointer',position:'relative',flexShrink:0,transition:'background 200ms'}}>
                      <div style={{position:'absolute',top:2,left:p.attiva!==false?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 200ms'}}/>
                    </div>

                    {/* Elimina (solo fasi custom) */}
                    {p.custom&&(
                      <div onClick={e=>{e.stopPropagation();setPipeline(db=>db.filter((_,j)=>j!==i));}}
                        style={{cursor:'pointer',color:'#DC4444',fontSize:18,lineHeight:1,flexShrink:0}}>×</div>
                    )}
                  </div>
                </div>

                {/* BODY ACCORDION */}
                {isExp&&(
                  <div style={{background:'#fff',border:'1.5px solid #C8E4E4',borderTop:'none',borderRadius:'0 0 10px 10px'}}>
                    {/* Sub-tab */}
                    <div style={{display:'flex',borderBottom:'1px solid #C8E4E4'}}>
                      {[{id:'email',l:'Email',c:GRN},{id:'checklist',l:'Checklist',c:'#E8A020'},{id:'auto',l:'Auto',c:PRI},{id:'gate',l:'Gate',c:'#DC4444'}].map(tab=>(
                        <div key={tab.id} onClick={e=>{e.stopPropagation();setPhaseTab(tab.id);}}
                          style={{flex:1,padding:'8px 4px',textAlign:'center',fontSize:10,fontWeight:700,cursor:'pointer',
                            color:phaseTab===tab.id?tab.c:sub,
                            borderBottom:phaseTab===tab.id?`2px solid ${tab.c}`:'2px solid transparent',
                            background:phaseTab===tab.id?tab.c+'08':'transparent'}}>
                          {tab.l}
                        </div>
                      ))}
                    </div>
                    <div style={{padding:12}}>

                      {/* EMAIL */}
                      {phaseTab==='email'&&(
                        <div>
                          <div style={{fontSize:11,color:sub,marginBottom:8}}>Template email automatica quando la commessa entra in questa fase.</div>
                          <div style={{fontSize:9,fontWeight:700,color:sub,marginBottom:4}}>OGGETTO</div>
                          <input value={p.emailTemplate?.oggetto||''} placeholder={`es: Conferma ${p.nome} - {{cliente}}`}
                            onChange={e=>upd(i,{emailTemplate:{...(p.emailTemplate||{}),oggetto:e.target.value}})}
                            style={{...S.input,marginBottom:8}}/>
                          <div style={{fontSize:9,fontWeight:700,color:sub,marginBottom:4}}>CORPO</div>
                          <textarea value={p.emailTemplate?.corpo||''} placeholder="Gentile cliente,..."
                            onChange={e=>upd(i,{emailTemplate:{...(p.emailTemplate||{}),corpo:e.target.value}})}
                            style={{...S.input,minHeight:80,resize:'vertical'} as React.CSSProperties}/>
                          <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center',flexWrap:'wrap'}}>
                            <div style={{display:'flex',alignItems:'center',gap:4}}>
                              <div onClick={()=>upd(i,{emailTemplate:{...(p.emailTemplate||{}),attiva:!p.emailTemplate?.attiva}})}
                                style={{width:32,height:18,borderRadius:9,background:p.emailTemplate?.attiva?GRN:'#C8E4E4',cursor:'pointer',position:'relative',transition:'background 200ms'}}>
                                <div style={{position:'absolute',top:2,left:p.emailTemplate?.attiva?16:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 200ms'}}/>
                              </div>
                              <span style={{fontSize:10,color:p.emailTemplate?.attiva?GRN:sub,fontWeight:600}}>Invio auto</span>
                            </div>
                            <select value={p.emailTemplate?.destinatario||'cliente'}
                              onChange={e=>upd(i,{emailTemplate:{...(p.emailTemplate||{}),destinatario:e.target.value}})}
                              style={{background:'#fff',border:'1px solid #C8E4E4',borderRadius:8,padding:'3px 6px',fontSize:10,outline:'none'}}>
                              <option value="cliente">Al cliente</option>
                              <option value="azienda">All azienda</option>
                              <option value="entrambi">Entrambi</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* CHECKLIST */}
                      {phaseTab==='checklist'&&(
                        <div>
                          <div style={{fontSize:11,color:sub,marginBottom:8}}>Checklist visibile durante l esecuzione della commessa.</div>
                          {(p.checklistMontaggio||[]).map((item:string,ci:number)=>(
                            <div key={ci} style={{display:'flex',gap:6,alignItems:'center',marginBottom:6}}>
                              <span style={{fontSize:11,color:sub,width:18,textAlign:'center',flexShrink:0}}>{ci+1}.</span>
                              <input value={item}
                                onChange={e=>{const nl=[...(p.checklistMontaggio||[])];nl[ci]=e.target.value;upd(i,{checklistMontaggio:nl});}}
                                style={{...S.input}} placeholder="es: Verifica misure vano"/>
                              <div onClick={()=>upd(i,{checklistMontaggio:(p.checklistMontaggio||[]).filter((_:any,j:number)=>j!==ci)})}
                                style={{cursor:'pointer',color:'#DC4444',fontSize:18,lineHeight:1,flexShrink:0}}>×</div>
                            </div>
                          ))}
                          <div onClick={()=>upd(i,{checklistMontaggio:[...(p.checklistMontaggio||[]),''],})}
                            style={{padding:'8px',borderRadius:8,border:`1px dashed ${PRI}`,textAlign:'center',cursor:'pointer',color:PRI,fontSize:12,fontWeight:700,marginTop:4}}>
                            + Aggiungi voce
                          </div>
                          {(p.checklistMontaggio||[]).length>0&&(
                            <div style={{display:'flex',alignItems:'center',gap:4,marginTop:10}}>
                              <div onClick={()=>upd(i,{checklistObbligatoria:!p.checklistObbligatoria})}
                                style={{width:32,height:18,borderRadius:9,background:p.checklistObbligatoria?GRN:'#C8E4E4',cursor:'pointer',position:'relative',transition:'background 200ms'}}>
                                <div style={{position:'absolute',top:2,left:p.checklistObbligatoria?16:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 200ms'}}/>
                              </div>
                              <span style={{fontSize:10,color:p.checklistObbligatoria?GRN:sub,fontWeight:600}}>Obbligatoria per avanzare</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AUTOMAZIONI */}
                      {phaseTab==='auto'&&(
                        <div>
                          <div style={{fontSize:11,color:sub,marginBottom:8}}>Azioni automatiche all ingresso in questa fase.</div>
                          {(p.automazioni||[]).map((auto:any,ai:number)=>(
                            <div key={ai} style={{display:'flex',gap:6,alignItems:'center',marginBottom:6,background:'#EEF8F8',borderRadius:8,padding:'6px 8px'}}>
                              <select value={auto.tipo}
                                onChange={e=>{const na=[...(p.automazioni||[])];na[ai]={...na[ai],tipo:e.target.value};upd(i,{automazioni:na});}}
                                style={{background:'#fff',border:'1px solid #C8E4E4',borderRadius:8,padding:'3px 6px',fontSize:10,outline:'none',flex:1}}>
                                {AUTO_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                              <div onClick={()=>upd(i,{automazioni:(p.automazioni||[]).filter((_:any,j:number)=>j!==ai)})}
                                style={{cursor:'pointer',color:'#DC4444',fontSize:18,lineHeight:1}}>×</div>
                            </div>
                          ))}
                          <div onClick={()=>upd(i,{automazioni:[...(p.automazioni||[]),{tipo:'notifica_cliente'}]})}
                            style={{padding:'8px',borderRadius:8,border:`1px dashed ${PRI}`,textAlign:'center',cursor:'pointer',color:PRI,fontSize:12,fontWeight:700,marginTop:4}}>
                            + Aggiungi automazione
                          </div>
                        </div>
                      )}

                      {/* GATE */}
                      {phaseTab==='gate'&&(
                        <div>
                          <div style={{fontSize:11,color:sub,marginBottom:8}}>Requisiti per avanzare a questa fase.</div>
                          {(p.gateRequisiti||[]).map((req:any,ri:number)=>(
                            <div key={ri} style={{display:'flex',gap:6,alignItems:'center',marginBottom:6}}>
                              <select value={req.tipo}
                                onChange={e=>{const nr=[...(p.gateRequisiti||[])];nr[ri]={...nr[ri],tipo:e.target.value};upd(i,{gateRequisiti:nr});}}
                                style={{background:'#fff',border:'1px solid #C8E4E4',borderRadius:8,padding:'3px 6px',fontSize:10,outline:'none',flex:1}}>
                                {GATE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                              <div onClick={()=>upd(i,{gateRequisiti:(p.gateRequisiti||[]).filter((_:any,j:number)=>j!==ri)})}
                                style={{cursor:'pointer',color:'#DC4444',fontSize:18,lineHeight:1}}>×</div>
                            </div>
                          ))}
                          <div onClick={()=>upd(i,{gateRequisiti:[...(p.gateRequisiti||[]),{tipo:'documenti_ok'}]})}
                            style={{padding:'8px',borderRadius:8,border:`1px dashed ${PRI}`,textAlign:'center',cursor:'pointer',color:PRI,fontSize:12,fontWeight:700,marginTop:4}}>
                            + Aggiungi requisito
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:4,marginTop:10}}>
                            <div onClick={()=>upd(i,{gateBloccante:!p.gateBloccante})}
                              style={{width:32,height:18,borderRadius:9,background:p.gateBloccante?'#DC4444':'#C8E4E4',cursor:'pointer',position:'relative',transition:'background 200ms'}}>
                              <div style={{position:'absolute',top:2,left:p.gateBloccante?16:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 200ms'}}/>
                            </div>
                            <span style={{fontSize:10,color:p.gateBloccante?'#DC4444':sub,fontWeight:600}}>Gate bloccante</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Aggiungi fase personalizzata */}
          <div onClick={()=>{
            const nome = prompt('Nome nuova fase:');
            if(nome?.trim()) setPipeline(db=>[...db.slice(0,-1),{id:'c_'+Date.now(),nome:nome.trim(),ico:'à',attiva:true,custom:true,emailTemplate:null,checklistMontaggio:[],automazioni:[],gateRequisiti:[],gateBloccante:false,checklistObbligatoria:false},db[db.length-1]]);
          }} style={{...S.card,textAlign:'center',padding:'10px',cursor:'pointer',color:PRI,fontSize:13,fontWeight:700,border:'1.5px dashed #C8E4E4',marginTop:2}}>
            + Aggiungi fase personalizzata
          </div>
          <div onClick={()=>{if(confirm('Ripristinare il flusso predefinito?'))setPipeline(PIPELINE_FL_DEFAULT);}}
            style={{textAlign:'center',padding:'8px 0 2px',fontSize:11,color:sub,cursor:'pointer',textDecoration:'underline'}}>
            Ripristina predefinito
          </div>
        </>)}

        {mainTab==='profilo'&&(
          <div style={{...S.card,display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Profilo freelance</div>
            {[
              {l:'NOME COMPLETO',t:'text',ph:'Mario Rossi'},
              {l:'PARTITA IVA',t:'text',ph:'01234567890'},
              {l:'CITTA',t:'text',ph:'Brindisi'},
              {l:'TELEFONO',t:'tel',ph:'+39 333 1234567'},
              {l:'EMAIL',t:'email',ph:'mario@email.it'},
            ].map(f=>(
              <div key={f.l}>
                <div style={{fontSize:9,fontWeight:700,color:sub,marginBottom:5}}>{f.l}</div>
                <input type={f.t} placeholder={f.ph} style={S.input}/>
              </div>
            ))}
            <div>
              <div style={{fontSize:9,fontWeight:700,color:sub,marginBottom:5}}>REGIME FISCALE</div>
              <select style={{...S.input}}><option>Forfettario</option><option>Ordinario</option></select>
            </div>
            <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}
              style={{background:saved?GRN:PRI,color:'#fff',border:'none',borderRadius:10,padding:'12px',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:saved?'0 4px 0 0 #0F7A56':'0 4px 0 0 #156060',transition:'background 200ms'}}>
              {saved?'Salvato':'Salva profilo'}
            </button>
          </div>
        )}

        {mainTab==='notifiche'&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Notifiche push</div>
            {['Nuovo lavoro in bacheca','Offerta accettata','Materiali pronti al ritiro','Scadenza fiscale imminente','Sotto scorta magazzino','Pagamento ricevuto'].map((n,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #EEF8F8'}}>
                <span style={{fontSize:13,color:'#0D1F1F',fontWeight:500}}>{n}</span>
                <div style={{width:40,height:22,borderRadius:11,background:GRN,cursor:'pointer',position:'relative',flexShrink:0}}>
                  <div style={{position:'absolute',top:2,left:18,width:18,height:18,borderRadius:'50%',background:'#fff'}}/>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


function TabChatCommessa({thread,threadMsg,setThreadMsg,sendThread,bpId,setBpId,press}:{
  thread:ChatMsg[];threadMsg:string;setThreadMsg:(s:string)=>void;
  sendThread:()=>void;bpId:string;setBpId:(s:string)=>void;
  press:(id:string,fn?:()=>void)=>void;
}){
  const faseColor:Record<Fase,string>={misura:DS.textMid,preventivo:DS.amber,produzione:DS.green,montaggio:DS.teal,fattura:DS.textLight};
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',minHeight:400}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
        {thread.map(msg=>(
          <div key={msg.id} style={{display:'flex',justifyContent:msg.proprio?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'85%',background:msg.proprio?DS.teal:'#fff',borderRadius:msg.proprio?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'8px 12px',border:msg.proprio?'none':`1px solid ${DS.border}`}}>
              {!msg.proprio&&<div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                <span style={{fontSize:11,color:DS.teal,fontWeight:700}}>{msg.autore}</span>
                <span style={{fontSize:10,background:faseColor[msg.fase]+'22',color:faseColor[msg.fase],borderRadius:4,padding:'1px 5px',fontWeight:600}}>{msg.fase}</span>
              </div>}
              <div style={{fontSize:14,color:msg.proprio?'#fff':DS.text,lineHeight:1.4}}>{msg.testo}</div>
              <div style={{fontSize:10,color:msg.proprio?'rgba(255,255,255,0.5)':DS.textLight,marginTop:3,textAlign:'right'}}>{msg.ora}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,paddingTop:10,borderTop:`1px solid ${DS.border}`,background:'rgba(248,254,254,0.9)'}}>
        <input value={threadMsg} onChange={e=>setThreadMsg(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&sendThread()}
          placeholder="Scrivi al team sulla commessa..."
          style={{flex:1,padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:10,fontSize:14,fontFamily:DS.ui,outline:'none'}}/>
        <button onPointerDown={()=>setBpId('tc')} onPointerUp={()=>press('tc',sendThread)} style={{...bp(bpId==='tc'),padding:'10px 14px'}}>
          <Send size={15}/>
        </button>
      </div>
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TAB INFO ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function TabInfo({openMaps,bpId,setBpId,press}:{openMaps:()=>void;bpId:string;setBpId:(s:string)=>void;press:(id:string,fn?:()=>void)=>void}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={card}>
        <div style={{fontWeight:700,color:DS.text,fontSize:15,marginBottom:10}}>{COM.cliente}</div>
        {([
          {icon:<MapPin size={13} color={DS.teal}/>,val:COM.indirizzo},
          {icon:<Phone size={13} color={DS.teal}/>,val:COM.telefono},
          {icon:<Mail size={13} color={DS.teal}/>,val:COM.email},
          {icon:<Clock size={13} color={DS.teal}/>,val:`${COM.dataAppuntamento} ore ${COM.oraAppuntamento}`},
        ] as {icon:React.ReactNode,val:string}[]).map((r,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:8}}>{r.icon}<span style={{fontSize:13,color:DS.textMid,lineHeight:1.4}}>{r.val}</span></div>
        ))}
        <div style={{background:DS.tealLight,borderRadius:8,padding:10,marginTop:4,fontSize:13,color:DS.textMid,lineHeight:1.5}}>
          <AlertCircle size={12} style={{display:'inline',marginRight:6}} color={DS.amber}/>{COM.note}
        </div>
      </div>
      <button style={{...bp(bpId==='nav'),width:'100%',justifyContent:'center'}} onPointerDown={()=>setBpId('nav')} onPointerUp={()=>press('nav',openMaps)}>
        <Navigation size={14}/> Apri Google Maps
      </button>
      <div style={{display:'flex',gap:10}}>
        <a href={`tel:${COM.telefono}`} style={{...bpGh(false),flex:1,justifyContent:'center',textDecoration:'none'}}><Phone size={13}/>Chiama</a>
        <a href={`sms:${COM.telefono}`} style={{...bpGh(false),flex:1,justifyContent:'center',textDecoration:'none'}}><MessageCircle size={13}/>SMS</a>
      </div>
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TAB VANI ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function TabVani({onCad,vanoImgs}:{onCad:(n:string,id:number)=>void;vanoImgs:Record<number,string>}){
  const [ordineVano,setOrdineVano]=useState<number|null>(null);
  const [ordDesc,setOrdDesc]=useState('');
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {COM.vani.map((v:any)=>{
        const img=vanoImgs[v.id];
        const showForm=ordineVano===v.id;
        return(
          <CardVanoIndicatori key={v.id} nome={v.nome} tipo={v.tipo} stato={v.stato} materiale={v.materiale} formato={v.formato} dimensioni={v.dimensioni}>
            {img&&(
              <div style={{marginBottom:8,borderRadius:8,overflow:'hidden',border:`1px solid ${DS.border}`}}>
                <img src={img} alt="disegno" style={{width:'100%',display:'block'}}/>
                <div style={{background:DS.tealLight,padding:'4px 10px',fontSize:11,color:DS.teal,fontWeight:600}}>Disegno salvato</div>
              </div>
            )}
            {showForm&&(
              <div style={{background:'#f8fefe',border:`2px solid ${DS.teal}`,borderRadius:10,padding:12,marginBottom:8}}>
                <div style={{fontWeight:700,color:DS.text,fontSize:13,marginBottom:8,display:'flex',justifyContent:'space-between'}}>
                  Ordina — {v.nome}
                  <button onClick={()=>setOrdineVano(null)} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><X size={16} color={DS.textMid}/></button>
                </div>
                <input value={ordDesc} onChange={e=>setOrdDesc(e.target.value)} autoFocus placeholder="Descrizione articolo..."
                  style={{width:'100%',padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:13,fontFamily:DS.ui,outline:'none',marginBottom:8,boxSizing:'border-box' as const}}/>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{setOrdineVano(null);setOrdDesc('');}} style={{...bpGh(false),flex:1,justifyContent:'center'}}>Annulla</button>
                  <button onClick={()=>{if(ordDesc.trim()){setOrdineVano(null);setOrdDesc('');}}} style={{...bp(false),flex:2,justifyContent:'center',fontSize:13}}>
                    <Send size={13}/> Invia ordine
                  </button>
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
              <button onClick={()=>onCad(v.nome,v.id)} style={{background:DS.topbar,color:'#fff',border:'none',borderRadius:8,padding:'8px 12px',cursor:'pointer',display:'flex',gap:6,alignItems:'center',fontFamily:DS.ui,fontWeight:600,fontSize:12,boxShadow:'0 3px 0 0 #000',flex:1,justifyContent:'center'}}>
                <Pencil size={13}/>{img?'Modifica CAD':'MastroCad'}
              </button>
              <button onClick={()=>setOrdineVano(showForm?null:v.id)} style={{...bpA(false),flex:1,justifyContent:'center',padding:'8px 12px',fontSize:12}}>
                <ShoppingCart size={13}/> Ordina
              </button>
            </div>
          </CardVanoIndicatori>
        );
      })}
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TAB WORKFLOW ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function TabWorkflow({onChatWith}:{onChatWith:(nome:string)=>void}){
  const [expandedIdx,setExpandedIdx]=React.useState<number|null>(null);
  const [chatIdx,setChatIdx]=React.useState<number|null>(null);
  const [wfMsgs,setWfMsgs]=React.useState<Record<number,{testo:string;ora:string;proprio:boolean}[]>>({});
  const [wfInput,setWfInput]=React.useState('');
  const wfOra=()=>new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  const sendWf=(i:number)=>{
    if(!wfInput.trim())return;
    setWfMsgs(m=>({...m,[i]:[...(m[i]||[]),{testo:wfInput,ora:wfOra(),proprio:true}]}));
    setWfInput('');
  };
  return(
    <div style={{display:'flex',flexDirection:'column'}}>
      <div style={{color:DS.textMid,fontSize:13,marginBottom:14}}>Filo conduttivo → tocca per contattare</div>
      {WF.map((w,i)=>{
        const isLast=i===WF.length-1;
        const col=w.stato==='fatto'?DS.green:w.stato==='attivo'?DS.teal:DS.textLight;
        const expanded=expandedIdx===i;
        const chatOpen=chatIdx===i;
        const canContact=w.stato!=='attesa'&&w.tel;
        const msgs=wfMsgs[i]||[];
        return(
          <div key={w.ruolo} style={{display:'flex',gap:14,paddingBottom:isLast?0:20,position:'relative'}}>
            {!isLast&&<div style={{position:'absolute',left:17,top:36,bottom:0,width:2,background:w.stato==='fatto'?DS.green:DS.border}}/>}
            <div style={{width:34,height:34,borderRadius:'50%',background:w.stato==='attesa'?DS.border:col,display:'flex',alignItems:'center',justifyContent:'center',color:w.stato==='attesa'?DS.textLight:'#fff',flexShrink:0,zIndex:1,boxShadow:w.stato==='attivo'?`0 0 0 4px rgba(40,160,160,0.2)`:'none'}}>
              {w.icona}
            </div>
            <div style={{flex:1}}>
              <button onClick={()=>canContact&&setExpandedIdx(expanded?null:i)}
                style={{...card,padding:'10px 14px',width:'100%',textAlign:'left',cursor:canContact?'pointer':'default',border:(expanded||chatOpen)?`2px solid ${DS.teal}`:`1.5px solid ${DS.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,color:DS.text,fontSize:14}}>{w.nome}</div>
                    <div style={{color:DS.textMid,fontSize:12}}>{w.ruolo}{w.data?` → ${w.data}`:''}</div>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {msgs.length>0&&<span style={{background:DS.teal,color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{msgs.length}</span>}
                    {canContact&&<ChevronRight size={16} color={(expanded||chatOpen)?DS.teal:DS.textLight} style={{transform:expanded?'rotate(90deg)':'none',transition:'transform 200ms'}}/>}
                  </div>
                </div>
              </button>

              {/* Azioni contatto */}
              {expanded&&canContact&&(
                <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                  <a href={`tel:${w.tel}`} style={{flex:1,minWidth:70,background:DS.teal,color:'#fff',borderRadius:10,padding:'10px 6px',display:'flex',alignItems:'center',justifyContent:'center',gap:5,textDecoration:'none',fontWeight:700,fontSize:12,fontFamily:DS.ui,boxShadow:`0 4px 0 0 ${DS.tealDark}`}}>
                    <Phone size={13}/> Chiama
                  </a>
                  <a href={`sms:${w.tel}&body=Ciao ${w.nome}, commessa COM-2024-047:`} style={{flex:1,minWidth:60,background:DS.green,color:'#fff',borderRadius:10,padding:'10px 6px',display:'flex',alignItems:'center',justifyContent:'center',gap:5,textDecoration:'none',fontWeight:700,fontSize:12,fontFamily:DS.ui,boxShadow:`0 4px 0 0 ${DS.greenDark}`}}>
                    <MessageCircle size={13}/> SMS
                  </a>
                  {w.email&&(
                    <a href={`mailto:${w.email}?subject=COM-2024-047`} style={{flex:1,minWidth:60,background:DS.amber,color:'#fff',borderRadius:10,padding:'10px 6px',display:'flex',alignItems:'center',justifyContent:'center',gap:5,textDecoration:'none',fontWeight:700,fontSize:12,fontFamily:DS.ui,boxShadow:`0 4px 0 0 ${DS.amberDark}`}}>
                      <Mail size={13}/> Email
                    </a>
                  )}
                  <button onClick={()=>{setChatIdx(chatOpen?null:i);setExpandedIdx(null);}} style={{flex:1,minWidth:60,background:DS.topbar,color:'#fff',borderRadius:10,padding:'10px 6px',display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontWeight:700,fontSize:12,fontFamily:DS.ui,border:'none',cursor:'pointer',boxShadow:'0 4px 0 0 #000'}}>
                    <MessageSquare size={13}/> Chat
                  </button>
                </div>
              )}

              {/* CHAT INLINE */}
              {chatOpen&&(
                <div style={{marginTop:8,background:'#f4fcfc',borderRadius:12,border:`2px solid ${DS.teal}`,overflow:'hidden'}}>
                  {/* header chat */}
                  <div style={{background:DS.topbar,padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:DS.teal,fontWeight:700,fontSize:12}}>Chat con {w.nome}</span>
                    <button onClick={()=>setChatIdx(null)} style={{background:'none',border:'none',cursor:'pointer',padding:2}}>
                      <X size={14} color='#8BBCBC'/>
                    </button>
                  </div>
                  {/* messaggi */}
                  <div style={{padding:10,display:'flex',flexDirection:'column',gap:6,minHeight:80,maxHeight:200,overflowY:'auto'}}>
                    {msgs.length===0&&<div style={{color:DS.textLight,fontSize:12,textAlign:'center',padding:'16px 0'}}>Nessun messaggio ancora</div>}
                    {msgs.map((m,mi)=>(
                      <div key={mi} style={{display:'flex',justifyContent:m.proprio?'flex-end':'flex-start'}}>
                        <div style={{maxWidth:'80%',background:m.proprio?DS.teal:'#fff',borderRadius:m.proprio?'10px 10px 3px 10px':'10px 10px 10px 3px',padding:'6px 10px',border:m.proprio?'none':`1px solid ${DS.border}`}}>
                          <div style={{fontSize:13,color:m.proprio?'#fff':DS.text}}>{m.testo}</div>
                          <div style={{fontSize:9,color:m.proprio?'rgba(255,255,255,0.5)':DS.textLight,marginTop:2,textAlign:'right'}}>{m.ora}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* input */}
                  <div style={{display:'flex',gap:6,padding:8,borderTop:`1px solid ${DS.border}`,background:'#fff'}}>
                    <input value={wfInput} onChange={e=>setWfInput(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&sendWf(i)}
                      placeholder={`Scrivi a ${w.nome}...`}
                      style={{flex:1,padding:'8px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:13,fontFamily:DS.ui,outline:'none'}}/>
                    <button onClick={()=>sendWf(i)} style={{background:DS.teal,border:'none',borderRadius:8,padding:'8px 12px',cursor:'pointer',boxShadow:`0 3px 0 0 ${DS.tealDark}`}}>
                      <Send size={13} color='#fff'/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TAB CHECKLIST ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function TabChecklist({checklist,toggle,addAtt,completate}:{checklist:typeof CL_INIT;toggle:(id:number)=>void;addAtt:(id:number,n:string)=>void;completate:number}){
  const pct=Math.round((completate/checklist.length)*100);
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13,color:DS.textMid}}>
          <span>Avanzamento</span><span style={{fontFamily:DS.mono,color:DS.text,fontWeight:700}}>{completate}/{checklist.length}</span>
        </div>
        <div style={{background:DS.tealLight,borderRadius:999,height:10,overflow:'hidden'}}>
          <div style={{background:DS.teal,height:10,width:`${pct}%`,borderRadius:999,transition:'width 300ms'}}/>
        </div>
      </div>
      {checklist.map(c=>(
        <div key={c.id} style={{...card,border:c.completata?`1.5px solid ${DS.green}`:`1.5px solid ${DS.border}`}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <button onClick={()=>toggle(c.id)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${c.completata?DS.green:DS.border}`,background:c.completata?DS.green:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {c.completata&&<Check size={14} color="#fff"/>}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:c.completata?DS.textMid:DS.text,textDecoration:c.completata?'line-through':'none'}}>{c.testo}</div>
              {c.allegati.length>0&&(
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:5}}>
                  {c.allegati.map((a,i)=>(
                    <div key={i} style={{background:DS.tealLight,borderRadius:6,padding:'2px 7px',fontSize:11,color:DS.teal,display:'flex',gap:3,alignItems:'center'}}>
                      <Image size={10}/>{a}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              <button onClick={()=>addAtt(c.id,`foto_${c.allegati.length+1}.jpg`)} style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:6,padding:'5px 6px',cursor:'pointer'}}><Camera size={12} color={DS.teal}/></button>
              <button onClick={()=>addAtt(c.id,'file.pdf')} style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:6,padding:'5px 6px',cursor:'pointer'}}><Paperclip size={12} color={DS.teal}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TAB DOCUMENTI ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function TabDocumenti({bpId,setBpId,press}:{bpId:string;setBpId:(s:string)=>void;press:(id:string,fn?:()=>void)=>void}){
  const docs=[
    {nome:'Contratto firmato',   tipo:'PDF',data:'20/03',icon:<FileText size={16} color={DS.teal}/>},
    {nome:'Disegno tecnico vani',tipo:'DWG',data:'18/03',icon:<Ruler size={16} color={DS.teal}/>},
    {nome:'Ordine fornitore',    tipo:'PDF',data:'22/03',icon:<ShoppingCart size={16} color={DS.teal}/>},
  ];
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {docs.map((d,i)=>(
        <div key={i} style={{...card,display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:38,height:38,borderRadius:10,background:DS.tealLight,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{d.icon}</div>
          <div style={{flex:1}}><div style={{fontWeight:600,color:DS.text,fontSize:14}}>{d.nome}</div><div style={{color:DS.textMid,fontSize:12}}>{d.tipo} → {d.data}</div></div>
          <button style={{background:DS.tealLight,border:`1px solid ${DS.border}`,borderRadius:8,padding:'6px 9px',cursor:'pointer'}}><Download size={13} color={DS.teal}/></button>
        </div>
      ))}
      <button style={{...bpA(bpId==='up'),justifyContent:'center'}} onPointerDown={()=>setBpId('up')} onPointerUp={()=>press('up')}><Plus size={14}/> Aggiungi</button>
    </div>
  );
}

// ├ö├Â├ç├ö├Â├ç├ö├Â├ç TAB ORDINI ├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç├ö├Â├ç
function TabOrdini({ordini,setOrdini,onInvia,onConferma}:{ordini:OrdineItem[];setOrdini:React.Dispatch<React.SetStateAction<OrdineItem[]>>;onInvia:(id:number)=>void;onConferma:(id:number)=>void}){
  const [showForm,setShowForm]=useState(false);
  const [desc,setDesc]=useState('');
  const [qty,setQty]=useState('1');
  const [dest,setDest]=useState<'magazzino'|'fornitore'>('magazzino');
  const add=()=>{if(!desc.trim())return;setOrdini(o=>[...o,{id:Date.now(),desc:desc.trim(),qty:Math.max(1,parseInt(qty)||1),dest,stato:'bozza'}]);setDesc('');setQty('1');setShowForm(false);};
  const ss:{[k:string]:{bg:string;color:string;label:string}}={bozza:{bg:'#F3F4F6',color:DS.textMid,label:'Bozza'},inviato:{bg:'#FEF3C7',color:DS.amber,label:'Inviato'},confermato:{bg:'#D1FAE5',color:DS.green,label:'Confermato'}};
  const renderO=(o:OrdineItem)=>{
    const s=ss[o.stato];
    return(
      <div key={o.id} style={{...card,marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:o.stato!=='confermato'?10:0}}>
          <div><div style={{fontWeight:600,color:DS.text}}>{o.desc}</div><div style={{color:DS.textMid,fontSize:12,fontFamily:DS.mono}}>qty {o.qty}</div></div>
          <div style={{background:s.bg,color:s.color,borderRadius:20,padding:'2px 9px',fontSize:11,fontWeight:600}}>{s.label}</div>
        </div>
        {o.stato==='bozza'&&<button onClick={()=>onInvia(o.id)} style={{...bp(false,DS.teal,DS.tealDark),padding:'7px 14px',fontSize:13}}><Send size={12}/> Invia {o.dest==='magazzino'?'magazzino':'fornitore'}</button>}
        {o.stato==='inviato'&&<button onClick={()=>onConferma(o.id)} style={{...bpG(false),padding:'7px 14px',fontSize:13}}><Check size={12}/> Simula conferma</button>}
      </div>
    );
  };
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div><div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8,color:DS.text,fontWeight:700,fontSize:13}}><Building2 size={14} color={DS.teal}/> Magazzino</div>{ordini.filter(o=>o.dest==='magazzino').map(renderO)}</div>
      <div><div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8,color:DS.text,fontWeight:700,fontSize:13}}><Package size={14} color={DS.amber}/> Fornitore</div>{ordini.filter(o=>o.dest==='fornitore').map(renderO)}</div>
      {!showForm
        ?<button style={{...bpG(false),justifyContent:'center'}} onClick={()=>setShowForm(true)}><Plus size={14}/> Nuovo ordine</button>
        :<div style={{...card,border:`2px solid ${DS.teal}`}}>
          <div style={{fontWeight:700,color:DS.text,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            Nuovo ordine<button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><X size={18} color={DS.textMid}/></button>
          </div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descrizione articolo" autoFocus style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',marginBottom:10,boxSizing:'border-box' as const}}/>
          <div style={{display:'flex',gap:10,marginBottom:12}}>
            <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1" style={{width:80,padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.mono,outline:'none',textAlign:'center' as const}}/>
            <select value={dest} onChange={e=>setDest(e.target.value as 'magazzino'|'fornitore')} style={{flex:1,padding:'9px 10px',border:`1.5px solid ${DS.border}`,borderRadius:8,fontSize:14,fontFamily:DS.ui,outline:'none',background:'#fff'}}>
              <option value="magazzino">Magazzino</option>
              <option value="fornitore">Fornitore</option>
            </select>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setShowForm(false)} style={{...bpGh(false),flex:1,justifyContent:'center'}}>Annulla</button>
            <button onClick={add} style={{...bp(false),flex:2,justifyContent:'center'}}><Check size={14}/> Aggiungi</button>
          </div>
        </div>
      }
    </div>
  );
}


export default function MontaggiApp({ onLogout, modalita }: { onLogout?: () => void; modalita?: 'dipendente'|'freelance' } = {}) {
  const { dbCommesse, dbVani, dbMontaggi, dbOperatore, dbLoading } = useMontaggiData('1234');
  const [comData, setComData] = React.useState(COM);
  const [opData, setOpData] = React.useState(OP);
  React.useEffect(() => {
    if (dbOperatore && !dbLoading) {
      // Aggiorna con dati reali dal DB
      const newOp: any = {
        nome: (dbOperatore.nome||'')+' '+(dbOperatore.cognome||''),
        ruolo: dbOperatore.ruolo || 'montatore',
        avatar: (dbOperatore.nome?.[0]||'')+(dbOperatore.cognome?.[0]||''),
        tipo: 'interno' as 'interno'|'esterno',
      };
      setOpData(newOp);
      Object.assign(OP, newOp);
      const oggi = new Date().toISOString().slice(0,10);
      const montOggi = dbMontaggi.find((m:any)=>m.data_montaggio===oggi);
      const cmOggi = montOggi ? dbCommesse.find((c:any)=>c.id===montOggi.commessa_id) : dbCommesse[0];
      if (cmOggi) {
        const cmVani = dbVani.filter((v:any)=>v.commessa_id===cmOggi.id);
        const newComData = {
          id: cmOggi.code || cmOggi.id,
          cliente: cmOggi.cliente || '',
          indirizzo: cmOggi.indirizzo || '',
          telefono: cmOggi.telefono || '',
          email: cmOggi.email || '',
          dataAppuntamento: montOggi?.data_montaggio || oggi,
          oraAppuntamento: montOggi?.ora_inizio?.slice(0,5) || '08:00',
          note: '',
          vani: cmVani.length > 0 ? cmVani.map((v:any,i:number) => ({
            id:i+1, nome:v.nome||'Vano '+(i+1), tipo:v.tipo||'Finestra',
            stato:'da_fare' as const, materiale:(v.sistema||'pvc').toLowerCase() as any,
            formato:'finestra' as any, dimensioni:'',
          })) : COM.vani,
        };
        setComData(newComData);
        Object.assign(COM, newComData);
      }
    }
  }, [dbOperatore, dbLoading, dbCommesse, dbMontaggi, dbVani]);

  const [view,setView]           = useState<View>('home');
  const [navStack,setNavStack]   = useState<View[]>([]);
  const [ctab,setCtab]           = useState<CTab>('info');
  const [checklist,setChecklist] = useState(CL_INIT);
  const [thread,setThread]       = useState(THREAD_INIT);
  const [contacts,setContacts]   = useState(CONTACTS_INIT);
  const [chatMode,setChatMode]   = useState<'thread'|'direct'>('thread');
  const [directId,setDirectId]   = useState<string|null>(null);
  const [threadMsg,setThreadMsg] = useState('');
  const [directMsg,setDirectMsg] = useState('');
  const [ordini,setOrdini]       = useState(ORDINI_INIT);
  const [tasks,setTasks]         = useState(TASKS_INIT);
  const [showCad,setShowCad]     = useState(false);
  const [cadVano,setCadVano]     = useState('');
  const [cadVanoId,setCadVanoId] = useState<number|null>(null);
  const [vanoImgs,setVanoImgs]   = useState<Record<number,string>>({});
  const [avvioChecks,setAvvioChecks] = useState<boolean[]>(AVVIO_ITEMS.map(()=>false));
  const [showSpesa,setShowSpesa] = useState(false);
  const [showDisegno,setShowDisegno] = useState(false);
  const [avviato,setAvviato]     = useState(true);
  const [menuOpen,setMenuOpen]   = useState(false);
  const [bpId,setBpId]           = useState('');
  const [aiOpen,setAiOpen]       = useState(false);
  const [reportOpen,setReportOpen] = useState(false);
  const [showPausaModal,setShowPausaModal] = useState(false);
  const [pauseLog,setPauseLog] = useState<{ora:string;motivo:string;durata:string}[]>([]);
  const [pausaStart,setPausaStart] = useState<number|null>(null);
  const [agTab,setAgTab]         = useState<'calendario'|'task'>('calendario');
  const [selDay,setSelDay]       = useState(3);
  const timer = useTimer();

  const press=(id:string,fn?:()=>void)=>{setBpId(id);setTimeout(()=>{setBpId('');fn?.();},140);};
  const navigate=(v:View)=>{
    setNavStack(s=>[...s,view]);
    setView(v);
  };
  
  // Ferma timer quando si apre collaudo
  const goToCollaudo = () => {
    if(timer.running) timer.pause();
    setCtab('collaudo');
  };
  const goBack=()=>{
    setNavStack(s=>{
      if(s.length===0) return s;
      setView(s[s.length-1]);
      return s.slice(0,-1);
    });
  };
  const openMaps=()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(comData.indirizzo)}`,'_blank');
  const toggleCheck=(id:number)=>setChecklist(cl=>cl.map(c=>c.id===id?{...c,completata:!c.completata}:c));
  const addAllegato=(id:number,n:string)=>setChecklist(cl=>cl.map(c=>c.id===id?{...c,allegati:[...c.allegati,n]}:c));
  const completate=checklist.filter(c=>c.completata).length;
  const pendenti=tasks.filter(t=>!t.fatto).length;
  const avvioReady=avvioChecks.every(Boolean);
  const ctxAI: CommessaCtx = {
    operatore: OP,
    commessa: {...comData, vani: comData.vani.map((v:any)=>({...v,dimensioni:v.dimensioni||v.tipo}))},
    completate,
    totaleCheck: CL_INIT.length,
    ordini: ordini.map(o=>({desc:o.desc,qty:o.qty,stato:o.stato})),
  };
  const dc=contacts.find(c=>c.id===directId);
  const unread=contacts.reduce((a,c)=>a+c.msgs.filter(m=>!m.proprio).length,0);

  const sendThread=()=>{if(!threadMsg.trim())return;setThread(m=>[...m,{id:Date.now(),autore:opData.nome,testo:threadMsg,ora:ora(),proprio:true,fase:'montaggio'}]);setThreadMsg('');};
  const sendDirect=()=>{if(!directMsg.trim()||!directId)return;setContacts(cs=>cs.map(c=>c.id===directId?{...c,msgs:[...c.msgs,{id:Date.now(),autore:opData.nome,testo:directMsg,ora:ora(),proprio:true,fase:'montaggio' as Fase}]}:c));setDirectMsg('');};
  const [cadOrdineOpen,setCadOrdineOpen]=useState<{imgData:string;vanoId:number;vanoNome:string}|null>(null);
  const onCadSave=(imgData:string,vanoId:number)=>{
    setVanoImgs(v=>({...v,[vanoId]:imgData}));
    setShowCad(false);
    // Proponi di creare ordine con il disegno
    const vano=comData.vani.find((v:any)=>v.id===vanoId);
    if(vano) setCadOrdineOpen({imgData,vanoId,vanoNome:vano.nome});
  };
  const inviaOrdine=(id:number)=>setOrdini(os=>os.map(x=>x.id===id?{...x,stato:'inviato' as const}:x));
  const confermaOrdine=(id:number)=>setOrdini(os=>os.map(x=>x.id===id?{...x,stato:'confermato' as const}:x));
  const handleFabAction=(id:string, commessaId?:string)=>{
    // commessaId ├╣ sempre comData.id — pronto per multi-commessa futura
    if(id==='ai'){
      // Apre AI con contesto commessa attiva pre-caricato
      setAiOpen(true);
      return;
    }
    if(id==='report'){
      // Report della commessa attiva
      setReportOpen(true);
      return;
    }
    if(id==='commessa'){
      // Apre direttamente la commessa del giorno
      setView('commessa');
      return;
    }
    if(id==='blocco'){
      // Segnala blocco sulla commessa attiva → tab checklist
      setView('commessa');
      setCtab('checklist');
      return;
    }
    if(id==='ordini'){
      // Crea ordine per la commessa attiva → tab ordini
      setView('commessa');
      setCtab('ordini');
      return;
    }
    if(id==='agenda'||id==='chat') navigate(id as View);
  };

  // MastroCad come overlay — non rompe il layout
  const cadOverlay = showCad ? (
    <div style={{position:'fixed',inset:0,zIndex:500}}>
      <MastroCad
        commessaId={comData.id}
        vanoNome={cadVano}
        onClose={()=>setShowCad(false)}
        onSaveImg={(img)=>onCadSave(img,cadVanoId??0)}
        existingImg={cadVanoId!=null?vanoImgs[cadVanoId]:undefined}
      />
    </div>
  ) : null;



  return (
    <div style={{...gridBg,minHeight:'100dvh',maxWidth:420,margin:'0 auto',display:'flex',flexDirection:'column',paddingBottom:56,fontFamily:DS.ui}}>

      {/* TOPBAR — vetro sabbiato */}
      <div style={{
        background:'linear-gradient(135deg, rgba(13,31,31,0.97) 0%, rgba(20,45,45,0.97) 100%)',
        backdropFilter:'blur(20px) saturate(180%)',
        WebkitBackdropFilter:'blur(20px) saturate(180%)',
        borderBottom:'1px solid rgba(40,160,160,0.2)',
        padding:'12px 16px',
        display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,
        boxShadow:'0 4px 24px rgba(0,0,0,0.25)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <FliwoxLogo size={36}/>
          <div>
            <div style={{display:'flex',alignItems:'baseline',gap:6}}>
              <span style={{color:'#F2F1EC',fontWeight:800,fontSize:16,letterSpacing:-0.3}}>fliwoX</span>
              <span style={{color:DS.teal,fontWeight:600,fontSize:12}}>Montaggi</span>
            </div>
            <div style={{color:'rgba(139,188,188,0.7)',fontSize:10,marginTop:1}}>{comData.cliente} → {comData.id}</div>
          </div>
        </div>
        <div style={{
          background:avviato?'rgba(26,158,115,0.25)':'rgba(192,112,0,0.25)',
          color:avviato?'#4AE8A8':'#F5B942',
          border:`1px solid ${avviato?'rgba(26,158,115,0.5)':'rgba(192,112,0,0.5)'}`,
          borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,
        }}>
          {avviato?' In Lavoro':'→ Da Avviare'}
        </div>
        {onLogout && (
          <button onClick={onLogout} style={{
            background:'none',border:'none',cursor:'pointer',
            padding:'4px 8px',borderRadius:8,
            color:'rgba(139,188,188,0.6)',fontSize:10,fontFamily:'system-ui',
            display:'flex',flexDirection:'column',alignItems:'center',gap:1,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Esci</span>
          </button>
        )}
      </div>

      {/* BACK BAR */}
      {navStack.length>0&&view!=='home'&&(
        <button onClick={goBack}
          style={{background:'#162828',border:'none',padding:'9px 14px',display:'flex',alignItems:'center',gap:8,cursor:'pointer',width:'100%',borderBottom:`1px solid rgba(40,160,160,0.2)`,flexShrink:0}}>
          <ChevronLeft size={17} color={DS.teal}/>
          <span style={{color:DS.teal,fontSize:13,fontWeight:700,fontFamily:DS.ui}}>Indietro</span>
        </button>
      )}

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>

        {/* HOME — non avviato */}
        {view==='home'&&!avviato&&(
          <div style={{padding:16,display:'flex',flexDirection:'column',gap:14}}>
            <div style={{...card,background:DS.topbar}}>
              <div style={{color:'#fff',fontWeight:700,fontSize:17}}>Avvio Commessa</div>
              <div style={{color:DS.textLight,fontSize:13,marginTop:2}}>{comData.id} → {comData.cliente}</div>
            </div>
            <div style={card}>
              <div style={{fontWeight:700,color:DS.text,marginBottom:12,fontSize:14}}>Checklist avvio</div>
              {AVVIO_ITEMS.map((item,i)=>(
                <button key={i} onClick={()=>setAvvioChecks(a=>{const n=[...a];n[i]=!n[i];return n;})}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<AVVIO_ITEMS.length-1?`1px solid ${DS.border}`:'none',background:'none',border:'none',width:'100%',textAlign:'left',cursor:'pointer'}}>
                  <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${avvioChecks[i]?DS.green:DS.border}`,background:avvioChecks[i]?DS.green:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {avvioChecks[i]&&<Check size={14} color="#fff"/>}
                  </div>
                  <span style={{fontSize:14,color:avvioChecks[i]?DS.textMid:DS.text,textDecoration:avvioChecks[i]?'line-through':'none'}}>{item}</span>
                </button>
              ))}
              <div style={{marginTop:10,height:6,borderRadius:999,background:DS.tealLight,overflow:'hidden'}}>
                <div style={{height:6,background:DS.teal,width:`${(avvioChecks.filter(Boolean).length/AVVIO_ITEMS.length)*100}%`,borderRadius:999,transition:'width 300ms'}}/>
              </div>
            </div>
            {avvioReady
              ?<button style={{...bpG(bpId==='avvia'),justifyContent:'center'}} onPointerDown={()=>setBpId('avvia')} onPointerUp={()=>press('avvia',()=>setAvviato(true))}>
                <LogIn size={16}/> Avvia Lavoro
              </button>
              :<div style={{...card,background:'#FEF3C7',border:`1px solid #F0C040`,textAlign:'center',color:DS.amber,fontSize:13,padding:'12px 16px'}}>
                <TriangleAlert size={14} style={{display:'inline',marginRight:6}}/>
                Completa tutti i punti per avviare
              </div>
            }
            <button style={{...bpGh(bpId==='nav0'),justifyContent:'center'}} onPointerDown={()=>setBpId('nav0')} onPointerUp={()=>press('nav0',openMaps)}>
              <Navigation size={15}/> Naviga al cantiere
            </button>
          </div>
        )}

        {/* HOME — avviato */}
        {view==='home'&&avviato&&modalita==='freelance'&&<HomeFreelanceDashboard onNav={(v:string)=>navigate(v as any)}/>}
        {view==='home'&&avviato&&modalita!=='freelance'&&(
          <HomeControlCenter
            timer={timer}
            completate={completate}
            totaleCheck={CL_INIT.length}
            pendenti={pendenti}
            msgNonLetti={unread}
            onOpenCommessa={()=>navigate('commessa')}
            onOpenChat={()=>navigate('chat')}
            onOpenInterventi={()=>navigate('commessa')}
            onOpenAgenda={()=>navigate('agenda')}
            bpId={bpId}
            setBpId={setBpId}
            press={press}
            onLogout={onLogout}
            operatoreNome={opData.nome}
            lavOggi={{
              id: comData.id || 'COM-047',
              cliente: comData.cliente || 'Caricamento...',
              indirizzo: comData.indirizzo || '',
              telefono: comData.telefono || '',
              oraInizio: comData.oraAppuntamento || '08:30',
              oraFine: '17:00',
              km: 0, vani: comData.vani?.length || 0,
              pct: 60,
            }}
          />
        )}

        {/* AGENDA */}
        {view==='agenda'&&<AgendaView onOpenReport={(cid)=>{
          setReportOpen(true);
        }}/>}

                {/* COMMESSA */}
        {view==='commessa'&&(
          <div style={{display:'flex',flexDirection:'column',flex:1}}>
            {!avviato&&(
              <div style={{background:'#FEF3C7',borderBottom:`1px solid #F0C040`,padding:'7px 14px',display:'flex',gap:8,alignItems:'center',fontSize:12,color:DS.amber}}>
                <TriangleAlert size={12}/> Non avviata —
                <button onClick={()=>setAvviato(true)} style={{background:'none',border:'none',color:DS.amber,fontWeight:700,cursor:'pointer',padding:0,textDecoration:'underline'}}>Avvia ora</button>
              </div>
            )}
            <div style={{background:'#0a1a1a',padding:'8px 14px',display:'flex',gap:0,overflowX:'auto',flexShrink:0}}>
              {FASI.map((f,i)=>(
                <React.Fragment key={f.id}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,minWidth:56}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:f.stato==='fatto'?DS.green:f.stato==='attivo'?DS.teal:'#2a3a3a',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:f.stato==='attivo'?`0 0 0 3px rgba(40,160,160,0.3)`:'none'}}>
                      {f.stato==='fatto'?<Check size={12} color="#fff"/>:<div style={{width:8,height:8,borderRadius:'50%',background:f.stato==='attivo'?'#fff':'#4a5a5a'}}/>}
                    </div>
                    <span style={{fontSize:9,color:f.stato==='attivo'?DS.teal:f.stato==='fatto'?DS.green:'#4a6060',fontWeight:f.stato==='attivo'?700:400}}>{f.label}</span>
                  </div>
                  {i<FASI.length-1&&<div style={{flex:1,height:2,background:f.stato==='fatto'?DS.green:'#2a3a3a',alignSelf:'center',marginBottom:14,minWidth:8}}/>}
                </React.Fragment>
              ))}
            </div>
            {/* TIMER BAR */}
            <div style={{background:'#0a1818',borderBottom:'1px solid rgba(40,160,160,0.15)',padding:'8px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <div style={{fontFamily:DS.mono,fontSize:18,fontWeight:700,color:timer.running?DS.teal:'#8BBCBC',flex:1,letterSpacing:1}}>
                {timer.fmt(timer.elapsed)}
              </div>
              {!timer.running
                ?<button onPointerDown={()=>setBpId('t-s')} onPointerUp={()=>press('t-s',timer.start)}
                    style={{background:DS.green,color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:DS.ui,fontWeight:700,fontSize:12,boxShadow:bpId==='t-s'?'none':'0 3px 0 0 #0F7A56',transform:bpId==='t-s'?'translateY(2px)':'none',transition:'all 80ms'}}>
                    <Play size={12}/>{timer.elapsed>0?'Riprendi':'Avvia'}
                  </button>
                :<button onPointerDown={()=>setBpId('t-p')} onPointerUp={()=>press('t-p',()=>{setPausaStart(timer.elapsed);setShowPausaModal(true);})}
                    style={{background:DS.amber,color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:DS.ui,fontWeight:700,fontSize:12,boxShadow:bpId==='t-p'?'none':'0 3px 0 0 #A06005',transform:bpId==='t-p'?'translateY(2px)':'none',transition:'all 80ms'}}>
                    <Pause size={12}/>Pausa
                  </button>
              }
              {timer.elapsed>0&&!timer.running&&(
                <button onPointerDown={()=>setBpId('t-f')} onPointerUp={()=>press('t-f',timer.stop)}
                  style={{background:'rgba(220,68,68,0.15)',color:DS.red,border:`1px solid ${DS.red}44`,borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:DS.ui}}>
                  Reset
                </button>
              )}
            </div>
            {/* LOG PAUSE */}
            {pauseLog.length>0&&(
              <div style={{background:'#0a1818',borderBottom:'1px solid rgba(40,160,160,0.1)',padding:'6px 14px',display:'flex',flexDirection:'column',gap:4}}>
                {pauseLog.map((p,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center',fontSize:11,color:'#8BBCBC'}}>
                    <Pause size={10} color={DS.amber}/>
                    <span style={{fontFamily:DS.mono,color:DS.amber}}>{p.ora}</span>
                    <span style={{flex:1,color:'#8BBCBC',fontStyle:p.motivo?'normal':'italic'}}>{p.motivo||'Pausa senza nota'}</span>
                    <span style={{fontFamily:DS.mono,fontSize:10,color:DS.textLight}}>{p.durata}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{background:DS.topbar,display:'flex',overflowX:'auto',padding:'0 4px',flexShrink:0}}>
              {(['info','vani','workflow','checklist','documenti','ordini','chat'] as CTab[]).map(t=>(
                <button key={t} onClick={()=>setCtab(t)}
                  style={{background:'none',border:'none',color:ctab===t?DS.teal:'#8BBCBC',fontFamily:DS.ui,fontWeight:ctab===t?700:400,fontSize:11,padding:'10px 9px',cursor:'pointer',borderBottom:ctab===t?`2px solid ${DS.teal}`:'2px solid transparent',whiteSpace:'nowrap'}}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflowY:'auto',padding:14}}>
              {ctab==='info'&&(
                <>
                  <button onClick={()=>setReportOpen(true)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'linear-gradient(135deg,#0D1F1F,#1a3535)',borderRadius:12,border:'none',cursor:'pointer',width:'100%',marginBottom:12,justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:'rgba(40,160,160,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <FileText size={16} color={DS.teal}/>
                      </div>
                      <div style={{textAlign:'left' as const}}>
                        <div style={{color:'#fff',fontWeight:700,fontSize:13}}>Report Commessa completo</div>
                        <div style={{color:'#8BBCBC',fontSize:11,marginTop:1}}>Misure → storia → materiali → anomalie</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={DS.teal}/>
                  </button>
                  <TabInfo openMaps={openMaps} bpId={bpId} setBpId={setBpId} press={press}/>
                </>
              )}
              {ctab==='vani'&&<TabVani onCad={(n,id)=>{setCadVano(n);setCadVanoId(id);setShowCad(true);}} vanoImgs={vanoImgs}/>}
              {ctab==='workflow'&&<TabWorkflow onChatWith={(nome)=>{
                // Aggiunge messaggio al thread con menzione
                setThread(t=>[...t,{id:Date.now(),autore:'Sistema',testo:` Messaggio a ${nome} dalla commessa`,ora:ora(),proprio:false,fase:'montaggio' as Fase}]);
                setCtab('chat');
              }}/>}
              {ctab==='checklist'&&<TabChecklist checklist={checklist} toggle={toggleCheck} addAtt={addAllegato} completate={completate}/>}
              {ctab==='documenti'&&<TabDocumenti bpId={bpId} setBpId={setBpId} press={press}/>}
              {ctab==='ordini'&&<TabOrdini ordini={ordini} setOrdini={setOrdini} onInvia={inviaOrdine} onConferma={confermaOrdine}/>}
              {ctab==='chat'&&<TabChatCommessa thread={thread} threadMsg={threadMsg} setThreadMsg={setThreadMsg} sendThread={sendThread} bpId={bpId} setBpId={setBpId} press={press}/>}
              {ctab==='collaudo'&&(
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div style={{...card,background:DS.topbar,padding:'12px 16px'}}>
                    <div style={{color:'#fff',fontWeight:800,fontSize:16}}>Collaudo e Firma</div>
                    <div style={{color:DS.teal,fontSize:12,marginTop:2}}>{comData.id} → {comData.cliente}</div>
                  </div>
                  <ChiudiLavoro commessaId={comData.id} cliente={comData.cliente} onClose={()=>setCtab('info')} inline/>
                </div>
              )}
              {/* BOTTONE CHIUDI LAVORO — fisso in fondo */}
              <div style={{marginTop:20,paddingTop:16,borderTop:`2px solid ${DS.border}`}}>
                {/* Barra progresso checklist */}
                <div style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:11,color:DS.textMid,fontWeight:600}}>Checklist completamento</span>
                    <span style={{fontFamily:DS.mono,fontSize:12,fontWeight:700,color:completate===CL_INIT.length?DS.green:DS.amber}}>
                      {completate}/{CL_INIT.length}
                    </span>
                  </div>
                  <div style={{height:6,background:DS.border,borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.round((completate/CL_INIT.length)*100)}%`,background:completate===CL_INIT.length?DS.green:DS.amber,borderRadius:99,transition:'width 300ms ease'}}/>
                  </div>
                  {completate<CL_INIT.length&&(
                    <div style={{fontSize:11,color:DS.amber,marginTop:5,textAlign:'center',fontWeight:600}}>
                      Completa tutte le {CL_INIT.length} voci per sbloccare la chiusura
                    </div>
                  )}
                  {completate===CL_INIT.length&&(
                    <div style={{fontSize:11,color:DS.green,marginTop:5,textAlign:'center',fontWeight:600}}>
                      OK Checklist completata — puoi chiudere il lavoro
                    </div>
                  )}
                </div>
                {/* Bottone — bloccato finché checklist incompleta */}
                <button
                  onClick={completate===CL_INIT.length?goToCollaudo:undefined}
                  disabled={completate<CL_INIT.length}
                  style={{
                    width:'100%',
                    background:completate===CL_INIT.length?DS.green:'#C8E4E4',
                    color:completate===CL_INIT.length?'#fff':'#8BBCBC',
                    border:'none',borderRadius:14,padding:'16px',
                    cursor:completate===CL_INIT.length?'pointer':'not-allowed',
                    fontFamily:DS.ui,fontWeight:800,fontSize:16,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                    boxShadow:completate===CL_INIT.length?`0 5px 0 0 ${DS.greenDark}`:'none',
                    transition:'all 200ms ease',
                    opacity:completate===CL_INIT.length?1:0.6,
                  }}>
                  <Check size={20}/>
                  {completate===CL_INIT.length?'Chiudi lavoro — Firma cliente':'Checklist incompleta'}
                </button>
              </div>
            </div>
          </div>
        )}
{/* CHAT */}
        {view==='bacheca'&&<BachecaFreelance/>}
        {view==='ordini_fl'&&<OrdiniFreelance/>}
        {view==='magazzino_fl'&&<MagazzinoWow/>}
        {view==='commesse_fl'&&<CommesseFreelance/>}
        {view==='fatture'&&<ContabilitaFreelance/>}
        {view==='impostazioni_fl'&&<ImpostazioniFreelance/>}
        {view==='chat'&&(
          <div style={{display:'flex',flexDirection:'column',flex:1}}>
            <div style={{background:DS.topbar,display:'flex',padding:'0 8px',flexShrink:0}}>
              {(['thread','direct'] as const).map(m=>(
                <button key={m} onClick={()=>{setChatMode(m);setDirectId(null);}}
                  style={{background:'none',border:'none',color:chatMode===m?DS.teal:'#8BBCBC',fontFamily:DS.ui,fontWeight:chatMode===m?700:400,fontSize:13,padding:'11px 16px',cursor:'pointer',borderBottom:chatMode===m?`2px solid ${DS.teal}`:'2px solid transparent',position:'relative'}}>
                  {m==='thread'?'COMMESSA':'DIRETTO'}
                  {m==='direct'&&unread>0&&<span style={{position:'absolute',top:8,right:4,width:16,height:16,borderRadius:'50%',background:DS.red,color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{unread}</span>}
                </button>
              ))}
            </div>
            {chatMode==='thread'&&(
              <div style={{display:'flex',flexDirection:'column',flex:1}}>
                <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
                  {thread.map(msg=>(
                    <div key={msg.id} style={{display:'flex',justifyContent:msg.proprio?'flex-end':'flex-start'}}>
                      <div style={{maxWidth:'82%',background:msg.proprio?DS.teal:'#fff',borderRadius:msg.proprio?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'8px 12px',border:msg.proprio?'none':`1px solid ${DS.border}`}}>
                        {!msg.proprio&&<div style={{fontSize:11,color:DS.teal,fontWeight:700,marginBottom:2}}>{msg.autore}</div>}
                        <div style={{fontSize:14,color:msg.proprio?'#fff':DS.text}}>{msg.testo}</div>
                        <div style={{fontSize:10,color:msg.proprio?'rgba(255,255,255,0.55)':DS.textLight,marginTop:3,textAlign:'right'}}>{msg.ora}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding:10,borderTop:`1px solid ${DS.border}`,display:'flex',gap:8,background:'#fff',flexShrink:0}}>
                  <input value={threadMsg} onChange={e=>setThreadMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendThread()} placeholder="Scrivi al team..." style={{flex:1,padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:10,fontSize:14,fontFamily:DS.ui,outline:'none'}}/>
                  <button onPointerDown={()=>setBpId('st')} onPointerUp={()=>press('st',sendThread)} style={{...bp(bpId==='st'),padding:'10px 14px'}}><Send size={15}/></button>
                </div>
              </div>
            )}
            {chatMode==='direct'&&!directId&&(
              <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:10}}>
                {contacts.map(c=>{
                  const u=c.msgs.filter(m=>!m.proprio).length;
                  return(
                    <button key={c.id} onClick={()=>setDirectId(c.id)} style={{...card,display:'flex',gap:12,alignItems:'center',width:'100%',textAlign:'left',cursor:'pointer',border:`1.5px solid ${u>0?DS.teal:DS.border}`}}>
                      <div style={{width:42,height:42,borderRadius:'50%',background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'#fff',flexShrink:0}}>{c.avatar}</div>
                      <div style={{flex:1}}><div style={{fontWeight:700,color:DS.text}}>{c.nome}</div><div style={{fontSize:12,color:DS.textMid,marginTop:2}}>{c.ruolo}</div></div>
                      {u>0&&<div style={{background:DS.teal,color:'#fff',borderRadius:'50%',width:22,height:22,fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{u}</div>}
                      <ArrowRight size={15} color={DS.textLight}/>
                    </button>
                  );
                })}
              </div>
            )}
            {chatMode==='direct'&&directId&&dc&&(
              <div style={{display:'flex',flexDirection:'column',flex:1}}>
                <div style={{padding:'8px 14px',background:DS.tealLight,borderBottom:`1px solid ${DS.border}`,display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
                  <button onClick={()=>setDirectId(null)} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><ChevronLeft size={20} color={DS.teal}/></button>
                  <div style={{width:32,height:32,borderRadius:'50%',background:DS.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:'#fff'}}>{dc.avatar}</div>
                  <div><div style={{fontWeight:700,color:DS.text,fontSize:14}}>{dc.nome}</div><div style={{fontSize:11,color:DS.textMid}}>{dc.ruolo}</div></div>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
                  {dc.msgs.length===0&&<div style={{color:DS.textMid,fontSize:13,textAlign:'center',marginTop:40}}>Nessun messaggio</div>}
                  {dc.msgs.map(msg=>(
                    <div key={msg.id} style={{display:'flex',justifyContent:msg.proprio?'flex-end':'flex-start'}}>
                      <div style={{maxWidth:'82%',background:msg.proprio?DS.teal:'#fff',borderRadius:msg.proprio?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'8px 12px',border:msg.proprio?'none':`1px solid ${DS.border}`}}>
                        {!msg.proprio&&<div style={{fontSize:11,color:DS.teal,fontWeight:700,marginBottom:2}}>{msg.autore}</div>}
                        <div style={{fontSize:14,color:msg.proprio?'#fff':DS.text}}>{msg.testo}</div>
                        <div style={{fontSize:10,color:msg.proprio?'rgba(255,255,255,0.55)':DS.textLight,marginTop:3,textAlign:'right'}}>{msg.ora}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding:10,borderTop:`1px solid ${DS.border}`,display:'flex',gap:8,background:'#fff',flexShrink:0}}>
                  <input value={directMsg} onChange={e=>setDirectMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendDirect()} placeholder={`Scrivi a ${dc.nome}...`} style={{flex:1,padding:'10px 12px',border:`1.5px solid ${DS.border}`,borderRadius:10,fontSize:14,fontFamily:DS.ui,outline:'none'}}/>
                  <button onPointerDown={()=>setBpId('sd')} onPointerUp={()=>press('sd',sendDirect)} style={{...bp(bpId==='sd'),padding:'10px 14px'}}><Send size={15}/></button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODALI */}
      {/* MODAL ORDINE DA DISEGNO CAD */}
      {cadOrdineOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:600,display:'flex',alignItems:'flex-end'}} onClick={()=>setCadOrdineOpen(null)}>
          <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:480,margin:'0 auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,borderRadius:2,background:DS.border,margin:'0 auto 16px'}}/>
            <div style={{fontWeight:800,color:DS.text,fontSize:17,marginBottom:4}}>Disegno salvato</div>
            <div style={{fontSize:13,color:DS.textMid,marginBottom:16}}>Vuoi creare un ordine basato su questo disegno per <strong>{cadOrdineOpen.vanoNome}</strong>?</div>
            <div style={{borderRadius:10,overflow:'hidden',border:`1.5px solid ${DS.border}`,marginBottom:16}}>
              <img src={cadOrdineOpen.imgData} alt="disegno" style={{width:'100%',display:'block',maxHeight:140,objectFit:'cover'}}/>
              <div style={{background:DS.tealLight,padding:'4px 10px',fontSize:11,color:DS.teal,fontWeight:600}}>
                {comData.id} → {cadOrdineOpen.vanoNome} → {new Date().toLocaleDateString('it-IT')}
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setCadOrdineOpen(null)} style={{flex:1,padding:'13px',borderRadius:12,border:`1.5px solid ${DS.border}`,background:DS.tealLight,color:DS.textMid,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:DS.ui}}>
                No, chiudi
              </button>
              <button onClick={()=>{
                setOrdini(o=>[...o,{id:Date.now(),desc:`Ordine disegno — ${cadOrdineOpen.vanoNome}`,qty:1,dest:'fornitore' as const,stato:'bozza' as const}]);
                setCadOrdineOpen(null);
                setCtab('ordini');
                setView('commessa');
              }} style={{flex:2,padding:'13px',borderRadius:12,border:'none',background:DS.green,color:'#fff',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:DS.ui,boxShadow:`0 5px 0 0 ${DS.greenDark}`,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <ShoppingCart size={16}/> Crea ordine
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL PAUSA */}
      {showPausaModal&&(
        <PausaModal
          onConferma={(motivo)=>{
            timer.pause();
            const now=new Date();
            const ora=now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
            const dur=pausaStart!=null?timer.fmt(timer.elapsed-pausaStart):'';
            setPauseLog(l=>[...l,{ora,motivo,durata:dur}]);
            setShowPausaModal(false);
          }}
          onAnnulla={()=>setShowPausaModal(false)}
        />
      )}
      <ReportCommessa open={reportOpen} onClose={()=>setReportOpen(false)} onOpenCad={(id,nome)=>{setCadVanoId(id);setCadVano(nome);setReportOpen(false);setShowCad(true);}}/>
      <MastroAI open={aiOpen} onClose={()=>setAiOpen(false)} ctx={ctxAI} onAction={handleFabAction}/>
      {showDisegno && <DisegnoCanvas commessaCodice={comData.id} onClose={()=>setShowDisegno(false)} onSend={(d)=>{console.log('Disegno:',d);setShowDisegno(false);}}/>}
      {showSpesa && <SpesaQuick commessaId={comData.id} commessaCodice={comData.id} operatore={'Marco Vito'} onClose={()=>setShowSpesa(false)} onSend={(s)=>{console.log('Spesa:',s);setShowSpesa(false);}}/>}
      <MastroFAB onAction={handleFabAction} activeCommessa={{ id: comData.id, codice: comData.id, cliente: comData.cliente }} onLogout={onLogout}/>

      {cadOverlay}
      {/* BOTTOM NAV */}
      {/* Menu secondario freelance */}
      {menuOpen&&modalita==='freelance'&&(
        <>
          <div onClick={()=>setMenuOpen(false)} style={{position:'fixed',inset:0,zIndex:98}}/>
          <div style={{position:'fixed',bottom:60,left:0,right:0,background:'rgba(13,31,31,0.98)',borderTop:'1px solid rgba(40,160,160,0.3)',zIndex:99,display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,backdropFilter:'blur(20px)'}}>
            {MENU_FL_ITEMS.map(item=>{
              const a=view===item.id;
              return(
                <button key={item.id} onClick={()=>{navigate(item.id as View);setMenuOpen(false);}}
                  style={{background:a?'rgba(40,160,160,0.15)':'transparent',border:'none',padding:'16px 8px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <item.icon size={22} color={a?DS.teal:'#8BBCBC'}/>
                  <span style={{fontSize:10,color:a?DS.teal:'#8BBCBC',fontWeight:700,fontFamily:DS.ui}}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:DS.topbar,display:'flex',borderTop:'1px solid rgba(40,160,160,0.2)'}}>
        {(modalita==='freelance'?NAV_FL:NAV).map(item=>{
          const isMenu = item.id==='__menu';
          const menuActive = isMenu && MENU_FL_ITEMS.some(m=>m.id===view);
          const a = isMenu ? menuActive : view===item.id;
          const dot=(item.id==='chat'&&unread>0)||(item.id==='agenda'&&pendenti>0);
          return(
            <button key={item.id} onClick={()=>{if(isMenu){setMenuOpen(v=>!v);}else{navigate(item.id as View);setMenuOpen(false);}}}
              style={{flex:1,background:'none',border:'none',padding:'9px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,
                boxShadow:a?`inset 0 -3px 0 ${DS.teal}`:'none',position:'relative'}}>
              {dot&&<div style={{position:'absolute',top:6,right:'calc(50% - 14px)',width:7,height:7,borderRadius:'50%',background:DS.red}}/>}
              {isMenu&&menuOpen
                ? <MoreHorizontal size={21} color={DS.teal}/>
                : <item.icon size={21} color={a?DS.teal:'#8BBCBC'}/>
              }
              <span style={{fontSize:9,color:a?DS.teal:'#8BBCBC',fontFamily:DS.ui,fontWeight:a?700:400}}>{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
