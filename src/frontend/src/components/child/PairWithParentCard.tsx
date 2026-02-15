import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';
import { usePairWithParent, useGetMyParent, usePairWithParentViaPhone, useCompletePhonePairing } from '../../hooks/useQueries';
import { PairWithParentResult } from '../../backend';
import { formatPhoneNumber, parsePhoneNumberInput, isValidPhoneNumber, formatPhoneNumberForBackend } from '../../utils/phoneNumber';

export default function PairWithParentCard() {
  const { t } = useI18n();
  const [pairingCode, setPairingCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [localSuccess, setLocalSuccess] = useState(false);
  
  const pairMutation = usePairWithParent();
  const pairViaPhoneMutation = usePairWithParentViaPhone();
  const completePhonePairingMutation = useCompletePhonePairing();
  const { data: parentId, isLoading: parentLoading, isFetched: parentFetched } = useGetMyParent();

  // Auto-populate from URL and clear parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('pairingCode');
    
    if (codeFromUrl) {
      const normalizedCode = codeFromUrl.replace(/\D/g, '').slice(0, 6);
      setPairingCode(normalizedCode);
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    if (parentId) {
      setLocalSuccess(false);
    }
  }, [parentId]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPairingCode(value);
    setValidationError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePhoneNumberInput(e.target.value);
    setPhoneNumber(parsed);
    setValidationError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    setValidationError('');
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = pairingCode.trim();
    
    if (!trimmedCode) {
      setValidationError(t('pairingChildErrorEmpty'));
      return;
    }

    if (trimmedCode.length !== 6) {
      setValidationError(t('pairingChildError6Digits'));
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setValidationError(t('pairingChildError6Digits'));
      return;
    }

    setValidationError('');

    try {
      const result = await pairMutation.mutateAsync(trimmedCode);
      
      if (result === 'success') {
        setLocalSuccess(true);
        setPairingCode('');
      } else {
        const errorMessages: Record<PairWithParentResult, string> = {
          success: '',
          invalidCode: t('pairingChildErrorInvalid'),
          codeExpired: t('pairingChildErrorExpired'),
          alreadyUsed: t('pairingChildErrorUsed'),
          alreadyPaired: t('pairingChildErrorAlreadyPaired'),
          notAChild: t('pairingChildErrorNotChild'),
          parentNotFound: t('pairingChildErrorParentNotFound'),
          parentNotParent: t('pairingChildErrorParentNotParent'),
          sameFamily: t('pairingChildErrorSameFamily'),
          parentIdNotProvided: t('pairingChildErrorGeneric'),
          phoneVerificationInitiated: t('pairingChildErrorGeneric'),
          phoneVerificationFailed: t('pairingChildErrorGeneric'),
          phoneVerificationSuccess: t('pairingChildErrorGeneric'),
          phoneVerificationExpired: t('pairingChildErrorGeneric'),
          phoneNumberAlreadyLinked: t('pairingChildErrorGeneric'),
        };
        
        toast.error(errorMessages[result] || t('pairingChildErrorGeneric'));
      }
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setValidationError(t('pairingPhoneErrorEmpty'));
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setValidationError(t('pairingPhoneErrorInvalid'));
      return;
    }

    setValidationError('');

    try {
      const formattedPhone = formatPhoneNumberForBackend(phoneNumber);
      const result = await pairViaPhoneMutation.mutateAsync(formattedPhone);
      
      if (result === 'phoneVerificationInitiated') {
        setPhoneStep('otp');
        toast.success(t('pairingPhoneOtpSent'));
      } else {
        const errorMessages: Record<PairWithParentResult, string> = {
          success: '',
          invalidCode: t('pairingPhoneErrorInvalid'),
          parentNotFound: t('pairingPhoneErrorParentNotFound'),
          alreadyPaired: t('pairingChildErrorAlreadyPaired'),
          notAChild: t('pairingChildErrorNotChild'),
          sameFamily: t('pairingChildErrorSameFamily'),
          phoneVerificationInitiated: '',
          phoneVerificationFailed: t('pairingPhoneErrorGeneric'),
          phoneVerificationSuccess: '',
          phoneVerificationExpired: t('pairingPhoneErrorGeneric'),
          phoneNumberAlreadyLinked: t('pairingPhoneErrorAlreadyLinked'),
          codeExpired: t('pairingPhoneErrorGeneric'),
          alreadyUsed: t('pairingPhoneErrorGeneric'),
          parentNotParent: t('pairingPhoneErrorGeneric'),
          parentIdNotProvided: t('pairingPhoneErrorGeneric'),
        };
        
        toast.error(errorMessages[result] || t('pairingPhoneErrorGeneric'));
      }
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode) {
      setValidationError(t('pairingOtpErrorEmpty'));
      return;
    }

    if (otpCode.length !== 6) {
      setValidationError(t('pairingOtpError6Digits'));
      return;
    }

    setValidationError('');

    try {
      const formattedPhone = formatPhoneNumberForBackend(phoneNumber);
      const result = await completePhonePairingMutation.mutateAsync({
        phoneNumber: formattedPhone,
        verificationCode: otpCode,
      });
      
      if (result === 'phoneVerificationSuccess') {
        setLocalSuccess(true);
        setPhoneNumber('');
        setOtpCode('');
        setPhoneStep('phone');
      } else {
        const errorMessages: Record<PairWithParentResult, string> = {
          success: '',
          invalidCode: t('pairingOtpErrorInvalid'),
          phoneVerificationExpired: t('pairingOtpErrorExpired'),
          phoneVerificationFailed: t('pairingOtpErrorInvalid'),
          alreadyPaired: t('pairingChildErrorAlreadyPaired'),
          notAChild: t('pairingChildErrorNotChild'),
          phoneVerificationSuccess: '',
          phoneVerificationInitiated: t('pairingPhoneErrorGeneric'),
          parentNotFound: t('pairingPhoneErrorGeneric'),
          sameFamily: t('pairingPhoneErrorGeneric'),
          phoneNumberAlreadyLinked: t('pairingPhoneErrorGeneric'),
          codeExpired: t('pairingPhoneErrorGeneric'),
          alreadyUsed: t('pairingPhoneErrorGeneric'),
          parentNotParent: t('pairingPhoneErrorGeneric'),
          parentIdNotProvided: t('pairingPhoneErrorGeneric'),
        };
        
        toast.error(errorMessages[result] || t('pairingOtpErrorGeneric'));
      }
    } catch (error) {
      // Error already handled by mutation
    }
  };

  if (parentId && parentFetched) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <CardTitle className="text-green-900 dark:text-green-100">
              {t('pairingChildPairedTitle')}
            </CardTitle>
          </div>
          <CardDescription className="text-green-700 dark:text-green-300">
            {t('pairingChildPairedDescription')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (parentLoading || !parentFetched) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <CardTitle>{t('pairingChildTitle')}</CardTitle>
        </div>
        <CardDescription>{t('pairingChildDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">{t('pairingMethodCode')}</TabsTrigger>
            <TabsTrigger value="phone">{t('pairingMethodPhone')}</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4 mt-4">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                {t('pairingChildHelp')}
              </AlertDescription>
            </Alert>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pairingCode">{t('pairingChildCodeLabel')}</Label>
                <Input
                  id="pairingCode"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={pairingCode}
                  onChange={handleCodeChange}
                  placeholder={t('pairingChildCodePlaceholder')}
                  disabled={pairMutation.isPending}
                  className="font-mono text-center text-2xl tracking-widest"
                />
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={pairMutation.isPending || !pairingCode.trim() || pairingCode.length !== 6}
              >
                {pairMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('pairingChildSubmitting')}
                  </>
                ) : (
                  t('pairingChildSubmitButton')
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 mt-4">
            {phoneStep === 'phone' ? (
              <>
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                    {t('pairingPhoneHelp')}
                  </AlertDescription>
                </Alert>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t('pairingPhoneLabel')}</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      value={formatPhoneNumber(phoneNumber)}
                      onChange={handlePhoneChange}
                      placeholder={t('pairingPhonePlaceholder')}
                      disabled={pairViaPhoneMutation.isPending}
                      className="font-mono text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('pairingPhoneFormat')}
                    </p>
                    {validationError && (
                      <p className="text-sm text-destructive">{validationError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={pairViaPhoneMutation.isPending || !isValidPhoneNumber(phoneNumber)}
                  >
                    {pairViaPhoneMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('pairingPhoneSubmitting')}
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 mr-2" />
                        {t('pairingPhoneSubmitButton')}
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <AlertDescription className="text-green-900 dark:text-green-100 text-sm">
                    {t('pairingOtpHelp', { phone: formatPhoneNumber(phoneNumber) })}
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otpCode">{t('pairingOtpLabel')}</Label>
                    <Input
                      id="otpCode"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={otpCode}
                      onChange={handleOtpChange}
                      placeholder={t('pairingOtpPlaceholder')}
                      disabled={completePhonePairingMutation.isPending}
                      className="font-mono text-center text-2xl tracking-widest"
                    />
                    {validationError && (
                      <p className="text-sm text-destructive">{validationError}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setPhoneStep('phone');
                        setOtpCode('');
                        setValidationError('');
                      }}
                      disabled={completePhonePairingMutation.isPending}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={completePhonePairingMutation.isPending || !otpCode.trim() || otpCode.length !== 6}
                    >
                      {completePhonePairingMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('pairingOtpSubmitting')}
                        </>
                      ) : (
                        t('pairingOtpSubmitButton')
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
