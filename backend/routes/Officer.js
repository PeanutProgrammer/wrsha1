const router = require("express").Router();
const { body } = require('express-validator');
const OfficerController = require("../controllers/officerController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");


router.post("/",shuoonOfficers,
    body("name")
        .isString().withMessage("Please enter a valid name")
        .isLength({ min: 3, max: 30 }).withMessage("Name should be more than 3 characters and no longer than 30 characters"),
    body("join_date")
        .isDate(format = "yyyy-MM-DD").withMessage("Please enter a valid date"),
    body("department")
        .isString().withMessage("Please enter a valid department"),
    body("mil_id")
        .isNumeric().withMessage("Please enter a valid Military ID"),
    body("rank")
        .isString().withMessage("Please enter a valid rank"),
        body("department")
        .isString().withMessage("Please enter a valid department number") ,
    (req, res) => {
            OfficerController.createOfficer(req, res);
        }
);


router.put("/:id", admin,
    body("mil_id")
    .isString   (),
    body("rank")
    .isString(),
    body("name")
    .isString(),
    body("department")
    .isString(),
    body("join_date")
    .isDate(),  (req, res) => {
    OfficerController.updateOfficer(req, res);
    console.log("BODY RECEIVED:", req.body);

});

router.delete("/history/:id", authorized,(req, res) => {
    OfficerController.deleteHistory(req, res);
})


router.delete("/:mil_id", admin,  (req, res) => {
    OfficerController.deleteOfficer(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    OfficerController.filterOfficers(req, res);
});  




router.get("/", admin,(req, res) => {
    console.log("Getting Officers");
    
    OfficerController.getOfficers(req, res);
});

router.get("/tmam/:id", admin, (req,res) => {
    OfficerController.getOfficerTmamDetails(req,res);
});

router.get("/tmam", admin, (req,res) => {
    OfficerController.getOfficersTmam(req,res);
});




router.get("/log", admin, (req,res) => {
    OfficerController.getOfficersTmam(req,res);
});

router.get("/:id", admin, (req, res) => {
    OfficerController.getOfficer(req, res);
});



 
 


module.exports = router;
