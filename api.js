const express = require('express');
const jwt = require("jsonwebtoken");
const Event = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');
const Post = require('./datatypes/Post');
const {default:nextId} = require("react-id-generator");
const TestSetup = require('./TestSetup');
const middleware = require('./middleware')
const admin = require('./config/firebase');
const {
        add,
        differenceInMinutes,
    } = require('date-fns');
const multer  = require('multer');
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

app.get("/api/getPublicEvents", (req, res) => {
    res.json({"events": Array.from(publicEvents.values())})
});

app.get("/api/getGoingEvents", (req, res) => {
    const userId = req.query.userId;

    const user = users.get(userId);
    if(user == undefined){
        res.sendStatus(404);
        return res;
    }

    const events = [];
    for(id of user.going){
        let event = privateEvents.get(id);
        if (event == undefined){
            event = publicEvents.get(id);
        }
        
        if (event != undefined){
            events.push(event);
        }
    }

    res.json({"events": events})
});

app.get("/api/getNotGoingEvents", (req, res) => {
    const userId = req.query.userId;

    const user = users.get(userId);
    if(user == undefined){
        res.sendStatus(404);
        return res;
    }

    const events = [];
    for(id of user.notGoing){
        let event = privateEvents.get(id);
        if (event == undefined){
            event = publicEvents.get(id);
        }
        
        if (event != undefined){
            events.push(event);
        }
    }

    res.json({"events": events})
});

app.get("/api/getMaybeEvents", (req, res) => {
    const userId = req.query.userId;

    const user = users.get(userId);
    if(user == undefined){
        res.sendStatus(404);
        return res;
    }

    const events = [];
    for(id of user.maybe){
        let event = privateEvents.get(id);
        if (event == undefined){
            event = publicEvents.get(id);
        }
        
        if (event != undefined){
            events.push(event);
        }
    }

    res.json({"events": events})
});

app.get("/api/getNotRepliedInvitedEvents", (req, res) => {
    const userId = req.query.userId;
    const invitedEvents = GetInvitedEvents(userId);
    res.json({"events": invitedEvents})
});

function GetInvitedEvents(userId){
    let invitedEvents = [];
    const user = users.get(userId);
    if (user != undefined){
        const invitedEventIds = user.notRepliedInvitedEvents;
        for (id of invitedEventIds){
            const event = privateEvents.get(id);
            if (event != undefined){
                invitedEvents.push(event);
            }
        }
    }

    return invitedEvents;
}

app.get("/api/getYourEvents", (req, res) => {
    const userId = req.query.userId;
    const invitedEvents = GetYourEvents(userId);
    res.json({"events": invitedEvents})
});

app.get("/api/getTags", (req, res) => {
    res.json({"tags": tags})
});

function GetYourEvents(userId){
    let yourEvents = [];
    const user = users.get(userId);
    if (user != undefined){
        const yourEventIds = user.yourEvents;
        for (id of yourEventIds){
            let event = privateEvents.get(id);
            if (event == undefined){
                event = publicEvents.get(id);
            }
            
            if (event != undefined){
                yourEvents.push(event);
            }
        }
    }

    return yourEvents;
}

app.get("/api/getEvent", (req, res) => {
    const eventId = req.query.eventId;

    let event = publicEvents.get(eventId);
    if (event != undefined){
        res.json({"event": event});
        return res;
    }

    event = privateEvents.get(eventId);
    if (event != undefined){
        res.json({"event": event});
        return res;
    }

    res.status(404).send("Event does not exist");
});

app.get("/api/getEventImage", (req, res) => {
    const eventId = req.query.eventId;
    const imageType = req.query.imageType;
    res.sendFile(`D:/VisualStudioProjects/first project/server/public/Images/events/image-${String(eventId)}.${String(imageType)}`);
});

app.get("/api/getEvents", (req, res) => {
    const eventIds = req.query.eventIds;
    const events = [];
    if (eventIds == undefined){
        res.json({"events": events});
        return res;
    }

    for (eventId of eventIds){
        let event = publicEvents.get(eventId);
        if (event == undefined){
            event = privateEvents.get(eventId);
        }

        if (event != undefined){
            events.push(event)
        }
    }

    res.json({"events": events});
    return res;
});

// app.get("/api/getUser", (req, res) => {
//     const userId = req.query.userId;

//     const user = users.get(userId);
//     if (user != undefined){
//         res.json({"user": user});
//         return res;
//     }

//     res.status(404).send("User does not exist");
// });

app.get("/api/getUsers", (req, res) => {
    res.json({"users": Array.from(users.values())});
});

app.get("/api/getPublicGroups", (req, res) => {
    res.json({"groups": Array.from(publicGroups.values())})
});

app.get("/api/getSubscribedGroups", (req, res) => {
    const userId = req.query.userId;
    const subscribedGroups = GetSubscribedGroups(userId);
    res.json({"groups": subscribedGroups});
});

