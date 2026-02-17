import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin, useRecordLoginEvent } from './hooks/useQueries';
import { useAdminGate } from './hooks/useAdminGate';
import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat';
import { useBatteryReporting } from './hooks/useBatteryReporting';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from './i18n/I18nProvider';
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import AdminPasswordGate from './components/admin/AdminPasswordGate';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildHome from './pages/child/ChildHome';
import AdminPanel from './pages/admin/AdminPanel';
import TransparencyPolicies from './pages/TransparencyPolicies';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { isGatePassed } = useAdminGate();
  const recordLogin = useRecordLoginEvent();
  const [loginRecorded, setLoginRecorded] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);

  const isAuthenticated = !!identity;

  usePresenceHeartbeat();
  useBatteryReporting();

  useEffect(() => {
    const sessionKey = 'login_recorded';
    if (isAuthenticated && !loginRecorded && !sessionStorage.getItem(sessionKey)) {
      const device = navigator.userAgent;
      recordLogin.mutate(device, {
        onSuccess: () => {
          sessionStorage.setItem(sessionKey, 'true');
          setLoginRecorded(true);
        },
        onError: () => {
          // Silently fail - login recording is optional
        },
      });
    }
  }, [isAuthenticated, loginRecorded, recordLogin]);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <AppHeader onShowPolicies={() => setShowPolicies(true)} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Controle Parental</h1>
              <p className="text-lg text-muted-foreground">
                Mantenha sua família segura e conectada
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <p className="text-muted-foreground mb-4">
                Faça login para acessar o painel de controle parental
              </p>
            </div>
          </div>
        </main>
        <AppFooter onShowPolicies={() => setShowPolicies(true)} />
        {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader onShowPolicies={() => setShowPolicies(true)} />
        <main className="flex-1 flex items-center justify-center p-4">
          <ProfileSetupDialog />
        </main>
        <AppFooter onShowPolicies={() => setShowPolicies(true)} />
        {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
      </div>
    );
  }

  if (isAdmin && !isGatePassed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader onShowPolicies={() => setShowPolicies(true)} />
        <main className="flex-1 flex items-center justify-center p-4">
          <AdminPasswordGate />
        </main>
        <AppFooter onShowPolicies={() => setShowPolicies(true)} />
        {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader onShowPolicies={() => setShowPolicies(true)} />
      <main className="flex-1">
        {isAdmin ? (
          <AdminPanel />
        ) : userProfile?.role === 'parent' ? (
          <ParentDashboard />
        ) : (
          <ChildHome />
        )}
      </main>
      <AppFooter onShowPolicies={() => setShowPolicies(true)} />
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
