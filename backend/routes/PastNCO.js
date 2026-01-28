const router = require("express").Router();
const PastNCOController = require("../controllers/pastNCOController"); 
const admin = require("../middleware/admin");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");






 

// router.get("/filter",  authorized,(req, res) => {
//     PastNCOController.filterOfficers(req, res);
// });  




router.get("/", allowAny(leader),(req, res) => {
    console.log("Getting Officers");
    
    PastNCOController.getNCOs(req, res); 
});



router.get("/:id", allowAny(leader), (req, res) => {
    PastNCOController.getNCO(req, res);
});



 
 


module.exports = router;