function GetSubscribedGroups(userId){
    let subscribedGroups = [];

    const user = users.get(userId);
    if (user != undefined){
        const subscribedGroupIds = user.subscribedGroups;
        for (id of subscribedGroupIds){
            let group = privateGroups.get(id);
            if(group == undefined){
                group = publicGroups.get(id);
            }
            if (group != undefined){
                subscribedGroups.push(group);
            }
        }
    }

    return subscribedGroups;
}

app.get("/api/getAdministratorGroups", (req, res) => {
    const userId = req.query.userId;
    const subscribedGroups = GetAdministratorGroups(userId);
    res.json({"groups": subscribedGroups});
});

function GetAdministratorGroups(userId){
    let administratorGroups = [];

    const user = users.get(userId);
    if (user != undefined){
        const administratorGroupIds = user.administratorGroups;
        for (id of administratorGroupIds){
            let group = privateGroups.get(id);
            if(group == undefined){
                group = publicGroups.get(id);
            }
            if (group != undefined){
                administratorGroups.push(group);
            }
        }
    }

    return administratorGroups;
}

app.get("/api/getNotRepliedInvitedGroups", (req, res) => {
    const userId = req.query.userId;
    const invitedGroups = GetInvitedGroups(userId);
    res.json({"groups": invitedGroups});
});

function GetInvitedGroups(userId){
    let invitedGroups = [];

    const user = users.get(userId);
    if (user != undefined){
        const invitedGroupIds = user.notRepliedInvitedGroups;
        for (id of invitedGroupIds){
            const group = privateGroups.get(id);
            if (group != undefined){
                invitedGroups.push(group);
            }
        }
    }

    return invitedGroups;
}

app.get("/api/getYourGroups", (req, res) => {
    const userId = req.query.userId;
    const yourGroups = GetYourGroups(userId);
    res.json({"groups": yourGroups})
});

function GetYourGroups(userId){
    let yourGroups = [];

    const user = users.get(userId);
    if (user != undefined){
        const yourGroupIds = user.yourGroups;
        for (id of yourGroupIds){
            let group = privateGroups.get(id);
            if (group != undefined){
                yourGroups.push(group);
            }

            group = publicGroups.get(id);
            if (group != undefined){
                yourGroups.push(group);
            }
        }
    }

    return yourGroups;
}

