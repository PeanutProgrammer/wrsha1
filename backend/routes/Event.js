const router = require("express").Router();
const { body } = require("express-validator");
const admin = require("../middleware/admin");
const EventController = require("../controllers/eventController");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");


router.get("/", allowAny(leader), (req, res) => {
  EventController.getEvents(req, res);
}); 


router.post("/",allowAny(admin),
    body("name")
        .isString().withMessage("من فضلك أدخل اسم صحيح")
        .isLength({ min: 3, max: 40 }).withMessage("الاسم يجب أن يكون بين 3 و 40 حرفًا"),


(req,res) => {
  EventController.createEvent(req,res);
})


module.exports = router;
