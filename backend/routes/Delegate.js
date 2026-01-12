const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const DelegateController = require("../controllers/delegateController");
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");
const gate = require("../middleware/gate");
const allowAny = require("../middleware/allowAny");
const securityHead = require("../middleware/securityHead");
const leader = require("../middleware/leader");

router.post(
  "/",
  // Add custom validation middleware for logical checks
  gate,
  body("rank").isString().withMessage("يرجى إدخال رتبة صحيحة"),
  body("name")
    .isString()
    .withMessage("من فضلك أدخل اسم صحيح")
    .isLength({ min: 3, max: 30 })
    .withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),

  // Validate 'visit_start' and 'visit_end' dates
  body("visit_start").custom((value) => {
    // If it's not a Date object, treat it as a string
    if (!(value instanceof Date)) {
      if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        throw new Error(
          "تاريخ ووقت بدء الزيارة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss)."
        );
      }
    } else {
      // If it's a Date object, check if it's a valid Date
      if (!moment(value).isValid()) {
        throw new Error("تاريخ ووقت بدء الزيارة يجب أن يكون بتاريخ صحيح.");
      }
    }
    return true;
  }),

  // Skip validating 'visit_end' if it is null
  body("visit_end")
    .optional() // Optional field
    .custom((value, { req }) => {
      // If value is null, it's valid
      if (value === null) {
        return true;
      }

      // If not null, validate as a date
      if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        throw new Error(
          "تاريخ ووقت انتهاء الزيارة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss)."
        );
      }

      // If visit_end is before visit_start, throw an error
      if (moment(value).isBefore(req.body.visit_start)) {
        throw new Error("تاريخ انتهاء الزيارة يجب أن يكون بعد تاريخ البدء.");
      }

      return true;
    }),

  body("notes").isString().withMessage("من فضلك أدخل سبب الزيارة صحيح"),

  // Handle validation results
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, proceed to controller action
    DelegateController.createDelegate(req, res);
  }
);

router.put(
  "/:id",
  admin,
  body("rank").isString().withMessage("يرجى إدخال رتبة صحيحة"),
  body("name")
    .isString()
    .withMessage("من فضلك أدخل اسم صحيح")
    .isLength({ min: 3, max: 30 })
    .withMessage("الاسم يجب أن يكون بين 3 و 30 حرفًا"),

  // Validate 'visit_start' and 'visit_end' dates
  body("visit_start").custom((value) => {
    // If it's not a Date object, treat it as a string
    if (!(value instanceof Date)) {
      if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        throw new Error(
          "تاريخ ووقت بدء الزيارة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss)."
        );
      }
    } else {
      // If it's a Date object, check if it's a valid Date
      if (!moment(value).isValid()) {
        throw new Error("تاريخ ووقت بدء الزيارة يجب أن يكون بتاريخ صحيح.");
      }
    }
    return true;
  }),

  // Skip validating 'visit_end' if it is null
  body("visit_end")
    .optional() // Optional field
    .custom((value, { req }) => {
      // If value is null, it's valid
      if (value === null) {
        return true;
      }

      // If not null, validate as a date
      if (!moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        throw new Error(
          "تاريخ ووقت انتهاء الزيارة يجب أن يكون بالتنسيق الصحيح (YYYY-MM-DD HH:mm:ss)."
        );
      }

      // If visit_end is before visit_start, throw an error
      if (moment(value).isBefore(req.body.visit_start)) {
        throw new Error("تاريخ انتهاء الزيارة يجب أن يكون بعد تاريخ البدء.");
      }

      return true;
    }),

  body("notes").isString().withMessage("من فضلك أدخل سبب الزيارة صحيح"),

  // Handle validation results
  (req, res) => {
    // Get validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Return a response with errors if validation fails
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, proceed to controller action
    DelegateController.updateDelegate(req, res);
    console.log("BODY RECEIVED:", req.body);
  }
);

router.put("/end-visit/:id", gate, (req, res) => {
  // Call the endVisit function from the controller
  DelegateController.endVisit(req, res);
});

router.delete("/:id", admin, (req, res) => {
  DelegateController.deleteDelegate(req, res);
});

// Get all current guests
router.get("/current", allowAny(gate, securityHead, leader), (req, res) => {
  DelegateController.getCurrentDelegates(req, res);
});

// Get all guests
router.get("/", allowAny(gate, securityHead, leader), (req, res) => {
  DelegateController.getDelegates(req, res);
});

router.get("/:id", admin, (req, res) => {
  DelegateController.getDelegate(req, res);
});

module.exports = router;
