import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useDeleteAccount } from '../../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { t } = useI18n();
  const [confirmText, setConfirmText] = useState('');
  const deleteAccountMutation = useDeleteAccount();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    try {
      await deleteAccountMutation.mutateAsync();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleCancel = () => {
    setConfirmText('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('deleteDialogTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialogDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {t('deleteDialogWarning')}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">{t('deleteDialogConfirmLabel')}</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t('deleteDialogConfirmPlaceholder')}
              disabled={deleteAccountMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {t('deleteDialogConfirmHelp')}
            </p>
          </div>

          {deleteAccountMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {t('deleteDialogError')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={deleteAccountMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('deleteDialogConfirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
