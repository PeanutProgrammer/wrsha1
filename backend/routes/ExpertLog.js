const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
// const shuoonSarya = require("../middleware/shuoonSarya");
const ExpertLogController = require("../controllers/expertLogController");




router.get("/", admin,(req, res) => {
    ExpertLogController.getExpertsLog(req, res);
});




 
 


module.exports = router;
