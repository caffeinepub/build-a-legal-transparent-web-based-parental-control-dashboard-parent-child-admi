import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import List "mo:core/List";

module {
  type OldAuditLogEntry = {
    action : {
      #pairingCreated;
      #scheduleChanged;
      #filterChanged;
      #accountDisabled;
      #phonePairingInitiated;
      #phonePairingCompleted;
      #pendingRequestInitiated;
      #pendingRequestCompleted;
    };
    executor : Principal;
    timestamp : Int;
    details : {
      #pairingCreated : {
        parent : Principal;
        child : Principal;
      };
      #scheduleChanged : {
        child : Principal;
        newConfig : {
          allowedHours : [{
            dayOfWeek : Nat;
            startHour : Nat;
            endHour : Nat;
          }];
          dailyLimitMinutes : Nat;
        };
      };
      #filterChanged : {
        child : Principal;
        newConfig : {
          categories : [{
            name : Text;
            enabled : Bool;
          }];
          allowlist : [Text];
          blocklist : [Text];
        };
      };
      #accountDisabled : {
        account : Principal;
        reason : Text;
      };
      #phonePairingInitiated : {
        parentId : Principal;
        phoneNumber : Text;
      };
      #phonePairingCompleted : {
        parentId : Principal;
        childId : Principal;
      };
      #pendingRequestInitiated : {
        parent : Principal;
        child : Principal;
      };
      #pendingRequestCompleted : {
        parent : Principal;
        childName : Text;
        childPrincipal : Principal;
        successful : Bool;
      };
    };
  };

  type OldActor = {
    auditLogs : Map.Map<Principal, List.List<OldAuditLogEntry>>;
    userProfiles : Map.Map<Principal, {
      name : Text;
      role : {
        #parent;
        #child;
        #admin;
      };
      phoneNumber : ?Text;
    }>;
  };

  type NewUserProfile = {
    name : Text;
    role : {
      #parent;
      #child;
      #admin;
    };
    phoneNumber : ?Text;
    photo : ?Storage.ExternalBlob;
  };

  type NewAuditLogEntry = {
    action : {
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
    executor : Principal;
    timestamp : Int;
    details : {
      #pairingCreated : {
        parent : Principal;
        child : Principal;
      };
      #scheduleChanged : {
        child : Principal;
        newConfig : {
          allowedHours : [{
            dayOfWeek : Nat;
            startHour : Nat;
            endHour : Nat;
          }];
          dailyLimitMinutes : Nat;
        };
      };
      #filterChanged : {
        child : Principal;
        newConfig : {
          categories : [{
            name : Text;
            enabled : Bool;
          }];
          allowlist : [Text];
          blocklist : [Text];
        };
      };
      #accountDisabled : {
        account : Principal;
        reason : Text;
      };
      #phonePairingInitiated : {
        parentId : Principal;
        phoneNumber : Text;
      };
      #phonePairingCompleted : {
        parentId : Principal;
        childId : Principal;
      };
      #pendingRequestInitiated : {
        parent : Principal;
        child : Principal;
      };
      #pendingRequestCompleted : {
        parent : Principal;
        childName : Text;
        childPrincipal : Principal;
        successful : Bool;
      };
      #accountDeleted : {
        account : Principal;
        role : {
          #parent;
          #child;
          #admin;
        };
      };
    };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    auditLogs : Map.Map<Principal, List.List<NewAuditLogEntry>>;
  };

  // Function to migrate OldActor to NewActor type
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, {
      name : Text;
      role : {
        #parent;
        #child;
        #admin;
      };
      phoneNumber : ?Text;
    }, NewUserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with photo = null };
      }
    );
    let newAuditLogs = old.auditLogs.map<Principal, List.List<OldAuditLogEntry>, List.List<NewAuditLogEntry>>(
      func(_principal, oldList) {
        oldList.map<OldAuditLogEntry, NewAuditLogEntry>(
          func(oldEntry) {
            {
              oldEntry with
              action = switch (oldEntry.action) {
                case (#accountDisabled) { #accountDisabled };
                case (#filterChanged) { #filterChanged };
                case (#pairingCreated) { #pairingCreated };
                case (#pendingRequestCompleted) { #pendingRequestCompleted };
                case (#pendingRequestInitiated) { #pendingRequestInitiated };
                case (#phonePairingCompleted) { #phonePairingCompleted };
                case (#phonePairingInitiated) { #phonePairingInitiated };
                case (#scheduleChanged) { #scheduleChanged };
              };
            };
          }
        );
      }
    );
    {
      userProfiles = newUserProfiles;
      auditLogs = newAuditLogs;
    };
  };
};
