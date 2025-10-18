const router = require("express").Router();
const { body } = require('express-validator');



const authController = require("../controllers/authController");
const authorized = require("../middleware/authorized");


router.post("/login",
    body("username").isString().withMessage("Please enter valid username"),
    body("password")
        .isStrongPassword().withMessage("Please enter valid password")
        // .isLength({ min: 8, max: 20 }).withMessage("Password should be between 8-20 characters")
        ,
    (req, res) => {
        console.log("Received login request with username:", req.body.username);
        authController.login(req, res); 
    }
); 


router.post("/logout", authorized, (req, res) => {
    authController.logout(req, res);
   
})





 
module.exports = router;