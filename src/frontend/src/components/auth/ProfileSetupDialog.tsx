import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield } from 'lucide-react';
import { AppRole } from '../../backend';
import { formatPhoneNumber, parsePhoneNumberInput, isValidPhoneNumber } from '../../utils/phoneNumber';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [phoneNumber, setPhoneNumber] = useState('');
  const saveProfile = useSaveCallerUserProfile();
  const { t } = useI18n();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePhoneNumberInput(e.target.value);
    setPhoneNumber(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const appRole: AppRole = role === 'parent' ? AppRole.parent : AppRole.child;
    
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

            <div className="space-y-3">
              <Label>{t('profileSetupRoleLabel')}</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as 'parent' | 'child')}>
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
              </RadioGroup>
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
