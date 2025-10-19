const router = require("express").Router();
const { body } = require('express-validator');
const SoldierController = require("../controllers/soldierController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");


router.post("/", shuoonSarya,
    body("name")
        .isString().withMessage("Please enter a valid name")
        .isLength({ min: 3, max: 30 }).withMessage("Name should be more than 3 characters and no longer than 30 characters"),
    body("join_date")
        .isDate(format = "yyyy-MM-DD").withMessage("Please enter a valid date"),
    body("end_date")
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
            SoldierController.createSoldier(req, res);
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
    .isDate(),
    body("end_date")
    .isDate(),  (req, res) => {
    SoldierController.updateSoldier(req, res);
    console.log("BODY RECEIVED:", req.body);

});

router.delete("/history/:id", authorized,(req, res) => {
    SoldierController.deleteHistory(req, res);
})


router.delete("/:mil_id", admin,  (req, res) => {
    SoldierController.deleteSoldier(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    SoldierController.filterSoldiers(req, res);
});  




router.get("/", admin,(req, res) => {
    SoldierController.getSoldiers(req, res);
});

router.get("/tmam/:id", admin, (req,res) => {
    SoldierController.getSoldierTmamDetails(req,res);
});

router.get("/tmam", admin, (req,res) => {
    SoldierController.getSoldiersTmam(req,res);
});




router.get("/log", admin, (req,res) => {
    SoldierController.getSoldiersTmam(req,res);
});

router.get("/:id", admin, (req, res) => {
    SoldierController.getSoldier(req, res);
});



 
 


module.exports = router;
