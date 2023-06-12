class User{
    constructor(id, firstName, lastName, email, username, password) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
        this.password = password;

        this.groups = [];
        this.invitedGroups = [];
        this.invitedEvents = [];

        this.yourGroups = [];
        this.yourEvents = [];

        this.going = [];
        this.maybe = [];
    }

    AddEvent(eventId){
        this.yourEvents.push(eventId);
    }

    AddGroup(groupId){
        this.yourGroups.push(groupId);
    }

    InviteToEvent(eventId){
        this.invitedEvents.push(eventId);
    }

    UninviteToEvent(eventId){
        const index = this.invitedEvent.indexOf(eventId);
        if (index > -1) {
            this.invitedEvents.splice(index, 1); 
        }
    }

    InviteToGroup(groupId){
        this.invitedGroups.push(groupId);
    }

    UninviteToGroup(groupId){
        const index = this.invitedGroups.indexOf(groupId);
        if (index > -1) {
            this.invitedGroups.splice(index, 1); 
        }
    }

    AddToGroup(groupId){
        this.groups.push(groupId);
    }

    RemoveFromGroup(groupId){
        const index = this.groups.indexOf(groupId);
        if (index > -1) {
            this.groups.splice(index, 1); 
        }
    }

    SetGoing(eventId){
        this.going.push(eventId);
    }

    SetMaybe(eventId){
        this.maybe.push(eventId);
    }
}

module.exports = User;