const admin = require('../config/firebase');
const User = require('../datatypes/User');
const Event = require('../datatypes/Event');
const Group = require('../datatypes/Group');
const FirestoreUserManager = require('./FirestoreUserManager');
const FirestoreGroupManager = require('./FirestoreGroupManager');

class FirestoreEventManager{
    constructor(){
        this.db = admin.firestore();

        this.userCollection = this.db.collection('users');

        this.eventsCollection = this.db.collection('events');
        this.publicEventsCollection = this.eventsCollection.doc("publicEvents").collection('publicEvents');
        this.privateEventsCollection = this.eventsCollection.doc("privateEvents").collection('privateEvents');

        this.groupsCollection = this.db.collection('groups');
        this.publicGroupsCollection = this.groupsCollection.doc("publicGroups").collection('publicGroups');
        this.privateGroupsCollection = this.groupsCollection.doc("privateGroups").collection('privateGroups');
    }

    addEvent(userId, event, createForGroups){
        const eventJSON = Event.toJSON(event);
        let eventDocRef = undefined;
        if(event.restricted){
            eventDocRef = this.privateEventsCollection.doc(event.id);
        }
        else{
            eventDocRef = this.publicEventsCollection.doc(event.id);
        }
        const userDocRef = this.userCollection.doc(userId);

        this.db.runTransaction(async (transaction) => {
            transaction.set(eventDocRef, eventJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.addEvent(event.id);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);

            for (const groupId of createForGroups){
                let groupCollectionRef = undefined;
                if(groupId.split("-")[0] == "private"){
                    groupCollectionRef = this.privateGroupsCollection;
                }
                else if (groupId.split("-")[0] == "public"){
                    groupCollectionRef = this.publicGroupsCollection;
                }
                const groupDocRef = groupCollectionRef.doc(groupId);

                const group = await FirestoreGroupManager.getGroup(groupId);
                group.addEvent(event.id);
                const groupJSON = Group.toJSON(group);
                transaction.set(groupDocRef, groupJSON);
            }
        });
    }

    async getEvent(eventId){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return undefined}

