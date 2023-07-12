class User{
    constructor(id, firstName, lastName, email, username, password) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
        this.password = password;

        this.invitedEvents = [];
        this.invitedGroups = [];
        this.repliedInvitedEvents = [];
        this.notRepliedInvitedEvents = [];
        this.repliedInvitedGroups = [];
        this.notRepliedInvitedGroups = [];

        this.subscribedGroups = [];
        this.yourGroups = [];

        this.yourEvents = [];
        this.going = [];
        this.maybe = [];
        this.notGoing = [];

        this.likedPosts = [];
        this.dislikedPosts = [];
    }

    ReplyToGroupInvite(groupId){
        const index = this.notRepliedInvitedGroups.indexOf(groupId);
        if (index > -1){
            this.notRepliedInvitedGroups.splice(index, 1);
            this.repliedInvitedGroups.push(groupId)
        }
    }

    BackToGroupInvite(groupId){
        const index = this.repliedInvitedGroups.indexOf(groupId);
        if (index > -1){
            this.repliedInvitedGroups.splice(index, 1);
            this.notRepliedInvitedGroups.push(groupId)
        }
    }

    SubscribeToGroup(groupId){
        if(!this.subscribedGroups.includes(groupId)){
            this.subscribedGroups.push(groupId);

            this.ReplyToGroupInvite(groupId);
        }
    }

    UnSubscribeFromGroup(groupId){
        const index = this.subscribedGroups.indexOf(groupId);
        if(index > -1){
            this.subscribedGroups.splice(index, 1);

            this.BackToGroupInvite(groupId);
        }
    }

    AddLikedPost(postId){
        if (!this.likedPosts.includes(postId)) {
            this.likedPosts.push(postId);
        }
    }

    RemoveLikedPost(postId){
        const index = this.likedPosts.indexOf(postId);
        if (index > -1) {
            this.likedPosts.splice(index, 1); 
        }
    }

    AddDislikedPost(postId){
        if (!this.dislikedPosts.includes(postId)) {
            this.dislikedPosts.push(postId);
        }
    }

    RemoveDislikedPost(postId){
        const index = this.dislikedPosts.indexOf(postId);
        if (index > -1) {
            this.dislikedPosts.splice(index, 1); 
        }
    }

    AddEvent(eventId){
        if (!this.yourEvents.includes(eventId)) {
            this.yourEvents.push(eventId);
        }
    }

    AddGroup(groupId){
        if (!this.yourGroups.includes(groupId)) {
            this.yourGroups.push(groupId);
        }
    }

    InviteToEvent(eventId){
        if (!this.invitedEvents.includes(eventId)) {
            this.invitedEvents.push(eventId);
            this.notRepliedInvitedEvents.push(eventId);
        }
    }

    UninviteToEvent(eventId){
        const index = this.invitedEvent.indexOf(eventId);
        if (index > -1) {
            this.invitedEvents.splice(index, 1);

            const index2 = this.notRepliedInvitedEvents.indexOf(eventId);
            if (index2 > -1) {
                this.notRepliedInvitedEvents.splice(index2, 1);
            }
        }
    }

    InviteToGroup(groupId){
        if (!this.invitedGroups.includes(groupId)) {
            this.invitedGroups.push(groupId);
            this.notRepliedInvitedGroups.push(groupId);
        }
    }

    UninviteToGroup(groupId){
        const index = this.invitedGroups.indexOf(groupId);
        if (index > -1) {
            this.invitedGroups.splice(index, 1); 

            const index2 = this.notRepliedInvitedGroups.indexOf(groupId);
            if (index2 > -1) {
                this.notRepliedInvitedGroups.splice(index2, 1);
            }
        }
    }

    ReplyToEventInvite(eventId){
        const index = this.notRepliedInvitedEvents.indexOf(eventId);
        if (index > -1){
            this.notRepliedInvitedEvents.splice(index, 1);
            this.repliedInvitedEvents.push(eventId)
        }
    }

    BackToEventInvite(eventId){
        const index = this.repliedInvitedEvents.indexOf(eventId);
        if (index > -1){
            this.repliedInvitedEvents.splice(index, 1);
            this.notRepliedInvitedEvents.push(eventId)
        }
    }

    SetGoing(eventId){
        if (!this.going.includes(eventId)) {
            this.going.push(eventId);

            this.RemoveFromMaybe(eventId);
            this.RemoveFromNotGoing(eventId);

            this.ReplyToEventInvite(eventId);
        }
    }

    RemoveFromGoing(eventId){
        const index = this.going.indexOf(eventId);
        if (index > -1) {
            this.going.splice(index, 1);

            this.BackToEventInvite(eventId);
        }
    }

    SetNotGoing(eventId){
        if (!this.notGoing.includes(eventId)) {
            this.notGoing.push(eventId);

            this.RemoveFromMaybe(eventId);
            this.RemoveFromGoing(eventId);

            this.ReplyToEventInvite(eventId);
        }
    }

    RemoveFromNotGoing(eventId){
        const index = this.notGoing.indexOf(eventId);
        if (index > -1) {
            this.notGoing.splice(index, 1); 

            this.BackToEventInvite(eventId);
        }
    }

    SetMaybe(eventId){
        if (!this.maybe.includes(eventId)) {
            this.maybe.push(eventId);

            this.RemoveFromGoing(eventId);
            this.RemoveFromNotGoing(eventId);

            this.ReplyToEventInvite(eventId);
        }
    }

    RemoveFromMaybe(eventId){
        const index = this.maybe.indexOf(eventId);
        if (index > -1) {
            this.maybe.splice(index, 1); 

            this.BackToEventInvite(eventId);
        }
    }
}

module.exports = User;