const express = require('express');
const FirestoreGroupManager = require('../firestoreManagers/FirestoreGroupManager');
const {default:nextId} = require("react-id-generator");
const router = express.Router();
const Group = require("../datatypes/Group");

const firestoreGroupManager = new FirestoreGroupManager();

router.get("/getPublicGroups", async(req, res) => {
    const groups = await firestoreGroupManager.getPublicGroups();
    return res.json({"groups": groups})
});

router.get("/getYourGroups", async(req, res) => {
    const userId = req.query.userId;
    const groups = await firestoreGroupManager.getYourGroups(userId);
    return res.json({"groups": groups})
});

router.get("/getAdministratorGroups", async(req, res) => {
    const userId = req.query.userId;
    const groups = await firestoreGroupManager.getAdministratorGroups(userId);
    return res.json({"groups": groups})
});

router.get("/getSubscribedGroups", async(req, res) => {
    const userId = req.query.userId;
    const groups = await firestoreGroupManager.getSubscribedGroups(userId);
    return res.json({"groups": groups})
});

router.get("/getNotRepliedInvitedGroups", async(req, res) => {
    const userId = req.query.userId;
    const groups = await firestoreGroupManager.getNotRepliedInvitedGroups(userId);
    return res.json({"groups": groups})
});

router.get("/getGroup", async(req, res) => {
    const groupId = req.query.groupId;
    const group = await firestoreGroupManager.getGroup(groupId);
    return res.json({"group": group})
});

router.get("/getInvitedUsers", async(req, res) => {
    const groupId = req.query.groupId;
    const group = await firestoreGroupManager.getGroup(groupId);
    const invitedUsers = group.invitedUsers;
    return res.json({invitedUsers: invitedUsers})
});

router.post("/inviteToGroup", async(req, res) => {
    const groupId = req.body.groupId;
    const invitedUsers = req.body.invitedUsers;
    await firestoreGroupManager.inviteToGroup(invitedUsers, groupId);
    return res.sendStatus(200);
});

router.post("/createGroup", async(req, res) => {
    const userId = req.query.userId;
    let groupId = "";
    if(req.body.restricted){
        groupId = "private-" + "group-" + nextId();
    }
    else{
        groupId = "public-" + "group-" + nextId();
    }

    const newGroup = new Group(
        groupId, 
        req.body.title, 
        req.body.description, 
        req.body.tags,
        req.body.restricted,
        req.body.imageType,
        userId);
    
    firestoreGroupManager.addGroup(userId, newGroup);
    
    return res.json({"groupId" : groupId});
});

router.post("/subscribeToGroup", async(req, res) => {
    const userId = req.query.userId;
    const groupId = req.body.groupId;
    await firestoreGroupManager.subscribeToGroup(userId, groupId);

    return res.sendStatus(200); 
});

router.post("/unsubscribeFromGroup", async(req, res) => {
    const userId = req.query.userId;
    const groupId = req.body.groupId;
    await firestoreGroupManager.unsubscribeFromGroup(userId, groupId);

    return res.sendStatus(200); 
});


module.exports = router;