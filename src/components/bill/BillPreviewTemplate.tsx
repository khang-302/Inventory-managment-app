import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem, WatermarkStyle } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

/* ── Premium Color Palette (Yellow / Orange / Black / Silver Gray) ── */
const P_BLACK = '#1A1A1A';         // Primary text, headers — authority & clarity
const P_CHARCOAL = '#2D2D2D';      // Secondary dark text
const P_YELLOW = '#F5A623';        // Premium warm yellow — highlights, accents
const P_ORANGE = '#E8712B';        // Premium orange — CTAs, totals, energy
const P_SILVER = '#B0B0B0';        // Silver gray — borders, secondary labels
const P_LIGHT_SILVER = '#E8E8E8';  // Light silver — table borders, dividers
const P_PALE = '#F7F7F7';          // Pale gray — alternating rows
const WHITE = '#FFFFFF';
const P_BODY = '#4A4A4A';          // Body text
const P_MUTED = '#8A8A8A';         // Muted labels
const P_WARM_BG = '#FFFBF5';       // Warm tinted white for payment section

/* ── SVG Icons (inline, no icon fonts) ── */
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/* ── Dynamic font size for shop name ── */
function getShopNameFontSize(name: string): string {
  if (name.length <= 16) return '28px';
  if (name.length <= 24) return '22px';
  return '18px';
}

