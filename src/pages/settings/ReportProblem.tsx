import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquareWarning } from 'lucide-react';
import { getManualReportMailtoUrl } from '@/services/crashReportService';
import { toast } from 'sonner';

export default function ReportProblem() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');

  const handleSend = () => {
    if (!description.trim()) {
      toast.error('Please describe the problem');
      return;
    }
    const url = getManualReportMailtoUrl(description.trim());
    window.open(url, '_blank');
    toast.success('Opening email client...');
  };

  return (
    <AppLayout>
      <Header title="Report a Problem" showBack onBack={() => navigate('/settings')} />

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <MessageSquareWarning className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-base">Describe the Issue</CardTitle>
                <CardDescription className="text-xs">
                  Tell us what happened. Device and app info will be attached automatically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: When I try to generate a bill and tap Share, the app shows a blank screen..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="text-sm"
            />
            <Button className="w-full" onClick={handleSend} disabled={!description.trim()}>
              <Mail className="h-4 w-4 mr-1.5" />
              Send Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Privacy:</strong> Only technical information (device model, screen resolution, app version) is included. No personal data, inventory, or billing records are ever shared.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
