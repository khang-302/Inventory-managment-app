import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem, WatermarkStyle } from '@/types/bill';
import { getBillPalette, type BillColorPalette } from '@/utils/billColorThemes';

/* ── Hex to RGB helper ── */
type RGB = [number, number, number];

function hex(color: string): RGB {
  const h = color.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/* ── Dynamic font size for shop name ── */
function getShopNamePdfSize(name: string): number {
  if (name.length <= 16) return 20;
  if (name.length <= 24) return 16;
  return 13;
}

/* ── Parse logo data URL ── */
function parseLogoDataUrl(dataUrl: string): { data: string; format: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/);
  if (!match) return null;
  const format = match[1].toUpperCase() === 'JPG' ? 'JPEG' : match[1].toUpperCase();
  return { data: dataUrl, format };
}

/* ── Draw geometric icons using jsPDF primitives ── */
function drawLocationIcon(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.setFillColor(255, 255, 255);
  const s = r * 0.45;
  doc.triangle(cx - s * 0.6, cy - s * 0.3, cx + s * 0.6, cy - s * 0.3, cx, cy + s * 1.1, 'F');
  doc.circle(cx, cy - s * 0.3, s * 0.55, 'F');
  // inner dot uses the icon circle bg
  // caller sets fill before calling this, so we re-grab from circle bg
}

function drawPhoneIcon(doc: jsPDF, cx: number, cy: number, r: number, bgRgb: RGB) {
  doc.setFillColor(255, 255, 255);
  const w = r * 0.5;
  const h = r * 0.9;
  doc.roundedRect(cx - w / 2, cy - h / 2, w, h, 1, 1, 'F');
  doc.setFillColor(...bgRgb);
  doc.rect(cx - w / 2 + 0.8, cy - h / 2 + 1.5, w - 1.6, h - 3.5, 'F');
}

function drawGlobeIcon(doc: jsPDF, cx: number, cy: number, r: number) {
  const gr = r * 0.55;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(cx, cy, gr, 'S');
  doc.line(cx - gr, cy, cx + gr, cy);
  doc.line(cx, cy - gr, cx, cy + gr);
}

