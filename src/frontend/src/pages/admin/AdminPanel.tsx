import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AggregatedMetricsCards from '../../components/admin/AggregatedMetricsCards';
import { Shield } from 'lucide-react';

export default function AdminPanel() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('adminPanelTitle')}</h1>
          <p className="text-muted-foreground">{t('adminPanelDescription')}</p>
        </div>
      </div>

      <AggregatedMetricsCards />

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPanelManagementTitle')}</CardTitle>
          <CardDescription>{t('adminPanelManagementDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <p className="text-muted-foreground">
                System management features will be available here.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
