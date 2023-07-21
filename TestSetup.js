const Event = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');
const Post = require('./datatypes/Post');
const admin = require('./config/firebase');

class TestSetup{
    constructor(){
        
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
                        const user = new User(userRecord.uid, userRecord.displayName, userRecord.email)
                        users.set(userRecord.uid, user)
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
            "test-volleyball-event", 
            "Volleybal practice", 
            "The local gym",
            new Date(2023, 6, 20, 16, 30),
            new Date(2023, 6, 20, 19, 30),
            ["inside", "sport", "chill"],
            "We are going to practise all sorts of volleybal drills. Starting with easy drills for warmup and then building up to more difficult exercises.", 
            false,
            "jpg",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        events.set(volleybalEvent.id, volleybalEvent);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").AddEvent(volleybalEvent.id);
    
        const footballEvent = new Event(
            "test-football-event", 
            "Casual Football", 
            "The local park",
            new Date(2023, 6, 25, 16, 30),
            new Date(2023, 6, 25, 19, 30),
            ["outside", "sport"],
            "Playing some casual footbal with everyone that want to join us.", 
            false,
            "jpg",
            this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").id);
        events.set(footballEvent.id, footballEvent);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").AddEvent(footballEvent.id);
    
        const baseballEvent = new Event(
            "test-baseball-event", 
            "Baseball games", 
            "The local park",
            new Date(2023, 6, 30, 16, 30),
            new Date(2023, 6, 30, 19, 30),
            ["outside", "sport"],
            "Going to play some baseball with my friends, join if you're interested!!", 
            false,
            "jpg",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        events.set(baseballEvent.id, baseballEvent);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").AddEvent(baseballEvent.id);
    
        return events;
    }

    CreatePrivateEvents(){
        let events = new Map();
        const cantusEvent = new Event(
            "test-cantus-event", 
            "3de letter cantus", 
            "keuken zuid",
            new Date(2023, 6, 20, 16, 30),
            new Date(2023, 6, 20, 19, 30),
            ["inside", "party"],
            "3de letter cantus, lets goooooooooooo.", 
            false,
            "jpg",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        events.set(cantusEvent.id, cantusEvent);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").AddEvent(cantusEvent.id);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").InviteToEvent(cantusEvent.id);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").InviteToEvent(cantusEvent.id);
    
        const lanParty = new Event(
            "test-lanParty-event", 
            "Lan Party", 
            "At my house",
            new Date(2023, 6, 20, 16, 30),
            new Date(2023, 6, 20, 19, 30),
            ["inside", "chill"],
            "Lan party at my house! Bring chips!", 
            false,
            "jpg",
            this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").id);
        events.set(lanParty.id, lanParty);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").AddEvent(lanParty.id);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").InviteToEvent(lanParty.id);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").InviteToEvent(lanParty.id);
        
        for (let i=0; i<10; i++){
            const boitEvent = new Event(
                "test-boit-event" + String(i), 
                "dikke zwoiren bosh", 
                "keuken zuid",
                new Date(2023, 6, 21, 16, 30),
                new Date(2023, 6, 21, 19, 30),
                ["inside", "party"],
                "...............", 
                false,
                "jpg",
                this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
            events.set(boitEvent.id, boitEvent);
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").AddEvent(cantusEvent.id);
            this.publicGroups.get('test-lerkeveld-group').AddEvent(boitEvent.id);
        }
    
        return events;
    }
    
    CreatePublicGroups(){
        let groups = new Map();
    
        const lerkeveldGroup = new Group(
            "test-lerkeveld-group",
            "Lerkeveld",
            "This is the lerkeveld group, lerkeveld events will be posted here.",
            ["party", "sport", "chill"],
            false,
            "png",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        groups.set(lerkeveldGroup.id, lerkeveldGroup);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").AddGroup(lerkeveldGroup.id);
    
        const artGroup = new Group(
            "test-drawing-group",
            "The Official Art Group",
            "In this group, we like to share self made art pieces.",
            ["chill"],
            false,
            "jpg",
            this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").id);
        groups.set(artGroup.id, artGroup);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").AddGroup(artGroup.id);
    
        const boardgameGroup = new Group(
            "test-boardgame-group",
            "Board games",
            "This group is for creating board game events!",
            ["chill"],
            false,
            "jpg",
            this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").id); 
        groups.set(boardgameGroup.id, boardgameGroup);
        this.users.get("V5RVupJJsohFVNAOBJneO9Md85y1").AddGroup(boardgameGroup.id);
    
        return groups;
    }

    CreatePrivateGroups(){
        let groups = new Map();
    
        const lerkeveldUnderground = new Group(
            "test-lerkeveldUnderground-group",
            "Lerkeveld Underground",
            "This is the lerkeveld underground group, only current members of lerkeveld are part of this group",
            ["party", "sport", "chill"],
            true,
            "png",
            this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").id);
        groups.set(lerkeveldUnderground.id, lerkeveldUnderground);
        this.users.get("K56WS2LFleel4GIKwFNxZLoaLTN2").AddGroup(lerkeveldUnderground.id);
        this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").InviteToGroup(lerkeveldUnderground.id);
        lerkeveldUnderground.InviteUsers([this.users.get("3tfrddTk1JUAQ2X9Rs6Vs98l5ZN2").id])
    
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
        this.publicEvents.get("test-volleyball-event").AddPost(volleybalPost1.id);

        const volleybalPost2 = new Post(
            "test-volleybal2-post",
            "Training location",
            "I was wondering where the first training session would be, which local gym exactly?",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(volleybalPost2.id, volleybalPost2);
        this.publicEvents.get("test-volleyball-event").AddPost(volleybalPost2.id);

        const volleybalPost3 = new Post(
            "test-volleybal3-post",
            "HYPEEEEEEE",
            "IM SO HYPED TO PLAY VOLLEYBAL WITH YOU GUYS OMG OMG",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(volleybalPost3.id, volleybalPost3);
        this.publicEvents.get("test-volleyball-event").AddPost(volleybalPost3.id);

        const lerkeveldPost1 = new Post(
            "test-lerkeveld1-post",
            "LETS GOOO",
            "hypee",
            "K56WS2LFleel4GIKwFNxZLoaLTN2"
        );
        posts.set(lerkeveldPost1.id, lerkeveldPost1);
        this.publicGroups.get("test-lerkeveld-group").AddPost(lerkeveldPost1.id);

        return posts;
    }
}

module.exports = TestSetup;