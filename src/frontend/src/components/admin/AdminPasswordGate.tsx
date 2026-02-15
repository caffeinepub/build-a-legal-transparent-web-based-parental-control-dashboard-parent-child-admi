import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { useVerifyAdminPassword, useSetAdminPassword } from '../../hooks/useQueries';
import { useAdminGate } from '../../hooks/useAdminGate';

export default function AdminPasswordGate() {
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
        setVerifyError('Incorrect password');
      }
    } catch (error: any) {
      setVerifyError(error.message || 'Verification failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (newPassword !== confirmPassword) {
      setChangeError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setChangeError('Password must be at least 8 characters');
      return;
    }

    try {
      await setAdminPassword.mutateAsync(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setChangeError(error.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-navy-600 dark:text-navy-400" />
            Admin Access
          </CardTitle>
          <CardDescription>
            Enter the admin password to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verify">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verify">Verify</TabsTrigger>
              <TabsTrigger value="change">Change Password</TabsTrigger>
            </TabsList>

            <TabsContent value="verify">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
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
                  {verifyPassword.isPending ? 'Verifying...' : 'Access Admin Panel'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="change">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
                  {setAdminPassword.isPending ? 'Updating...' : 'Change Password'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
