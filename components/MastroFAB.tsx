// ts-20260405h
'use client';
import React, { useState, useRef, useCallback } from 'react';
import {
  Sparkles, X, ClipboardList, CheckCircle,
  AlertTriangle, Package, FileText, ChevronLeft, ChevronRight, RotateCcw, Receipt, PenTool
} from 'lucide-react';

const DS = {
  teal:'#28A0A0', tealDark:'#156060',
  green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030',
  amber:'#D08008', amberDark:'#A06005',
  ui:'system-ui, -apple-system, sans-serif',
};

const FAB_ITEMS = [
  { id:'ai',       label:'MASTRO AI',    icon:<Sparkles size={17}/>,      bg:DS.teal,   sh:DS.tealDark  },
  { id:'report',   label:'Report',       icon:<FileText size={17}/>,       bg:'#1a3535', sh:'#000'       },
  { id:'commessa', label:'Lavoro',        icon:<ClipboardList size={17}/>, bg:'#2a4545', sh:'#000'       },
  { id:'blocco',   label:'Problema',     icon:<AlertTriangle size={17}/>,  bg:DS.red,    sh:DS.redDark   },
  { id:'ordini',   label:'Ordina',       icon:<Package size={17}/>,        bg:DS.amber,  sh:DS.amberDark },
  { id:'spesa',    label:'Spesa',        icon:<Receipt size={17}/>,         bg:'#2a4535', sh:'#000'       },
  { id:'disegno',  label:'Disegno',      icon:<PenTool size={17}/>,         bg:'#2a3545', sh:'#000'       },
  { id:'logout',   label:'Cambia tipo',  icon:<CheckCircle size={17}/>,    bg:'#2a3535', sh:'#000'       },
];

