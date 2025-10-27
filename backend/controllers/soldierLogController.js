const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class SoldierLogController {


    static async getSoldiersLog(req, res) {
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
            const soldiers = await query(`SELECT soldiers.mil_id, soldiers.rank, soldiers.name, soldiers.department, soldier_log.event_type, soldier_log.event_time, leave_type.name AS reason, soldier_log.notes
                                          FROM soldiers
                                          LEFT JOIN soldier_log
                                          ON soldier_log.soldierID = soldiers.id
                                          LEFT JOIN leave_type
                                          ON soldier_log.leaveTypeID = leave_type.id`)

            if (soldiers.length == 0) {
                return res.status(404).json({
                    msg: "no soldiers found"
                })
            }

    
        


            

            
  
            return res.status(200).json(soldiers);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }


    
    }



module.exports = SoldierLogController;