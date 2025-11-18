const router = require("express").Router();
const { body } = require('express-validator');
const SoldierController = require("../controllers/soldierController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");
const gate = require("../middleware/gate");
const securityHead = require("../middleware/securityHead");


router.post("/", shuoonSarya,
    body("name")
        .isString().withMessage("يرجى إدخال اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("اسم الضابط يجب أن يكون أكثر من 3 حروف ولا يتجاوز 30 حرفًا"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ ضم صحيح بصيغة yyyy-MM-DD"),
    body("end_date")
        .isDate().withMessage("يرجى إدخال تاريخ تسريح صحيح بصيغة yyyy-MM-DD"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),
    body("mil_id")
        .isNumeric().withMessage("يرجى إدخال رقم عسكري صحيح"),
    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("department")
        .isString().withMessage("يرجى إدخال رقم الفرع أو الورشة بشكل صحيح"),
    body("telephone_number")
        .isString().withMessage("يرجى إدخال رقم الهاتف بشكل صحيح"),
    body("guardian_name")
        .isString().withMessage("يرجى إدخال اسم صحيح"),
    body("guardian_telephone_number")
        .isString().withMessage("يرجى إدخال رقم الهاتف بشكل صحيح"),
    (req, res) => {
            SoldierController.createSoldier(req, res);
        }
);


router.put("/:id", admin,
   body("name")
        .isString().withMessage("يرجى إدخال اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("اسم الضابط يجب أن يكون أكثر من 3 حروف ولا يتجاوز 30 حرفًا"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ ضم صحيح بصيغة yyyy-MM-DD"),
    body("end_date")
        .isDate().withMessage("يرجى إدخال تاريخ تسريح صحيح بصيغة yyyy-MM-DD"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),

    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("department")
        .isString().withMessage("يرجى إدخال رقم الفرع أو الورشة بشكل صحيح"),
    body("telephone_number")
        .isString().withMessage("يرجى إدخال رقم الهاتف بشكل صحيح"),
    body("guardian_name")
        .isString().withMessage("يرجى إدخال اسم صحيح"),
    body("guardian_telephone_number")
        .isString().withMessage("يرجى إدخال رقم الهاتف بشكل صحيح"),
          (req, res) => {
    SoldierController.updateSoldier(req, res);
    console.log("BODY RECEIVED:", req.body);

});




router.delete("/:mil_id", admin,  (req, res) => {
    SoldierController.deleteSoldier(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    SoldierController.filterSoldiers(req, res);
});  




router.get("/", gate,(req, res) => {
    SoldierController.getSoldiers(req, res);
});

router.get("/tmam/:id", admin, (req,res) => {
    SoldierController.getSoldierTmamDetails(req,res);
});

router.get("/tmam", (securityHead), (req,res) => {
    SoldierController.getSoldiersTmam(req,res);
});




router.get("/log", admin, (req,res) => {
    SoldierController.getSoldiersTmam(req,res);
});

router.get("/absent", gate, (req, res) => {
    SoldierController.getAbsentSoldiers(req, res);
});

router.get("/current", gate, (req, res) => {
    SoldierController.getCurrentSoldiers(req, res);
});

router.get("/:id", admin, (req, res) => {
    SoldierController.getSoldier(req, res);
});



 
 


module.exports = router;
