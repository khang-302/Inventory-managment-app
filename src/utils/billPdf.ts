import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem, WatermarkStyle } from '@/types/bill';

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

/* ── Dynamic font size for shop name in PDF ── */
function getShopNamePdfSize(name: string): number {
  if (name.length <= 16) return 20;
  if (name.length <= 24) return 16;
  return 13;
}

/* ── Draw watermark pattern on PDF ── */
function drawWatermark(doc: jsPDF, settings: BillSettings) {
  if (!settings.watermarkEnabled) return;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const style = (settings.watermarkStyle || 'text') as WatermarkStyle;
  const opacity = settings.watermarkOpacity;
  const gray = Math.round(255 - (255 * opacity * 3));

  switch (style) {
    case 'text': {
      const text = (settings.watermarkText || settings.shopName).toUpperCase();
      doc.setTextColor(gray, gray, gray);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 3; col++) {
          const x = 20 + col * (pw / 3);
          const y = 80 + row * 100;
          if (y < ph - 40) doc.text(text, x, y, { angle: 30 });
        }
      }
      doc.setTextColor(0, 0, 0);
      break;
    }
    case 'logo': {
      const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      doc.setTextColor(gray, gray, gray);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          const x = 30 + col * (pw / 3);
          const y = 80 + row * 140;
          if (y < ph - 40) doc.text(initials, x, y, { angle: 15 });
        }
      }
      doc.setTextColor(0, 0, 0);
      break;
    }
    case 'border-frame': {
      const GOLD_RGB: [number, number, number] = [201, 160, 32];
      const frameGray = Math.round(255 - (255 - GOLD_RGB[0]) * opacity * 4);
      const frameG = Math.round(255 - (255 - GOLD_RGB[1]) * opacity * 4);
      const frameB = Math.round(255 - (255 - GOLD_RGB[2]) * opacity * 4);
      doc.setDrawColor(frameGray, frameG, frameB);
      doc.setLineWidth(0.8);
      // Outer double border
      doc.rect(6, 6, pw - 12, ph - 12, 'S');
      doc.setLineWidth(0.3);
      doc.rect(10, 10, pw - 20, ph - 20, 'S');
      // Corner ornaments
      const cLen = 8;
      doc.setLineWidth(0.6);
      [[10, 10, 1, 1], [pw - 10, 10, -1, 1], [10, ph - 10, 1, -1], [pw - 10, ph - 10, -1, -1]].forEach(([cx, cy, dx, dy]) => {
        doc.line(cx, cy, cx + cLen * dx, cy);
        doc.line(cx, cy, cx, cy + cLen * dy);
      });
      break;
    }
    case 'diagonal-lines': {
      const lineGold = Math.round(255 - (255 - 201) * opacity * 3);
      const lineG = Math.round(255 - (255 - 160) * opacity * 3);
      const lineB = Math.round(255 - (255 - 32) * opacity * 3);
      doc.setDrawColor(lineGold, lineG, lineB);
      doc.setLineWidth(0.3);
      for (let i = 0; i < 30; i++) {
        const x1 = i * 15 - 100;
        const y1 = 0;
        const x2 = x1 + ph * 0.7;
        const y2 = ph;
        doc.line(x1, y1, x2, y2);
      }
      break;
    }
  }
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
  // HEADER — Premium Side-by-Side with Decorative Border
  // ═══════════════════════════════════════
  const headerH = 38;

  // Top gold ornamental line (gradient approximation)
  doc.setFillColor(...GOLD);
  doc.rect(pw * 0.15, 0, pw * 0.7, 1, 'F');

  // Teal background
  doc.setFillColor(...TEAL);
  doc.rect(0, 1, pw, headerH, 'F');

  // Bottom gold ornamental line
  doc.setFillColor(...GOLD);
  doc.rect(pw * 0.15, headerH + 1, pw * 0.7, 1, 'F');

  const logoR = 13;
  const logoX = mx + logoR + 6;
  const logoY = 1 + headerH / 2;

  // Outer decorative ring
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.circle(logoX, logoY, logoR + 2, 'S');

  // Corner accents (small L-shapes)
  const cLen = 4;
  const cOff = logoR + 4;
  doc.setLineWidth(0.6);
  // Top-left
  doc.line(logoX - cOff, logoY - cOff, logoX - cOff + cLen, logoY - cOff);
  doc.line(logoX - cOff, logoY - cOff, logoX - cOff, logoY - cOff + cLen);
  // Top-right
  doc.line(logoX + cOff, logoY - cOff, logoX + cOff - cLen, logoY - cOff);
  doc.line(logoX + cOff, logoY - cOff, logoX + cOff, logoY - cOff + cLen);
  // Bottom-left
  doc.line(logoX - cOff, logoY + cOff, logoX - cOff + cLen, logoY + cOff);
  doc.line(logoX - cOff, logoY + cOff, logoX - cOff, logoY + cOff - cLen);
  // Bottom-right
  doc.line(logoX + cOff, logoY + cOff, logoX + cOff - cLen, logoY + cOff);
  doc.line(logoX + cOff, logoY + cOff, logoX + cOff, logoY + cOff - cLen);

  // Inner badge circle - white fill + gold border
  doc.setFillColor(...WHITE);
  doc.circle(logoX, logoY, logoR, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.circle(logoX, logoY, logoR, 'S');

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
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(initials, logoX, logoY + 2, { align: 'center' });
  }

  // Vertical gold divider
  const divX = logoX + logoR + 8;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(divX, logoY - logoR + 2, divX, logoY + logoR - 2);

  // Shop name with dynamic sizing
  const textX = divX + 6;
  doc.setFontSize(getShopNamePdfSize(settings.shopName));
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  const shopNameLines = doc.splitTextToSize(settings.shopName.toUpperCase(), pw - textX - mx - 10);
  doc.text(shopNameLines, textX, logoY - (shopNameLines.length > 1 ? 5 : 3));

  // Gold ornamental divider under name (line + diamond + line)
  const ornY = logoY + 2;
  const ornStartX = textX;
  const ornEndX = pw - mx - 10;
  const ornMidX = (ornStartX + ornEndX) / 2;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(ornStartX, ornY, ornMidX - 6, ornY);
  doc.line(ornMidX + 6, ornY, ornEndX, ornY);
  // Diamond
  doc.setFillColor(...GOLD);
  const ds = 2;
  doc.triangle(ornMidX - ds, ornY, ornMidX, ornY - ds, ornMidX, ornY + ds, 'F');
  doc.triangle(ornMidX + ds, ornY, ornMidX, ornY - ds, ornMidX, ornY + ds, 'F');

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(settings.tagline.toUpperCase(), textX, ornY + 6);
  }

  y = headerH + 2;

  // ═══════════════════════════════════════
  // Gold Accent Bar
  // ═══════════════════════════════════════
  // Draw watermark before content
  drawWatermark(doc, settings);

  doc.setFillColor(...GOLD);
  doc.rect(0, y, pw, 2.5, 'F');
  y += 2.5;

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
  // FOOTER — Red banner bar + Dark teal
  // ═══════════════════════════════════════
  const footerH = 28;
  const fy = ph - footerH;

  // Red separator line above footer
  doc.setFillColor(204, 51, 51);
  doc.rect(0, fy - 3, pw, 2.5, 'F');

  // Teal background
  doc.setFillColor(...TEAL);
  doc.rect(0, fy, pw, footerH, 'F');

  // Red rounded banner bar
  const barW = pw * 0.75;
  const barX = (pw - barW) / 2;
  const barY = fy - 5;
  const barBH = 10;

  // 3-segment red bar: bright / dark / bright
  const segW = barW / 3;
  // Left bright red
  doc.setFillColor(204, 51, 51);
  doc.roundedRect(barX, barY, segW + 2, barBH, 5, 5, 'F');
  // Center dark red
  doc.setFillColor(153, 31, 31);
  doc.rect(barX + segW - 1, barY, segW + 2, barBH, 'F');
  // Right bright red
  doc.setFillColor(204, 51, 51);
  doc.roundedRect(barX + segW * 2 - 2, barY, segW + 2, barBH, 5, 5, 'F');

  // Icon circles on the bar
  const iconR = 5.5;
  const iconCY = barY + barBH / 2;
  const col1X = barX + barW * 0.17;
  const col2X = barX + barW * 0.50;
  const col3X = barX + barW * 0.83;

  // White border circles
  const drawIconCircle = (cx: number, cy: number, fillColor: [number, number, number]) => {
    doc.setFillColor(...fillColor);
    doc.circle(cx, cy, iconR, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.circle(cx, cy, iconR, 'S');
  };

  drawIconCircle(col1X, iconCY, [204, 51, 51]);
  drawIconCircle(col2X, iconCY, [181, 42, 42]);
  drawIconCircle(col3X, iconCY, [204, 51, 51]);

  // Draw white icons inside circles
  drawLocationIcon(doc, col1X, iconCY, iconR);
  drawPhoneIcon(doc, col2X, iconCY, iconR);
  drawGlobeIcon(doc, col3X, iconCY, iconR);

  // Text below icons
  const textY = iconCY + iconR + 5;
  const thirdW = barW / 3;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);

  // Address
  const addr = settings.address || 'Shop Address';
  const addrLines = doc.splitTextToSize(addr, thirdW - 8);
  doc.text(addrLines, col1X, textY, { align: 'center' });

  // Phone
  const phoneLines: string[] = [];
  if (settings.phone1) phoneLines.push(settings.phone1);
  if (settings.phone2) phoneLines.push(settings.phone2);
  if (phoneLines.length === 0) phoneLines.push('Contact');
  doc.text(phoneLines, col2X, textY, { align: 'center' });

  // Social
  const socialText = settings.socialMedia || settings.website || 'Website Coming Soon';
  const socialLines = doc.splitTextToSize(socialText, thirdW - 8);
  doc.text(socialLines, col3X, textY, { align: 'center' });

  return doc;
}
