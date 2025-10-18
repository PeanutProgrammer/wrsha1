const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonOfficers = require("../middleware/shuoonOfficers");
const DepartmentController = require("../controllers/departmentController");


router.get("/", admin,(req, res) => {
    DepartmentController.getDepartments(req, res);
});


module.exports = router;