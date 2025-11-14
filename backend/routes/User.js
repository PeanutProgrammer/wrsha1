const router = require("express").Router();
const { body } = require('express-validator');
const UserController = require("../controllers/userController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");

router.post("/", admin,
    body("name")
        .isString().withMessage("الرجاء إدخال اسم صالح")
        .isLength({ min: 3, max: 30 }).withMessage("يجب أن يكون الاسم أكثر من 3 حروف وألا يتجاوز 30 حرفًا"),
    body("username")
        .isString().withMessage("الرجاء إدخال اسم مستخدم صالح")
        .isLength({ min: 3, max: 15 }).withMessage("يجب أن يكون اسم المستخدم أكثر من 3 حروف وألا يتجاوز 15 حرفًا"),
    body("password").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
        .withMessage("الرجاء إدخال كلمة مرور صالحة"),
    body("type")
        .isIn(['admin', 'بوابة', 'مبنى القيادة', 'شؤون ضباط', 'شؤون ادارية', 'قائد الامن'])
        .withMessage("النوع يجب أن يكون 'admin', 'بوابة', 'مبنى القيادة', 'شؤون ضباط', 'شؤون ادارية' أو 'قائد الامن'"),
      (req, res) => {
            UserController.createUser(req, res);
        }
);

router.put("/:id", admin,
    body("name")
    .isString().withMessage("الرجاء إدخال اسم صالح")
    .isLength({ min: 3, max: 30 }).withMessage("يجب أن يكون الاسم أكثر من 3 حروف وألا يتجاوز 30 حرفًا"),
    body("username")
        .isString().withMessage("الرجاء إدخال اسم مستخدم صالح")
        .isLength({ min: 3, max: 15 }).withMessage("يجب أن يكون اسم المستخدم أكثر من 3 حروف وألا يتجاوز 15 حرفًا"),
    body("password").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
    .withMessage("الرجاء إدخال كلمة مرور صالحة"),
      body("type")
        .isIn(['admin', 'بوابة', 'مبنى القيادة', 'شؤون ضباط', 'شؤون ادارية', 'قائد الامن'])
        .withMessage("النوع يجب أن يكون 'admin', 'بوابة', 'مبنى القيادة', 'شؤون ضباط', 'شؤون ادارية' أو 'قائد الامن'"),
    (req, res) => {
    UserController.updateUser(req, res); 
});

router.delete("/:id", admin, (req, res) => {
    UserController.deleteUser(req, res);
});

router.get("/", admin, (req, res) => {
    UserController.getUsers(req, res);
});

router.get("/:id", admin, (req, res) => {
    UserController.getUser(req, res);
});

module.exports = router;
