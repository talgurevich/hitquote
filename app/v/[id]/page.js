'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function Page() {
  return (
    <Suspense fallback={<main dir="rtl" style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>טוען…</main>}>
      <PublicQuoteView />
    </Suspense>
  );
}

function PublicQuoteView() {
  const params = useParams();
  const id = params?.id?.toString();

  const [settings, setSettings] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        const [{ data: st }, { data: p }, { data: it }] = await Promise.all([
          supabase.from('settings').select('*').limit(1).maybeSingle(),
          supabase.from('proposal')
            .select('id, proposal_number, created_at, subtotal, discount_value, discount_note, vat_rate, vat_amount, total, payment_terms, notes, include_discount_row, customer:customer_id(name, phone, email, address)')
            .eq('id', id)
            .maybeSingle(),
          supabase.from('proposal_item')
            .select('id, custom_name, product_name, qty, unit_price, line_total, notes, product:product_id(name)')
            .eq('proposal_id', id)
            .order('created_at', { ascending: true })
        ]);

        const defaultSettings = {
          business_name: 'אל יזמות ופיתוח',
          reg_number: '312333263',
          email: 'Moran.marmus@gmail.com',
          phone: '050-8386698',
          address: 'ברכה צפירה 3, עכו',
          vat_rate: 18,
          logo_url: null,
        };

        if (!p) {
          setError('הצעה לא נמצאה');
          return;
        }

        setSettings(st ?? defaultSettings);
        setProposal(p);
        setItems(it || []);
      } catch (e) {
        setError(e.message || String(e));
      }
    };
    load();
  }, [id]);

  if (error) return <main dir="rtl" style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>שגיאה: {error}</main>;
  if (!id || !proposal || !settings) return <main dir="rtl" style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>טוען…</main>;

  const fmt = (n) => Number(n || 0).toFixed(2);

  return (
    <main dir="rtl" style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui, Arial', background: '#fff' }}>
      {/* כותרת */}
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: 12, marginBottom: 16 }}>
        {settings.logo_url && <img src={settings.logo_url} alt="לוגו" style={{ height: 64, objectFit: 'contain' }} />}
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{settings.business_name}</div>
          <div style={{ color: '#666' }}>
            {settings.reg_number ? <>מ.ע. {settings.reg_number} · </> : null}
            {settings.phone ? <>טל׳ {settings.phone} · </> : null}
            {settings.email || ''}
          </div>
          {settings.address ? <div style={{ color: '#666' }}>{settings.address}</div> : null}
        </div>
      </header>

      {/* לכבוד */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700 }}>לכבוד:</div>
        <div>{proposal.customer?.name || ''}</div>
        {!!proposal.customer?.phone && <div>{proposal.customer.phone}</div>}
        {!!proposal.customer?.email && <div>{proposal.customer.email}</div>}
        {!!proposal.customer?.address && <div>{proposal.customer.address}</div>}
        <div style={{ color: '#666', marginTop: 6 }}>תאריך: {new Date(proposal.created_at).toLocaleDateString('he-IL')}</div>
        <div style={{ color: '#666' }}>מס׳ הצעה: {proposal.proposal_number || proposal.id.slice(0,8)}</div>
      </section>

      {/* טבלה */}
      <section>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'right', borderBottom: '1px solid ' + '#ddd', padding: 8 }}>פריט</th>
              <th style={{ textAlign: 'center', borderBottom: '1px solid ' + '#ddd', padding: 8 }}>כמות</th>
              <th style={{ textAlign: 'center', borderBottom: '1px solid ' + '#ddd', padding: 8 }}>מחיר יח׳ (₪)</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid ' + '#ddd', padding: 8 }}>סה״כ (₪)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8 }}>
                  <div style={{ fontWeight: 700 }}>
                    {r.custom_name || r.product_name || r.product?.name || ''}
                  </div>
                  {r.notes ? <div style={{ color: '#666', fontSize: 12 }}>{r.notes}</div> : null}
                </td>
                <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8, textAlign: 'center' }}>{r.qty}</td>
                <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8, textAlign: 'center' }}>{fmt(r.unit_price)}</td>
                <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8, textAlign: 'left', fontWeight: 700 }}>{fmt(r.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* סיכומים */}
      <section style={{ display: 'grid', gap: 6, justifyContent: 'end', marginTop: 12 }}>
        <div style={{ textAlign: 'left' }}>ביניים (לפני מע״מ): <b>{fmt(proposal.subtotal)} ₪</b></div>
        {proposal.include_discount_row && Number(proposal.discount_value) > 0 && (
          <div style={{ textAlign: 'left' }}>
            הנחה{proposal.discount_note ? ` (${proposal.discount_note})` : ''}: <b>-{fmt(proposal.discount_value)} ₪</b>
          </div>
        )}
        <div style={{ textAlign: 'left' }}>מע״מ ({fmt(proposal.vat_rate)}%): <b>{fmt(proposal.vat_amount)} ₪</b></div>
        <div style={{ textAlign: 'left', fontSize: 18 }}>סה״כ לתשלום: <b>{fmt(proposal.total)} ₪</b></div>
      </section>

      {/* פוטר מודפס */}
      <div id="print-footer" style={{ marginTop: 24, color: '#666', textAlign: 'center' }}>
        הודפס ב־{new Date().toLocaleDateString('he-IL')} בשעה {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          main { padding: 0; }
          header { border-bottom: 1px solid #000 !important; }
          table th, table td { border-color: #999 !important; }
          #print-footer {
            position: fixed;
            bottom: 8mm;
            left: 12mm;
            right: 12mm;
            text-align: center;
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}