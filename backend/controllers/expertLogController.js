const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const ExpertRecord = require("../models/expertRecord");
const moment = require('moment');
const withTransaction = require("../utils/withTransaction");

class ExpertLogController {


    static async getExpertsLog(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const query = util.promisify(connection.query).bind(connection);

        // --- Pagination params ---
        const page = parseInt(req.query.page) || 1; // default to page 1
        const limit = parseInt(req.query.limit) || 20; // default 20 rows per page
        const offset = (page - 1) * limit;

        // --- Search params ---
        let searchClause = "";
        const params = [];
        if (req.query.search) {
          searchClause =
            "WHERE experts.name LIKE ? OR experts.department LIKE ? OR experts.nationalID LIKE ? OR experts.company_name LIKE ? OR experts.security_clearance_number LIKE ?";
          const searchValue = `%${req.query.search}%`;
          params.push(searchValue, searchValue, searchValue, searchValue, searchValue);
        }

        // --- Total count for pagination ---
        const countQuery = `SELECT COUNT(*) AS total FROM experts ${searchClause}`;
        const countResult = await query(countQuery, params);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const dataQuery = `SELECT experts.id ,experts.nationalID, experts.name, experts.department, experts.security_clearance_number, experts.company_name, experts.valid_from, experts.valid_through, officers.rank, officers.name as officerName, expert_record.start_date, expert_record.end_date, expert_record.external_officer
                                          FROM experts
                                          LEFT JOIN expert_record
                                          ON expert_record.expertID = experts.id
                                          LEFT JOIN officers
                                          ON expert_record.officerID = officers.id
                                        ${searchClause}
                                        ORDER BY expert_record.start_date desc
                                        LIMIT ? OFFSET ?
                                        `;
        params.push(limit, offset);
        const experts = await query(dataQuery, params);

        if (!experts.length) {
          return res.status(404).json({ msg: "No experts found" });
        }

        return res.status(200).json({
          page,
          limit,
          total,
          totalPages,
          data: experts,
        });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({
            message: "An unexpected error occurred",
            error: err.message,
          });
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
                SELECT experts.id ,experts.nationalID, experts.name, experts.security_clearance_number, 
                       experts.company_name, experts.valid_from, experts.valid_through, expert_record.id, 
                       officers.rank, officers.name as officerName, expert_record.start_date, expert_record.end_date
                FROM experts
                LEFT JOIN expert_record ON expert_record.expertID = experts.id
                LEFT JOIN officers ON expert_record.officerID = officers.id
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

        await withTransaction(async (query) => {
            const [expert] = await query(
                "SELECT expertID FROM expert_record WHERE id = ? FOR UPDATE",
                [req.params.id]
            );
            
            if (!expert) {
                throw new Error("Expert record not found for locking.");
            }

            if (expert.in_unit === 0) {
                throw new Error("Expert is already marked as not in unit.");
            }

            // Get the current time to set as visit_end
            const visit_end = moment().format("YYYY-MM-DD HH:mm:ss");

            // Update the visit_end field in the database
            await query(
                "UPDATE expert_record SET end_date = ? WHERE id = ?",
                [visit_end, req.params.id]
            );

            await query(
                "update experts set in_unit = 0 where id = ?",
                [checkExpert[0].expertID]
            );
            
            
        });


        // Emit the update via socket if needed
        req.app.get("io").emit("expertsUpdated");

        // Respond with a success message
        return res.status(200).json({
            msg: "Visit ended successfully!",
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
            

            


           


            
            const expertObject = new ExpertRecord(
                req.body.start_date,
                req.body.end_date,
                req.body.expertID,
                req.body.officerID,
                req.body.external_officer,
                req.body.loggerID,
                req.body.notes

            );

            console.log(expertObject.toJSON());

            await withTransaction(async (query) => {
                // 1) LOCK expert row to prevent race conditions
                const [expert] = await query(
                    "SELECT in_unit FROM experts WHERE id = ? FOR UPDATE",
                    [expertObject.getExpertID()]
                );
      
                if (!expert) throw new Error("Expert not found");
      
                // 2) Prevent double arrival
                if (expert.in_unit === 1) {
                    throw new Error(
                        "Expert already inside the unit (duplicate arrival prevented)"
                    );
                }
            
                
            

                await query("insert into expert_record set start_date = ?, end_date = ?, expertID = ?, officerID = ?, external_officer = ?,loggerID = ?, notes = ?",
                    [expertObject.getStartDate(), expertObject.getEndDate(), expertObject.getExpertID(), expertObject.getOfficerID(), expertObject.getExternalOfficer(), expertObject.getLoggerID(), expertObject.getNotes()]);


                    
                await query("update experts set in_unit = 1 where id = ?", [expertObject.getExpertID()]);


            });
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

            


            const expertObject = new ExpertRecord(
                req.body.start_date,
                req.body.end_date,
                req.body.expertID,
                req.body.officerID,
                req.body.external_officer,
                req.body.loggerID,
                req.body.notes
            );

            

            console.log(expertObject.toJSON());



            await withTransaction(async (query) => {
                // 1) LOCK expert row
                const [expert] = await query(
                    "SELECT in_unit FROM experts WHERE id = ? FOR UPDATE",
                    [expertObject.getExpertID()]
                );
      
                if (!expert) throw new Error("Expert not found");
      
                // 2) Prevent double arrival
                if (expert.in_unit === 0) {
                    throw new Error(
                        "Expert already outside the unit (duplicate departure prevented)"
                    );
                }

                const expertRecordResult = await query("insert into expert_record set start_date = ?, end_date = ?, expertID = ?, officerID = ?, external_officer = ?, loggerID = ?, notes = ?",
                    [expertObject.getStartDate(), expertObject.getEndDate(), expertObject.getExpertID(), expertObject.getOfficerID(), expertObject.getExternalOfficer(), expertObject.getLoggerID(), expertObject.getNotes()]);

                const expertRecordId = expertRecordResult.insertId;

                await query("update experts set in_unit = 0 where id = ?", [expertObject.getExpertID()]);
            });


            req.app.get("io").emit("expertsUpdated");
            return res.status(200).json(expertObject.toJSON());


        } catch (err) {
    console.error(err); // Log the error
    return res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
}

    }


    
    }



module.exports = ExpertLogController;