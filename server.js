const express = require('express')
const Event = require('../client/src/datatypes/Event');
const Group = require('../client/src/datatypes/Group');

const app = express()

const testEvent = new Event("test event", 
  "at the tree",
  "at 4 pm",
  "it gon be lit");
const events = [testEvent];

const testGroup = new Group(title="test group",
  description="this is a test group",
  public_group=true,
  tags=["testtag1", "testtag2"]);
testGroup.AddEvents([testEvent]);
const groups = [testGroup];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api/getEvents", (req, res) => {
    res.json({"events": events})
})

app.get("/api/getGroups", (req, res) => {
  res.json({"groups": groups})
})

app.post("/api/createEvent", async (req, res) => {
    const newEvent = req.body
    events.push(newEvent);

    res.send('Data Received');
})

app.listen(5000, () => {console.log("Server started on port 5000")})