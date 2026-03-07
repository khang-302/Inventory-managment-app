import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

const TEAL = '#0d6e6e';
const TEAL_DARK = '#0a5a5a';
const GOLD = '#d4a017';
const GOLD_LIGHT = '#e8b923';
const RED_ACCENT = '#c0392b';

const BillPreviewTemplate = forwardRef<HTMLDivElement, BillPreviewTemplateProps>(
  ({ settings, bill, items }, ref) => {
    const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
    const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
    const showTerms = bill.showTerms ?? settings.showTerms;
    const terms = bill.termsConditions ?? settings.termsConditions;
    const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
      <div
        ref={ref}
        id="bill-capture-root"
        style={{
          width: '794px',
          minHeight: '1123px',
          background: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '13px',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER ── Dark teal banner */}
        <div style={{ background: TEAL, padding: '28px 40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {settings.logoPath ? (
            <img
              src={settings.logoPath}
              alt="Logo"
              style={{ height: '80px', width: '80px', objectFit: 'contain', borderRadius: '50%', border: `3px solid ${GOLD}`, background: '#fff', padding: '2px' }}
              crossOrigin="anonymous"
            />
          ) : (
            <div style={{
              height: '80px', width: '80px', borderRadius: '50%',
              background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 'bold', color: '#fff',
              border: `3px solid ${GOLD_LIGHT}`,
            }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '1px' }}>
              {settings.shopName}
            </div>
            {settings.tagline && (
              <div style={{ fontSize: '14px', color: '#d0e8e8', marginTop: '4px' }}>
                {settings.tagline}
              </div>
            )}
          </div>
          {/* Contact info in header */}
          <div style={{ textAlign: 'right', color: '#d0e8e8', fontSize: '11px', lineHeight: '1.8' }}>
            {settings.phone1 && <div>📞 {settings.phone1}</div>}
            {settings.address && <div>📍 {settings.address}</div>}
            {settings.footerMessage && <div style={{ color: GOLD_LIGHT, marginTop: '4px', fontStyle: 'italic', fontSize: '10px' }}>{settings.footerMessage}</div>}
          </div>
        </div>

        {/* Gold separator */}
        <div style={{ height: '6px', background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />

        {/* Invoice From strip */}
        <div style={{ background: '#f5f5f0', padding: '10px 40px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#555' }}>Invoice From : </span>
            <span style={{ fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase' }}>{settings.shopName}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {settings.ownerName && <span>Owner: {settings.ownerName}</span>}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, padding: '0 40px', display: 'flex', flexDirection: 'column' }}>

          {/* Buyer + Invoice Info */}
          <div style={{ display: 'flex', marginTop: '20px', gap: '0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ background: TEAL, color: '#fff', padding: '8px 16px', fontWeight: 'bold', fontSize: '13px' }}>
                Invoice To :
              </div>
              <div style={{ border: '1px solid #ddd', borderTop: `3px solid ${GOLD}`, padding: '14px 16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>{bill.buyerName}</div>
                {bill.buyerPhone && <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Phone: {bill.buyerPhone}</div>}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, background: TEAL, color: '#fff', padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', textAlign: 'right' }}>
                  Invoice No : <span style={{ color: GOLD_LIGHT, fontWeight: 'bold' }}>{bill.billNumber}</span>
                </div>
              </div>
              <div style={{ border: '1px solid #ddd', borderTop: `3px solid ${GOLD}`, borderLeft: 'none', padding: '14px 16px', textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  Date : {new Date(bill.date).toLocaleDateString('en-PK')}
                </div>
                {bill.notes && <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', fontStyle: 'italic' }}>Notes: {bill.notes}</div>}
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '24px' }}>
            <thead>
              <tr style={{ background: TEAL }}>
                <th style={{ ...thStyle, width: '36px' }}>#</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Part Name</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Brand</th>
                <th style={{ ...thStyle, width: '50px' }}>QTY</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Price (RS)</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total (RS)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e8e8e8', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{item.partName}</td>
                  <td style={tdStyle}>{item.partCode || '-'}</td>
                  <td style={tdStyle}>{item.brand || '-'}</td>
                  <td style={tdStyle}>{item.quantity}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{item.price.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── TOTALS ── */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', width: '160px', textAlign: 'right' }}>Subtotal :</div>
              <div style={{ padding: '8px 16px', fontSize: '13px', width: '140px', textAlign: 'right' }}>Rs {bill.subtotal.toLocaleString()}</div>
            </div>
            {bill.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', width: '160px', textAlign: 'right' }}>Discount :</div>
                <div style={{ padding: '8px 16px', fontSize: '13px', width: '140px', textAlign: 'right', color: RED_ACCENT }}>- {bill.discount.toLocaleString()}</div>
              </div>
            )}
            {/* Grand Total bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <div style={{ display: 'flex', overflow: 'hidden', borderRadius: '4px' }}>
                <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, padding: '14px 24px', fontWeight: 'bold', fontSize: '16px', color: '#1a1a1a', display: 'flex', alignItems: 'center', letterSpacing: '0.5px' }}>
                  GRAND TOTAL :
                </div>
                <div style={{ background: TEAL, padding: '14px 28px', fontWeight: 'bold', fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                  Rs {bill.finalTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* ── TERMS & PAYMENT ── */}
          {(showTerms || showPayment) && (
            <div style={{ display: 'flex', gap: '24px', marginTop: '36px', fontSize: '12px' }}>
              {showTerms && terms && terms.length > 0 && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: TEAL, fontSize: '14px', marginBottom: '10px', textTransform: 'uppercase', borderBottom: `2px solid ${GOLD}`, paddingBottom: '6px' }}>
                    Terms & Conditions
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#444', lineHeight: '2' }}>
                    {terms.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
              {showPayment && paymentInfo && (
                <div style={{ flex: 1, border: `2px solid ${TEAL}`, borderRadius: '6px', padding: '16px 20px' }}>
                  <div style={{ fontWeight: 'bold', color: TEAL, fontSize: '14px', marginBottom: '10px', textTransform: 'uppercase', borderBottom: `2px solid ${GOLD}`, paddingBottom: '6px' }}>
                    Payment Information
                  </div>
                  <div style={{ color: '#444', lineHeight: '2' }}>
                    {paymentInfo.bankName && <div>• Bank Name: {paymentInfo.bankName}</div>}
                    {paymentInfo.accountTitle && <div>• Account Name: {paymentInfo.accountTitle}</div>}
                    {paymentInfo.accountNumber && <div>• Account No: {paymentInfo.accountNumber}</div>}
                    {paymentInfo.iban && <div>• IBAN: {paymentInfo.iban}</div>}
                    {paymentInfo.easypaisaNumber && <div>• EasyPaisa: {paymentInfo.easypaisaNumber}</div>}
                    {paymentInfo.jazzcashNumber && <div>• JazzCash: {paymentInfo.jazzcashNumber}</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1 }} />
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: '20px' }}>
          {/* Icon strip */}
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, background: RED_ACCENT, padding: '10px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
            </div>
            <div style={{ flex: 1, background: TEAL, padding: '10px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>📞</span>
            </div>
            <div style={{ flex: 1, background: RED_ACCENT, padding: '10px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>🌐</span>
            </div>
          </div>
          {/* Footer info */}
          <div style={{ background: TEAL_DARK, display: 'flex', padding: '16px 40px' }}>
            <div style={{ flex: 1, textAlign: 'center', color: '#d0e8e8', fontSize: '11px', lineHeight: '1.6' }}>
              {settings.address || 'Shop Address'}
            </div>
            <div style={{ flex: 1, textAlign: 'center', color: '#d0e8e8', fontSize: '11px', lineHeight: '1.6' }}>
              {settings.phone1 && <div>{settings.phone1}</div>}
              {settings.phone2 && <div>{settings.phone2}</div>}
            </div>
            <div style={{ flex: 1, textAlign: 'center', color: '#d0e8e8', fontSize: '11px', lineHeight: '1.6' }}>
              {settings.socialMedia || settings.website || 'Social Media'}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const thStyle: React.CSSProperties = {
  padding: '10px 10px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '12px',
  color: '#ffffff',
  letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  textAlign: 'center',
};

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
