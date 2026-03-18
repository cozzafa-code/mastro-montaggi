"use client";
import { useEffect, useState } from "react";
import MastroMontaggi from "@/components/MastroMontaggi";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [operatore, setOperatore] = useState<string | null>(null);

  useEffect(() => {
    // Leggi operatore da sessionStorage (passato dal login centrale)
    const op = sessionStorage.getItem("mastro_operatore");
    if (op) {
      try {
        const parsed = JSON.parse(op);
        setOperatore(parsed.nome || "Operatore");
        setReady(true);
        return;
      } catch {}
    }

    // Leggi da query param ?op=Nome (fallback)
    const params = new URLSearchParams(window.location.search);
    const opParam = params.get("op");
    if (opParam) {
      setOperatore(decodeURIComponent(opParam));
      setReady(true);
      return;
    }

    // Nessun operatore â€” redirect al login centrale
    window.location.href = "https://mastro-erp.vercel.app/login";
  }, []);

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:"#1A1A1C", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif" }}>
      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Caricamento...</div>
    </div>
  );

  return <MastroMontaggi operatoreEsterno={operatore} />;
}