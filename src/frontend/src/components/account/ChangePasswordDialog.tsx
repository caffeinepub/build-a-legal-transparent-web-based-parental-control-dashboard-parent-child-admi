import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useI18n();

  const handleOpenInternetIdentity = () => {
    window.open('https://identity.ic0.app/', '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('passwordDialogTitle')}</DialogTitle>
          <DialogDescription>{t('passwordDialogDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              {t('passwordDialogExplanation')}
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            {t('passwordDialogInstructions')}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleOpenInternetIdentity}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('passwordDialogOpenII')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
