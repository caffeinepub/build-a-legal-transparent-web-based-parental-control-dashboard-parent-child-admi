import { useGetCallerUserProfile } from '../../hooks/useQueries';
import LoginButton from '../auth/LoginButton';
import { Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { AppRole } from '../../backend';

interface AppHeaderProps {
  onShowPolicies: () => void;
}

const getRoleLabel = (role: AppRole): string => {
  switch (role) {
    case AppRole.parent:
      return 'parent';
    case AppRole.child:
      return 'child';
    case AppRole.admin:
      return 'admin';
    default:
      return 'user';
  }
};

export default function AppHeader({ onShowPolicies }: AppHeaderProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/pc-logo.dim_256x256.png" alt="FamilyGuard" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">FamilyGuard</h1>
            {userProfile && (
              <p className="text-xs text-muted-foreground">
                {userProfile.name} • {getRoleLabel(userProfile.role)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowPolicies}
            className="hidden sm:flex"
          >
            Transparency
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
