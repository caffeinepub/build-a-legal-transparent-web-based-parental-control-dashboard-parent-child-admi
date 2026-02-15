import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  public type AppRole = {
    #parent;
    #child;
    #admin;
  };

  public type OldAuditLogEntry = {
    action : OldActionType;
    executor : Principal;
    timestamp : Int;
    details : OldAuditLogDetails;
  };

  public type OldActionType = {
    #pairingCreated;
    #scheduleChanged;
    #filterChanged;
    #accountDisabled;
    #phonePairingInitiated;
    #phonePairingCompleted;
  };

  public type OldAuditLogDetails = {
    #pairingCreated : PairingDetails;
    #scheduleChanged : ScheduleChangeDetails;
    #filterChanged : FilterChangeDetails;
    #accountDisabled : AccountDisabledDetails;
    #phonePairingInitiated : PhonePairingInitiatedDetails;
    #phonePairingCompleted : PhonePairingCompletedDetails;
  };

  public type NewAuditLogEntry = {
    action : NewActionType;
    executor : Principal;
    timestamp : Int;
    details : NewAuditLogDetails;
  };

  public type NewActionType = {
    #pairingCreated;
    #scheduleChanged;
    #filterChanged;
    #accountDisabled;
    #phonePairingInitiated;
    #phonePairingCompleted;
    #pendingRequestInitiated;
    #pendingRequestCompleted;
  };

  public type NewAuditLogDetails = {
    #pairingCreated : PairingDetails;
    #scheduleChanged : ScheduleChangeDetails;
    #filterChanged : FilterChangeDetails;
    #accountDisabled : AccountDisabledDetails;
    #phonePairingInitiated : PhonePairingInitiatedDetails;
    #phonePairingCompleted : PhonePairingCompletedDetails;
    #pendingRequestInitiated : PendingRequestInitiatedDetails;
    #pendingRequestCompleted : PendingRequestCompletedDetails;
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

  public type ScheduleConfig = {
    allowedHours : [DayTimeWindow];
    dailyLimitMinutes : Nat;
  };

  public type DayTimeWindow = {
    dayOfWeek : Nat;
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

  // Old state (from previous version)
  public type OldUserProfile = {
    name : Text;
    role : AppRole;
    phoneNumber : ?Text;
  };

  public type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    parentChildLinks : Map.Map<Principal, List.List<Principal>>;
    childParentLinks : Map.Map<Principal, Principal>;
    auditLogs : Map.Map<Principal, List.List<OldAuditLogEntry>>;
  };

  // New state
  public type NewUserProfile = {
    name : Text;
    role : AppRole;
    phoneNumber : ?Text;
  };

  public type PendingPairingRequest = {
    id : Nat;
    parent : Principal;
    child : Principal;
    pending : Bool;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    parentChildLinks : Map.Map<Principal, List.List<Principal>>;
    childParentLinks : Map.Map<Principal, Principal>;
    pendingPairings : Map.Map<Nat, PendingPairingRequest>;
    auditLogs : Map.Map<Principal, List.List<NewAuditLogEntry>>;
  };

  public func run(old : OldActor) : NewActor {
    let newAuditLogs = old.auditLogs.map<Principal, List.List<OldAuditLogEntry>, List.List<NewAuditLogEntry>>(
      func(_p, oldLogEntries) {
        oldLogEntries.map<OldAuditLogEntry, NewAuditLogEntry>(func(oldEntry) { toNewAuditLogEntry(oldEntry) });
      }
    );

    {
      userProfiles = old.userProfiles;
      parentChildLinks = old.parentChildLinks;
      childParentLinks = old.childParentLinks;
      pendingPairings = Map.empty<Nat, PendingPairingRequest>();
      auditLogs = newAuditLogs;
    };
  };

  func toNewAuditLogEntry(old : OldAuditLogEntry) : NewAuditLogEntry {
    {
      old with
      action = switch (old.action) {
        case (#pairingCreated) { #pairingCreated };
        case (#scheduleChanged) { #scheduleChanged };
        case (#filterChanged) { #filterChanged };
        case (#accountDisabled) { #accountDisabled };
        case (#phonePairingInitiated) { #phonePairingInitiated };
        case (#phonePairingCompleted) { #phonePairingCompleted };
      };
    };
  };

};
