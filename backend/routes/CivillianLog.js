const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");
const civillianLogController = require("../controllers/civillianLogController");




router.get("/", admin,(req, res) => {
    civillianLogController.getCivilliansLog(req, res);
});




 
 


module.exports = router;
