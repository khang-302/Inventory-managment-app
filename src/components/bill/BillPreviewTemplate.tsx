import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

const BillPreviewTemplate = forwardRef<HTMLDivElement, BillPreviewTemplateProps>(
  ({ settings, bill, items }, ref) => {
    const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
    const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
    const showTerms = bill.showTerms ?? settings.showTerms;
    const terms = bill.termsConditions ?? settings.termsConditions;
    const contactLine = [settings.phone1, settings.phone2].filter(Boolean).join(' | ');
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
        }}
      >
        {/* ── HEADER BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: '0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold accent bar top */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #DAA520, #F4C430, #DAA520)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px' }}>
            {/* Left: Logo + Shop Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {settings.logoPath ? (
                <img
                  src={settings.logoPath}
                  alt="Logo"
                  style={{ height: '70px', width: '70px', objectFit: 'contain', borderRadius: '50%', border: '2px solid #DAA520', background: '#fff', padding: '2px' }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{
                  height: '70px', width: '70px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #DAA520, #F4C430)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a',
                  border: '2px solid #F4C430',
                }}>
                  {initials}
                </div>
              )}
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F4C430', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {settings.shopName}
                </div>
                {settings.tagline && (
                  <div style={{ fontSize: '11px', color: '#ccc', marginTop: '2px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    {settings.tagline}
                  </div>
                )}
              </div>
            </div>

            {/* Right: INVOICE label */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F4C430', letterSpacing: '4px' }}>
                INVOICE
              </div>
            </div>
          </div>

          {/* Gold accent bar bottom */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #DAA520, #F4C430, #DAA520)' }} />
        </div>

        {/* ── CONTENT AREA ── */}
        <div style={{ flex: 1, padding: '0 40px', display: 'flex', flexDirection: 'column' }}>

          {/* Shop Contact Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e0e0e0', fontSize: '11px', color: '#666' }}>
            <div>
              <span style={{ marginRight: '16px' }}>📍 {settings.address}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>{contactLine}</span>
            </div>
          </div>

          {/* Invoice From / To Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '24px' }}>
            {/* Invoice From */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Invoice From
              </div>
              <div style={{ background: '#f8f8f8', border: '1px solid #e5e5e5', borderTop: '3px solid #DAA520', padding: '12px 16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a' }}>{settings.shopName}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{settings.address}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px', fontWeight: 600 }}>{contactLine}</div>
              </div>
            </div>

            {/* Invoice To */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Invoice To
              </div>
              <div style={{ background: '#f8f8f8', border: '1px solid #e5e5e5', borderTop: '3px solid #DAA520', padding: '12px 16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a' }}>{bill.buyerName}</div>
                {bill.buyerPhone && <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Phone: {bill.buyerPhone}</div>}
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px', marginTop: '16px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#999' }}>Invoice No: </span>
              <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{bill.billNumber}</span>
            </div>
            <div>
              <span style={{ color: '#999' }}>Date: </span>
              <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{new Date(bill.date).toLocaleDateString('en-PK')}</span>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '20px' }}>
            <thead>
              <tr style={{ background: '#1a1a1a' }}>
                <th style={{ ...thStyle, width: '40px' }}>#</th>
                <th style={{ ...thStyle, textAlign: 'left', width: '28%' }}>Part Name</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Brand</th>
                <th style={{ ...thStyle, width: '50px' }}>Qty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Price (Rs)</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafafa', borderBottom: '1px solid #eee' }}>
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
          <div style={{ marginTop: '8px', borderTop: '2px solid #1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0', fontSize: '13px' }}>
              <span style={{ width: '130px', textAlign: 'right', color: '#666' }}>Subtotal:</span>
              <span style={{ width: '130px', textAlign: 'right', fontWeight: 500 }}>Rs {bill.subtotal.toLocaleString()}</span>
            </div>
            {bill.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 0', fontSize: '13px' }}>
                <span style={{ width: '130px', textAlign: 'right', color: '#666' }}>Discount:</span>
                <span style={{ width: '130px', textAlign: 'right', fontWeight: 500 }}>Rs {bill.discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'linear-gradient(135deg, #DAA520, #F4C430)',
                padding: '10px 24px', fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a',
              }}>
                <span style={{ marginRight: '24px' }}>GRAND TOTAL:</span>
                <span>Rs {bill.finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── TERMS & PAYMENT ── */}
          {(showTerms || showPayment) && (
            <div style={{ display: 'flex', gap: '24px', marginTop: '28px', fontSize: '11px' }}>
              {showTerms && terms && terms.length > 0 && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#DAA520', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '2px solid #DAA520', paddingBottom: '4px' }}>
                    Terms & Conditions
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#555', lineHeight: '1.9' }}>
                    {terms.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
              {showPayment && paymentInfo && (
                <div style={{ flex: 1, border: '1px solid #DAA520', padding: '14px 18px', background: '#FFFDF5' }}>
                  <div style={{ fontWeight: 'bold', color: '#DAA520', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #DAA520', paddingBottom: '4px' }}>
                    Payment Information
                  </div>
                  <div style={{ color: '#555', lineHeight: '2' }}>
                    {paymentInfo.bankName && <div>• Bank: {paymentInfo.bankName}</div>}
                    {paymentInfo.accountTitle && <div>• Account: {paymentInfo.accountTitle}</div>}
                    {paymentInfo.accountNumber && <div>• Acc No: {paymentInfo.accountNumber}</div>}
                    {paymentInfo.iban && <div>• IBAN: {paymentInfo.iban}</div>}
                    {paymentInfo.easypaisaNumber && <div>• EasyPaisa: {paymentInfo.easypaisaNumber}</div>}
                    {paymentInfo.jazzcashNumber && <div>• JazzCash: {paymentInfo.jazzcashNumber}</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {bill.notes && (
            <div style={{ marginTop: '20px', fontSize: '11px', color: '#777', fontStyle: 'italic', padding: '8px 0', borderTop: '1px dashed #ddd' }}>
              Notes: {bill.notes}
            </div>
          )}

          {/* Footer message */}
          {settings.footerMessage && (
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#888', padding: '12px 0' }}>
              {settings.footerMessage}
            </div>
          )}

          <div style={{ flex: 1 }} />
        </div>

        {/* ── BOTTOM FOOTER BAR ── */}
        <div style={{
          background: '#1a1a1a', padding: '14px 40px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px',
          fontSize: '11px', color: '#ccc', marginTop: '16px',
        }}>
          {settings.phone1 && <span>📞 {settings.phone1}</span>}
          {settings.phone2 && <span>📱 {settings.phone2}</span>}
          {settings.address && <span style={{ maxWidth: '300px', textAlign: 'center' }}>📍 {settings.address.split(',').slice(0, 2).join(',')}</span>}
        </div>
      </div>
    );
  }
);

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '11px',
  color: '#F4C430',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '9px 8px',
  textAlign: 'center',
};

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
