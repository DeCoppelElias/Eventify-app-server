const express = require('express');
const FirestoreTagManager = require('../firestoreManagers/FirestoreTagManager');
const {default:nextId} = require("react-id-generator");
const router = express.Router();

const firestoreTagManager = new FirestoreTagManager();

router.get("/getTags", async(req, res) => {
    const tags = await firestoreTagManager.getTags();
    res.json({"tags": tags})
});

module.exports = router;