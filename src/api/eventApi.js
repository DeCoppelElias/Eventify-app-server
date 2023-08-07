const express = require('express');
const FirestoreEventManager = require('../firestoreManagers/FirestoreEventManager');
const {default:nextId} = require("react-id-generator");
const router = express.Router();
const Event = require("../datatypes/Event");

const firestoreEventManager = new FirestoreEventManager();

router.get("/getEvent", async(req, res) => {
    const eventId = req.query.eventId;
    const event = await firestoreEventManager.getEvent(eventId);
    return res.json({"event": event});
});

router.get("/getEvents", async(req, res) => {
    const eventIds = req.query.eventIds;
    const events = [];
    for (const eventId of eventIds){
        const event = await firestoreEventManager.getEvent(eventId);
        events.push(event);
    }
    
    return res.json({"events": events});
});

router.get("/getPublicEvents", async(req, res) => {
    const events = await firestoreEventManager.getPublicEvents();
    return res.json({"events": events})
});

router.get("/getYourEvents", async(req, res) => {
    const userId = req.query.userId;
    const events = await firestoreEventManager.getYourEvents(userId);
    return res.json({"events": events})
});

router.get("/getGoingEvents", async(req, res) => {
    const userId = req.query.userId;
    const events = await firestoreEventManager.getGoingEvents(userId);
    return res.json({"events": events});
});

router.get("/getNotGoingEvents", async(req, res) => {
    const userId = req.query.userId;
    const events = await firestoreEventManager.getNotGoingEvents(userId);
    return res.json({"events": events});
});

router.get("/getMaybeEvents", async(req, res) => {
    const userId = req.query.userId;
    const events = await firestoreEventManager.getMaybeEvents(userId);
    return res.json({"events": events});
});

router.get("/getNotRepliedInvitedEvents", async(req, res) => {
    const userId = req.query.userId;
    const events = await firestoreEventManager.getNotRepliedInvitedEvents(userId);
    return res.json({"events": events});
});

router.get("/getCalendarEvents", async(req, res) => {
    const userId = req.query.userId;
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.startDate);
    endDate.setMonth(startDate.getMonth()+1);

    const goingEvents = await firestoreEventManager.getGoingEventsTimeRange(userId, startDate, endDate);
    const maybeEvents = await firestoreEventManager.getMaybeEventsTimeRange(userId, startDate, endDate);
    const yourEvents = await firestoreEventManager.getYourEventsTimeRange(userId, startDate, endDate);
    
    res.json({
        calendarGoingEvents: goingEvents,
        calendarMaybeEvents: maybeEvents,
        calendarYourEvents: yourEvents
    })
})

router.post("/setGoing", (req, res) => {
    const userId = req.query.userId;
    const eventId = req.body.eventId;
    const going = req.body.going;

    if(userId == undefined || eventId == undefined || going == undefined){
        res.sendStatus(400); // Bad request
        return;
    }

    if(going){
        firestoreEventManager.addGoingUser(userId, eventId);
    }
    else{
        firestoreEventManager.removeGoingUser(userId, eventId);
    }

    res.sendStatus(200);
});

router.post("/setMaybe", (req, res) => {
    const userId = req.query.userId;
    const eventId = req.body.eventId;
    const maybe = req.body.maybe;

    if(userId == undefined || eventId == undefined || maybe == undefined){
        res.sendStatus(400); // Bad request
        return;
    }

    if(maybe){
        firestoreEventManager.addMaybeUser(userId, eventId);
    }
    else{
        firestoreEventManager.removeMaybeUser(userId, eventId);
    }

    res.sendStatus(200);
});

router.post("/setNotGoing", (req, res) => {
    const userId = req.query.userId;
    const eventId = req.body.eventId;
    const notGoing = req.body.notGoing;

    if(userId == undefined || eventId == undefined || notGoing == undefined){
        res.sendStatus(400); // Bad request
        return;
    }

    if(notGoing){
        firestoreEventManager.addNotGoingUser(userId, eventId);
    }
    else{
        firestoreEventManager.removeNotGoingUser(userId, eventId);
    }

    res.sendStatus(200);
});

router.post("/inviteToEvent", (req, res) => {
    const eventId = req.body.eventId;
    const invitedUsers = req.body.invitedUsers;

    firestoreEventManager.inviteToEvent(eventId, invitedUsers);

    res.sendStatus(200);
});

router.post("/createEvent", (req, res) => {
    const userId = req.query.userId;
    let eventId = "";
    if(req.body.restricted){
        eventId = "private-" + nextId();
    }
    else{
        eventId = "public-" + nextId();
    }

    const newEvent = new Event(
        eventId, 
        req.body.title, 
        req.body.location, 
        new Date(req.body.startTime),
        new Date(req.body.endTime),
        req.body.tags, 
        req.body.description, 
        req.body.restricted,
        req.body.imageType,
        userId);
    
    firestoreEventManager.addEvent(userId, newEvent, req.body.createForGroups)

    res.send({'eventId': eventId});
});

module.exports = router;