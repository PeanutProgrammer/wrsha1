const shuoonController = require("../controllers/shuoonController");
const shuoonSarya = require("../middleware/shuoonSarya");
const router = require("express").Router();



router.get("/vacations", shuoonSarya, (req,res) => {
    shuoonController.getVacations(req,res);
});


router.get("/missions", shuoonSarya, (req,res) => {
    shuoonController.getMissions(req,res);
});

router.get("/courses", shuoonSarya, (req,res) => {
    shuoonController.getCourses(req,res);
});

module.exports = router;