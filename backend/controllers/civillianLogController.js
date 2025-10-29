const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class CivillianLogController {


    static async getCivilliansLog(req, res) {
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
            const civillians = await query(`SELECT civillians.nationalID, civillians.name, civillians.department, civillian_log.event_type, civillian_log.event_time, leave_type.name AS reason
                                          FROM civillians
                                          LEFT JOIN civillian_log
                                          ON civillian_log.civillianID = civillians.id
                                          LEFT JOIN leave_type
                                          ON civillian_log.leaveTypeID = leave_type.id`)

            if (civillians.length == 0) {
                return res.status(404).json({
                    msg: "no civillians found"
                })
            }

    
        


            

            
  
            return res.status(200).json(civillians);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }


    
    }



module.exports = CivillianLogController;