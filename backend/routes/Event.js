const router = require("express").Router();
const { body } = require("express-validator");
const admin = require("../middleware/admin");
const EventController = require("../controllers/eventController");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");


router.get("/", allowAny(leader), (req, res) => {
  EventController.getEvents(req, res);
}); 



module.exports = router;
