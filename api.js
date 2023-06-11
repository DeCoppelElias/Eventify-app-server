const express = require('express');
const jwt = require("jsonwebtoken");
const Event = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');
const {default:nextId} = require("react-id-generator");

const app = express();

const events = [];
const groups = [];
const users = [];

// Creating a private and public event and adding them to the events
for (i = 0; i < 10; i++){
    const publicEvent = new Event(
        id= "test-public-event", 
        title= "public event", 
        location= "at the tree",
        time= new Date(),
        tags= ["outdoor", "fun", "cool"],
        description= "it gon be lit", 
        restricted= false);
    events.push(publicEvent);
}

const privateEvent = new Event(
    id= "test-private-event", 
    title= "private event", 
    location= "at the tree",
    time= new Date(),
    tags= ["outdoor", "fun", "cool"],
    description= "it gon be lit", 
    restricted= true);
events.push(privateEvent);

// Creating a private and public group and adding them to the groups
// Private event is added as an event of that group
const publicGroup = new Group(
    id="test-public-group",
    title="test group",
    description="this is a test group",
    tags=["testtag1", "testtag2"],
    restricted= false);
const privateGroup = new Group(
    id="test-private-group",
    title="test group",
    description="this is a test group",
    tags=["testtag1", "testtag2"],
    restricted= true);
publicGroup.AddEvent(privateEvent.id);
privateGroup.AddEvent(privateEvent.id);
groups.push(publicGroup);
groups.push(privateGroup);

// Creating two test users and adding them to the users
// User 2 is invited to an event and a group
const testUser1 = new User(
    id= "id: test-user-id1",
    firstName= "Elias", 
    lastName= "De Coppel", 
    email= "elias@gmail.com", 
    username= "Elias", 
    password= "Elias");
const testUser2 = new User(
    id= "id: test-user-id2",
    firstName= "Joran", 
    lastName= "De Coppel", 
    email= "joran@gmail.com", 
    username= "Joran", 
    password= "Joran");
testUser2.InviteToEvent(privateEvent.id);
testUser2.InviteToGroup(privateGroup.id);
users.push(testUser1);
users.push(testUser2);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authenticate = (req, res, next) => {
    if (req.headers.authorization === undefined){
        res.status(401).send('Unauthorized request');
        return res;
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send('Unauthorized request');
    }

    try {
        const payload = jwt.verify(token, "secretjwtKey");
        req.user = payload; 
        next();
    }
    catch (ex) {
        res.status(400).send('Invalid token');
    }
}

app.get('/', (req, res) => {
  res.send('App is running..')
});

app.get("/api/getPublicEvents", authenticate, (req, res) => {
    let publicEvents = []
    for (currentEvent of events){
        if (currentEvent.restricted == false){
            publicEvents.push(currentEvent);
        }
    }
    res.json({"events": publicEvents})
});

app.get("/api/getInvitedEvents", authenticate, (req, res) => {
    const userId = req.query.userId;
    const invitedEvents = GetInvitedEvents(userId);
    res.json({"events": invitedEvents})
});

function GetInvitedEvents(userId){
    let invitedEvents = [];
    for (user of users){
        if (user.id == userId){
            invitedEventIds = user.invitedEvents;
            for (currentEvent of events){
                for (id of invitedEventIds){
                    if (currentEvent.id == id){
                        invitedEvents.push(currentEvent);
                    }
                }
            }
            return invitedEvents;
        }
    }
    return invitedEvents;
}

app.get("/api/getYourEvents", authenticate, (req, res) => {
    const userId = req.query.userId;
    const invitedEvents = GetYourEvents(userId);
    res.json({"events": invitedEvents})
});

function GetYourEvents(userId){
    let yourEvents = [];
    for (user of users){
        if (user.id == userId){
            yourEventsIds = user.yourEvents;
            for (currentEvent of events){
                for (id of yourEventsIds){
                    if (currentEvent.id == id){
                        yourEvents.push(currentEvent);
                    }
                }
            }
            return yourEvents;
        }
    }
    return yourEvents;
}

app.get("/api/getEvent", authenticate, (req, res) => {
    const eventId = req.query.eventId;
    for (currentEvent of events){
        if (currentEvent.id == eventId){
            res.json({"event": currentEvent});
            return res;
        }
    }
    res.status(404).send("Event does not exist");
});

app.get("/api/getUser", authenticate, (req, res) => {
    const userId = req.query.userId;
    for (user of users){
        if (user.id == userId){
            res.json({"user": user});
            return res;
        }
    }
    res.status(404).send("User does not exist");
});

app.get("/api/getPublicGroups", authenticate, (req, res) => {
    let publicGroups = []
    for (group of groups){
        if (group.restricted == false){
            publicGroups.push(group);
        }
    }
    res.json({"groups": publicGroups})
});

app.get("/api/getInvitedGroups", authenticate, (req, res) => {
    const userId = req.query.userId;
    const invitedGroups = GetInvitedGroups(userId);
    res.json({"groups": invitedGroups})
});

function GetInvitedGroups(userId){
    let invitedGroups = [];
    for (user of users){
        if (user.id == userId){
            invitedGroupIds = user.invitedGroups;
            for (group of groups){
                for (id of invitedGroupIds){
                    if (group.id == id){
                        invitedGroups.push(group);
                    }
                }
            }
            return invitedGroups;
        }
    }
    return invitedGroups;
}

app.get("/api/getYourGroups", authenticate, (req, res) => {
    const userId = req.query.userId;
    const yourGroups = GetYourGroups(userId);
    res.json({"groups": yourGroups})
});

function GetYourGroups(userId){
    let yourGroups = [];
    for (user of users){
        if (user.id == userId){
            yourGroupIds = user.yourGroups;
            for (group of groups){
                for (id of yourGroupIds){
                    if (group.id == id){
                        yourGroups.push(group);
                    }
                }
            }
            return yourGroups;
        }
    }
    return yourGroups;
}

app.get("/api/getGroup", authenticate, (req, res) => {
    const groupId = req.query.groupId;
    for (group of groups){
        if (group.id == groupId){
            res.json({"group": group})
            return res;
        }
    }
    res.status(404).send("Group does not exist");
});

app.get("/api/authenticate", authenticate, (req, res) => {
    res.send("token is valid");
});

app.post("/api/createEvent", authenticate, (req, res) => {
    const userId = req.body.userId;
    const eventId = nextId();

    const newEvent = new Event(eventId, req.body.title, req.body.location, req.body.time, req.body.description, req.body.restricted)
    events.push(newEvent);

    for (user of users){
        if (user.id == userId){
            user.AddEvent(eventId)
        }
    }

    res.send('Data Received');
});

app.post("/api/log-in", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    for (user of users){
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

app.use(express.static('public'));

app.listen(5000, () => {console.log("server started on port 5000")})