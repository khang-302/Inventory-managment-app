import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

/* ── Premium Color Palette (RGB tuples) ── */
const GOLD: [number, number, number] = [197, 162, 46];
const DARK_OLIVE: [number, number, number] = [61, 61, 27];
const CHARCOAL: [number, number, number] = [43, 43, 43];
const MED_GRAY: [number, number, number] = [136, 136, 136];
const LIGHT_GRAY: [number, number, number] = [224, 224, 224];
const FOOTER_BG: [number, number, number] = [245, 245, 245];
const FOOTER_TEXT: [number, number, number] = [153, 153, 153];
const WHITE: [number, number, number] = [255, 255, 255];
const WARM_BG: [number, number, number] = [250, 250, 247];
const ACCENT_BG: [number, number, number] = [251, 249, 243];

function parseLogoDataUrl(dataUrl: string): { data: string; format: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/);
  if (!match) return null;
  const format = match[1].toUpperCase() === 'JPG' ? 'JPEG' : match[1].toUpperCase();
  return { data: dataUrl, format };
}

export function generateBillPdf(
  settings: BillSettings,
  bill: Bill,
  items: BillItem[],
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const mx = 16;
  let y = 0;

  const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════
  // HEADER — White background with logo circle
  // ═══════════════════════════════════════
  const headerH = 34;
  y = 10;

  // Logo circle
  const logoR = 13;
  const logoX = mx + logoR + 2;
  const logoY = y + headerH / 2;

  // Gold border circle
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.setFillColor(...WHITE);
  doc.circle(logoX, logoY, logoR, 'FD');

  // Outer subtle ring
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.circle(logoX, logoY, logoR + 2, 'S');

  let logoRendered = false;
  if (settings.logoPath) {
    const parsed = parseLogoDataUrl(settings.logoPath);
    if (parsed) {
      try {
        const imgSize = (logoR - 1) * 1.8;
        doc.addImage(parsed.data, parsed.format, logoX - imgSize / 2, logoY - imgSize / 2, imgSize, imgSize);
        logoRendered = true;
      } catch (e) {
        console.warn('PDF logo rendering failed:', e);
      }
    }
  }

  if (!logoRendered) {
    doc.setFillColor(...DARK_OLIVE);
    doc.circle(logoX, logoY, logoR - 2, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(initials, logoX, logoY + 1.5, { align: 'center' });
  }

  // Shop name
  const textX = logoX + logoR + 8;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_OLIVE);
  doc.text(settings.shopName, textX, logoY - 1);

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MED_GRAY);
    doc.text(settings.tagline, textX, logoY + 6);
  }

  y += headerH;

  // Header bottom border
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.6);
  doc.line(mx, y, pw - mx, y);
  y += 1;

  // ═══════════════════════════════════════
  // "Invoice From" line
  // ═══════════════════════════════════════
  doc.setFillColor(...WARM_BG);
  doc.rect(0, y, pw, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MED_GRAY);
  doc.text('Invoice From :', mx, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_OLIVE);
  doc.text(settings.shopName.toUpperCase(), mx + 24, y + 5.5);

  // Bottom border
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(0, y + 8, pw, y + 8);
  y += 12;

  // ═══════════════════════════════════════
  // Invoice To Block
  // ═══════════════════════════════════════
  const blockW = pw - mx * 2;
  const blockTop = y;

  // Header row
  doc.setFillColor(...WARM_BG);
  doc.rect(mx, y, blockW, 8, 'F');
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.rect(mx, y, blockW, 8, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_OLIVE);
  doc.text('Invoice To :', mx + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MED_GRAY);
  doc.text('Invoice No :', pw - mx - 42, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text(bill.billNumber, pw - mx - 4, y + 5.5, { align: 'right' });
  y += 8;

  // Body row
  const bodyH = 16;
  doc.setFillColor(...WHITE);
  doc.rect(mx, y, blockW, bodyH, 'F');
  doc.setDrawColor(...LIGHT_GRAY);
  doc.rect(mx, blockTop, blockW, 8 + bodyH, 'S');

  // Buyer name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CHARCOAL);
  doc.text(bill.buyerName.toUpperCase(), mx + 4, y + 6);

  // Buyer phone
  if (bill.buyerPhone) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MED_GRAY);
    doc.text(`Phone: ${bill.buyerPhone}`, mx + 4, y + 11);
  }

  // Date
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MED_GRAY);
  doc.text(`Date : ${new Date(bill.date).toLocaleDateString('en-PK')}`, pw - mx - 4, y + 6, { align: 'right' });

  y += bodyH + 6;

  // ═══════════════════════════════════════
  // ITEMS TABLE
  // ═══════════════════════════════════════
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
    margin: { left: mx, right: mx },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [85, 85, 85],
      lineColor: LIGHT_GRAY,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: WHITE,
      textColor: MED_GRAY,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: ACCENT_BG,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 42 },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 28 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 26 },
      6: { halign: 'center', cellWidth: 28 },
    },
    theme: 'grid',
    tableLineColor: LIGHT_GRAY,
    tableLineWidth: 0.2,
  });

  // ═══════════════════════════════════════
  // TOTALS
  // ═══════════════════════════════════════
  y = (doc as any).lastAutoTable.finalY + 6;

  // Subtotal
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MED_GRAY);
  doc.text('Subtotal :', pw - mx - 50, y);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CHARCOAL);
  doc.text(`Rs ${bill.subtotal.toLocaleString()}`, pw - mx, y, { align: 'right' });

  y += 5;

  // Discount
  if (bill.discount > 0) {
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.3);
    doc.line(pw - mx - 70, y, pw - mx, y);
    y += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MED_GRAY);
    doc.text('Discount :', pw - mx - 50, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CHARCOAL);
    doc.text(`- Rs ${bill.discount.toLocaleString()}`, pw - mx, y, { align: 'right' });
    y += 5;
  }

  // Gold separator
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(pw - mx - 70, y, pw - mx, y);
  y += 5;

  // Grand total
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_OLIVE);
  doc.text('GRAND TOTAL :', pw - mx - 50, y);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_OLIVE);
  doc.text(`Rs ${bill.finalTotal.toLocaleString()}`, pw - mx, y, { align: 'right' });

  y += 10;

  // ═══════════════════════════════════════
  // TERMS & PAYMENT SECTION
  // ═══════════════════════════════════════
  const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
  const paymentInfoData = bill.paymentInfo ?? settings.paymentInfo;
  const showTerms = bill.showTerms ?? settings.showTerms;
  const termsData = bill.termsConditions ?? settings.termsConditions;

  if (showTerms || showPayment) {
    y += 4;
    const sectionMx = mx + 2;
    const colW = (pw - sectionMx * 2 - 8) / 2;

    // Terms & Conditions (left)
    if (showTerms && termsData && termsData.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_OLIVE);
      doc.text('TERMS & CONDITIONS', sectionMx, y + 4);

      // Gold underline
      const titleW = doc.getTextWidth('TERMS & CONDITIONS');
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.6);
      doc.line(sectionMx, y + 5.5, sectionMx + titleW, y + 5.5);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MED_GRAY);
      let ty = y + 11;
      termsData.forEach(t => {
        if (ty < ph - 45) {
          const lines = doc.splitTextToSize(`• ${t}`, colW - 4);
          doc.text(lines, sectionMx + 2, ty);
          ty += lines.length * 4;
        }
      });
    }

    // Payment Information (right)
    if (showPayment && paymentInfoData) {
      const px = showTerms ? sectionMx + colW + 8 : sectionMx;

      const paymentLines: string[] = [];
      if (paymentInfoData.bankName) paymentLines.push(`• Bank Name: ${paymentInfoData.bankName}`);
      if (paymentInfoData.accountTitle) paymentLines.push(`• Account Name: ${paymentInfoData.accountTitle}`);
      if (paymentInfoData.accountNumber) paymentLines.push(`• Account No: ${paymentInfoData.accountNumber}`);
      if (paymentInfoData.iban) paymentLines.push(`• IBAN: ${paymentInfoData.iban}`);
      if (paymentInfoData.easypaisaNumber) paymentLines.push(`• EasyPaisa: ${paymentInfoData.easypaisaNumber}`);
      if (paymentInfoData.jazzcashNumber) paymentLines.push(`• JazzCash: ${paymentInfoData.jazzcashNumber}`);

      const boxH = 10 + paymentLines.length * 4.5 + 4;

      // Dashed gold border
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2], 0);
      doc.roundedRect(px, y - 2, colW, boxH, 2, 2, 'S');
      doc.setLineDashPattern([], 0);

      // Warm background
      doc.setFillColor(...ACCENT_BG);
      doc.roundedRect(px + 0.3, y - 1.7, colW - 0.6, boxH - 0.6, 1.5, 1.5, 'F');

      // Re-draw border
      doc.setDrawColor(...GOLD);
      doc.setLineDashPattern([2, 2], 0);
      doc.roundedRect(px, y - 2, colW, boxH, 2, 2, 'S');
      doc.setLineDashPattern([], 0);

      // Title
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_OLIVE);
      doc.text('PAYMENT INFORMATION', px + 4, y + 5);

      // Lines
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(85, 85, 85);
      let pl = y + 11;
      paymentLines.forEach(line => {
        doc.text(line, px + 6, pl);
        pl += 4.5;
      });
    }
  }

  // ═══════════════════════════════════════
  // FOOTER — Light gray with plain text columns
  // ═══════════════════════════════════════
  const footerH = 22;
  const fy = ph - footerH;
  const thirdW = (pw - mx * 2) / 3;

  // Light gray background
  doc.setFillColor(...FOOTER_BG);
  doc.rect(0, fy, pw, footerH, 'F');

  // Top border
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(0, fy, pw, fy);

  // Column labels
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_OLIVE);

  const col1X = mx + thirdW * 0.5;
  const col2X = mx + thirdW * 1.5;
  const col3X = mx + thirdW * 2.5;

  doc.text('ADDRESS', col1X, fy + 5, { align: 'center' });
  doc.text('CONTACT', col2X, fy + 5, { align: 'center' });
  doc.text('SOCIAL', col3X, fy + 5, { align: 'center' });

  // Column separators
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(mx + thirdW, fy + 2, mx + thirdW, fy + footerH - 2);
  doc.line(mx + thirdW * 2, fy + 2, mx + thirdW * 2, fy + footerH - 2);

  // Column values
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...FOOTER_TEXT);

  // Address
  const addr = settings.address || 'Shop Address';
  const addrLines = doc.splitTextToSize(addr, thirdW - 8);
  doc.text(addrLines, col1X, fy + 10, { align: 'center' });

  // Phone
  const phoneLines: string[] = [];
  if (settings.phone1) phoneLines.push(settings.phone1);
  if (settings.phone2) phoneLines.push(settings.phone2);
  if (phoneLines.length === 0) phoneLines.push('Contact');
  doc.text(phoneLines, col2X, fy + 10, { align: 'center' });

  // Social
  const socialText = settings.socialMedia || settings.website || 'Website Coming Soon';
  const socialLines = doc.splitTextToSize(socialText, thirdW - 8);
  doc.text(socialLines, col3X, fy + 10, { align: 'center' });

  return doc;
}
