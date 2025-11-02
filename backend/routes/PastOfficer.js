const router = require("express").Router();
const { body } = require('express-validator');
const PastOfficerController = require("../controllers/pastOfficerController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");









// router.get("/filter",  authorized,(req, res) => {
//     PastOfficerController.filterOfficers(req, res);
// });  




router.get("/", admin,(req, res) => {
    console.log("Getting Officers");
    
    PastOfficerController.getOfficers(req, res);
});



router.get("/:id", admin, (req, res) => {
    PastOfficerController.getOfficer(req, res);
});



 
 


module.exports = router;
