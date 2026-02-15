import { useState } from 'react';
import { useDisableAccount, useEnableAccount } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Principal } from '@icp-sdk/core/principal';
import { AppRole, type UserProfile } from '../../backend';
import { useI18n } from '../../hooks/useI18n';

interface AccountsTableProps {
  users: [Principal, UserProfile][];
}

export default function AccountsTable({ users }: AccountsTableProps) {
  const { t } = useI18n();
  const [disableTarget, setDisableTarget] = useState<Principal | null>(null);
  const [disableReason, setDisableReason] = useState('');
  const disableAccount = useDisableAccount();
  const enableAccount = useEnableAccount();

  const getRoleLabel = (role: AppRole): string => {
    switch (role) {
      case AppRole.parent:
        return t('roleParent');
      case AppRole.child:
        return t('roleChild');
      case AppRole.admin:
        return t('roleAdmin');
      default:
        return t('roleUser');
    }
  };

  const handleDisable = () => {
    if (disableTarget && disableReason.trim()) {
      disableAccount.mutate(
        { account: disableTarget, reason: disableReason },
        {
          onSuccess: () => {
            setDisableTarget(null);
            setDisableReason('');
          },
        }
      );
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('accountsTablePrincipal')}</TableHead>
              <TableHead>{t('accountsTableName')}</TableHead>
              <TableHead>{t('accountsTableRole')}</TableHead>
              <TableHead>{t('accountsTableActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(([principal, profile]) => (
              <TableRow key={principal.toString()}>
                <TableCell className="font-mono text-xs">
                  {principal.toString().slice(0, 20)}...
                </TableCell>
                <TableCell>{profile.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getRoleLabel(profile.role)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDisableTarget(principal)}
                    >
                      {t('accountsTableDisable')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => enableAccount.mutate(principal)}
                    >
                      {t('accountsTableEnable')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!disableTarget} onOpenChange={() => setDisableTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('accountsTableDisableTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('accountsTableDisableDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">{t('accountsTableReasonLabel')}</Label>
            <Input
              id="reason"
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
              placeholder={t('accountsTableReasonPlaceholder')}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={!disableReason.trim() || disableAccount.isPending}
            >
              {disableAccount.isPending ? t('accountsTableDisabling') : t('accountsTableDisableAccount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
