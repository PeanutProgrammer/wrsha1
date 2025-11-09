const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const gate = require("../middleware/gate");
const shuoonSarya = require("../middleware/shuoonSarya");
const CivillianLogController = require("../controllers/civillianLogController");
const moment = require("moment");

// Arrival route (already exists)
router.post("/", gate,
    body("civillianID")
        .isNumeric().withMessage("من فضلك أدخل اسم مدني صحيح"),
    body("leaveTypeID")
        .isNumeric().withMessage("من فضلك أدخل نوع عودة صحيح"),
    body("loggerID")
        .isNumeric(),
    body("event_type")
        .isAlphanumeric('ar-EG'),
    body("event_time")
        .custom((value) => {
            if (!(value instanceof Date)) {
                if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                    throw new Error("تاريخ ووقت العودة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss).");
                }
            } else {
                if (!moment(value).isValid()) {
                    throw new Error("تاريخ ووقت العودة يجب أن يكون بتاريخ صحيح.");
                }
            }
            return true;
        }),
    (req, res) => {
        CivillianLogController.createArrival(req, res);
    }
);

// Departure route (new route for departure)
router.post("/departure", gate,
    body("civillianID")
        .isNumeric().withMessage("من فضلك أدخل اسم مدني صحيح"),
    body("leaveTypeID")
        .isNumeric().withMessage("من فضلك أدخل نوع عودة صحيح"),
    body("loggerID")
        .isNumeric(),
    body("event_type")
        .isAlphanumeric('ar-EG'),
    body("event_time")
        .custom((value) => {
            if (!(value instanceof Date)) {
                if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                    throw new Error("تاريخ ووقت الخروج يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss).");
                }
            } else {
                if (!moment(value).isValid()) {
                    throw new Error("تاريخ ووقت الخروج يجب أن يكون بتاريخ صحيح.");
                }
            }
            return true;
        }),
    // New validation for start_date, end_date, and destination
    body("start_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ ووقت الخروج يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isAfter(req.body.end_date)) {
                throw new Error("تاريخ ووقت الخروج يجب أن يكون قبل تاريخ الانتهاء.");
            }
            return true;
        }),
    body("end_date")
        .custom((value, { req }) => {
            if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                throw new Error("تاريخ ووقت العودة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
            }
            if (moment(value).isBefore(req.body.start_date)) {
                throw new Error("تاريخ ووقت العودة يجب أن يكون بعد تاريخ البدء.");
            }
            return true;
        }),
    body("destination")
        .isString().withMessage("من فضلك أدخل الوجهة.").optional(),

    (req, res) => {
        CivillianLogController.createDeparture(req, res);
    }
);




router.get("/", admin,(req, res) => {
    CivillianLogController.getCivilliansLog(req, res);
});




 
 


module.exports = router;
