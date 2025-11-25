const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const ExpertController = require("../controllers/expertController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const gate = require("../middleware/gate");
const allowAny = require("../middleware/allowAny");
const securityHead = require("../middleware/securityHead");

router.post("/", 
    // Add custom validation middleware for logical checks
    admin,
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

    // Validate 'passport_number'
    body("passport_number")
        .isString().withMessage("من فضلك أدخل رقم جواز السفر صحيح")
        .isLength({ min: 6 }).withMessage("رقم جواز السفر يجب أن يكون على الأقل 6 أحرف"),

    // Validate 'nationalID'
    body("nationalID")
        .isNumeric().withMessage("من فضلك أدخل رقم الهوية الوطنية صحيح"),

    // Validate 'company_name'
    body("company_name")
        .isString().withMessage("من فضلك أدخل اسم الشركة صحيح"),

    // Validate 'security_clearance_number'
    body("security_clearance_number")
        .isString().withMessage("من فضلك أدخل رقم التصديق الأمني صحيح"),

    body("department")
        .isString().withMessage("من فضلك أدخل الورشة / الفرع بشكل صحيح"),

    // Handle validation results
    (req, res) => {
        // Get validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Return a response with errors if validation fails
            return res.status(400).json({ errors: errors.array() });
        }

        // If validation passes, proceed to controller action
        ExpertController.createExpert(req, res);
    }
);

router.put("/:id", admin,
    // Validate National ID (numeric)
    body("nationalID")
        .isNumeric().withMessage("من فضلك أدخل رقم الهوية الوطنية صحيح"),

    // Validate valid_from and valid_through dates with custom validation
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

    // Validate name (should be a string between 3 and 30 characters)
    body("name")
        .isString().withMessage("من فضلك أدخل اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),

    // Validate passport number (ensure it's a valid passport number)
    body("passport_number")
        .isString().withMessage("من فضلك أدخل رقم جواز السفر صحيح")
        .isLength({ min: 6 }).withMessage("رقم جواز السفر يجب أن يكون على الأقل 6 أحرف"),

    // Validate company name (should be a string)
    body("company_name")
        .isString().withMessage("من فضلك أدخل اسم الشركة صحيح"),

    // Validate security clearance number (should be a string)
    body("security_clearance_number")
        .isString().withMessage("من فضلك أدخل رقم التصديق الأمني صحيح"),

    body("department")
        .isString().withMessage("من فضلك أدخل الورشة / الفرع بشكل صحيح"),

    // Handle validation results
    (req, res) => {
        // Get validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Return a response with errors if validation fails
            return res.status(400).json({ errors: errors.array() });
        }

        // If validation passes, proceed to controller action
        ExpertController.updateExpert(req, res);
        console.log("BODY RECEIVED:", req.body);
    }
);




router.delete("/:nationalID", admin,  (req, res) => {
    ExpertController.deleteExpert(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    ExpertController.filterExperts(req, res);
});  




router.get("/", allowAny(gate,securityHead),(req, res) => {
    ExpertController.getExperts(req, res);
});



router.get("/:id", securityHead, (req, res) => {
    ExpertController.getExpert(req, res);
});



 
 


module.exports = router;
