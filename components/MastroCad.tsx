'use client';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  X, Trash2, Undo2, ZoomIn, ZoomOut, Download, Pen,
  Move, Square, Circle, Minus, Type, RotateCcw, Check
} from 'lucide-react';

const DS = {
  topbar: '#0D1F1F',
  teal: '#28A0A0',
  tealDark: '#156060',
  tealLight: '#EEF8F8',
  green: '#1A9E73',
  greenDark: '#0F7A56',
  red: '#DC4444',
  text: '#0D1F1F',
  textMid: '#4A7070',
  textLight: '#8BBCBC',
  border: '#C8E4E4',
  ui: 'system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// ─── TIPI ─────────────────────────────────────────────────────────────────────
type Tool = 'pen' | 'line' | 'rect' | 'circle' | 'text' | 'move' | 'erase';
type Point = { x: number; y: number };

interface Shape {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  width: number;
  text?: string;
  fill?: string;
}

interface Props {
  onClose: () => void;
  onSaveImg?: (imgData: string) => void;
  existingImg?: string;
  commessaId?: string;
  vanoNome?: string;
}

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const COLORS = ['#0D1F1F', '#28A0A0', '#DC4444', '#1A9E73', '#D08008', '#3B7FE0', '#8B4513'];
const WIDTHS = [1, 2, 4, 8];

const SNAP_GRID = 10; // snap a griglia 10px

function snapToGrid(val: number) {
  return Math.round(val / SNAP_GRID) * SNAP_GRID;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function MastroCad({ onClose, onSaveImg, existingImg, commessaId = 'COM-047', vanoNome = 'Vano' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#0D1F1F');
  const [width, setWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<Partial<Shape> | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState<Point | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [snap, setSnap] = useState(true);
  const [unit, setUnit] = useState<'mm'|'cm'>('cm');
  // 1px canvas = 1mm reale (scala 1:1 a zoom 1)
  const pxToUnit = (px: number) => unit === 'cm' ? (px / 10).toFixed(1) + ' cm' : Math.round(px) + ' mm';
  const [showPalette, setShowPalette] = useState(false);
  const [btnPressed, setBtnPressed] = useState('');
  const [canvasDims, setCanvasDims] = useState({ w: 360, h: 500 });

  // Misura canvas reale
  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setCanvasDims({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ridisegna tutto
  const redraw = useCallback((shapeList: Shape[], cur?: Partial<Shape> | null, unitOverride?: 'mm'|'cm') => {
    const activeUnit = unitOverride ?? unit;
    const pxToUnitLocal = (px: number) => activeUnit === 'cm' ? (px / 10).toFixed(1) + ' cm' : Math.round(px) + ' mm';
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // griglia
    ctx.save();
    ctx.strokeStyle = 'rgba(40,160,160,0.12)';
    ctx.lineWidth = 0.5;
    const step = SNAP_GRID * zoom;
    for (let x = 0; x < canvas.width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    ctx.restore();

    const all = cur ? [...shapeList, cur as Shape] : shapeList;
    for (const s of all) drawShape(ctx, s, zoom, activeUnit);
  }, [zoom, unit]);

  useEffect(() => {
    redraw(shapes, current);
  }, [shapes, current, zoom, unit, canvasDims, redraw]);

  function drawShape(ctx: CanvasRenderingContext2D, s: Partial<Shape>, z: number, activeUnit: 'mm'|'cm' = 'cm') {
    const pxToU = (px: number) => activeUnit === 'cm' ? (px / 10).toFixed(1) + ' cm' : Math.round(px) + ' mm';
    if (!s.points?.length) return;
    ctx.save();
    ctx.strokeStyle = s.color ?? '#000';
    ctx.fillStyle = s.fill ?? 'transparent';
    ctx.lineWidth = (s.width ?? 2) * z;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pts = s.points.map(p => ({ x: p.x * z, y: p.y * z }));

    switch (s.tool) {
      case 'pen':
      case 'erase':
        if (s.tool === 'erase') { ctx.strokeStyle = '#E8F4F4'; ctx.lineWidth = 20 * z; }
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        // dimensione
        if (pts.length >= 2) {
          const dx = pts[pts.length-1].x - pts[0].x;
          const dy = pts[pts.length-1].y - pts[0].y;
          const distPx = Math.sqrt(dx*dx + dy*dy) / z;
          const mx = (pts[0].x + pts[pts.length-1].x) / 2;
          const my = (pts[0].y + pts[pts.length-1].y) / 2;
          ctx.font = `bold ${12 * z}px JetBrains Mono, monospace`;
          ctx.fillStyle = s.color ?? '#000';
          ctx.textAlign = 'center';
          ctx.fillText(pxToU(distPx), mx, my - 7 * z);
        }
        break;
      case 'rect':
        if (pts.length >= 2) {
          const rx = pts[0].x, ry = pts[0].y;
          const rw = pts[pts.length-1].x - rx, rh = pts[pts.length-1].y - ry;
          ctx.strokeRect(rx, ry, rw, rh);
          // dimensioni
          ctx.font = `${10 * z}px JetBrains Mono, monospace`;
          ctx.fillStyle = s.color ?? '#000';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.abs(Math.round(rw/z))}x${Math.abs(Math.round(rh/z))}`, rx + rw/2, ry - 4*z);
        }
        break;
      case 'circle':
        if (pts.length >= 2) {
          const cx = pts[0].x, cy = pts[0].y;
          const dx2 = pts[pts.length-1].x - cx, dy2 = pts[pts.length-1].y - cy;
          const r = Math.sqrt(dx2*dx2 + dy2*dy2);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = `${10 * z}px JetBrains Mono, monospace`;
          ctx.fillStyle = s.color ?? '#000';
          ctx.textAlign = 'center';
          ctx.fillText(`r${Math.round(r/z)}`, cx, cy - r - 4*z);
        }
        break;
      case 'text':
        if (s.text) {
          ctx.font = `${14 * z}px system-ui`;
          ctx.fillStyle = s.color ?? '#000';
          ctx.textAlign = 'left';
          ctx.fillText(s.text, pts[0].x, pts[0].y);
        }
        break;
    }
    ctx.restore();
  }

  function getPos(e: React.PointerEvent, forceFree = false): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const raw = { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
    const useSnap = snap && !forceFree && tool !== 'pen' && tool !== 'erase';
    return useSnap ? { x: snapToGrid(raw.x), y: snapToGrid(raw.y) } : raw;
  }

  function commitHistory(newShapes: Shape[]) {
    const newHist = history.slice(0, histIdx + 1);
    newHist.push(newShapes);
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setShapes(newShapes);
  }

  function undo() {
    if (histIdx <= 0) return;
    const prev = history[histIdx - 1];
    setHistIdx(histIdx - 1);
    setShapes(prev);
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (tool === 'text') {
      setTextPos(pos);
      setShowTextInput(true);
      return;
    }
    const freeMode = tool === 'pen' || tool === 'erase';
    setDrawing(true);
    setCurrent({ id: uid(), tool, color, width, points: [getPos(e, freeMode)] });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing || !current) return;
    const freeMode = tool === 'pen' || tool === 'erase';
    const pos = getPos(e, freeMode);
    if (freeMode) {
      setCurrent(c => c ? { ...c, points: [...(c.points ?? []), pos] } : c);
    } else {
      setCurrent(c => c ? { ...c, points: [c.points![0], pos] } : c);
    }
  };

  const onPointerUp = () => {
    if (!drawing || !current) return;
    setDrawing(false);
    if ((current.points?.length ?? 0) > 0) {
      commitHistory([...shapes, current as Shape]);
    }
    setCurrent(null);
  };

  function confirmText() {
    if (!textPos || !textInput.trim()) { setShowTextInput(false); return; }
    const s: Shape = { id: uid(), tool: 'text', points: [textPos], color, width, text: textInput };
    commitHistory([...shapes, s]);
    setTextInput('');
    setShowTextInput(false);
    setTextPos(null);
  }

  function clearAll() { commitHistory([]); }

  function saveCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) { onClose(); return; }
    const imgData = canvas.toDataURL('image/png');
    if (onSaveImg) onSaveImg(imgData);
    else onClose();
  }

  const press = (id: string, fn?: () => void) => {
    setBtnPressed(id);
    setTimeout(() => { setBtnPressed(''); fn?.(); }, 140);
  };

  const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'pen',    icon: <Pen size={18} />,    label: 'Libero' },
    { id: 'line',   icon: <Minus size={18} />,  label: 'Linea' },
    { id: 'rect',   icon: <Square size={18} />, label: 'Rettangolo' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Cerchio' },
    { id: 'text',   icon: <Type size={18} />,   label: 'Testo' },
    { id: 'erase',  icon: <RotateCcw size={18} />, label: 'Cancella' },
  ];

  const btnStyle = (p = false): React.CSSProperties => ({
    background: DS.tealLight, border: `1.5px solid ${DS.border}`, borderRadius: 8,
    padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: p ? 'none' : `0 3px 0 0 ${DS.border}`,
    transform: p ? 'translateY(2px)' : 'translateY(0)',
    transition: 'box-shadow 80ms, transform 80ms',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: DS.topbar, display: 'flex', flexDirection: 'column', fontFamily: DS.ui }}>
      {/* HEADER */}
      <div style={{ background: DS.topbar, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={20} color="#fff" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: DS.teal, fontWeight: 700, fontSize: 14 }}>MastroCad</div>
          <div style={{ color: DS.textLight, fontSize: 11 }}>{commessaId} · {vanoNome}</div>
        </div>
        <button onPointerDown={() => setBtnPressed('undo')} onPointerUp={() => press('undo', undo)}
          style={{ ...btnStyle(btnPressed === 'undo'), background: 'rgba(255,255,255,0.08)', border: 'none' }}>
          <Undo2 size={18} color={histIdx > 0 ? DS.teal : DS.textLight} />
        </button>
        <button onPointerDown={() => setBtnPressed('clear')} onPointerUp={() => press('clear', clearAll)}
          style={{ ...btnStyle(btnPressed === 'clear'), background: 'rgba(255,255,255,0.08)', border: 'none' }}>
          <Trash2 size={18} color={DS.red} />
        </button>
        <button onPointerDown={() => setBtnPressed('save')} onPointerUp={() => press('save', saveCanvas)}
          style={{ background: DS.green, border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13, boxShadow: btnPressed === 'save' ? 'none' : `0 4px 0 0 ${DS.greenDark}`, transform: btnPressed === 'save' ? 'translateY(3px)' : 'translateY(0)', transition: 'box-shadow 80ms, transform 80ms' }}>
          <Check size={16} /> Salva
        </button>
      </div>

      {/* TOOLBAR STRUMENTI */}
      <div style={{ background: '#122828', padding: '8px 12px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0, alignItems: 'center' }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)}
            style={{ background: tool === t.id ? DS.teal : 'rgba(255,255,255,0.08)', border: `1.5px solid ${tool === t.id ? DS.tealDark : 'transparent'}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 48, boxShadow: tool === t.id ? `0 3px 0 0 ${DS.tealDark}` : 'none' }}>
            <span style={{ color: tool === t.id ? '#fff' : DS.textLight }}>{t.icon}</span>
            <span style={{ color: tool === t.id ? '#fff' : DS.textLight, fontSize: 9, fontFamily: DS.ui }}>{t.label}</span>
          </button>
        ))}

        {/* separatore */}
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* zoom */}
        <button onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}>
          <ZoomIn size={18} color={DS.teal} />
        </button>
        <span style={{ color: DS.textLight, fontSize: 12, fontFamily: DS.mono, minWidth: 36, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}>
          <ZoomOut size={18} color={DS.teal} />
        </button>

        {/* snap toggle */}
        <button onClick={() => setSnap(s => !s)}
          style={{ background: snap ? DS.teal : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}>
          <span style={{ color: snap ? '#fff' : DS.textLight, fontSize: 11, fontFamily: DS.ui }}>SNAP</span>
        </button>

      </div>

      {/* PALETTE COLORI + SPESSORI + UNITÀ */}
      <div style={{ background: '#0a1e1e', padding: '8px 12px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${color === c ? '#fff' : 'transparent'}`, cursor: 'pointer', flexShrink: 0, boxShadow: color === c ? `0 0 0 2px ${DS.teal}` : 'none' }} />
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {WIDTHS.map(w => (
            <button key={w} onClick={() => setWidth(w)}
              style={{ width: 32, height: 22, borderRadius: 4, background: width === w ? DS.teal : 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 18, height: w, borderRadius: 2, background: width === w ? '#fff' : DS.textLight }} />
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button onClick={() => setUnit(u => u === 'mm' ? 'cm' : 'mm')}
            style={{ background: unit === 'cm' ? DS.teal : '#D08008', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#fff', fontSize: 13, fontFamily: DS.mono, fontWeight: 800 }}>{unit}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: DS.ui }}>↕</span>
          </button>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#E8F4F4' }}>
        <canvas
          ref={canvasRef}
          width={canvasDims.w}
          height={canvasDims.h}
          style={{ width: '100%', height: '100%', touchAction: 'none', cursor: tool === 'erase' ? 'cell' : tool === 'text' ? 'text' : 'crosshair', display: 'block' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        {/* label snap */}
        {snap && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(13,31,31,0.7)', borderRadius: 6, padding: '3px 8px', color: DS.teal, fontSize: 10, fontFamily: DS.mono }}>
            SNAP {SNAP_GRID}px
          </div>
        )}
      </div>

      {/* TEXT INPUT MODAL */}
      {showTextInput && (
        <div style={{ position: 'absolute', bottom: 80, left: 16, right: 16, background: '#fff', borderRadius: 12, border: `2px solid ${DS.teal}`, padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200 }}>
          <div style={{ fontSize: 13, color: DS.textMid, marginBottom: 8 }}>Inserisci testo</div>
          <input autoFocus value={textInput} onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmText()}
            style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${DS.border}`, borderRadius: 8, fontSize: 15, fontFamily: DS.ui, outline: 'none', boxSizing: 'border-box' }}
            placeholder="Es: 120x140 cm" />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button onClick={() => setShowTextInput(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${DS.border}`, background: DS.tealLight, color: DS.teal, fontWeight: 600, cursor: 'pointer', fontFamily: DS.ui }}>
              Annulla
            </button>
            <button onClick={confirmText} style={{ flex: 2, padding: '9px', borderRadius: 8, border: 'none', background: DS.teal, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: DS.ui, boxShadow: `0 4px 0 0 ${DS.tealDark}` }}>
              Inserisci
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
