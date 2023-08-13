const express = require('express');
const eventApi = require('./eventApi');
const groupApi = require('./groupApi');
const postApi = require('./postApi');
const userApi = require('./userApi');
const tagApi = require('./tagApi');
const TestSetup = require('../TestSetup');
const middleware = require('../middleware');
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
app.use(middleware.decodeToken);
app.use("/api/events", eventApi);
app.use("/api/groups", groupApi);
app.use("/api/posts", postApi);
app.use("/api/users", userApi);
app.use("/api/tags", tagApi);

const testSetup = new TestSetup();
testSetup.initialize();

app.get('/', (req, res) => {
  res.send('App is running..')
});

app.post("/api/uploadEventImage", uploadEventImage.single("file") , (req, res) => {
    
})

app.post("/api/uploadGroupImage", uploadGroupImage.single("file"), (req, res) => {
    
})

app.listen(5000, () => {console.log("server started on port 5000")});