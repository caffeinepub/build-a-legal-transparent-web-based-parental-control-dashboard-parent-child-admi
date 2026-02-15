import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Shield, Eye, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '../hooks/useI18n';

interface TransparencyPoliciesProps {
  onClose: () => void;
}

export default function TransparencyPolicies({ onClose }: TransparencyPoliciesProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" />
                {t('transparencyTitle')}
              </CardTitle>
              <CardDescription>
                {t('transparencySubtitle')}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-600" />
                {t('transparencySupervisionTitle')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('transparencySupervisionP1')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('transparencySupervisionP2')}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                {t('transparencyDataTitle')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('transparencyDataP1')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li>{t('transparencyDataL1')}</li>
                <li>{t('transparencyDataL2')}</li>
                <li>{t('transparencyDataL3')}</li>
                <li>{t('transparencyDataL4')}</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                {t('transparencyConsentTitle')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('transparencyConsentP1')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li>{t('transparencyConsentL1')}</li>
                <li>{t('transparencyConsentL2')}</li>
                <li>{t('transparencyConsentL3')}</li>
                <li>{t('transparencyConsentL4')}</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                {t('transparencyNotDoTitle')}
              </h3>
              <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                <p className="text-sm text-rose-900 dark:text-rose-100 font-semibold mb-2">
                  {t('transparencyNotDoIntro')}
                </p>
                <ul className="text-sm text-rose-900 dark:text-rose-100 space-y-1 ml-6 list-disc">
                  <li>{t('transparencyNotDoL1')}</li>
                  <li>{t('transparencyNotDoL2')}</li>
                  <li>{t('transparencyNotDoL3')}</li>
                  <li>{t('transparencyNotDoL4')}</li>
                  <li>{t('transparencyNotDoL5')}</li>
                  <li>{t('transparencyNotDoL6')}</li>
                </ul>
                <p className="text-sm text-rose-900 dark:text-rose-100 mt-3">
                  {t('transparencyNotDoOutro')}
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">{t('transparencyRecoveryTitle')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('transparencyRecoveryP1')}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">{t('transparencyLegalTitle')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('transparencyLegalP1')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>{t('transparencyLegalL1')}</li>
                <li>{t('transparencyLegalL2')}</li>
                <li>{t('transparencyLegalL3')}</li>
                <li>{t('transparencyLegalL4')}</li>
              </ul>
            </section>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {t('transparencyLastUpdated')}
              </p>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
