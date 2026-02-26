import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  // Types
  type User = {
    mobile : Text;
    name : Text;
    balance : Nat;
    vipLevel : Nat;
    referralCode : Text;
    referredBy : ?Text;
  };

  public type UserProfile = {
    name : Text;
    mobile : Text;
    vipLevel : Nat;
    referralCode : Text;
  };

  type Game = {
    userId : Text;
    gameName : Text;
    betAmount : Nat;
    outcome : Text;
    profitLoss : Int;
    timestamp : Time.Time;
  };

  type DepositRequest = {
    userId : Text;
    amount : Nat;
    utrNumber : Text;
    status : Text;
    timestamp : Time.Time;
  };

  public type DepositRequestInput = {
    userId : Text;
    amount : Nat;
    utrNumber : Text;
  };

  public type RegisterResult = {
    #success : User;
    #mobileAlreadyExists;
    #invalidReferralCode;
    #invalidMobileFormat;
    #badRequest;
    #internalError;
  };

  var state = {
    var users = Map.empty<Text, User>();
    var games = Map.empty<Nat, Game>();
    var deposits = Map.empty<Nat, DepositRequest>();
    var nextGameId = 0;
    var nextDepositId = 0;
    var paymentQR : ?Storage.ExternalBlob = null;
    var principalToMobile = Map.empty<Principal, Text>();
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  let inviteState = InviteLinksModule.initState();

  // Profile management - requires #user role
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  public shared ({ caller }) func registerUser(mobile : Text, name : Text, referredBy : Text) : async RegisterResult {
    if (mobile.size() != 10) {
      return #invalidMobileFormat;
    };

    for (c in mobile.chars()) {
      if (c < '0' or c > '9') {
        return #invalidMobileFormat;
      };
    };

    switch (state.principalToMobile.get(caller)) {
      case (?_existingMobile) {
        return #mobileAlreadyExists;
      };
      case (null) {};
    };

    switch (state.users.get(mobile)) {
      case (?_) { return #mobileAlreadyExists };
      case (null) {
        if (referredBy != "") {
          var referralValid = false;
          for ((_, u) in state.users.entries()) {
            if (u.referralCode == referredBy) {
              referralValid := true;
            };
          };
          if (not referralValid) {
            return #invalidReferralCode;
          };
        };

        let referralCode = "REF".concat(mobile);
        let welcomeBonus : Nat = 50;
        let newUser : User = {
          mobile;
          name;
          balance = welcomeBonus;
          vipLevel = 0;
          referralCode;
          referredBy = if (referredBy == "") { null } else { ?referredBy };
        };
        state.users.add(mobile, newUser);
        state.principalToMobile.add(caller, mobile);

        let profile : UserProfile = {
          name;
          mobile;
          vipLevel = 0;
          referralCode;
        };
        userProfiles.add(caller, profile);
        #success(newUser);
      };
    };
  };

  public shared ({ caller }) func loginUser(mobile : Text) : async User {
    switch (state.users.get(mobile)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        state.principalToMobile.add(caller, mobile);
        let profile : UserProfile = {
          name = user.name;
          mobile = user.mobile;
          vipLevel = user.vipLevel;
          referralCode = user.referralCode;
        };
        userProfiles.add(caller, profile);
        user;
      };
    };
  };

  // getUser: ownership or admin check
  public query ({ caller }) func getUser(mobile : Text) : async User {
    let callerMobile = state.principalToMobile.get(caller);
    let isOwner = switch (callerMobile) {
      case (?m) { m == mobile };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own user record");
    };
    switch (state.users.get(mobile)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func createDepositRequest(
    { userId; amount; utrNumber } : DepositRequestInput
  ) : async Nat {
    let callerMobile = state.principalToMobile.get(caller);
    let isOwner = switch (callerMobile) {
      case (?m) { m == userId };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create deposit requests for your own account");
    };

    if (utrNumber.size() != 12) {
      Runtime.trap("Invalid UTR: Must be 12 digits");
    };

    for (c in utrNumber.chars()) {
      if (c < '0' or c > '9') {
        Runtime.trap("Invalid UTR: Must contain only digits");
      };
    };

    switch (state.users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let totalAmount = amount + 50;
        let updatedUser = {
          user with balance = user.balance + totalAmount;
        };
        state.users.add(userId, updatedUser);
        return 0;
      };
    };
  };

  public query ({ caller }) func getPendingDeposits() : async [(Nat, DepositRequest)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view deposit requests");
    };
    state.deposits.entries().toArray().filter(func((_, deposit) : (Nat, DepositRequest)) : Bool {
      deposit.status == "pending"
    });
  };

  public shared ({ caller }) func approveDeposit(depositId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve deposits");
    };
    switch (state.deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?deposit) {
        switch (state.users.get(deposit.userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser = {
              user with balance = user.balance + deposit.amount;
            };
            state.users.add(user.mobile, updatedUser);
            let updatedDeposit = {
              deposit with status = "approved";
            };
            state.deposits.add(depositId, updatedDeposit);
          };
        };
      };
    };
  };

  public query ({ caller }) func getDepositStatus(depositId : Nat) : async Text {
    switch (state.deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?deposit) {
        let callerMobile = state.principalToMobile.get(caller);
        let isOwner = switch (callerMobile) {
          case (?m) { m == deposit.userId };
          case (null) { false };
        };
        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own deposit status");
        };
        deposit.status;
      };
    };
  };

  public shared ({ caller }) func resolveDepositRequest(depositId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can resolve deposit requests");
    };
    switch (state.deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?deposit) {
        switch (state.users.get(deposit.userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser = {
              user with balance = user.balance + deposit.amount;
            };
            state.users.add(user.mobile, updatedUser);
            let updatedDeposit = {
              deposit with status = "approved";
            };
            state.deposits.add(depositId, updatedDeposit);
          };
        };
      };
    };
  };

  public shared ({ caller }) func setPaymentQR(qr : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the QR code");
    };
    state.paymentQR := ?qr;
  };

  public query func getPaymentQR() : async ?Storage.ExternalBlob {
    state.paymentQR;
  };

  public shared ({ caller }) func recordGameRound(
    gameName : Text,
    betAmount : Nat,
    outcome : Text,
    profitLoss : Int,
  ) : async Nat {
    let callerMobile = switch (state.principalToMobile.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: User not registered") };
      case (?m) { m };
    };
    switch (state.users.get(callerMobile)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let newBalance : Nat = if (profitLoss >= 0) {
          user.balance + Int.abs(profitLoss);
        } else {
          let loss = Int.abs(profitLoss);
          if (loss > user.balance) { Runtime.trap("Insufficient balance") };
          user.balance - loss;
        };
        let updatedUser = { user with balance = newBalance };
        state.users.add(callerMobile, updatedUser);
      };
    };
    let gameId = state.nextGameId;
    let round : Game = {
      userId = callerMobile;
      gameName;
      betAmount;
      outcome;
      profitLoss;
      timestamp = Time.now();
    };
    state.games.add(gameId, round);
    state.nextGameId += 1;
    gameId;
  };

  // getGameHistory: ownership or admin check
  public query ({ caller }) func getGameHistory(mobile : Text) : async [Game] {
    let callerMobile = state.principalToMobile.get(caller);
    let isOwner = switch (callerMobile) {
      case (?m) { m == mobile };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own game history");
    };
    state.games.values().toArray().filter(func(g : Game) : Bool { g.userId == mobile });
  };

  // generateInviteCode: admin only
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  // submitRSVP: public, no auth needed
  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  // getAllRSVPs: admin only
  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  // getInviteCodes: admin only
  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};
