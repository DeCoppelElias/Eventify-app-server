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

        this.likedPosts = [];
        this.dislikedPosts = [];
    }

    AddLikedPost(postId){
        this.likedPosts.push(postId);
    }

    RemoveLikedPost(postId){
        const index = this.likedPosts.indexOf(postId);
        if (index > -1) {
            this.likedPosts.splice(index, 1); 
        }
    }

    AddDislikedPost(postId){
        this.dislikedPosts.push(postId);
    }

    RemoveDislikedPost(postId){
        const index = this.dislikedPosts.indexOf(postId);
        if (index > -1) {
            this.dislikedPosts.splice(index, 1); 
        }
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
        const index = this.going.indexOf(eventId);
        if (index == -1) {
            this.going.push(eventId);
        }

        if (this.maybe.includes(eventId)){
            this.RemoveFromMaybe(eventId);
        }
    }

    RemoveFromGoing(eventId){
        const index = this.going.indexOf(eventId);
        if (index == -1) {
            this.going.splice(index, 1); 
        }
    }

    SetMaybe(eventId){
        const index = this.maybe.indexOf(eventId);
        if (index == -1) {
            this.maybe.push(eventId);
        }

        if (this.going.includes(eventId)){
            this.RemoveFromGoing(eventId);
        }
    }

    RemoveFromMaybe(eventId){
        const index = this.maybe.indexOf(eventId);
        if (index == -1) {
            this.maybe.splice(index, 1); 
        }
    }
}

module.exports = User;