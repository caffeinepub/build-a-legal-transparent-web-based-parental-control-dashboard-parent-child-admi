import AdminPasswordGate from './AdminPasswordGate';
import { useI18n } from '../../hooks/useI18n';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export default function AdminAccessScreen() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 p-4">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            {t('adminAccessScreenTitle')}
          </h1>
          <p className="text-lg text-blue-200 max-w-md mx-auto">
            {t('adminAccessScreenSubtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
            <Lock className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <p className="text-sm text-blue-100 font-medium">
              {t('adminAccessScreenFeature1')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <p className="text-sm text-blue-100 font-medium">
              {t('adminAccessScreenFeature2')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
            <Shield className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <p className="text-sm text-blue-100 font-medium">
              {t('adminAccessScreenFeature3')}
            </p>
          </div>
        </div>

        {/* Password Gate Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AdminPasswordGate />
        </div>

        {/* Help Text */}
        <p className="text-center text-blue-200/70 text-sm mt-6">
          {t('adminAccessScreenHelp')}
        </p>
      </div>
    </div>
  );
}
