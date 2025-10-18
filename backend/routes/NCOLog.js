const router = require("express").Router();
const { body } = require('express-validator');
const authorized = require("../middleware/authorized");
const admin = require("../middleware/admin");
const shuoonSarya = require("../middleware/shuoonSarya");
const ncoLogController = require("../controllers/ncoLogController");


// router.post("/",shuoonOfficers,
//     body("name")
//         .isString().withMessage("Please enter a valid name")
//         .isLength({ min: 3, max: 30 }).withMessage("Name should be more than 3 characters and no longer than 30 characters"),
//     body("join_date")
//         .isDate().withMessage("Please enter a valid date"),
//     body("department")
//         .isAlphanumeric('ar-EG').withMessage("Please enter a valid department"),
//     body("mil_id")
//         .isNumeric().withMessage("Please enter a valid Military ID"),
//     body("rank")
//         .isString().withMessage("Please enter a valid rank"),
//         body("department")
//         .isString().withMessage("Please enter a valid department number") ,
//     (req, res) => {
//             OfficerController.createOfficer(req, res);
//         }
// );


// router.put("/:id", admin,
//     body("mil_id")
//     .isAlphanumeric(),
//     body("rank")
//     .isString(),
//     body("name")
//     .isString(),
//     body("department")
//     .isString(),
//     body("join_date")
//     .isDate(),  (req, res) => {
//     OfficerController.updateUser(req, res);
// });

// router.delete("/history/:id", authorized,(req, res) => {
//     OfficerController.deleteHistory(req, res);
// })


// router.delete("/:mil_id", admin,  (req, res) => {
//     OfficerController.deleteOfficer(req, res);
// });



// router.get("/history",  authorized,(req, res) => {
//     OfficerController.getSearchHistory(req, res);
// });  




router.get("/", admin,(req, res) => {
    ncoLogController.getOfficersLog(req, res);
});

// router.get("/tmam", admin, (req,res) => {
//     OfficerController.getOfficersTmam(req,res);
// });

// router.get("/log", admin, (req,res) => {
//     OfficerController.getOfficersTmam(req,res);
// });

// router.get("/:id", admin, (req, res) => {
//     OfficerController.getOfficer(req, res);
// });



 
 


module.exports = router;
