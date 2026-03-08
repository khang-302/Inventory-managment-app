import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

// Color palette: Yellow / Orange / Gray / Black / White
const DARK: [number, number, number] = [26, 26, 26];
const ORANGE: [number, number, number] = [232, 130, 12];
const YELLOW: [number, number, number] = [245, 166, 35];
const WHITE: [number, number, number] = [255, 255, 255];
const ACCENT_BG: [number, number, number] = [255, 248, 237];
const MED_GRAY: [number, number, number] = [85, 85, 85];

function parseLogoDataUrl(dataUrl: string): { data: string; format: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/);
  if (!match) return null;
  const format = match[1].toUpperCase() === 'JPG' ? 'JPEG' : match[1].toUpperCase();
  return { data: dataUrl, format };
}

// Draw simple geometric icons instead of emoji/font icons
function drawLocationIcon(doc: jsPDF, cx: number, cy: number) {
  // Pin shape: triangle + circle
  doc.setFillColor(...WHITE);
  // Circle head
  doc.circle(cx, cy - 1.5, 2.5, 'F');
  // Inner dot
  doc.setFillColor(...ORANGE);
  doc.circle(cx, cy - 1.5, 1, 'F');
  // Triangle point
  doc.setFillColor(...WHITE);
  doc.triangle(cx - 2, cy - 0.5, cx + 2, cy - 0.5, cx, cy + 3.5, 'F');
}

function drawPhoneIcon(doc: jsPDF, cx: number, cy: number) {
  // Simple phone rectangle
  doc.setFillColor(...WHITE);
  doc.roundedRect(cx - 2, cy - 3, 4, 6, 0.8, 0.8, 'F');
  // Screen
  doc.setFillColor(...ORANGE);
  doc.rect(cx - 1.3, cy - 2, 2.6, 3.5, 'F');
  // Home button dot
  doc.setFillColor(...WHITE);
  doc.circle(cx, cy + 2, 0.4, 'F');
}

function drawGlobeIcon(doc: jsPDF, cx: number, cy: number) {
  // Circle outline
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.6);
  doc.setFillColor(...ORANGE);
  doc.circle(cx, cy, 3, 'FD');
  // Horizontal lines
  doc.setLineWidth(0.3);
  doc.line(cx - 3, cy, cx + 3, cy);
  doc.line(cx - 2.2, cy - 1.5, cx + 2.2, cy - 1.5);
  doc.line(cx - 2.2, cy + 1.5, cx + 2.2, cy + 1.5);
  // Vertical ellipse
  doc.setFillColor(...ORANGE);
  doc.ellipse(cx, cy, 1.5, 3, 'S');
}

