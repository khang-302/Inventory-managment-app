import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

// Exact colors from reference: #1B3D3D, #C9A020, #CC2E2E
const TEAL: [number, number, number] = [27, 61, 61];
const TEAL_INNER: [number, number, number] = [20, 46, 46];
const GOLD: [number, number, number] = [201, 160, 32];
const RED_PILL: [number, number, number] = [204, 46, 46];

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
  const pw = doc.internal.pageSize.getWidth(); // 210
  const ph = doc.internal.pageSize.getHeight(); // 297
  const mx = 15; // horizontal margin for body content
  let y = 0;

  const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════
  // HEADER BANNER — tall teal bar with logo + shop name
  // ═══════════════════════════════════════
  const headerH = 38;
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pw, headerH, 'F');

  // Logo circle (centered vertically in header)
  const logoD = 24; // diameter in mm (~90px at 96dpi ≈ 24mm)
  const logoR = logoD / 2;
  const logoX = mx + logoR + 2;
  const logoY = headerH / 2;
  let logoRendered = false;

  if (settings.logoPath) {
    const parsed = parseLogoDataUrl(settings.logoPath);
    if (parsed) {
      try {
        // Outer gold ring
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(1.2);
        doc.setFillColor(...TEAL);
        doc.circle(logoX, logoY, logoR, 'FD');
        // Inner gold ring
        doc.setLineWidth(0.8);
        doc.circle(logoX, logoY, logoR - 2, 'S');
        // Clip-like: draw image inside
        const imgSize = (logoR - 2) * 1.8;
        doc.addImage(parsed.data, parsed.format, logoX - imgSize / 2, logoY - imgSize / 2, imgSize, imgSize);
        logoRendered = true;
      } catch (e) {
        console.warn('PDF logo rendering failed:', e);
      }
    }
  }

  if (!logoRendered) {
    // Outer gold ring
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1.2);
    doc.setFillColor(...TEAL);
    doc.circle(logoX, logoY, logoR, 'FD');
    // Inner circle
    doc.setLineWidth(0.8);
    doc.setFillColor(...TEAL_INNER);
    doc.circle(logoX, logoY, logoR - 2, 'FD');
    // Initials
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GOLD);
    doc.text(initials, logoX, logoY + 1, { align: 'center' });
    // Small bottom text
    doc.setFontSize(4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('⚙ AUTO PARTS ⚙', logoX, logoY + 5, { align: 'center' });
  }

  // Shop name — large bold
  const textX = logoX + logoR + 8;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(settings.shopName, textX, headerH / 2 - 2);

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(208, 208, 208);
    doc.text(settings.tagline, textX, headerH / 2 + 6);
  }

  y = headerH;

  // ═══════════════════════════════════════
  // GOLD "INVOICE FROM" BANNER
  // ═══════════════════════════════════════
  const bannerH = 10;
  doc.setFillColor(...GOLD);
  doc.rect(0, y, pw, bannerH, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEAL);
  doc.text('Invoice From :', mx, y + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName.toUpperCase(), mx + 30, y + 6.5);
  y += bannerH;

  // ═══════════════════════════════════════
  // INVOICE BODY — padded area
  // ═══════════════════════════════════════
  const bodyMx = mx; // body margin matches
  y += 5;

  // ── Invoice To Block ──
  const blockW = pw - bodyMx * 2;
  const blockHeaderH = 10;

  // Border around entire block
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.4);
  const blockTopY = y;

  // Teal header bar
  doc.setFillColor(...TEAL);
  doc.rect(bodyMx, y, blockW, blockHeaderH, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Invoice To :', bodyMx + 5, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice No :', pw - bodyMx - 52, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.billNumber, pw - bodyMx - 5, y + 7, { align: 'right' });
  y += blockHeaderH;

  // Body area with border
  const bodyBoxH = 18;
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.4);
  doc.rect(bodyMx, y, blockW, bodyBoxH, 'S');
  // Also draw top border to close the block
  doc.rect(bodyMx, blockTopY, blockW, blockHeaderH + bodyBoxH, 'S');

  // Buyer name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(bill.buyerName.toUpperCase(), bodyMx + 5, y + 7);

  // Buyer phone
  if (bill.buyerPhone) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`Phone: ${bill.buyerPhone}`, bodyMx + 5, y + 13);
  }

  // Date right
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`Date : ${new Date(bill.date).toLocaleDateString('en-PK')}`, pw - bodyMx - 5, y + 7, { align: 'right' });

  y += bodyBoxH + 5;

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
    margin: { left: bodyMx, right: bodyMx },
    styles: {
      fontSize: 10,
      cellPadding: 3.5,
      textColor: [34, 34, 34],
      lineColor: [221, 221, 221],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 42 },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 30 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 26 },
      6: { halign: 'center', cellWidth: 26 },
    },
    theme: 'grid',
    tableLineColor: [221, 221, 221],
    tableLineWidth: 0.2,
  });

  // ═══════════════════════════════════════
  // TOTALS (right-aligned)
  // ═══════════════════════════════════════
  y = (doc as any).lastAutoTable.finalY + 4;

  // Subtotal row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('Subtotal :', pw - bodyMx - 55, y + 4);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(`Rs ${bill.subtotal.toLocaleString()}`, pw - bodyMx, y + 4, { align: 'right' });

  // Divider line
  y += 9;
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.3);
  doc.line(pw - bodyMx - 80, y, pw - bodyMx, y);

  // Discount row
  if (bill.discount > 0) {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('Discount', pw - bodyMx - 55, y + 4);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(`${bill.discount.toLocaleString()}`, pw - bodyMx, y + 4, { align: 'right' });
    y += 9;
  }

  // ═══════════════════════════════════════
  // GRAND TOTAL BAR — gold left, teal right
  // ═══════════════════════════════════════
  y += 4;
  const gtBarH = 16;
  const gtRightW = 110;
  const gtLeftW = pw - gtRightW;

  // Gold left section
  doc.setFillColor(...GOLD);
  doc.rect(0, y, gtLeftW, gtBarH, 'F');

  // Teal right section
  doc.setFillColor(...TEAL);
  doc.rect(gtLeftW, y, gtRightW, gtBarH, 'F');

  // Grand total text
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL :', gtLeftW + 5, y + gtBarH / 2 + 1.5);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs ${bill.finalTotal.toLocaleString()}`, pw - 8, y + gtBarH / 2 + 1.5, { align: 'right' });

  y += gtBarH;

  // ═══════════════════════════════════════
  // TERMS & PAYMENT SECTION
  // ═══════════════════════════════════════
  const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
  const paymentInfo = bill.paymentInfo ?? settings.paymentInfo;
  const showTerms = bill.showTerms ?? settings.showTerms;
  const terms = bill.termsConditions ?? settings.termsConditions;

  if (showTerms || showPayment) {
    y += 10;
    const sectionMx = mx + 2;
    const colW = (pw - sectionMx * 2 - 8) / 2;

    // Terms & Conditions (left)
    if (showTerms && terms && terms.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text('TERMS & CONDITIONS', sectionMx, y + 4);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      let ty = y + 12;
      terms.forEach(t => {
        if (ty < ph - 55) {
          const lines = doc.splitTextToSize(`• ${t}`, colW - 4);
          doc.text(lines, sectionMx + 2, ty);
          ty += lines.length * 4.5;
        }
      });
    }

    // Payment Information (right) — dashed border box
    if (showPayment && paymentInfo) {
      const px = showTerms ? sectionMx + colW + 8 : sectionMx;
      const py = y;

      // Calculate dynamic height
      const paymentLines: string[] = [];
      if (paymentInfo.bankName) paymentLines.push(`• Bank Name: ${paymentInfo.bankName}`);
      if (paymentInfo.accountTitle) paymentLines.push(`• Account Name: ${paymentInfo.accountTitle}`);
      if (paymentInfo.accountNumber) paymentLines.push(`• Account No: ${paymentInfo.accountNumber}`);
      if (paymentInfo.iban) paymentLines.push(`• IBAN: ${paymentInfo.iban}`);
      if (paymentInfo.easypaisaNumber) paymentLines.push(`• EasyPaisa: ${paymentInfo.easypaisaNumber}`);
      if (paymentInfo.jazzcashNumber) paymentLines.push(`• JazzCash: ${paymentInfo.jazzcashNumber}`);

      const boxH = 12 + paymentLines.length * 5 + 6;

      // Dashed border
      doc.setDrawColor(153, 153, 153);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2], 0);
      doc.roundedRect(px, py - 2, colW, boxH, 2, 2, 'S');
      doc.setLineDashPattern([], 0);

      // Title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text('PAYMENT INFORMATION', px + 5, py + 6);

      // Lines
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      let pl = py + 14;
      paymentLines.forEach(line => {
        doc.text(line, px + 7, pl);
        pl += 5;
      });
    }
  }

  // ═══════════════════════════════════════
  // FOOTER — teal bar with 3 red pill icon columns
  // ═══════════════════════════════════════
  const footerH = 30;
  const fy = ph - footerH;
  const thirdW = pw / 3;

  doc.setFillColor(...TEAL);
  doc.rect(0, fy, pw, footerH, 'F');

  // Red pill dimensions
  const pillW = 18;
  const pillH = 10;
  const pillR = 5;
  const pillY = fy + 4;

  // Helper: draw red pill with icon symbol
  const drawPill = (cx: number, icon: string) => {
    doc.setFillColor(...RED_PILL);
    doc.roundedRect(cx - pillW / 2, pillY, pillW, pillH, pillR, pillR, 'F');
    // Icon symbol in pill
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(icon, cx, pillY + pillH / 2 + 1, { align: 'center' });
  };

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);

  // Column 1: Location
  const col1X = thirdW * 0.5;
  drawPill(col1X, '📍');
  const addr = settings.address || 'Shop Address';
  const addrLines = doc.splitTextToSize(addr, thirdW - 12);
  doc.text(addrLines, col1X, fy + 18, { align: 'center' });

  // Column 2: Phone
  const col2X = thirdW * 1.5;
  drawPill(col2X, '📞');
  const phoneLines: string[] = [];
  if (settings.phone1) phoneLines.push(settings.phone1);
  if (settings.phone2) phoneLines.push(settings.phone2);
  if (phoneLines.length === 0) phoneLines.push('Contact');
  doc.text(phoneLines, col2X, fy + 18, { align: 'center' });

  // Column 3: Social / Website
  const col3X = thirdW * 2.5;
  drawPill(col3X, '🌐');
  const socialText = settings.socialMedia || settings.website || 'Website Coming Soon';
  const socialLines = doc.splitTextToSize(socialText, thirdW - 12);
  doc.text(socialLines, col3X, fy + 18, { align: 'center' });

  return doc;
}
