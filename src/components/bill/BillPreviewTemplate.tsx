import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem, WatermarkStyle } from '@/types/bill';
import { getBillPalette, type BillColorPalette } from '@/utils/billColorThemes';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

/* ── SVG Icons (inline, no icon fonts) ── */
const IconSvg = ({ d, circle }: { d: string; circle?: { cx: number; cy: number; r: number } }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    {circle && <circle cx={circle.cx} cy={circle.cy} r={circle.r} />}
  </svg>
);
const LocationIcon = () => <IconSvg d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" circle={{ cx: 12, cy: 10, r: 3 }} />;
const PhoneIcon = () => <IconSvg d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

function getShopNameFontSize(name: string): string {
  if (name.length <= 16) return '28px';
  if (name.length <= 24) return '22px';
  return '18px';
}

/* ── Watermark overlay components ── */
const TextWatermark = ({ text, opacity, color }: { text: string; opacity: number; color: string }) => {
  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 4 });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {rows.map((_, ri) => (
        <div key={ri} style={{ display: 'flex', justifyContent: 'space-around', marginTop: ri === 0 ? '40px' : '80px' }}>
          {cols.map((_, ci) => (
            <span key={ci} style={{
              fontSize: '28px', fontWeight: 800, color,
              opacity, transform: 'rotate(-30deg)', whiteSpace: 'nowrap',
              letterSpacing: '6px', textTransform: 'uppercase', userSelect: 'none',
            }}>{text}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

const LogoWatermark = ({ logoPath, initials, opacity, color }: { logoPath: string | null; initials: string; opacity: number; color: string }) => {
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
                <span style={{ fontSize: '32px', fontWeight: 800, color, letterSpacing: '3px' }}>{initials}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const BorderFrameWatermark = ({ opacity, color }: { opacity: number; color: string }) => (
  <div style={{
    position: 'absolute', top: '8px', left: '8px', right: '8px', bottom: '8px',
    border: `3px double ${color}`, pointerEvents: 'none', zIndex: 0,
    opacity: opacity * 4,
  }}>
    <div style={{
      position: 'absolute', top: '6px', left: '6px', right: '6px', bottom: '6px',
      border: `1px solid ${color}`,
    }}>
      {[{ top: '-4px', left: '-4px' }, { top: '-4px', right: '-4px' }, { bottom: '-4px', left: '-4px' }, { bottom: '-4px', right: '-4px' }].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: '20px', height: '20px',
          borderTop: pos.top ? `2px solid ${color}` : undefined,
          borderBottom: pos.bottom ? `2px solid ${color}` : undefined,
          borderLeft: pos.left ? `2px solid ${color}` : undefined,
          borderRight: pos.right ? `2px solid ${color}` : undefined,
        }} />
      ))}
    </div>
  </div>
);

const DiagonalLinesWatermark = ({ opacity, color }: { opacity: number; color: string }) => {
  const lines = Array.from({ length: 30 });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {lines.map((_, i) => (
          <line key={i} x1={i * 60 - 200} y1="0" x2={i * 60 + 800} y2="1200"
            stroke={color} strokeWidth="0.8" opacity={opacity * 3} />
        ))}
      </svg>
    </div>
  );
};

const WatermarkRenderer = ({ settings, initials, p }: { settings: BillSettings; initials: string; p: BillColorPalette }) => {
  if (!settings.watermarkEnabled) return null;
  const style = (settings.watermarkStyle || 'text') as WatermarkStyle;
  const text = settings.watermarkText || settings.shopName;
  const wmColor = p.accent1;
  switch (style) {
    case 'logo': return <LogoWatermark logoPath={settings.logoPath} initials={initials} opacity={settings.watermarkOpacity} color={p.silver} />;
    case 'border-frame': return <BorderFrameWatermark opacity={settings.watermarkOpacity} color={wmColor} />;
    case 'diagonal-lines': return <DiagonalLinesWatermark opacity={settings.watermarkOpacity} color={wmColor} />;
    case 'text': default: return <TextWatermark text={text} opacity={settings.watermarkOpacity} color={p.silver} />;
  }
};

const BillPreviewTemplate = forwardRef<HTMLDivElement, BillPreviewTemplateProps>(
  ({ settings, bill, items }, ref) => {
    const p = getBillPalette(settings.billColorTheme || 'modern-black-orange');
    const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
    const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
    const showTerms = bill.showTerms ?? settings.showTerms;
    const terms = bill.termsConditions ?? settings.termsConditions;
    const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const thStyle: React.CSSProperties = {
      color: p.headerText, fontSize: '11px', fontWeight: 700,
      padding: '10px 10px', textAlign: 'center', border: 'none',
      textTransform: 'uppercase', letterSpacing: '0.8px',
    };
    const tdStyle: React.CSSProperties = {
      padding: '10px 10px', fontSize: '12px', color: p.textBody,
      textAlign: 'center', verticalAlign: 'middle',
    };

    return (
      <div
        ref={ref}
        id="bill-capture-root"
        style={{
          width: '794px', minHeight: '1123px', background: p.white,
          color: p.textSecondary,
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
          fontSize: '14px', lineHeight: '1.5',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)', position: 'relative',
        }}
      >
        {/* ═══ HEADER ═══ */}
        <div style={{ background: p.headerBg, position: 'relative' }}>
          <div style={{ height: '4px', background: `linear-gradient(90deg, ${p.accent1}, ${p.accent2})` }} />
          <div style={{ padding: '22px 36px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Logo Badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '86px', height: '86px', borderRadius: '50%',
                border: `2.5px solid ${p.accent1}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: p.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: `0 0 16px ${p.accent1}40`,
                }}>
                  {settings.logoPath ? (
                    <img src={settings.logoPath} alt="Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                      crossOrigin="anonymous" />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${p.accent1}, ${p.accent2})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: p.headerText, letterSpacing: '2px' }}>
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{
              width: '2px', alignSelf: 'stretch',
              background: `linear-gradient(to bottom, ${p.accent1}, ${p.accent2})`,
              margin: '4px 0', borderRadius: '1px',
            }} />

            {/* Shop Name + Tagline */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{
                fontSize: getShopNameFontSize(settings.shopName), fontWeight: 800, color: p.headerText,
                lineHeight: '1.15', letterSpacing: '1.5px', textTransform: 'uppercase',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px',
              }}>
                {settings.shopName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 6px' }}>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${p.accent1}, transparent)` }} />
                <div style={{ width: '5px', height: '5px', background: p.accent2, transform: 'rotate(45deg)', borderRadius: '1px' }} />
                <div style={{ width: '30px', height: '1px', background: p.accent1 }} />
                <div style={{ width: '5px', height: '5px', background: p.accent2, transform: 'rotate(45deg)', borderRadius: '1px' }} />
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(270deg, ${p.accent1}, transparent)` }} />
              </div>
              {settings.tagline && (
                <div style={{
                  fontSize: '11px', fontWeight: 400, color: p.silver,
                  letterSpacing: '2.5px', textTransform: 'uppercase', textAlign: 'center',
                }}>
                  {settings.tagline}
                </div>
              )}
            </div>
          </div>
          <div style={{ height: '3px', background: `linear-gradient(90deg, ${p.accent2}, ${p.accent1}, ${p.accent2})` }} />
        </div>

        {/* ═══ "Invoice From" bar ═══ */}
        <div style={{ padding: '10px 36px', background: p.pale, borderBottom: `1px solid ${p.lightSilver}` }}>
          <p style={{ fontSize: '12px', fontWeight: 400, color: p.textMuted, margin: 0, letterSpacing: '0.3px' }}>
            Invoice From : <strong style={{ fontWeight: 700, color: p.textPrimary }}>{settings.shopName.toUpperCase()}</strong>
          </p>
        </div>

        {/* Watermark */}
        {settings.watermarkEnabled && <WatermarkRenderer settings={settings} initials={initials} p={p} />}

        {/* ═══ INVOICE BODY ═══ */}
        <div style={{ padding: '20px 36px 24px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

          {/* Invoice To Block */}
          <div style={{ border: `1px solid ${p.lightSilver}`, borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              backgroundColor: p.headerBg,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: p.headerText, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Invoice To</span>
              <span style={{ fontSize: '12px', fontWeight: 400, color: p.silver }}>
                Invoice No : <strong style={{ fontWeight: 700, color: p.accent1 }}>{bill.billNumber}</strong>
              </span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: p.white }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: p.textPrimary, marginBottom: '2px' }}>
                  {bill.buyerName.toUpperCase()}
                </div>
                {bill.buyerPhone && (
                  <div style={{ fontSize: '12px', fontWeight: 400, color: p.textMuted }}>Phone: {bill.buyerPhone}</div>
                )}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 400, color: p.textMuted, textAlign: 'right' }}>
                Date : <span style={{ color: p.textSecondary, fontWeight: 600 }}>{new Date(bill.date).toLocaleDateString('en-PK')}</span>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
            <thead>
              <tr style={{ background: p.headerBg }}>
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
                <tr key={item.id} style={{ borderBottom: `1px solid ${p.lightSilver}`, background: i % 2 === 0 ? p.white : p.pale }}>
                  <td style={{ ...tdStyle, color: p.textMuted }}>{i + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: p.textPrimary }}>{item.partName}</td>
                  <td style={tdStyle}>{item.partCode || '-'}</td>
                  <td style={tdStyle}>{item.brand || '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: p.textSecondary }}>{item.quantity}</td>
                  <td style={tdStyle}>{item.price.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: p.textPrimary }}>{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Grand Total Bar */}
          <div style={{ display: 'flex', width: '100%', marginBottom: '6px', borderRadius: '0 0 4px 4px', overflow: 'hidden' }}>
            <div style={{
              flex: 1, background: `linear-gradient(90deg, ${p.totalGradientStart}, ${p.totalGradientEnd})`, padding: '12px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: p.headerText, textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total</span>
              {bill.discount > 0 && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>
                  (Subtotal: Rs {bill.subtotal.toLocaleString()} | Discount: Rs {bill.discount.toLocaleString()})
                </span>
              )}
            </div>
            <div style={{
              background: p.totalAmountBg, padding: '12px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '180px',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: p.totalAmountText, letterSpacing: '0.5px' }}>
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
                  fontSize: '12px', fontWeight: 800, color: p.textPrimary,
                  marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px',
                  borderBottom: `2px solid ${p.accent2}`, paddingBottom: '4px', display: 'inline-block',
                }}>
                  Terms & Conditions
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: '0', margin: 0 }}>
                  {terms.map((t, i) => (
                    <li key={i} style={{
                      fontSize: '11px', color: p.textBody, lineHeight: '1.9', fontWeight: 400,
                      paddingLeft: '14px', position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: p.accent2, fontWeight: 700 }}>•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showPayment && paymentInfo && (
              <div style={{
                flex: 1, border: `1px solid ${p.lightSilver}`,
                borderRadius: '6px', padding: '12px 16px', background: p.warmBg,
                borderLeft: `3px solid ${p.accent1}`,
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: 800, color: p.textPrimary,
                  marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px',
                }}>
                  Payment Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  {paymentInfo.bankName && <PaymentRow label="Bank" value={paymentInfo.bankName} p={p} />}
                  {paymentInfo.accountTitle && <PaymentRow label="Account" value={paymentInfo.accountTitle} p={p} />}
                  {paymentInfo.accountNumber && <PaymentRow label="Acc No" value={paymentInfo.accountNumber} p={p} />}
                  {paymentInfo.iban && <PaymentRow label="IBAN" value={paymentInfo.iban} p={p} />}
                  {paymentInfo.easypaisaNumber && <PaymentRow label="EasyPaisa" value={paymentInfo.easypaisaNumber} p={p} />}
                  {paymentInfo.jazzcashNumber && <PaymentRow label="JazzCash" value={paymentInfo.jazzcashNumber} p={p} />}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ FOOTER ═══ */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${p.accent1}, ${p.accent2}, ${p.accent1})` }} />
        <div style={{ position: 'relative', backgroundColor: p.headerBg, paddingTop: '30px', paddingBottom: '16px', paddingLeft: '36px', paddingRight: '36px', color: p.headerText }}>
          {/* Pill banner */}
          <div style={{
            position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', height: '28px', borderRadius: '14px',
            overflow: 'hidden', width: '75%',
            background: `linear-gradient(90deg, ${p.accent2}, ${p.accent1}, ${p.accent2})`,
          }} />

          {/* Icon circles */}
          <div style={{
            position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
            width: '75%', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            height: '28px', pointerEvents: 'none',
          }}>
            {[
              { icon: <LocationIcon />, bg: p.iconCircle1 },
              { icon: <PhoneIcon />, bg: p.iconCircle2 },
              { icon: <GlobeIcon />, bg: p.iconCircle1 },
            ].map((item, i) => (
              <div key={i} style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: item.bg, border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 2px 8px ${item.bg}4D`,
              }}>
                {item.icon}
              </div>
            ))}
          </div>

          {/* Footer text */}
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '6px' }}>
            <div style={{ flex: 1, fontSize: '10.5px', color: p.silver, lineHeight: '1.5', maxWidth: '180px', margin: '0 auto' }}>
              {settings.address || 'Shop Address'}
            </div>
            <div style={{ flex: 1, fontSize: '10.5px', color: p.silver, lineHeight: '1.5', margin: '0 auto' }}>
              {settings.phone1 && <div>{settings.phone1}</div>}
              {settings.phone2 && <div>{settings.phone2}</div>}
              {!settings.phone1 && !settings.phone2 && 'Contact'}
            </div>
            <div style={{ flex: 1, fontSize: '10.5px', color: p.silver, lineHeight: '1.5', margin: '0 auto' }}>
              {settings.socialMedia || settings.website || 'Website Coming Soon'}
            </div>
          </div>

          {settings.footerMessage && (
            <div style={{
              textAlign: 'center', marginTop: '10px', paddingTop: '8px',
              borderTop: '1px solid rgba(176,176,176,0.2)',
              fontSize: '10px', color: p.textMuted, letterSpacing: '0.5px',
            }}>
              {settings.footerMessage}
            </div>
          )}
        </div>
      </div>
    );
  }
);

const PaymentRow = ({ label, value, p }: { label: string; value: string; p: BillColorPalette }) => (
  <div style={{ fontSize: '11px', lineHeight: '1.8' }}>
    <span style={{ color: p.textMuted, fontWeight: 500 }}>{label}: </span>
    <span style={{ color: p.textSecondary, fontWeight: 600 }}>{value}</span>
  </div>
);

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
