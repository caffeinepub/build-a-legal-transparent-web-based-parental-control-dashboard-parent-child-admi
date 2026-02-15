import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { formatPhoneNumber, parsePhoneNumberInput, isValidPhoneNumber } from '../../utils/phoneNumber';

export default function ParentPhoneNumberCard() {
  const { t } = useI18n();
  const { data: profile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber.replace(/\D/g, ''));
    }
  }, [profile]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePhoneNumberInput(e.target.value);
    setPhoneNumber(parsed);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      setValidationError(t('parentPhoneErrorEmpty'));
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setValidationError(t('parentPhoneErrorInvalid'));
      return;
    }

    if (!profile) return;

    setValidationError('');

    try {
      const formattedPhone = `(${phoneNumber.slice(0, 2)})${phoneNumber.slice(2)}`;
      await saveProfile.mutateAsync({
        ...profile,
        phoneNumber: formattedPhone,
      });
      setIsEditing(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleCancel = () => {
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber.replace(/\D/g, ''));
    } else {
      setPhoneNumber('');
    }
    setIsEditing(false);
    setValidationError('');
  };

  const currentPhone = profile?.phoneNumber;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-navy-600 dark:text-navy-400" />
          <CardTitle>{t('parentPhoneTitle')}</CardTitle>
        </div>
        <CardDescription>{t('parentPhoneDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isEditing && currentPhone ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                {t('parentPhoneConfigured')}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>{t('parentPhoneCurrentLabel')}</Label>
              <div className="font-mono text-lg p-3 bg-muted rounded-md">
                {currentPhone}
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="w-full"
            >
              {t('parentPhoneUpdateButton')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!currentPhone && (
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                  {t('parentPhoneHelp')}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('parentPhoneLabel')}</Label>
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                value={formatPhoneNumber(phoneNumber)}
                onChange={handlePhoneChange}
                placeholder={t('parentPhonePlaceholder')}
                disabled={saveProfile.isPending}
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground">
                {t('parentPhoneFormat')}
              </p>
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>

            <div className="flex gap-2">
              {currentPhone && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={saveProfile.isPending}
                >
                  {t('cancel')}
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1"
                disabled={saveProfile.isPending || !isValidPhoneNumber(phoneNumber)}
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('parentPhoneSaving')}
                  </>
                ) : (
                  t('parentPhoneSaveButton')
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