/* ── Watermark overlay components ── */
const TextWatermark = ({ text, opacity }: { text: string; opacity: number }) => {
  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 4 });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {rows.map((_, ri) => (
        <div key={ri} style={{ display: 'flex', justifyContent: 'space-around', marginTop: ri === 0 ? '40px' : '80px' }}>
          {cols.map((_, ci) => (
            <span key={ci} style={{
              fontSize: '28px', fontWeight: 800, color: P_SILVER,
              opacity, transform: 'rotate(-30deg)', whiteSpace: 'nowrap',
              letterSpacing: '6px', textTransform: 'uppercase', userSelect: 'none',
            }}>{text}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

const LogoWatermark = ({ logoPath, initials, opacity }: { logoPath: string | null; initials: string; opacity: number }) => {
  const rows = Array.from({ length: 5 });
  const cols = Array.from({ length: 3 });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {rows.map((_, ri) => (
        <div key={ri} style={{ display: 'flex', justifyContent: 'space-around', marginTop: ri === 0 ? '60px' : '120px' }}>
          {cols.map((_, ci) => (
            <div key={ci} style={{
              width: '80px', height: '80px', opacity: opacity * 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(-15deg)',
            }}>
              {logoPath ? (
                <img src={logoPath} alt="" style={{ width: '70px', height: '70px', objectFit: 'contain', filter: 'grayscale(100%)' }} />
              ) : (
                <span style={{ fontSize: '32px', fontWeight: 800, color: P_SILVER, letterSpacing: '3px' }}>{initials}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const BorderFrameWatermark = ({ opacity }: { opacity: number }) => (
  <div style={{
    position: 'absolute', top: '8px', left: '8px', right: '8px', bottom: '8px',
    border: `3px double ${P_YELLOW}`, pointerEvents: 'none', zIndex: 0,
    opacity: opacity * 4,
  }}>
    <div style={{
      position: 'absolute', top: '6px', left: '6px', right: '6px', bottom: '6px',
      border: `1px solid ${P_YELLOW}`,
    }}>
      {[{ top: '-4px', left: '-4px' }, { top: '-4px', right: '-4px' }, { bottom: '-4px', left: '-4px' }, { bottom: '-4px', right: '-4px' }].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: '20px', height: '20px',
          borderTop: pos.top ? `2px solid ${P_YELLOW}` : undefined,
          borderBottom: pos.bottom ? `2px solid ${P_YELLOW}` : undefined,
          borderLeft: pos.left ? `2px solid ${P_YELLOW}` : undefined,
          borderRight: pos.right ? `2px solid ${P_YELLOW}` : undefined,
        }} />
      ))}
    </div>
  </div>
);

const DiagonalLinesWatermark = ({ opacity }: { opacity: number }) => {
  const lines = Array.from({ length: 30 });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {lines.map((_, i) => (
          <line key={i}
            x1={i * 60 - 200} y1="0" x2={i * 60 + 800} y2="1200"
            stroke={P_YELLOW} strokeWidth="0.8" opacity={opacity * 3}
          />
        ))}
      </svg>
    </div>
  );
};

const WatermarkRenderer = ({ settings, initials }: { settings: BillSettings; initials: string }) => {
  if (!settings.watermarkEnabled) return null;
  const style = (settings.watermarkStyle || 'text') as WatermarkStyle;
  const text = settings.watermarkText || settings.shopName;
  switch (style) {
    case 'logo': return <LogoWatermark logoPath={settings.logoPath} initials={initials} opacity={settings.watermarkOpacity} />;
    case 'border-frame': return <BorderFrameWatermark opacity={settings.watermarkOpacity} />;
    case 'diagonal-lines': return <DiagonalLinesWatermark opacity={settings.watermarkOpacity} />;
    case 'text': default: return <TextWatermark text={text} opacity={settings.watermarkOpacity} />;
  }
};

const BillPreviewTemplate = forwardRef<HTMLDivElement, BillPreviewTemplateProps>(
  ({ settings, bill, items }, ref) => {
    const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
    const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
    const showTerms = bill.showTerms ?? settings.showTerms;
    const terms = bill.termsConditions ?? settings.termsConditions;
    const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const watermarkActive = settings.watermarkEnabled;

    return (
      <div
        ref={ref}
        id="bill-capture-root"
        style={{
          width: '794px',
          minHeight: '1123px',
          background: WHITE,
          color: P_CHARCOAL,
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
          fontSize: '14px',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        {/* ═══ HEADER — Premium Black with Yellow/Orange accents ═══ */}
        <div style={{
          background: P_BLACK,
          position: 'relative',
        }}>
          {/* Top accent gradient line */}
          <div style={{ height: '4px', background: `linear-gradient(90deg, ${P_YELLOW}, ${P_ORANGE})` }} />

          {/* Main header content */}
          <div style={{
            padding: '22px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}>
            {/* Logo Badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '86px', height: '86px', borderRadius: '50%',
                border: `2.5px solid ${P_YELLOW}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: WHITE,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: `0 0 16px rgba(245,166,35,0.25)`,
                }}>
                  {settings.logoPath ? (
                    <img
                      src={settings.logoPath}
                      alt="Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${P_YELLOW}, ${P_ORANGE})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: WHITE, letterSpacing: '2px' }}>
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vertical accent divider */}
            <div style={{
              width: '2px', alignSelf: 'stretch',
              background: `linear-gradient(to bottom, ${P_YELLOW}, ${P_ORANGE})`,
              margin: '4px 0',
              borderRadius: '1px',
            }} />

            {/* Shop Name + Tagline */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{
                fontSize: getShopNameFontSize(settings.shopName), fontWeight: 800, color: WHITE,
                lineHeight: '1.15', letterSpacing: '1.5px',
                textTransform: 'uppercase',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '500px',
              }}>
                {settings.shopName}
              </div>
              {/* Elegant underline ornament */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 6px' }}>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${P_YELLOW}, transparent)` }} />
                <div style={{ width: '5px', height: '5px', background: P_ORANGE, transform: 'rotate(45deg)', borderRadius: '1px' }} />
                <div style={{ width: '30px', height: '1px', background: P_YELLOW }} />
                <div style={{ width: '5px', height: '5px', background: P_ORANGE, transform: 'rotate(45deg)', borderRadius: '1px' }} />
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(270deg, ${P_YELLOW}, transparent)` }} />
              </div>
              {settings.tagline && (
                <div style={{
                  fontSize: '11px', fontWeight: 400, color: P_SILVER,
                  letterSpacing: '2.5px', textTransform: 'uppercase', textAlign: 'center',
                }}>
                  {settings.tagline}
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent gradient */}
          <div style={{ height: '3px', background: `linear-gradient(90deg, ${P_ORANGE}, ${P_YELLOW}, ${P_ORANGE})` }} />
        </div>

        {/* ═══ "Invoice From" subtle bar ═══ */}
        <div style={{
          padding: '10px 36px',
          background: P_PALE,
          borderBottom: `1px solid ${P_LIGHT_SILVER}`,
        }}>
          <p style={{ fontSize: '12px', fontWeight: 400, color: P_MUTED, margin: 0, letterSpacing: '0.3px' }}>
            Invoice From : <strong style={{ fontWeight: 700, color: P_BLACK }}>{settings.shopName.toUpperCase()}</strong>
          </p>
        </div>

        {/* ═══ Watermark ═══ */}
        {watermarkActive && <WatermarkRenderer settings={settings} initials={initials} />}

        {/* ═══ INVOICE BODY ═══ */}
        <div style={{ padding: '20px 36px 24px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

          {/* ── Invoice To Block ── */}
          <div style={{
            border: `1px solid ${P_LIGHT_SILVER}`,
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <div style={{
              backgroundColor: P_BLACK,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: WHITE, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Invoice To</span>
              <span style={{ fontSize: '12px', fontWeight: 400, color: P_SILVER }}>
                Invoice No : <strong style={{ fontWeight: 700, color: P_YELLOW }}>{bill.billNumber}</strong>
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
                <div style={{ fontSize: '16px', fontWeight: 700, color: P_BLACK, marginBottom: '2px' }}>
                  {bill.buyerName.toUpperCase()}
                </div>
                {bill.buyerPhone && (
                  <div style={{ fontSize: '12px', fontWeight: 400, color: P_MUTED }}>
                    Phone: {bill.buyerPhone}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 400, color: P_MUTED, textAlign: 'right' }}>
                Date : <span style={{ color: P_CHARCOAL, fontWeight: 600 }}>{new Date(bill.date).toLocaleDateString('en-PK')}</span>
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
            <thead>
              <tr style={{ background: P_BLACK }}>
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
                <tr key={item.id} style={{ borderBottom: `1px solid ${P_LIGHT_SILVER}`, background: i % 2 === 0 ? WHITE : P_PALE }}>
                  <td style={{ ...tdStyle, color: P_MUTED }}>{i + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: P_BLACK }}>{item.partName}</td>
                  <td style={tdStyle}>{item.partCode || '-'}</td>
                  <td style={tdStyle}>{item.brand || '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: P_CHARCOAL }}>{item.quantity}</td>
                  <td style={tdStyle}>{item.price.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: P_BLACK }}>{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Grand Total Bar — Premium Orange/Yellow gradient ── */}
          <div style={{ display: 'flex', width: '100%', marginBottom: '6px', borderRadius: '0 0 4px 4px', overflow: 'hidden' }}>
            <div style={{
              flex: 1, background: `linear-gradient(90deg, ${P_ORANGE}, ${P_YELLOW})`, padding: '12px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: WHITE, textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total</span>
              {bill.discount > 0 && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>
                  (Subtotal: Rs {bill.subtotal.toLocaleString()} | Discount: Rs {bill.discount.toLocaleString()})
                </span>
              )}
            </div>
            <div style={{
              background: P_BLACK, padding: '12px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '180px',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: P_YELLOW, letterSpacing: '0.5px' }}>
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
                  fontSize: '12px', fontWeight: 800, color: P_BLACK,
                  marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px',
                  borderBottom: `2px solid ${P_ORANGE}`, paddingBottom: '4px', display: 'inline-block',
                }}>
                  Terms & Conditions
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: '0', margin: 0 }}>
                  {terms.map((t, i) => (
                    <li key={i} style={{
                      fontSize: '11px', color: P_BODY, lineHeight: '1.9', fontWeight: 400,
                      paddingLeft: '14px', position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: P_ORANGE, fontWeight: 700 }}>•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showPayment && paymentInfo && (
              <div style={{
                flex: 1, border: `1px solid ${P_LIGHT_SILVER}`,
                borderRadius: '6px', padding: '12px 16px', background: P_WARM_BG,
                borderLeft: `3px solid ${P_YELLOW}`,
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: 800, color: P_BLACK,
                  marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px',
                }}>
                  Payment Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  {paymentInfo.bankName && <PaymentRow label="Bank" value={paymentInfo.bankName} />}
                  {paymentInfo.accountTitle && <PaymentRow label="Account" value={paymentInfo.accountTitle} />}
                  {paymentInfo.accountNumber && <PaymentRow label="Acc No" value={paymentInfo.accountNumber} />}
                  {paymentInfo.iban && <PaymentRow label="IBAN" value={paymentInfo.iban} />}
                  {paymentInfo.easypaisaNumber && <PaymentRow label="EasyPaisa" value={paymentInfo.easypaisaNumber} />}
                  {paymentInfo.jazzcashNumber && <PaymentRow label="JazzCash" value={paymentInfo.jazzcashNumber} />}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ FOOTER — Premium Black with orange accent ═══ */}
        {/* Orange accent stripe */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${P_YELLOW}, ${P_ORANGE}, ${P_YELLOW})` }} />

        <div style={{ position: 'relative', backgroundColor: P_BLACK, paddingTop: '30px', paddingBottom: '16px', paddingLeft: '36px', paddingRight: '36px' }}>
          {/* Orange pill banner bar */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            height: '28px',
            borderRadius: '14px',
            overflow: 'hidden',
            width: '75%',
            background: `linear-gradient(90deg, ${P_ORANGE}, ${P_YELLOW}, ${P_ORANGE})`,
          }}>
          </div>

          {/* Icon circles on the banner */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '75%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '28px',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: P_ORANGE, border: `2px solid rgba(255,255,255,0.4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(232,113,43,0.3)',
            }}>
              <LocationIcon />
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: P_YELLOW, border: `2px solid rgba(255,255,255,0.4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(245,166,35,0.3)',
            }}>
              <PhoneIcon />
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: P_ORANGE, border: `2px solid rgba(255,255,255,0.4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(232,113,43,0.3)',
            }}>
              <GlobeIcon />
            </div>
          </div>

          {/* Text columns below icons */}
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '6px' }}>
            <div style={{ flex: 1, fontSize: '10.5px', color: P_SILVER, lineHeight: '1.5', maxWidth: '180px', margin: '0 auto' }}>
              {settings.address || 'Shop Address'}
            </div>
            <div style={{ flex: 1, fontSize: '10.5px', color: P_SILVER, lineHeight: '1.5', margin: '0 auto' }}>
              {settings.phone1 && <div>{settings.phone1}</div>}
              {settings.phone2 && <div>{settings.phone2}</div>}
              {!settings.phone1 && !settings.phone2 && 'Contact'}
            </div>
            <div style={{ flex: 1, fontSize: '10.5px', color: P_SILVER, lineHeight: '1.5', margin: '0 auto' }}>
              {settings.socialMedia || settings.website || 'Website Coming Soon'}
            </div>
          </div>

          {/* Footer message */}
          {settings.footerMessage && (
            <div style={{
              textAlign: 'center', marginTop: '10px', paddingTop: '8px',
              borderTop: `1px solid rgba(176,176,176,0.2)`,
              fontSize: '10px', color: P_MUTED, letterSpacing: '0.5px',
            }}>
              {settings.footerMessage}
            </div>
          )}
        </div>
      </div>
    );
  }
);

/* ── Helper sub-component for payment info ── */
const PaymentRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ fontSize: '11px', lineHeight: '1.8' }}>
    <span style={{ color: P_MUTED, fontWeight: 500 }}>{label}: </span>
    <span style={{ color: P_CHARCOAL, fontWeight: 600 }}>{value}</span>
  </div>
);

const thStyle: React.CSSProperties = {
  color: WHITE,
  fontSize: '11px',
  fontWeight: 700,
  padding: '10px 10px',
  textAlign: 'center',
  border: 'none',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  fontSize: '12px',
  color: P_BODY,
  textAlign: 'center',
  verticalAlign: 'middle',
};

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
