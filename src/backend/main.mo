import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Invite Links System State
  let inviteLinksState = InviteLinksModule.initState();

  // Types
  public type InstanceId = Nat32;

  public type UserProfile = {
    name : Text;
    role : AppRole;
  };

  public type AppRole = {
    #parent;
    #child;
    #admin;
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
  };

  public type AuditLogDetails = {
    #pairingCreated : PairingDetails;
    #scheduleChanged : ScheduleChangeDetails;
    #filterChanged : FilterChangeDetails;
    #accountDisabled : AccountDisabledDetails;
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

  public type ParentChildLink = {
    parent : Principal;
    child : Principal;
    createdAt : Time.Time;
  };

  public type ParentInviteCode = {
    parent : Principal;
    code : Text;
    createdAt : Time.Time;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let parentChildLinks = Map.empty<Principal, List.List<Principal>>(); // parent -> list of children
  let childParentLinks = Map.empty<Principal, Principal>(); // child -> parent
  let schedules = Map.empty<Principal, ScheduleConfig>();
  let contentFilters = Map.empty<Principal, ContentFilterConfig>();
  let activities = Map.empty<Principal, List.List<ActivityEntry>>();
  let locations = Map.empty<Principal, List.List<LocationEntry>>();
  let auditLogs = Map.empty<Principal, List.List<AuditLogEntry>>();
  let disabledAccounts = Map.empty<Principal, Bool>();
  let parentInviteCodes = Map.empty<Text, ParentInviteCode>();

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    // Admins can view any profile
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return userProfiles.get(user);
    };
    // Users can only view their own profile
    if (caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ==== Invite Link system functions ====
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };

    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteLinksState, code);
    code;
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteLinksState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteLinksState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteLinksState);
  };

  // Schedule Management
  public shared ({ caller }) func updateSchedule(childId : Principal, newConfig : ScheduleConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update schedules");
    };

    // Check if account is disabled
    if (isAccountDisabledInternal(childId)) {
      Runtime.trap("Cannot update schedule for disabled account");
    };

    // Verify caller is parent of child OR admin
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (childParentLinks.get(childId)) {
        case (?parent) {
          if (parent != caller) {
            Runtime.trap("Unauthorized: Only the parent or admin can update child schedule");
          };
        };
        case (null) {
          Runtime.trap("Child is not paired with any parent");
        };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view schedules");
    };

    // Child can view their own schedule
    if (caller == childId) {
      return schedules.get(childId);
    };

    // Parent can view their child's schedule
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (parent == caller) {
          return schedules.get(childId);
        };
      };
      case (null) {};
    };

    // Admin can view any schedule
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return schedules.get(childId);
    };

    Runtime.trap("Unauthorized: Can only view your own or your child's schedule");
  };

  // Content Filter Management
  public shared ({ caller }) func updateContentFilter(childId : Principal, newConfig : ContentFilterConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update content filters");
    };

    // Check if account is disabled
    if (isAccountDisabledInternal(childId)) {
      Runtime.trap("Cannot update filter for disabled account");
    };

    // Verify caller is parent of child OR admin
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (childParentLinks.get(childId)) {
        case (?parent) {
          if (parent != caller) {
            Runtime.trap("Unauthorized: Only the parent or admin can update child filter");
          };
        };
        case (null) {
          Runtime.trap("Child is not paired with any parent");
        };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view content filters");
    };

    // Child can view their own filter
    if (caller == childId) {
      return contentFilters.get(childId);
    };

    // Parent can view their child's filter
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (parent == caller) {
          return contentFilters.get(childId);
        };
      };
      case (null) {};
    };

    // Admin can view any filter
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return contentFilters.get(childId);
    };

    Runtime.trap("Unauthorized: Can only view your own or your child's filter");
  };

  // Activity Management
  public shared ({ caller }) func addActivity(entry : ActivityEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add activities");
    };

    // Verify caller is the child submitting their own activity
    if (caller != entry.childId) {
      Runtime.trap("Unauthorized: Can only submit your own activities");
    };

    // Check if account is disabled
    if (isAccountDisabledInternal(caller)) {
      Runtime.trap("Cannot add activity for disabled account");
    };

    let existingList = switch (activities.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<ActivityEntry>() };
    };

    existingList.add(entry);
    activities.add(caller, existingList);
  };

  public query ({ caller }) func getActivities(childId : Principal) : async [ActivityEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };

    // Child can view their own activities
    if (caller == childId) {
      return listToArray(activities.get(childId));
    };

    // Parent can view their child's activities
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (parent == caller) {
          return listToArray(activities.get(childId));
        };
      };
      case (null) {};
    };

    // Admin CANNOT view individual child activities (only aggregated metrics)
    Runtime.trap("Unauthorized: Can only view your own or your child's activities");
  };

  // Location Management
  public shared ({ caller }) func addLocation(entry : LocationEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add locations");
    };

    // Verify caller is the child submitting their own location
    if (caller != entry.childId) {
      Runtime.trap("Unauthorized: Can only submit your own location");
    };

    // Check if account is disabled
    if (isAccountDisabledInternal(caller)) {
      Runtime.trap("Cannot add location for disabled account");
    };

    let existingList = switch (locations.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<LocationEntry>() };
    };

    existingList.add(entry);
    locations.add(caller, existingList);
  };

  public query ({ caller }) func getLocations(childId : Principal) : async [LocationEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view locations");
    };

    // Child can view their own locations
    if (caller == childId) {
      return listToArray(locations.get(childId));
    };

    // Parent can view their child's locations
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (parent == caller) {
          return listToArray(locations.get(childId));
        };
      };
      case (null) {};
    };

    // Admin CANNOT view individual child locations
    Runtime.trap("Unauthorized: Can only view your own or your child's locations");
  };

  // Audit Log Management
  public query ({ caller }) func getAuditLog(childId : Principal) : async [AuditLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view audit logs");
    };

    // Parent can view their child's audit log
    switch (childParentLinks.get(childId)) {
      case (?parent) {
        if (parent == caller) {
          return listToArray(auditLogs.get(childId));
        };
      };
      case (null) {};
    };

    // Admin can view audit log metadata (but not detailed child content)
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return listToArray(auditLogs.get(childId));
    };

    Runtime.trap("Unauthorized: Only parent or admin can view audit logs");
  };

  // Admin Functions
  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.entries().toArray();
  };

  public query ({ caller }) func getParentChildLinks() : async [(Principal, [Principal])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view parent-child links");
    };
    parentChildLinks.entries().map<(Principal, List.List<Principal>), (Principal, [Principal])>(
        func((parent, children)) : (Principal, [Principal]) {
          (parent, listToArray(?children));
        },
      ).toArray();
  };

  public shared ({ caller }) func disableAccount(account : Principal, reason : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can disable accounts");
    };

    disabledAccounts.add(account, true);

    let auditEntry : AuditLogEntry = {
      action = #accountDisabled;
      executor = caller;
      timestamp = Time.now();
      details = #accountDisabled({
        account;
        reason;
      });
    };
    addAuditLogEntry(account, auditEntry);
  };

  public shared ({ caller }) func enableAccount(account : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can enable accounts");
    };

    disabledAccounts.remove(account);
  };

  public query ({ caller }) func isAccountDisabled(account : Principal) : async Bool {
    // Anyone can check if an account is disabled
    switch (disabledAccounts.get(account)) {
      case (?disabled) { disabled };
      case (null) { false };
    };
  };

  public query ({ caller }) func getAggregatedMetrics() : async {
    totalUsers : Nat;
    totalParents : Nat;
    totalChildren : Nat;
    totalPairings : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view aggregated metrics");
    };

    var totalParents = 0;
    var totalChildren = 0;

    for ((_, profile) in userProfiles.entries()) {
      switch (profile.role) {
        case (#parent) { totalParents += 1 };
        case (#child) { totalChildren += 1 };
        case (#admin) {};
      };
    };

    {
      totalUsers = userProfiles.size();
      totalParents;
      totalChildren;
      totalPairings = childParentLinks.size();
    };
  };

  // Parent Functions
  public query ({ caller }) func getMyChildren() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their children");
    };

    switch (parentChildLinks.get(caller)) {
      case (?children) { listToArray(?children) };
      case (null) { [] };
    };
  };

  // Child Functions
  public query ({ caller }) func getMyParent() : async ?Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their parent");
    };

    childParentLinks.get(caller);
  };

  // Helper functions
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
};
