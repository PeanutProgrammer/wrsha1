const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class ExpertLogController {


    static async getExpertsLog(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
            // let search = ""
            // if (req.query.search) {
            //     search =  `where name LIKE '%${req.query.search}%'`
            // }
            const experts = await query(`SELECT experts.nationalID, experts.name, experts.security_clearance_number, experts.company_name, expert_record.department_visited, expert_record.start_date, expert_record.end_date
                                          FROM experts
                                          LEFT JOIN expert_record
                                          ON expert_record.expertID = experts.nationalID
                                          `)

            if (experts.length == 0) {
                return res.status(404).json({
                    msg: "no experts found"
                })
            }

    
        


            

            
  
            return res.status(200).json(experts);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }


    
    }



module.exports = ExpertLogController;