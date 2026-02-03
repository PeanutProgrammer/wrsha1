const router = require("express").Router();
const { body } = require("express-validator");
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const moment = require("moment");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");
const OfficerDutyController = require("../controllers/officerDutyController");

// Arrival route (already exists)
router.post(
  "/",
  shuoonOfficers,
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),

  body("date").custom((value) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      throw new Error("تاريخ اليوم يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
    }
    return true;
  }),

  (req, res) => {
    OfficerDutyController.createDuty(req, res);
  }
);

// Departure route (new route for departure)
router.put(
  "/",
  shuoonOfficers,
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),
  body("commander_officer")
    .isNumeric()
    .withMessage("من فضلك أدخل اسم ضابط صحيح"),

  body("date").custom((value) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      throw new Error("تاريخ اليوم يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD).");
    }
    return true;
  }),

  (req, res) => {
    OfficerDutyController.updateDuty(req, res);
  }
);



router.get("/date", allowAny(shuoonOfficers,leader), (req, res) => {
  OfficerDutyController.getDutyByDate(req, res);
});

router.get("/view-duty", allowAny(shuoonOfficers, leader), (req, res) => {
  OfficerDutyController.viewDuties(req, res);
});

router.get("/", allowAny(shuoonOfficers,leader), (req, res) => {
  OfficerDutyController.getDuties(req, res);
});

module.exports = router;