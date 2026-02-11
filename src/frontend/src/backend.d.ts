import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScheduleChangeDetails {
    child: Principal;
    newConfig: ScheduleConfig;
}
export interface AccountDisabledDetails {
    account: Principal;
    reason: string;
}
export type Time = bigint;
export interface DayTimeWindow {
    endHour: bigint;
    dayOfWeek: bigint;
    startHour: bigint;
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
export type AuditLogDetails = {
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
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface FilterChangeDetails {
    child: Principal;
    newConfig: ContentFilterConfig;
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
export interface ContentCategory {
    name: string;
    enabled: boolean;
}
export interface UserProfile {
    name: string;
    role: AppRole;
}
export enum ActionType {
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addActivity(entry: ActivityEntry): Promise<void>;
    addLocation(entry: LocationEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    disableAccount(account: Principal, reason: string): Promise<void>;
    enableAccount(account: Principal): Promise<void>;
    generateInviteCode(): Promise<string>;
    getActivities(childId: Principal): Promise<Array<ActivityEntry>>;
    getAggregatedMetrics(): Promise<{
        totalParents: bigint;
        totalChildren: bigint;
        totalUsers: bigint;
        totalPairings: bigint;
    }>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getAuditLog(childId: Principal): Promise<Array<AuditLogEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContentFilter(childId: Principal): Promise<ContentFilterConfig | null>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getLocations(childId: Principal): Promise<Array<LocationEntry>>;
    getMyChildren(): Promise<Array<Principal>>;
    getMyParent(): Promise<Principal | null>;
    getParentChildLinks(): Promise<Array<[Principal, Array<Principal>]>>;
    getSchedule(childId: Principal): Promise<ScheduleConfig | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAccountDisabled(account: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateContentFilter(childId: Principal, newConfig: ContentFilterConfig): Promise<void>;
    updateSchedule(childId: Principal, newConfig: ScheduleConfig): Promise<void>;
}
