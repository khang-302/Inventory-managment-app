import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { saveCrashReport, markLastCrashPending, getEmailMailtoUrl } from '@/services/crashReportService';
import type { CrashReport } from '@/types/crashReport';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  crashReport: CrashReport | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, crashReport: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    saveCrashReport(error, {
      currentScreen: window.location.pathname,
      lastAction: 'UI Render Error',
    }).then((report) => {
      markLastCrashPending(report.id);
      this.setState({ crashReport: report });
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, crashReport: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleSendReport = () => {
    if (this.state.crashReport) {
      window.open(getEmailMailtoUrl(this.state.crashReport), '_blank');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Your data is safe.
            </p>
            {this.state.crashReport && (
              <p className="text-xs font-mono text-muted-foreground">
                {this.state.crashReport.errorCode}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              {this.state.crashReport && (
                <Button size="sm" onClick={this.handleSendReport} className="w-full">
                  <Mail className="h-4 w-4 mr-1.5" />
                  Send Error Report
                </Button>
              )}
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button variant="secondary" size="sm" onClick={this.handleReload}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Reload App
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
