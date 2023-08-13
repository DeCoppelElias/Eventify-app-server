const express = require('express');
const FirestorePostManager = require('../firestoreManagers/FirestorePostManager');
const {default:nextId} = require("react-id-generator");
const router = express.Router();
const Post = require("../datatypes/Post");

const firestorePostManager = new FirestorePostManager();

router.get("/getPosts", async(req, res) => {
    const postIds = req.query.postIds;
    const posts = await firestorePostManager.getPosts(postIds);

    return res.json({"posts": posts})
});

router.post("/likePost", async(req, res) => {
    const userId = req.query.userId;
    const postId = req.body.postId;
    const like = req.body.like;
    if(like){
        await firestorePostManager.likePost(userId, postId);
    }
    else{
        await firestorePostManager.unlikePost(userId, postId);
    }

    return res.sendStatus(200);
});

router.post("/dislikePost", async(req, res) => {
    const userId = req.query.userId;
    const postId = req.body.postId;
    const dislike = req.body.dislike;
    if(dislike){
        await firestorePostManager.dislikePost(userId, postId);
    }
    else{
        await firestorePostManager.undislikePost(userId, postId);
    }

    return res.sendStatus(200);
});

router.post("/createPost", async(req, res) => {
    const userId = req.query.userId;
    const parentId = req.body.parentId;
    const postTitle = req.body.postTitle;
    const postText = req.body.postText;
    const postId = "post-" + nextId();

    const newPost = new Post(
        postId,
        postTitle,
        postText,
        userId,
        new Date()
    );

    await firestorePostManager.addPost(newPost, parentId);

    return res.json({"postId": postId});
});

router.post("/removePost", async(req, res) => {
    const userId = req.query.userId;
    const postId = req.body.postId;
    const parentId = req.body.parentId;
    const creatorId = req.body.creatorId;

    if (userId != creatorId) {
        return;
    }
    await firestorePostManager.removePost(postId, parentId);

    return res.json({"postId": postId});
});

module.exports = router;