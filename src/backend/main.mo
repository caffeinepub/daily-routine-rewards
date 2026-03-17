import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Task = {
    id : Nat;
    title : Text;
    category : Text;
    points : Nat;
    createdBy : Text;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  type Completion = {
    taskId : Nat;
    date : Text;
    completedAt : Int;
  };

  type UserStats = {
    totalPoints : Nat;
    level : Nat;
    currentStreak : Nat;
    lastCompletionDate : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  type UserCredential = {
    username : Text;
    passwordHash : Text;
  };

  let tasks = Map.empty<Nat, Task>();
  let completions = Map.empty<Text, Map.Map<Text, Completion>>();
  let userStats = Map.empty<Text, UserStats>();
  let userProfiles = Map.empty<Text, UserProfile>();
  let userCredentials = Map.empty<Text, UserCredential>();
  let usernameIndex = Map.empty<Text, Text>(); // username -> principalId
  var taskIdCounter = 0;

  let defaultTasks = [
    {
      id = 0;
      title = "Morning Exercise";
      category = "morning";
      points = 10;
      createdBy = "";
    },
    {
      id = 0;
      title = "Drink Water";
      category = "anytime";
      points = 5;
      createdBy = "";
    },
    {
      id = 0;
      title = "Read for 20 mins";
      category = "afternoon";
      points = 15;
      createdBy = "";
    },
    {
      id = 0;
      title = "Evening Walk";
      category = "evening";
      points = 10;
      createdBy = "";
    },
    {
      id = 0;
      title = "Plan Tomorrow";
      category = "evening";
      points = 5;
      createdBy = "";
    },
  ];

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Credential Management ---

  public shared ({ caller }) func registerCredentials(username : Text, passwordHash : Text) : async { ok : Bool; error : ?Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return { ok = false; error = ?"Unauthorized" };
    };
    let principalId = caller.toText();
    // Check if username already taken
    switch (usernameIndex.get(username)) {
      case (?existingPrincipal) {
        if (existingPrincipal != principalId) {
          return { ok = false; error = ?"Username already taken" };
        };
      };
      case (null) {};
    };
    userCredentials.add(principalId, { username; passwordHash });
    usernameIndex.add(username, principalId);
    { ok = true; error = null };
  };

  public query ({ caller }) func getMyCredentials() : async ?{ username : Text } {
    switch (userCredentials.get(caller.toText())) {
      case (?cred) { ?{ username = cred.username } };
      case (null) { null };
    };
  };

  public query ({ caller }) func verifyCredentials(username : Text, passwordHash : Text) : async Bool {
    switch (usernameIndex.get(username)) {
      case (?principalId) {
        if (principalId != caller.toText()) { return false };
        switch (userCredentials.get(principalId)) {
          case (?cred) { cred.passwordHash == passwordHash };
          case (null) { false };
        };
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func checkUsernameAvailable(username : Text) : async Bool {
    switch (usernameIndex.get(username)) {
      case (?existingPrincipal) { existingPrincipal == caller.toText() };
      case (null) { true };
    };
  };

  // --- Profile ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller.toText());
  };

  public query ({ caller }) func getUserProfile(user : Text) : async ?UserProfile {
    if (caller.toText() != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller.toText(), profile);
  };

  public shared ({ caller }) func addTask(title : Text, category : Text, points : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    let newTaskId = taskIdCounter;
    let task : Task = {
      id = newTaskId;
      title;
      category;
      points;
      createdBy = caller.toText();
    };

    tasks.add(newTaskId, task);
    taskIdCounter += 1;
    newTaskId;
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks");
    };

    let userTasks = tasks.values().toArray();
    let filteredUserTasks = userTasks.filter(
      func(task) {
        task.createdBy == caller.toText() or task.createdBy == "";
      }
    );

    if (filteredUserTasks.isEmpty()) {
      defaultTasks.sort().map(
        func(task) {
          {
            id = task.id;
            title = task.title;
            category = task.category;
            points = task.points;
            createdBy = "";
          };
        }
      );
    } else {
      filteredUserTasks;
    };
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task not found");
      };
      case (?task) {
        if (task.createdBy != caller.toText()) {
          Runtime.trap("Unauthorized: Can only delete your own tasks");
        };
      };
    };

    tasks.remove(taskId);
  };

  public shared ({ caller }) func completeTask(taskId : Nat, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task not found");
      };
      case (?_) {};
    };

    let todayCompletions = switch (completions.get(caller.toText())) {
      case (null) {
        let newMap = Map.empty<Text, Completion>();
        completions.add(caller.toText(), newMap);
        newMap;
      };
      case (?map) { map };
    };

    switch (todayCompletions.get(date)) {
      case (null) {
        let newCompletion : Completion = {
          taskId;
          date;
          completedAt = Time.now();
        };
        todayCompletions.add(date, newCompletion);

        let userStat = switch (userStats.get(caller.toText())) {
          case (null) {
            {
              totalPoints = 0;
              level = 1;
              currentStreak = 0;
              lastCompletionDate = "";
            };
          };
          case (?stat) { stat };
        };

        let task = switch (tasks.get(taskId)) {
          case (null) {
            Runtime.trap("Task not found");
          };
          case (?task) { task };
        };

        let newTotalPoints = userStat.totalPoints + task.points;
        let newLevel = (newTotalPoints / 100) + 1;

        userStats.add(
          caller.toText(),
          {
            userStat with
            totalPoints = newTotalPoints;
            level = newLevel;
          },
        );
      };
      case (?_) {
        Runtime.trap("Task already completed for today");
      };
    };
  };

  public shared ({ caller }) func uncompleteTask(taskId : Nat, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can uncomplete tasks");
    };

    let todayCompletions = switch (completions.get(caller.toText())) {
      case (null) { Runtime.trap("No completions found") };
      case (?map) { map };
    };

    switch (todayCompletions.get(date)) {
      case (null) {
        Runtime.trap("Completion not found for today");
      };
      case (?completion) {
        if (completion.taskId != taskId) {
          Runtime.trap("Task not completed on this date");
        };

        todayCompletions.remove(date);

        let userStat = switch (userStats.get(caller.toText())) {
          case (null) {
            {
              totalPoints = 0;
              level = 1;
              currentStreak = 0;
              lastCompletionDate = "";
            };
          };
          case (?stat) { stat };
        };

        let task = switch (tasks.get(taskId)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) { task };
        };

        let newTotalPoints = if (userStat.totalPoints >= task.points) {
          userStat.totalPoints - task.points;
        } else {
          0;
        };
        let newLevel = if (newTotalPoints > 0) {
          (newTotalPoints / 100) + 1;
        } else {
          1;
        };

        userStats.add(
          caller.toText(),
          {
            userStat with
            totalPoints = newTotalPoints;
            level = newLevel;
          },
        );
      };
    };
  };

  public query ({ caller }) func getTodayCompletions(date : Text) : async [Completion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get completions");
    };

    switch (completions.get(caller.toText())) {
      case (null) {
        [];
      };
      case (?todayCompletions) {
        todayCompletions.values().toArray().filter(
          func(completion) {
            completion.date == date;
          }
        );
      };
    };
  };

  public query ({ caller }) func getUserStats() : async UserStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get stats");
    };

    switch (userStats.get(caller.toText())) {
      case (null) {
        {
          totalPoints = 0;
          level = 1;
          currentStreak = 0;
          lastCompletionDate = "";
        };
      };
      case (?stats) { stats };
    };
  };
};
