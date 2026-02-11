import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildHome from './pages/child/ChildHome';
import AdminPanel from './pages/admin/AdminPanel';
import TransparencyPolicies from './pages/TransparencyPolicies';
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import { Shield } from 'lucide-react';
import { AppRole } from './backend';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const [showPolicies, setShowPolicies] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-amber-600 dark:text-amber-400 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/generated/pc-logo.dim_256x256.png" alt="FamilyGuard" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">FamilyGuard</h1>
            </div>
            <LoginButton />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <img src="/assets/generated/pc-hero.dim_1200x600.png" alt="Family Safety" className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg" />
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-amber-900 dark:text-amber-100">
                Transparent Parental Guidance
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A legal, consent-based web platform for families. Set healthy screen time limits, review activity reports, and maintain open communication—all with full transparency.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">✓ Consent-Based</p>
                  <p className="text-sm text-muted-foreground">Child approval required</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">✓ Transparent</p>
                  <p className="text-sm text-muted-foreground">No hidden monitoring</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">✓ Legal</p>
                  <p className="text-sm text-muted-foreground">Compliant with privacy laws</p>
                </div>
              </div>
              <button
                onClick={() => setShowPolicies(true)}
                className="text-amber-700 dark:text-amber-300 underline hover:no-underline"
              >
                Learn about our transparency policies
              </button>
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader onShowPolicies={() => setShowPolicies(true)} />
        <ProfileSetupDialog />
        {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
      </div>
    );
  }

  const renderRoleView = () => {
    if (isAdmin) {
      return <AdminPanel />;
    }

    if (userProfile?.role === AppRole.parent) {
      return <ParentDashboard />;
    }

    if (userProfile?.role === AppRole.child) {
      return <ChildHome />;
    }

    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unknown role. Please contact support.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader onShowPolicies={() => setShowPolicies(true)} />
      <main className="container mx-auto px-4 py-8">
        {renderRoleView()}
      </main>
      <AppFooter onShowPolicies={() => setShowPolicies(true)} />
      {showPolicies && <TransparencyPolicies onClose={() => setShowPolicies(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}
