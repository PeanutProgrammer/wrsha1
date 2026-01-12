const router = require("express").Router();
const admin = require("../middleware/admin");
const security = require("../middleware/securityHead");
const UnitController = require("../controllers/unitController");
const allowAny = require("../middleware/allowAny");
const leader = require("../middleware/leader");

router.get("/daily-summary", allowAny(security,leader), (req, res) => {
    UnitController.getDailySummary(req, res);
});

router.get("/rank-summary", allowAny(security,leader), (req, res) => {
    UnitController.getRankSummary(req, res);
});


router.get("/", allowAny(security,leader), (req,res) => {
    UnitController.getAllInUnit(req,res);
})
 



module.exports = router;
