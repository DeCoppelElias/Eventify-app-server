class Event{
    constructor(id, title, location, time, tags, description, restricted) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.time = time;
        this.description = description;
        this.restricted = restricted;
        this.tags = tags;

        this.going = [];
        this.maybe = [];
        this.notGoing = [];
    }

    AddToGoing(userId){
        this.going.push(userId);

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
        this.maybe.push(userId);

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
        this.notGoing.push(userId);

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