        const docRef = collectionRef.doc(eventId);
        let event = undefined;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                const eventJSON = doc.data();
                event = Object.assign(new Event, eventJSON);
                event.startTime = eventJSON.startTime.toDate();
                event.endTime = eventJSON.endTime.toDate();
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        return event;
    }

    async getPublicEvents(){
        const events = [];
        const collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        .where('endTime', '>=' , new Date());
        await collectionRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const eventJSON = doc.data();
                const event = Event.fromJSON(eventJSON);
                events.push(event);
            });
        });

        return events;
    }

    async getYourEvents(userId){
        const events = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const yourEventIds = user.yourEvents;
                for(const eventId of yourEventIds){
                    const event = await this.getEvent(eventId);
                    events.push(event);
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getYourEventsTimeRange(userId, startDate, endDate){
        const events = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const yourEventIds = user.yourEvents;
                for(const eventId of yourEventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= startDate && event.endTime <= endDate){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getGoingEvents(userId){
        const events = [];
        const now = new Date();
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const eventIds = user.going;
                for(const eventId of eventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= now){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getGoingEventsTimeRange(userId, startDate, endDate){
        const events = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const eventIds = user.going;
                for(const eventId of eventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= startDate && event.endTime <= endDate){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getMaybeEvents(userId){
        const events = [];
        const now = new Date();
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const eventIds = user.maybe;
                for(const eventId of eventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= now){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getMaybeEventsTimeRange(userId, startDate, endDate){
        const events = [];
        const now = new Date();
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const eventIds = user.maybe;
                for(const eventId of eventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= startDate && event.endTime <= endDate){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getNotGoingEvents(userId){
        const events = [];
        const now = new Date();
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const eventIds = user.notGoing;
                for(const eventId of eventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= now){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    async getNotRepliedInvitedEvents(userId){
        const events = [];
        const now = new Date();
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const eventIds = user.notRepliedInvitedEvents;
                for(const eventId of eventIds){
                    const event = await this.getEvent(eventId);
                    if(event.endTime >= now){
                        events.push(event);
                    }
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return events;
    }

    

    addGoingUser(userId, eventId){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        const userDocRef = this.userCollection.doc(userId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.AddToGoing(userId);
                }
            });

            let user = undefined;
            await transaction.get(userDocRef).then(doc => {
                if (doc.exists) {
                    const userJSON = doc.data();
                    user = Object.assign(new User, userJSON);
                    user.SetGoing(eventId);
                }
            });

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            const newUserString = JSON.stringify(user);
            const newUserJSON = JSON.parse(newUserString);
            transaction.set(userDocRef, newUserJSON);
        });
    }

    removeGoingUser(userId, eventId){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        const userDocRef = this.userCollection.doc(userId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.RemoveFromGoing(userId);
                }
            });

            let user = undefined;
            await transaction.get(userDocRef).then(doc => {
                if (doc.exists) {
                    const userJSON = doc.data();
                    user = Object.assign(new User, userJSON);
                    user.RemoveFromGoing(eventId);
                }
            });

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            const newUserString = JSON.stringify(user);
            const newUserJSON = JSON.parse(newUserString);
            transaction.set(userDocRef, newUserJSON);
        });
    }

    addMaybeUser(userId, eventId){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        const userDocRef = this.userCollection.doc(userId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.AddToMaybe(userId);
                }
            });

            let user = undefined;
            await transaction.get(userDocRef).then(doc => {
                if (doc.exists) {
                    const userJSON = doc.data();
                    user = Object.assign(new User, userJSON);
                    user.SetMaybe(eventId);
                }
            });

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            const newUserString = JSON.stringify(user);
            const newUserJSON = JSON.parse(newUserString);
            transaction.set(userDocRef, newUserJSON);
        });
    }

    removeMaybeUser(userId, eventId){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        const userDocRef = this.userCollection.doc(userId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.RemoveFromMaybe(userId);
                }
            });

            let user = undefined;
            await transaction.get(userDocRef).then(doc => {
                if (doc.exists) {
                    const userJSON = doc.data();
                    user = Object.assign(new User, userJSON);
                    user.RemoveFromMaybe(eventId);
                }
            });

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            const newUserString = JSON.stringify(user);
            const newUserJSON = JSON.parse(newUserString);
            transaction.set(userDocRef, newUserJSON);
        });
    }

    addNotGoingUser(userId, eventId){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        const userDocRef = this.userCollection.doc(userId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.AddToNotGoing(userId);
                }
            });

            let user = undefined;
            await transaction.get(userDocRef).then(doc => {
                if (doc.exists) {
                    const userJSON = doc.data();
                    user = Object.assign(new User, userJSON);
                    user.SetNotGoing(eventId);
                }
            });

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            const newUserString = JSON.stringify(user);
            const newUserJSON = JSON.parse(newUserString);
            transaction.set(userDocRef, newUserJSON);
        });
    }

    removeNotGoingUser(userId, eventId, restricted){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        const userDocRef = this.userCollection.doc(userId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.RemoveFromNotGoing(userId);
                }
            });

            let user = undefined;
            await transaction.get(userDocRef).then(doc => {
                if (doc.exists) {
                    const userJSON = doc.data();
                    user = Object.assign(new User, userJSON);
                    user.RemoveFromNotGoing(eventId);
                }
            });

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            const newUserString = JSON.stringify(user);
            const newUserJSON = JSON.parse(newUserString);
            transaction.set(userDocRef, newUserJSON);
        });
    }

    inviteToEvent(eventId, invitedUsers){
        let collectionRef = undefined;
        if(eventId.split("-")[0] == "private"){
            collectionRef = this.eventsCollection.doc("privateEvents").collection("privateEvents");
        }
        else if (eventId.split("-")[0] == "public"){
            collectionRef = this.eventsCollection.doc("publicEvents").collection("publicEvents")
        }
        else{return}
        const eventDocRef = collectionRef.doc(eventId);
        this.db.runTransaction(async (transaction) => {
            let event = undefined;
            await transaction.get(eventDocRef).then(doc => {
                if (doc.exists) {
                    const eventJSON = doc.data()
                    event = Event.fromJSON(eventJSON);
                    event.InviteUsers(invitedUsers);
                }
            });

            const newUsers = [];
            for (const userId of invitedUsers){
                const userDocRef = this.userCollection.doc(userId);
                let user = undefined;
                await transaction.get(userDocRef).then(doc => {
                    if (doc.exists) {
                        const userJSON = doc.data();
                        user = Object.assign(new User, userJSON);
                        user.InviteToEvent(eventId);
                        newUsers.push([userDocRef,user]);
                    }
                });
            }

            const newEventJSON = Event.toJSON(event);
            transaction.set(eventDocRef, newEventJSON);

            for (const arr of newUsers){
                const userDocRef = arr[0];
                const newUser = arr[1];
                const newUserString = JSON.stringify(newUser);
                const newUserJSON = JSON.parse(newUserString);
                transaction.set(userDocRef, newUserJSON);
            }
        });
    }
}

module.exports = FirestoreEventManager;