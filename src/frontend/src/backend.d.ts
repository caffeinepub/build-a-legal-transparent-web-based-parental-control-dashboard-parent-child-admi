import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PendingRequestCompletedDetails {
    childPrincipal: Principal;
    childName: string;
    successful: boolean;
    parent: Principal;
}
export interface PhonePairingInitiatedDetails {
    phoneNumber: string;
    parentId: Principal;
}
export interface ScheduleChangeDetails {
    child: Principal;
    newConfig: ScheduleConfig;
}
export type Time = bigint;
export interface DayTimeWindow {
    endHour: bigint;
    dayOfWeek: bigint;
    startHour: bigint;
}
export interface ContentCategory {
    name: string;
    enabled: boolean;
}
export interface ScheduleConfig {
    allowedHours: Array<DayTimeWindow>;
    dailyLimitMinutes: bigint;
}
export interface AuditLogEntry {
    action: ActionType;
    timestamp: Time;
    details: AuditLogDetails;
    executor: Principal;
}
export interface ContentFilterConfig {
    categories: Array<ContentCategory>;
    blocklist: Array<string>;
    allowlist: Array<string>;
}
export interface PendingRequestInitiatedDetails {
    child: Principal;
    parent: Principal;
}
export type AuditLogDetails = {
    __kind__: "pendingRequestInitiated";
    pendingRequestInitiated: PendingRequestInitiatedDetails;
} | {
    __kind__: "phonePairingInitiated";
    phonePairingInitiated: PhonePairingInitiatedDetails;
} | {
    __kind__: "pendingRequestCompleted";
    pendingRequestCompleted: PendingRequestCompletedDetails;
} | {
    __kind__: "phonePairingCompleted";
    phonePairingCompleted: PhonePairingCompletedDetails;
} | {
    __kind__: "pairingCreated";
    pairingCreated: PairingDetails;
} | {
    __kind__: "filterChanged";
    filterChanged: FilterChangeDetails;
} | {
    __kind__: "accountDisabled";
    accountDisabled: AccountDisabledDetails;
} | {
    __kind__: "scheduleChanged";
    scheduleChanged: ScheduleChangeDetails;
};
export interface LocationEntry {
    latitude: number;
    childId: Principal;
    longitude: number;
    timestamp: Time;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface FilterChangeDetails {
    child: Principal;
    newConfig: ContentFilterConfig;
}
export interface AccountDisabledDetails {
    account: Principal;
    reason: string;
}
export interface AdminDashboardMetrics {
    totalUsersEverLoggedIn: bigint;
    totalContentFiltersConfigured: bigint;
    totalSchedulesConfigured: bigint;
    activeSessionsEstimate: bigint;
    totalAdmins: bigint;
    totalPendingPairings: bigint;
    totalDisabledAccounts: bigint;
    totalParents: bigint;
    totalChildren: bigint;
    totalParentChildLinks: bigint;
}
export interface PendingPairingRequest {
    id: bigint;
    pending: boolean;
    child: Principal;
    parent: Principal;
}
export interface ActivityEntry {
    appSite: string;
    childId: Principal;
    durationMinutes: bigint;
    notes: string;
    timestamp: Time;
}
export interface PairingDetails {
    child: Principal;
    parent: Principal;
}
export interface UserProfile {
    name: string;
    role: AppRole;
    phoneNumber?: string;
}
export interface PhonePairingCompletedDetails {
    childId: Principal;
    parentId: Principal;
}
export enum ActionType {
    pendingRequestInitiated = "pendingRequestInitiated",
    phonePairingInitiated = "phonePairingInitiated",
    pendingRequestCompleted = "pendingRequestCompleted",
    phonePairingCompleted = "phonePairingCompleted",
    pairingCreated = "pairingCreated",
    filterChanged = "filterChanged",
    accountDisabled = "accountDisabled",
    scheduleChanged = "scheduleChanged"
}
export enum AppRole {
    admin = "admin",
    child = "child",
    parent = "parent"
}
export enum PairWithParentResult {
    alreadyUsed = "alreadyUsed",
    parentIdNotProvided = "parentIdNotProvided",
    phoneVerificationExpired = "phoneVerificationExpired",
    notAChild = "notAChild",
    codeExpired = "codeExpired",
    sameFamily = "sameFamily",
    unexpectedError = "unexpectedError",
    phoneVerificationInitiated = "phoneVerificationInitiated",
    parentNotFound = "parentNotFound",
    alreadyPaired = "alreadyPaired",
    parentNotParent = "parentNotParent",
    pendingLinkRequest = "pendingLinkRequest",
    invalidCode = "invalidCode",
    phoneVerificationSuccess = "phoneVerificationSuccess",
    success = "success",
    phoneVerificationFailed = "phoneVerificationFailed",
    phoneNumberAlreadyLinked = "phoneNumberAlreadyLinked"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptPendingPairing(requestId: bigint): Promise<PairWithParentResult>;
    addActivity(entry: ActivityEntry): Promise<void>;
    addAllowlistedAdmin(adminPasswordAttempt: string, principal: Principal): Promise<void>;
    addAllowlistedAdminPrincipal(adminPasswordAttempt: string, principal: Principal): Promise<void>;
    addLocation(entry: LocationEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changeAdminPassword(oldPassword: string, newPassword: string): Promise<void>;
    generateInviteCode(): Promise<string>;
    generatePairingCode(): Promise<string | null>;
    getActivities(childId: Principal): Promise<Array<ActivityEntry>>;
    getAdminDashboardMetrics(): Promise<AdminDashboardMetrics>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllowlistedAdminPrincipals(): Promise<Array<Principal>>;
    getAuditLog(childId: Principal): Promise<Array<AuditLogEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContentFilter(childId: Principal): Promise<ContentFilterConfig | null>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getLiveLocationSharingStatus(childId: Principal): Promise<boolean>;
    getLocations(childId: Principal): Promise<Array<LocationEntry>>;
    getMyChildren(): Promise<Array<Principal>>;
    getMyParent(): Promise<Principal | null>;
    getPendingPairingRequests(): Promise<Array<PendingPairingRequest>>;
    getSchedule(childId: Principal): Promise<ScheduleConfig | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerAllowlistedAdmin(): Promise<boolean>;
    isPrincipalAllowlistedAdmin(principal: Principal): Promise<boolean>;
    pairWithParent(code: string): Promise<PairWithParentResult>;
    recordHeartbeat(): Promise<void>;
    removeAllowlistedAdminPrincipal(adminPasswordAttempt: string, principal: Principal): Promise<void>;
    requestPairingWithParent(parentId: Principal): Promise<PairWithParentResult>;
    revokeAllowlistedAdmin(adminPasswordAttempt: string, principal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setLiveLocationSharing(enabled: boolean): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateContentFilter(childId: Principal, newConfig: ContentFilterConfig): Promise<void>;
    updateSchedule(childId: Principal, newConfig: ScheduleConfig): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
}
