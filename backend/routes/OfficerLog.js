const router = require("express").Router();
const { body } = require("express-validator");
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const OfficerLogController = require("../controllers/officerLogController");
const gate = require("../middleware/gate");
const moment = require("moment");
const allowAny = require("../middleware/allowAny");

// Arrival route (already exists)
router.post(
  "/",
  gate,
  body("officerID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("leaveTypeID").isNumeric().withMessage("من فضلك أدخل نوع عودة صحيح"),
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
  body("leaveTypeID")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true; // null is allowed
      if (!Number.isInteger(Number(value))) {
        throw new Error("من فضلك أدخل نوع خروج صحيح");
      }
      return true;
    }),

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

  // Updated validation for start_date (optional)
  body("start_date")
    .optional() // Make start_date optional
    .custom((value, { req }) => {
      if (value) {
        // Only validate if start_date is provided
        if (!moment(value, "YYYY-MM-DD", true).isValid()) {
          throw new Error(
            "تاريخ الخروج يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD)."
          );
        }
        if (moment(value).isAfter(req.body.end_date)) {
          throw new Error("تاريخ ووقت الخروج يجب أن يكون قبل تاريخ الانتهاء.");
        }
      }
      return true;
    }),

  // Updated validation for end_date (optional)
  body("end_date")
    .optional() // Make end_date optional
    .custom((value, { req }) => {
      if (value) {
        // Only validate if end_date is provided
        if (!moment(value, "YYYY-MM-DD", true).isValid()) {
          throw new Error(
            "تاريخ العودة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD)."
          );
        }
        if (moment(value).isBefore(req.body.start_date)) {
          throw new Error("تاريخ العودة يجب أن يكون بعد تاريخ البدء.");
        }
      }
      return true;
    }),

  body("destination").isString().withMessage("من فضلك أدخل الوجهة.").optional(), // Optional destination

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

  (req, res) => {
    OfficerLogController.updateTmam(req, res);
  }
);

router.get("/latest/:id", shuoonOfficers, (req, res) => {
  OfficerLogController.getLatestTmam(req, res);
});

router.get("/:id", shuoonOfficers, (req, res) => {
  OfficerLogController.getOneTmam(req, res);
});

// Get officer logs (as before)
router.get("/", admin, (req, res) => {
  OfficerLogController.getOfficersLog(req, res);
});

module.exports = router;
