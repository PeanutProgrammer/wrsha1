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
        .isNumeric().withMessage("من فضلك أدخل الورشة / الفرع الصحيحة"),
    body("loggerID")
        .isNumeric(),
    body("start_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isAfter(req.body.end_date)) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون قبل تاريخ الخروج.");
            }
            return true;
        }),
    body("end_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ ووقت الخروج يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isBefore(req.body.start_date)) {
                throw new Error("تاريخ ووقت الخروج يجب أن يكون بعد تاريخ الدخول.");
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
        .isNumeric().withMessage("من فضلك أدخل الورشة / الفرع الصحيحة"),
    body("loggerID")
        .isNumeric(),
    body("start_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isAfter(req.body.end_date)) {
                throw new Error("تاريخ ووقت الدخول يجب أن يكون قبل تاريخ الخروج.");
            }
            return true;
        }),
    body("end_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ ووقت الخروج يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isBefore(req.body.start_date)) {
                throw new Error("تاريخ ووقت الخروج يجب أن يكون بعد تاريخ الدخول.");
            }
            return true;
        }),

    (req, res) => {
        ExpertLogController.createDeparture(req, res);
    }
);





router.get("/", admin,(req, res) => {
    ExpertLogController.getExpertsLog(req, res);
});




 
 


module.exports = router;
