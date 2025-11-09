const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const CivillianLog = require("../models/civillianLog");


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


    

      static async createArrival(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }
            
 
            const query = util.promisify(connection.query).bind(connection);
            //  const checkOfficer = await query(
            // "SELECT * from officer where mil_id = ?",
            // [req.body.mil_id]
            //  );
            
         
            
            //  if (checkOfficer.length > 0) {
            //     return res.status(400).json({
            //         errors: [
            //             {
            //                 msg: "Military ID already exists"
            //             }
            //         ],
            //     }); 
            //  }

            


           


            
            const civillianObject = new CivillianLog(
                req.body.event_type,
                req.body.event_time,
                req.body.civillianID,
                req.body.leaveTypeID,
                req.body.notes,
                req.body.loggerID
            );

            console.log(civillianObject.toJSON());
            

            await query("insert into civillian_log set event_type = ?, event_time = ?, civillianID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
                [civillianObject.getEventType(), civillianObject.getEventTime(), civillianObject.getCivillianID(), civillianObject.getLeaveTypeID(), civillianObject.getNotes(), civillianObject.getLoggerID()]);


            
            await query("update civillians set in_unit = 1 where id = ?", [civillianObject.getCivillianID()]);


            req.app.get("io").emit("civilliansUpdated");
            return res.status(200).json(civillianObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}
    }


      static async createDeparture(req, res) {
        try {

          const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
            }

            
 
            const query = util.promisify(connection.query).bind(connection);
            //  const checkOfficer = await query(
            // "SELECT * from officer where mil_id = ?",
            // [req.body.mil_id]
            //  );
            
         
            
            //  if (checkOfficer.length > 0) {
            //     return res.status(400).json({
            //         errors: [
            //             {
            //                 msg: "Military ID already exists"
            //             }
            //         ],
            //     }); 
            //  }

            


           


            const civillianObject = new CivillianLog(
                req.body.event_type,
                req.body.event_time,
                req.body.civillianID,
                req.body.leaveTypeID,
                req.body.notes,
                req.body.loggerID
            );

            

            console.log(civillianObject.toJSON());
            

             const civillianLogResult = await query("insert into civillian_log set event_type = ?, event_time = ?, civillianID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
                [civillianObject.getEventType(), civillianObject.getEventTime(), civillianObject.getCivillianID(), civillianObject.getLeaveTypeID(), civillianObject.getNotes(), civillianObject.getLoggerID()]);
            
             const civillianLogId = civillianLogResult.insertId;

            await query("update civillians set in_unit = 0 where id = ?", [civillianObject.getCivillianID()]);

            await query("insert into civillian_leave_details set movementID = ?, start_date = ?, end_date = ?, destination = ?", [civillianLogId, req.body.start_date, req.body.end_date, req.body.destination]);

            req.app.get("io").emit("civilliansUpdated");
            return res.status(200).json(civillianObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}

    }


    
    }



module.exports = CivillianLogController;