export function generateBillPdf(
  settings: BillSettings,
  bill: Bill,
  items: BillItem[],
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const mx = 15;
  let y = 0;

  const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════
  // HEADER — dark background with logo + shop name
  // ═══════════════════════════════════════
  const headerH = 38;
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pw, headerH, 'F');

  // Logo circle
  const logoD = 24;
  const logoR = logoD / 2;
  const logoX = mx + logoR + 2;
  const logoY = headerH / 2;
  let logoRendered = false;

  // White circle background for logo
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...YELLOW);
  doc.setLineWidth(1);
  doc.circle(logoX, logoY, logoR, 'FD');

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
    // Orange circle with initials
    doc.setFillColor(...ORANGE);
    doc.circle(logoX, logoY, logoR - 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(initials, logoX, logoY + 1.5, { align: 'center' });
  }

  // Shop name
  const textX = logoX + logoR + 8;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(settings.shopName, textX, headerH / 2 - 1);

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...YELLOW);
    doc.text(settings.tagline, textX, headerH / 2 + 7);
  }

  y = headerH;

  // ═══════════════════════════════════════
  // ORANGE "INVOICE FROM" BANNER
  // ═══════════════════════════════════════
  const bannerH = 9;
  doc.setFillColor(...ORANGE);
  doc.rect(0, y, pw, bannerH, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...WHITE);
  doc.text('Invoice From :', mx, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName.toUpperCase(), mx + 28, y + 6);
  y += bannerH;

  // ═══════════════════════════════════════
  // INVOICE BODY
  // ═══════════════════════════════════════
  y += 5;
  const bodyMx = mx;
  const blockW = pw - bodyMx * 2;

  // ── Invoice To Block ──
  const blockHeaderH = 9;
  const blockTopY = y;

  // Dark header bar
  doc.setFillColor(...DARK);
  doc.rect(bodyMx, y, blockW, blockHeaderH, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('Invoice To :', bodyMx + 5, y + 6.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('Invoice No :', pw - bodyMx - 50, y + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...YELLOW);
  doc.text(bill.billNumber, pw - bodyMx - 5, y + 6.5, { align: 'right' });
  y += blockHeaderH;

  // Body area with warm bg
  const bodyBoxH = 18;
  doc.setFillColor(...ACCENT_BG);
  doc.rect(bodyMx, y, blockW, bodyBoxH, 'F');
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.4);
  doc.rect(bodyMx, blockTopY, blockW, blockHeaderH + bodyBoxH, 'S');

  // Buyer name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(bill.buyerName.toUpperCase(), bodyMx + 5, y + 7);

  // Buyer phone
  if (bill.buyerPhone) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MED_GRAY);
    doc.text(`Phone: ${bill.buyerPhone}`, bodyMx + 5, y + 13);
  }

  // Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MED_GRAY);
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
      fontSize: 9.5,
      cellPadding: 3.5,
      textColor: [34, 34, 34],
      lineColor: [221, 221, 221],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: DARK,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9.5,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
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
    tableLineColor: [221, 221, 221],
    tableLineWidth: 0.2,
  });

  // ═══════════════════════════════════════
  // TOTALS
  // ═══════════════════════════════════════
  y = (doc as any).lastAutoTable.finalY + 5;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MED_GRAY);
  doc.text('Subtotal :', pw - bodyMx - 55, y + 4);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(`Rs ${bill.subtotal.toLocaleString()}`, pw - bodyMx, y + 4, { align: 'right' });

  y += 9;
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.3);
  doc.line(pw - bodyMx - 80, y, pw - bodyMx, y);

  // Discount
  if (bill.discount > 0) {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MED_GRAY);
    doc.text('Discount :', pw - bodyMx - 55, y + 4);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(`${bill.discount.toLocaleString()}`, pw - bodyMx, y + 4, { align: 'right' });
    y += 9;
  }

  // ═══════════════════════════════════════
  // GRAND TOTAL BAR — yellow left, dark right
  // ═══════════════════════════════════════
  y += 4;
  const gtBarH = 14;
  const gtRightW = 110;
  const gtLeftW = pw - gtRightW;

  doc.setFillColor(...YELLOW);
  doc.rect(0, y, gtLeftW, gtBarH, 'F');

  doc.setFillColor(...DARK);
  doc.rect(gtLeftW, y, gtRightW, gtBarH, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...YELLOW);
  doc.text('GRAND TOTAL :', gtLeftW + 5, y + gtBarH / 2 + 1.5);

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
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
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text('TERMS & CONDITIONS', sectionMx, y + 4);

      // Orange underline
      const titleW = doc.getTextWidth('TERMS & CONDITIONS');
      doc.setDrawColor(...ORANGE);
      doc.setLineWidth(0.8);
      doc.line(sectionMx, y + 6, sectionMx + titleW, y + 6);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      let ty = y + 13;
      terms.forEach(t => {
        if (ty < ph - 55) {
          const lines = doc.splitTextToSize(`• ${t}`, colW - 4);
          doc.text(lines, sectionMx + 2, ty);
          ty += lines.length * 4.5;
        }
      });
    }

    // Payment Information (right)
    if (showPayment && paymentInfo) {
      const px = showTerms ? sectionMx + colW + 8 : sectionMx;
      const py = y;

      const paymentLines: string[] = [];
      if (paymentInfo.bankName) paymentLines.push(`• Bank Name: ${paymentInfo.bankName}`);
      if (paymentInfo.accountTitle) paymentLines.push(`• Account Name: ${paymentInfo.accountTitle}`);
      if (paymentInfo.accountNumber) paymentLines.push(`• Account No: ${paymentInfo.accountNumber}`);
      if (paymentInfo.iban) paymentLines.push(`• IBAN: ${paymentInfo.iban}`);
      if (paymentInfo.easypaisaNumber) paymentLines.push(`• EasyPaisa: ${paymentInfo.easypaisaNumber}`);
      if (paymentInfo.jazzcashNumber) paymentLines.push(`• JazzCash: ${paymentInfo.jazzcashNumber}`);

      const boxH = 12 + paymentLines.length * 5 + 6;

      // Dashed orange border
      doc.setDrawColor(...ORANGE);
      doc.setLineWidth(0.6);
      doc.setLineDashPattern([2, 2], 0);
      doc.roundedRect(px, py - 2, colW, boxH, 2, 2, 'S');
      doc.setLineDashPattern([], 0);

      // Warm background
      doc.setFillColor(...ACCENT_BG);
      doc.roundedRect(px + 0.3, py - 1.7, colW - 0.6, boxH - 0.6, 1.5, 1.5, 'F');

      // Re-draw border on top
      doc.setDrawColor(...ORANGE);
      doc.setLineDashPattern([2, 2], 0);
      doc.roundedRect(px, py - 2, colW, boxH, 2, 2, 'S');
      doc.setLineDashPattern([], 0);

      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text('PAYMENT INFORMATION', px + 5, py + 6);

      // Lines
      doc.setFontSize(8.5);
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
  // FOOTER — dark bar with geometric icons
  // ═══════════════════════════════════════
  const footerH = 30;
  const fy = ph - footerH;
  const thirdW = pw / 3;

  doc.setFillColor(...DARK);
  doc.rect(0, fy, pw, footerH, 'F');

  // Orange pill dimensions
  const pillW = 18;
  const pillH = 10;
  const pillR = 5;
  const pillY = fy + 3;

  const drawPill = (cx: number) => {
    doc.setFillColor(...ORANGE);
    doc.roundedRect(cx - pillW / 2, pillY, pillW, pillH, pillR, pillR, 'F');
  };

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);

  // Column 1: Location
  const col1X = thirdW * 0.5;
  drawPill(col1X);
  drawLocationIcon(doc, col1X, pillY + pillH / 2);
  const addr = settings.address || 'Shop Address';
  const addrLines = doc.splitTextToSize(addr, thirdW - 12);
  doc.text(addrLines, col1X, fy + 17, { align: 'center' });

  // Column 2: Phone
  const col2X = thirdW * 1.5;
  drawPill(col2X);
  drawPhoneIcon(doc, col2X, pillY + pillH / 2);
  const phoneLines: string[] = [];
  if (settings.phone1) phoneLines.push(settings.phone1);
  if (settings.phone2) phoneLines.push(settings.phone2);
  if (phoneLines.length === 0) phoneLines.push('Contact');
  doc.text(phoneLines, col2X, fy + 17, { align: 'center' });

  // Column 3: Social / Website
  const col3X = thirdW * 2.5;
  drawPill(col3X);
  drawGlobeIcon(doc, col3X, pillY + pillH / 2);
  const socialText = settings.socialMedia || settings.website || 'Website Coming Soon';
  const socialLines = doc.splitTextToSize(socialText, thirdW - 12);
  doc.text(socialLines, col3X, fy + 17, { align: 'center' });

  return doc;
}
