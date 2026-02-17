import { useState } from 'react';
import { useVerifyAdminPassword, useChangeAdminPassword, useIsCallerAllowlistedAdmin } from '../../hooks/useQueries';
import { useAdminGate } from '../../hooks/useAdminGate';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPasswordGate() {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const verifyPassword = useVerifyAdminPassword();
  const changePassword = useChangeAdminPassword();
  const { data: isAllowlisted, isLoading: allowlistLoading } = useIsCallerAllowlistedAdmin();
  const { passGate } = useAdminGate();
  const { t } = useI18n();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim whitespace from password before verification
    const trimmedPassword = password.trim();
    
    if (!trimmedPassword) {
      toast.error(t('adminPasswordGateIncorrect'));
      return;
    }
    
    try {
      const isValid = await verifyPassword.mutateAsync(trimmedPassword);
      if (isValid) {
        passGate();
        toast.success(t('adminPasswordGateSuccess'));
      } else {
        toast.error(t('adminPasswordGateIncorrect'));
      }
    } catch (error) {
      toast.error(t('adminPasswordGateError'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim whitespace from passwords
    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    if (trimmedNewPassword !== trimmedConfirmPassword) {
      toast.error(t('adminPasswordGatePasswordMismatch'));
      return;
    }
    if (trimmedNewPassword.length < 8) {
      toast.error(t('adminPasswordGatePasswordTooShort'));
      return;
    }
    try {
      await changePassword.mutateAsync({ 
        oldPassword: trimmedOldPassword, 
        newPassword: trimmedNewPassword 
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Error toast is handled by the mutation
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">{t('adminPasswordGateTitle')}</CardTitle>
          <CardDescription>
            {t('adminPasswordGateDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verify">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verify">{t('adminPasswordGateTabVerify')}</TabsTrigger>
              <TabsTrigger value="change" disabled={!isAllowlisted && !allowlistLoading}>
                {t('adminPasswordGateTabChange')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="verify">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Lock className="inline w-4 h-4 mr-2" />
                    {t('adminPasswordGatePasswordLabel')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('adminPasswordGatePasswordPlaceholder')}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyPassword.isPending || !password.trim()}
                >
                  {verifyPassword.isPending ? t('adminPasswordGateVerifying') : t('adminPasswordGateVerifyButton')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="change">
              {!isAllowlisted && !allowlistLoading ? (
                <div className="text-center py-6 text-muted-foreground">
                  {t('adminPasswordGateChangeRestricted')}
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">{t('adminPasswordGateOldPasswordLabel')}</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder={t('adminPasswordGateOldPasswordPlaceholder')}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                      >
                        {showOldPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('adminPasswordGateNewPasswordLabel')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('adminPasswordGateNewPasswordPlaceholder')}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('adminPasswordGateConfirmPasswordLabel')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('adminPasswordGateConfirmPasswordPlaceholder')}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={changePassword.isPending || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                  >
                    {changePassword.isPending ? t('adminPasswordGateChanging') : t('adminPasswordGateChangeButton')}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
