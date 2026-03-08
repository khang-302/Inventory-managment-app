import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2, Database, AlertTriangle, Copyright, Mail, RefreshCw } from 'lucide-react';

const sections = [
  {
    icon: CheckCircle2,
    title: 'Acceptance of Terms',
    content: 'By using the Inventory Manager App, you agree to the following conditions.',
  },
  {
    icon: Database,
    title: 'Use of App',
    items: [
      'The app is offline-first. You are responsible for managing your local device data.',
      'Optional cloud sync is asynchronous; the app is not responsible for sync errors if disabled.',
    ],
  },
  {
    icon: Database,
    title: 'Data Integrity',
    items: [
      'Inventory, sales, and reports are stored in IndexedDB, and the app guarantees correct read/write/update behavior.',
      'All deletions are soft deletes to protect against accidental loss.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Limitations',
    items: [
      'The developer is not liable for financial losses due to mismanagement of stock or user errors.',
      'The app is intended for hardware and spare parts businesses in Pakistan; functionality may vary outside this context.',
    ],
  },
  {
    icon: Copyright,
    title: 'Intellectual Property',
    content: 'All app design, features, and code are the property of Zeeshan Khan.',
  },
  {
    icon: RefreshCw,
    title: 'Modifications',
    content: 'Terms may be updated; updates will be visible in the About / Settings section.',
  },
];

export default function TermsConditions() {
  return (
    <AppLayout>
      <Header title="Terms & Conditions" showBack />
      <div className="p-4 space-y-4 pb-8">
        {/* Header */}
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold">Terms & Conditions 📜</h2>
          </CardContent>
        </Card>

        {/* Sections */}
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <s.icon className="h-4 w-4 text-primary" />
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {s.content && (
                <p className="text-sm text-muted-foreground">{s.content}</p>
              )}
              {s.items && (
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Contact */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Contact & Support</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:zeeshankhan25102006@gmail.com" className="text-primary underline text-xs">
                zeeshankhan25102006@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
