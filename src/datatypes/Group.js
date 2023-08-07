class Group{
    constructor(id, title, description, tags, restricted, imageType, creatorId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.tags = tags
        this.restricted = restricted;
        this.imageType = imageType;

        this.posts = [];
        this.events = [];
        this.invitedUsers = [];
        this.subscribedUsers = [];

        this.administrators = [creatorId];
    }

    static toJSON(group){
        const groupString = JSON.stringify(group);
        const groupJSON = JSON.parse(groupString);
        return groupJSON;
    }

    SubscribeUser(userId){
        if(!this.subscribedUsers.includes(userId)){
            this.subscribedUsers.push(userId);
        }
    }

    UnSubscribeUser(userId){
        const index = this.subscribedUsers.indexOf(userId);
        if(index > -1){
            this.subscribedUsers.splice(index, 1);
        }
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
        const index = this.posts.indexOf(postId);
        if (index == -1){
            this.posts.push(postId);
        }
    }

    RemovePost(postId){
        const index = this.posts.indexOf(postId);
        if (index > -1) {
            this.posts.splice(index, 1); 
        }
    }

    addEvent(eventId){
        const index = this.events.indexOf(eventId);
        if (index == -1){
            this.events.push(eventId);
        }
    }

    RemoveEvent(eventId){
        const index = this.events.indexOf(eventId);
        if (index > -1) {
            this.events.splice(index, 1); 
        }
    }
}

module.exports = Group