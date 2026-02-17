import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { useAdminGate } from './hooks/useAdminGate';
import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from './i18n/I18nProvider';
import { useI18n } from './hooks/useI18n';
import LoginButton from './components/auth/LoginButton';
import LanguageSelector from './components/i18n/LanguageSelector';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildHome from './pages/child/ChildHome';
import AdminPanel from './pages/admin/AdminPanel';
import AdminPasswordGate from './components/admin/AdminPasswordGate';
import TransparencyPolicies from './pages/TransparencyPolicies';
import { AppRole } from './backend';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function AppContent() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { clearGate, isGatePassed } = useAdminGate();
  const { t } = useI18n();
  const [showPolicies, setShowPolicies] = useState(false);

  // Start presence heartbeat for authenticated users
  usePresenceHeartbeat();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    const handleLogout = () => {
      clearGate();
    };

    if (!isAuthenticated) {
      handleLogout();
    }
  }, [isAuthenticated, clearGate]);

  if (isInitializing || (isAuthenticated && (profileLoading || adminLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/generated/pc-logo.dim_256x256.png" alt={t('appName')} className="w-10 h-10" />
              <h1 className="text-xl font-bold font-brand text-foreground">{t('appName')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <LoginButton />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold font-brand text-foreground">
                {t('landingHero')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('landingDescription')}
              </p>
            </div>

            <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/pc-hero.dim_1200x600.png"
                alt={t('appName')}
                className="w-full h-auto"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-card rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {t('landingFeature1Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('landingFeature1Desc')}
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {t('landingFeature2Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('landingFeature2Desc')}
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {t('landingFeature3Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('landingFeature3Desc')}
                </p>
              </div>
            </div>

            <div className="pt-8">
              <LoginButton />
            </div>
          </div>
        </main>

        <AppFooter onShowPolicies={() => setShowPolicies(true)} />
        {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <AppHeader onShowPolicies={() => setShowPolicies(true)} />
      <main className="container mx-auto px-4 py-8">
        {isAdmin ? (
          isGatePassed ? (
            <AdminPanel />
          ) : (
            <AdminPasswordGate />
          )
        ) : userProfile?.role === AppRole.parent ? (
          <ParentDashboard />
        ) : userProfile?.role === AppRole.child ? (
          <ChildHome />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('roleUnknown')}</p>
          </div>
        )}
      </main>
      <AppFooter onShowPolicies={() => setShowPolicies(true)} />
      {showProfileSetup && <ProfileSetupDialog />}
      {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <AppContent />
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
