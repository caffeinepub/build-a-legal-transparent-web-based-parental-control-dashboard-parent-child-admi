import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../hooks/useI18n';
import { useAdminGate } from '../../hooks/useAdminGate';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { clearGate } = useAdminGate();
  const { t } = useI18n();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      clearGate();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          clearGate();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      className={isAuthenticated ? '' : 'bg-navy-600 hover:bg-navy-700 text-white'}
    >
      {disabled ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t('loggingIn')}
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          {t('logout')}
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          {t('login')}
        </>
      )}
    </Button>
  );
}
