import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useI18n } from '../../hooks/useI18n';
import LoginButton from '../auth/LoginButton';
import LanguageSelector from '../i18n/LanguageSelector';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import type { TranslationKey } from '../../i18n';
import AccountDropdown from '../account/AccountDropdown';
import UserAvatar from '../account/UserAvatar';

interface AppHeaderProps {
  onShowPolicies: () => void;
}

export default function AppHeader({ onShowPolicies }: AppHeaderProps) {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/pc-logo.dim_256x256.png" alt={t('appName')} className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold font-brand text-foreground">{t('appName')}</h1>
            {userProfile && (
              <AccountDropdown userProfile={userProfile} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userProfile && (
            <UserAvatar userProfile={userProfile} size="sm" className="hidden sm:flex" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowPolicies}
            className="hidden sm:flex"
          >
            {t('headerTransparency')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <LanguageSelector />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
