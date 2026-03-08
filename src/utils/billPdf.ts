import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

/* ── Premium Color Palette (RGB tuples) ── */
const TEAL: [number, number, number] = [27, 77, 77];
const GOLD: [number, number, number] = [201, 160, 32];
const RED_ICON: [number, number, number] = [204, 51, 51];
const WHITE: [number, number, number] = [255, 255, 255];
const CHARCOAL: [number, number, number] = [43, 43, 43];
const MED_GRAY: [number, number, number] = [136, 136, 136];
const LIGHT_GRAY: [number, number, number] = [240, 240, 240];
const BODY_TEXT: [number, number, number] = [85, 85, 85];

function parseLogoDataUrl(dataUrl: string): { data: string; format: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/);
  if (!match) return null;
  const format = match[1].toUpperCase() === 'JPG' ? 'JPEG' : match[1].toUpperCase();
  return { data: dataUrl, format };
}

/* ── Draw geometric icons using jsPDF primitives ── */
function drawLocationIcon(doc: jsPDF, cx: number, cy: number, r: number) {
  // Red circle background
  doc.setFillColor(...RED_ICON);
  doc.circle(cx, cy, r, 'F');
  // White pin: triangle + small circle
  doc.setFillColor(...WHITE);
  const s = r * 0.45;
  // Pin body (triangle pointing down)
  doc.triangle(cx - s * 0.6, cy - s * 0.3, cx + s * 0.6, cy - s * 0.3, cx, cy + s * 1.1, 'F');
  // Pin head (circle on top)
  doc.circle(cx, cy - s * 0.3, s * 0.55, 'F');
  // Inner dot (red)
  doc.setFillColor(...RED_ICON);
  doc.circle(cx, cy - s * 0.3, s * 0.22, 'F');
}

function drawPhoneIcon(doc: jsPDF, cx: number, cy: number, r: number) {
  // Red circle background
  doc.setFillColor(...RED_ICON);
  doc.circle(cx, cy, r, 'F');
  // White phone rectangle
  doc.setFillColor(...WHITE);
  const w = r * 0.5;
  const h = r * 0.9;
  doc.roundedRect(cx - w / 2, cy - h / 2, w, h, 1, 1, 'F');
  // Screen (red inner)
  doc.setFillColor(...RED_ICON);
  doc.rect(cx - w / 2 + 0.8, cy - h / 2 + 1.5, w - 1.6, h - 3.5, 'F');
}

