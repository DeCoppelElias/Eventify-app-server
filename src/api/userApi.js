const express = require('express');
const FirestoreUserManager = require('../firestoreManagers/FirestoreUserManager');
const {default:nextId} = require("react-id-generator");
const router = express.Router();
const User = require("../datatypes/User");
const admin = require('../config/firebase');

const firestoreUserManager = new FirestoreUserManager();

router.get("/getUsers", async(req, res) => {
    const users = await firestoreUserManager.getAllUsers();
    return res.json({"users": users});
});

router.post("/registerUserInternally", async(req, res) => {
    const userId = req.query.userId;
    await admin.auth().getUser(userId).then(function(userRecord){
        const user = new User(
            userRecord.uid, 
            userRecord.displayName, 
            userRecord.email);
        firestoreUserManager.addUser(user);
    }).catch(function (error){console.log('Error creating new user internally:', error);})
    res.sendStatus(200);
});

module.exports = router;