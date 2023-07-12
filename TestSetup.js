const { Event } = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');
const Post = require('./datatypes/Post')

class TestSetup{
    constructor(){
        this.users = this.CreateUsers();
        this.publicGroups = this.CreatePublicGroups();
        this.privateGroups = this.CreatePrivateGroups();
        this.publicEvents = this.CreatePublicEvents();
        this.privateEvents = this.CreatePrivateEvents();
        this.posts = this.CreatePosts();
        this.tags = ["outside", "inside", "party", "chill", "sport"]
    }

    CreateUsers(){
        let users = new Map();
    
        const EliasUser = new User(
            "test-user-Elias",
            "Elias", 
            "De Coppel", 
            "elias@gmail.com", 
            "Elias", 
            "Elias");
        users.set(EliasUser.id, EliasUser);
    
        const JoranUser = new User(
            "test-user-Joran",
            "Joran", 
            "De Coppel", 
            "joran@gmail.com", 
            "Joran", 
            "Joran");
        users.set(JoranUser.id, JoranUser);
        
        const SophieUser = new User(
            "test-user-Sophie",
            "Sophie", 
            "De Coppel", 
            "sophie@gmail.com", 
            "Sophie", 
            "Sophie");
        users.set(SophieUser.id, SophieUser);
    
        return users;
    }
    
    CreatePublicEvents(){
        let events = new Map();
        const volleybalEvent = new Event(
            "test-volleyball-event", 
            "Volleybal practice", 
            "The local gym",
            new Date('December 20, 2023 16:15:00'),
            ["inside", "sport", "chill"],
            "We are going to practise all sorts of volleybal drills. Starting with easy drills for warmup and then building up to more difficult exercises.", 
            false,
            "jpg",
            this.users.get("test-user-Elias").id);
        events.set(volleybalEvent.id, volleybalEvent);
        this.users.get("test-user-Elias").AddEvent(volleybalEvent.id);
    
        const footballEvent = new Event(
            "test-football-event", 
            "Casual Football", 
            "The local park",
            new Date('January 10, 2023 12:15:00'),
            ["outside", "sport"],
            "Playing some casual footbal with everyone that want to join us.", 
            false,
            "jpg",
            this.users.get("test-user-Joran").id);
        events.set(footballEvent.id, footballEvent);
        this.users.get("test-user-Joran").AddEvent(footballEvent.id);
    
        const baseballEvent = new Event(
            "test-baseball-event", 
            "Baseball games", 
            "The local park",
            new Date('Juli 23, 2023 14:30:00'),
            ["outside", "sport"],
            "Going to play some baseball with my friends, join if you're interested!!", 
            false,
            "jpg",
            this.users.get("test-user-Elias").id);
        events.set(baseballEvent.id, baseballEvent);
        this.users.get("test-user-Elias").AddEvent(baseballEvent.id);
    
        return events;
    }

    CreatePrivateEvents(){
        let events = new Map();
        const cantusEvent = new Event(
            "test-cantus-event", 
            "3de letter cantus", 
            "keuken zuid",
            new Date('june 30, 2023 20:00:00'),
            ["inside", "party"],
            "3de letter cantus, lets goooooooooooo.", 
            false,
            "jpg",
            this.users.get("test-user-Elias").id);
        events.set(cantusEvent.id, cantusEvent);
        this.users.get("test-user-Elias").AddEvent(cantusEvent.id);
        this.users.get("test-user-Joran").InviteToEvent(cantusEvent.id);
        this.users.get("test-user-Sophie").InviteToEvent(cantusEvent.id);
    
        const lanParty = new Event(
            "test-lanParty-event", 
            "Lan Party", 
            "At my house",
            new Date('May 28, 2023 18:00:00'),
            ["inside", "chill"],
            "Lan party at my house! Bring chips!", 
            false,
            "jpg",
            this.users.get("test-user-Joran").id);
        events.set(lanParty.id, lanParty);
        this.users.get("test-user-Joran").AddEvent(lanParty.id);
        this.users.get("test-user-Elias").InviteToEvent(lanParty.id);
        this.users.get("test-user-Sophie").InviteToEvent(lanParty.id);
        
        for (let i=0; i<10; i++){
            const boitEvent = new Event(
                "test-boit-event" + String(i), 
                "dikke zwoiren bosh", 
                "keuken zuid",
                new Date('june 30, 2023 20:00:00'),
                ["inside", "party"],
                "...............", 
                false,
                "jpg",
                this.users.get("test-user-Elias").id);
            events.set(boitEvent.id, boitEvent);
            this.users.get("test-user-Elias").AddEvent(cantusEvent.id);
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
            this.users.get("test-user-Elias").id);
        groups.set(lerkeveldGroup.id, lerkeveldGroup);
        this.users.get("test-user-Elias").AddGroup(lerkeveldGroup.id);
    
        const artGroup = new Group(
            "test-drawing-group",
            "The Official Art Group",
            "In this group, we like to share self made art pieces.",
            ["chill"],
            false,
            "jpg",
            this.users.get("test-user-Sophie").id);
        groups.set(artGroup.id, artGroup);
        this.users.get("test-user-Sophie").AddGroup(artGroup.id);
    
        const boardgameGroup = new Group(
            "test-boardgame-group",
            "Board games",
            "This group is for creating board game events!",
            ["chill"],
            false,
            "jpg",
            this.users.get("test-user-Joran").id); 
        groups.set(boardgameGroup.id, boardgameGroup);
        this.users.get("test-user-Joran").AddGroup(boardgameGroup.id);
    
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
            this.users.get("test-user-Elias").id);
        groups.set(lerkeveldUnderground.id, lerkeveldUnderground);
        this.users.get("test-user-Elias").AddGroup(lerkeveldUnderground.id);
        this.users.get("test-user-Sophie").InviteToGroup(lerkeveldUnderground.id);
        lerkeveldUnderground.InviteUsers([this.users.get("test-user-Sophie").id])
    
        return groups;
    }

    CreatePosts(){
        const posts = new Map();

        const volleybalPost1 = new Post(
            "test-volleybal1-post",
            "Don't miss the first training!!",
            "Hey guys, this is a friendly reminder to come to the first training session",
            "test-user-Elias"
        );
        posts.set(volleybalPost1.id, volleybalPost1);
        this.publicEvents.get("test-volleyball-event").AddPost(volleybalPost1.id);

        const volleybalPost2 = new Post(
            "test-volleybal2-post",
            "Training location",
            "I was wondering where the first training session would be, which local gym exactly?",
            "test-user-Elias"
        );
        posts.set(volleybalPost2.id, volleybalPost2);
        this.publicEvents.get("test-volleyball-event").AddPost(volleybalPost2.id);

        const volleybalPost3 = new Post(
            "test-volleybal3-post",
            "HYPEEEEEEE",
            "IM SO HYPED TO PLAY VOLLEYBAL WITH YOU GUYS OMG OMG",
            "test-user-Elias"
        );
        posts.set(volleybalPost3.id, volleybalPost3);
        this.publicEvents.get("test-volleyball-event").AddPost(volleybalPost3.id);

        const lerkeveldPost1 = new Post(
            "test-lerkeveld1-post",
            "LETS GOOO",
            "hypee",
            "test-user-Elias"
        );
        posts.set(lerkeveldPost1.id, lerkeveldPost1);
        this.publicGroups.get("test-lerkeveld-group").AddPost(lerkeveldPost1.id);

        return posts;
    }
}

module.exports = TestSetup;