import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, CalendarDays, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Bill } from '@/types/bill';

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'name-az' | 'name-za';

interface BillSearchFilterProps {
  bills: Bill[];
  onFiltered: (filtered: Bill[]) => void;
}

export default function BillSearchFilter({ bills, onFiltered }: BillSearchFilterProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const hasDateFilter = dateFrom || dateTo;

  useMemo(() => {
    let filtered = [...bills];

    // Search by name, bill number, or phone
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(b =>
        b.buyerName.toLowerCase().includes(q) ||
        b.billNumber.toLowerCase().includes(q) ||
        (b.buyerPhone && b.buyerPhone.toLowerCase().includes(q))
      );
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(b => new Date(b.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(b => new Date(b.date) <= to);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest': return b.finalTotal - a.finalTotal;
        case 'lowest': return a.finalTotal - b.finalTotal;
        case 'name-az': return a.buyerName.localeCompare(b.buyerName);
        case 'name-za': return b.buyerName.localeCompare(a.buyerName);
        default: return 0;
      }
    });

    onFiltered(filtered);
  }, [bills, search, sort, dateFrom, dateTo]);

  const sortLabels: Record<SortOption, string> = {
    'newest': 'Newest First',
    'oldest': 'Oldest First',
    'highest': 'Highest Amount',
    'lowest': 'Lowest Amount',
    'name-az': 'Name A–Z',
    'name-za': 'Name Z–A',
  };

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSort('newest');
    setShowDateFilter(false);
  };

  const hasActiveFilters = search || hasDateFilter || sort !== 'newest';

  return (
    <div className="space-y-2">
      {/* Search + Sort Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, bill #, phone..."
            className="pl-8 h-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <Button
          variant={hasDateFilter ? 'default' : 'outline'}
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => setShowDateFilter(!showDateFilter)}
        >
          <CalendarDays className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={sort !== 'newest' ? 'default' : 'outline'} size="icon" className="h-9 w-9 shrink-0">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSort(key)}
                className={sort === key ? 'bg-accent' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Date Range Filter */}
      {showDateFilter && (
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-8 text-xs flex-1"
            placeholder="From"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-8 text-xs flex-1"
            placeholder="To"
          />
          {hasDateFilter && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Active filter indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {hasDateFilter && 'Date filtered · '}{sort !== 'newest' && `${sortLabels[sort]} · `}Showing results
          </p>
          <button onClick={clearFilters} className="text-[11px] text-primary hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
