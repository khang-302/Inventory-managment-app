import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, DollarSign, BarChart3, Shield, Palette, Globe, 
  ArrowLeftRight, FileText, Zap, Code2, Database, LineChart,
  FileDown, Cloud, Mail, Heart, Info, History
} from 'lucide-react';

const features = [
  { icon: Package, title: 'Inventory Management', desc: 'Add, edit, track, and categorize spare parts with UUID-based unique IDs.' },
  { icon: DollarSign, title: 'Real-Time Sales & Stock Updates', desc: 'All sales, stock in/out, and transfers are updated instantly in your local database.' },
  { icon: BarChart3, title: 'Professional Reports & Analytics', desc: 'Modern charts and graphs optimized for phone screens. Filter by today, week, month, or custom range.' },
  { icon: Shield, title: 'Soft Delete System', desc: 'No accidental deletions. All removed items are archived for safety.' },
  { icon: Palette, title: 'Advanced Theme & Typography Controls', desc: 'Customize fonts, sizes, and icons across the app for your preferred style.' },
  { icon: Globe, title: 'Optional Cloud Sync', desc: 'Google Drive sync available asynchronously, ensuring offline-first functionality is never disrupted.' },
  { icon: ArrowLeftRight, title: 'Seamless Navigation', desc: 'Single-Activity + Navigation Component for seamless back navigation across all screens.' },
  { icon: FileText, title: 'Professional Bill Generator', desc: 'Create, customize, and share bills in PDF or image format with your shop branding.' },
  { icon: Zap, title: 'QuickSell & Quick Actions', desc: 'Add spare parts quickly and handle customer orders efficiently.' },
];

const techStack = [
  { category: 'Frontend', items: [
    { name: 'React 18', desc: 'Component-based UI library' },
    { name: 'TypeScript', desc: 'Type-safe JavaScript' },
    { name: 'Vite', desc: 'Fast build tool & dev server' },
    { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
    { name: 'shadcn/ui', desc: 'Premium UI component library' },
  ]},
  { category: 'Data & Storage', items: [
    { name: 'Dexie.js', desc: 'IndexedDB wrapper for offline storage' },
    { name: 'IndexedDB', desc: 'Browser-native local database' },
  ]},
  { category: 'Charts & Exports', items: [
    { name: 'Recharts', desc: 'React charting library' },
    { name: 'jsPDF', desc: 'PDF generation' },
    { name: 'xlsx', desc: 'Excel/CSV export' },
    { name: 'html-to-image', desc: 'Image capture for bills' },
  ]},
  { category: 'Cloud & Sync', items: [
    { name: 'Google Drive API', desc: 'Optional cloud backup' },
  ]},
];

const categoryIcons: Record<string, React.ElementType> = {
  'Frontend': Code2,
  'Data & Storage': Database,
  'Charts & Exports': LineChart,
  'Cloud & Sync': Cloud,
};

const changelog = [
  {
    version: '1.2.0',
    date: 'March 2026',
    changes: [
      'Added About, Privacy Policy & Terms pages',
      'Version changelog section',
      'Settings persistence across restarts',
      'Error boundary for crash protection',
    ],
  },
  {
    version: '1.1.0',
    date: 'February 2026',
    changes: [
      'Professional Bill Generator with PDF/image export',
      'Bulk actions for inventory table view',
      'Google Drive auto-sync',
      'Advanced theme & typography controls',
    ],
  },
  {
    version: '1.0.0',
    date: 'January 2026',
    changes: [
      'Initial release',
      'Inventory management with CRUD operations',
      'Sales recording & profit tracking',
      'Reports & analytics with charts',
      'Offline-first architecture with Dexie.js',
    ],
  },
];

export default function About() {
  return (
    <AppLayout>
      <Header title="About" showBack />
      <div className="p-4 space-y-4 pb-8">
        {/* Hero */}
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Inventory Manager App 🛠️</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate offline companion for spare parts and hardware management in Pakistan 🇵🇰.
              Designed to help small and medium shop owners manage stock, sales, and reports smoothly,
              without relying on an internet connection.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tech Stack 💻</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {techStack.map((group) => {
              const Icon = categoryIcons[group.category] || Code2;
              return (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">{group.category}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <div key={item.name} className="rounded-lg bg-muted/50 p-2.5">
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Developer 👨‍💻</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Zeeshan Khan</p>
                <p className="text-xs text-muted-foreground">Expert in modern Android & "Vibe Coding" techniques</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:zeeshankhan25102006@gmail.com" className="text-primary underline text-xs">
                zeeshankhan25102006@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Why choose our app?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We focus on <strong>reliability, offline usability, and real-time local database integrity</strong>. 
              Every action you perform is stored correctly, even if the phone restarts or the app closes unexpectedly.
            </p>
          </CardContent>
        </Card>

        {/* Version History */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Version History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {changelog.map((release, idx) => (
              <div key={release.version} className="relative">
                {idx < changelog.length - 1 && (
                  <div className="absolute left-[18px] top-8 bottom-0 w-px bg-border" />
                )}
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default" className="text-[11px]">v{release.version}</Badge>
                      <span className="text-xs text-muted-foreground">{release.date}</span>
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {release.changes.map((change) => (
                        <li key={change} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
