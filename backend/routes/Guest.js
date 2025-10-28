const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const GuestController = require("../controllers/guestController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");

router.post("/", 
    // Add custom validation middleware for logical checks
    shuoonSarya,
    body("name")
        .isString().withMessage("من فضلك أدخل اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),

    // Validate 'visit_start' and 'visit_end' dates
    body("visit_start")
        .isDate().withMessage("من فضلك أدخل تاريخ بدء صحيح (YYYY-MM-DD)")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ بدء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isAfter(req.body.visit_end)) {
                throw new Error("تاريخ بدء الخبرة يجب أن يكون قبل تاريخ الانتهاء.");
            }
            return true;
        }),

    body("visit_end")
        .isDate().withMessage("من فضلك أدخل تاريخ انتهاء صحيح (YYYY-MM-DD)")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isBefore(req.body.visit_start)) {
                throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بعد تاريخ البدء.");
            }
            return true;
        }),

    // Validate 'visit_to'
    body("visit_to")
        .isString().withMessage("من فضلك أدخل اسم ضابط صحيح")
        .isLength({ min: 3 }).withMessage("اسم الضابط  يجب أن تكون على الأقل 3 أحرف"),

    // Validate 'reason'
    body("reason")
        .isString().withMessage("من فضلك أدخل سبب الزيارة صحيح"),

    // Handle validation results
    (req, res) => {
        // Get validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Return a response with errors if validation fails
            return res.status(400).json({ errors: errors.array() });
        }

        // If validation passes, proceed to controller action
        GuestController.createGuest(req, res);
    }
);

router.put("/:id", admin,
       body("name")
        .isString().withMessage("من فضلك أدخل اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),

    // Validate 'visit_start' and 'visit_end' dates
    body("visit_start")
        .isDate().withMessage("من فضلك أدخل تاريخ بدء صحيح (YYYY-MM-DD)")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ بدء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isAfter(req.body.visit_end)) {
                throw new Error("تاريخ بدء الخبرة يجب أن يكون قبل تاريخ الانتهاء.");
            }
            return true;
        }),

    body("visit_end")
        .isDate().withMessage("من فضلك أدخل تاريخ انتهاء صحيح (YYYY-MM-DD)")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isBefore(req.body.visit_start)) {
                throw new Error("تاريخ انتهاء الخبرة يجب أن يكون بعد تاريخ البدء.");
            }
            return true;
        }),

    // Validate 'visit_to'
    body("visit_to")
        .isString().withMessage("من فضلك أدخل اسم ضابط صحيح")
        .isLength({ min: 3 }).withMessage("اسم الضابط  يجب أن تكون على الأقل 3 أحرف"),

    // Validate 'reason'
    body("reason")
        .isString().withMessage("من فضلك أدخل سبب الزيارة صحيح"),

    // Handle validation results
    (req, res) => {
        // Get validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Return a response with errors if validation fails
            return res.status(400).json({ errors: errors.array() });
        }

        // If validation passes, proceed to controller action
        GuestController.updateGuest(req, res);
        console.log("BODY RECEIVED:", req.body);
    }
);




router.delete("/:id", admin,  (req, res) => {
    GuestController.deleteGuest(req, res);
});







    // Get all guests
router.get("/", admin,(req, res) => {
    GuestController.getGuests(req, res);
});




router.get("/:id", admin, (req, res) => {
    GuestController.getGuest(req, res);
});



 
 


module.exports = router;
