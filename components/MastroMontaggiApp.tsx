// ts-20260405m
'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Delete, LogIn, Eye, EyeOff } from 'lucide-react';
import MontaggiApp from './MontaggiApp';

// ─── DESIGN SYSTEM fliwoX ────────────────────────────────────────────────────
const DS = {
  bg: '#E8F4F4',
  topbar: '#0D1F1F',
  teal: '#28A0A0',
  tealDark: '#156060',
  tealLight: '#EEF8F8',
  red: '#DC4444',
  redDark: '#A83030',
  text: '#0D1F1F',
  textMid: '#4A7070',
  textLight: '#8BBCBC',
  border: '#C8E4E4',
  ui: 'system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

const gridBg: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(0deg, rgba(40,160,160,0.10) 0px, rgba(40,160,160,0.10) 1px, transparent 1px, transparent 32px),
    repeating-linear-gradient(90deg, rgba(40,160,160,0.10) 0px, rgba(40,160,160,0.10) 1px, transparent 1px, transparent 32px)
  `,
  backgroundColor: DS.bg,
};

const OPERATORI: Record<string, { nome: string; ruolo: string; avatar: string; pin: string }> = {
  marco:  { nome: 'Marco Vito',  ruolo: 'Montatore Senior', avatar: 'MV', pin: '1234' },
  luigi:  { nome: 'Luigi Serra', ruolo: 'Montatore',        avatar: 'LS', pin: '5678' },
  andrea: { nome: 'Andrea Neri', ruolo: 'Apprendista',      avatar: 'AN', pin: '9012' },
};

export default function MastroMontaggiApp() {
  const [step, setStep] = useState<'tipo' | 'select' | 'pin' | 'app'>('tipo');
  const [modalita, setModalita] = useState<'dipendente'|'freelance'>('dipendente');
  const [selected, setSelected] = useState<string>('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [btnPressed, setBtnPressed] = useState('');

  // Al mount legge localStorage — funziona solo lato client
  useEffect(() => {
    const saved = localStorage.getItem('fliwox_modalita') as 'dipendente'|'freelance'|null;
    if (saved) {
      setModalita(saved);
      setStep('app');
    }
  }, []);

  const press = (id: string, fn?: () => void) => {
    setBtnPressed(id);
    setTimeout(() => { setBtnPressed(''); fn?.(); }, 140);
  };

  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin(p => p + d);
  };

  const handleDel = () => setPin(p => p.slice(0, -1));

  const handleLogin = () => {
    const op = OPERATORI[selected];
    if (!op) return;
    if (pin === op.pin) {
      setError('');
      setStep('app');
    } else {
      setError('PIN errato. Riprova.');
      setPin('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fliwox_modalita');
    setStep('tipo');
    setPin('');
    setError('');
    setSelected('');
    setModalita('dipendente');
  };

  // freelance usa MontaggiApp con prop modalita='freelance'
  if (step === 'app') return <MontaggiApp onLogout={handleLogout} modalita={modalita}/>;

  if (step === 'pin') {
    const op = OPERATORI[selected];
    const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);
    return (
      <div style={{ ...gridBg, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: DS.ui }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ background: DS.topbar, borderRadius: 16, padding: '10px 24px', display: 'inline-block' }}>
            <span style={{ color: DS.teal, fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>fliwoX</span>
            <span style={{ color: '#8BBCBC', fontWeight: 400, fontSize: 14, marginLeft: 8 }}>Montaggi</span>
          </div>
        </div>

        {/* Avatar + nome */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#fff', margin: '0 auto 12px', boxShadow: `0 4px 0 0 ${DS.tealDark}` }}>{op.avatar}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: DS.text }}>{op.nome}</div>
          <div style={{ fontSize: 13, color: DS.textMid }}>{op.ruolo}</div>
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          {dots.map((filled, i) => (
            <div key={i} style={{ width: showPin ? 'auto' : 18, height: 18, borderRadius: showPin ? 4 : '50%', background: filled ? DS.teal : DS.tealLight, border: `2px solid ${filled ? DS.teal : DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms', padding: showPin && filled ? '0 6px' : 0 }}>
              {showPin && filled && <span style={{ fontFamily: DS.mono, color: '#fff', fontSize: 13, fontWeight: 700 }}>{pin[i]}</span>}
            </div>
          ))}
          <button onClick={() => setShowPin(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4 }}>
            {showPin ? <EyeOff size={16} color={DS.textMid} /> : <Eye size={16} color={DS.textMid} />}
          </button>
        </div>
        {error && <div style={{ color: DS.red, fontSize: 13, marginBottom: 8 }}>{error}</div>}

        {/* Tastierino */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12, marginTop: 8 }}>
          {['1','2','3','4','5','6','7','8','9','', '0', 'del'].map((d, i) => {
            if (d === '') return <div key={i} />;
            const isDel = d === 'del';
            const id = `key-${d}`;
            return (
              <button key={d} onPointerDown={() => { setBtnPressed(id); if(!isDel) handleDigit(d); else handleDel(); }} onPointerUp={() => setBtnPressed('')}
                style={{ height: 72, borderRadius: 14, border: `2px solid ${DS.border}`, background: isDel ? DS.tealLight : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DS.mono, fontWeight: 700, fontSize: 22, color: DS.text, boxShadow: btnPressed === id ? 'none' : `0 4px 0 0 ${DS.border}`, transform: btnPressed === id ? 'translateY(3px)' : 'translateY(0)', transition: 'box-shadow 80ms, transform 80ms' }}>
                {isDel ? <Delete size={20} color={DS.textMid} /> : d}
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <button disabled={pin.length < 4} onPointerDown={() => setBtnPressed('login')} onPointerUp={() => press('login', handleLogin)}
          style={{ marginTop: 24, width: 216, height: 52, borderRadius: 14, border: 'none', background: pin.length === 4 ? DS.teal : DS.tealLight, color: pin.length === 4 ? '#fff' : DS.textLight, fontFamily: DS.ui, fontWeight: 700, fontSize: 16, cursor: pin.length === 4 ? 'pointer' : 'default', boxShadow: pin.length === 4 ? (btnPressed === 'login' ? 'none' : `0 5px 0 0 ${DS.tealDark}`) : 'none', transform: btnPressed === 'login' ? 'translateY(4px)' : 'translateY(0)', transition: 'box-shadow 80ms, transform 80ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <LogIn size={18} /> Accedi
        </button>

        <button onClick={() => { setStep('select'); setPin(''); setError(''); }} style={{ marginTop: 16, background: 'none', border: 'none', color: DS.textMid, cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
          Cambia operatore
        </button>
      </div>
    );
  }

  // step === 'tipo'
  if (step === 'tipo') return (
    <div style={{ ...gridBg, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: DS.ui }}>
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{ background: DS.topbar, borderRadius: 16, padding: '10px 28px', display: 'inline-block', marginBottom: 12 }}>
          <span style={{ color: DS.teal, fontWeight: 800, fontSize: 26, letterSpacing: -1 }}>fliwoX</span>
          <span style={{ color: '#8BBCBC', fontWeight: 400, fontSize: 16, marginLeft: 8 }}>Montaggi</span>
        </div>
        <div style={{ color: DS.textMid, fontSize: 15, fontWeight: 600 }}>Come lavori?</div>
        <div style={{ color: DS.textLight, fontSize: 12, marginTop: 4 }}>Scegli la modalita giusta per te</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320 }}>
        <button onClick={() => { localStorage.setItem('fliwox_modalita','dipendente'); setModalita('dipendente'); setStep('select'); }}
          style={{ background: '#fff', border: `2px solid ${DS.border}`, borderRadius: 16, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', boxShadow: `0 5px 0 0 ${DS.border}` }}>
          <div style={{ fontWeight: 800, color: DS.text, fontSize: 16, marginBottom: 4 }}>Dipendente</div>
          <div style={{ fontSize: 13, color: DS.textMid, lineHeight: 1.5 }}>Lavori per una sola azienda. Vedi i lavori assegnati, la tua agenda e i messaggi del team.</div>
        </button>
        <button onClick={() => { localStorage.setItem('fliwox_modalita','freelance'); setModalita('freelance'); setStep('app'); }}
          style={{ background: DS.topbar, border: `2px solid ${DS.teal}`, borderRadius: 16, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', boxShadow: `0 5px 0 0 ${DS.tealDark}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontWeight: 800, color: '#F2F1EC', fontSize: 16 }}>Freelance</div>
            <span style={{ background: DS.teal, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>COMPLETO</span>
          </div>
          <div style={{ fontSize: 13, color: '#8BBCBC', lineHeight: 1.5 }}>Lavori per piu aziende. Gestisci commesse, ordini, contabilita personale e da incassare per ogni cliente.</div>
        </button>
      </div>
    </div>
  );

  // step === 'select'
  return (
    <div style={{ ...gridBg, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: DS.ui }}>
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{ background: DS.topbar, borderRadius: 16, padding: '10px 28px', display: 'inline-block', marginBottom: 8 }}>
          <span style={{ color: DS.teal, fontWeight: 800, fontSize: 26, letterSpacing: -1 }}>fliwoX</span>
          <span style={{ color: '#8BBCBC', fontWeight: 400, fontSize: 16, marginLeft: 8 }}>Montaggi</span>
        </div>
        <div style={{ color: DS.textMid, fontSize: 14 }}>Seleziona il tuo profilo</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320 }}>
        {Object.entries(OPERATORI).map(([key, op]) => {
          const id = `sel-${key}`;
          return (
            <button key={key} onPointerDown={() => setBtnPressed(id)} onPointerUp={() => press(id, () => { setSelected(key); setStep('pin'); })}
              style={{ background: selected === key ? DS.tealLight : '#fff', border: `2px solid ${selected === key ? DS.teal : DS.border}`, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', boxShadow: btnPressed === id ? 'none' : `0 4px 0 0 ${DS.border}`, transform: btnPressed === id ? 'translateY(3px)' : 'translateY(0)', transition: 'box-shadow 80ms, transform 80ms', textAlign: 'left' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0 }}>{op.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, color: DS.text, fontSize: 15 }}>{op.nome}</div>
                <div style={{ color: DS.textMid, fontSize: 13, marginTop: 2 }}>{op.ruolo}</div>
              </div>
              <Lock size={16} color={DS.textLight} style={{ marginLeft: 'auto' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
