const router = require("express").Router();
const { body } = require('express-validator');
const UserController = require("../controllers/userController"); 
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");


router.post("/", admin,
    body("name")
        .isString().withMessage("Please enter a valid name")
        .isLength({ min: 5, max: 30 }).withMessage("Name should be more than 8 characters and no longer than 30 characters"),
    body("password").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
        .withMessage("Please enter a valid password"),
      (req, res) => {
            UserController.createUser(req, res);
        }
);


router.put("/:id", admin,
    body("name")
    .isString().withMessage("Please enter a valid name")
    .isLength({ min: 5, max: 30 }).withMessage("Name should be more than 8 characters and no longer than 30 characters"),
    body("password").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
    .withMessage("Please enter a valid password"),  (req, res) => {
    UserController.updateUser(req, res);
});

router.delete("/history/:id", authorized,(req, res) => {
    UserController.deleteHistory(req, res);
})


router.delete("/:id", admin,  (req, res) => {
    UserController.deleteUser(req, res);
});



router.get("/history",  authorized,(req, res) => {
    UserController.getSearchHistory(req, res);
});  




router.get("/", admin,(req, res) => {
    UserController.getUsers(req, res);
});


router.get("/:id", admin, (req, res) => {
    UserController.getUser(req, res);
})

 
 


module.exports = router;
