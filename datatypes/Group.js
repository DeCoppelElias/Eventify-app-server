class Group{
    constructor(id, title, description, tags, restricted) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.tags = tags
        this.restricted = restricted;

        this.events = []
    }

    AddEvent(eventId){
        this.events.push(eventId)
    }

    RemoveEvent(eventId){
        const index = this.events.indexOf(eventId);
        if (index > -1) {
            this.events.splice(index, 1); 
        }
    }
}

module.exports = Group