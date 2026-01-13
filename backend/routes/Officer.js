const router = require("express").Router();
const { body } = require('express-validator');
const OfficerController = require("../controllers/officerController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const gate = require("../middleware/gate");
const security = require("../middleware/securityHead");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");


router.post("/", shuoonOfficers,
    body("name")
        .isString().withMessage("يرجى إدخال اسم صحيح")
        .isLength({ min: 3, max: 50 }).withMessage("اسم الضابط يجب أن يكون أكثر من 3 حروف ولا يتجاوز 50 حرفًا"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ ضم صحيح بصيغة yyyy-MM-DD"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),
    body("mil_id")
        .isString().withMessage("يرجى إدخال رقم عسكري صحيح"),
    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("department")
        .isString().withMessage("يرجى إدخال الفرع أو الورشة بشكل صحيح"),
    body("height")
        .isNumeric().withMessage("يرجى إدخال طول صحيح"),
    body("weight")
        .isNumeric().withMessage("يرجى إدخال وزن صحيح"),
    body("dob")
        .isDate().withMessage("يرجى إدخال تاريخ ميلاد صحيح"),
    body("seniority_number")
        .isString().withMessage("يرجى إدخال رقم الأقدمية بشكل صحيح"),
    body("attached")
        .optional()
        .isBoolean().withMessage("يرجى إدخال قيمة صحيحة للملحق"),
    (req, res) => {
        OfficerController.createOfficer(req, res);
    }
);


router.put("/:id", shuoonOfficers,

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
    body("attached")
        .optional()
        .isBoolean().withMessage("يرجى إدخال قيمة صحيحة للملحق"),
    (req, res) => {
        OfficerController.updateOfficer(req, res);
        console.log("BODY RECEIVED:", req.body);
    }
);



router.delete("/:mil_id", admin,  (req, res) => {
    OfficerController.deleteOfficer(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    OfficerController.filterOfficers(req, res);
});  


router.get("/daily-summary", allowAny(security,leader,shuoonOfficers), (req, res) => {
    OfficerController.getDailySummary(req, res);
});


router.get("/", allowAny(shuoonOfficers),(req, res) => {
    console.log("Getting Officers");
    
    OfficerController.getOfficers(req, res);
});

router.get("/tmam/:id", shuoonOfficers, (req,res) => {
    OfficerController.getOfficerTmamDetails(req,res);
});

router.get("/tmam", (allowAny(security,shuoonOfficers,leader)), (req,res) => {
    OfficerController.getOfficersTmam(req,res);
});

router.get("/vacations", shuoonOfficers, (req,res) => {
    OfficerController.getVacationingOfficers(req,res);
});

router.get("/missions", shuoonOfficers, (req,res) => {
    OfficerController.getMissionOfficers(req,res);
});

router.get("/courses", shuoonOfficers, (req,res) => {
    OfficerController.getCourseOfficers(req,res);
});




router.get("/log", admin, (req,res) => {
    OfficerController.getOfficersTmam(req,res);
});

router.get("/current", gate, (req, res) => {
    OfficerController.getCurrentOfficers(req, res);
});

router.get("/absent", gate, (req, res) => {
    OfficerController.getAbsentOfficers(req, res);
});

router.get("/:id", shuoonOfficers, (req, res) => {
    OfficerController.getOfficer(req, res);
});



 
 


module.exports = router;
