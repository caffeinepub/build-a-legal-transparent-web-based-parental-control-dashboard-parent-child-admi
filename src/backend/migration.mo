import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  type OldActor = { /* old state, ignored in migration */ };
  type NewActor = {
    allowlistedAdminPrincipals : Set.Set<Principal>;
  };

  public func run(_old : OldActor) : NewActor {
    { allowlistedAdminPrincipals = Set.empty<Principal>() };
  };
};
