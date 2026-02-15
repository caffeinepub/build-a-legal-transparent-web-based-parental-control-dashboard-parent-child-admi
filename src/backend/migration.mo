import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    parentChildLinks : Map.Map<Principal, List.List<Principal>>;
    childParentLinks : Map.Map<Principal, Principal>;
    schedules : Map.Map<Principal, OldScheduleConfig>;
    contentFilters : Map.Map<Principal, OldContentFilterConfig>;
    activities : Map.Map<Principal, List.List<OldActivityEntry>>;
    locations : Map.Map<Principal, List.List<OldLocationEntry>>;
    auditLogs : Map.Map<Principal, List.List<OldAuditLogEntry>>;
    disabledAccounts : Map.Map<Principal, Bool>;
    liveLocationSharing : Map.Map<Principal, Bool>;
    pairingCodes : Map.Map<Text, OldPairingCodeData>;
  };

  type OldUserProfile = {
    name : Text;
    role : OldAppRole;
  };

  type OldAppRole = {
    #parent;
    #child;
    #admin;
  };

  type OldActivityEntry = {
    appSite : Text;
    durationMinutes : Nat;
    notes : Text;
    timestamp : Time.Time;
    childId : Principal;
  };

  type OldLocationEntry = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
    childId : Principal;
  };

  type OldScheduleConfig = {
    allowedHours : [OldDayTimeWindow];
    dailyLimitMinutes : Nat;
  };

  type OldDayTimeWindow = {
    dayOfWeek : Nat;
    startHour : Nat;
    endHour : Nat;
  };

  type OldContentFilterConfig = {
    categories : [OldContentCategory];
    allowlist : [Text];
    blocklist : [Text];
  };

  type OldContentCategory = {
    name : Text;
    enabled : Bool;
  };

  type OldAuditLogEntry = {
    action : OldActionType;
    executor : Principal;
    timestamp : Time.Time;
    details : OldAuditLogDetails;
  };

  type OldActionType = {
    #pairingCreated;
    #scheduleChanged;
    #filterChanged;
    #accountDisabled;
  };

  type OldAuditLogDetails = {
    #pairingCreated : OldPairingDetails;
    #scheduleChanged : OldScheduleChangeDetails;
    #filterChanged : OldFilterChangeDetails;
    #accountDisabled : OldAccountDisabledDetails;
  };

  type OldPairingDetails = {
    parent : Principal;
    child : Principal;
  };

  type OldScheduleChangeDetails = {
    child : Principal;
    newConfig : OldScheduleConfig;
  };

  type OldFilterChangeDetails = {
    child : Principal;
    newConfig : OldContentFilterConfig;
  };

  type OldAccountDisabledDetails = {
    account : Principal;
    reason : Text;
  };

  type OldPairingCodeData = {
    parentId : Principal;
    created : Time.Time;
    expires : Time.Time;
    isUsed : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    parentChildLinks : Map.Map<Principal, List.List<Principal>>;
    childParentLinks : Map.Map<Principal, Principal>;
    schedules : Map.Map<Principal, NewScheduleConfig>;
    contentFilters : Map.Map<Principal, NewContentFilterConfig>;
    activities : Map.Map<Principal, List.List<NewActivityEntry>>;
    locations : Map.Map<Principal, List.List<NewLocationEntry>>;
    auditLogs : Map.Map<Principal, List.List<NewAuditLogEntry>>;
    disabledAccounts : Map.Map<Principal, Bool>;
    liveLocationSharing : Map.Map<Principal, Bool>;
    pairingCodes : Map.Map<Text, NewPairingCodeData>;
    phoneVerifications : Map.Map<Text, NewPhoneVerificationData>;
  };

  type NewUserProfile = {
    name : Text;
    role : NewAppRole;
    phoneNumber : ?Text;
  };

  type NewAppRole = {
    #parent;
    #child;
    #admin;
  };

  type NewActivityEntry = {
    appSite : Text;
    durationMinutes : Nat;
    notes : Text;
    timestamp : Time.Time;
    childId : Principal;
  };

  type NewLocationEntry = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
    childId : Principal;
  };

  type NewScheduleConfig = {
    allowedHours : [NewDayTimeWindow];
    dailyLimitMinutes : Nat;
  };

  type NewDayTimeWindow = {
    dayOfWeek : Nat;
    startHour : Nat;
    endHour : Nat;
  };

  type NewContentFilterConfig = {
    categories : [NewContentCategory];
    allowlist : [Text];
    blocklist : [Text];
  };

  type NewContentCategory = {
    name : Text;
    enabled : Bool;
  };

  type NewAuditLogEntry = {
    action : NewActionType;
    executor : Principal;
    timestamp : Time.Time;
    details : NewAuditLogDetails;
  };

  type NewActionType = {
    #pairingCreated;
    #scheduleChanged;
    #filterChanged;
    #accountDisabled;
    #phonePairingInitiated;
    #phonePairingCompleted;
  };

  type NewAuditLogDetails = {
    #pairingCreated : NewPairingDetails;
    #scheduleChanged : NewScheduleChangeDetails;
    #filterChanged : NewFilterChangeDetails;
    #accountDisabled : NewAccountDisabledDetails;
    #phonePairingInitiated : NewPhonePairingInitiatedDetails;
    #phonePairingCompleted : NewPhonePairingCompletedDetails;
  };

  type NewPairingDetails = {
    parent : Principal;
    child : Principal;
  };

  type NewScheduleChangeDetails = {
    child : Principal;
    newConfig : NewScheduleConfig;
  };

  type NewFilterChangeDetails = {
    child : Principal;
    newConfig : NewContentFilterConfig;
  };

  type NewAccountDisabledDetails = {
    account : Principal;
    reason : Text;
  };

  type NewPhonePairingInitiatedDetails = {
    parentId : Principal;
    phoneNumber : Text;
  };

  type NewPhonePairingCompletedDetails = {
    parentId : Principal;
    childId : Principal;
  };

  type NewPairingCodeData = {
    parentId : Principal;
    created : Time.Time;
    expires : Time.Time;
    isUsed : Bool;
  };

  type NewPhoneVerificationData = {
    parentId : Principal;
    verificationCode : Text;
    created : Time.Time;
    expires : Time.Time;
    isVerified : Bool;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          phoneNumber = null;
        };
      }
    );

    // Map each entry in old.auditLogs to convert List<List> entries
    let newAuditLogs = old.auditLogs.map<Principal, List.List<OldAuditLogEntry>, List.List<NewAuditLogEntry>>(
      func(_principal, oldList) {
        // Explicitly map each entry from List<OldAuditLogEntry> to List<NewAuditLogEntry>
        oldList.map<OldAuditLogEntry, NewAuditLogEntry>(func(oldEntry) { oldEntry });
      }
    );

    {
      userProfiles = newUserProfiles;
      parentChildLinks = old.parentChildLinks;
      childParentLinks = old.childParentLinks;
      schedules = old.schedules.map<Principal, OldScheduleConfig, NewScheduleConfig>(
        func(_principal, oldSchedule) { oldSchedule }
      );
      contentFilters = old.contentFilters.map<Principal, OldContentFilterConfig, NewContentFilterConfig>(
        func(_principal, oldFilter) { oldFilter }
      );
      activities = old.activities.map<Principal, List.List<OldActivityEntry>, List.List<NewActivityEntry>>(
        func(_principal, oldList) { oldList }
      );
      locations = old.locations.map<Principal, List.List<OldLocationEntry>, List.List<NewLocationEntry>>(
        func(_principal, oldList) { oldList }
      );
      auditLogs = newAuditLogs; // Use the mapped auditLogs
      disabledAccounts = old.disabledAccounts;
      liveLocationSharing = old.liveLocationSharing;
      pairingCodes = old.pairingCodes.map<Text, OldPairingCodeData, NewPairingCodeData>(
        func(_text, oldCodeData) { oldCodeData }
      );
      phoneVerifications = Map.empty<Text, NewPhoneVerificationData>();
    };
  };
};
