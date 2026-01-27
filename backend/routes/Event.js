const router = require("express").Router();
const { body } = require("express-validator");
const admin = require("../middleware/admin");
const EventController = require("../controllers/eventController");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");
const secretary = require("../middleware/secretary");


router.get("/", allowAny(leader), (req, res) => {
  EventController.getEvents(req, res);
}); 


router.post("/",allowAny(admin, secretary),
    body("name")
        .isString().withMessage("من فضلك أدخل اسم صحيح")
        .isLength({ min: 3, max: 40 }).withMessage("الاسم يجب أن يكون بين 3 و 40 حرفًا"),

    body("location")
        .optional()
        .isString().withMessage("من فضلك أدخل مكان صحيح")
        .isLength({ max: 100 }).withMessage("المكان يجب أن لا يزيد عن 100 حرف"),

    body("description")
        .optional()
        .isString().withMessage("من فضلك أدخل وصف صحيح")
        .isLength({ max: 500 }).withMessage("الوصف يجب أن لا يزيد عن 500 حرف"),


    body("date")
        .isISO8601().withMessage("من فضلك أدخل تاريخ صحيح")
        .toDate(),


(req,res) => {
  EventController.createEvent(req,res);
})

router.delete("/:id", allowAny(admin, secretary),  (req, res) => {
    EventController.deleteEvent(req, res);
});


module.exports = router;
