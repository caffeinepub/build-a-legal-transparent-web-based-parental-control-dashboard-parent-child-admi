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

interface AccountsTableProps {
  users: [Principal, UserProfile][];
}

const getRoleLabel = (role: AppRole): string => {
  switch (role) {
    case AppRole.parent:
      return 'parent';
    case AppRole.child:
      return 'child';
    case AppRole.admin:
      return 'admin';
    default:
      return 'user';
  }
};

export default function AccountsTable({ users }: AccountsTableProps) {
  const [disableTarget, setDisableTarget] = useState<Principal | null>(null);
  const [disableReason, setDisableReason] = useState('');
  const disableAccount = useDisableAccount();
  const enableAccount = useEnableAccount();

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
              <TableHead>Principal</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
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
                      Disable
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => enableAccount.mutate(principal)}
                    >
                      Enable
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
            <AlertDialogTitle>Disable Account</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for disabling this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
              placeholder="e.g., Policy violation"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={!disableReason.trim() || disableAccount.isPending}
            >
              {disableAccount.isPending ? 'Disabling...' : 'Disable Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
