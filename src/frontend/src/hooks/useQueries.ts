import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, AppRole, ActivityEntry, LocationEntry, ScheduleConfig, ContentFilterConfig, AuditLogEntry } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

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
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
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

export function useGetMyChildren() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['myChildren'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyChildren();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyParent() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal | null>({
    queryKey: ['myParent'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyParent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActivities(childId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityEntry[]>({
    queryKey: ['activities', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getActivities(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
  });
}

export function useAddActivity() {
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
      toast.success('Activity submitted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit activity: ${error.message}`);
    },
  });
}

export function useGetLocations(childId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<LocationEntry[]>({
    queryKey: ['locations', childId?.toString()],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getLocations(childId);
    },
    enabled: !!actor && !isFetching && !!childId,
  });
}

export function useAddLocation() {
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
      toast.success('Location submitted');
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
      toast.error(`Failed to update filter: ${error.message}`);
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

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAggregatedMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['aggregatedMetrics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAggregatedMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDisableAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, reason }: { account: Principal; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.disableAccount(account, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Account disabled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to disable account: ${error.message}`);
    },
  });
}

export function useEnableAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.enableAccount(account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Account enabled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to enable account: ${error.message}`);
    },
  });
}

export function useGetParentChildLinks() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, Principal[]][]>({
    queryKey: ['parentChildLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getParentChildLinks();
    },
    enabled: !!actor && !isFetching,
  });
}
