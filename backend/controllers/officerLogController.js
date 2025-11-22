const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const OfficerLog = require("../models/officerLog");


class OfficerLogController {


    static async updateTmam(req, res) {
    try {
      const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
    }
    const {  leaveTypeID, start_date, end_date, destination } = req.body;
    const leaveID = req.params.id;

        const query = util.promisify(connection.query).bind(connection);

        const existing = await query(
            `SELECT * FROM officer_leave_details WHERE id = ?`,
            [leaveID]
        );

        if (existing.length === 0) {
            return res.status(404).json({ msg: "Record not found" });
        }

        await query(
            `UPDATE officer_leave_details 
             SET leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?
             WHERE id = ?`,
            [leaveTypeID || null, start_date || null, end_date || null, destination || null, leaveID]
        );

        return res.status(200).json({ msg: "تم التحديث بنجاح" });

    } catch (err) {
        return res.status(500).json({ err });
    }
}


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
                                          LEFT JOIN officer_leave_details
                                          ON officer_leave_details.movementID = officer_log.id
                                          LEFT JOIN leave_type
                                          ON officer_leave_details.leaveTypeID = leave_type.id
                                          order by officer_log.event_time DESC`)

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


    static async getLatestTmam(req, res) {
    try {
        const officerID = req.params.id;

        const query = util.promisify(connection.query).bind(connection);

        const result = await query(
            `SELECT 
                officer_log.id AS movementID,
                officer_leave_details.id AS leaveID,
                officer_leave_details.leaveTypeID,
                officer_leave_details.start_date,
                officer_leave_details.end_date,
                officer_leave_details.destination,
                leave_type.name AS leaveTypeName,
                officer.name AS officerName,
                officer.rank AS officerRank,
                officer_log.event_time
            FROM officer_log
            LEFT JOIN officers AS officer
            LEFT JOIN officer_leave_details
                ON officer_leave_details.movementID = officer_log.id
            LEFT JOIN leave_type
                ON leave_type.id = officer_leave_details.leaveTypeID
            WHERE officer_log.officerID = ?
            ORDER BY officer_log.event_time DESC
            LIMIT 1`,
            [officerID]
        );

        if (result.length === 0) {
            return res.status(404).json({ msg: "No Tmam records found for this officer" });
        }

        return res.status(200).json(result[0]);

    } catch (err) {
        return res.status(500).json({ err });
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
                req.body.notes,
                req.body.loggerID
            );

            console.log(officerObject.toJSON());
            

            const officerLogResult =    await query(
              "insert into officer_log set event_type = ?, event_time = ?, officerID = ?, notes = ?, loggerID = ?",
              [
                officerObject.getEventType(),
                officerObject.getEventTime(),
                officerObject.getOfficerID(),
                officerObject.getNotes(),
                officerObject.getLoggerID(),
              ]
            );

            const officerLogId = officerLogResult.insertId;

            
            await query("update officers set in_unit = 1 where id = ?", [officerObject.getOfficerID()]);

             await query(
               "insert into officer_leave_details set movementID = ?, leaveTypeID = ?, officerID = ?, start_date = ?, end_date = ?, destination = ?",
               [
                 officerLogId,
                   req.body.leaveTypeID,
                 req.body.officerID,
                 req.body.start_date,
                 req.body.end_date,
                 req.body.destination,
               ]
             );


            req.app.get("io").emit("officersUpdated");
            return res.status(200).json(officerObject.toJSON());


        } catch (err) {  
            return res.status(500).json({ err: err.message});
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
                req.body.notes,
                req.body.loggerID
            );

            

            console.log(officerObject.toJSON());
            

             const officerLogResult = await query("insert into officer_log set event_type = ?, event_time = ?, officerID = ?, notes = ?, loggerID = ?",
                [officerObject.getEventType(), officerObject.getEventTime(), officerObject.getOfficerID(), officerObject.getNotes(), officerObject.getLoggerID()]);
            
             const officerLogId = officerLogResult.insertId;

            await query("update officers set in_unit = 0 where id = ?", [officerObject.getOfficerID()]);

            await query("insert into officer_leave_details set movementID = ?, leaveTypeID = ?, officerID = ?, start_date = ?, end_date = ?, destination = ?", [officerLogId, req.body.leaveTypeID , req.body.officerID,req.body.start_date, req.body.end_date, req.body.destination]);

            req.app.get("io").emit("officersUpdated");
            return res.status(200).json(officerObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}

    }


//           static async updateTmam(req, res) {
//         try {

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//         console.log(errors.array()); // Log errors
//         return res.status(400).json({ errors: errors.array() });
//             }

            
 
//             const query = util.promisify(connection.query).bind(connection);
//             const checkOfficer = await query("SELECT * from officer_leave_details where id = ?", [
//         req.params.id,
//       ]);

//       if (checkOfficer.length == 0) {
//         return res.status(400).json({
//           errors: [
//             {
//               msg: "Officer does not exist",
//             },
//           ],
//         });
//       }
//             //  const checkOfficer = await query(
//             // "SELECT * from officer where mil_id = ?",
//             // [req.body.mil_id]
//             //  );
            
         
            
//             //  if (checkOfficer.length > 0) {
//             //     return res.status(400).json({
//             //         errors: [
//             //             {
//             //                 msg: "Military ID already exists"
//             //             }
//             //         ],
//             //     }); 
//             //  }

            


           


            


            

//             console.log(officerObject.toJSON());
            

//              await query("update officer_leave_details set leaveTypeID = ?, start_date = ?, end_Date = ?, destination = ?",
//                 [req.body.leaveTypeID, req.body.start_date, req.body.end_date,req.body.destination]);

//             req.app.get("io").emit("officersUpdated");
//             return res.status(200).json(officerObject.toJSON());


//         } catch (err) {
//     console.error(err); // Log the error
//     return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
// }

//     }


    static async getOneTmam(req, res) {
    try {
        const leaveID = req.params.id;
        const query = util.promisify(connection.query).bind(connection);

        const result = await query(
            `SELECT 
                old.id AS leaveID,
                old.leaveTypeID,
                old.start_date,
                old.end_date,
                old.destination,
                officer.name AS officerName,
                officer.rank AS officerRank,
                officer.id AS officerID
            FROM officer_leave_details old
            LEFT JOIN officers AS officer
                ON officer.id = old.officerID
            WHERE old.id = ?`,
            [leaveID]
        );

        if (result.length === 0) {
            return res.status(404).json({ msg: "Record not found" });
        }

        return res.status(200).json(result[0]);

    } catch (err) {
        return res.status(500).json({ err });
    }
}


}

module.exports = OfficerLogController;