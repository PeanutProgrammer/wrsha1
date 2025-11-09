const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const ExpertRecord = require("../models/expertRecord");
const moment = require('moment');

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
            const experts = await query(`SELECT experts.nationalID, experts.name, experts.security_clearance_number, experts.company_name, experts.valid_from, experts.valid_through, expert_record.department_visited, expert_record.start_date, expert_record.end_date
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

        // New function to fetch experts with null end_date
    static async getExpertsWithNullEndDate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);

            // SQL query to fetch experts with null end_date in expert_record
            const experts = await query(`
                SELECT experts.nationalID, experts.name, experts.security_clearance_number, 
                       experts.company_name, experts.valid_from, experts.valid_through, expert_record.id, 
                       expert_record.department_visited, expert_record.start_date, expert_record.end_date
                FROM experts
                LEFT JOIN expert_record ON expert_record.expertID = experts.nationalID
                WHERE expert_record.end_date IS NULL AND expert_record.start_date IS NOT NULL
            `);

            if (experts.length === 0) {
                return res.status(404).json({
                    msg: "No experts with null end_date found"
                });
            }

            return res.status(200).json(experts);
        } catch (err) {
            console.error(err);  // Log error for debugging
            return res.status(500).json({ err: err.message });
        }
    }

          static async endVisit(req, res) {
    try {
        // Validate expert ID
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const query = util.promisify(connection.query).bind(connection);

        // Check if the expert exists
        const checkExpert = await query(
            "SELECT * from expert_record where id = ?",
            [req.params.id]
        );

        if (checkExpert.length == 0) {
            return res.status(400).json({
                errors: [
                    {
                        msg: "Expert does not exist"
                    }
                ],
            });
        }

        // Get the current time to set as visit_end
        const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss");

        // Update the visit_end field in the database
        await query(
            "UPDATE expert_record SET end_date = ? WHERE id = ?",
            [visitEnd, req.params.id]
        );

        // Emit the update via socket if needed
        req.app.get("io").emit("expertsUpdated");

        // Respond with a success message
        return res.status(200).json({
            msg: "Visit ended successfully!",
            end_date: visitEnd // Return the new end_date time
        });

    } catch (err) {
        // Log the error in detail
        console.error('Error in endVisit:', err.message);  // Log the error message
        console.error(err.stack);  // Log the stack trace for debugging

        // Return a more detailed error response
        return res.status(500).json({
            msg: 'An error occurred while ending the visit.',
            error: {
                message: err.message,
                stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production for security
                details: err
            }
        });
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

            


           


            
            const expertObject = new ExpertRecord(
                req.body.start_date,
                req.body.end_date,
                req.body.expertID,
                req.body.department_visited,
                req.body.loggerID,
                req.body.notes

            );

            console.log(expertObject.toJSON());
            

            await query("insert into expert_record set start_date = ?, end_date = ?, expertID = ?, department_visited = ?, loggerID = ?, notes = ?",
                [expertObject.getStartDate(), expertObject.getEndDate(), expertObject.getExpertID(), expertObject.getDepartmentVisited(), expertObject.getLoggerID(), expertObject.getNotes()]);


                    // await query("update experts set in_unit = 1 where id = ?", [expertObject.getExpertID()]);



            req.app.get("io").emit("expertsUpdated");
            return res.status(200).json(expertObject.toJSON());


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

            


           


            const expertObject = new ExpertRecord(
                req.body.start_date,
                req.body.end_date,
                req.body.expertID,
                req.body.department_visited,
                req.body.loggerID,
                req.body.notes
            );

            

            console.log(expertObject.toJSON());

             const expertRecordResult = await query("insert into expert_record set start_date = ?, end_date = ?, expertID = ?, department_visited = ?, loggerID = ?, notes = ?",
                [expertObject.getStartDate(), expertObject.getEndDate(), expertObject.getExpertID(), expertObject.getDepartmentVisited(), expertObject.getLoggerID(), expertObject.getNotes()]);

             const expertRecordId = expertRecordResult.insertId;

            // await query("update experts set in_unit = 0 where id = ?", [expertObject.getExpertID()]);



            req.app.get("io").emit("expertsUpdated");
            return res.status(200).json(expertObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}

    }


    
    }



module.exports = ExpertLogController;