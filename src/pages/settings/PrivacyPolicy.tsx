import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Package, DollarSign, Globe, FileText, Mail, UserCheck } from 'lucide-react';

const dataItems = [
  { icon: Package, title: 'Inventory Data', desc: 'Stored locally in IndexedDB for offline-first functionality.' },
  { icon: DollarSign, title: 'Sales & Reports Data', desc: 'Tracked for your professional reporting; never sent externally by default.' },
  { icon: Globe, title: 'Optional Cloud Sync', desc: 'If enabled, data may be stored in your Google Drive. Only you have access.' },
  { icon: FileText, title: 'Billing Data', desc: 'Bills are generated locally and saved in PDF or image format; not sent anywhere unless you share manually.' },
];

const rights = [
  'You can view, edit, or delete any inventory or sales record.',
  'All deletions are soft deletes, meaning items are archived for safety.',
  'You may disable cloud sync at any time.',
];

export default function PrivacyPolicy() {
  return (
    <AppLayout>
      <Header title="Privacy Policy" showBack />
      <div className="p-4 space-y-4 pb-8">
        {/* Intro */}
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold">Privacy Policy 🔒</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your privacy matters. This app is designed to <strong>store all your data locally on your device</strong>. 
              No personal or inventory data is shared unless you explicitly use the optional cloud sync feature.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Collection & Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {dataItems.map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {rights.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Contact Us</p>
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
