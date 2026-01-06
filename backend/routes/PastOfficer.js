const router = require("express").Router();
const { body } = require('express-validator');
const PastOfficerController = require("../controllers/pastOfficerController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");









// router.get("/filter",  authorized,(req, res) => {
//     PastOfficerController.filterOfficers(req, res);
// });  




router.get("/filter", allowAny(admin,leader),(req, res) => {
    console.log("Getting Officers");
    
    PastOfficerController.filterOfficersAndNCOs(req, res);
});

router.get("/", allowAny(admin,leader),(req, res) => {
    console.log("Getting Officers");
    
    PastOfficerController.getOfficers(req, res);
});



router.get("/:id", allowAny(admin,leader), (req, res) => {
    PastOfficerController.getOfficer(req, res);
});



 
 


module.exports = router;
