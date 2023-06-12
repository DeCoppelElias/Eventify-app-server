const express = require('express');
const jwt = require("jsonwebtoken");
const Event = require('./datatypes/Event');
const Group = require('./datatypes/Group');
const User = require('./datatypes/User');
const {default:nextId} = require("react-id-generator");
const TestSetup = require('./TestSetup');

const app = express();

const testSetup = new TestSetup();
const publicEvents = testSetup.publicEvents;
const privateEvents = testSetup.privateEvents;
const publicGroups = testSetup.publicGroups;
const privateGroups = testSetup.privateGroups;
const users = testSetup.users;

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
    res.json({"events": Array.from(publicEvents.values())})
});

app.get("/api/getInvitedEvents", authenticate, (req, res) => {
    const userId = req.query.userId;
    const invitedEvents = GetInvitedEvents(userId);
    res.json({"events": invitedEvents})
});

function GetInvitedEvents(userId){
    let invitedEvents = [];
    const user = users.get(userId);
    if (user != undefined){
        const invitedEventIds = user.invitedEvents;
        for (id of invitedEventIds){
            const event = privateEvents.get(id);
            if (event != undefined){
                invitedEvents.push(event);
            }
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
    const user = users.get(userId);
    if (user != undefined){
        const yourEventIds = user.yourEvents;
        for (id of yourEventIds){
            let event = privateEvents.get(id);
            if (event != undefined){
                yourEvents.push(event);
            }

            event = publicEvents.get(id);
            if (event != undefined){
                yourEvents.push(event);
            }
        }
    }

    return yourEvents;
}

app.get("/api/getEvent", authenticate, (req, res) => {
    const eventId = req.query.eventId;

    let event = publicEvents.get(eventId);
    if (event != undefined){
        res.json({"event": event});
        return res;
    }

    event = publicEvents.get(eventId);
    if (event != undefined){
        res.json({"event": event});
        return res;
    }

    res.status(404).send("Event does not exist");
});

app.get("/api/getUser", authenticate, (req, res) => {
    const userId = req.query.userId;

    const user = users.get(userId);
    if (user != undefined){
        res.json({"user": user});
        return res;
    }

    res.status(404).send("User does not exist");
});

app.get("/api/getPublicGroups", authenticate, (req, res) => {
    res.json({"groups": Array.from(publicGroups.values())})
});

app.get("/api/getInvitedGroups", authenticate, (req, res) => {
    const userId = req.query.userId;
    const invitedGroups = GetInvitedGroups(userId);
    res.json({"groups": invitedGroups});
});

function GetInvitedGroups(userId){
    let invitedGroups = [];

    const user = users.get(userId);
    if (user != undefined){
        const invitedGroupIds = user.invitedGroups;
        for (id of invitedGroupIds){
            const group = privateGroups.get(id);
            if (group != undefined){
                invitedGroups.push(group);
            }
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

app.get("/api/getGroup", authenticate, (req, res) => {
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

app.get("/api/authenticate", authenticate, (req, res) => {
    res.send("token is valid");
});

app.post("/api/createEvent", authenticate, (req, res) => {
    const userId = req.body.userId;
    const eventId = nextId();

    const newEvent = new Event(eventId, req.body.title, req.body.location, req.body.time, req.body.description, req.body.restricted);
    publicEvents.push(newEvent);

    const user = users.get(userId);
    if (user != undefined){
        user.AddEvent(eventId)
    }

    res.send('Data Received');
});

app.post("/api/setGoing", authenticate, (req, res) => {
    const userId = req.body.userId;
    const eventId = req.body.eventId;

    let event = publicEvents.get(eventId);
    if (event != undefined){
        event.AddToGoing(userId);
    }

    event = privateEvents.get(eventId);
    if (event != undefined){
        event.AddToGoing(userId);
    }

    const user = users.get(userId);
    if (user != undefined){
        user.SetGoing(eventId);
    }

    res.send('Data Received');
});

app.post("/api/setMaybe", authenticate, (req, res) => {
    const userId = req.body.userId;
    const eventId = req.body.eventId;

    let event = publicEvents.get(eventId);
    if (event != undefined){
        event.AddToMaybe(userId);
    }

    event = privateEvents.get(eventId);
    if (event != undefined){
        event.AddToMaybe(userId);
    }

    const user = users.get(userId);
    if (user != undefined){
        user.SetMaybe(eventId);
    }

    res.send('Data Received');
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

app.use(express.static('public'));

app.listen(5000, () => {console.log("server started on port 5000")})