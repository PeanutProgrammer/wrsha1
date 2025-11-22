const Department = require("../models/department");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class DepartmentController {


    static async getDepartments(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);

            const depts = await query(`select * from departments `);

            if (depts.length == 0) {
                return res.status(404).json({
                    msg: "no departments found"
                })
            }

           

            


        
            
  
            return res.status(200).json(depts);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }

  
    
    }



module.exports = DepartmentController;