function drawGlobeIcon(doc: jsPDF, cx: number, cy: number, r: number) {
  // Red circle background
  doc.setFillColor(...RED_ICON);
  doc.circle(cx, cy, r, 'F');
  // White globe outline
  const gr = r * 0.55;
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.5);
  doc.circle(cx, cy, gr, 'S');
  // Horizontal line
  doc.line(cx - gr, cy, cx + gr, cy);
  // Vertical ellipse approximation
  doc.line(cx, cy - gr, cx, cy + gr);
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
  // HEADER — Dark Teal background
  // ═══════════════════════════════════════
  const headerH = 32;
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pw, headerH, 'F');

  const logoR = 11;
  const logoX = mx + logoR + 4;
  const logoY = headerH / 2;

  // White circle for logo
  doc.setFillColor(...WHITE);
  doc.circle(logoX, logoY, logoR, 'F');
  // Gold border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.circle(logoX, logoY, logoR, 'S');
  // Outer subtle gold ring
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
    doc.setFillColor(...TEAL);
    doc.circle(logoX, logoY, logoR - 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(initials, logoX, logoY + 1.5, { align: 'center' });
  }

  // Shop name (white on teal)
  const textX = logoX + logoR + 8;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(settings.shopName, textX, logoY - 1);

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(settings.tagline, textX, logoY + 6);
  }

  y = headerH;

  // ═══════════════════════════════════════
  // Gold Accent Bar
  // ═══════════════════════════════════════
  doc.setFillColor(...GOLD);
  doc.rect(0, y, pw, 3, 'F');
  y += 3;

  // ═══════════════════════════════════════
  // "Invoice From" line
  // ═══════════════════════════════════════
  y += 1;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MED_GRAY);
  doc.text('Invoice From :', mx, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CHARCOAL);
  doc.text(settings.shopName.toUpperCase(), mx + 24, y + 5);

  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(mx, y + 8, pw - mx, y + 8);
  y += 12;

  // ═══════════════════════════════════════
  // Invoice To Block
  // ═══════════════════════════════════════
  const blockW = pw - mx * 2;

  // Teal header row
  doc.setFillColor(...TEAL);
  doc.rect(mx, y, blockW, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('Invoice To :', mx + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Invoice No :', pw - mx - 42, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text(bill.billNumber, pw - mx - 4, y + 5.5, { align: 'right' });
  y += 8;

  // Body row
  const bodyH = 16;
  doc.setFillColor(...WHITE);
  doc.rect(mx, y, blockW, bodyH, 'F');
  doc.setDrawColor(208, 208, 208);
  doc.setLineWidth(0.3);
  doc.rect(mx, y - 8, blockW, 8 + bodyH, 'S');

  // Buyer name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CHARCOAL);
  doc.text(bill.buyerName.toUpperCase(), mx + 4, y + 6);

  if (bill.buyerPhone) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MED_GRAY);
    doc.text(`Phone: ${bill.buyerPhone}`, mx + 4, y + 11);
  }

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
      textColor: BODY_TEXT,
      lineColor: [224, 224, 224],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
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
    tableLineColor: [224, 224, 224],
    tableLineWidth: 0.2,
  });

  y = (doc as any).lastAutoTable.finalY;

  // ═══════════════════════════════════════
  // GRAND TOTAL BAR (split gold/teal)
  // ═══════════════════════════════════════
  const barH = 10;
  const goldW = pw * 0.6;
  const tealW = pw - goldW;

  // Gold left half
  doc.setFillColor(...GOLD);
  doc.rect(mx, y, goldW - mx, barH, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('GRAND TOTAL', mx + 4, y + barH / 2 + 1);

  if (bill.discount > 0) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const discText = `(Subtotal: Rs ${bill.subtotal.toLocaleString()} | Discount: Rs ${bill.discount.toLocaleString()})`;
    doc.text(discText, mx + 34, y + barH / 2 + 1);
  }

  // Teal right half
  doc.setFillColor(...TEAL);
  doc.rect(goldW, y, tealW, barH, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(`Rs ${bill.finalTotal.toLocaleString()}`, pw - mx - 4, y + barH / 2 + 1.5, { align: 'right' });

  y += barH + 8;

  // ═══════════════════════════════════════
  // TERMS & PAYMENT SECTION
  // ═══════════════════════════════════════
  const showPayment = bill.showPaymentInfo ?? settings.showPaymentInfo;
  const paymentInfoData = bill.paymentInfo ?? settings.paymentInfo;
  const showTerms = bill.showTerms ?? settings.showTerms;
  const termsData = bill.termsConditions ?? settings.termsConditions;

  if (showTerms || showPayment) {
    const sectionMx = mx + 2;
    const colW = (pw - sectionMx * 2 - 8) / 2;

    // Terms & Conditions (left)
    if (showTerms && termsData && termsData.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEAL);
      doc.text('TERMS & CONDITIONS', sectionMx, y + 4);

      const titleW = doc.getTextWidth('TERMS & CONDITIONS');
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.6);
      doc.line(sectionMx, y + 5.5, sectionMx + titleW, y + 5.5);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BODY_TEXT);
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

      // Warm background
      doc.setFillColor(255, 253, 245);
      doc.roundedRect(px + 0.3, y - 1.7, colW - 0.6, boxH - 0.6, 1.5, 1.5, 'F');

      // Dashed gold border
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2], 0);
      doc.roundedRect(px, y - 2, colW, boxH, 2, 2, 'S');
      doc.setLineDashPattern([], 0);

      // Title
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEAL);
      doc.text('PAYMENT INFORMATION', px + 4, y + 5);

      // Lines
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BODY_TEXT);
      let pl = y + 11;
      paymentLines.forEach(line => {
        doc.text(line, px + 6, pl);
        pl += 4.5;
      });
    }
  }

  // ═══════════════════════════════════════
  // FOOTER — Dark teal with icon circles
  // ═══════════════════════════════════════
  const footerH = 26;
  const fy = ph - footerH;
  const thirdW = (pw - mx * 2) / 3;

  // Teal background
  doc.setFillColor(...TEAL);
  doc.rect(0, fy, pw, footerH, 'F');

  const iconR = 4.5;
  const col1X = mx + thirdW * 0.5;
  const col2X = mx + thirdW * 1.5;
  const col3X = mx + thirdW * 2.5;
  const iconY = fy + 7;

  // Draw icons
  drawLocationIcon(doc, col1X, iconY, iconR);
  drawPhoneIcon(doc, col2X, iconY, iconR);
  drawGlobeIcon(doc, col3X, iconY, iconR);

  // Column separators
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.15);
  doc.line(mx + thirdW, fy + 2, mx + thirdW, fy + footerH - 2);
  doc.line(mx + thirdW * 2, fy + 2, mx + thirdW * 2, fy + footerH - 2);

  // Text below icons
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);

  // Address
  const addr = settings.address || 'Shop Address';
  const addrLines = doc.splitTextToSize(addr, thirdW - 8);
  doc.text(addrLines, col1X, iconY + iconR + 4, { align: 'center' });

  // Phone
  const phoneLines: string[] = [];
  if (settings.phone1) phoneLines.push(settings.phone1);
  if (settings.phone2) phoneLines.push(settings.phone2);
  if (phoneLines.length === 0) phoneLines.push('Contact');
  doc.text(phoneLines, col2X, iconY + iconR + 4, { align: 'center' });

  // Social
  const socialText = settings.socialMedia || settings.website || 'Website Coming Soon';
  const socialLines = doc.splitTextToSize(socialText, thirdW - 8);
  doc.text(socialLines, col3X, iconY + iconR + 4, { align: 'center' });

  return doc;
}
