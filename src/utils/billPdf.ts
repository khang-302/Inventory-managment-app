import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BillSettings, Bill, BillItem } from '@/types/bill';

export function generateBillPdf(
  settings: BillSettings,
  bill: Bill,
  items: BillItem[],
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header: Shop name + tagline
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName, margin, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(settings.tagline, margin, y + 13);

  // Yellow accent line
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.8);
  y += 18;
  doc.line(margin, y, pageWidth - margin, y);

  // Contact info
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(80);
  const contactLine = [settings.phone1, settings.phone2].filter(Boolean).join(' | ');
  doc.text(contactLine, margin, y);
  y += 5;
  doc.text(settings.address, margin, y);

  // Divider
  y += 6;
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // Bill details
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text(`Bill No: ${bill.billNumber}`, margin, y);
  doc.text(`Date: ${new Date(bill.date).toLocaleDateString('en-PK')}`, pageWidth - margin, y, { align: 'right' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Buyer: ${bill.buyerName}`, margin, y);
  if (bill.buyerPhone) {
    doc.text(`Phone: ${bill.buyerPhone}`, pageWidth - margin, y, { align: 'right' });
  }

  // Items table
  y += 8;
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
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    theme: 'grid',
  });

  // Totals
  y = (doc as any).lastAutoTable.finalY + 8;
  const totalsX = pageWidth - margin;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: Rs ${bill.subtotal.toLocaleString()}`, totalsX, y, { align: 'right' });
  y += 6;
  if (bill.discount > 0) {
    doc.text(`Discount: Rs ${bill.discount.toLocaleString()}`, totalsX, y, { align: 'right' });
    y += 6;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: Rs ${bill.finalTotal.toLocaleString()}`, totalsX, y, { align: 'right' });

  // Notes
  if (bill.notes) {
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`Notes: ${bill.notes}`, margin, y);
  }

  // Footer
  if (settings.footerMessage) {
    y += 14;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text(settings.footerMessage, pageWidth / 2, y, { align: 'center' });
  }

  // Bottom accent line
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.5);
  doc.line(margin, doc.internal.pageSize.getHeight() - 12, pageWidth - margin, doc.internal.pageSize.getHeight() - 12);

  return doc;
}
