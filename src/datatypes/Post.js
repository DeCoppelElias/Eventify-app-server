class Post{
    constructor(id, title, text, creator, createTime) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.creator = creator;
        this.createTime = createTime;
        
        this.likes = [];
        this.dislikes = [];
    }

    static toJSON(post){
        const postString = JSON.stringify(post);
        const postJSON = JSON.parse(postString);
        return postJSON;
    }

    Like(userId){
        if (!this.likes.includes(userId)){
            this.likes.push(userId);
        }

        if (this.dislikes.includes(userId)){
            this.UnDislike(userId);
        }
    }

    UnLike(userId){
        const index = this.likes.indexOf(userId);
        if (index > -1) {
            this.likes.splice(index, 1); 
        }
    }

    Dislike(userId){
        if (!this.dislikes.includes(userId)){
            this.dislikes.push(userId);
        }

        if (this.likes.includes(userId)){
            this.UnLike(userId);
        }
    }

    UnDislike(userId){
        const index = this.dislikes.indexOf(userId);
        if (index > -1) {
            this.dislikes.splice(index, 1); 
        }
    }
}

module.exports = Post;