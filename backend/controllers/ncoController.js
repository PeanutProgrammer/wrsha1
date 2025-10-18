const Officer = require("../models/nco");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class NCOController {
    static async createOfficer(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }
            
 
            const query = util.promisify(connection.query).bind(connection);
             const checkOfficer = await query(
            "SELECT * from ncos where mil_id = ?",
            [req.body.mil_id]
             );
            
         
            
             if (checkOfficer.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Military ID already exists"
                        }
                    ],
                }); 
             }

            


           


            
            const officerObject = new Officer(
                req.body.name,
                req.body.join_date,
                req.body.department,
                req.body.mil_id,
                req.body.rank               )
            

            


            await query("insert into ncos set name =?, join_date = ?, department = ?, mil_id = ?, rank = ?",
                [officerObject.getName(),officerObject.getJoinDate(), officerObject.getDepartment(), officerObject.getMilID(), officerObject.getRank()]);
            
        
            return res.status(200).json(officerObject.toJSON() );


        } catch (err) {  
            return res.status(500).json({ err: "error" });
        }
    }



    static async updateOfficer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
             const checkOfficer = await query(
            "SELECT * from ncos where id = ?",
            [req.params.id]
             );
            
            
             if (checkOfficer.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Officer does not exist"
                        }
                    ],
                }); 
             }
            

            
             const officerObject = new Officer(
                req.body.name,
                req.body.join_date,
                req.body.department,
                req.body.mil_id,
                req.body.rank               )
            
                 console.log("hello");

            
            

             
           
            
            

            await query(`update ncos set name =?, mil_id = ?, join_date = ?, department = ?, rank = ? where id = ?`,
                [officerObject.getName(), officerObject.getMilID(), officerObject.getJoinDate(), officerObject.getDepartment(), officerObject.getRank(), checkOfficer[0].id]);
            
                console.log("Name:", officerObject.getName());
            console.log("Join Date:", officerObject.getJoinDate());
            console.log("Department:", officerObject.getDepartment());
            console.log("Mil ID:", officerObject.getMilID());
            console.log("Rank:", officerObject.getRank());

            console.log(req.body.department);


             return res.status(200).json( {msg: "Officer updated!"});







        } catch (err) {
            return res.status(500).json({ err: err });

        }
    }


    static async deleteOfficer(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
              const checkOfficer = await query(
            "SELECT * from ncos where mil_id = ?",
            [req.params.mil_id]
             );
            
            
             if (checkOfficer.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Officer does not exist"
                        }
                    ],
                }); 
             }
            

            await query("delete from ncos where mil_id = ?", [checkOfficer[0].mil_id])

            return res.status(200).json({
                msg: "Officer deleted!"
            })



        } catch (err) {

            return res.status(500).json({ err: err });

        }
    }


    static async getOfficers(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
            let search = ""
            if (req.query.search) {
                search =  `where name LIKE '%${req.query.search}%'`
            }
            const officers = await query(`select * from ncos ${search}`)

            if (officers.length == 0) {
                return res.status(404).json({
                    msg: "no officers found hey"
                })
            }

    
        


            

            
  
            return res.status(200).json(officers);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }

    static async getOfficer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
           
            const officer = await query("select * from ncos where id = ?",[req.params.id])

            if (officer.length == 0) {
                return res.status(404).json({
                    msg: "no ncos found blah"
                })
            }

            // user.map((user) => {
            // });

            console.log(officer[0]); 

            const officerObject = new Officer(officer[0].name, officer[0].join_date, officer[0].department, officer[0].mil_id, officer[0].rank, officer[0].in_unit);
            return res.status(200).json(officerObject.toJSON());


 
        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }

    static async getOfficersTmam(req, res) {
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

            console.log("hey");
            
            const officers = await query(`SELECT ncos.mil_id ,ncos.rank,ncos.name, ncos.department, leave_type.name AS 'tmam'
                                          FROM ncos
                                          LEFT JOIN officer_log
                                          ON ncos.id = officer_log.officerID
                                          LEFT JOIN leave_type
                                          on leave_type.id = officer_log.leaveTypeID`)

            


                                          
            console.log(officers[0]);
            console.log("hello");
            
            

            if (officers.length == 0) {
                return res.status(404).json({
                    msg: "no officers found now"
                })
            }

    
        


            

            
  
            return res.status(200).json(officers);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }

     static async getOfficerTmamDetails(req, res) {
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
            const officer = await query("select * from ncos where mil_id = ?",[req.params.id])
            console.log("hey");
            if (officer.length == 0) {
                return res.status(404).json({
                    msg: "no officers found blah"
                })
            }

             const officerObject = new Officer(officer[0].name, officer[0].join_date, officer[0].department, officer[0].mil_id, officer[0].rank, officer[0].in_unit);
            const officerTmam = await query(`SELECT ncos.mil_id ,ncos.rank,ncos.name, ncos.department, ncos.join_date, leave_type.name AS 'tmam', officer_leave_details.start_date, officer_leave_details.end_date, officer_leave_details.destination, officer_log.notes
                                          FROM ncos
                                          LEFT JOIN nco_log
                                          ON ncos.id = nco_log.ncoID
                                          LEFT JOIN leave_type
                                          on leave_type.id = nco_log.leaveTypeID
                                          LEFT JOIN nco_leave_details
                                          ON nco_leave_details.MovementID = nco_log.id
                                          WHERE ncos.mil_id = ?
                                          ORDER BY nco_log.id DESC
                                          `, [officerObject.getMilID()])

            


                                          
         
            
            


    
        


            

        
            return res.status(200).json(officerTmam);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }


    static async filterOfficers(req, res) {
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
    if (req.query.mil_id) {
      filters.push(`(mil_id = ?)`);
      params.push(`${req.query.mil_id}`);

    }

    if (req.query.name) {
      filters.push(`(name = ?)`);
      params.push(`${req.query.name}`);

    }


    // Filter by department
    if (req.query.department) {
      filters.push(`department = ?`);
      params.push(req.query.department);
    }

    // Filter by rank
    if (req.query.rank) {
      filters.push(`rank = ?`);
      params.push(req.query.rank);
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
    const sql = `SELECT * FROM ncos ${whereClause}`;

    const officers = await query(sql, params);

    if (officers.length === 0) {
      return res.status(404).json({
        errors: [{ msg: "No officers found" }],
      });
    }

    // Optional: filter out officers who joined in the future
    const validOfficers = officers.filter(
      (officer) => moment(officer.join_date).isBefore(now)
    );

    return res.status(200).json(validOfficers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: err.message });
  }
}

    




    static async getSearchHistory(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);

            const { token } = req.headers;

            const user = await query("select * from users where token = ?",[token] )

            const history = await query("select * from search_history where user_id = ?", [user[0].id]);


 
            if (history.length == 0) {
                return res.status(404).json({
                    msg: "No history found"
                })
            }

            return res.status(200).json(history)




        } catch (err) {
            return res.status(500).json({ err: err });
        }
    }


    static async deleteHistory(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);



             await query("delete from search_history where id = ?", [req.params.id]);


 
            

            return res.status(200).json({
                msg: "History Cleared!"
            })




        } catch (err) {
            return res.status(500).json({ err: err });
        }
    }

    
    }



module.exports = NCOController;