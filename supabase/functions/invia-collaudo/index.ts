// supabase/functions/invia-collaudo/index.ts
// Edge Function: genera PDF collaudo + invia email cliente

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  try {
    const { firma_id, commessa_id } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // 1. Recupera dati firma e commessa
    const { data: firma } = await supabase
      .from('firma_collaudo')
      .select('*, commesse(codice_commessa, nome_cliente, vani(*))')
      .eq('id', firma_id)
      .single()

    if (!firma) return new Response('Firma non trovata', { status: 404 })

    // 2. Genera HTML collaudo (in produzione: usa Puppeteer o similar)
    const html = `
      <html>
      <head><style>
        body { font-family: Inter, sans-serif; max-width: 800px; margin: 40px auto; color: #0B1F2A; }
        h1 { color: #14B8A6; } .firma-box { border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; }
      </style></head>
      <body>
        <h1>Collaudo Montaggio</h1>
        <p><strong>Commessa:</strong> ${firma.commesse?.codice_commessa}</p>
        <p><strong>Cliente:</strong> ${firma.cliente_nome}</p>
        <p><strong>Data:</strong> ${new Date(firma.created_at).toLocaleDateString('it-IT')}</p>
        <p><strong>Saldo al collaudo:</strong> €${firma.saldo_al_collaudo}</p>
        <div class="firma-box">
          <p>Il cliente sottoscrive la corretta installazione e il collaudo positivo.</p>
          <p><em>Firma acquisita digitalmente il ${new Date(firma.created_at).toLocaleString('it-IT')}</em></p>
        </div>
      </body>
      </html>
    `

    // 3. Salva HTML come PDF-placeholder in Storage
    const pdfPath = `collaudi/${commessa_id}/${firma_id}.html`
    await supabase.storage.from('firma-collaudo').upload(pdfPath, html, { contentType: 'text/html' })

    const { data: { publicUrl } } = supabase.storage.from('firma-collaudo').getPublicUrl(pdfPath)

    // 4. Invia email via Resend
    if (firma.cliente_email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'MASTRO <collaudo@mastrosuite.com>',
          to: firma.cliente_email,
          subject: `Collaudo completato — ${firma.commesse?.codice_commessa}`,
          html: `
            <p>Gentile ${firma.cliente_nome},</p>
            <p>Il montaggio è stato completato con successo. 
               In allegato troverà il documento di collaudo firmato.</p>
            <p><a href="${publicUrl}">Visualizza documento collaudo</a></p>
            <p>Cordiali saluti,<br>Walter Cozza Serramenti</p>
          `,
        }),
      })
    }

    // 5. Aggiorna firma come inviata
    await supabase
      .from('firma_collaudo')
      .update({ inviato_cliente: true, inviato_at: new Date().toISOString(), pdf_url: publicUrl })
      .eq('id', firma_id)

    return new Response(JSON.stringify({ ok: true, pdf_url: publicUrl }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
