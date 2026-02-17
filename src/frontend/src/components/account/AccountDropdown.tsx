import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Camera, Key, Trash2, User, FileText, LogOut } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import type { UserProfile } from '../../backend';
import { AppRole } from '../../backend';
import ChangeProfilePhotoDialog from './ChangeProfilePhotoDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import { useIsCallerAdmin } from '../../hooks/useQueries';

interface AccountDropdownProps {
  userProfile: UserProfile;
}

export default function AccountDropdown({ userProfile }: AccountDropdownProps) {
  const { t } = useI18n();
  const { data: isAdmin } = useIsCallerAdmin();
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getRoleLabel = (role: AppRole): string => {
    switch (role) {
      case AppRole.parent:
        return t('headerRoleParent');
      case AppRole.child:
        return t('headerRoleChild');
      case AppRole.admin:
        return t('headerRoleAdmin');
      default:
        return t('headerRoleUser');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none">
          <span>{userProfile.name} • {getRoleLabel(userProfile.role)}</span>
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => setPhotoDialogOpen(true)}>
            <Camera className="w-4 h-4 mr-2" />
            {t('accountMenuChangePhoto')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
            <Key className="w-4 h-4 mr-2" />
            {t('accountMenuChangePassword')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.open('/transparency', '_self')}>
            <FileText className="w-4 h-4 mr-2" />
            {t('accountMenuViewPolicies')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('accountMenuDeleteAccount')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeProfilePhotoDialog 
        open={photoDialogOpen} 
        onOpenChange={setPhotoDialogOpen}
        currentPhoto={userProfile.photo}
      />
      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen}
      />
      <DeleteAccountDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
