class Event{
    constructor(id, title, location, startTime, endTime, tags, description, restricted, imageType, creatorId) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.restricted = restricted;
        this.tags = tags;
        this.imageType = imageType;

        this.going = [];
        this.maybe = [];
        this.notGoing = [];
        this.posts = [];
        this.invitedUsers = [];

        this.administrators = [creatorId];
    }

    static toJSON(event){
        const eventString = JSON.stringify(event);
        const eventJSON = JSON.parse(eventString);
        eventJSON.startTime = event.startTime;
        eventJSON.endTime = event.endTime;
        return eventJSON;
    }

    static fromJSON(eventJSON){
        const event = Object.assign(new Event, eventJSON);
        event.startTime = eventJSON.startTime.toDate();
        event.endTime = eventJSON.endTime.toDate();
        return event;
    }

    InviteUsers(userIds){
        for (const userId of userIds){
            const index = this.invitedUsers.indexOf(userId);
            if (index == -1){
                this.invitedUsers.push(userId);
            }
        }
    }

    addPost(postId){
        if (!this.posts.includes(postId)){
            this.posts.push(postId);
        }
    }

    RemovePost(postId){
        const index = this.posts.indexOf(postId);
        if (index > -1) {
            this.posts.splice(index, 1); 
        }
    }

    IsGoing(userId){
        return this.going.includes(userId);
    }

    IsMaybe(userId){
        return this.maybe.includes(userId);
    }

    AddToGoing(userId){
        if (!this.going.includes(userId)) {
            this.going.push(userId);

            this.RemoveFromMaybe(userId);
            this.RemoveFromNotGoing(userId);
        }
    }

    RemoveFromGoing(userId){
        const index = this.going.indexOf(userId);
        if (index > -1) {
            this.going.splice(index, 1); 
        }
    }

    AddToMaybe(userId){
        if (!this.maybe.includes(userId)) {
            this.maybe.push(userId);

            this.RemoveFromGoing(userId);
            this.RemoveFromNotGoing(userId);
        }
    }

    RemoveFromMaybe(userId){
        const index = this.maybe.indexOf(userId);
        if (index > -1) {
            this.maybe.splice(index, 1); 
        }
    }

    AddToNotGoing(userId){
        if (!this.notGoing.includes(userId)) {
            this.notGoing.push(userId); 

            this.RemoveFromMaybe(userId);
            this.RemoveFromGoing(userId);
        }
    }

    RemoveFromNotGoing(userId){
        const index = this.notGoing.indexOf(userId);
        if (index > -1) {
            this.notGoing.splice(index, 1); 
        }
    }
}

exports.Event = Event;
module.exports = Event