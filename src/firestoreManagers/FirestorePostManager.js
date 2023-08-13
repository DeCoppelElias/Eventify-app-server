const admin = require('../config/firebase');
const Group = require('../datatypes/Group');
const Post = require('../datatypes/Post');
const Event = require('../datatypes/Event');
const User = require('../datatypes/User');
const FirestoreEventManager = require('./FirestoreEventManager');
const FirestoreGroupManager = require('./FirestoreGroupManager');
const FirestoreUserManager = require('./FirestoreUserManager');

class FirestorePostManager{
    constructor(){
        this.db = admin.firestore();
        
        this.postCollection = this.db.collection('posts');
    }

    async addPost(post, parentId){
        const postJSON = Post.toJSON(post);
        const postDocRef = this.postCollection.doc(post.id);

        let collectionRef = undefined;
        const splits = parentId.split("-");
        if(splits[0] == "private" && splits[1] == "group"){
            collectionRef = this.db.collection('groups').doc("privateGroups").collection("privateGroups");
        }
        else if (splits[0] == "public" && splits[1] == "group"){
            collectionRef = this.db.collection('groups').doc("publicGroups").collection("publicGroups");
        }
        else if (splits[0] == "private" && splits[1] == "event"){
            collectionRef = this.db.collection('events').doc("privateEvents").collection("privateEvents");
        }
        else if (splits[0] == "public" && splits[1] == "event"){
            collectionRef = this.db.collection('events').doc("publicEvents").collection("publicEvents");
        }
        const parentDocRef = collectionRef.doc(parentId);

        await this.db.runTransaction(async (transaction) => {
            if(splits[1] == "group"){
                const group = await FirestoreGroupManager.getGroup(parentId);
                group.addPost(post.id);
                const groupJSON = Group.toJSON(group);
                transaction.set(parentDocRef, groupJSON)
            }
            else if (splits[1] == "event"){
                const event = await FirestoreEventManager.getEvent(parentId);
                event.addPost(post.id);
                const eventJSON = Event.toJSON(event);
                transaction.set(parentDocRef, eventJSON);
            }
            transaction.set(postDocRef, postJSON);
        });
    }

    async removePost(postId, parentId){
        const postDocRef = this.postCollection.doc(postId)

        let collectionRef = undefined;
        const splits = parentId.split("-");
        if(splits[0] == "private" && splits[1] == "group"){
            collectionRef = this.db.collection('groups').doc("privateGroups").collection("privateGroups");
        }
        else if (splits[0] == "public" && splits[1] == "group"){
            collectionRef = this.db.collection('groups').doc("publicGroups").collection("publicGroups");
        }
        else if (splits[0] == "private" && splits[1] == "event"){
            collectionRef = this.db.collection('events').doc("privateEvents").collection("privateEvents");
        }
        else if (splits[0] == "public" && splits[1] == "event"){
            collectionRef = this.db.collection('events').doc("publicEvents").collection("publicEvents");
        }
        const parentDocRef = collectionRef.doc(parentId);
        await this.db.runTransaction(async (transaction) => {
            if(splits[1] == "group"){
                const group = await FirestoreGroupManager.getGroup(parentId);
                group.RemovePost(postId);
                const groupJSON = Group.toJSON(group);
                transaction.set(parentDocRef, groupJSON)
            }
            else if (splits[1] == "event"){
                const event = await FirestoreEventManager.getEvent(parentId);
                event.RemovePost(postId);
                const eventJSON = Event.toJSON(event);
                transaction.set(parentDocRef, eventJSON);
            }
            transaction.delete(postDocRef);
        });
    }

    async getPost(postId){
        const docRef = this.postCollection.doc(postId);
        let post = undefined;
        await docRef.get().then((doc) => {
            if (doc.exists) {
                const postJSON = doc.data();
                post = Object.assign(new Post, postJSON);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        return post;
    }

    async getPosts(postIds){
        const posts = [];
        for (const postId of postIds){
            const post = await this.getPost(postId);
            posts.push(post);
        }
        return posts;
    }

    async likePost(userId, postId){
        const postDocRef = this.postCollection.doc(postId);
        const userDocRef = this.db.collection("users").doc(userId);

        await this.db.runTransaction(async (transaction) => {
            const post = await this.getPost(postId);
            post.Like(userId);
            const postJSON = Post.toJSON(post);
            transaction.set(postDocRef, postJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.AddLikedPost(postId);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }

    async unlikePost(userId, postId){
        const postDocRef = this.postCollection.doc(postId);
        const userDocRef = this.db.collection("users").doc(userId);

        await this.db.runTransaction(async (transaction) => {
            const post = await this.getPost(postId);
            post.UnLike(userId);
            const postJSON = Post.toJSON(post);
            transaction.set(postDocRef, postJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.RemoveLikedPost(postId);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }

    async dislikePost(userId, postId){
        const postDocRef = this.postCollection.doc(postId);
        const userDocRef = this.db.collection("users").doc(userId);

        await this.db.runTransaction(async (transaction) => {
            const post = await this.getPost(postId);
            post.Dislike(userId);
            const postJSON = Post.toJSON(post);
            transaction.set(postDocRef, postJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.AddDislikedPost(postId);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }

    async undislikePost(userId, postId){
        const postDocRef = this.postCollection.doc(postId);
        const userDocRef = this.db.collection("users").doc(userId);

        await this.db.runTransaction(async (transaction) => {
            const post = await this.getPost(postId);
            post.UnDislike(userId);
            const postJSON = Post.toJSON(post);
            transaction.set(postDocRef, postJSON);

            const user = await FirestoreUserManager.getUser(userId);
            user.RemoveDislikedPost(postId);
            const userJSON = User.toJSON(user);
            transaction.set(userDocRef, userJSON);
        });
    }
}

module.exports = FirestorePostManager;