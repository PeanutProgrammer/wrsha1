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

router.get("/unit-count", allowAny(security,leader), (req, res) => {
    UnitController.getUnitCount(req, res);
});

router.get("/vacations", allowAny(security,leader), (req, res) => {
    UnitController.getVacations(req, res);
});

router.get("/vacations-count", allowAny(security,leader), (req, res) => {
    UnitController.getVacationsCount(req, res);
});

router.get("/missions", allowAny(security,leader), (req, res) => {
    UnitController.getMissions(req, res);
});

router.get("/missions-count", allowAny(security,leader), (req, res) => {
    UnitController.getMissionsCount(req, res);
});

router.get("/", allowAny(security,leader), (req,res) => {
    UnitController.getAllInUnit(req,res);
})
 



module.exports = router;
