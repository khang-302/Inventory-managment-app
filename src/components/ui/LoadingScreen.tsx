import { Package } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in gap-6">
      {/* Pulsing logo circle */}
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Package className="h-8 w-8 text-primary" />
        </div>
        {/* Spinning ring */}
        <div
          className="absolute inset-[-6px] rounded-2xl border-2 border-transparent border-t-primary"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
    </div>
  );
}
