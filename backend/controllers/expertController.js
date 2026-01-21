const Expert = require("../models/expert");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class ExpertController {
    static async createExpert(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }
            
 
            const query = util.promisify(connection.query).bind(connection);
             const checkExpert = await query(
            "SELECT * from experts where nationalID = ?",
            [req.body.nationalID]
             );
            
         
            
             if (checkExpert.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "National ID already exists"
                        }
                    ],
                }); 
             }

            


           


            
            const expertObject = new Expert(
                req.body.nationalID,
                req.body.name,
                req.body.security_clearance_number,
                req.body.valid_from,
                req.body.valid_through,
                req.body.company_name,
                req.body.department

              )
            

            await query("insert into experts set  nationalID = ?, name =?, security_clearance_number = ?, valid_from = ?, valid_through = ?, company_name = ?, department = ?",
                [expertObject.getNationalID(),expertObject.getName(), expertObject.getSecurityClearanceNumber(), expertObject.getValidFrom(), expertObject.getValidThrough(), expertObject.getCompanyName(), expertObject.getDepartment()]);
            
             req.app.get("io").emit("expertsUpdated");
            return res.status(200).json(expertObject.toJSON() );


        } catch (err) {  
            return res.status(500).json({ err: "error" });
        }
    }



    static async updateExpert(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
             const checkExpert = await query(
            "SELECT * from experts where nationalID = ?",
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
            

            
            const expertObject = new Expert(
                req.body.nationalID,
                req.body.name,
                req.body.security_clearance_number,
                req.body.valid_from,
                req.body.valid_through,
                req.body.company_name,
                req.body.department
              )
            
                 console.log('Executing query with data:', [
    expertObject.getNationalID(),
    expertObject.getName(),
    expertObject.getSecurityClearanceNumber(),
    expertObject.getValidFrom(),
    expertObject.getValidThrough(),
    expertObject.getCompanyName(),
    expertObject.getDepartment()
]);

            
            

             


            await query(`update experts set nationalID =?,  name =?, security_clearance_number = ?, valid_from = ?, valid_through = ?, company_name = ?, department = ? where nationalID = ?`,
                [expertObject.getNationalID(), expertObject.getName(), expertObject.getSecurityClearanceNumber(), expertObject.getValidFrom(), expertObject.getValidThrough(), expertObject.getCompanyName(), expertObject.getDepartment(), req.params.id]);



             req.app.get("io").emit("expertsUpdated");


             return res.status(200).json( {msg: "Expert updated!"});







        } catch (err) {
            return res.status(500).json({ err: err });

        }
    }


    static async deleteExpert(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
              const checkExpert = await query(
            "SELECT * from experts where nationalID = ?",
            [req.params.nationalID]
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





            await query("delete from experts where nationalID = ?", [checkExpert[0].nationalID])

             req.app.get("io").emit("expertsUpdated");

            return res.status(200).json({
                msg: "Expert deleted!"
            })



        } catch (err) {

            return res.status(500).json({ err: err });

        }
    }


   static async getExperts(req, res) {
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
                "WHERE o.name LIKE ? OR o.department LIKE ? OR o.nationalID LIKE ? OR o.company_name LIKE ?";
            const searchValue = `%${req.query.search}%`;
            params.push(searchValue, searchValue, searchValue, searchValue);
        }

        // --- Total count for pagination ---
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM experts o
            LEFT JOIN expert_record er ON o.id = er.expertID
            ${searchClause}
        `;
        const countResult = await query(countQuery, params);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // --- Main query to get experts with latest arrival and departure ---
        const experts = await query(
            `
            SELECT 
                o.id, 
                o.name, 
                o.department, 
                o.nationalID, 
                o.security_clearance_number,
                o.valid_from,
                o.valid_through,
                o.company_name,
                o.in_unit,
                MAX(er.start_date) AS latest_arrival,
                MAX(er.end_date) AS latest_departure
            FROM experts o
            LEFT JOIN expert_record er ON o.id = er.expertID
            ${searchClause}
            GROUP BY o.id
            ORDER BY latest_arrival DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

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
        return res.status(500).json({
            message: "An unexpected error occurred",
            error: err.message,
        });
    }
}

    static async getExpert(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
           console.log(req.params.id);
           
            const expert = await query("select * from experts where nationalID = ?",[req.params.id])

            if (expert.length == 0) {
                return res.status(404).json({
                    msg: "no experts found blah"
                })
            }

            // user.map((user) => {
            // });

            console.log(expert[0]); 

            const expertObject = new Expert(expert[0].nationalID, expert[0].name, expert[0].security_clearance_number,  expert[0].valid_from, expert[0].valid_through, expert[0].company_name, expert[0].department, expert[0].in_unit);
            return res.status(200).json(expertObject.toJSON());


 
        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }

    // static async getExpertsTmam(req, res) {
    //     try {
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);
    //         // let search = ""
    //         // if (req.query.search) {
    //         //     search =  `where name LIKE '%${req.query.search}%'`
    //         // }

    //         console.log("hey");
            
    //         const experts = await query(`SELECT experts.nationalID ,experts.rank,experts.name, experts.department, leave_type.name AS 'tmam'
    //                                       FROM experts
    //                                       LEFT JOIN expert_log
    //                                       ON experts.id = expert_log.expertID
    //                                       LEFT JOIN leave_type
    //                                       on leave_type.id = expert_log.leaveTypeID`)

            


                                          
    //         console.log(experts[0]);
    //         console.log("hello");
            
            

    //         if (experts.length == 0) {
    //             return res.status(404).json({
    //                 msg: "no experts found now"
    //             })
    //         }

    
        


            

            
  
    //         return res.status(200).json(experts);



    //     } catch (err) { 
    //         return res.status(500).json({ err: err });
            
    //     }
    // }

    //  static async getExpertTmamDetails(req, res) {
    //     try {
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);
    //         // let search = ""
    //         // if (req.query.search) {
    //         //     search =  `where name LIKE '%${req.query.search}%'`
    //         // }
    //         const expert = await query("select * from experts where nationalID = ?",[req.params.id])
    //         console.log("hey");
    //         if (expert.length == 0) {
    //             return res.status(404).json({
    //                 msg: "no experts found blah"
    //             })
    //         }

    //          const expertObject = new Expert(expert[0].name, expert[0].join_date, expert[0].department, expert[0].nationalID, expert[0].rank, expert[0].in_unit);
    //         const expertTmam = await query(`SELECT experts.nationalID ,experts.rank,experts.name, experts.department, experts.join_date, leave_type.name AS 'tmam', expert_leave_details.start_date, expert_leave_details.end_date, expert_leave_details.destination, expert_log.notes
    //                                       FROM experts
    //                                       LEFT JOIN expert_log
    //                                       ON experts.id = expert_log.expertID
    //                                       LEFT JOIN leave_type
    //                                       on leave_type.id = expert_log.leaveTypeID
    //                                       LEFT JOIN expert_leave_details
    //                                       ON expert_leave_details.MovementID = expert_log.id
    //                                       WHERE experts.nationalID = ?
    //                                       ORDER BY expert_log.id DESC
    //                                       `, [expertObject.getMilID()])

            


                                          
         
            
            


    
        


            

        
    //         return res.status(200).json(expertTmam);



    //     } catch (err) { 
    //         return res.status(500).json({ err: err });
            
    //     }
    // }


    static async filterExperts(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = util.promisify(connection.query).bind(connection);
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    let filters = [];
    let params = [];

    console.log("itsa me mario");
    

    // Handle search by name or military ID
    if (req.query.nationalID) {
      filters.push(`(nationalID LIKE ?)`);
      params.push(`%${req.query.nationalID}%`);

    }

    if (req.query.name) {
      filters.push(`(name LIKE ?)`);
      params.push(`%${req.query.name}%`);

    }


    // Filter by department
    if (req.query.company_name) {
      filters.push(`company_name LIKE ?`);
      params.push(`%${req.query.company_name}%`);
    }

    // Filter by rank
    if (req.query.security_clearance_number) {
      filters.push(`security_clearance_number LIKE ?`);
      params.push(`%${req.query.security_clearance_number}%`);
    }

    // // Filter by join date range
    // if (req.query.joinDateStart) {
    //   filters.push(`join_date >= ?`);
    //   params.push(req.query.joinDateStart);
    // }

    // if (req.query.joinDateEnd) {
    //   filters.push(`join_date <= ?`);
    //   params.push(req.query.joinDateEnd);
    // }

    // Build query
    const whereClause = filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";
    const sql = `SELECT * FROM experts ${whereClause}`;

    const experts = await query(sql, params);

    if (experts.length === 0) {
      return res.status(404).json({
        errors: [{ msg: "No experts found" }],
      });
    }

    // Optional: filter out experts who joined in the future
    const validExperts = experts.filter(
      (expert) => moment(expert.valid_from).isBefore(now)
    );

    return res.status(200).json(validExperts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: err.message });
  }
}


static async getAbsentExperts(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const query = util.promisify(connection.query).bind(connection);
        const sql = `SELECT * FROM experts WHERE in_unit = 0
        `;

        const absentExperts = await query(sql);

        if (absentExperts.length === 0) {
            return res.status(404).json({
                errors: [{ msg: "No absent experts found" }],
            });
        }

        return res.status(200).json(absentExperts);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: err.message });
    }
}
}


module.exports = ExpertController;