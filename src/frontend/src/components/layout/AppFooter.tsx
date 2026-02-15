import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface AppFooterProps {
  onShowPolicies: () => void;
}

export default function AppFooter({ onShowPolicies }: AppFooterProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'familyguard-app';
  const { t } = useI18n();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {currentYear} {t('appName')}</span>
            <span>•</span>
            <button
              onClick={onShowPolicies}
              className="hover:text-primary underline transition-colors"
            >
              {t('footerTransparencyPolicies')}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>{t('footerBuiltWith')}</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>{t('footerUsing')}</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-primary transition-colors flex items-center gap-1"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
