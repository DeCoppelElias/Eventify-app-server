const express = require('express');
const eventApi = require('./eventApi')
const groupApi = require('./groupApi')
const jwt = require("jsonwebtoken");
const Event = require('../datatypes/Event');
const Group = require('../datatypes/Group');
const User = require('../datatypes/User');
const Post = require('../datatypes/Post');
const {default:nextId} = require("react-id-generator");
const TestSetup = require('../TestSetup');
const middleware = require('../middleware')
const admin = require('../config/firebase');
const {
        add,
        differenceInMinutes,
    } = require('date-fns');
const multer  = require('multer')

var eventStorage = multer.diskStorage(
    {
        destination: 'public/Images/events',
        filename: function ( req, file, cb ) {
            cb( null, 'image-' + req.body.eventId + "." + file.mimetype.split("/")[1]);
        } 
    }
);
var uploadEventImage = multer( { storage: eventStorage } );
var groupStorage = multer.diskStorage(
    {
        destination: 'public/Images/groups',
        filename: function ( req, file, cb ) {
            cb( null, 'image-' + req.body.groupId + "." + file.mimetype.split("/")[1]);
        } 
    }
);
var uploadGroupImage = multer( { storage: groupStorage } );

const app = express();


app.use(express.json());
app.use(express.static('public'));

app.use(middleware.decodeToken)

let publicEvents = new Map();
let privateEvents = new Map();
let publicGroups = new Map();
let privateGroups = new Map();
let users = new Map();
let posts = new Map();
let tags = [];
const testSetup = new TestSetup();
testSetup.initialize().then(()=> {
    publicEvents = testSetup.publicEvents;
    privateEvents = testSetup.privateEvents;
    publicGroups = testSetup.publicGroups;
    privateGroups = testSetup.privateGroups;
    users = testSetup.users;
    posts = testSetup.posts;
    tags = testSetup.tags;
    console.log("Succesfully created the test setup")
})

app.get('/', (req, res) => {
  res.send('App is running..')
});

app.use("/api/events", eventApi)
app.use("/api/groups", groupApi)

app.get("/api/getTags", (req, res) => {
    res.json({"tags": tags})
});

app.get("/api/getUsers", (req, res) => {
    res.json({"users": Array.from(users.values())});
});

app.get("/api/authenticate", (req, res) => {
    res.send("token is valid");
});

app.get("/api/getPosts", (req, res) => {
    const id = req.query.id;
    const type = req.query.type;

    if(type == "event"){
        let event = publicEvents.get(id);
        if (event == undefined){
            event = privateEvents.get(id);
        }

        if (event != undefined){
            const ids = event.posts;
            const eventPosts = [];
            for (currentId of ids){
                const post = posts.get(currentId);
                if (post != undefined){
                    eventPosts.push(post);
                }
            }

            res.json({"posts": eventPosts})
            return res;
        }
    }
    if (type == "group"){
        let group = publicGroups.get(id);
        if (group == undefined){
            group = privateGroups.get(id);
        }

        if (group != undefined){
            const ids = group.posts;
            const groupPosts = [];
            for (currentId of ids){
                const post = posts.get(currentId);
                if (post != undefined){
                    groupPosts.push(post);
                }
            }

            res.json({"posts": groupPosts})
            return res;
        }
    }

    res.json({"posts": []})
});

app.get("/api/getInvitedUsers", (req, res) => {
    const id = req.query.id;
    const type = req.query.type;

    if(type == "group"){
        let group = publicGroups.get(id);
        if (group == undefined){
            group = privateGroups.get(id);
        }
        
        if (group != undefined){
            res.json({
                invitedUsers : group.invitedUsers
            });
            return res;
        }
    }
    if(type == "event"){
        let event = publicEvents.get(id);
        if (event == undefined){
            event = privateEvents.get(id);
        }
        
        if (event != undefined){
            res.json({
                invitedUsers : event.invitedUsers
            });
            return res;
        }
    }

    res.sendStatus(404);
})

app.post("/api/createPost", (req, res) => {
    const userId = req.query.userId;
    const id = req.body.id;
    const type = req.body.type;
    const postTitle = req.body.postTitle;
    const postText = req.body.postText;
    const postId = nextId();

    const newPost = new Post(
        postId,
        postTitle,
        postText,
        userId
    );

    posts.set(postId, newPost);
    
    if(type == "event"){
        let event = publicEvents.get(id);
        if (event == undefined){
            event = privateEvents.get(id);
        }
        
        if (event != undefined){
            event.AddPost(postId);
        }
    }
    if(type == "group"){
        let group = publicGroups.get(id);
        if (group == undefined){
            group = privateGroups.get(id);
        }
        
        if (group != undefined){
            group.AddPost(postId);
        }
    }
    
})

