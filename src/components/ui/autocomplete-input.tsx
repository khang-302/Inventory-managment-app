import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getSuggestions, addEntry, type AutocompleteField } from '@/services/autocompleteService';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AutocompleteEntry } from '@/types';

interface AutocompleteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  field: AutocompleteField;
  value: string;
  onChange: (value: string) => void;
  /** Called when user selects a suggestion — provides the full entry for dependent autofill */
  onEntrySelect?: (entry: AutocompleteEntry) => void;
  /** Whether to persist on blur (default true) */
  persistOnBlur?: boolean;
}

const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ field, value, onChange, onEntrySelect, persistOnBlur = true, className, ...props }, ref) => {
    const [suggestions, setSuggestions] = useState<AutocompleteEntry[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const fetchSuggestions = useCallback(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const results = await getSuggestions(field, query);
      // Don't show if the only suggestion is an exact match
      const filtered = results.filter(r => r.value.toLowerCase() !== query.toLowerCase());
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
      setActiveIndex(-1);
    }, [field]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(val), 150);
    };

    const handleSelect = (entry: AutocompleteEntry) => {
      onChange(entry.value);
      setOpen(false);
      setSuggestions([]);
      onEntrySelect?.(entry);
    };

    const handleBlur = async () => {
      // Delay to allow click on suggestion
      setTimeout(() => setOpen(false), 200);
      if (persistOnBlur && value.trim()) {
        await addEntry(field, value.trim());
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open || suggestions.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    // Close on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const highlightMatch = (text: string, query: string) => {
      if (!query) return text;
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return text;
      return (
        <>
          <span className="font-semibold text-primary">{text.slice(idx, idx + query.length)}</span>
          {text.slice(idx + query.length)}
        </>
      );
    };

    return (
      <div ref={containerRef} className="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (value.trim()) fetchSuggestions(value); }}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          )}
          autoComplete="off"
          {...props}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
            <ScrollArea className="max-h-40">
              {suggestions.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors',
                    i === activeIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(s);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span>{highlightMatch(s.value, value)}</span>
                  {s.linkedPhone && field === 'customerName' && (
                    <span className="ml-2 text-xs text-muted-foreground">📞 {s.linkedPhone}</span>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
    );
  }
);

AutocompleteInput.displayName = 'AutocompleteInput';

export { AutocompleteInput };
