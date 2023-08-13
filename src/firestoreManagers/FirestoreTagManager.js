const admin = require('../config/firebase');

class FirestoreTagManager{
    constructor(){
        this.db = admin.firestore();
        
        this.tagCollection = this.db.collection('tags');
    }

    async addTags(tags){
        for (const tag of tags){
            await this.tagCollection.doc(tag).set({tag: tag});
        }
    }

    async getTags(){
        const tags = [];
        await this.tagCollection.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const tagJSON = doc.data();
                const tag = tagJSON.tag;
                tags.push(tag);
            });
        });

        return tags;
    }
}

module.exports = FirestoreTagManager;