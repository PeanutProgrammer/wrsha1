const router = require("express").Router();
const { body } = require('express-validator');
const OfficerController = require("../controllers/officerController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");


router.post("/", shuoonOfficers,
    body("name")
        .isString().withMessage("يرجى إدخال اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("اسم الضابط يجب أن يكون أكثر من 3 حروف ولا يتجاوز 30 حرفًا"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ ضم صحيح بصيغة yyyy-MM-DD"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),
    body("mil_id")
        .isNumeric().withMessage("يرجى إدخال رقم عسكري صحيح"),
    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("department")
        .isString().withMessage("يرجى إدخال رقم الفرع أو الورشة بشكل صحيح"),
    body("height")
        .isNumeric().withMessage("يرجى إدخال طول صحيح"),
    body("weight")
        .isNumeric().withMessage("يرجى إدخال وزن صحيح"),
    body("dob")
        .isDate().withMessage("يرجى إدخال تاريخ ميلاد صحيح"),
    body("seniority_number")
        .isString().withMessage("يرجى إدخال رقم الأقدمية بشكل صحيح"),
    (req, res) => {
        OfficerController.createOfficer(req, res);
    }
);

router.put("/:id", admin,
    body("mil_id")
        .isString().withMessage("يرجى إدخال رقم عسكري صحيح"),
    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("name")
        .isString().withMessage("يرجى إدخال اسم الضابط"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ الضم بشكل صحيح"),
    body("height")
        .isNumeric().withMessage("يرجى إدخال طول صحيح"),
    body("weight")
        .isNumeric().withMessage("يرجى إدخال وزن صحيح"),
    body("dob")
        .isDate().withMessage("يرجى إدخال تاريخ الميلاد بشكل صحيح"),
    body("seniority_number")
        .isString().withMessage("يرجى إدخال رقم الأقدمية بشكل صحيح"),
    (req, res) => {
        OfficerController.updateOfficer(req, res);
        console.log("BODY RECEIVED:", req.body);
    }
);

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
