import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '../../backend';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  userProfile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ userProfile, size = 'md', className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const photoUrl = userProfile.photo ? userProfile.photo.getDirectURL() : null;

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {photoUrl && <AvatarImage src={photoUrl} alt={userProfile.name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(userProfile.name)}
      </AvatarFallback>
    </Avatar>
  );
}
