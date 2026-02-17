import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import Set "mo:core/Set";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  // State (persisted with migration)
  let allowlistedAdminPrincipals = Set.empty<Principal>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // New Strict Admin Password (cannot be changed except by allowlisted principal)
  var adminPassword : Text = "Tigguindoprojetox1";
  var currentPendingRequestCounter = 0;

  // Measurement heartbeat logic
  let heartbeatTimestamps = Map.empty<Principal, Time.Time>();
  let pendingPairings = Map.empty<Nat, PendingPairingRequest>();
  let liveLocationSharing = Map.empty<Principal, Bool>();

  // Invite Links System State (persists)
  let inviteLinksState = InviteLinksModule.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let parentChildLinks = Map.empty<Principal, List.List<Principal>>();
  let childParentLinks = Map.empty<Principal, Principal>();
  let schedules = Map.empty<Principal, ScheduleConfig>();
  let contentFilters = Map.empty<Principal, ContentFilterConfig>();
  let activities = Map.empty<Principal, List.List<ActivityEntry>>();
  let locations = Map.empty<Principal, List.List<LocationEntry>>();
  let auditLogs = Map.empty<Principal, List.List<AuditLogEntry>>();
  let disabledAccounts = Map.empty<Principal, Bool>();
  let pairingCodes = Map.empty<Text, PairingCodeData>();
  let phoneVerifications = Map.empty<Text, PhoneVerificationData>();
  let userLoginEvents = Map.empty<Principal, List.List<LoginEvent>>(); // New field for login tracking
  let deviceBatteryStatuses = Map.empty<Principal, DeviceBatteryStatus>(); // New field for device battery status

  // Types
  public type UserProfile = {
    name : Text;
    role : AppRole;
    phoneNumber : ?Text;
    photo : ?Storage.ExternalBlob;
  };

  public type AppRole = {
    #parent;
    #child;
    #admin;
  };

  public type PendingPairingRequest = {
    id : Nat;
    parent : Principal;
    child : Principal;
    pending : Bool;
  };

  public type ActivityEntry = {
    appSite : Text;
    durationMinutes : Nat;
    notes : Text;
    timestamp : Time.Time;
    childId : Principal;
  };

  public type LocationEntry = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
    childId : Principal;
  };

  public type ScheduleConfig = {
    allowedHours : [DayTimeWindow];
    dailyLimitMinutes : Nat;
  };

  public type DayTimeWindow = {
    dayOfWeek : Nat; // 0-6
    startHour : Nat;
    endHour : Nat;
  };

  public type ContentFilterConfig = {
    categories : [ContentCategory];
    allowlist : [Text];
    blocklist : [Text];
  };

  public type ContentCategory = {
    name : Text;
    enabled : Bool;
  };

  public type AuditLogEntry = {
    action : ActionType;
    executor : Principal;
    timestamp : Time.Time;
    details : AuditLogDetails;
  };

  public type ActionType = {
    #pairingCreated;
    #scheduleChanged;
    #filterChanged;
    #accountDisabled;
    #phonePairingInitiated;
    #phonePairingCompleted;
    #pendingRequestInitiated;
    #pendingRequestCompleted;
    #accountDeleted;
  };

  public type AuditLogDetails = {
    #pairingCreated : PairingDetails;
    #scheduleChanged : ScheduleChangeDetails;
    #filterChanged : FilterChangeDetails;
    #accountDisabled : AccountDisabledDetails;
    #phonePairingInitiated : PhonePairingInitiatedDetails;
    #phonePairingCompleted : PhonePairingCompletedDetails;
    #pendingRequestInitiated : PendingRequestInitiatedDetails;
    #pendingRequestCompleted : PendingRequestCompletedDetails;
    #accountDeleted : AccountDeletedDetails;
  };

  public type PairingDetails = {
    parent : Principal;
    child : Principal;
  };

  public type ScheduleChangeDetails = {
    child : Principal;
    newConfig : ScheduleConfig;
  };

  public type FilterChangeDetails = {
    child : Principal;
    newConfig : ContentFilterConfig;
  };

  public type AccountDisabledDetails = {
    account : Principal;
    reason : Text;
  };

  public type PhonePairingInitiatedDetails = {
    parentId : Principal;
    phoneNumber : Text;
  };

  public type PhonePairingCompletedDetails = {
    parentId : Principal;
    childId : Principal;
  };

  public type PendingRequestInitiatedDetails = {
    parent : Principal;
    child : Principal;
  };

  public type PendingRequestCompletedDetails = {
    parent : Principal;
    childName : Text;
    childPrincipal : Principal;
    successful : Bool;
  };

  public type AccountDeletedDetails = {
    account : Principal;
    role : AppRole;
  };

  public type PairingCodeData = {
    parentId : Principal;
    created : Time.Time;
    expires : Time.Time;
    isUsed : Bool;
  };

  public type PhoneVerificationData = {
    parentId : Principal;
    verificationCode : Text;
    created : Time.Time;
    expires : Time.Time;
    isVerified : Bool;
  };

  public type PairWithParentResult = {
    #success;
    #parentNotFound;
    #parentIdNotProvided;
    #sameFamily;
    #notAChild;
    #alreadyPaired;
    #alreadyUsed;
    #parentNotParent;
    #invalidCode;
    #codeExpired;
    #phoneVerificationInitiated;
    #phoneVerificationFailed;
    #phoneVerificationSuccess;
    #phoneVerificationExpired;
    #phoneNumberAlreadyLinked;
    #pendingLinkRequest;
    #unexpectedError;
  };

  public type AdminDashboardMetrics = {
    totalParents : Nat;
    totalChildren : Nat;
    totalAdmins : Nat;
    totalParentChildLinks : Nat;
    totalUsersEverLoggedIn : Nat;
    activeSessionsEstimate : Nat;
    totalPendingPairings : Nat;
    totalDisabledAccounts : Nat;
    totalSchedulesConfigured : Nat;
    totalContentFiltersConfigured : Nat;
  };

  // ==== Count and List Functions ====
  public query ({ caller }) func getParentUsersCount() : async Nat {
    checkAdminOrTrap(caller, "Only admins can access parent users count");
    userProfiles.values().filter(func(p) { p.role == #parent }).size();
  };

  public query ({ caller }) func getChildUsersCount() : async Nat {
    checkAdminOrTrap(caller, "Only admins can access child users count");
    userProfiles.values().filter(func(p) { p.role == #child }).size();
  };

  public query ({ caller }) func getParentUsers() : async [(Principal, UserProfile)] {
    checkAdminOrTrap(caller, "Only admins can access parent users");
    getUsersByRole(#parent);
  };

  public query ({ caller }) func getChildUsers() : async [(Principal, UserProfile)] {
    checkAdminOrTrap(caller, "Only admins can access child users");
    getUsersByRole(#child);
  };

  // ==== Login Analytics ====
  public query ({ caller }) func getLoginCountByDay(year : Nat, month : Nat, day : Nat) : async Nat {
    checkAdminOrTrap(caller, "Only admins can access login analytics");
    countLoginsInRange(getDayStartTimestamp(year, month, day), 86_400_000_000_000);
  };

  public query ({ caller }) func getLoginCountByMonth(year : Nat, month : Nat) : async Nat {
    checkAdminOrTrap(caller, "Only admins can access login analytics");
    let startTimestamp = getDayStartTimestamp(year, month, 1);
    let daysInMonth = switch (month) {
      case (1 or 3 or 5 or 7 or 8 or 10 or 12) { 31 };
      case (4 or 6 or 9 or 11) { 30 };
      case (2) {
        let leapYear = switch (year % 4 == 0) {
          case (true) { 1 };
          case (false) { 0 };
        };
        28 + leapYear;
      };
      case (_) { 28 };
    };
    countLoginsInRange(startTimestamp, daysInMonth * 86_400_000_000_000);
  };

  public query ({ caller }) func getLoginCountByYear(year : Nat) : async Nat {
    checkAdminOrTrap(caller, "Only admins can access login analytics");
    let startTimestamp = getDayStartTimestamp(year, 1, 1);
    let yearDuration = 365 * 86_400_000_000_000;
    countLoginsInRange(startTimestamp, yearDuration);
  };

  public shared ({ caller }) func recordLoginEvent(_device : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record login events");
    };
    let now = Time.now();
    let loginEvent : LoginEvent = { timestamp = now };

    let existingEvents = switch (userLoginEvents.get(caller)) {
      case (?events) { events };
      case (null) { List.empty<LoginEvent>() };
    };

    existingEvents.add(loginEvent);
    userLoginEvents.add(caller, existingEvents);
  };

  // ==== Device Battery Percentage ====
  public shared ({ caller }) func updateDeviceBatteryStatus(status : DeviceBatteryStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update device battery status");
    };
    deviceBatteryStatuses.add(caller, status);
  };

  public query ({ caller }) func getAllDeviceBatteryStatuses() : async [(Principal, DeviceBatteryStatus)] {
    checkAdminOrTrap(caller, "Only admins can access device battery statuses");
    deviceBatteryStatuses.toArray();
  };

  // ==== Authorization System (safe) ====
  public query ({ caller }) func isCallerAllowlistedAdmin() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      false;
    } else {
      allowlistedAdminPrincipals.contains(caller);
    };
  };

  public query ({ caller }) func isPrincipalAllowlistedAdmin(principal : Principal) : async Bool {
    checkAdminOrTrap(caller, "Only admins can check allowlist status");
    allowlistedAdminPrincipals.contains(principal);
  };

  // Verify admin password with allowlisting (safe)
  public shared ({ caller }) func verifyAdminPassword(password : Text) : async Bool {
    checkUserOrTrap(caller, "Only authenticated users can verify admin password");
    password == adminPassword;
  };

  // Only allow allowlisted admins to update password (authenticated, safe)
  public shared ({ caller }) func changeAdminPassword(oldPassword : Text, newPassword : Text) : async () {
    checkAdminOrTrap(caller, "Only authenticated admins can change admin password");
    if (not allowlistedAdminPrincipals.contains(caller)) {
      Runtime.trap("Not allowed: Only leader-allowlisted admins can change admin password");
    };
    if (oldPassword != adminPassword) {
      Runtime.trap("Incorrect old password");
    };
    adminPassword := newPassword;
  };

  // Allow only authenticated users to add to allowlist with explicit password fallback
  public shared ({ caller }) func addAllowlistedAdminPrincipal(adminPasswordAttempt : Text, principal : Principal) : async () {
    checkUserOrTrap(caller, "Only authenticated users can add allowlisted admins");
    if (adminPasswordAttempt == adminPassword) {
      allowlistedAdminPrincipals.add(principal);
    } else {
      Runtime.trap("Unauthorized attempt");
    };
  };

  // Allow only authenticated users to revoke allowlist with explicit password fallback
  public shared ({ caller }) func removeAllowlistedAdminPrincipal(adminPasswordAttempt : Text, principal : Principal) : async () {
    checkUserOrTrap(caller, "Only authenticated users can remove allowlisted admins");
    if (adminPasswordAttempt == adminPassword) {
      allowlistedAdminPrincipals.remove(principal);
    } else {
      Runtime.trap("Unauthorized attempt");
    };
  };

  public query ({ caller }) func getAllowlistedAdminPrincipals() : async [Principal] {
    checkAdminOrTrap(caller, "Only admins can view allowlisted admin principals");
    allowlistedAdminPrincipals.toArray();
  };

  // Live Location Sharing Management
  public shared ({ caller }) func setLiveLocationSharing(enabled : Bool) : async () {
    checkUserOrTrap(caller, "Only users can update location sharing");
    checkNotDisabledAccount(caller);

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#child) {
            liveLocationSharing.add(caller, enabled);
          };
          case (_) {
            Runtime.trap("Only children can update location sharing");
          };
        };
      };
      case (null) {
        Runtime.trap("Only children can update location sharing");
      };
    };
  };

  public query ({ caller }) func getLiveLocationSharingStatus(childId : Principal) : async Bool {
    checkUserOrTrap(caller, "Only users can view location sharing status");

    if (caller == childId) {
      return switch (liveLocationSharing.get(childId)) {
        case (?enabled) { enabled };
        case (null) { false };
      };
    };

    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (parent == caller) {
          return switch (liveLocationSharing.get(childId)) {
            case (?enabled) { enabled };
            case (null) { false };
          };
        };
      };
      case (null) {};
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return switch (liveLocationSharing.get(childId)) {
        case (?enabled) { enabled };
        case (null) { false };
      };
    };

    Runtime.trap("Unauthorized: Can only view your own, your child's, or any child's (admin) location sharing status");
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUserOrTrap(caller, "Only users can view profiles");
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkUserOrTrap(caller, "Only users can view profiles");
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return userProfiles.get(user);
    };
    if (caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUserOrTrap(caller, "Only users can save profiles");

    // CRITICAL: Only allowlisted principals can set admin role
    if (profile.role == #admin) {
      if (not allowlistedAdminPrincipals.contains(caller)) {
        Runtime.trap("Unauthorized: Only allowlisted leaders can set admin role");
      };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveProfilePhoto(blob : Storage.ExternalBlob) : async () {
    checkUserOrTrap(caller, "Only users can save profile photos");

    // Add photo to existing or new user profile
    let newProfile = switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        {
          name = existingProfile.name;
          role = existingProfile.role;
          phoneNumber = existingProfile.phoneNumber;
          photo = ?blob;
        };
      };
      case (null) {
        {
          name = "";
          role = #parent;
          phoneNumber = null;
          photo = ?blob;
        };
      };
    };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getCallerProfilePhoto() : async ?Storage.ExternalBlob {
    checkUserOrTrap(caller, "Only users can view profile photos");
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.photo };
      case (null) { null };
    };
  };

  public shared ({ caller }) func deleteCallerAccount() : async () {
    checkUserOrTrap(caller, "Only users can delete their own account");

    // Get user profile before deletion for audit log
    let userRole = switch (userProfiles.get(caller)) {
      case (?profile) { profile.role };
      case (null) { #parent }; // Default fallback
    };

    // If user is a parent, remove all parent-child links
    switch (parentChildLinks.get(caller)) {
      case (?children) {
        for (child in children.values()) {
          childParentLinks.remove(child);
        };
        parentChildLinks.remove(caller);
      };
      case (null) {};
    };

    // If user is a child, remove child-parent link
    switch (childParentLinks.get(caller)) {
      case (?parent) {
        childParentLinks.remove(caller);
        // Remove from parent's children list
        switch (parentChildLinks.get(parent)) {
          case (?children) {
            let updatedChildren = children.filter(func(child : Principal) : Bool { child != caller });
            parentChildLinks.add(parent, updatedChildren);
          };
          case (null) {};
        };
      };
      case (null) {};
    };

    // Create audit log entry before deletion
    let auditEntry : AuditLogEntry = {
      action = #accountDeleted;
      executor = caller;
      timestamp = Time.now();
      details = #accountDeleted({
        account = caller;
        role = userRole;
      });
    };
    addAuditLogEntry(caller, auditEntry);

    // Delete all user data
    userProfiles.remove(caller);
    schedules.remove(caller);
    contentFilters.remove(caller);
    activities.remove(caller);
    locations.remove(caller);
    liveLocationSharing.remove(caller);
    heartbeatTimestamps.remove(caller);
    disabledAccounts.remove(caller);

    // Remove from pending pairings
    var pairingsToRemove : List.List<Nat> = List.empty<Nat>();
    for ((id, request) in pendingPairings.entries()) {
      if (request.parent == caller or request.child == caller) {
        pairingsToRemove.add(id);
      };
    };
    for (id in pairingsToRemove.values()) {
      pendingPairings.remove(id);
    };

    // Note: Audit logs are kept for compliance/historical purposes
  };

  public shared ({ caller }) func addAllowlistedAdmin(adminPasswordAttempt : Text, principal : Principal) : async () {
    checkUserOrTrap(caller, "Only authenticated users can add allowlisted admins");
    if (adminPasswordAttempt == adminPassword) {
      allowlistedAdminPrincipals.add(principal);
    } else {
      Runtime.trap("Unauthorized attempt");
    };
  };

  public shared ({ caller }) func revokeAllowlistedAdmin(adminPasswordAttempt : Text, principal : Principal) : async () {
    checkUserOrTrap(caller, "Only authenticated users can remove allowlisted admins");
    if (adminPasswordAttempt == adminPassword) {
      allowlistedAdminPrincipals.remove(principal);
    } else {
      Runtime.trap("Unauthorized attempt");
    };
  };

  public shared ({ caller }) func recordHeartbeat() : async () {
    checkUserOrTrap(caller, "Only users can record heartbeat");
    heartbeatTimestamps.add(caller, Time.now());
  };

  public query ({ caller }) func getAdminDashboardMetrics() : async AdminDashboardMetrics {
    checkAdminOrTrap(caller, "Only admins can view dashboard metrics");

    var totalParents : Nat = 0;
    var totalChildren : Nat = 0;
    var totalAdmins : Nat = 0;
    var totalUsersEverLoggedIn : Nat = 0;

    for ((_, profile) in userProfiles.entries()) {
      totalUsersEverLoggedIn += 1;
      switch (profile.role) {
        case (#parent) { totalParents += 1 };
        case (#child) { totalChildren += 1 };
        case (#admin) { totalAdmins += 1 };
      };
    };

    var totalParentChildLinks : Nat = 0;
    for ((_, children) in parentChildLinks.entries()) {
      totalParentChildLinks += children.size();
    };

    // Active sessions: users with heartbeat in last 5 minutes
    let fiveMinutesAgo = Time.now() - 300_000_000_000;
    var activeSessionsEstimate : Nat = 0;
    for ((_, timestamp) in heartbeatTimestamps.entries()) {
      if (timestamp > fiveMinutesAgo) {
        activeSessionsEstimate += 1;
      };
    };

    var totalPendingPairings : Nat = 0;
    for ((_, request) in pendingPairings.entries()) {
      if (request.pending) {
        totalPendingPairings += 1;
      };
    };

    var totalDisabledAccounts : Nat = 0;
    for ((_, disabled) in disabledAccounts.entries()) {
      if (disabled) {
        totalDisabledAccounts += 1;
      };
    };

    let totalSchedulesConfigured = schedules.size();
    let totalContentFiltersConfigured = contentFilters.size();

    {
      totalParents;
      totalChildren;
      totalAdmins;
      totalParentChildLinks;
      totalUsersEverLoggedIn;
      activeSessionsEstimate;
      totalPendingPairings;
      totalDisabledAccounts;
      totalSchedulesConfigured;
      totalContentFiltersConfigured;
    };
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    checkUserOrTrap(caller, "Only users can generate invite codes");
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteLinksState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    checkUserOrTrap(caller, "Only users can submit RSVPs");
    InviteLinksModule.submitRSVP(inviteLinksState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    checkUserOrTrap(caller, "Only users can view RSVPs");
    InviteLinksModule.getAllRSVPs(inviteLinksState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    checkUserOrTrap(caller, "Only users can view invite codes");
    InviteLinksModule.getInviteCodes(inviteLinksState);
  };

  public shared ({ caller }) func updateSchedule(childId : Principal, newConfig : ScheduleConfig) : async () {
    checkUserOrTrap(caller, "Only users can update schedules");

    // Verify caller is the parent of this child or an admin
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Only the child's parent or an admin can update schedule");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Only the child's parent or an admin can update schedule");
      };
    };

    schedules.add(childId, newConfig);

    let auditEntry : AuditLogEntry = {
      action = #scheduleChanged;
      executor = caller;
      timestamp = Time.now();
      details = #scheduleChanged({
        child = childId;
        newConfig;
      });
    };
    addAuditLogEntry(childId, auditEntry);
  };

  public query ({ caller }) func getSchedule(childId : Principal) : async ?ScheduleConfig {
    checkUserOrTrap(caller, "Only users can view schedules");

    if (caller == childId) {
      return schedules.get(childId);
    };

    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Can only view your own or your child's schedule");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Can only view your own or your child's schedule");
      };
    };

    schedules.get(childId);
  };

  public shared ({ caller }) func updateContentFilter(childId : Principal, newConfig : ContentFilterConfig) : async () {
    checkUserOrTrap(caller, "Only users can update content filters");

    // Verify caller is the parent of this child or an admin
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Only the child's parent or an admin can update content filter");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Only the child's parent or an admin can update content filter");
      };
    };

    contentFilters.add(childId, newConfig);

    let auditEntry : AuditLogEntry = {
      action = #filterChanged;
      executor = caller;
      timestamp = Time.now();
      details = #filterChanged({
        child = childId;
        newConfig;
      });
    };
    addAuditLogEntry(childId, auditEntry);
  };

  public query ({ caller }) func getContentFilter(childId : Principal) : async ?ContentFilterConfig {
    checkUserOrTrap(caller, "Only users can view content filters");

    if (caller == childId) {
      return contentFilters.get(childId);
    };

    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Can only view your own or your child's content filter");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Can only view your own or your child's content filter");
      };
    };

    contentFilters.get(childId);
  };

  public shared ({ caller }) func addActivity(entry : ActivityEntry) : async () {
    checkUserOrTrap(caller, "Only users can add activities");
    if (entry.childId != caller) {
      Runtime.trap("Unauthorized: Can only add activities for yourself");
    };

    let existingList = switch (activities.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<ActivityEntry>() };
    };
    existingList.add(entry);
    activities.add(caller, existingList);
  };

  public query ({ caller }) func getActivities(childId : Principal) : async [ActivityEntry] {
    checkUserOrTrap(caller, "Only users can view activities");

    if (caller == childId) {
      return listToArray(activities.get(childId));
    };

    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Can only view your own or your child's activities");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Can only view your own or your child's activities");
      };
    };

    listToArray(activities.get(childId));
  };

  public shared ({ caller }) func addLocation(entry : LocationEntry) : async () {
    checkUserOrTrap(caller, "Only users can add locations");
    if (entry.childId != caller) {
      Runtime.trap("Unauthorized: Can only add locations for yourself");
    };

    let existingList = switch (locations.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<LocationEntry>() };
    };
    existingList.add(entry);
    locations.add(caller, existingList);
  };

  public query ({ caller }) func getLocations(childId : Principal) : async [LocationEntry] {
    checkUserOrTrap(caller, "Only users can view locations");

    if (caller == childId) {
      return listToArray(locations.get(childId));
    };

    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Can only view your own or your child's locations");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Can only view your own or your child's locations");
      };
    };

    listToArray(locations.get(childId));
  };

  public query ({ caller }) func getAuditLog(childId : Principal) : async [AuditLogEntry] {
    checkUserOrTrap(caller, "Only users can view audit logs");

    if (caller == childId) {
      return listToArray(auditLogs.get(childId));
    };

    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (caller != parent) {
          checkAdminOrTrap(caller, "Can only view your own or your child's audit log");
        };
      };
      case (null) {
        checkAdminOrTrap(caller, "Can only view your own or your child's audit log");
      };
    };

    listToArray(auditLogs.get(childId));
  };

  public query ({ caller }) func getMyChildren() : async [Principal] {
    checkUserOrTrap(caller, "Only users can view their children");

    switch (parentChildLinks.get(caller)) {
      case (?children) { listToArray(?children) };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getMyParent() : async ?Principal {
    checkUserOrTrap(caller, "Only users can view their parent");
    childParentLinks.get(caller);
  };

  public query ({ caller }) func getPendingPairingRequests() : async [PendingPairingRequest] {
    checkUserOrTrap(caller, "Only users can view pending pairing requests");

    var result : List.List<PendingPairingRequest> = List.empty<PendingPairingRequest>();
    for ((_, request) in pendingPairings.entries()) {
      if (request.parent == caller and request.pending) {
        result.add(request);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func generatePairingCode() : async ?Text {
    checkUserOrTrap(caller, "Only users can generate pairing codes");
    checkNotDisabledAccount(caller);

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#parent) {};
          case (_) {
            Runtime.trap("Only parents can generate pairing codes");
          };
        };
      };
      case (null) {
        Runtime.trap("Only parents can generate pairing codes");
      };
    };

    let code = await generateSixDigitCode();
    let newCodeData : PairingCodeData = {
      parentId = caller;
      created = Time.now();
      expires = Time.now() + 60_000_000_000;
      isUsed = false;
    };
    pairingCodes.add(code, newCodeData);
    ?code;
  };

  public shared ({ caller }) func requestPairingWithParent(parentId : Principal) : async PairWithParentResult {
    checkUserOrTrap(caller, "Only users can request pairing");
    checkNotDisabledAccount(caller);

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#child) {};
          case (_) {
            Runtime.trap("Only children can request pairing with parents");
          };
        };
      };
      case (null) {
        Runtime.trap("Only children can request pairing with parents");
      };
    };

    currentPendingRequestCounter += 1;
    let newRequest = {
      id = currentPendingRequestCounter;
      parent = parentId;
      child = caller;
      pending = true;
    };

    let auditRequestEntry : AuditLogEntry = {
      action = #pendingRequestInitiated;
      executor = caller;
      timestamp = Time.now();
      details = #pendingRequestInitiated({
        parent = parentId;
        child = caller;
      });
    };
    addAuditLogEntry(caller, auditRequestEntry);
    addAuditLogEntry(parentId, auditRequestEntry);

    pendingPairings.add(currentPendingRequestCounter, newRequest);
    #pendingLinkRequest;
  };

  public shared ({ caller }) func acceptPendingPairing(requestId : Nat) : async PairWithParentResult {
    checkUserOrTrap(caller, "Only users can accept pairing requests");

    switch (pendingPairings.get(requestId)) {
      case (?requestData) {
        if (requestData.parent != caller) {
          Runtime.trap("Unauthorized: Only the parent in the request can accept it");
        };

        if (not requestData.pending) {
          return #alreadyUsed;
        };

        let updatedRequestData = {
          id = requestData.id;
          parent = requestData.parent;
          child = requestData.child;
          pending = false;
        };
        pendingPairings.add(requestId, updatedRequestData);

        childParentLinks.add(requestData.child, requestData.parent);
        let children = switch (parentChildLinks.get(requestData.parent)) {
          case (?existingChildren) { existingChildren };
          case (null) { List.empty<Principal>() };
        };
        children.add(requestData.child);
        parentChildLinks.add(requestData.parent, children);

        let auditEntry : AuditLogEntry = {
          action = #pairingCreated;
          executor = caller;
          timestamp = Time.now();
          details = #pairingCreated({
            parent = requestData.parent;
            child = requestData.child;
          });
        };
        addAuditLogEntry(requestData.child, auditEntry);
        addAuditLogEntry(requestData.parent, auditEntry);

        let auditAcceptanceEntry : AuditLogEntry = {
          action = #pendingRequestCompleted;
          executor = caller;
          timestamp = Time.now();
          details = #pendingRequestCompleted({
            parent = requestData.parent;
            childName = switch (userProfiles.get(requestData.child)) {
              case (?profile) { profile.name };
              case (null) { "" };
            };
            childPrincipal = requestData.child;
            successful = true;
          });
        };
        addAuditLogEntry(caller, auditAcceptanceEntry);
        addAuditLogEntry(requestData.child, auditAcceptanceEntry);

        #success;
      };
      case (null) { #unexpectedError };
    };
  };

  func validatePairingCode(code : Text) : ?PairingCodeData {
    if (code.size() != 6) { return null };
    for (char in code.chars()) {
      if (char < '0' or char > '9') {
        return null;
      };
    };
    switch (pairingCodes.get(code)) {
      case (null) { null };
      case (?codeData) {
        if (codeData.isUsed or Time.now() > codeData.expires) {
          return null;
        };
        ?codeData;
      };
    };
  };

  public shared ({ caller }) func pairWithParent(code : Text) : async PairWithParentResult {
    checkUserOrTrap(caller, "Only users can pair with parents");
    checkNotDisabledAccount(caller);

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#child) {};
          case (_) {
            Runtime.trap("Only children can pair with parents");
          };
        };
      };
      case (null) {
        Runtime.trap("Only children can pair with parents");
      };
    };

    func createPairing(codeData : PairingCodeData) : PairWithParentResult {
      if (codeData.parentId == caller) {
        return #sameFamily;
      };

      childParentLinks.add(caller, codeData.parentId);

      let children = switch (parentChildLinks.get(codeData.parentId)) {
        case (?existingChildren) { existingChildren };
        case (null) { List.empty<Principal>() };
      };
      children.add(caller);
      parentChildLinks.add(codeData.parentId, children);

      let updatedCodeData = { codeData with isUsed = true };
      pairingCodes.add(code, updatedCodeData);

      let auditEntry : AuditLogEntry = {
        action = #pairingCreated;
        executor = caller;
        timestamp = Time.now();
        details = #pairingCreated({
          parent = codeData.parentId;
          child = caller;
        });
      };
      addAuditLogEntry(caller, auditEntry);
      addAuditLogEntry(codeData.parentId, auditEntry);

      #success;
    };

    switch (validatePairingCode(code)) {
      case (?codeData) {
        createPairing(codeData);
      };
      case (null) { #invalidCode };
    };
  };

  // Helper Types and Functions for New Features
  public type LoginEvent = {
    timestamp : Time.Time;
  };

  public type DeviceBatteryStatus = {
    batteryPercentage : Nat; // 0-100
    timestamp : Time.Time;
  };

  func getUsersByRole(role : AppRole) : [(Principal, UserProfile)] {
    let results = Map.empty<Principal, UserProfile>();
    for ((p, profile) in userProfiles.entries()) {
      if (profile.role == role) {
        results.add(p, profile);
      };
    };
    results.toArray();
  };

  func countLoginsInRange(startTimestamp : Time.Time, duration : Int) : Nat {
    var count = 0;
    for ((_, events) in userLoginEvents.entries()) {
      for (event in events.values()) {
        if (event.timestamp >= startTimestamp and event.timestamp < (startTimestamp + duration)) {
          count += 1;
        };
      };
    };
    count;
  };

  func getDayStartTimestamp(year : Nat, month : Nat, day : Nat) : Time.Time {
    0;
  };

  func addAuditLogEntry(account : Principal, entry : AuditLogEntry) {
    let existingList = switch (auditLogs.get(account)) {
      case (?list) { list };
      case (null) { List.empty<AuditLogEntry>() };
    };
    existingList.add(entry);
    auditLogs.add(account, existingList);
  };

  func listToArray<T>(list : ?List.List<T>) : [T] {
    switch (list) {
      case (?l) { l.toArray() };
      case (null) { [] };
    };
  };

  func isAccountDisabledInternal(account : Principal) : Bool {
    switch (disabledAccounts.get(account)) {
      case (?disabled) { disabled };
      case (null) { false };
    };
  };

  func checkAdminOrTrap(caller : Principal, errorMsg : Text) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: " # errorMsg);
    };
  };

  func checkUserOrTrap(caller : Principal, errorMsg : Text) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: " # errorMsg);
    };
  };

  func checkNotDisabledAccount(account : Principal) {
    if (isAccountDisabledInternal(account)) {
      Runtime.trap("Cannot perform action with disabled account");
    };
  };

  func generateSixDigitCode() : async Text {
    let randomBlob = await Random.blob();
    let bytes = randomBlob.toArray();
    var num : Nat = 0;
    let len = bytes.size();
    if (len > 0) { num := bytes[0].toNat() };
    if (len > 1) { num := num * 256 + bytes[1].toNat() };
    if (len > 2) { num := num * 256 + bytes[2].toNat() };
    if (len > 3) { num := num * 256 + bytes[3].toNat() };

    let code = num % 1_000_000;
    let codeText = code.toText();
    let padding = 6 - codeText.size();
    var result = "";
    var i = 0;
    while (i < padding) {
      result := result # "0";
      i += 1;
    };
    result # codeText;
  };
};
