import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { db } from '@/db/database';
import { formatCurrency } from '@/utils/currency';
import { toSafeQuantity } from '@/utils/safeNumber';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Package, 
  Grid3X3, 
  List,
  Table2,
  Filter,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmergencyIndicator, isLowStock } from '@/components/ui/emergency-indicator';
import type { StockStatus, ViewMode, Part } from '@/types';

type SortColumn = 'name' | 'sku' | 'brand' | 'quantity' | 'price';
type SortDirection = 'asc' | 'desc';

const VIEW_CYCLE: ViewMode[] = ['list', 'grid', 'table'];
const VIEW_ICONS: Record<ViewMode, typeof List> = {
  list: List,
  grid: Grid3X3,
  table: Table2,
};

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockStatus>(
    (searchParams.get('status') as StockStatus) || 'all'
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Live queries
  const parts = useLiveQuery(() => db.parts.toArray(), []) ?? [];
  const brands = useLiveQuery(() => db.brands.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  // Filter and search parts
  const filteredParts = useMemo(() => {
    let result = [...parts];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    if (brandFilter && brandFilter !== 'all') {
      result = result.filter(p => p.brandId === brandFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(p => p.categoryId === categoryFilter);
    }

    if (stockFilter !== 'all') {
      result = result.filter(p => {
        switch (stockFilter) {
          case 'in-stock':
            return p.quantity > p.minStockLevel;
          case 'low-stock':
            return p.quantity > 0 && p.quantity <= p.minStockLevel;
          case 'out-of-stock':
            return p.quantity === 0;
          default:
            return true;
        }
      });
    }

    // Sort
    const dir = sortDirection === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      switch (sortColumn) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'sku':
          return dir * a.sku.localeCompare(b.sku);
        case 'brand':
          return dir * getBrandName(a.brandId).localeCompare(getBrandName(b.brandId));
        case 'quantity':
          return dir * (toSafeQuantity(a.quantity, 0) - toSafeQuantity(b.quantity, 0));
        case 'price':
          return dir * ((a.sellingPrice || 0) - (b.sellingPrice || 0));
        default:
          return 0;
      }
    });

    return result;
  }, [parts, search, brandFilter, categoryFilter, stockFilter, sortColumn, sortDirection, brands]);

  const hasActiveFilters = brandFilter !== 'all' || categoryFilter !== 'all' || stockFilter !== 'all';

  const clearFilters = () => {
    setBrandFilter('all');
    setCategoryFilter('all');
    setStockFilter('all');
    setSearchParams({});
  };

  const cycleViewMode = () => {
    const currentIndex = VIEW_CYCLE.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % VIEW_CYCLE.length;
    setViewMode(VIEW_CYCLE[nextIndex]);
  };

  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-primary" /> 
      : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  const getStockBadge = (part: Part) => {
    const qty = toSafeQuantity(part.quantity, 0);
    const minStock = toSafeQuantity(part.minStockLevel, 0);
    
    if (qty === 0) {
      return <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>;
    }
    if (qty <= minStock) {
      return <Badge className="bg-warning text-warning-foreground text-[10px]">Low Stock</Badge>;
    }
    return null;
  };

  // Next view icon (show what clicking will switch TO)
  const nextViewIndex = (VIEW_CYCLE.indexOf(viewMode) + 1) % VIEW_CYCLE.length;
  const NextViewIcon = VIEW_ICONS[VIEW_CYCLE[nextViewIndex]];

  return (
    <AppLayout>
      <Header 
        title="Inventory" 
        subtitle={`${filteredParts.length} items`}
        rightAction={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={cycleViewMode}
              title={`Switch to ${VIEW_CYCLE[nextViewIndex]} view`}
            >
              <NextViewIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9', hasActiveFilters && 'text-primary')}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="bg-card">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockStatus)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parts List/Grid/Table */}
        {filteredParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {parts.length === 0 ? 'No parts yet' : 'No parts match your search'}
            </p>
            {parts.length === 0 && (
              <Button
                className="mt-4"
                onClick={() => navigate('/inventory/add')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Part
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* ── Table View ── */
          <Card className="bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead 
                      className="cursor-pointer select-none whitespace-nowrap text-xs"
                      onClick={() => toggleSort('name')}
                    >
                      <span className="flex items-center gap-1">
                        Name <SortIcon column="name" />
                      </span>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none whitespace-nowrap text-xs"
                      onClick={() => toggleSort('sku')}
                    >
                      <span className="flex items-center gap-1">
                        SKU <SortIcon column="sku" />
                      </span>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none whitespace-nowrap text-xs"
                      onClick={() => toggleSort('brand')}
                    >
                      <span className="flex items-center gap-1">
                        Brand <SortIcon column="brand" />
                      </span>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none whitespace-nowrap text-xs text-right"
                      onClick={() => toggleSort('quantity')}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Qty <SortIcon column="quantity" />
                      </span>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none whitespace-nowrap text-xs text-right"
                      onClick={() => toggleSort('price')}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Price <SortIcon column="price" />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part) => {
                    const qty = toSafeQuantity(part.quantity, 0);
                    const minStock = toSafeQuantity(part.minStockLevel, 0);
                    const low = isLowStock(qty, minStock);

                    return (
                      <TableRow 
                        key={part.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/inventory/${part.id}`)}
                      >
                        <TableCell className="py-2.5 px-3 text-sm font-medium whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            {part.name}
                            {low && <EmergencyIndicator size="sm" />}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                          {part.sku}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                          {getBrandName(part.brandId)}
                        </TableCell>
                        <TableCell className={cn(
                          "py-2.5 px-3 text-sm text-right whitespace-nowrap font-medium",
                          qty === 0 && 'text-destructive',
                          qty > 0 && low && 'text-warning'
                        )}>
                          {qty}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-sm text-right whitespace-nowrap font-semibold text-primary">
                          {formatCurrency(part.sellingPrice)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredParts.map((part) => (
              <Card 
                key={part.id}
                className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/inventory/${part.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {part.images?.[0] ? (
                        <img 
                          src={part.images[0]} 
                          alt={part.name}
                          className="h-full w-full object-cover rounded-md"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium truncate">{part.name}</p>
                            {isLowStock(toSafeQuantity(part.quantity, 0), toSafeQuantity(part.minStockLevel, 0)) && (
                              <EmergencyIndicator size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">SKU: {part.sku}</p>
                        </div>
                        {getStockBadge(part)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{getBrandName(part.brandId)}</span>
                          <span>•</span>
                          <span>Qty: {toSafeQuantity(part.quantity, 0)}</span>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatCurrency(part.sellingPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredParts.map((part) => (
              <Card 
                key={part.id}
                className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/inventory/${part.id}`)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                    {part.images?.[0] ? (
                      <img 
                        src={part.images[0]} 
                        alt={part.name}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm truncate flex-1">{part.name}</p>
                      {isLowStock(toSafeQuantity(part.quantity, 0), toSafeQuantity(part.minStockLevel, 0)) && (
                        <EmergencyIndicator size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">SKU: {part.sku}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-xs',
                        toSafeQuantity(part.quantity, 0) === 0 && 'text-destructive',
                        toSafeQuantity(part.quantity, 0) > 0 && toSafeQuantity(part.quantity, 0) <= toSafeQuantity(part.minStockLevel, 0) && 'text-warning'
                      )}>
                        Qty: {toSafeQuantity(part.quantity, 0)}
                      </span>
                      <span className="font-semibold text-sm text-primary">
                        {formatCurrency(part.sellingPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
        onClick={() => navigate('/inventory/add')}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Part</span>
      </Button>
    </AppLayout>
  );
}