app.post("/api/removePost", (req, res) => {
    const userId = req.query.userId;
    const id = req.body.id;
    const type = req.body.type;
    const postId = req.body.postId;
    const creatorId = req.body.creatorId;

    if (userId != creatorId) {
        return;
    }

    posts.delete(postId);
    
    if(type == "event"){
        let event = publicEvents.get(id);
        if (event == undefined){
            event = privateEvents.get(id);
        }
        
        if (event != undefined){
            event.RemovePost(postId);
        }
    }
    if(type == "group"){
        let group = publicGroups.get(id);
        if (group == undefined){
            group = privateGroups.get(id);
        }
        
        if (group != undefined){
            group.RemovePost(postId);
        }
    }
})

app.post("/api/registerUser", (req, res) => {
    try {
        admin.getAuth().createUser({
            email: req.body.email,
            emailVerified: false,
            password: req.body.password,
            displayName: req.body.username,
            disabled: false,
        })
        .then((userRecord) => {
            console.log('Successfully created new user in firebase:', userRecord.uid);
            registerUserInternally(userRecord);
        })
        .catch((error) => {
            console.log('Error creating new user in firebase:', error);
        });
    } catch (err){
        if (err.code === "auth/weak-password"){
            displayError("The password should be at least 6 characters long.");
        }
        else if (err.code === "auth/email-already-exists"){
            displayError("Your email is already in use.");
        }
        else{
            console.error(err.code);
        }
    }
})

app.post("/api/registerUserInternally", (req, res) => {
    const userId = req.query.userId;
    admin.auth().getUser(userId).then(function(userRecord){
        if(users.get(userId) == undefined){
            registerUserInternally(userRecord);
        }
    }).catch(function (error){console.log('Error creating new user internally:', error);})
    res.sendStatus(200)
})

function registerUserInternally(userRecord){
    const user = new User(userRecord.uid, userRecord.displayName, userRecord.email);
    users.set(userRecord.uid, user);
    console.log("Successfully created new user internally: ", userRecord.uid)
}

app.post("/api/uploadEventImage", uploadEventImage.single("file") , (req, res) => {
    
})

app.post("/api/uploadGroupImage", uploadGroupImage.single("file"), (req, res) => {
    
})

app.post("/api/likePost", (req, res) => {
    const userId = req.query.userId;
    const postId = req.body.postId;
    const like = req.body.like;

    let post = posts.get(postId);
    if (post != undefined){
        if (like == true){
            post.Like(userId);
        }
        else{
            post.UnLike(userId);
        }
    }

    const user = users.get(userId);
    if (user != undefined){
        if (like == true){
            user.AddLikedPost(postId);
        }
        else{
            user.RemoveLikedPost(postId);
        }
    }

    res.send('Data Received');
});

app.post("/api/dislikePost", (req, res) => {
    const userId = req.query.userId;
    const postId = req.body.postId;
    const dislike = req.body.dislike;

    let post = posts.get(postId);
    if (post != undefined){
        if (dislike == true){
            post.Dislike(userId);
        }
        else{
            post.UnDislike(userId);
        }
    }

    const user = users.get(userId);
    if (user != undefined){
        if (dislike == true){
            user.AddDislikedPost(postId);
        }
        else{
            user.RemoveDislikedPost(postId);
        }
    }

    res.send('Data Received');
});

app.post("/api/inviteToGroup", (req, res) => {
    const groupId = req.body.groupId;
    const invitedUsers = req.body.invitedUsers;

    let group = publicGroups.get(groupId);
    if (group == undefined){
        group = privateGroups.get(groupId);
    }
    
    if(group != undefined){
        group.InviteUsers(invitedUsers)
    }

    for (const invitedUser of invitedUsers){
        const user = users.get(invitedUser);

        if(user == undefined){
            res.sendStatus(404);
            return res;
        }

        user.InviteToGroup(groupId);
    }
});

app.post("/api/log-in", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    for (user of users.values()){
        if (user.username == username && user.password == password){
            const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, "secretjwtKey");
            res.json({
                token : token,
                userId : user.id
            });
            return res;
        }
    }
    res.status(400).json({ message: "Invalid email or password." });
});

app.listen(5000, () => {console.log("server started on port 5000")});