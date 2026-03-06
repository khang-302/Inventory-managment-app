import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

export function generateBillPdf(
  settings: BillSettings,
  bill: Bill,
  items: BillItem[],
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 15;
  let y = 0;

  // ── HEADER BANNER ──
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pw, 38, 'F');

  // Gold accent bars
  doc.setFillColor(218, 165, 32);
  doc.rect(0, 0, pw, 2, 'F');
  doc.rect(0, 36, pw, 2, 'F');

  // Logo circle
  const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (!settings.logoPath) {
    doc.setFillColor(218, 165, 32);
    doc.circle(m + 10, 20, 9, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(initials, m + 10, 23, { align: 'center' });
  }

  // Shop name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(244, 196, 48);
  doc.text(settings.shopName.toUpperCase(), m + 24, 18);

  if (settings.tagline) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text(settings.tagline.toUpperCase(), m + 24, 24);
  }

  // INVOICE label
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(244, 196, 48);
  doc.text('INVOICE', pw - m, 22, { align: 'right' });

  // ── CONTACT ROW ──
  y = 44;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'normal');
  doc.text(`📍 ${settings.address}`, m, y);
  const contactLine = [settings.phone1, settings.phone2].filter(Boolean).join(' | ');
  doc.text(contactLine, pw - m, y, { align: 'right' });
  y += 4;
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(m, y, pw - m, y);

  // ── FROM / TO BOXES ──
  y += 6;
  const boxW = (pw - m * 2 - 10) / 2;

  // From label
  doc.setFontSize(7);
  doc.setTextColor(160);
  doc.text('INVOICE FROM', m, y);
  doc.text('INVOICE TO', m + boxW + 10, y);
  y += 3;

  // Gold top border on boxes
  doc.setFillColor(218, 165, 32);
  doc.rect(m, y, boxW, 1.5, 'F');
  doc.rect(m + boxW + 10, y, boxW, 1.5, 'F');
  y += 1.5;

  // From box
  doc.setFillColor(248, 248, 248);
  doc.rect(m, y, boxW, 18, 'F');
  doc.setDrawColor(230);
  doc.rect(m, y, boxW, 18, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(settings.shopName, m + 4, y + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(settings.address, m + 4, y + 11, { maxWidth: boxW - 8 });
  doc.setFont('helvetica', 'bold');
  doc.text(contactLine, m + 4, y + 16);

  // To box
  doc.setFillColor(248, 248, 248);
  doc.rect(m + boxW + 10, y, boxW, 18, 'F');
  doc.setDrawColor(230);
  doc.rect(m + boxW + 10, y, boxW, 18, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(bill.buyerName, m + boxW + 14, y + 6);
  if (bill.buyerPhone) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Phone: ${bill.buyerPhone}`, m + boxW + 14, y + 11);
  }

  y += 22;

  // Invoice meta (right-aligned)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160);
  doc.text('Invoice No:', pw - m - 60, y);
  doc.text('Date:', pw - m - 60, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(bill.billNumber, pw - m, y, { align: 'right' });
  doc.text(new Date(bill.date).toLocaleDateString('en-PK'), pw - m, y + 5, { align: 'right' });

  y += 12;

  // ── ITEMS TABLE ──
  autoTable(doc, {
    startY: y,
    head: [['#', 'Part Name', 'Code', 'Brand', 'Qty', 'Price (Rs)', 'Total (Rs)']],
    body: items.map((item, i) => [
      i + 1,
      item.partName,
      item.partCode || '-',
      item.brand || '-',
      item.quantity,
      item.price.toLocaleString(),
      item.total.toLocaleString(),
    ]),
    margin: { left: m, right: m },
    styles: { fontSize: 9, cellPadding: 3.5 },
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [244, 196, 48],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: 'grid',
  });

  // ── TOTALS ──
  y = (doc as any).lastAutoTable.finalY + 2;
  doc.setDrawColor(26, 26, 26);
  doc.setLineWidth(0.8);
  doc.line(m, y, pw - m, y);
  y += 6;

  const tx = pw - m;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Subtotal:', tx - 55, y, { align: 'right' });
  doc.setTextColor(26, 26, 26);
  doc.text(`Rs ${bill.subtotal.toLocaleString()}`, tx, y, { align: 'right' });
  y += 6;

  if (bill.discount > 0) {
    doc.setTextColor(100);
    doc.text('Discount:', tx - 55, y, { align: 'right' });
    doc.setTextColor(26, 26, 26);
    doc.text(`Rs ${bill.discount.toLocaleString()}`, tx, y, { align: 'right' });
    y += 6;
  }

  // Grand total bar
  y += 2;
  const gtW = 120;
  const gtX = pw - m - gtW;
  doc.setFillColor(218, 165, 32);
  doc.rect(gtX, y - 5, gtW, 12, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('GRAND TOTAL:', gtX + 6, y + 2);
  doc.text(`Rs ${bill.finalTotal.toLocaleString()}`, pw - m - 4, y + 2, { align: 'right' });

  // ── TERMS & PAYMENT ──
  const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
  const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
  const showTerms = bill.showTerms ?? settings.showTerms;
  const terms = bill.termsConditions ?? settings.termsConditions;

  if (showTerms || showPayment) {
    y += 16;
    const colW = (pw - m * 2 - 10) / 2;

    if (showTerms && terms && terms.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 165, 32);
      doc.text('TERMS & CONDITIONS', m, y);
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.5);
      doc.line(m, y + 1, m + 50, y + 1);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      let ty = y + 6;
      terms.forEach(t => {
        doc.text(`• ${t}`, m + 2, ty);
        ty += 4.5;
      });
    }

    if (showPayment && paymentInfo) {
      const px = showTerms ? m + colW + 10 : m;
      let py = y;

      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.5);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 165, 32);
      doc.text('PAYMENT INFORMATION', px + 4, py);
      doc.line(px + 4, py + 1, px + 55, py + 1);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      let pl = py + 6;
      const addLine = (label: string, val: string) => {
        if (val) { doc.text(`• ${label}: ${val}`, px + 6, pl); pl += 4.5; }
      };
      addLine('Bank', paymentInfo.bankName);
      addLine('Account', paymentInfo.accountTitle);
      addLine('Acc No', paymentInfo.accountNumber);
      addLine('IBAN', paymentInfo.iban);
      addLine('EasyPaisa', paymentInfo.easypaisaNumber);
      addLine('JazzCash', paymentInfo.jazzcashNumber);

      doc.setFillColor(255, 253, 245);
      doc.rect(px, py - 4, colW, pl - py + 6, 'S');
    }
  }

  // ── NOTES ──
  if (bill.notes) {
    y = Math.max(y, (doc as any).lastAutoTable.finalY) + 40;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120);
    doc.text(`Notes: ${bill.notes}`, m, y);
  }

  // ── FOOTER MESSAGE ──
  if (settings.footerMessage) {
    doc.setFontSize(10);
    doc.setTextColor(140);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.footerMessage, pw / 2, ph - 22, { align: 'center' });
  }

  // ── BOTTOM BAR ──
  doc.setFillColor(26, 26, 26);
  doc.rect(0, ph - 14, pw, 14, 'F');
  doc.setFontSize(7);
  doc.setTextColor(180);
  doc.setFont('helvetica', 'normal');
  const footerParts = [
    settings.phone1 && `📞 ${settings.phone1}`,
    settings.phone2 && `📱 ${settings.phone2}`,
    settings.address && `📍 ${settings.address.split(',').slice(0, 2).join(',')}`,
  ].filter(Boolean);
  doc.text(footerParts.join('   |   '), pw / 2, ph - 6, { align: 'center' });

  return doc;
}
