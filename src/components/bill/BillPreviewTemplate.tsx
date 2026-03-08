import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

/* ── Color palette: Yellow / Orange / Gray / Black / White ── */
const ORANGE = '#E8820C';
const YELLOW = '#F5A623';
const DARK = '#1a1a1a';
const DARK_GRAY = '#333333';
const MED_GRAY = '#555555';
const LIGHT_GRAY = '#e5e5e5';
const BORDER = '#cccccc';
const WHITE = '#ffffff';
const ACCENT_BG = '#FFF8ED'; // warm white for sections

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.59.57 1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6.5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.59 1 1 0 01-.25 1.01l-2.2 2.19z" fill="#fff"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#fff"/>
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
          color: DARK,
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
          fontSize: '14px',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}
      >
        {/* ═══ HEADER ═══ */}
        <div style={{
          background: `linear-gradient(135deg, ${DARK} 0%, #2a2a2a 100%)`,
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '22px',
        }}>
          {/* Logo Circle */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            border: `3px solid ${YELLOW}`,
            background: WHITE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {settings.logoPath ? (
              <img
                src={settings.logoPath}
                alt="Logo"
                style={{
                  width: '76px', height: '76px', objectFit: 'cover',
                  borderRadius: '50%',
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: ORANGE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: WHITE, letterSpacing: '1px' }}>
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Shop Name + Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontSize: '36px', fontWeight: 800, color: WHITE,
              lineHeight: '1.15', letterSpacing: '0.5px',
            }}>
              {settings.shopName}
            </div>
            {settings.tagline && (
              <div style={{
                fontSize: '16px', fontWeight: 400, color: YELLOW,
                marginTop: '4px', letterSpacing: '0.5px',
              }}>
                {settings.tagline}
              </div>
            )}
          </div>
        </div>

        {/* ═══ ORANGE "INVOICE FROM" BANNER ═══ */}
        <div style={{
          backgroundColor: ORANGE,
          padding: '9px 32px',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: WHITE, margin: 0 }}>
            Invoice From : <strong style={{ fontWeight: 800 }}>{settings.shopName.toUpperCase()}</strong>
          </p>
        </div>

        {/* ═══ INVOICE BODY ═══ */}
        <div style={{ padding: '18px 32px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── Invoice To Block ── */}
          <div style={{
            border: `1.5px solid ${BORDER}`,
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}>
            <div style={{
              backgroundColor: DARK,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
            }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: WHITE }}>Invoice To :</span>
              <span style={{ fontSize: '14px', fontWeight: 400, color: '#ccc' }}>
                Invoice No : <strong style={{ fontWeight: 700, color: YELLOW }}>{bill.billNumber}</strong>
              </span>
            </div>
            <div style={{
              padding: '12px 16px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: ACCENT_BG,
            }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: DARK, marginBottom: '3px' }}>
                  {bill.buyerName.toUpperCase()}
                </div>
                {bill.buyerPhone && (
                  <div style={{ fontSize: '13px', fontWeight: 400, color: MED_GRAY }}>
                    Phone: {bill.buyerPhone}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 400, color: MED_GRAY, textAlign: 'right' }}>
                Date : {new Date(bill.date).toLocaleDateString('en-PK')}
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
            <thead>
              <tr style={{ backgroundColor: DARK }}>
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
                <tr key={item.id} style={{ borderBottom: `1px solid ${LIGHT_GRAY}`, background: i % 2 === 0 ? WHITE : '#FAFAFA' }}>
                  <td style={{ ...tdStyle, color: MED_GRAY }}>{i + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>{item.partName}</td>
                  <td style={tdStyle}>{item.partCode || '-'}</td>
                  <td style={tdStyle}>{item.brand || '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.quantity}</td>
                  <td style={tdStyle}>{item.price.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── TOTALS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '8px 4px 0', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: MED_GRAY, minWidth: '100px', textAlign: 'right' }}>Subtotal :</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: DARK, minWidth: '90px', textAlign: 'right' }}>Rs {bill.subtotal.toLocaleString()}</span>
            </div>
            <div style={{ width: '240px', height: '1px', background: BORDER }} />
            {bill.discount > 0 && (
              <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: MED_GRAY, minWidth: '100px', textAlign: 'right' }}>Discount :</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: DARK, minWidth: '90px', textAlign: 'right' }}>{bill.discount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── GRAND TOTAL BAR ── */}
          <div style={{
            display: 'flex', marginTop: '12px', width: '100%',
            borderRadius: '4px', overflow: 'hidden',
          }}>
            <div style={{ backgroundColor: YELLOW, flex: 1, minHeight: '52px' }} />
            <div style={{
              backgroundColor: DARK,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0 24px', minWidth: '340px', gap: '20px',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: YELLOW, letterSpacing: '0.5px' }}>GRAND TOTAL :</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: WHITE, letterSpacing: '0.5px' }}>Rs {bill.finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />
        </div>

        {/* ═══ TERMS & PAYMENT ═══ */}
        {(showTerms || showPayment) && (
          <div style={{ display: 'flex', gap: '24px', padding: '20px 32px 18px' }}>
            {showTerms && terms && terms.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px', fontWeight: 800, color: DARK,
                  marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: `2px solid ${ORANGE}`, paddingBottom: '6px', display: 'inline-block',
                }}>
                  Terms & Conditions
                </div>
                <ul style={{ listStyle: 'disc', paddingLeft: '18px', margin: 0 }}>
                  {terms.map((t, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: DARK_GRAY, lineHeight: '1.8', fontWeight: 400 }}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {showPayment && paymentInfo && (
              <div style={{
                flex: 1, border: `2px dashed ${ORANGE}`,
                borderRadius: '8px', padding: '14px 18px', background: ACCENT_BG,
              }}>
                <div style={{
                  fontSize: '15px', fontWeight: 800, color: DARK,
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Payment Information
                </div>
                <ul style={{ listStyle: 'disc', paddingLeft: '18px', margin: 0 }}>
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

        {/* ═══ FOOTER ═══ */}
        <div style={{
          backgroundColor: DARK,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          {/* Location */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{
              backgroundColor: ORANGE, borderRadius: '50px',
              width: '60px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocationIcon />
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', lineHeight: '1.7' }}>
              {settings.address || 'Shop Address'}
            </div>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{
              backgroundColor: ORANGE, borderRadius: '50px',
              width: '60px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PhoneIcon />
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', lineHeight: '1.7' }}>
              {settings.phone1 && <div>{settings.phone1}</div>}
              {settings.phone2 && <div>{settings.phone2}</div>}
              {!settings.phone1 && !settings.phone2 && 'Contact'}
            </div>
          </div>

          {/* Social */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{
              backgroundColor: ORANGE, borderRadius: '50px',
              width: '60px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GlobeIcon />
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', lineHeight: '1.7' }}>
              {settings.socialMedia || settings.website || 'Website Coming Soon'}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const thStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 700,
  padding: '11px 10px',
  textAlign: 'center',
  border: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  fontSize: '13px',
  color: '#222222',
  textAlign: 'center',
  verticalAlign: 'middle',
};

const paymentLiStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#333333',
  lineHeight: '1.8',
  fontWeight: 400,
};

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
