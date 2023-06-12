const Event = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');

class TestSetup{
    constructor(){
        this.users = this.CreateUsers();
        this.publicEvents = this.CreatePublicEvents();
        this.privateEvents = this.CreatePrivateEvents();
        this.publicGroups = this.CreatePublicGroups();
        this.privateGroups = this.CreatePrivateGroups();
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
            ["indoor", "volleybal", "sport"],
            "We are going to practise all sorts of volleybal drills. Starting with easy drills for warmup and then building up to more difficult exercises.", 
            false);
        events.set(volleybalEvent.id, volleybalEvent);
        this.users.get("test-user-Elias").AddEvent(volleybalEvent.id);
    
        const footballEvent = new Event(
            "test-football-event", 
            "Casual Football", 
            "The local park",
            new Date('January 10, 2023 12:15:00'),
            ["outdoor", "football", "sport"],
            "Playing some casual footbal with everyone that want to join us.", 
            false);
        events.set(footballEvent.id, footballEvent);
        this.users.get("test-user-Joran").AddEvent(footballEvent.id);
    
        const baseballEvent = new Event(
            "test-baseball-event", 
            "Baseball games", 
            "The local park",
            new Date('Juli 23, 2023 14:30:00'),
            ["outdoor", "baseball", "sport"],
            "Going to play some baseball with my friends, join if you're interested!!", 
            false);
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
            ["indoor", "party", "singing"],
            "3de letter cantus, lets goooooooooooo.", 
            false);
        events.set(cantusEvent.id, cantusEvent);
        this.users.get("test-user-Elias").AddEvent(cantusEvent.id);
        this.users.get("test-user-Joran").InviteToEvent(cantusEvent.id);
        this.users.get("test-user-Sophie").InviteToEvent(cantusEvent.id);
    
        const lanParty = new Event(
            "test-lanParty-event", 
            "Lan Party", 
            "At my house",
            new Date('May 28, 2023 18:00:00'),
            ["indoor", "gaming"],
            "Lan party at my house! Bring chips!", 
            false);
        events.set(lanParty.id, lanParty);
        this.users.get("test-user-Joran").AddEvent(lanParty.id);
        this.users.get("test-user-Elias").InviteToEvent(lanParty.id);
        this.users.get("test-user-Sophie").InviteToEvent(lanParty.id);
    
        return events;
    }
    
    CreatePublicGroups(){
        let groups = new Map();
    
        const lerkeveldGroup = new Group(
            "test-lerkeveld-group",
            "Lerkeveld",
            "This is the lerkeveld group, lerkeveld events will be posted here.",
            ["parties", "sports", "culture"],
            false);
        groups.set(lerkeveldGroup.id, lerkeveldGroup);
        this.users.get("test-user-Elias").AddGroup(lerkeveldGroup.id);
    
        const artGroup = new Group(
            "test-drawing-group",
            "The Official Art Group",
            "In this group, we like to share self made art pieces.",
            ["art", "drawing"],
            false);
        groups.set(artGroup.id, artGroup);
        this.users.get("test-user-Sophie").AddGroup(artGroup.id);
    
        const boardgameGroup = new Group(
            "test-boardgame-group",
            "Board games",
            "This group is for creating board game events!",
            ["board games"],
            false); 
        groups.set(boardgameGroup.id, boardgameGroup);
        this.users.get("test-user-Joran").AddGroup(boardgameGroup.id);
    
        return groups;
    }

    CreatePrivateGroups(){
        let groups = new Map();
    
        const lerkeveldUnderground = new Group(
            "test-lerkeveldUnderground-group",
            "Lerkeveld",
            "This is the lerkeveld underground group, only current members of lerkeveld are part of this group",
            ["parties", "sports", "culture"],
            false);
        groups.set(lerkeveldUnderground.id, lerkeveldUnderground);
        this.users.get("test-user-Elias").AddGroup(lerkeveldUnderground.id);
        this.users.get("test-user-Sophie").InviteToGroup(lerkeveldUnderground.id);
    
        return groups;
    }
}

module.exports = TestSetup;