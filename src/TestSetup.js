const Event = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');
const Post = require('./datatypes/Post');
const admin = require('./config/firebase');
const FirestoreEventManager = require('./firestoreManagers/FirestoreEventManager');
const FirestoreGroupManager = require('./firestoreManagers/FirestoreGroupManager');
const FirestoreUserManager = require('./firestoreManagers/FirestoreUserManager');
const FirestorePostManager = require('./firestoreManagers/FirestorePostManager');

class TestSetup{
    constructor(){
        this.firestoreEventManager = new FirestoreEventManager();
        this.firestoreGroupManager = new FirestoreGroupManager();
        this.firestoreUserManager = new FirestoreUserManager();
        this.firestorePostManager = new FirestorePostManager();
        this.tomorrowStart = new Date()
        this.tomorrowStart.setDate(this.tomorrowStart.getDate() + 1)
        this.tomorrowStart.setHours(12)
        this.tomorrowEnd = new Date()
        this.tomorrowEnd.setDate(this.tomorrowEnd.getDate() + 1)
        this.tomorrowEnd.setHours(16)
    }

    async initialize(){
        const users = await this.CreateUsers();
        this.users = users;
        this.publicGroups = this.CreatePublicGroups();
        this.privateGroups = this.CreatePrivateGroups();
        this.publicEvents = this.CreatePublicEvents();
        this.privateEvents = this.CreatePrivateEvents();
        this.posts = this.CreatePosts();
        this.tags = ["outside", "inside", "party", "chill", "sport"];
        console.log("Initialized test setup values")
    }

    async CreateUsers(){
        let users = new Map();
    
        const listAllUsers = async(nextPageToken) => {
            // List batch of users, 1000 at a time.
            await admin.auth()
                .listUsers(1000, nextPageToken)
                .then((listUsersResult) => {
                    listUsersResult.users.forEach((userRecord) => {
                        console.log('registering user interally: ', userRecord.uid);
                        const user = new User(userRecord.uid, userRecord.displayName, userRecord.email);

                        users.set(userRecord.uid, user)

                        this.firestoreUserManager.addUser(user);
                });
                if (listUsersResult.pageToken) {
                  // List next batch of users.
                  listAllUsers(listUsersResult.pageToken);
                }
            })
            .catch((error) => {
                console.log('Error listing users:', error);
            });
        };
        // Start listing users from the beginning, 1000 at a time.
        await listAllUsers();
    
        return users;
    }
    
