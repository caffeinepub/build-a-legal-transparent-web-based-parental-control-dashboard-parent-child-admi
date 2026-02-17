import { useI18n } from '../../hooks/useI18n';
import { useGetParentUsers, useGetChildUsers } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AppRole } from '../../backend';

interface AdminUsersListPanelProps {
  role: 'parent' | 'child';
}

export default function AdminUsersListPanel({ role }: AdminUsersListPanelProps) {
  const { t } = useI18n();
  const { data: parentUsers, isLoading: parentLoading } = useGetParentUsers();
  const { data: childUsers, isLoading: childLoading } = useGetChildUsers();

  const users = role === 'parent' ? parentUsers : childUsers;
  const isLoading = role === 'parent' ? parentLoading : childLoading;

  const title = role === 'parent' ? t('adminUsersListParentsTitle') : t('adminUsersListChildrenTitle');
  const description = role === 'parent' ? t('adminUsersListParentsDescription') : t('adminUsersListChildrenDescription');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('adminUsersListEmpty')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('adminUsersListColumnName')}</TableHead>
              <TableHead>{t('adminUsersListColumnPrincipal')}</TableHead>
              <TableHead>{t('adminUsersListColumnPhone')}</TableHead>
              <TableHead>{t('adminUsersListColumnRole')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(([principal, profile]) => (
              <TableRow key={principal.toString()}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {principal.toString().slice(0, 20)}...
                </TableCell>
                <TableCell>{profile.phoneNumber || '—'}</TableCell>
                <TableCell>
                  <Badge variant={profile.role === 'parent' ? 'default' : 'secondary'}>
                    {profile.role === 'parent' ? t('roleParent') : t('roleChild')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
