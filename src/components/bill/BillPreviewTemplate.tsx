import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

/* ── Premium Color Palette ── */
const TEAL = '#1B4D4D';
const GOLD = '#C9A020';
const RED_ICON = '#CC3333';
const WHITE = '#FFFFFF';
const CHARCOAL = '#2B2B2B';
const LIGHT_GRAY = '#F0F0F0';
const MED_GRAY = '#888888';
const BODY_TEXT = '#555555';

/* ── SVG Icons (inline, no icon fonts) ── */
const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

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
        {/* ═══ HEADER — Dark Teal ═══ */}
        <div style={{
          background: TEAL,
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          {/* Logo Circle */}
          <div style={{
            width: '78px', height: '78px', borderRadius: '50%',
            border: `3px solid ${GOLD}`,
            boxShadow: `0 0 0 3px ${TEAL}, 0 0 0 5px ${GOLD}50`,
            background: WHITE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {settings.logoPath ? (
              <img
                src={settings.logoPath}
                alt="Logo"
                style={{
                  width: '100%', height: '100%', objectFit: 'contain',
                  borderRadius: '50%',
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: `linear-gradient(135deg, ${GOLD}, ${TEAL})`,
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
              fontSize: '30px', fontWeight: 800, color: WHITE,
              lineHeight: '1.15', letterSpacing: '0.5px',
            }}>
              {settings.shopName}
            </div>
            {settings.tagline && (
              <div style={{
                fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.75)',
                marginTop: '4px', letterSpacing: '0.5px',
              }}>
                {settings.tagline}
              </div>
            )}
          </div>
        </div>

        {/* ═══ Gold Accent Bar ═══ */}
        <div style={{ height: '5px', background: GOLD }} />

        {/* ═══ "Invoice From" line ═══ */}
        <div style={{
          padding: '10px 36px',
          background: WHITE,
          borderBottom: `1px solid ${LIGHT_GRAY}`,
        }}>
          <p style={{ fontSize: '13px', fontWeight: 400, color: MED_GRAY, margin: 0 }}>
            Invoice From : <strong style={{ fontWeight: 700, color: CHARCOAL }}>{settings.shopName.toUpperCase()}</strong>
          </p>
        </div>

        {/* ═══ INVOICE BODY ═══ */}
        <div style={{ padding: '20px 36px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── Invoice To Block ── */}
          <div style={{
            border: `1px solid #D0D0D0`,
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <div style={{
              backgroundColor: TEAL,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: WHITE }}>Invoice To :</span>
              <span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
            <thead>
              <tr style={{ background: TEAL }}>
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
                <tr key={item.id} style={{ borderBottom: `1px solid #E0E0E0`, background: i % 2 === 0 ? WHITE : LIGHT_GRAY }}>
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

          {/* ── Grand Total Bar ── */}
          <div style={{ display: 'flex', width: '100%', marginBottom: '6px' }}>
            <div style={{
              flex: 1, background: GOLD, padding: '10px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: WHITE, textTransform: 'uppercase' }}>Grand Total</span>
              {bill.discount > 0 && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                  (Subtotal: Rs {bill.subtotal.toLocaleString()} | Discount: Rs {bill.discount.toLocaleString()})
                </span>
              )}
            </div>
            <div style={{
              background: TEAL, padding: '10px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '180px',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: WHITE }}>
                Rs {bill.finalTotal.toLocaleString()}
              </span>
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
                  fontSize: '13px', fontWeight: 800, color: TEAL,
                  marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                  borderBottom: `2px solid ${GOLD}`, paddingBottom: '4px', display: 'inline-block',
                }}>
                  Terms & Conditions
                </div>
                <ul style={{ listStyle: 'disc', paddingLeft: '16px', margin: 0 }}>
                  {terms.map((t, i) => (
                    <li key={i} style={{ fontSize: '11.5px', color: BODY_TEXT, lineHeight: '1.8', fontWeight: 400 }}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {showPayment && paymentInfo && (
              <div style={{
                flex: 1, border: `1.5px dashed ${GOLD}`,
                borderRadius: '6px', padding: '12px 16px', background: '#FFFDF5',
              }}>
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: TEAL,
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

        {/* ═══ FOOTER — Dark Teal with icon circles ═══ */}
        <div style={{
          backgroundColor: TEAL,
          padding: '20px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          {/* Location */}
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', background: RED_ICON,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocationIcon />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', maxWidth: '180px' }}>
              {settings.address || 'Shop Address'}
            </div>
          </div>

          <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch', margin: '0 8px' }} />

          {/* Phone */}
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', background: RED_ICON,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PhoneIcon />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5' }}>
              {settings.phone1 && <div>{settings.phone1}</div>}
              {settings.phone2 && <div>{settings.phone2}</div>}
              {!settings.phone1 && !settings.phone2 && 'Contact'}
            </div>
          </div>

          <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch', margin: '0 8px' }} />

          {/* Social */}
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', background: RED_ICON,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GlobeIcon />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5' }}>
              {settings.socialMedia || settings.website || 'Website Coming Soon'}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const thStyle: React.CSSProperties = {
  color: WHITE,
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
