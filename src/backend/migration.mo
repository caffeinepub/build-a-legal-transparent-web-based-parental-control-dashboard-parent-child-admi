import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  // Only persistent state that needs to be migrated
  type OldMainActor = {
    allowlistedAdminPrincipals : Set.Set<Principal>;
    adminPassword : Text;
  };
  type NewMainActor = OldMainActor;

  // Only migrate if old password matches the old value
  public func run(old : OldMainActor) : NewMainActor {
    if (old.adminPassword == "Liderdoprojetox1;") {
      { old with adminPassword = "Liderdoprojetox1" };
    } else {
      old;
    };
  };
};
