const admin = require('../config/firebase');
const User = require('../datatypes/User');
const Event = require('../datatypes/Event');
const Group = require('../datatypes/Group');
const FirestoreUserManager = require('./FirestoreUserManager');

class FirestoreGroupManager{
    constructor(){
        this.db = admin.firestore();

        this.userCollection = this.db.collection('users');

        this.groupsCollection = this.db.collection('groups');
        this.publicGroupsCollection = this.groupsCollection.doc("publicGroups").collection('publicGroups');
        this.privateGroupsCollection = this.groupsCollection.doc("privateGroups").collection('privateGroups');
    }

    async getGroup(groupId){
        let collectionRef = undefined;
        if(groupId.split("-")[0] == "private"){
            collectionRef = this.privateGroupsCollection;
        }
        else if (groupId.split("-")[0] == "public"){
            collectionRef = this.publicGroupsCollection;
        }
        else{return undefined}

        const docRef = collectionRef.doc(groupId);
        let group = undefined;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                const groupJSON = doc.data();
                group = Object.assign(new Group, groupJSON);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        return group;
    }

    static async getGroup(groupId){
        let collectionRef = undefined;
        if(groupId.split("-")[0] == "private"){
            collectionRef = admin.firestore().collection('groups').doc("privateGroups").collection('privateGroups');
        }
        else if (groupId.split("-")[0] == "public"){
            collectionRef = admin.firestore().collection('groups').doc("publicGroups").collection('publicGroups');
        }
        else{return undefined}

        const docRef = collectionRef.doc(groupId);
        let group = undefined;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                const groupJSON = doc.data();
                group = Object.assign(new Group, groupJSON);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        return group;
    }

    async getPublicGroups(){
        const groups = [];
        const collectionRef = this.groupsCollection.doc("publicGroups").collection("publicGroups")
        await collectionRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const groupJSON = doc.data();
                const group = Object.assign(new Group, groupJSON);
                groups.push(group);
            });
        });

        return groups;
    }

    async getYourGroups(userId){
        const groups = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const yourGroupIds = user.yourGroups;
                for(const groupId of yourGroupIds){
                    const group = await this.getGroup(groupId);
                    groups.push(group);
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return groups;
    }

    async getAdministratorGroups(userId){
        const groups = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const groupIds = user.administratorGroups;
                for(const groupId of groupIds){
                    const group = await this.getGroup(groupId);
                    groups.push(group);
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return groups;
    }

    async getSubscribedGroups(userId){
        const groups = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const groupIds = user.subscribedGroups;
                for(const groupId of groupIds){
                    const group = await this.getGroup(groupId);
                    groups.push(group);
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return groups;
    }

    async getNotRepliedInvitedGroups(userId){
        const groups = [];
        const collectionRef = this.userCollection.doc(userId);
        await collectionRef.get().then(async(doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                const user = Object.assign(new User, userJSON);
                const groupIds = user.notRepliedInvitedGroups;
                for(const groupId of groupIds){
                    const group = await this.getGroup(groupId);
                    groups.push(group);
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });

        return groups;
    }

    addGroup(userId, group){
        const groupJSON = Group.toJSON(group);
        let groupDocRef = undefined;
        if(group.restricted){
            groupDocRef = this.privateGroupsCollection.doc(group.id);
        }
        else{
            groupDocRef = this.publicGroupsCollection.doc(group.id);
        }
        const userDocRef = this.userCollection.doc(userId);

        this.db.runTransaction(async (transaction) => {
            transaction.set(groupDocRef, groupJSON);
            const user = await FirestoreUserManager.getUser(userId);
            user.addGroup(group.id);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }

    subscribeToGroup(userId, groupId){
        let collectionRef = undefined;
        if(groupId.split("-")[0] == "private"){
            collectionRef = this.privateGroupsCollection;
        }
        else if (groupId.split("-")[0] == "public"){
            collectionRef = this.publicGroupsCollection;
        }
        const userDocRef = this.userCollection.doc(userId);
        const groupDocRef = collectionRef.doc(groupId);
        this.db.runTransaction(async (transaction) => {
            const group = await FirestoreGroupManager.getGroup(groupId);
            group.SubscribeUser(userId);
            const groupJSON = Group.toJSON(group);
            transaction.set(groupDocRef, groupJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.SubscribeToGroup(groupId);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }

    unsubscribeFromGroup(userId, groupId){
        let collectionRef = undefined;
        if(groupId.split("-")[0] == "private"){
            collectionRef = this.privateGroupsCollection;
        }
        else if (groupId.split("-")[0] == "public"){
            collectionRef = this.publicGroupsCollection;
        }
        const userDocRef = this.userCollection.doc(userId);
        const groupDocRef = collectionRef.doc(groupId);
        this.db.runTransaction(async (transaction) => {
            const group = await FirestoreGroupManager.getGroup(groupId);
            group.UnSubscribeUser(userId);
            const groupJSON = Group.toJSON(group);
            transaction.set(groupDocRef, groupJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.UnSubscribeFromGroup(groupId);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }
}

module.exports = FirestoreGroupManager;