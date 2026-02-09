const router = require("express").Router();
const { body } = require("express-validator");
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const NcoLogController = require("../controllers/ncoLogController");
const gate = require("../middleware/gate");
const moment = require("moment");
const allowAny = require("../middleware/allowAny");
const shuoonSarya = require("../middleware/shuoonSarya");

// Arrival route (already exists)
router.post(
  "/",
  gate,
  body("ncoID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صف صحيح"),
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
    NcoLogController.createArrival(req, res);
  }
);

// Departure route (new route for departure)
router.post(
  "/departure",
  gate,
  body("ncoID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صف صحيح"),
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
  // New validation for start_date, end_date, and destination
 

  (req, res) => {
    NcoLogController.createDeparture(req, res);
  }
);

router.post(
  "/tmam",
  shuoonSarya,
  body("ncoID").isNumeric().withMessage("من فضلك أدخل اسم ضابط صف صحيح"),
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
  (req, res) => {
    NcoLogController.createTmam(req, res);
  }
);

router.put(
  "/:id",
  allowAny(shuoonSarya),
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

  (req, res) => {
    NcoLogController.updateTmam(req, res);
  }
);

router.get("/:id", shuoonSarya, (req, res) => {
    NcoLogController.getOneTmam(req, res);
});


// Get officer logs (as before)
router.get("/", admin, (req, res) => {
  NcoLogController.getNcosLog(req, res);
});

module.exports = router;
