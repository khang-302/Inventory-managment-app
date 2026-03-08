import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { db } from '@/db/database';
import { getSalesSummary, getTopSellingParts } from '@/services/salesService';
import { getInventoryValue } from '@/services/inventoryService';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';
import { getDateRanges, formatDateRange } from '@/utils/dateUtils';
import { toSafeNumber, toSafeQuantity, safeAdd, safeDivide } from '@/utils/safeNumber';
import { Button } from '@/components/ui/button';
import {
  KPICard,
  SalesTrendChart,
  InventoryDistributionChart,
  LowStockChart,
  ProductPerformanceChart,
  SalesHeatmap,
  TimeRangeSelector,
  TopSellingParts,
  InsightsPanel,
} from '@/components/reports';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Receipt,
  Boxes,
} from 'lucide-react';
import type { DateRange, ReportSummary } from '@/types';
import {
  exportReportToPDF,
  exportReportToExcel,
  exportReportToCSV,
} from '@/utils/exportUtils';
import { captureElementAsPng, type CapturedSection } from '@/utils/reportCapture';
import { toast } from 'sonner';
import { startOfDay, endOfDay, subMonths } from 'date-fns';

export default function Reports() {
  const dateRanges = useMemo(() => getDateRanges(), []);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(4);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topParts, setTopParts] = useState<{
    partId: string; partName: string; sku: string;
    quantitySold: number; totalRevenue: number; totalProfit: number;
  }[]>([]);
  const [inventoryValue, setInventoryValue] = useState<{ cost: number; retail: number }>({ cost: 0, retail: 0 });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Refs for PDF capture
  const kpiGridRef = useRef<HTMLDivElement | null>(null);
  const salesTrendRef = useRef<HTMLDivElement | null>(null);
  const inventoryDistRef = useRef<HTMLDivElement | null>(null);
  const lowStockChartRef = useRef<HTMLDivElement | null>(null);
  const productPerfRef = useRef<HTMLDivElement | null>(null);
  const heatmapRef = useRef<HTMLDivElement | null>(null);

  const selectedRange = useMemo((): DateRange => {
    if (customStartDate && customEndDate) {
      return { label: 'Custom Range', startDate: startOfDay(customStartDate), endDate: endOfDay(customEndDate) };
    }
    return dateRanges[selectedRangeIndex];
  }, [dateRanges, selectedRangeIndex, customStartDate, customEndDate]);

  // Live queries
  const sales = useLiveQuery(() => db.sales.toArray(), []) ?? [];
  const parts = useLiveQuery(() => db.parts.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const brands = useLiveQuery(() => db.brands.toArray(), []) ?? [];

  // Fetch summary
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryData, topPartsData, invValue] = await Promise.all([
          getSalesSummary(selectedRange),
          getTopSellingParts(selectedRange, 5),
          getInventoryValue(),
        ]);
        setSummary(summaryData);
        setTopParts(topPartsData);
        setInventoryValue(invValue);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedRange.startDate.getTime(), selectedRange.endDate.getTime(), selectedRange.label]);

  const captureVisibleSections = useCallback(async (): Promise<CapturedSection[]> => {
    const candidates = [
      { title: 'Executive Summary', el: kpiGridRef.current },
      { title: 'Revenue & Profit Trends', el: salesTrendRef.current },
      { title: 'Inventory Value Distribution', el: inventoryDistRef.current },
      { title: 'Low Stock Risk Analysis', el: lowStockChartRef.current },
      { title: 'Product Performance Matrix', el: productPerfRef.current },
      { title: 'Sales Activity Heatmap', el: heatmapRef.current },
    ];
    const results = await Promise.all(
      candidates.map(async (c) => {
        if (!c.el) return null;
        const dataUrl = await captureElementAsPng(c.el);
        return { title: c.title, dataUrl } as CapturedSection;
      })
    );
    return results.filter(Boolean) as CapturedSection[];
  }, []);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= selectedRange.startDate && saleDate <= selectedRange.endDate;
    });
  }, [sales, selectedRange]);

  // Sales by date for charts
  const salesByDate = useMemo(() => {
    const grouped = new Map<string, { sales: number; profit: number; quantity: number }>();
    for (const sale of filteredSales) {
      const dateKey = new Date(sale.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const existing = grouped.get(dateKey) || { sales: 0, profit: 0, quantity: 0 };
      grouped.set(dateKey, {
        sales: safeAdd(existing.sales, toSafeNumber(sale.totalAmount, 0)),
        profit: safeAdd(existing.profit, toSafeNumber(sale.profit, 0)),
        quantity: safeAdd(existing.quantity, toSafeQuantity(sale.quantity, 0)),
      });
    }
    return Array.from(grouped.entries()).map(([date, data]) => ({
      date, sales: data.sales, profit: data.profit, quantity: data.quantity,
    }));
  }, [filteredSales]);

  // Average daily sales
  const avgDailySales = useMemo(() => {
    if (salesByDate.length === 0) return 0;
    const total = salesByDate.reduce((sum, d) => safeAdd(sum, d.sales), 0);
    return safeDivide(total, salesByDate.length, 0);
  }, [salesByDate]);

  // Sales growth (compare current period to equivalent prior period)
  const salesGrowth = useMemo(() => {
    const currentTotal = summary?.totalSales || 0;
    const rangeDays = Math.max(1, Math.ceil(
      (selectedRange.endDate.getTime() - selectedRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ));
    const priorStart = new Date(selectedRange.startDate.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const priorEnd = new Date(selectedRange.startDate.getTime() - 1);
    const priorSales = sales.filter(s => {
      const d = new Date(s.createdAt);
      return d >= priorStart && d <= priorEnd;
    });
    const priorTotal = priorSales.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.totalAmount, 0)), 0);
    if (priorTotal === 0) return currentTotal > 0 ? 100 : 0;
    return ((currentTotal - priorTotal) / priorTotal) * 100;
  }, [summary, selectedRange, sales]);

  // Top & lowest product
  const topProduct = useMemo(() => {
    if (topParts.length === 0) return null;
    return { name: topParts[0].partName, qty: topParts[0].quantitySold };
  }, [topParts]);

  const lowestProduct = useMemo(() => {
    if (topParts.length < 2) return null;
    const last = topParts[topParts.length - 1];
    return { name: last.partName, qty: last.quantitySold };
  }, [topParts]);

  // Low stock
  const lowStockCount = useMemo(() => {
    return parts.filter(p => toSafeQuantity(p.quantity, 0) <= toSafeQuantity(p.minStockLevel, 0)).length;
  }, [parts]);

  const lowStockItems = useMemo(() => {
    return parts
      .filter(p => toSafeQuantity(p.quantity, 0) <= toSafeQuantity(p.minStockLevel, 0))
      .map(p => {
        const quantity = toSafeQuantity(p.quantity, 0);
        const minStock = toSafeQuantity(p.minStockLevel, 1);
        let urgency: 'critical' | 'warning' | 'near' = 'near';
        if (quantity === 0) urgency = 'critical';
        else if (quantity < minStock * 0.5) urgency = 'warning';
        return {
          name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
          quantity, minStock, urgency,
        };
      })
      .slice(0, 10);
  }, [parts]);

  // Inventory by category / brand
  const inventoryByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const part of parts) {
      const cat = categories.find(c => c.id === part.categoryId)?.name || 'Uncategorized';
      const val = toSafeNumber(part.quantity, 0) * toSafeNumber(part.buyingPrice, 0);
      map.set(cat, safeAdd(toSafeNumber(map.get(cat), 0), val));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [parts, categories]);

  const inventoryByBrand = useMemo(() => {
    const map = new Map<string, number>();
    for (const part of parts) {
      const brand = brands.find(b => b.id === part.brandId)?.name || 'Unknown';
      const val = toSafeNumber(part.quantity, 0) * toSafeNumber(part.buyingPrice, 0);
      map.set(brand, safeAdd(toSafeNumber(map.get(brand), 0), val));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [parts, brands]);

  // Product performance
  const productPerformance = useMemo(() => {
    const map = new Map<string, { name: string; unitsSold: number; revenue: number; profit: number; category: string }>();
    for (const sale of filteredSales) {
      const part = parts.find(p => p.id === sale.partId);
      const category = part ? categories.find(c => c.id === part.categoryId)?.name || 'Other' : 'Other';
      const ex = map.get(sale.partId);
      if (ex) {
        ex.unitsSold += toSafeQuantity(sale.quantity, 0);
        ex.revenue += toSafeNumber(sale.totalAmount, 0);
        ex.profit += toSafeNumber(sale.profit, 0);
      } else {
        map.set(sale.partId, {
          name: sale.partName, unitsSold: toSafeQuantity(sale.quantity, 0),
          revenue: toSafeNumber(sale.totalAmount, 0), profit: toSafeNumber(sale.profit, 0), category,
        });
      }
    }
    return Array.from(map.values()).filter(d => d.unitsSold > 0).slice(0, 20);
  }, [filteredSales, parts, categories]);

  // Heatmap data
  const salesHeatmapData = useMemo(() => {
    const map = new Map<string, number>();
    for (const sale of filteredSales) {
      const dateStr = new Date(sale.createdAt).toISOString().split('T')[0];
      map.set(dateStr, safeAdd(toSafeNumber(map.get(dateStr), 0), toSafeNumber(sale.totalAmount, 0)));
    }
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  // Handlers
  const handleCustomStartChange = useCallback((date: Date | undefined) => {
    setCustomStartDate(date);
    if (date && customEndDate && date > customEndDate) setCustomEndDate(undefined);
  }, [customEndDate]);
  const handleCustomEndChange = useCallback((date: Date | undefined) => setCustomEndDate(date), []);
  const handleRangeChange = useCallback((index: number) => {
    setSelectedRangeIndex(index);
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  }, []);

  // Exports
  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      const visuals = await captureVisibleSections();
      await exportReportToPDF(
        selectedRange, summary, topParts, salesByDate, parts,
        lowStockItems.map(i => ({ name: i.name, quantity: i.quantity, minStock: i.minStock })),
        inventoryByCategory, inventoryByBrand, visuals,
      );
      toast.success('PDF exported');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error(error instanceof Error ? error.message : 'PDF export failed');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting('excel');
    try {
      await exportReportToExcel(selectedRange, filteredSales, parts, categories, brands);
      toast.success('Excel exported');
    } catch { toast.error('Excel export failed'); }
    finally { setIsExporting(null); }
  };

  const handleExportCSV = async () => {
    setIsExporting('csv');
    try {
      await exportReportToCSV(selectedRange, filteredSales, parts);
      toast.success('CSV exported');
    } catch { toast.error('CSV export failed'); }
    finally { setIsExporting(null); }
  };

  const totalProductsSold = summary?.itemsSold || 0;

  return (
    <AppLayout>
      <Header title="Analytics" subtitle={formatDateRange(selectedRange)} />

      <div className="p-4 space-y-5 pb-24">
        {/* Time Range Filter */}
        <TimeRangeSelector
          dateRanges={dateRanges}
          selectedRangeIndex={selectedRangeIndex}
          onRangeChange={handleRangeChange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartChange={handleCustomStartChange}
          onCustomEndChange={handleCustomEndChange}
        />

        {/* KPI Summary Cards */}
        <div ref={kpiGridRef} className="grid grid-cols-2 gap-3">
          <KPICard
            title="Total Revenue"
            value={summary?.totalSales || 0}
            icon={<ShoppingCart className="h-5 w-5 text-primary" />}
            isCurrency
            accentColor="hsl(37, 92%, 50%)"
          />
          <KPICard
            title="Total Profit"
            value={summary?.totalProfit || 0}
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            isCurrency
            accentColor="hsl(152, 50%, 45%)"
          />
          <KPICard
            title="Orders / Bills"
            value={summary?.salesCount || 0}
            icon={<Receipt className="h-5 w-5 text-blue-500" />}
            accentColor="hsl(210, 60%, 50%)"
          />
          <KPICard
            title="Products Sold"
            value={totalProductsSold}
            icon={<Boxes className="h-5 w-5 text-violet-500" />}
            accentColor="hsl(280, 45%, 55%)"
          />
        </div>

        {/* Quick Insights */}
        {summary && (
          <InsightsPanel
            salesGrowth={salesGrowth}
            topProduct={topProduct}
            lowestProduct={lowestProduct}
            avgDailySales={avgDailySales}
            profitMargin={summary.profitMargin}
          />
        )}

        {/* Sales & Profit Trend Chart */}
        {salesByDate.length > 0 && (
          <div ref={salesTrendRef}>
            <SalesTrendChart data={salesByDate} />
          </div>
        )}

        {/* Product Performance Bar Chart */}
        {productPerformance.length > 0 && (
          <div ref={productPerfRef}>
            <ProductPerformanceChart data={productPerformance} />
          </div>
        )}

        {/* Top Sellers */}
        {topParts.length > 0 && <TopSellingParts data={topParts} />}

        {/* Inventory Distribution */}
        {(inventoryByCategory.length > 0 || inventoryByBrand.length > 0) && (
          <div ref={inventoryDistRef}>
            <InventoryDistributionChart categoryData={inventoryByCategory} brandData={inventoryByBrand} />
          </div>
        )}

        {/* Low Stock Risk */}
        {lowStockItems.length > 0 && (
          <div ref={lowStockChartRef}>
            <LowStockChart data={lowStockItems} />
          </div>
        )}

        {/* Sales Heatmap */}
        {salesHeatmapData.length > 0 && (
          <div ref={heatmapRef}>
            <SalesHeatmap data={salesHeatmapData} />
          </div>
        )}

        {/* Export Buttons */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-1">
            Export Reports
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex-col h-auto py-3 rounded-xl border-border/30 hover:border-primary/40"
              onClick={handleExportPDF}
              disabled={isExporting !== null || loading}
            >
              {isExporting === 'pdf' ? <Loader2 className="h-5 w-5 mb-1 animate-spin" /> : <FileText className="h-5 w-5 mb-1 text-red-500" />}
              <span className="text-[10px] font-medium">PDF</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 rounded-xl border-border/30 hover:border-primary/40"
              onClick={handleExportExcel}
              disabled={isExporting !== null || loading}
            >
              {isExporting === 'excel' ? <Loader2 className="h-5 w-5 mb-1 animate-spin" /> : <FileSpreadsheet className="h-5 w-5 mb-1 text-emerald-500" />}
              <span className="text-[10px] font-medium">Excel</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 rounded-xl border-border/30 hover:border-primary/40"
              onClick={handleExportCSV}
              disabled={isExporting !== null || loading}
            >
              {isExporting === 'csv' ? <Loader2 className="h-5 w-5 mb-1 animate-spin" /> : <FileDown className="h-5 w-5 mb-1 text-blue-500" />}
              <span className="text-[10px] font-medium">CSV</span>
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {!loading && sales.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No sales data yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Start recording sales to see analytics</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
