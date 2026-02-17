import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, AppRole, ActivityEntry, LocationEntry, ScheduleConfig, ContentFilterConfig, AuditLogEntry, PairWithParentResult, PendingPairingRequest, AdminDashboardMetrics } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAllowlistedAdmin'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useSaveProfilePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveProfilePhoto(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['callerProfilePhoto'] });
      toast.success('Profile photo updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update photo: ${error.message}`);
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteCallerAccount();
    },
    onSuccess: async () => {
      // Clear all cached data
      queryClient.clear();
      
      // Log out the user
      await clear();
      
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAllowlistedAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAllowlistedAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAllowlistedAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminDashboardMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminDashboardMetrics>({
    queryKey: ['adminDashboardMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDashboardMetrics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useGetMyChildren(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['myChildren'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyChildren();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: options?.refetchInterval,
  });
}

export function useGetMyParent(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal | null>({
    queryKey: ['myParent'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyParent();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: options?.refetchInterval,
  });
}

export function useGetActivities(childId: Principal | null, options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityEntry[]>({
    queryKey: ['activities', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getActivities(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useAddActivity(options?: { silent?: boolean }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (entry: Omit<ActivityEntry, 'childId' | 'timestamp'>) => {
      if (!actor || !identity) throw new Error('Not authenticated');
      const childId = identity.getPrincipal();
      await actor.addActivity({
        ...entry,
        childId,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      if (!options?.silent) {
        toast.success('Activity submitted');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit activity: ${error.message}`);
    },
  });
}

export function useGetLocations(childId: Principal | null, options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();

  return useQuery<LocationEntry[]>({
    queryKey: ['locations', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getLocations(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useAddLocation(options?: { silent?: boolean }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (entry: Omit<LocationEntry, 'childId' | 'timestamp'>) => {
      if (!actor || !identity) throw new Error('Not authenticated');
      const childId = identity.getPrincipal();
      await actor.addLocation({
        ...entry,
        childId,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      if (!options?.silent) {
        toast.success('Location submitted');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit location: ${error.message}`);
    },
  });
}

export function useGetSchedule(childId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ScheduleConfig | null>({
    queryKey: ['schedule', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return null;
      return actor.getSchedule(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
  });
}

export function useUpdateSchedule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, config }: { childId: Principal; config: ScheduleConfig }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSchedule(childId, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Schedule updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });
}

export function useGetContentFilter(childId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ContentFilterConfig | null>({
    queryKey: ['contentFilter', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return null;
      return actor.getContentFilter(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
  });
}

export function useUpdateContentFilter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, config }: { childId: Principal; config: ContentFilterConfig }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateContentFilter(childId, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentFilter'] });
      toast.success('Content filter updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update content filter: ${error.message}`);
    },
  });
}

export function useGetAuditLog(childId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AuditLogEntry[]>({
    queryKey: ['auditLog', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getAuditLog(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
  });
}

export function useGeneratePairingCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generatePairingCode();
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate pairing code: ${error.message}`);
    },
  });
}

export function usePairWithParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.pairWithParent(code);
    },
    onSuccess: (result) => {
      if (result === 'success') {
        queryClient.invalidateQueries({ queryKey: ['myParent'] });
        toast.success('Successfully paired with parent!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to pair: ${error.message}`);
    },
  });
}

export function useRequestPairingWithParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestPairingWithParent(parentId);
    },
    onSuccess: (result) => {
      if (result === 'pendingLinkRequest') {
        queryClient.invalidateQueries({ queryKey: ['myParent'] });
        toast.success('Pairing request sent to parent');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to send pairing request: ${error.message}`);
    },
  });
}

export function useGetPendingPairingRequests(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();

  return useQuery<PendingPairingRequest[]>({
    queryKey: ['pendingPairingRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingPairingRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: options?.refetchInterval,
  });
}

export function useAcceptPendingPairing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptPendingPairing(requestId);
    },
    onSuccess: (result) => {
      if (result === 'success') {
        queryClient.invalidateQueries({ queryKey: ['pendingPairingRequests'] });
        queryClient.invalidateQueries({ queryKey: ['myChildren'] });
        toast.success('Pairing confirmed successfully!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to confirm pairing: ${error.message}`);
    },
  });
}

export function useGetLiveLocationSharingStatus(childId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['liveLocationSharing', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return false;
      return actor.getLiveLocationSharingStatus(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
  });
}

export function useSetLiveLocationSharing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setLiveLocationSharing(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveLocationSharing'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update location sharing: ${error.message}`);
    },
  });
}

export function useVerifyAdminPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      // Ensure password is trimmed before sending to backend
      const trimmedPassword = password.trim();
      return actor.verifyAdminPassword(trimmedPassword);
    },
  });
}

export function useChangeAdminPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Ensure passwords are trimmed before sending to backend
      const trimmedOldPassword = oldPassword.trim();
      const trimmedNewPassword = newPassword.trim();
      await actor.changeAdminPassword(trimmedOldPassword, trimmedNewPassword);
    },
    onSuccess: () => {
      toast.success('Admin password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to change password: ${error.message}`);
    },
  });
}

export function useAddAllowlistedAdminPrincipal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ password, principal }: { password: string; principal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      // Ensure password is trimmed before sending to backend
      const trimmedPassword = password.trim();
      await actor.addAllowlistedAdminPrincipal(trimmedPassword, principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAllowlistedAdmin'] });
    },
    onError: (error: Error) => {
      throw error;
    },
  });
}

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
