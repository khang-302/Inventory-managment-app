import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useApp } from '@/contexts/AppContext';
import { 
  Package, DollarSign, BarChart3, Shield, Palette, Globe, 
  ArrowLeftRight, FileText, Zap, Code2, Database, LineChart,
  Cloud, Mail, Heart, Info, History, Bell, Search, HardDrive,
  Trash2, WifiOff, ShieldCheck, BadgeIndianRupee, EyeOff,
  type LucideIcon
} from 'lucide-react';

const APP_VERSION = '1.3.0';

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Package, title: 'Inventory Management', desc: 'Full CRUD with UUID-based IDs, brand/category filtering, low-stock highlighting, and bulk actions.' },
  { icon: DollarSign, title: 'Sales & Profit Tracking', desc: 'Record sales with auto-calculated profit, stock deduction, and activity logging in one step.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue, profit, category, and brand charts with custom date ranges. Export to PDF, Excel, or CSV.' },
  { icon: FileText, title: 'Professional Bill Generator', desc: 'Create branded bills with custom logos, export as PDF or image, and manage bill history.' },
  { icon: Bell, title: 'Notification System', desc: 'Custom reminders, automated low-stock alerts, scheduled notifications, and full notification history.' },
  { icon: Search, title: 'Smart Autocomplete', desc: 'Intelligent suggestions for part names, brands, and categories based on your existing data.' },
  { icon: HardDrive, title: 'Backup & Restore', desc: 'Full local backup with JSON/Excel/CSV export. Restore from file with validation.' },
  { icon: Cloud, title: 'Google Drive Sync', desc: 'Optional async cloud backup with encrypted API key storage. Your data, your control.' },
  { icon: Palette, title: 'Theme & AMOLED Black', desc: 'Light, dark, and true AMOLED black modes with custom color presets and section overrides.' },
  { icon: Code2, title: 'Typography & Icon Sizing', desc: 'Adjust font family, size, weight, and icon dimensions across the entire app.' },
  { icon: Trash2, title: 'Soft Delete System', desc: 'All deletions are archived — no accidental data loss. Restore anytime.' },
  { icon: Zap, title: 'QuickSell & Quick Actions', desc: 'Sell parts instantly from dashboard. Quick-add buttons for common workflows.' },
];

const techStack = [
  { category: 'Frontend', icon: Code2, items: [
    { name: 'React 18', desc: 'Component-based UI' },
    { name: 'TypeScript', desc: 'Type-safe JavaScript' },
    { name: 'Vite', desc: 'Fast build & dev server' },
    { name: 'Tailwind CSS', desc: 'Utility-first styling' },
    { name: 'shadcn/ui', desc: 'Premium components' },
  ]},
  { category: 'Data & Storage', icon: Database, items: [
    { name: 'Dexie.js', desc: 'IndexedDB wrapper' },
    { name: 'IndexedDB', desc: 'Browser-native DB' },
  ]},
  { category: 'Charts & Exports', icon: LineChart, items: [
    { name: 'Recharts', desc: 'React charting' },
    { name: 'jsPDF', desc: 'PDF generation' },
    { name: 'xlsx', desc: 'Excel/CSV export' },
    { name: 'html-to-image', desc: 'Bill image capture' },
  ]},
  { category: 'Notifications', icon: Bell, items: [
    { name: 'Sonner', desc: 'Toast notifications' },
    { name: 'Custom Scheduler', desc: 'Scheduled alerts' },
  ]},
  { category: 'Cloud & Sync', icon: Cloud, items: [
    { name: 'Google Drive API', desc: 'Optional backup' },
  ]},
];

const whyChoose: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: WifiOff, title: 'Offline-First', desc: 'Works 100% without internet. No cloud dependency.' },
  { icon: ShieldCheck, title: 'Crash-Safe', desc: 'Data integrity guaranteed even on unexpected restarts.' },
  { icon: BadgeIndianRupee, title: 'Rs Only', desc: 'Built for Pakistan. All prices in Pakistani Rupees.' },
  { icon: EyeOff, title: 'No Tracking', desc: 'Zero analytics, no third-party SDKs, complete privacy.' },
];

