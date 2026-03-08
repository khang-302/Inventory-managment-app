import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AdvancedThemeProvider } from "@/contexts/ThemeContext";
import { TypographyProvider } from "@/contexts/TypographyContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddEditPart from "./pages/AddEditPart";
import PartDetails from "./pages/PartDetails";
import RecordSale from "./pages/RecordSale";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import BillHistory from "./pages/BillHistory";
import BillCreate from "./pages/BillCreate";
import BillSettingsPage from "./pages/BillSettings";
import NotFound from "./pages/NotFound";

// Settings sub-pages
import LanguageLocalization from "./pages/settings/LanguageLocalization";
import ThemeAppearance from "./pages/settings/ThemeAppearance";
import NavigationLayout from "./pages/settings/NavigationLayout";
import GoogleDriveSync from "./pages/settings/GoogleDriveSync";
import BackupRestore from "./pages/settings/BackupRestore";
import Notifications from "./pages/settings/Notifications";
import ActivityLogSettings from "./pages/settings/ActivityLogSettings";
import AppLogo from "./pages/settings/AppLogo";
import Branding from "./pages/settings/Branding";
import TypographySettings from "./pages/settings/TypographySettings";
import About from "./pages/settings/About";
import PrivacyPolicy from "./pages/settings/PrivacyPolicy";
import TermsConditions from "./pages/settings/TermsConditions";
import AutocompleteSettings from "./pages/settings/AutocompleteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <AdvancedThemeProvider>
          <TypographyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/add" element={<AddEditPart />} />
              <Route path="/inventory/edit/:id" element={<AddEditPart />} />
              <Route path="/inventory/:id" element={<PartDetails />} />
              <Route path="/sale" element={<RecordSale />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/language" element={<LanguageLocalization />} />
              <Route path="/settings/theme" element={<ThemeAppearance />} />
              <Route path="/settings/navigation" element={<NavigationLayout />} />
              <Route path="/settings/sync" element={<GoogleDriveSync />} />
              <Route path="/settings/backup" element={<BackupRestore />} />
              <Route path="/settings/notifications" element={<Notifications />} />
              <Route path="/settings/activity-log" element={<ActivityLogSettings />} />
              <Route path="/settings/logo" element={<AppLogo />} />
              <Route path="/settings/branding" element={<Branding />} />
              <Route path="/settings/typography" element={<TypographySettings />} />
              <Route path="/settings/about" element={<About />} />
              <Route path="/settings/privacy" element={<PrivacyPolicy />} />
              <Route path="/settings/terms" element={<TermsConditions />} />
              <Route path="/settings/autocomplete" element={<AutocompleteSettings />} />
              <Route path="/bills" element={<BillHistory />} />
              <Route path="/bills/create" element={<BillCreate />} />
              <Route path="/bills/edit/:id" element={<BillCreate />} />
              <Route path="/bills/settings" element={<BillSettingsPage />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </ErrorBoundary>
          </BrowserRouter>
          </TypographyProvider>
          </AdvancedThemeProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
