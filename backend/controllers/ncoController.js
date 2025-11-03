const NCO = require("../models/nco");
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

            


           


            
            const officerObject = new NCO(
                req.body.name,
                req.body.join_date,
                req.body.department,
                req.body.mil_id,
                req.body.rank,
                req.body.address,
                req.body.height,
                req.body.weight,
                req.body.dob,      
         )
            

            await query("insert into ncos set name =?, join_date = ?, department = ?, mil_id = ?, rank = ?, address = ?, height = ?, weight = ?, dob = ?",
                [officerObject.getName(),officerObject.getJoinDate(), officerObject.getDepartment(), officerObject.getMilID(), officerObject.getRank(), officerObject.getAddress(), officerObject.getHeight(), officerObject.getWeight(), officerObject.getDOB()]);

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
                            msg: "NCO does not exist"
                        }
                    ],
                }); 
             }
            

            
             const officerObject = new NCO(
                req.body.name,
                req.body.join_date,
                req.body.department,
                req.body.mil_id,
                req.body.rank,
                req.body.address,
                req.body.height,
                req.body.weight,
                req.body.dob,              )
            
                 console.log("hello");

            
            

             


            await query(`update ncos set name =?, join_date = ?, department = ?, rank = ?, address = ?, height = ?, weight = ?, dob = ? where id = ?`,
                [officerObject.getName(), officerObject.getJoinDate(), officerObject.getDepartment(), officerObject.getRank(), officerObject.getAddress(), officerObject.getHeight(), officerObject.getWeight(), officerObject.getDOB(), checkOfficer[0].id]);

                console.log("Name:", officerObject.getName());
            console.log("Join Date:", officerObject.getJoinDate());
            console.log("Department:", officerObject.getDepartment());
            console.log("Mil ID:", officerObject.getMilID());
            console.log("Rank:", officerObject.getRank());

            console.log(req.body.department);


             return res.status(200).json( {msg: "NCO updated!"});







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
                            msg: "NCO does not exist"
                        }
                    ],
                }); 
             }

               // Create a PastOfficer object with the officer's data
        const PastNCOObject = {
            mil_id: checkOfficer[0].mil_id,
            rank: checkOfficer[0].rank,
            name: checkOfficer[0].name,
            join_date: checkOfficer[0].join_date,
            address: checkOfficer[0].address,
            height: checkOfficer[0].height,
            weight: checkOfficer[0].weight,
            dob: checkOfficer[0].dob,
            // If you have additional fields such as 'end_date', 'transferID', etc.
            end_date: req.body.end_date || new Date().toISOString(),
            transferID: req.body.transferID || null,
            transferred_to: req.body.transferred_to || null
        };

        // Insert the officer data into the past_officers table
        await query(
            "INSERT INTO past_ncos (mil_id, rank, name, join_date, address, height, weight, dob, end_date, transferID, transferred_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                PastNCOObject.mil_id,
                PastNCOObject.rank,
                PastNCOObject.name,
                PastNCOObject.join_date,
                PastNCOObject.address,
                PastNCOObject.height,
                PastNCOObject.weight,
                PastNCOObject.dob,
                PastNCOObject.end_date,
                PastNCOObject.transferID,
                PastNCOObject.transferred_to
            ]
        );
            

            await query("delete from ncos where mil_id = ?", [checkOfficer[0].mil_id])

            return res.status(200).json({
                msg: "NCO deleted!"
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
            const ncos = await query(`select * from ncos ${search}`)

            if (ncos.length == 0) {
                return res.status(404).json({
                    msg: "no ncos found hey"
                })
            }

    
        


            

            
  
            return res.status(200).json(ncos);



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
           
            const nco = await query("select * from ncos where id = ?",[req.params.id])

            if (nco.length == 0) {
                return res.status(404).json({
                    msg: "no ncos found blah"
                })
            }

            // user.map((user) => {
            // });

            console.log(nco[0]); 

            const officerObject = new NCO(nco[0].name, nco[0].join_date, nco[0].department, nco[0].mil_id, nco[0].rank, nco[0].address, nco[0].height, nco[0].weight, nco[0].dob, nco[0].in_unit);
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
            
            const ncos = await query(`SELECT ncos.mil_id ,ncos.rank,ncos.name, ncos.department, leave_type.name AS 'tmam'
                                          FROM ncos
                                          LEFT JOIN officer_log
                                          ON ncos.id = officer_log.officerID
                                          LEFT JOIN leave_type
                                          on leave_type.id = officer_log.leaveTypeID`)

            


                                          
            console.log(ncos[0]);
            console.log("hello");
            
            

            if (ncos.length == 0) {
                return res.status(404).json({
                    msg: "no ncos found now"
                })
            }

    
        


            

            
  
            return res.status(200).json(ncos);



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
            const nco = await query("select * from ncos where mil_id = ?",[req.params.id])
            console.log("hey");
            if (nco.length == 0) {
                return res.status(404).json({
                    msg: "no ncos found blah"
                })
            }

            const officerObject = new NCO(nco[0].name, nco[0].join_date, nco[0].department, nco[0].mil_id, nco[0].rank, nco[0].address, nco[0].height, nco[0].weight, nco[0].dob, nco[0].in_unit);
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

    const ncos = await query(sql, params);

    if (ncos.length === 0) {
      return res.status(404).json({
        errors: [{ msg: "No ncos found" }],
      });
    }

    // Optional: filter out officers who joined in the future
    const validOfficers = ncos.filter(
      (nco) => moment(nco.join_date).isBefore(now)
    );

    return res.status(200).json(validOfficers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: err.message });
  }
}

    




   

    
    }



module.exports = NCOController;