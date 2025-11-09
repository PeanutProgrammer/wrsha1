const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const gate = require("../middleware/gate");
// const shuoonSarya = require("../middleware/shuoonSarya");
const ExpertLogController = require("../controllers/expertLogController");
const moment = require("moment");

// Arrival route (already exists)
router.post("/", gate,
    body("expertID")
        .isNumeric().withMessage("من فضلك أدخل اسم خبير صحيح"),
    body("department_visited")
        .isString().withMessage("من فضلك أدخل الورشة / الفرع الصحيحة"),
    body("loggerID")
        .isNumeric(),
    body("start_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss).");
            }
            if (moment(value).isAfter(req.body.end_date)) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون قبل تاريخ الخروج.");
            }
            return true;
        }),
    body("end_date")
        .optional() // Optional field
            .custom((value, { req }) => {
                // If value is null, it's valid
                if (value === null) {
                    return true;
                }
                
                // If not null, validate as a date
                if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                    throw new Error("تاريخ ووقت انتهاء الزيارة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss).");
                }
        
                // If visit_end is before visit_start, throw an error
                if (moment(value).isBefore(req.body.visit_start)) {
                    throw new Error("تاريخ انتهاء الزيارة يجب أن يكون بعد تاريخ البدء.");
                }
        
                return true;
            }),
    (req, res) => {
        ExpertLogController.createArrival(req, res);
    }
);

// Departure route (new route for departure)
router.post("/departure", gate,
    body("expertID")
        .isNumeric().withMessage("من فضلك أدخل اسم خبير صحيح"),
    body("department_visited")
        .isString().withMessage("من فضلك أدخل الورشة / الفرع الصحيحة"),
    body("loggerID")
        .isNumeric(),
    body("start_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss).");
            }
            if (moment(value).isAfter(req.body.end_date)) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون قبل تاريخ الخروج.");
            }
            return true;
        }),
    body("end_date")
        .optional() // Optional field
            .custom((value, { req }) => {
                // If value is null, it's valid
                if (value === null) {
                    return true;
                }
                
                // If not null, validate as a date
                if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                    throw new Error("تاريخ ووقت انتهاء الزيارة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss).");
                }
        
                // If visit_end is before visit_start, throw an error
                if (moment(value).isBefore(req.body.visit_start)) {
                    throw new Error("تاريخ انتهاء الزيارة يجب أن يكون بعد تاريخ البدء.");
                }
        
                return true;
            }),

    (req, res) => {
        ExpertLogController.createDeparture(req, res);
    }
);

router.put("/end-visit/:id", gate, (req, res) => {
    // Call the endVisit function from the controller
    ExpertLogController.endVisit(req, res);
});



router.get("/current", gate,(req, res) => {
    ExpertLogController.getExpertsWithNullEndDate(req, res);
});

router.get("/", admin,(req, res) => {
    ExpertLogController.getExpertsLog(req, res);
});




 
 


module.exports = router;
