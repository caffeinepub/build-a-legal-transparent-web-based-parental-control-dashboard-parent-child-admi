import { useState, useMemo } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useAddAllowlistedAdminPrincipal } from '../../hooks/useQueries';
import { useI18n } from '../../hooks/useI18n';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AppRole } from '../../backend';
import { formatPhoneNumber, parsePhoneNumberInput, isValidPhoneNumber, normalizePhoneNumber } from '../../utils/phoneNumber';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const ADMIN_UNLOCK_PHONE = '91980115950';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'child' | 'admin'>('parent');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const saveProfile = useSaveCallerUserProfile();
  const addAllowlistedAdmin = useAddAllowlistedAdminPrincipal();
  const { identity } = useInternetIdentity();
  const { t } = useI18n();

  // Check if admin option should be visible based on phone number
  const isAdminOptionUnlocked = useMemo(() => {
    const normalized = normalizePhoneNumber(phoneNumber);
    return normalized === ADMIN_UNLOCK_PHONE;
  }, [phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePhoneNumberInput(e.target.value);
    setPhoneNumber(parsed);
    
    // If admin was selected but phone no longer matches, switch to parent
    if (role === 'admin') {
      const normalized = normalizePhoneNumber(parsed);
      if (normalized !== ADMIN_UNLOCK_PHONE) {
        setRole('parent');
        setAdminPassword('');
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Clear previous password error
    setPasswordError('');

    // If admin role is selected, validate and verify password first
    if (role === 'admin') {
      // Double-check that admin option is still unlocked
      if (!isAdminOptionUnlocked) {
        toast.error('Admin option not available');
        setRole('parent');
        return;
      }

      // Trim whitespace from password before validation
      const trimmedPassword = adminPassword.trim();
      
      if (!trimmedPassword) {
        setPasswordError(t('profileSetupAdminPasswordRequired'));
        toast.error(t('profileSetupAdminPasswordRequired'));
        return;
      }

      if (!identity) {
        toast.error('Not authenticated');
        return;
      }

      try {
        // Call backend to add caller to allowlist with password verification
        await addAllowlistedAdmin.mutateAsync({
          password: trimmedPassword,
          principal: identity.getPrincipal(),
        });

        // If successful, proceed to save profile as admin
        await saveProfile.mutateAsync({ 
          name: name.trim(), 
          role: AppRole.admin,
          phoneNumber: undefined,
        });
      } catch (error: any) {
        // Handle incorrect password or other errors
        const errorMessage = error.message || 'Unknown error';
        if (errorMessage.includes('Unauthorized')) {
          setPasswordError(t('profileSetupAdminPasswordIncorrect'));
          toast.error(t('profileSetupAdminPasswordIncorrect'));
        } else {
          setPasswordError(t('profileSetupAdminPasswordError'));
          toast.error(`${t('profileSetupAdminPasswordError')}: ${errorMessage}`);
        }
        return;
      }
    } else {
      // For parent and child roles, proceed normally
      let appRole: AppRole;
      if (role === 'parent') {
        appRole = AppRole.parent;
      } else {
        appRole = AppRole.child;
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
    }
  };

  const isSubmitting = saveProfile.isPending || addAllowlistedAdmin.isPending;

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

            <div className="space-y-3">
              <Label>{t('profileSetupRoleLabel')}</Label>
              <RadioGroup value={role} onValueChange={(v) => {
                setRole(v as 'parent' | 'child' | 'admin');
                setPasswordError('');
                setAdminPassword('');
              }}>
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
                {isAdminOptionUnlocked && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer">
                      <div className="font-semibold">{t('profileSetupAdminTitle')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('profileSetupAdminDesc')}
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="adminPassword">{t('profileSetupAdminPasswordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder={t('profileSetupAdminPasswordPlaceholder')}
                    required
                    className={passwordError ? 'border-destructive pr-10' : 'pr-10'}
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
                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('profileSetupAdminPasswordHelp')}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isSubmitting || !name.trim() || (role === 'admin' && !adminPassword.trim())}
            >
              {isSubmitting ? t('profileSetupCreating') : t('continue')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
