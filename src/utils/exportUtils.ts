import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency } from './currency';
import { formatDateRange } from './dateUtils';
import { toSafeNumber, toSafeQuantity } from './safeNumber';
import type { DateRange, ReportSummary, Part, Sale, Brand, Category } from '@/types';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Safely get numeric value, defaulting to 0
 */
function safeNum(value: unknown): number {
  return toSafeNumber(value, 0);
}

/**
 * Safely get quantity value, defaulting to 0
 */
function safeQty(value: unknown): number {
  return toSafeQuantity(value, 0);
}

/**
 * Export report to PDF - Professional formatted document
 */
export async function exportReportToPDF(
  range: DateRange,
  summary: ReportSummary | null,
  topParts: { partId: string; partName: string; sku: string; quantitySold: number; totalRevenue: number; totalProfit: number }[],
  salesByDate: { date: string; sales: number; profit: number }[],
  parts: Part[],
  lowStockItems?: { name: string; quantity: number; minStock: number }[],
  inventoryByCategory?: { name: string; value: number }[],
  inventoryByBrand?: { name: string; value: number }[],
  visuals?: Array<{ title: string; dataUrl: string }>,
  appName?: string
): Promise<void> {
  const shopName = appName || 'Ameer Autos';
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 14;
  const maxContentWidth = pageWidth - marginX * 2;

  const loadImageSize = (dataUrl: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load chart image for PDF export'));
      img.src = dataUrl;
    });

  const ensureSpace = (cursorY: number, requiredHeight: number) => {
    if (cursorY + requiredHeight <= pageHeight - 18) return cursorY;
    doc.addPage();
    return 22;
  };

  // Header with branding — Teal theme matching app palette
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName, 14, 18);

  doc.setFontSize(11);
  doc.text('Inventory & Sales Manager', 14, 26);

  // Report title section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${shopName} - ${range.label}`, 14, 50);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${formatDateRange(range)}`, 14, 58);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 64);

  // Summary section
  if (summary) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 14, 78);

    const summaryData = [
      ['Total Sales', formatCurrency(safeNum(summary.totalSales))],
      ['Total Profit', formatCurrency(safeNum(summary.totalProfit))],
      ['Profit Margin', `${safeNum(summary.profitMargin).toFixed(2)}%`],
      ['Items Sold', safeQty(summary.itemsSold).toString()],
      ['Average Sale Value', formatCurrency(safeNum(summary.averageSaleValue))],
      ['Number of Sales', safeQty(summary.salesCount).toString()],
    ];

    autoTable(doc, {
      startY: 82,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [15, 118, 110],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });
  }

  // Charts / Graphs (captured from the current screen)
  if (visuals && visuals.length > 0) {
    let cursorY = ((doc as any).lastAutoTable?.finalY ?? 70) + 12;
    cursorY = ensureSpace(cursorY, 18);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Charts & Graphs (as on screen)', marginX, cursorY);
    cursorY += 10;

    for (const visual of visuals) {
      cursorY = ensureSpace(cursorY, 22);

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(visual.title, marginX, cursorY);
      cursorY += 6;

      const { width, height } = await loadImageSize(visual.dataUrl);
      let renderW = maxContentWidth;
      let renderH = (height / Math.max(1, width)) * renderW;

      // If it won't fit, scale down to page height.
      const maxH = pageHeight - cursorY - 18;
      if (renderH > maxH) {
        renderH = maxH;
        renderW = (width / Math.max(1, height)) * renderH;
      }

      cursorY = ensureSpace(cursorY, renderH + 12);
      doc.addImage(visual.dataUrl, 'PNG', marginX, cursorY, renderW, renderH, undefined, 'FAST');
      cursorY += renderH + 12;
    }
  }

  // Top Selling Parts
  if (topParts.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 130;
    
    if (finalY > pageHeight - 80) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Top Selling Parts', 14, 22);
    } else {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Top Selling Parts', 14, finalY + 15);
    }

    const topPartsData = topParts.map((p, i) => [
      (i + 1).toString(),
      p.partName || 'Unknown',
      p.sku || 'N/A',
      safeQty(p.quantitySold).toString(),
      formatCurrency(safeNum(p.totalRevenue)),
      formatCurrency(safeNum(p.totalProfit)),
    ]);

    autoTable(doc, {
      startY: finalY > pageHeight - 80 ? 28 : finalY + 20,
      head: [['#', 'Part Name', 'SKU', 'Qty Sold', 'Revenue', 'Profit']],
      body: topPartsData,
      theme: 'striped',
      headStyles: { 
        fillColor: [15, 118, 110],
        textColor: 255
      },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });
  }

  // Sales by Date
  if (salesByDate.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 200;

    if (finalY > pageHeight - 60) {
      doc.addPage();
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Daily Sales Summary', 14, finalY > pageHeight - 60 ? 22 : finalY + 15);

    const salesData = salesByDate.map(d => [
      d.date,
      formatCurrency(safeNum(d.sales)),
      formatCurrency(safeNum(d.profit)),
    ]);

    autoTable(doc, {
      startY: finalY > pageHeight - 60 ? 28 : finalY + 20,
      head: [['Date', 'Sales', 'Profit']],
      body: salesData,
      theme: 'striped',
      headStyles: { 
        fillColor: [15, 118, 110],
        textColor: 255
      },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });
  }

  // Low Stock Items (if provided)
  if (lowStockItems && lowStockItems.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 200;

    if (finalY > pageHeight - 60) {
      doc.addPage();
    }

    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red for warning
    // Avoid unicode glyphs (emoji) because jsPDF default fonts can fail to render them.
    doc.text('Low Stock Alert', 14, finalY > pageHeight - 60 ? 22 : finalY + 15);

    const lowStockData = lowStockItems.map(item => [
      item.name,
      safeQty(item.quantity).toString(),
      safeQty(item.minStock).toString(),
      safeQty(item.quantity) === 0 ? 'CRITICAL' : 'LOW',
    ]);

    autoTable(doc, {
      startY: finalY > pageHeight - 60 ? 28 : finalY + 20,
      head: [['Part Name', 'Current Stock', 'Min Stock', 'Status']],
      body: lowStockData,
      theme: 'grid',
      headStyles: { 
        fillColor: [220, 38, 38],
        textColor: 255
      },
      styles: { fontSize: 9 }
    });
  }

  // Inventory Snapshot
  {
    const finalY = (doc as any).lastAutoTable?.finalY || 200;

    if (finalY > pageHeight - 80) {
      doc.addPage();
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Current Inventory Snapshot', 14, finalY > pageHeight - 80 ? 22 : finalY + 15);

    // Calculate inventory totals
    let totalValue = 0;
    let totalRetail = 0;
    let totalItems = 0;

    parts.forEach(p => {
      const qty = safeQty(p.quantity);
      totalItems += qty;
      totalValue += qty * safeNum(p.buyingPrice);
      totalRetail += qty * safeNum(p.sellingPrice);
    });

    const inventoryStats = [
      ['Total SKUs', parts.length.toString()],
      ['Total Items in Stock', totalItems.toString()],
      ['Inventory Value (Cost)', formatCurrency(totalValue)],
      ['Inventory Value (Retail)', formatCurrency(totalRetail)],
      ['Potential Profit', formatCurrency(totalRetail - totalValue)],
    ];

    autoTable(doc, {
      startY: finalY > pageHeight - 80 ? 28 : finalY + 20,
      head: [['Metric', 'Value']],
      body: inventoryStats,
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246],
        textColor: 255
      },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} • ${shopName} Inventory & Sales Manager`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const filename = `${shopName.toLowerCase().replace(/\s+/g, '-')}-report-${range.label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export report to Excel - Multi-sheet workbook
 */
export async function exportReportToExcel(
  range: DateRange,
  sales: Sale[],
  parts: Part[],
  categories?: { id: string; name: string }[],
  brands?: { id: string; name: string }[]
): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary KPIs
  const totalSales = sales.reduce((sum, s) => sum + safeNum(s.totalAmount), 0);
  const totalProfit = sales.reduce((sum, s) => sum + safeNum(s.profit), 0);
  const itemsSold = sales.reduce((sum, s) => sum + safeQty(s.quantity), 0);
  const inventoryValue = parts.reduce((sum, p) => sum + safeQty(p.quantity) * safeNum(p.buyingPrice), 0);
  const inventoryRetail = parts.reduce((sum, p) => sum + safeQty(p.quantity) * safeNum(p.sellingPrice), 0);
  const lowStockCount = parts.filter(p => safeQty(p.quantity) <= safeQty(p.minStockLevel)).length;

  const profitMarginPct = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const avgSaleValue = sales.length > 0 ? totalSales / sales.length : 0;

  const summaryData = [
    ['Ameer Autos - Report Summary'],
    [''],
    ['Report Period', range.label],
    ['Date Range', formatDateRange(range)],
    ['Generated On', new Date().toLocaleString()],
    [''],
    ['KEY PERFORMANCE INDICATORS'],
    ['Total Sales (Rs)', totalSales],
    ['Total Profit (Rs)', totalProfit],
    ['Profit Margin (%)', Number(profitMarginPct.toFixed(2))],
    ['Items Sold', itemsSold],
    ['Number of Transactions', sales.length],
    ['Average Sale Value (Rs)', Number(avgSaleValue.toFixed(2))],
    [''],
    ['INVENTORY STATUS'],
    ['Total SKUs', parts.length],
    ['Inventory Value - Cost (Rs)', inventoryValue],
    ['Inventory Value - Retail (Rs)', inventoryRetail],
    ['Potential Profit (Rs)', inventoryRetail - inventoryValue],
    ['Low Stock Items', lowStockCount],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Sales Data
  const salesHeaders = ['Sale ID', 'Date', 'Time', 'Part Name', 'SKU', 'Quantity', 'Unit Price (Rs)', 'Total Amount (Rs)', 'Buying Price (Rs)', 'Profit (Rs)', 'Customer Name'];
  const salesRows = sales.map(s => [
    s.id,
    new Date(s.createdAt).toLocaleDateString(),
    new Date(s.createdAt).toLocaleTimeString(),
    s.partName || 'Unknown',
    s.partSku || 'N/A',
    safeQty(s.quantity),
    safeNum(s.unitPrice),
    safeNum(s.totalAmount),
    safeNum(s.buyingPrice),
    safeNum(s.profit),
    s.customerName || '',
  ]);
  
  const salesSheet = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesRows]);
  salesSheet['!cols'] = [
    { wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 15 },
    { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Data');

  // Sheet 3: Profit Analysis
  const profitByPart = new Map<string, { name: string; revenue: number; profit: number; qty: number }>();
  sales.forEach(s => {
    const existing = profitByPart.get(s.partId) || { name: s.partName, revenue: 0, profit: 0, qty: 0 };
    existing.revenue += safeNum(s.totalAmount);
    existing.profit += safeNum(s.profit);
    existing.qty += safeQty(s.quantity);
    profitByPart.set(s.partId, existing);
  });

  const profitHeaders = ['Part Name', 'Quantity Sold', 'Revenue (Rs)', 'Profit (Rs)', 'Profit Margin (%)'];
  const profitRows = Array.from(profitByPart.values())
    .sort((a, b) => b.profit - a.profit)
    .map(p => [
      p.name,
      p.qty,
      p.revenue,
      p.profit,
      Number((p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0).toFixed(2)),
    ]);

  const profitSheet = XLSX.utils.aoa_to_sheet([profitHeaders, ...profitRows]);
  profitSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, profitSheet, 'Profit Analysis');

  // Sheet 4: Inventory Snapshot
  const getBrandName = (brandId: string) => brands?.find(b => b.id === brandId)?.name || 'Unknown';
  const getCategoryName = (categoryId: string) => categories?.find(c => c.id === categoryId)?.name || 'Unknown';

  const inventoryHeaders = ['Part Name', 'SKU', 'Brand', 'Category', 'Current Stock', 'Min Stock', 'Status', 'Buying Price (Rs)', 'Selling Price (Rs)', 'Stock Value (Rs)', 'Location'];
  const inventoryRows = parts.map(p => {
    const qty = safeQty(p.quantity);
    const minStock = safeQty(p.minStockLevel);
    let status = 'In Stock';
    if (qty === 0) status = 'Out of Stock';
    else if (qty <= minStock) status = 'Low Stock';

    return [
      p.name,
      p.sku,
      getBrandName(p.brandId),
      getCategoryName(p.categoryId),
      qty,
      minStock,
      status,
      safeNum(p.buyingPrice),
      safeNum(p.sellingPrice),
      qty * safeNum(p.buyingPrice),
      p.location || '',
    ];
  });

  const inventorySheet = XLSX.utils.aoa_to_sheet([inventoryHeaders, ...inventoryRows]);
  inventorySheet['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory');

  // Sheet 5: Low Stock Items
  const lowStockParts = parts.filter(p => safeQty(p.quantity) <= safeQty(p.minStockLevel));
  const lowStockHeaders = ['Part Name', 'SKU', 'Current Stock', 'Min Stock', 'Shortage', 'Status', 'Buying Price (Rs)', 'Restock Cost (Rs)'];
  const lowStockRows = lowStockParts
    .sort((a, b) => safeQty(a.quantity) - safeQty(b.quantity))
    .map(p => {
      const qty = safeQty(p.quantity);
      const minStock = safeQty(p.minStockLevel);
      const shortage = Math.max(0, minStock - qty);
      const status = qty === 0 ? 'CRITICAL' : 'LOW';
      const restockCost = shortage * safeNum(p.buyingPrice);

      return [
        p.name,
        p.sku,
        qty,
        minStock,
        shortage,
        status,
        safeNum(p.buyingPrice),
        restockCost,
      ];
    });

  const lowStockSheet = XLSX.utils.aoa_to_sheet([lowStockHeaders, ...lowStockRows]);
  lowStockSheet['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 15 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Low Stock');

  // Generate and save
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const filename = `ameer-autos-report-${range.label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
}

/**
 * Export report to CSV - Separate files zipped or single comprehensive file
 */
export async function exportReportToCSV(
  range: DateRange,
  sales: Sale[],
  parts: Part[]
): Promise<void> {
  const escapeCsv = (value: unknown) => {
    const str = value === null || value === undefined ? '' : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const baseName = `ameer-autos-report-${range.label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;

  // Sales section
  const salesHeaders = ['Sale ID', 'Date', 'Part Name', 'SKU', 'Quantity', 'Unit Price', 'Total Amount', 'Buying Price', 'Profit', 'Customer'];
  const salesRows = sales.map(s => [
    s.id,
    new Date(s.createdAt).toISOString(),
    s.partName || 'Unknown',
    s.partSku || 'N/A',
    safeQty(s.quantity),
    safeNum(s.unitPrice),
    safeNum(s.totalAmount),
    safeNum(s.buyingPrice),
    safeNum(s.profit),
    s.customerName || '',
  ]);

  const salesCSV = [
    salesHeaders.join(','),
    ...salesRows.map(r => r.map(escapeCsv).join(',')),
  ].join('\n');

  // Inventory section
  const inventoryHeaders = ['Part Name', 'SKU', 'Quantity', 'Min Stock', 'Buying Price', 'Selling Price', 'Stock Value', 'Location'];
  const inventoryRows = parts.map(p => {
    const qty = safeQty(p.quantity);
    return [
      p.name,
      p.sku,
      qty,
      safeQty(p.minStockLevel),
      safeNum(p.buyingPrice),
      safeNum(p.sellingPrice),
      qty * safeNum(p.buyingPrice),
      p.location || '',
    ];
  });

  const inventoryCSV = [
    inventoryHeaders.join(','),
    ...inventoryRows.map(r => r.map(escapeCsv).join(',')),
  ].join('\n');

  // Low stock section
  const lowStockParts = parts.filter(p => safeQty(p.quantity) <= safeQty(p.minStockLevel));
  const lowStockHeaders = ['Part Name', 'SKU', 'Current Stock', 'Min Stock', 'Status'];
  const lowStockRows = lowStockParts.map(p => {
    const qty = safeQty(p.quantity);
    return [
      p.name,
      p.sku,
      qty,
      safeQty(p.minStockLevel),
      qty === 0 ? 'CRITICAL' : 'LOW',
    ];
  });

  const lowStockCSV = [
    lowStockHeaders.join(','),
    ...lowStockRows.map(r => r.map(escapeCsv).join(',')),
  ].join('\n');

  // Separate files (as required)
  saveAs(new Blob([salesCSV], { type: 'text/csv;charset=utf-8;' }), `${baseName}-sales.csv`);
  saveAs(new Blob([inventoryCSV], { type: 'text/csv;charset=utf-8;' }), `${baseName}-inventory.csv`);
  saveAs(new Blob([lowStockCSV], { type: 'text/csv;charset=utf-8;' }), `${baseName}-low-stock.csv`);
}
