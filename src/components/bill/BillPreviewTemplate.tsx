import { forwardRef } from 'react';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

interface BillPreviewTemplateProps {
  settings: BillSettings;
  bill: Bill;
  items: BillItem[];
}

/**
 * Offscreen HTML bill template that mirrors the PDF layout.
 * Rendered hidden in the DOM, then captured via html-to-image.
 */
const BillPreviewTemplate = forwardRef<HTMLDivElement, BillPreviewTemplateProps>(
  ({ settings, bill, items }, ref) => {
    const subtotal = bill.subtotal;
    const discount = bill.discount;
    const finalTotal = bill.finalTotal;

    return (
      <div
        ref={ref}
        style={{
          width: '794px', // A4 @ 96dpi
          padding: '40px',
          background: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '13px',
          lineHeight: '1.5',
          position: 'absolute',
          left: '-9999px',
          top: '0',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
              {settings.shopName}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {settings.tagline}
            </div>
          </div>
          {settings.logoPath && (
            <img
              src={settings.logoPath}
              alt="Logo"
              style={{ height: '50px', objectFit: 'contain' }}
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Gold accent line */}
        <div style={{ height: '2px', background: '#DAA520', margin: '12px 0' }} />

        {/* Contact info */}
        <div style={{ fontSize: '11px', color: '#555' }}>
          <div>{[settings.phone1, settings.phone2].filter(Boolean).join(' | ')}</div>
          <div style={{ marginTop: '2px' }}>{settings.address}</div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#ddd', margin: '12px 0' }} />

        {/* Bill details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <div>
            <div><strong>Bill No:</strong> {bill.billNumber}</div>
            <div style={{ marginTop: '4px' }}><strong>Buyer:</strong> {bill.buyerName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Date:</strong> {new Date(bill.date).toLocaleDateString('en-PK')}</div>
            {bill.buyerPhone && (
              <div style={{ marginTop: '4px' }}><strong>Phone:</strong> {bill.buyerPhone}</div>
            )}
          </div>
        </div>

        {/* Items table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '16px',
            fontSize: '12px',
          }}
        >
          <thead>
            <tr style={{ background: '#333', color: '#fff' }}>
              <th style={thStyle}>#</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Part Name</th>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Brand</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Price (Rs)</th>
              <th style={thStyle}>Total (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>{item.partName}</td>
                <td style={tdStyle}>{item.partCode || '-'}</td>
                <td style={tdStyle}>{item.brand || '-'}</td>
                <td style={tdStyle}>{item.quantity}</td>
                <td style={tdStyle}>{item.price.toLocaleString()}</td>
                <td style={tdStyle}>{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '13px' }}>
          <div>Subtotal: Rs {subtotal.toLocaleString()}</div>
          {discount > 0 && (
            <div style={{ marginTop: '4px' }}>Discount: Rs {discount.toLocaleString()}</div>
          )}
          <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 'bold' }}>
            Total: Rs {finalTotal.toLocaleString()}
          </div>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div style={{ marginTop: '20px', fontSize: '11px', color: '#555' }}>
            Notes: {bill.notes}
          </div>
        )}

        {/* Footer */}
        {settings.footerMessage && (
          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
            {settings.footerMessage}
          </div>
        )}

        {/* Bottom accent */}
        <div style={{ height: '1px', background: '#DAA520', marginTop: '20px' }} />
      </div>
    );
  }
);

const thStyle: React.CSSProperties = {
  padding: '8px 6px',
  textAlign: 'center',
  fontWeight: 'bold',
};

const tdStyle: React.CSSProperties = {
  padding: '6px',
  textAlign: 'center',
  borderBottom: '1px solid #eee',
};

BillPreviewTemplate.displayName = 'BillPreviewTemplate';
export default BillPreviewTemplate;
