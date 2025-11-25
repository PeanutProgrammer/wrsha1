const router = require("express").Router();
const admin = require("../middleware/admin");
const securityHead = require("../middleware/securityHead");
const UnitController = require("../controllers/unitController");


router.get("/", securityHead, (req,res) => {
    UnitController.getAllInUnit(req,res);
} )


module.exports = router;
