import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

const TEAL: [number, number, number] = [13, 110, 110];
const TEAL_DARK: [number, number, number] = [10, 90, 90];
const GOLD: [number, number, number] = [212, 160, 23];
const GOLD_LIGHT: [number, number, number] = [232, 185, 35];
const RED: [number, number, number] = [192, 57, 43];

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
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pw, 36, 'F');

  // Logo circle
  const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (!settings.logoPath) {
    doc.setFillColor(...GOLD);
    doc.circle(m + 12, 18, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(initials, m + 12, 21, { align: 'center' });
  }

  // Shop name + tagline
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(settings.shopName, m + 28, 17);

  if (settings.tagline) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 230, 230);
    doc.text(settings.tagline, m + 28, 24);
  }

  // Header right: contact info
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 230, 230);
  let hy = 14;
  if (settings.phone1) { doc.text(settings.phone1, pw - m, hy, { align: 'right' }); hy += 4; }
  if (settings.address) { doc.text(settings.address, pw - m, hy, { align: 'right', maxWidth: 60 }); hy += 4; }
  if (settings.footerMessage) {
    doc.setTextColor(...GOLD_LIGHT);
    doc.setFont('helvetica', 'italic');
    doc.text(settings.footerMessage, pw - m, hy + 2, { align: 'right' });
  }

  // ── GOLD SEPARATOR ──
  y = 36;
  doc.setFillColor(...GOLD);
  doc.rect(0, y, pw, 3, 'F');
  y += 3;

  // ── Invoice From strip ──
  doc.setFillColor(245, 245, 240);
  doc.rect(0, y, pw, 9, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Invoice From :', m, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(settings.shopName.toUpperCase(), m + 28, y + 6);
  if (settings.ownerName) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`Owner: ${settings.ownerName}`, pw - m, y + 6, { align: 'right' });
  }
  y += 12;

  // ── BUYER / INVOICE INFO ──
  const halfW = (pw - m * 2) / 2;

  // Left: Invoice To
  doc.setFillColor(...TEAL);
  doc.rect(m, y, halfW, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Invoice To :', m + 4, y + 5.5);

  // Right: Invoice No
  doc.setFillColor(...TEAL);
  doc.rect(m + halfW, y, halfW, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Invoice No :', pw - m - 55, y + 5.5);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(bill.billNumber, pw - m - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Gold top border on boxes
  doc.setFillColor(...GOLD);
  doc.rect(m, y, halfW, 1.5, 'F');
  doc.rect(m + halfW, y, halfW, 1.5, 'F');
  y += 1.5;

  // Left box
  doc.setDrawColor(220);
  doc.rect(m, y, halfW, 16, 'S');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(bill.buyerName.toUpperCase(), m + 4, y + 7);
  if (bill.buyerPhone) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`Phone: ${bill.buyerPhone}`, m + 4, y + 12);
  }

  // Right box
  doc.rect(m + halfW, y, halfW, 16, 'S');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  doc.text(`Date : ${new Date(bill.date).toLocaleDateString('en-PK')}`, pw - m - 4, y + 7, { align: 'right' });
  if (bill.notes) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120);
    doc.text(`Notes: ${bill.notes}`, pw - m - 4, y + 12, { align: 'right', maxWidth: halfW - 8 });
  }

  y += 20;

  // ── ITEMS TABLE ──
  autoTable(doc, {
    startY: y,
    head: [['#', 'Part Name', 'Code', 'Brand', 'QTY', 'Price (RS)', 'Total (RS)']],
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
    styles: { fontSize: 10, cellPadding: 3.5 },
    headStyles: {
      fillColor: TEAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
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
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.2,
  });

  // ── TOTALS ──
  y = (doc as any).lastAutoTable.finalY + 2;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60);
  doc.text('Subtotal :', pw - m - 55, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30);
  doc.text(`Rs ${bill.subtotal.toLocaleString()}`, pw - m, y + 5, { align: 'right' });

  if (bill.discount > 0) {
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60);
    doc.text('Discount :', pw - m - 55, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(192, 57, 43);
    doc.text(`- ${bill.discount.toLocaleString()}`, pw - m, y + 5, { align: 'right' });
  }

  // Grand Total bar
  y += 12;
  const barW = 120;
  const barX = pw - m - barW;
  const splitAt = barW * 0.55;

  doc.setFillColor(...GOLD);
  doc.rect(barX, y, splitAt, 12, 'F');
  doc.setFillColor(...TEAL);
  doc.rect(barX + splitAt, y, barW - splitAt, 12, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text('GRAND TOTAL :', barX + 6, y + 8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Rs ${bill.finalTotal.toLocaleString()}`, pw - m - 4, y + 8, { align: 'right' });

  // ── TERMS & PAYMENT ──
  const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
  const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
  const showTerms = bill.showTerms ?? settings.showTerms;
  const terms = bill.termsConditions ?? settings.termsConditions;

  if (showTerms || showPayment) {
    y += 22;
    const colW = (pw - m * 2 - 10) / 2;

    if (showTerms && terms && terms.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEAL);
      doc.text('TERMS & CONDITIONS', m, y);
      // Gold underline
      doc.setFillColor(...GOLD);
      doc.rect(m, y + 1.5, 45, 0.8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      let ty = y + 7;
      terms.forEach(t => {
        doc.text(`• ${t}`, m + 2, ty);
        ty += 4.5;
      });
    }

    if (showPayment && paymentInfo) {
      const px = showTerms ? m + colW + 10 : m;
      let py = y;

      doc.setDrawColor(...TEAL);
      doc.setLineWidth(0.5);
      doc.rect(px, py - 4, colW, 40, 'S');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEAL);
      doc.text('PAYMENT INFORMATION', px + 4, py);
      doc.setFillColor(...GOLD);
      doc.rect(px + 4, py + 1.5, 50, 0.8, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      let pl = py + 7;
      const addLine = (label: string, val: string) => {
        if (val) { doc.text(`• ${label}: ${val}`, px + 6, pl); pl += 4.5; }
      };
      addLine('Bank Name', paymentInfo.bankName);
      addLine('Account Name', paymentInfo.accountTitle);
      addLine('Account No', paymentInfo.accountNumber);
      addLine('IBAN', paymentInfo.iban);
      addLine('EasyPaisa', paymentInfo.easypaisaNumber);
      addLine('JazzCash', paymentInfo.jazzcashNumber);
    }
  }

  // ── FOOTER ──
  const fy = ph - 28;
  const thirdW = pw / 3;

  // Icon row
  doc.setFillColor(...RED);
  doc.rect(0, fy, thirdW, 8, 'F');
  doc.setFillColor(...TEAL);
  doc.rect(thirdW, fy, thirdW, 8, 'F');
  doc.setFillColor(...RED);
  doc.rect(thirdW * 2, fy, thirdW, 8, 'F');

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('📍', thirdW * 0.5, fy + 6, { align: 'center' });
  doc.text('📞', thirdW * 1.5, fy + 6, { align: 'center' });
  doc.text('🌐', thirdW * 2.5, fy + 6, { align: 'center' });

  // Info row
  doc.setFillColor(...TEAL_DARK);
  doc.rect(0, fy + 8, pw, 20, 'F');
  doc.setFontSize(7);
  doc.setTextColor(200, 230, 230);
  doc.setFont('helvetica', 'normal');

  doc.text(settings.address || 'Shop Address', thirdW * 0.5, fy + 16, { align: 'center', maxWidth: thirdW - 10 });

  const phones = [settings.phone1, settings.phone2].filter(Boolean).join('\n');
  doc.text(phones, thirdW * 1.5, fy + 15, { align: 'center' });

  doc.text(settings.socialMedia || settings.website || 'Social Media', thirdW * 2.5, fy + 16, { align: 'center', maxWidth: thirdW - 10 });

  return doc;
}
