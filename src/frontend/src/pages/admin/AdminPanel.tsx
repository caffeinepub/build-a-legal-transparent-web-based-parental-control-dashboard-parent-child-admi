import { useGetAllUsers, useGetParentChildLinks, useGetAggregatedMetrics } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountsTable from '../../components/admin/AccountsTable';
import AggregatedMetricsCards from '../../components/admin/AggregatedMetricsCards';
import { useI18n } from '../../hooks/useI18n';

export default function AdminPanel() {
  const { t } = useI18n();
  const { data: users = [] } = useGetAllUsers();
  const { data: links = [] } = useGetParentChildLinks();
  const { data: metrics } = useGetAggregatedMetrics();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-2">
          {t('adminPanelTitle')}
        </h1>
        <p className="text-muted-foreground">{t('adminPanelDescription')}</p>
      </div>

      {metrics && <AggregatedMetricsCards metrics={metrics} />}

      <Tabs defaultValue="accounts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">{t('adminPanelTabAccounts')}</TabsTrigger>
          <TabsTrigger value="links">{t('adminPanelTabLinks')}</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('adminPanelAccountsTitle')}</CardTitle>
              <CardDescription>{t('adminPanelAccountsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountsTable users={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('adminPanelLinksTitle')}</CardTitle>
              <CardDescription>{t('adminPanelLinksDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('adminPanelNoPairings')}
                </p>
              ) : (
                <div className="space-y-4">
                  {links.map(([parent, children]) => (
                    <div key={parent.toString()} className="p-4 border rounded-lg">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        {t('adminPanelParent')}
                      </p>
                      <p className="font-mono text-xs mb-3">{parent.toString()}</p>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        {t('adminPanelChildren')}
                      </p>
                      <ul className="space-y-1">
                        {children.map((child) => (
                          <li key={child.toString()} className="font-mono text-xs">
                            {child.toString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
