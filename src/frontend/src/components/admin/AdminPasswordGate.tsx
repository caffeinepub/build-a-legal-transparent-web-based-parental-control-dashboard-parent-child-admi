import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertCircle } from 'lucide-react';
import { useVerifyAdminPassword, useSetAdminPassword } from '../../hooks/useQueries';
import { useAdminGate } from '../../hooks/useAdminGate';
import { useI18n } from '../../hooks/useI18n';

export default function AdminPasswordGate() {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [changeError, setChangeError] = useState('');

  const { passGate } = useAdminGate();
  const verifyPassword = useVerifyAdminPassword();
  const setAdminPassword = useSetAdminPassword();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    try {
      const isValid = await verifyPassword.mutateAsync(password);
      if (isValid) {
        passGate();
      } else {
        setVerifyError(t('adminGateErrorIncorrect'));
      }
    } catch (error: any) {
      setVerifyError(error.message || t('adminGateErrorIncorrect'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (newPassword !== confirmPassword) {
      setChangeError(t('adminGateErrorMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setChangeError(t('adminGateErrorLength'));
      return;
    }

    try {
      await setAdminPassword.mutateAsync(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setChangeError(error.message || t('adminGateErrorIncorrect'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-navy-600 dark:text-navy-400" />
            {t('adminGateTitle')}
          </CardTitle>
          <CardDescription>{t('adminGateDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verify">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verify">{t('adminGateTabVerify')}</TabsTrigger>
              <TabsTrigger value="change">{t('adminGateTabChange')}</TabsTrigger>
            </TabsList>

            <TabsContent value="verify">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('adminGatePasswordLabel')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('adminGatePasswordPlaceholder')}
                    required
                  />
                </div>

                {verifyError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{verifyError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white"
                  disabled={verifyPassword.isPending}
                >
                  {verifyPassword.isPending ? t('adminGateVerifying') : t('adminGateAccessButton')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="change">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('adminGateNewPasswordLabel')}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('adminGateNewPasswordPlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('adminGateConfirmPasswordLabel')}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('adminGateConfirmPasswordPlaceholder')}
                    required
                  />
                </div>

                {changeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{changeError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white"
                  disabled={setAdminPassword.isPending}
                >
                  {setAdminPassword.isPending ? t('adminGateUpdating') : t('adminGateChangeButton')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
