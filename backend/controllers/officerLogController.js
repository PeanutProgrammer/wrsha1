const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const OfficerLog = require("../models/officerLog");


class OfficerLogController {


    static async getOfficersLog(req, res) {
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
            const officers = await query(`SELECT officers.mil_id, officers.rank, officers.name, officers.department, officer_log.event_type, officer_log.event_time, leave_type.name AS reason, officer_log.notes
                                          FROM officers
                                          LEFT JOIN officer_log
                                          ON officer_log.officerID = officers.id
                                          LEFT JOIN leave_type
                                          ON officer_log.leaveTypeID = leave_type.id`)

            if (officers.length == 0) {
                return res.status(404).json({
                    msg: "no officers found"
                })
            }

    
        


            

            
  
            return res.status(200).json(officers);



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

            


           


            
            const officerObject = new OfficerLog(
                req.body.event_type,
                req.body.event_time,
                req.body.officerID,
                req.body.leaveTypeID,
                req.body.notes,
                req.body.loggerID
            );

            console.log(officerObject.toJSON());
            

            await query("insert into officer_log set event_type = ?, event_time = ?, officerID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
                [officerObject.getEventType(), officerObject.getEventTime(), officerObject.getOfficerID(), officerObject.getLeaveTypeID(), officerObject.getNotes(), officerObject.getLoggerID()]);


            
            await query("update officers set in_unit = 1 where id = ?", [officerObject.getOfficerID()]);


            req.app.get("io").emit("officersUpdated");
            return res.status(200).json(officerObject.toJSON());


        } catch (err) {  
            return res.status(500).json({ err: "error" });
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

            


           


            
            const officerObject = new OfficerLog(
                req.body.event_type,
                req.body.event_time,
                req.body.officerID,
                req.body.leaveTypeID,
                req.body.notes,
                req.body.loggerID
            );

            

            console.log(officerObject.toJSON());
            

             const officerLogResult = await query("insert into officer_log set event_type = ?, event_time = ?, officerID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
                [officerObject.getEventType(), officerObject.getEventTime(), officerObject.getOfficerID(), officerObject.getLeaveTypeID(), officerObject.getNotes(), officerObject.getLoggerID()]);
            
             const officerLogId = officerLogResult.insertId;

            await query("update officers set in_unit = 0 where id = ?", [officerObject.getOfficerID()]);

            await query("insert into officer_leave_details set movementID = ?, start_date = ?, end_date = ?, destination = ?", [officerLogId, req.body.start_date, req.body.end_date, req.body.destination]);

            req.app.get("io").emit("officersUpdated");
            return res.status(200).json(officerObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}

    }





  
    
    }



module.exports = OfficerLogController;