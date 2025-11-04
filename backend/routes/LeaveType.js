const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const gate = require("../middleware/gate");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const LeaveTypeController = require("../controllers/leaveTypeController");


router.get("/", gate, (req, res) => {
    LeaveTypeController.getLeaveTypes(req, res);
});


module.exports = router;