import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

/* ── Premium Color Palette ── */
const GOLD = '#C5A22E';
const DARK_OLIVE = '#3D3D1B';
const CHARCOAL = '#2B2B2B';
const MED_GRAY = '#888888';
const LIGHT_GRAY = '#E0E0E0';
const FOOTER_BG = '#F5F5F5';
const FOOTER_TEXT = '#999999';
const WHITE = '#FFFFFF';
const WARM_BG = '#FAFAF7';
const ACCENT_BG = '#FBF9F3';

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
          background: WHITE,
          color: CHARCOAL,
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
          fontSize: '14px',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* ═══ HEADER — White background ═══ */}
        <div style={{
          background: WHITE,
          padding: '28px 36px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          borderBottom: `2px solid ${LIGHT_GRAY}`,
        }}>
          {/* Logo Circle */}
          <div style={{
            width: '82px', height: '82px', borderRadius: '50%',
            border: `3px solid ${GOLD}`,
            boxShadow: `0 0 0 2px ${WHITE}, 0 0 0 4px ${GOLD}30`,
            background: WHITE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {settings.logoPath ? (
              <img
                src={settings.logoPath}
                alt="Logo"
                style={{
                  width: '70px', height: '70px', objectFit: 'cover',
                  borderRadius: '50%',
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${GOLD}, ${DARK_OLIVE})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: WHITE, letterSpacing: '1px' }}>
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Shop Name + Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontSize: '32px', fontWeight: 800, color: DARK_OLIVE,
              lineHeight: '1.15', letterSpacing: '0.3px',
            }}>
              {settings.shopName}
            </div>
            {settings.tagline && (
              <div style={{
                fontSize: '14px', fontWeight: 400, color: MED_GRAY,
                marginTop: '4px', letterSpacing: '0.3px',
              }}>
                {settings.tagline}
              </div>
            )}
          </div>
        </div>

        {/* ═══ "Invoice From" line ═══ */}
        <div style={{
          padding: '10px 36px',
          background: WARM_BG,
          borderBottom: `1px solid ${LIGHT_GRAY}`,
        }}>
          <p style={{ fontSize: '13px', fontWeight: 400, color: MED_GRAY, margin: 0 }}>
            Invoice From : <strong style={{ fontWeight: 700, color: DARK_OLIVE }}>{settings.shopName.toUpperCase()}</strong>
          </p>
        </div>

        {/* ═══ INVOICE BODY ═══ */}
        <div style={{ padding: '20px 36px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── Invoice To Block ── */}
          <div style={{
            border: `1px solid ${LIGHT_GRAY}`,
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <div style={{
              backgroundColor: WARM_BG,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              borderBottom: `1px solid ${LIGHT_GRAY}`,
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: DARK_OLIVE }}>Invoice To :</span>
              <span style={{ fontSize: '12px', fontWeight: 400, color: MED_GRAY }}>
                Invoice No : <strong style={{ fontWeight: 700, color: GOLD }}>{bill.billNumber}</strong>
              </span>
            </div>
            <div style={{
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: WHITE,
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: CHARCOAL, marginBottom: '2px' }}>
                  {bill.buyerName.toUpperCase()}
                </div>
                {bill.buyerPhone && (
                  <div style={{ fontSize: '12px', fontWeight: 400, color: MED_GRAY }}>
                    Phone: {bill.buyerPhone}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 400, color: MED_GRAY, textAlign: 'right' }}>
                Date : {new Date(bill.date).toLocaleDateString('en-PK')}
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${LIGHT_GRAY}` }}>
                <th style={{ ...thStyle, width: '40px' }}>#</th>
                <th style={{ ...thStyle, width: '160px', textAlign: 'left' }}>Part Name</th>
                <th style={{ ...thStyle, width: '100px' }}>Code</th>
                <th style={{ ...thStyle, width: '100px' }}>Brand</th>
                <th style={{ ...thStyle, width: '55px' }}>QTY</th>
                <th style={{ ...thStyle, width: '100px' }}>Price (RS)</th>
                <th style={{ ...thStyle, width: '100px' }}>Total (RS)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${LIGHT_GRAY}`, background: i % 2 === 0 ? WHITE : ACCENT_BG }}>
                  <td style={{ ...tdStyle, color: MED_GRAY }}>{i + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: CHARCOAL }}>{item.partName}</td>
                  <td style={tdStyle}>{item.partCode || '-'}</td>
                  <td style={tdStyle}>{item.brand || '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.quantity}</td>
                  <td style={tdStyle}>{item.price.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: CHARCOAL }}>{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── TOTALS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '10px 0', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: MED_GRAY, minWidth: '90px', textAlign: 'right' }}>Subtotal :</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: CHARCOAL, minWidth: '90px', textAlign: 'right' }}>Rs {bill.subtotal.toLocaleString()}</span>
            </div>
            {bill.discount > 0 && (
              <>
                <div style={{ width: '220px', height: '1px', background: LIGHT_GRAY }} />
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: MED_GRAY, minWidth: '90px', textAlign: 'right' }}>Discount :</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: CHARCOAL, minWidth: '90px', textAlign: 'right' }}>- Rs {bill.discount.toLocaleString()}</span>
                </div>
              </>
            )}
            <div style={{ width: '220px', height: '2px', background: GOLD, marginTop: '4px' }} />
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: DARK_OLIVE, minWidth: '90px', textAlign: 'right' }}>GRAND TOTAL :</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: DARK_OLIVE, minWidth: '90px', textAlign: 'right' }}>Rs {bill.finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />
        </div>

        {/* ═══ TERMS & PAYMENT ═══ */}
        {(showTerms || showPayment) && (
          <div style={{ display: 'flex', gap: '24px', padding: '16px 36px 20px' }}>
            {showTerms && terms && terms.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: DARK_OLIVE,
                  marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                  borderBottom: `2px solid ${GOLD}`, paddingBottom: '4px', display: 'inline-block',
                }}>
                  Terms & Conditions
                </div>
                <ul style={{ listStyle: 'disc', paddingLeft: '16px', margin: 0 }}>
                  {terms.map((t, i) => (
                    <li key={i} style={{ fontSize: '11.5px', color: MED_GRAY, lineHeight: '1.8', fontWeight: 400 }}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {showPayment && paymentInfo && (
              <div style={{
                flex: 1, border: `1.5px dashed ${GOLD}`,
                borderRadius: '6px', padding: '12px 16px', background: ACCENT_BG,
              }}>
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: DARK_OLIVE,
                  marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                }}>
                  Payment Information
                </div>
                <ul style={{ listStyle: 'disc', paddingLeft: '16px', margin: 0 }}>
                  {paymentInfo.bankName && <li style={paymentLiStyle}>Bank Name: {paymentInfo.bankName}</li>}
                  {paymentInfo.accountTitle && <li style={paymentLiStyle}>Account Name: {paymentInfo.accountTitle}</li>}
                  {paymentInfo.accountNumber && <li style={paymentLiStyle}>Account No: {paymentInfo.accountNumber}</li>}
                  {paymentInfo.iban && <li style={paymentLiStyle}>IBAN: {paymentInfo.iban}</li>}
                  {paymentInfo.easypaisaNumber && <li style={paymentLiStyle}>EasyPaisa: {paymentInfo.easypaisaNumber}</li>}
                  {paymentInfo.jazzcashNumber && <li style={paymentLiStyle}>JazzCash: {paymentInfo.jazzcashNumber}</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ═══ FOOTER — Light gray ═══ */}
        <div style={{
          backgroundColor: FOOTER_BG,
          padding: '18px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderTop: `1px solid ${LIGHT_GRAY}`,
        }}>
          {/* Location */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: DARK_OLIVE, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Address</div>
            <div style={{ fontSize: '11px', color: FOOTER_TEXT, lineHeight: '1.6' }}>
              {settings.address || 'Shop Address'}
            </div>
          </div>

          <div style={{ width: '1px', background: LIGHT_GRAY, alignSelf: 'stretch', margin: '0 12px' }} />

          {/* Phone */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: DARK_OLIVE, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Contact</div>
            <div style={{ fontSize: '11px', color: FOOTER_TEXT, lineHeight: '1.6' }}>
              {settings.phone1 && <div>{settings.phone1}</div>}
              {settings.phone2 && <div>{settings.phone2}</div>}
              {!settings.phone1 && !settings.phone2 && 'Contact'}
            </div>
          </div>

          <div style={{ width: '1px', background: LIGHT_GRAY, alignSelf: 'stretch', margin: '0 12px' }} />

          {/* Social */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: DARK_OLIVE, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Social</div>
            <div style={{ fontSize: '11px', color: FOOTER_TEXT, lineHeight: '1.6' }}>
              {settings.socialMedia || settings.website || 'Website Coming Soon'}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const thStyle: React.CSSProperties = {
  color: '#888888',
  fontSize: '12px',
  fontWeight: 700,
  padding: '10px 10px',
  textAlign: 'center',
  border: 'none',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  fontSize: '12.5px',
  color: '#555555',
  textAlign: 'center',
  verticalAlign: 'middle',
};

const paymentLiStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#555555',
  lineHeight: '1.8',
  fontWeight: 400,
};

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
