import { useState, useMemo } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, AlertCircle } from 'lucide-react';
import { AppRole } from '../../backend';
import { formatPhoneNumber, parsePhoneNumberInput, isValidPhoneNumber, normalizePhoneNumber } from '../../utils/phoneNumber';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ALLOWLISTED_EMAILS = [
  'tigguinrodrigues@gmail.com',
  'tigguinclash@gmail.com',
];

const ALLOWLISTED_PHONE = '91980115950'; // Normalized format (digits only)

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'child' | 'admin'>('parent');
  const [phoneNumber, setPhoneNumber] = useState('');
  const saveProfile = useSaveCallerUserProfile();
  const { t } = useI18n();

  // Check if the entered name or phone matches the allowlist
  const isAllowlisted = useMemo(() => {
    const nameLower = name.trim().toLowerCase();
    const emailMatch = ALLOWLISTED_EMAILS.some(email => email.toLowerCase() === nameLower);
    
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const phoneMatch = normalizedPhone === ALLOWLISTED_PHONE;
    
    return emailMatch || phoneMatch;
  }, [name, phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePhoneNumberInput(e.target.value);
    setPhoneNumber(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let appRole: AppRole;
    if (role === 'parent') {
      appRole = AppRole.parent;
    } else if (role === 'child') {
      appRole = AppRole.child;
    } else {
      appRole = AppRole.admin;
    }
    
    // Only include phone number for parents if provided and valid
    const phoneNumberValue = role === 'parent' && phoneNumber && isValidPhoneNumber(phoneNumber)
      ? `(${phoneNumber.slice(0, 2)})${phoneNumber.slice(2)}`
      : undefined;

    saveProfile.mutate({ 
      name: name.trim(), 
      role: appRole,
      phoneNumber: phoneNumberValue,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">{t('profileSetupTitle')}</CardTitle>
          <CardDescription>
            {t('profileSetupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profileSetupNameLabel')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profileSetupNamePlaceholder')}
                required
              />
            </div>

            {role === 'parent' && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('profileSetupPhoneLabel')}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder={t('profileSetupPhonePlaceholder')}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profileSetupPhoneHelp')}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Label>{t('profileSetupRoleLabel')}</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as 'parent' | 'child' | 'admin')}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent" className="flex-1 cursor-pointer">
                    <div className="font-semibold">{t('profileSetupParentTitle')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('profileSetupParentDesc')}
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="child" id="child" />
                  <Label htmlFor="child" className="flex-1 cursor-pointer">
                    <div className="font-semibold">{t('profileSetupChildTitle')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('profileSetupChildDesc')}
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 p-3 border rounded-lg ${isAllowlisted ? 'hover:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                  <RadioGroupItem value="admin" id="admin" disabled={!isAllowlisted} />
                  <Label htmlFor="admin" className={`flex-1 ${isAllowlisted ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <div className="font-semibold">{t('profileSetupAdminTitle')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('profileSetupAdminDesc')}
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              {!isAllowlisted && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('profileSetupAdminRestricted')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={saveProfile.isPending || !name.trim()}
            >
              {saveProfile.isPending ? t('profileSetupCreating') : t('continue')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
