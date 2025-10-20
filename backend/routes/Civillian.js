const router = require("express").Router();
const { body } = require('express-validator');
const CivillianController = require("../controllers/civillianController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");


router.post("/", shuoonOfficers,
    body("name")
        .isString().withMessage("Please enter a valid name")
        .isLength({ min: 3, max: 30 }).withMessage("Name should be more than 3 characters and no longer than 30 characters"),
    body("join_date")
        .isDate(format = "yyyy-MM-DD").withMessage("Please enter a valid date"),
    body("department")
        .isString().withMessage("Please enter a valid department"),
    body("nationalID")
        .isNumeric().withMessage("Please enter a valid National ID"),
    body("telephone_number")
        .isMobilePhone('ar-EG').withMessage("Please enter a valid Telephone Number"),
    body("address")
        .isString().withMessage("Please enter a valid address") ,
    body("dob")
         .isDate(format = "yyyy-MM-DD").withMessage("Please enter a valid date"),
    (req, res) => {
            CivillianController.createCivillian(req, res);
        }
);


router.put("/:id", admin,
    body("nationalID")
    .isString   (),
    body("name")
    .isString(),
    body("department")
    .isString(),
    body("join_date")
    .isDate(),
    body("dob")
    .isDate(),
    body("telephone_number")
    .isMobilePhone(),
    body("address")
    .isString(),  (req, res) => {
    CivillianController.updateCivillian(req, res);
    console.log("BODY RECEIVED:", req.body);

});




router.delete("/:mil_id", admin,  (req, res) => {
    CivillianController.deleteCivillian(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    CivillianController.filterCivillians(req, res);
});  




router.get("/", admin,(req, res) => {
    CivillianController.getCivillians(req, res);
});

router.get("/tmam/:id", admin, (req,res) => {
    CivillianController.getCivillianTmamDetails(req,res);
});

router.get("/tmam", admin, (req,res) => {
    CivillianController.getCivilliansTmam(req,res);
});




router.get("/log", admin, (req,res) => {
    CivillianController.getCivilliansTmam(req,res);
});

router.get("/:id", admin, (req, res) => {
    CivillianController.getCivillian(req, res);
});



 
 


module.exports = router;