    CreatePublicEvents(){
        let events = new Map();
        const volleybalEvent = new Event(
            "public-test-volleyball-event", 
            "Volleybal practice", 
            "The local gym",
            this.tomorrowStart,
            this.tomorrowEnd,
            ["inside", "sport", "chill"],
            "We are going to practise all sorts of volleybal drills. Starting with easy drills for warmup and then building up to more difficult exercises.", 
            false,
            "png",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        events.set(volleybalEvent.id, volleybalEvent);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").addEvent(volleybalEvent.id);
        this.firestoreEventManager.addEvent("K56WS2LFleel4GIKwFNxZLoaLTN2", volleybalEvent, []);
    
        const footballEvent = new Event(
            "public-test-football-event", 
            "Casual Football", 
            "The local park",
            this.tomorrowStart,
            this.tomorrowEnd,
            ["outside", "sport"],
            "Playing some casual footbal with everyone that want to join us.", 
            false,
            "jpg",
            this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").id);
        events.set(footballEvent.id, footballEvent);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").addEvent(footballEvent.id);
        this.firestoreEventManager.addEvent("V5RVupJJsohFVNAOBJneO9Md85y1", footballEvent, []);
    
        const baseballEvent = new Event(
            "public-test-baseball-event", 
            "Baseball games", 
            "The local park",
            this.tomorrowStart,
            this.tomorrowEnd,
            ["outside", "sport"],
            "Going to play some baseball with my friends, join if you're interested!!", 
            false,
            "jpg",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        events.set(baseballEvent.id, baseballEvent);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").addEvent(baseballEvent.id);
        this.firestoreEventManager.addEvent("K56WS2LFleel4GIKwFNxZLoaLTN2", baseballEvent, []);
    
        return events;
    }

    CreatePrivateEvents(){
        let events = new Map();
        const cantusEvent = new Event(
            "private-test-cantus-event", 
            "3de letter cantus", 
            "keuken zuid",
            this.tomorrowStart,
            this.tomorrowEnd,
            ["inside", "party"],
            "3de letter cantus, lets goooooooooooo.", 
            true,
            "jpg",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        events.set(cantusEvent.id, cantusEvent);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").addEvent(cantusEvent.id);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").InviteToEvent(cantusEvent.id);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").InviteToEvent(cantusEvent.id);
        this.firestoreEventManager.addEvent("K56WS2LFleel4GIKwFNxZLoaLTN2", cantusEvent, ["private-test-lerkeveldUnderground-group"]);
    
        const lanParty = new Event(
            "private-test-lanParty-event", 
            "Lan Party", 
            "At my house",
            this.tomorrowStart,
            this.tomorrowEnd,
            ["inside", "chill"],
            "Lan party at my house! Bring chips!", 
            true,
            "jpg",
            this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").id);
        events.set(lanParty.id, lanParty);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").addEvent(lanParty.id);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").InviteToEvent(lanParty.id);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").InviteToEvent(lanParty.id);
        this.firestoreEventManager.addEvent("V5RVupJJsohFVNAOBJneO9Md85y1", lanParty, []);
    
        return events;
    }
    
    CreatePublicGroups(){
        let groups = new Map();
    
        const lerkeveldGroup = new Group(
            "public-test-lerkeveld-group",
            "Lerkeveld",
            "This is the lerkeveld group, lerkeveld events will be posted here.",
            ["party", "sport", "chill"],
            false,
            "png",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        groups.set(lerkeveldGroup.id, lerkeveldGroup);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").addGroup(lerkeveldGroup.id);
        this.firestoreGroupManager.addGroup("K56WS2LFleel4GIKwFNxZLoaLTN2",lerkeveldGroup);
    
        const artGroup = new Group(
            "public-test-drawing-group",
            "The Official Art Group",
            "In this group, we like to share self made art pieces.",
            ["chill"],
            false,
            "jpg",
            this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").id);
        groups.set(artGroup.id, artGroup);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").addGroup(artGroup.id);
        this.firestoreGroupManager.addGroup("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2",artGroup);
    
        const boardgameGroup = new Group(
            "public-test-boardgame-group",
            "Board games",
            "This group is for creating board game events!",
            ["chill"],
            false,
            "jpg",
            this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").id); 
        groups.set(boardgameGroup.id, boardgameGroup);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").addGroup(boardgameGroup.id);
        this.firestoreGroupManager.addGroup("V5RVupJJsohFVNAOBJneO9Md85y1", boardgameGroup);
    
        return groups;
    }

    CreatePrivateGroups(){
        let groups = new Map();
    
        const lerkeveldUnderground = new Group(
            "private-test-lerkeveldUnderground-group",
            "Lerkeveld Underground",
            "This is the lerkeveld underground group, only current members of lerkeveld are part of this group",
            ["party", "sport", "chill"],
            true,
            "png",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        groups.set(lerkeveldUnderground.id, lerkeveldUnderground);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").addGroup(lerkeveldUnderground.id);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").InviteToGroup(lerkeveldUnderground.id);
        lerkeveldUnderground.InviteUsers([this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").id]);
        lerkeveldUnderground.addEvent("private-test-cantus-event")
        this.firestoreGroupManager.addGroup("K56WS2LFleel4GIKwFNxZLoaLTN2", lerkeveldUnderground);
    
        return groups;
    }

    CreatePosts(){
        const posts = new Map();

        const volleybalPost1 = new Post(
            "test-volleybal1-post",
            "Don't miss the first training!!",
            "Hey guys, this is a friendly reminder to come to the first training session",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(volleybalPost1.id, volleybalPost1);
        this.publicEvents.get("public-test-volleyball-event").addPost(volleybalPost1.id);
        this.firestorePostManager.addPost(volleybalPost1);

        const volleybalPost2 = new Post(
            "test-volleybal2-post",
            "Training location",
            "I was wondering where the first training session would be, which local gym exactly?",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(volleybalPost2.id, volleybalPost2);
        this.publicEvents.get("public-test-volleyball-event").addPost(volleybalPost2.id);
        this.firestorePostManager.addPost(volleybalPost2);

        const volleybalPost3 = new Post(
            "test-volleybal3-post",
            "HYPEEEEEEE",
            "IM SO HYPED TO PLAY VOLLEYBAL WITH YOU GUYS OMG OMG",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(volleybalPost3.id, volleybalPost3);
        this.publicEvents.get("public-test-volleyball-event").addPost(volleybalPost3.id);
        this.firestorePostManager.addPost(volleybalPost3);

        const lerkeveldPost1 = new Post(
            "test-lerkeveld1-post",
            "LETS GOOO",
            "hypee",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(lerkeveldPost1.id, lerkeveldPost1);
        this.publicGroups.get("public-test-lerkeveld-group").addPost(lerkeveldPost1.id);
        this.firestorePostManager.addPost(lerkeveldPost1);

        return posts;
    }
}

module.exports = TestSetup;