const router = require("express").Router();
const { body } = require('express-validator');
const CivillianController = require("../controllers/civillianController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const moment = require('moment');


router.post("/", shuoonOfficers,
    body("name")
          .isString().withMessage("من فضلك أدخل اسم صحيح")
          .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),
  
      // Validate 'valid_from' and 'valid_through' dates
    body("valid_from")
          .isDate().withMessage("من فضلك أدخل تاريخ بدء صحيح (YYYY-MM-DD)")
          .custom((value, { req }) => {
              if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                  throw new Error("تاريخ بدء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
              }
              if (moment(value).isAfter(req.body.valid_through)) {
                  throw new Error("تاريخ بدء الخبرة يجب أن يكون قبل تاريخ الانتهاء.");
              }
              return true;
          }),
    body("valid_through")
          .isDate().withMessage("من فضلك أدخل تاريخ انتهاء صحيح (YYYY-MM-DD)")
          .custom((value, { req }) => {
              if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                  throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
              }
              if (moment(value).isBefore(req.body.valid_from)) {
                  throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بعد تاريخ البدء.");
              }
              return true;
          }),
    // Validate 'security_clearance_number'
    body("security_clearance_number")
        .isString().withMessage("من فضلك أدخل رقم التصديق الأمني صحيح"),
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
            CivillianController.createCivillian(req, res);
        }
);


router.put("/:id", admin,
    body("name")
          .isString().withMessage("من فضلك أدخل اسم صحيح")
          .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),
  
      // Validate 'valid_from' and 'valid_through' dates
    body("valid_from")
          .isDate(format = "yyyy-MM-DD").withMessage("من فضلك أدخل تاريخ بدء صحيح (YYYY-MM-DD)")
          .custom((value, { req }) => {
              if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                  throw new Error("تاريخ بدء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
              }
              if (moment(value).isAfter(req.body.valid_through)) {
                  throw new Error("تاريخ بدء الخبرة يجب أن يكون قبل تاريخ الانتهاء.");
              }
              return true;
          }),
    body("valid_through")
          .isDate(format = "yyyy-MM-DD").withMessage("من فضلك أدخل تاريخ انتهاء صحيح (YYYY-MM-DD)")
          .custom((value, { req }) => {
              if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                  throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
              }
              if (moment(value).isBefore(req.body.valid_from)) {
                  throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بعد تاريخ البدء.");
              }
              return true;
          }),
    // Validate 'security_clearance_number'
    body("security_clearance_number")
        .isString().withMessage("من فضلك أدخل رقم التصديق الأمني صحيح"),
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
