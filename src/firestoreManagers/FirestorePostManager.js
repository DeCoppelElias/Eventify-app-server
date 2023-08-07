const admin = require('../config/firebase');
const User = require('../datatypes/User');
const Event = require('../datatypes/Event');
const Group = require('../datatypes/Group')

class FirestorePostManager{
    constructor(){
        this.db = admin.firestore();
        
        this.postCollection = this.db.collection('posts');
    }

    addPost(post){
        const postJSON = JSON.stringify(post);
        this.postCollection.doc(post.id).set(JSON.parse(postJSON));
    }

    removePost(post){
        this.postCollection.doc(post.id).delete().then(() => {
            console.log("Post deleted: " + post.id);
        }).catch((error) => {
            console.error("Error removing post: " + post.id + ": ", error);
        });
    }
}

module.exports = FirestorePostManager;