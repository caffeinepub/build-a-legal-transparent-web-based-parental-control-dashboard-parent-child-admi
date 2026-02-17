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
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl text-white">{t('adminPasswordGateTitle')}</CardTitle>
        <CardDescription className="text-blue-200">
          {t('adminPasswordGateDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verify">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
            <TabsTrigger 
              value="verify"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-blue-200"
            >
              {t('adminPasswordGateTabVerify')}
            </TabsTrigger>
            <TabsTrigger 
              value="change" 
              disabled={!isAllowlisted && !allowlistLoading}
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-blue-200 disabled:opacity-50"
            >
              {t('adminPasswordGateTabChange')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="verify" className="mt-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-100">
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
                    className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    aria-label={t(showPassword ? 'adminPasswordGateHidePassword' : 'adminPasswordGateShowPassword')}
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={verifyPassword.isPending || !password.trim()}
              >
                {verifyPassword.isPending ? t('adminPasswordGateVerifying') : t('adminPasswordGateVerifyButton')}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="change" className="mt-6">
            {!isAllowlisted && !allowlistLoading ? (
              <div className="text-center py-6 text-blue-200">
                {t('adminPasswordGateChangeRestricted')}
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-blue-100">{t('adminPasswordGateOldPasswordLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder={t('adminPasswordGateOldPasswordPlaceholder')}
                      required
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                      aria-label={t(showOldPassword ? 'adminPasswordGateHidePassword' : 'adminPasswordGateShowPassword')}
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
                  <Label htmlFor="newPassword" className="text-blue-100">{t('adminPasswordGateNewPasswordLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('adminPasswordGateNewPasswordPlaceholder')}
                      required
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                      aria-label={t(showNewPassword ? 'adminPasswordGateHidePassword' : 'adminPasswordGateShowPassword')}
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
                  <Label htmlFor="confirmPassword" className="text-blue-100">{t('adminPasswordGateConfirmPasswordLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('adminPasswordGateConfirmPasswordPlaceholder')}
                      required
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                      aria-label={t(showConfirmPassword ? 'adminPasswordGateHidePassword' : 'adminPasswordGateShowPassword')}
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
  );
}