/* ── Draw watermark ── */
function drawWatermark(doc: jsPDF, settings: BillSettings, p: BillColorPalette) {
  if (!settings.watermarkEnabled) return;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const style = (settings.watermarkStyle || 'text') as WatermarkStyle;
  const opacity = settings.watermarkOpacity;

  // Compute faded color by blending toward white
  const blendToWhite = (c: RGB, strength: number): RGB => [
    Math.round(255 - (255 - c[0]) * strength),
    Math.round(255 - (255 - c[1]) * strength),
    Math.round(255 - (255 - c[2]) * strength),
  ];

  switch (style) {
    case 'text': {
      const text = (settings.watermarkText || settings.shopName).toUpperCase();
      const faded = blendToWhite(hex(p.silver), opacity * 3);
      doc.setTextColor(...faded);
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
      const faded = blendToWhite(hex(p.silver), opacity * 3);
      doc.setTextColor(...faded);
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
      const faded = blendToWhite(hex(p.accent1), opacity * 4);
      doc.setDrawColor(...faded);
      doc.setLineWidth(0.8);
      doc.rect(6, 6, pw - 12, ph - 12, 'S');
      doc.setLineWidth(0.3);
      doc.rect(10, 10, pw - 20, ph - 20, 'S');
      const cLen = 8;
      doc.setLineWidth(0.6);
      [[10, 10, 1, 1], [pw - 10, 10, -1, 1], [10, ph - 10, 1, -1], [pw - 10, ph - 10, -1, -1]].forEach(([cx, cy, dx, dy]) => {
        doc.line(cx, cy, cx + cLen * dx, cy);
        doc.line(cx, cy, cx, cy + cLen * dy);
      });
      break;
    }
    case 'diagonal-lines': {
      const faded = blendToWhite(hex(p.accent1), opacity * 3);
      doc.setDrawColor(...faded);
      doc.setLineWidth(0.3);
      for (let i = 0; i < 30; i++) {
        const x1 = i * 15 - 100;
        const x2 = x1 + ph * 0.7;
        doc.line(x1, 0, x2, ph);
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

  // Get dynamic palette
  const p = getBillPalette(settings.billColorTheme || 'modern-black-orange');
  const H = hex(p.headerBg);
  const A1 = hex(p.accent1);
  const A2 = hex(p.accent2);
  const HT = hex(p.headerText);
  const TP = hex(p.textPrimary);
  const TS = hex(p.textSecondary);
  const TB = hex(p.textBody);
  const TM = hex(p.textMuted);
  const W = hex(p.white);
  const PALE = hex(p.pale);
  const SILVER = hex(p.silver);
  const LS = hex(p.lightSilver);
  const TGS = hex(p.totalGradientStart);
  const TGE = hex(p.totalGradientEnd);
  const TAB = hex(p.totalAmountBg);
  const TAT = hex(p.totalAmountText);
  const IC1 = hex(p.iconCircle1);
  const IC2 = hex(p.iconCircle2);
  const WBG = hex(p.warmBg);

  const initials = settings.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════
  const headerH = 38;

  // Top accent gradient bar (accent1)
  doc.setFillColor(...A1);
  doc.rect(0, 0, pw, 1.5, 'F');

  // Header background
  doc.setFillColor(...H);
  doc.rect(0, 1.5, pw, headerH, 'F');

  // Bottom accent gradient bar (accent2 → accent1 → accent2)
  doc.setFillColor(...A2);
  doc.rect(0, headerH + 1.5, pw, 1, 'F');

  const logoR = 13;
  const logoX = mx + logoR + 6;
  const logoY = 1.5 + headerH / 2;

  // Outer decorative ring (accent1)
  doc.setDrawColor(...A1);
  doc.setLineWidth(0.8);
  doc.circle(logoX, logoY, logoR + 2, 'S');

  // Inner badge circle - white fill + accent1 border
  doc.setFillColor(...W);
  doc.circle(logoX, logoY, logoR, 'F');
  doc.setDrawColor(...A1);
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
    // Gradient circle approximation: use accent1
    doc.setFillColor(...A1);
    doc.circle(logoX, logoY, logoR - 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HT);
    doc.text(initials, logoX, logoY + 2, { align: 'center' });
  }

  // Vertical divider (accent1 → accent2 approximated as accent1)
  const divX = logoX + logoR + 8;
  doc.setDrawColor(...A1);
  doc.setLineWidth(0.6);
  doc.line(divX, logoY - logoR + 2, divX, logoY + logoR - 2);

  // Shop name
  const textX = divX + 6;
  doc.setFontSize(getShopNamePdfSize(settings.shopName));
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HT);
  const shopNameLines = doc.splitTextToSize(settings.shopName.toUpperCase(), pw - textX - mx - 10);
  doc.text(shopNameLines, textX, logoY - (shopNameLines.length > 1 ? 5 : 3));

  // Ornamental divider under name (line + diamond + line) using accent1/accent2
  const ornY = logoY + 2;
  const ornStartX = textX;
  const ornEndX = pw - mx - 10;
  const ornMidX = (ornStartX + ornEndX) / 2;
  doc.setDrawColor(...A1);
  doc.setLineWidth(0.4);
  doc.line(ornStartX, ornY, ornMidX - 6, ornY);
  doc.line(ornMidX + 6, ornY, ornEndX, ornY);
  // Diamond (accent2)
  doc.setFillColor(...A2);
  const ds = 2;
  doc.triangle(ornMidX - ds, ornY, ornMidX, ornY - ds, ornMidX, ornY + ds, 'F');
  doc.triangle(ornMidX + ds, ornY, ornMidX, ornY - ds, ornMidX, ornY + ds, 'F');

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SILVER);
    doc.text(settings.tagline.toUpperCase(), textX, ornY + 6);
  }

  y = headerH + 2.5;

  // ═══════════════════════════════════════
  // WATERMARK (drawn before content so it's behind)
  // ═══════════════════════════════════════
  drawWatermark(doc, settings, p);

  // ═══════════════════════════════════════
  // "Invoice From" bar — pale bg + lightSilver border
  // ═══════════════════════════════════════
  const ifBarH = 8;
  doc.setFillColor(...PALE);
  doc.rect(0, y, pw, ifBarH, 'F');
  doc.setDrawColor(...LS);
  doc.setLineWidth(0.3);
  doc.line(0, y + ifBarH, pw, y + ifBarH);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TM);
  doc.text('Invoice From :', mx, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TP);
  doc.text(settings.shopName.toUpperCase(), mx + 24, y + 5.5);

  y += ifBarH + 4;

  // ═══════════════════════════════════════
  // Invoice To Block — headerBg header, lightSilver border, rounded
  // ═══════════════════════════════════════
  const blockW = pw - mx * 2;

  // Outer border (lightSilver)
  doc.setDrawColor(...LS);
  doc.setLineWidth(0.3);
  doc.roundedRect(mx, y, blockW, 24, 2, 2, 'S');

  // Header row (headerBg)
  doc.setFillColor(...H);
  // Clip to rounded rect top — approximate with rect
  doc.roundedRect(mx, y, blockW, 8, 2, 2, 'F');
  // Fill bottom portion to make it rectangular below
  doc.rect(mx, y + 4, blockW, 4, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HT);
  doc.text('Invoice To', mx + 6, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SILVER);
  doc.text('Invoice No :', pw - mx - 42, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...A1);
  doc.text(bill.billNumber, pw - mx - 4, y + 5.5, { align: 'right' });
  y += 8;

  // Body row
  doc.setFillColor(...W);
  doc.rect(mx + 0.15, y, blockW - 0.3, 16, 'F');

  // Buyer name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TP);
  doc.text(bill.buyerName.toUpperCase(), mx + 6, y + 6);

  if (bill.buyerPhone) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TM);
    doc.text(`Phone: ${bill.buyerPhone}`, mx + 6, y + 11);
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TM);
  doc.text(`Date : ${new Date(bill.date).toLocaleDateString('en-PK')}`, pw - mx - 6, y + 6, { align: 'right' });

  y += 20;

  // ═══════════════════════════════════════
  // ITEMS TABLE — headerBg head, pale alternating, lightSilver grid
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
      textColor: TB,
      lineColor: LS,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: H,
      textColor: HT,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: PALE,
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
    tableLineColor: LS,
    tableLineWidth: 0.2,
  });

  y = (doc as any).lastAutoTable.finalY;

  // ═══════════════════════════════════════
  // GRAND TOTAL BAR — matches image: gradient left + amount right
  // ═══════════════════════════════════════
  const barH = 10;
  const amountW = pw * 0.3;
  const gradientW = pw - mx * 2 - amountW;

  // Left gradient side (totalGradientEnd as approximation since PDF can't do CSS gradients)
  doc.setFillColor(...TGE);
  doc.rect(mx, y, gradientW, barH, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HT);
  doc.text('GRAND TOTAL', mx + 6, y + barH / 2 + 1);

  if (bill.discount > 0) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const discText = `(Subtotal: Rs ${bill.subtotal.toLocaleString()} | Discount: Rs ${bill.discount.toLocaleString()})`;
    doc.text(discText, mx + 34, y + barH / 2 + 1);
  }

  // Right amount side (totalAmountBg)
  doc.setFillColor(...TAB);
  doc.rect(mx + gradientW, y, amountW, barH, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TAT);
  doc.text(`Rs ${bill.finalTotal.toLocaleString()}`, pw - mx - 6, y + barH / 2 + 1.5, { align: 'right' });

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
      // Title with accent2 underline
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TP);
      doc.text('TERMS & CONDITIONS', sectionMx, y + 4);

      const titleW = doc.getTextWidth('TERMS & CONDITIONS');
      doc.setDrawColor(...A2);
      doc.setLineWidth(0.6);
      doc.line(sectionMx, y + 5.5, sectionMx + titleW, y + 5.5);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TB);
      let ty = y + 11;
      termsData.forEach(t => {
        if (ty < ph - 45) {
          const lines = doc.splitTextToSize(`• ${t}`, colW - 4);
          doc.text(lines, sectionMx + 2, ty);
          ty += lines.length * 4;
        }
      });
    }

    // Payment Information (right) — warmBg + accent1 left border
    if (showPayment && paymentInfoData) {
      const px = showTerms ? sectionMx + colW + 8 : sectionMx;

      const paymentLines: string[] = [];
      if (paymentInfoData.bankName) paymentLines.push(`Bank: ${paymentInfoData.bankName}`);
      if (paymentInfoData.accountTitle) paymentLines.push(`Account: ${paymentInfoData.accountTitle}`);
      if (paymentInfoData.accountNumber) paymentLines.push(`Acc No: ${paymentInfoData.accountNumber}`);
      if (paymentInfoData.iban) paymentLines.push(`IBAN: ${paymentInfoData.iban}`);
      if (paymentInfoData.easypaisaNumber) paymentLines.push(`EasyPaisa: ${paymentInfoData.easypaisaNumber}`);
      if (paymentInfoData.jazzcashNumber) paymentLines.push(`JazzCash: ${paymentInfoData.jazzcashNumber}`);

      const boxH = 10 + paymentLines.length * 4.5 + 4;

      // Warm background
      doc.setFillColor(...WBG);
      doc.roundedRect(px, y - 2, colW, boxH, 2, 2, 'F');

      // Border (lightSilver)
      doc.setDrawColor(...LS);
      doc.setLineWidth(0.3);
      doc.roundedRect(px, y - 2, colW, boxH, 2, 2, 'S');

      // Left accent border (accent1)
      doc.setFillColor(...A1);
      doc.rect(px, y - 1, 1.2, boxH - 2, 'F');

      // Title
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TP);
      doc.text('PAYMENT INFORMATION', px + 6, y + 5);

      // Lines
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      let pl = y + 11;
      paymentLines.forEach(line => {
        // Split label and value
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const label = line.substring(0, colonIdx + 1);
          const value = line.substring(colonIdx + 1);
          doc.setTextColor(...TM);
          doc.setFont('helvetica', 'normal');
          doc.text(label, px + 6, pl);
          const labelW = doc.getTextWidth(label + ' ');
          doc.setTextColor(...TS);
          doc.setFont('helvetica', 'bold');
          doc.text(value.trim(), px + 6 + labelW, pl);
        } else {
          doc.setTextColor(...TB);
          doc.text(line, px + 6, pl);
        }
        pl += 4.5;
      });
    }
  }

  // ═══════════════════════════════════════
  // FOOTER — matches image: accent gradient separator + headerBg + pill banner + icons
  // ═══════════════════════════════════════
  const footerH = 28;
  const fy = ph - footerH;

  // Accent gradient separator line
  doc.setFillColor(...A1);
  doc.rect(0, fy - 2, pw * 0.5, 1, 'F');
  doc.setFillColor(...A2);
  doc.rect(pw * 0.5, fy - 2, pw * 0.5, 1, 'F');

  // Header bg footer
  doc.setFillColor(...H);
  doc.rect(0, fy, pw, footerH, 'F');

  // Pill banner (accent2 → accent1 → accent2)
  const pillW = pw * 0.75;
  const pillX = (pw - pillW) / 2;
  const pillY = fy - 5;
  const pillH = 10;

  doc.setFillColor(...A2);
  doc.roundedRect(pillX, pillY, pillW / 3 + 2, pillH, 5, 5, 'F');
  doc.setFillColor(...A1);
  doc.rect(pillX + pillW / 3 - 1, pillY, pillW / 3 + 2, pillH, 'F');
  doc.setFillColor(...A2);
  doc.roundedRect(pillX + pillW * 2 / 3 - 2, pillY, pillW / 3 + 2, pillH, 5, 5, 'F');

  // Icon circles
  const iconR = 5.5;
  const iconCY = pillY + pillH / 2;
  const col1X = pillX + pillW * 0.17;
  const col2X = pillX + pillW * 0.50;
  const col3X = pillX + pillW * 0.83;

  const drawIconBg = (cx: number, cy: number, color: RGB) => {
    doc.setFillColor(...color);
    doc.circle(cx, cy, iconR, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.circle(cx, cy, iconR, 'S');
  };

  drawIconBg(col1X, iconCY, IC1);
  drawLocationIcon(doc, col1X, iconCY, iconR);

  drawIconBg(col2X, iconCY, IC2);
  drawPhoneIcon(doc, col2X, iconCY, iconR, IC2);

  drawIconBg(col3X, iconCY, IC1);
  drawGlobeIcon(doc, col3X, iconCY, iconR);

  // Footer text (silver color, matching image)
  const textY = iconCY + iconR + 5;
  const thirdW = pillW / 3;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SILVER);

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

  // Footer message (if exists)
  if (settings.footerMessage) {
    doc.setFontSize(7);
    doc.setTextColor(...TM);
    doc.text(settings.footerMessage, pw / 2, ph - 4, { align: 'center' });
  }

  return doc;
}
