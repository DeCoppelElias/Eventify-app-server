const admin = require('../config/firebase');
const User = require('../datatypes/User');
const Event = require('../datatypes/Event');
const Group = require('../datatypes/Group')

class FirestoreUserManager{
    constructor(){
        this.db = admin.firestore();
        
        this.userCollection = this.db.collection('users');
    }

    addUser(user){
        const userJSON = User.toJSON(user);
        this.userCollection.doc(user.id).set(userJSON);
    }

    async getUser(userId){
        const docRef = this.userCollection.doc(userId);
        let user = undefined;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                user = Object.assign(new User, userJSON);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        return user;
    }

    static async getUser(userId){
        const docRef = admin.firestore().collection('users').doc(userId);
        let user = undefined;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                const userJSON = doc.data();
                user = Object.assign(new User, userJSON);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        return user;
    }
}

module.exports = FirestoreUserManager;