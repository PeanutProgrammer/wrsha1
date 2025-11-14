const router = require("express").Router();
const { body } = require('express-validator');
const NCOController = require("../controllers/ncoController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");
const gate = require("../middleware/gate");


router.post("/", shuoonSarya,
    body("name")
        .isString().withMessage("يرجى إدخال اسم صحيح")
        .isLength({ min: 3, max: 30 }).withMessage("اسم الضابط يجب أن يكون أكثر من 3 حروف ولا يتجاوز 30 حرفًا"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ ضم صحيح بصيغة yyyy-MM-DD"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),
    body("mil_id")
        .isNumeric().withMessage("يرجى إدخال رقم عسكري صحيح"),
    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("department")
        .isString().withMessage("يرجى إدخال رقم الفرع أو الورشة بشكل صحيح"),
    body("height")
        .isNumeric().withMessage("يرجى إدخال طول صحيح"),
    body("weight")
        .isNumeric().withMessage("يرجى إدخال وزن صحيح"),
    body("dob")
        .isDate().withMessage("يرجى إدخال تاريخ ميلاد صحيح"),
    (req, res) => {
            NCOController.createOfficer(req, res);
        }
);


router.put("/:id", admin,

    body("rank")
        .isString().withMessage("يرجى إدخال رتبة صحيحة"),
    body("name")
        .isString().withMessage("يرجى إدخال اسم الضابط"),
    body("department")
        .isString().withMessage("يرجى إدخال اسم الفرع أو الورشة"),
    body("join_date")
        .isDate().withMessage("يرجى إدخال تاريخ الضم بشكل صحيح"),
    body("height")
        .isNumeric().withMessage("يرجى إدخال طول صحيح"),
    body("weight")
        .isNumeric().withMessage("يرجى إدخال وزن صحيح"),
    body("dob")
        .isDate().withMessage("يرجى إدخال تاريخ الميلاد بشكل صحيح"),
          (req, res) => {
    NCOController.updateOfficer(req, res);
    console.log("BODY RECEIVED:", req.body);

});




router.delete("/:mil_id", admin,  (req, res) => {
    NCOController.deleteOfficer(req, res);
});



router.get("/filter",  authorized,(req, res) => {
    NCOController.filterOfficers(req, res);
});  




router.get("/", gate,(req, res) => {
    NCOController.getOfficers(req, res);
});

router.get("/tmam/:id", admin, (req,res) => {
    NCOController.getOfficerTmamDetails(req,res);
});

router.get("/tmam", admin, (req,res) => {
    NCOController.getOfficersTmam(req,res);
});




router.get("/log", admin, (req,res) => {
    NCOController.getOfficersTmam(req,res);
});

router.get("/current", gate, (req, res) => {
    NCOController.getCurrentOfficers(req, res);
});

router.get("/absent", gate, (req, res) => {
    NCOController.getAbsentOfficers(req, res);
});

router.get("/:id", admin, (req, res) => {
    NCOController.getOfficer(req, res);
});



 
 


module.exports = router;