app.get("/api/getGroup", (req, res) => {
    const groupId = req.query.groupId;

    let group = publicGroups.get(groupId);
    if (group != undefined){
        res.json({"group": group})
        return res;
    }

    group = privateGroups.get(groupId);
    if (group != undefined){
        res.json({"group": group})
        return res;
    }

    res.status(404).send("Group does not exist");
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

app.get("/api/getCalendarEvents", (req, res) => {
    const userId = req.query.userId;
    const startDate = new Date(req.query.startDate);
    const endDate = add(startDate, { months: 1 })

    const user = users.get(userId);
    if(user == undefined){
        res.sendStatus(404);
        return res;
    }

    const calendarGoingEvents = GetCalendarEvents(user.going, startDate, endDate);
    const calendarMaybeEvents = GetCalendarEvents(user.maybe, startDate, endDate);
    const calendarYourEvents = GetCalendarEvents(user.yourEvents, startDate, endDate);
    
    res.json({
        calendarGoingEvents: calendarGoingEvents,
        calendarMaybeEvents: calendarMaybeEvents,
        calendarYourEvents: calendarYourEvents
    })
})

function GetCalendarEvents(events, startDate, endDate){
    const dif = differenceInMinutes(endDate, startDate);
    const calendarEvents = [];
    for (id of events){
        const event = GetEvent(id);
        if(event != undefined){
            const eventTime = new Date(event.startTime);
            const currentDif = differenceInMinutes(eventTime, startDate);
            if(currentDif < dif){
                calendarEvents.push(event);
            }
        }
    }
    return calendarEvents;
}

function GetEvent(eventId){
    let event = publicEvents.get(eventId);
    if(event == undefined){
        event = privateEvents.get(eventId);
    }
    return event
}

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

app.post("/api/createEvent", (req, res) => {
    const userId = req.query.userId;
    const eventId = nextId();

    const newEvent = new Event(
        eventId, 
        req.body.title, 
        req.body.location, 
        req.body.startTime,
        req.body.endTime,
        req.body.tags, 
        req.body.description, 
        req.body.restricted,
        req.body.imageType,
        userId);
    
    if(req.body.restricted){
        privateEvents.set(newEvent.id, newEvent);

        const createForGroupsIds = req.body.createForGroups;
        for (id of createForGroupsIds){
            let group = publicGroups.get(id);
            if(group == undefined){
                group = privateGroups.get(id);
            }

            if(group != undefined){
                group.AddEvent(eventId);
            }
        }
    }
    else{
        publicEvents.set(newEvent.id, newEvent);
    }

    const user = users.get(userId);
    if (user != undefined){
        user.AddEvent(eventId)
    }

    res.send({'eventId': eventId});
});

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

app.post("/api/createGroup", (req, res) => {
    const userId = req.query.userId;
    const groupId = nextId();

    const newGroup = new Group(
        groupId, 
        req.body.title, 
        req.body.description, 
        req.body.tags,
        req.body.restricted,
        req.body.imageType,
        userId);
    
    if(req.body.restricted){
        privateGroups.set(newGroup.id, newGroup);
    }
    else{
        publicGroups.set(newGroup.id, newGroup);
    }

    const user = users.get(userId);
    if (user != undefined){
        user.AddGroup(groupId);
    }

    res.send({'groupId': groupId});
});

app.post("/api/uploadEventImage", uploadEventImage.single("file") , (req, res) => {
    
})

app.post("/api/uploadGroupImage", uploadGroupImage.single("file"), (req, res) => {
    
})

app.post("/api/subscribeToGroup", (req, res) => {
    const userId = req.query.userId;
    const groupId = req.body.groupId;

    let group = publicGroups.get(groupId);
    if (group == undefined){
        group = privateGroups.get(groupId);
    }

    if (group != undefined){
        group.SubscribeUser(userId)
    }
    else{
        res.sendStatus(404);
        return;
    }

    const user = users.get(userId);
    if (user != undefined){
        user.SubscribeToGroup(groupId);
    }
    else{
        res.sendStatus(404);
        return;
    }

    res.send('Data Received');
});

app.post("/api/unSubscribeFromGroup", (req, res) => {
    const userId = req.query.userId;
    const groupId = req.body.groupId;

    let group = publicGroups.get(groupId);
    if (group == undefined){
        group = privateGroups.get(groupId);
    }

    if (group != undefined){
        group.UnSubscribeUser(userId)
    }
    else{
        res.sendStatus(404);
        return;
    }

    const user = users.get(userId);
    if (user != undefined){
        user.UnSubscribeFromGroup(groupId);
    }
    else{
        res.sendStatus(404);
        return;
    }

    res.send('Data Received');
});

app.post("/api/setGoing", (req, res) => {
    const userId = req.query.userId;
    const eventId = req.body.eventId;
    const going = req.body.going;

    let event = publicEvents.get(eventId);
    if (event != undefined){
        if (going == true){
            event.AddToGoing(userId);
        }
        else{
            event.RemoveFromGoing(userId);
        }
    }

    event = privateEvents.get(eventId);
    if (event != undefined){
        if (going == true){
            event.AddToGoing(userId);
        }
        else{
            event.RemoveFromGoing(userId);
        }
    }

    const user = users.get(userId);
    if (user != undefined){
        if (going == true){
            user.SetGoing(eventId);
        }
        else{
            user.RemoveFromGoing(eventId);
        }
    }

    res.send('Data Received');
});

app.post("/api/setNotGoing", (req, res) => {
    const userId = req.query.userId;
    const eventId = req.body.eventId;
    const notGoing = req.body.notGoing;

    let event = publicEvents.get(eventId);
    if(event == undefined){
        event = privateEvents.get(eventId);
    }
    if (event != undefined){
        if (notGoing == true){
            event.AddToNotGoing(userId);
        }
        else{
            event.RemoveFromNotGoing(userId);
        }
    }

    const user = users.get(userId);
    if (user != undefined){
        if (notGoing == true){
            user.SetNotGoing(eventId);
        }
        else{
            user.RemoveFromNotGoing(eventId);
        }
    }

    res.send('Data Received');
});

app.post("/api/setMaybe", (req, res) => {
    const userId = req.query.userId;
    const eventId = req.body.eventId;
    const maybe = req.body.maybe;

    let event = publicEvents.get(eventId);
    if (event != undefined){
        if (maybe == true){
            event.AddToMaybe(userId);
        }
        else{
            event.RemoveFromMaybe(userId);
        }
    }

    event = privateEvents.get(eventId);
    if (event != undefined){
        if (maybe == true){
            event.AddToMaybe(userId);
        }
        else{
            event.RemoveFromMaybe(userId);
        }
    }

    const user = users.get(userId);
    if (user != undefined){
        if (maybe == true){
            user.SetMaybe(eventId);
        }
        else{
            user.RemoveFromMaybe(eventId);
        }
    }

    res.send('Data Received');
});

app.post("/api/likeEvent", (req, res) => {
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

app.post("/api/dislikeEvent", (req, res) => {
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

app.post("/api/inviteToEvent", (req, res) => {
    const eventId = req.body.eventId;
    const invitedUsers = req.body.invitedUsers;

    let event = publicEvents.get(eventId);
    if (event == undefined){
        event = privateEvents.get(eventId);
    }
    
    if(event != undefined){
        event.InviteUsers(invitedUsers)
    }

    for (const invitedUser of invitedUsers){
        const user = users.get(invitedUser);

        if(user == undefined){
            res.sendStatus(404);
            return res;
        }

        user.InviteToEvent(eventId);
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

app.listen(5000, () => {console.log("server started on port 5000")})