const changelog = [
  {
    version: '1.3.0',
    date: 'March 2026',
    changes: [
      'Notification system with custom reminders & scheduled alerts',
      'Notification history with bulk select & delete',
      'Smart autocomplete for parts, brands, and categories',
      'Enhanced About, Privacy Policy & Terms pages',
      'Bulk actions for inventory management',
    ],
  },
  {
    version: '1.2.0',
    date: 'February 2026',
    changes: [
      'Professional Bill Generator with PDF/image export',
      'Bill history and bill settings customization',
      'Google Drive auto-sync with encrypted API key',
      'Advanced theme presets & section overrides',
      'Typography and icon size controls',
    ],
  },
  {
    version: '1.1.0',
    date: 'January 2026',
    changes: [
      'Activity log with filtering and export',
      'Backup & restore functionality',
      'Settings persistence across restarts',
      'Error boundary for crash protection',
    ],
  },
  {
    version: '1.0.0',
    date: 'December 2025',
    changes: [
      'Initial release',
      'Inventory management with full CRUD',
      'Sales recording & profit tracking',
      'Reports & analytics with interactive charts',
      'Offline-first architecture with Dexie.js',
    ],
  },
];

export default function About() {
  const { totalParts, totalBrands, totalCategories } = useApp();

  return (
    <AppLayout>
      <Header title="About" showBack />
      <div className="p-4 space-y-4 pb-8">
        {/* Hero */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto ring-2 ring-primary/20">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold">Inventory Manager App</h1>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="default" className="text-[11px]">v{APP_VERSION}</Badge>
                <Badge variant="secondary" className="text-[11px]">🇵🇰 Made in Pakistan</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Your ultimate offline companion for spare parts and hardware inventory management.
              Built for reliability, speed, and simplicity.
            </p>
          </div>
        </Card>

        {/* Live Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📊 App Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Parts', value: totalParts },
                { label: 'Brands', value: totalBrands },
                { label: 'Categories', value: totalCategories },
              ].map((stat) => (
                <div key={stat.label} className="text-center rounded-lg bg-muted/50 p-3">
                  <p className="text-lg font-bold text-primary">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">⚡ Key Features</CardTitle>
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

        {/* Why Choose Us */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🏆 Why Choose Us?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {whyChoose.map((item) => (
                <div key={item.title} className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">❓ Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              {[
                { id: 'faq-1', cat: 'Offline', q: 'Does this app need internet?', a: 'No. The app works 100% offline. Internet is only needed if you choose to enable the optional Google Drive sync feature.' },
                { id: 'faq-2', cat: 'Offline', q: 'What happens if my phone restarts unexpectedly?', a: 'Your data is safe. All writes to IndexedDB are crash-safe, so no data is lost even during unexpected shutdowns or restarts.' },
                { id: 'faq-3', cat: 'Offline', q: 'Can I use this on multiple devices?', a: 'Data is stored locally per device. To transfer data, use Settings → Backup & Restore to export and import your database.' },
                { id: 'faq-4', cat: 'Data', q: 'Where is my data stored?', a: "All data is stored locally in your browser's IndexedDB database. It is never sent to any external server or third-party service." },
                { id: 'faq-5', cat: 'Data', q: 'Can I recover deleted items?', a: 'Yes. The app uses a soft-delete system — all deletions are archived and can be restored at any time.' },
                { id: 'faq-6', cat: 'Data', q: 'How do I back up my data?', a: 'Go to Settings → Backup & Restore. You can export your entire database as JSON, Excel, or CSV and restore it later from any exported file.' },
                { id: 'faq-7', cat: 'Cloud', q: 'Is Google Drive sync required?', a: 'No, it is completely optional. You provide your own Google Drive API key, and sync only happens when you explicitly enable it.' },
                { id: 'faq-8', cat: 'Cloud', q: 'Is my API key safe?', a: 'Yes. Your API key is encrypted using AES-GCM with PBKDF2 key derivation before being stored locally. It never leaves your device.' },
              ].map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-sm gap-2 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] shrink-0">{faq.cat}</Badge>
                      <span>{faq.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">💻 Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {techStack.map((group) => (
              <div key={group.category}>
                <div className="flex items-center gap-2 mb-2">
                  <group.icon className="h-4 w-4 text-primary" />
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
            ))}
          </CardContent>
        </Card>

        {/* Developer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">👨‍💻 Developer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Zeeshan Khan</p>
                <p className="text-xs text-muted-foreground">Full-Stack Developer & "Vibe Coding" Expert</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:zeeshankhan25102006@gmail.com" className="text-primary underline text-xs">
                zeeshankhan25102006@gmail.com
              </a>
            </div>
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

        {/* Footer */}
        <div className="text-center pt-2 pb-4 space-y-1">
          <p className="text-[11px] text-muted-foreground">Inventory Manager App v{APP_VERSION}</p>
          <p className="text-[11px] text-muted-foreground">© 2025–2026 Zeeshan Khan. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
}
