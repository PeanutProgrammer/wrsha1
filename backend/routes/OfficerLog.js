const router = require("express").Router();
const { body } = require("express-validator");
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const OfficerLogController = require("../controllers/officerLogController");
const gate = require("../middleware/gate");
const moment = require("moment");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");

// Arrival route (already exists)
router.post(
  "/",
  gate,
  body("officerID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("loggerID").isNumeric(),
  body("event_type").isAlphanumeric("ar-EG"),
  body("event_time").custom((value) => {
    if (!(value instanceof Date)) {
      if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        throw new Error(
          "تاريخ ووقت العودة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss)."
        );
      }
    } else {
      if (!moment(value).isValid()) {
        throw new Error("تاريخ ووقت العودة يجب أن يكون بتاريخ صحيح.");
      }
    }
    return true;
  }),
  (req, res) => {
    OfficerLogController.createArrival(req, res);
  }
);

// Departure route (new route for departure)
router.post(
  "/departure",
  gate,
  body("officerID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صحيح"),
 

  body("loggerID").isNumeric(),
  body("event_type").isAlphanumeric("ar-EG"),
  body("event_time").custom((value) => {
    if (!(value instanceof Date)) {
      if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        throw new Error(
          "تاريخ ووقت الخروج يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss)."
        );
      }
    } else {
      if (!moment(value).isValid()) {
        throw new Error("تاريخ ووقت الخروج يجب أن يكون بتاريخ صحيح.");
      }
    }
    return true;
  }),

  // The final handler
  (req, res) => {
    OfficerLogController.createDeparture(req, res);
  }
);

router.post(
  "/tmam",
  shuoonOfficers,
  body("officerID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("leaveTypeID").isNumeric().withMessage("من فضلك أدخل نوع عودة صحيح"),
  body("start_date").custom((value, { req }) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      throw new Error("تاريخ البدء يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
    }
    if (moment(value).isAfter(req.body.end_date)) {
      throw new Error("تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء.");
    }
    return true;
  }),
  body("end_date").custom((value, { req }) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      throw new Error(
        "تاريخ الانتهاء يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD)."
      );
    }
    if (moment(value).isBefore(req.body.start_date)) {
      throw new Error("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.");
    }
    return true;
  }),
  body("destination").isString().withMessage("من فضلك أدخل الوجهة."),
  body("remaining").isString().withMessage("من فضلك أدخل المتبقي.").optional(),
  body("duration").isString().withMessage("من فضلك أدخل المدة.").optional(),
  body("notes").isString().withMessage("من فضلك أدخل الملاحظات.").optional(),

  (req, res) => {
    OfficerLogController.createTmam(req, res);
  }
);

router.put(
  "/:id",
  allowAny(shuoonOfficers),
  body("leaveTypeID").isNumeric().withMessage("من فضلك أدخل نوع عودة صحيح"),
  body("start_date").custom((value, { req }) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      throw new Error("تاريخ البدء يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
    }
    if (moment(value).isAfter(req.body.end_date)) {
      throw new Error("تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء.");
    }
    return true;
  }),
  body("end_date").custom((value, { req }) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      throw new Error(
        "تاريخ الانتهاء يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD)."
      );
    }
    if (moment(value).isBefore(req.body.start_date)) {
      throw new Error("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.");
    }
    return true;
  }),
  body("destination").isString().withMessage("من فضلك أدخل الوجهة."),
  body("remaining").isString().withMessage("من فضلك أدخل المتبقي.").optional(),
    body("duration").isString().withMessage("من فضلك أدخل المدة.").optional(),
      body("notes").isString().withMessage("من فضلك أدخل الملاحظات.").optional(),



  (req, res) => {
    OfficerLogController.updateTmam(req, res);
  }
);

router.get("/latest/:id", shuoonOfficers, (req, res) => {
  OfficerLogController.getLatestTmam(req, res);
});

router.get("/vacation-log/:id", allowAny(shuoonOfficers, leader), (req, res) => {
  OfficerLogController.getOfficerVacationLog(req, res);
});

router.get("/:id", shuoonOfficers, (req, res) => {
  OfficerLogController.getOneTmam(req, res);
});

// Get officer logs (as before)
router.get("/", admin, (req, res) => {
  OfficerLogController.getOfficersLog(req, res);
});

module.exports = router;
