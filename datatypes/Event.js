class Event{
    constructor(id, title, location, time, tags, description, restricted, imageType) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.time = time;
        this.description = description;
        this.restricted = restricted;
        this.tags = tags;
        this.imageType = imageType;

        this.going = [];
        this.maybe = [];
        this.notGoing = [];
        this.posts = [];
    }

    AddPost(postId){
        this.posts.push(postId);
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
        const index = this.going.indexOf(userId);
        if (index == -1) {
            this.going.push(userId);
        }

        if (this.maybe.includes(userId)){
            this.RemoveFromMaybe(userId);
        }
        if (this.notGoing.includes(userId)){
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
        const index = this.maybe.indexOf(userId);
        if (index == -1) {
            this.maybe.push(userId);
        }

        if (this.going.includes(userId)){
            this.RemoveFromGoing(userId);
        }
        if (this.notGoing.includes(userId)){
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
        const index = this.notGoing.indexOf(userId);
        if (index == -1) {
            this.notGoing.push(userId); 
        }

        if (this.maybe.includes(userId)){
            this.RemoveFromMaybe(userId);
        }
        if (this.going.includes(userId)){
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

module.exports = Event;