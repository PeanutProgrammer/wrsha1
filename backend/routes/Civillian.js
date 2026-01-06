const router = require("express").Router();
const { body } = require('express-validator');
const CivillianController = require("../controllers/civillianController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const moment = require('moment');
const gate = require("../middleware/gate");
const securityHead = require("../middleware/securityHead");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");


router.post("/", shuoonOfficers,
    body("name")
          .isString().withMessage("من فضلك أدخل اسم صحيح")
          .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),
  
    body("join_date")
        .isDate(format = "yyyy-MM-DD").withMessage("من فضلك أدخل تاريخ ضم صحيح (YYYY-MM-DD)"),
    body("department")
        .isString().withMessage("من فضلك أدخل ورشة / فرع صحيح "),
    // Validate 'nationalID'
    body("nationalID")
        .isString().withMessage("من فضلك أدخل رقم الهوية الوطنية صحيح"),

    body("telephone_number")
        .isMobilePhone('ar-EG').withMessage("من فضلك أدخل رقم هاتف صحيح"),
    body("address")
        .isString().withMessage("من فضلك أدخل عنوان صحيح"),
    body("dob")
         .isDate(format = "yyyy-MM-DD").withMessage("من فضلك أدخل تاريخ صحيح للميلاد"),
    (req, res) => {
            CivillianController.createCivillian(req, res);
        }
);


router.put("/:id", admin,
    body("name")
          .isString().withMessage("من فضلك أدخل اسم صحيح")
          .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),
  
    body("join_date")
        .isDate(format = "yyyy-MM-DD").withMessage("من فضلك أدخل تاريخ ضم صحيح (YYYY-MM-DD)"),
    body("department")
        .isString().withMessage("من فضلك أدخل قسم صحيح"),
    // Validate 'nationalID'
    body("nationalID")
        .isNumeric().withMessage("من فضلك أدخل رقم الهوية الوطنية صحيح"),

    body("telephone_number")
        .isMobilePhone('ar-EG').withMessage("من فضلك أدخل رقم هاتف صحيح"),
    body("address")
        .isString().withMessage("من فضلك أدخل عنوان صحيح"),
    body("dob")
         .isDate(format = "yyyy-MM-DD").withMessage("من فضلك أدخل تاريخ صحيح للميلاد"),
           (req, res) => {
    CivillianController.updateCivillian(req, res);
    console.log("BODY RECEIVED:", req.body);

});




router.delete("/:mil_id", admin,  (req, res) => {
    CivillianController.deleteCivillian(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    CivillianController.filterCivillians(req, res);
});  




router.get("/", gate,(req, res) => {
    CivillianController.getCivillians(req, res);
});

router.get("/tmam/:id", admin, (req,res) => {
    CivillianController.getCivillianTmamDetails(req,res);
});

router.get("/tmam", allowAny(securityHead,leader), (req,res) => {
    CivillianController.getCivilliansTmam(req,res);
});




router.get("/log", admin, (req,res) => {
    CivillianController.getCivilliansTmam(req,res);
});

router.get("/absent", gate, (req, res) => {
    CivillianController.getAbsentCivillians(req, res);
});

router.get("/current", gate, (req, res) => {
    CivillianController.getCurrentCivillians(req, res);
});

router.get("/:id", admin, (req, res) => {
    CivillianController.getCivillian(req, res);
});



 
 


module.exports = router;
