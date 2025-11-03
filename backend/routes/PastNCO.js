const router = require("express").Router();
const { body } = require('express-validator');
const PastNCOController = require("../controllers/pastNCOController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");









// router.get("/filter",  authorized,(req, res) => {
//     PastNCOController.filterOfficers(req, res);
// });  




router.get("/", admin,(req, res) => {
    console.log("Getting Officers");
    
    PastNCOController.getNCOs(req, res);
});



router.get("/:id", admin, (req, res) => {
    PastNCOController.getNCO(req, res);
});



 
 


module.exports = router;
