const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");
const soldierLogController = require("../controllers/soldierLogController");




router.get("/", admin,(req, res) => {
    soldierLogController.getSoldiersLog(req, res);
});




 
 


module.exports = router;
