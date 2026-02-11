import { useGetAllUsers, useGetAggregatedMetrics, useGetParentChildLinks } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, UserCheck, Link2, TrendingUp } from 'lucide-react';
import AccountsTable from '../../components/admin/AccountsTable';
import AggregatedMetricsCards from '../../components/admin/AggregatedMetricsCards';

export default function AdminPanel() {
  const { data: users = [] } = useGetAllUsers();
  const { data: metrics } = useGetAggregatedMetrics();
  const { data: links = [] } = useGetParentChildLinks();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Admin Panel
        </h2>
        <p className="text-muted-foreground">
          System management and aggregated metrics
        </p>
      </div>

      <AggregatedMetricsCards metrics={metrics} />

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="links">Parent-Child Links</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                Manage user roles and account status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountsTable users={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Parent-Child Links</CardTitle>
              <CardDescription>
                Overview of family connections (structure only, no content)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {links.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pairings yet</p>
                ) : (
                  links.map(([parent, children]) => (
                    <div key={parent.toString()} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm text-muted-foreground">
                          {parent.toString().slice(0, 20)}...
                        </span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {children.map((child) => (
                          <div key={child.toString()} className="text-sm font-mono text-muted-foreground">
                            → {child.toString().slice(0, 20)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