// fliwoX logo SVG inline — mostrato sul FAB quando chiuso
function FliwoxMini() {
  return (
    <svg width="26" height="26" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <rect x="55" y="55" width="90" height="90" rx="22" fill="rgba(255,255,255,0.25)"/>
        <path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
        <path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ts-20260405
interface ActiveCommessa { id: string; codice: string; cliente: string; }
interface Props {
  onAction: (id: string, commessaId?: string) => void;
  activeCommessa?: ActiveCommessa | null;
  onLogout?: () => void;
}

export default function MastroFAB({ onAction, activeCommessa, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'right'|'left'>('right');
  const [bottom, setBottom] = useState(90);
  const [lastAction, setLastAction] = useState<{id:string;label:string;icon:React.ReactNode}|null>(null);

  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startY = useRef(0);
  const startBottom = useRef(90);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const handle = (id: string) => {
    if (id === 'logout') { setOpen(false); onLogout?.(); return; }
    const item = FAB_ITEMS.find(x => x.id === id);
    if (item) setLastAction({ id: item.id, label: item.label, icon: item.icon });
    setOpen(false);
    onAction(id, activeCommessa?.id);
  };

  const onPD = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    didDrag.current = false;
    startY.current = e.clientY;
    startBottom.current = bottom;
  }, [bottom]);

  const onPM = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > 5) didDrag.current = true;
    const nb = Math.max(70, Math.min(window.innerHeight - 120, startBottom.current - dy));
    setBottom(nb);
  }, []);

  const onPU = useCallback(() => {
    dragging.current = false;
    if (didDrag.current) return;
    // Doppio tap = cambia lato, singolo tap = apri/chiudi
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      if (tapCount.current >= 2) {
        setSide(s => s === 'right' ? 'left' : 'right');
        setOpen(false);
      } else {
        setOpen(o => !o);
      }
      tapCount.current = 0;
    }, 280);
  }, []);

  const isRight = side === 'right';

  // Stile bordo arrotondato solo sul lato interno
  const fabRadius = isRight ? '14px 0 0 14px' : '0 14px 14px 0';
  const itemRadius = isRight ? '22px 0 0 22px' : '0 22px 22px 0';
  const shadowDir = isRight ? '-3px' : '3px';
  const slideFrom = isRight ? 'translateX(110%)' : 'translateX(-110%)';

  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, zIndex:148 }}/>}

      <div style={{
        position: 'fixed',
        [isRight ? 'right' : 'left']: 0,
        bottom: bottom,
        zIndex: 149,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        gap: 5,
        pointerEvents: 'none',
      }}>
        {/* Items — slide dal lato */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          alignItems: isRight ? 'flex-end' : 'flex-start',
          marginBottom: 8,
          pointerEvents: open ? 'auto' : 'none',
        }}>
          {lastAction && (
          <button onClick={() => handle(lastAction.id)}
            style={{
              display: 'flex',
              flexDirection: isRight ? 'row' : 'row-reverse',
              alignItems: 'center',
              gap: 10,
              paddingLeft: isRight ? 14 : 16,
              paddingRight: isRight ? 16 : 14,
              height: 44,
              borderRadius: itemRadius,
              border: `1.5px solid rgba(40,160,160,0.5)`,
              background: 'rgba(13,31,31,0.92)',
              cursor: 'pointer',
              color: '#28A0A0',
              fontFamily: DS.ui,
              fontWeight: 700,
              fontSize: 12,
              boxShadow: `${shadowDir} 3px 0 0 #000, 0 6px 20px rgba(0,0,0,0.3)`,
              transform: open ? 'translateX(0)' : slideFrom,
              opacity: open ? 1 : 0,
              transition: `transform 220ms cubic-bezier(.34,1.56,.64,1), opacity 180ms`,
              whiteSpace: 'nowrap',
              pointerEvents: open ? 'auto' : 'none',
            }}>
            <RotateCcw size={14}/>
            <span style={{color:'#8BBCBC',fontWeight:400}}>Riprendi: </span>
            <span>{lastAction.label}</span>
          </button>
        )}
        {FAB_ITEMS.map((item, i) => (
            <button key={item.id} onClick={() => handle(item.id)}
              style={{
                display: 'flex',
                flexDirection: isRight ? 'row' : 'row-reverse',
                alignItems: 'center',
                gap: 10,
                paddingLeft: isRight ? 14 : 16,
                paddingRight: isRight ? 16 : 14,
                height: 44,
                borderRadius: itemRadius,
                border: 'none',
                background: item.bg,
                cursor: 'pointer',
                color: '#fff',
                fontFamily: DS.ui,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: `${shadowDir} 3px 0 0 ${item.sh}, 0 6px 20px rgba(0,0,0,0.3)`,
                transform: open ? 'translateX(0)' : slideFrom,
                opacity: open ? 1 : 0,
                transition: `transform 220ms ${i*35}ms cubic-bezier(.34,1.56,.64,1), opacity 180ms ${i*35}ms`,
                whiteSpace: 'nowrap',
                pointerEvents: open ? 'auto' : 'none',
              }}>
              {item.icon}
              <span>{item.label}{item.id!=='ai'&&item.id!=='logout'&&activeCommessa?' · '+activeCommessa.codice:''}</span>
            </button>
          ))}
        </div>

        {/* Badge commessa attiva */}
        {activeCommessa && open && (
          <div style={{
            display:'flex', flexDirection: isRight ? 'row' : 'row-reverse',
            alignItems:'center', gap:8,
            paddingLeft: isRight ? 12 : 14, paddingRight: isRight ? 14 : 12,
            height:36, borderRadius: itemRadius,
            background:'rgba(13,31,31,0.75)',
            border:'1px solid rgba(40,160,160,0.3)',
            color:'#8BBCBC', fontFamily:DS.ui, fontSize:11, fontWeight:600,
            whiteSpace:'nowrap', pointerEvents:'none',
            boxShadow:`${shadowDir} 2px 0 0 #000`,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#28A0A0" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>
            <span style={{color:'#28A0A0'}}>{activeCommessa.codice}</span>
            <span>{activeCommessa.cliente}</span>
          </div>
        )}

        {/* FAB principale */}
        <div
          onPointerDown={onPD}
          onPointerMove={onPM}
          onPointerUp={onPU}
          style={{
            width: 54,
            height: 54,
            borderRadius: fabRadius,
            background: open
              ? 'linear-gradient(135deg, #A83030, #DC4444)'
              : 'linear-gradient(135deg, #28A0A0, #1A9E73)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            boxShadow: open
              ? `${shadowDir.replace('-','').replace('3','4')}px 4px 0 0 #701010, 0 8px 24px rgba(220,68,68,0.45)`
              : `${shadowDir.replace('3','4')}px 4px 0 0 #156060, 0 8px 24px rgba(40,160,160,0.45)`,
            transform: open ? 'rotate(45deg)' : 'rotate(0)',
            transition: dragging.current ? 'none' : 'background 200ms, transform 220ms cubic-bezier(.34,1.56,.64,1)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
            pointerEvents: 'auto',
          }}>
          {open ? <X size={24} color="#fff"/> : <FliwoxMini/>}
        </div>

        {/* Hint doppio tap — compare dopo 3 secondi se mai aperto */}
        <div style={{
          position: 'absolute',
          [isRight ? 'right' : 'left']: 60,
          bottom: 14,
          background: 'rgba(13,31,31,0.85)',
          color: '#8BBCBC',
          fontSize: 10,
          padding: '3px 8px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          fontFamily: DS.ui,
          opacity: 0,
          animation: 'hintFade 3s ease-out 4s forwards',
          pointerEvents: 'none',
        }}>
          Doppio tap = cambia lato
        </div>

        {/* Pulse ring */}
        {!open && (
          <div style={{
            position: 'absolute',
            [isRight ? 'right' : 'left']: 0,
            bottom: 0,
            width: 54,
            height: 54,
            borderRadius: fabRadius,
            border: '2px solid rgba(40,160,160,0.5)',
            animation: 'fabPulse 2.5s ease-out infinite',
            pointerEvents: 'none',
          }}/>
        )}
      </div>

      <style>{`
        @keyframes fabPulse {
          0%   { transform:scale(1);    opacity:.7 }
          70%  { transform:scale(1.12); opacity:0  }
          100% { transform:scale(1.12); opacity:0  }
        }
        @keyframes hintFade {
          0%   { opacity:0 }
          20%  { opacity:1 }
          80%  { opacity:1 }
          100% { opacity:0 }
        }
      `}</style>
    </>
  );
}
