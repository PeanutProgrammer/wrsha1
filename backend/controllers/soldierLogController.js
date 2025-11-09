const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const SoldierLog = require("../models/soldierLog");


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

            


           


            
            const soldierObject = new SoldierLog(
                req.body.event_type,
                req.body.event_time,
                req.body.soldierID,
                req.body.leaveTypeID,
                req.body.notes,
                req.body.loggerID
            );

            console.log(soldierObject.toJSON());
            

            await query("insert into soldier_log set event_type = ?, event_time = ?, soldierID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
                [soldierObject.getEventType(), soldierObject.getEventTime(), soldierObject.getSoldierID(), soldierObject.getLeaveTypeID(), soldierObject.getNotes(), soldierObject.getLoggerID()]);


            
            await query("update soldiers set in_unit = 1 where id = ?", [soldierObject.getSoldierID()]);


            req.app.get("io").emit("soldiersUpdated");
            return res.status(200).json(soldierObject.toJSON());


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

            


           


            
            const soldierObject = new SoldierLog(
                req.body.event_type,
                req.body.event_time,
                req.body.soldierID,
                req.body.leaveTypeID,
                req.body.notes,
                req.body.loggerID
            );

            

            console.log(soldierObject.toJSON());
            

             const officerLogResult = await query("insert into soldier_log set event_type = ?, event_time = ?, soldierID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
                [soldierObject.getEventType(), soldierObject.getEventTime(), soldierObject.getSoldierID(), soldierObject.getLeaveTypeID(), soldierObject.getNotes(), soldierObject.getLoggerID()]);
            
             const officerLogId = officerLogResult.insertId;

            await query("update soldiers set in_unit = 0 where id = ?", [soldierObject.getSoldierID()]);

            await query("insert into soldier_leave_details set movementID = ?, start_date = ?, end_date = ?, destination = ?", [officerLogId, req.body.start_date, req.body.end_date, req.body.destination]);

            req.app.get("io").emit("soldiersUpdated");
            return res.status(200).json(soldierObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}

    }



    
    }



module.exports = SoldierLogController;