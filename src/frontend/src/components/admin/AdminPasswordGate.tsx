import { useState } from 'react';
import { useVerifyAdminPassword, useChangeAdminPassword, useIsCallerAllowlistedAdmin } from '../../hooks/useQueries';
import { useAdminGate } from '../../hooks/useAdminGate';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPasswordGate() {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const verifyPassword = useVerifyAdminPassword();
  const changePassword = useChangeAdminPassword();
  const { data: isAllowlisted, isLoading: allowlistLoading } = useIsCallerAllowlistedAdmin();
  const { passGate } = useAdminGate();
  const { t } = useI18n();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isValid = await verifyPassword.mutateAsync(password);
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
    if (newPassword !== confirmPassword) {
      toast.error(t('adminPasswordGatePasswordMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('adminPasswordGatePasswordTooShort'));
      return;
    }
    try {
      await changePassword.mutateAsync({ oldPassword, newPassword });
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('adminPasswordGatePasswordPlaceholder')}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyPassword.isPending || !password}
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
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder={t('adminPasswordGateOldPasswordPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('adminPasswordGateNewPasswordLabel')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('adminPasswordGateNewPasswordPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('adminPasswordGateConfirmPasswordLabel')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('adminPasswordGateConfirmPasswordPlaceholder')}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={changePassword.isPending || !oldPassword || !newPassword || !confirmPassword}
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
