const PastOfficer = require("../models/pastOfficer");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class PastOfficerController {


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
            const officers = await query(`select * from past_officers ${search}`)

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
           
            const officer = await query("select * from past_officers where id = ?",[req.params.id])

            if (officer.length == 0) {
                return res.status(404).json({
                    msg: "no officers found blah"
                })
            }

            // user.map((user) => {
            // });

            console.log(officer[0]); 

            const officerObject = new PastOfficer(officer[0].name, officer[0].join_date, officer[0].department, officer[0].mil_id, officer[0].rank, officer[0].address, officer[0].height, officer[0].weight, officer[0].dob, officer[0].seniority_number, officer[0].end_date, officer[0].transferID, officer[0].transferred_to);
            return res.status(200).json(officerObject.toJSON());


 
        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }




//     static async filterOfficers(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const query = util.promisify(connection.query).bind(connection);
//     const now = moment().format("YYYY-MM-DD HH:mm:ss");

//     let filters = [];
//     let params = [];

//     console.log("itsa me mario");
    

//     // Handle search by name or military ID
//     if (req.query.mil_id) {
//       filters.push(`(mil_id = ?)`);
//       params.push(`${req.query.mil_id}`);

//     }

//     if (req.query.name) {
//       filters.push(`(name = ?)`);
//       params.push(`${req.query.name}`);

//     }


//     // Filter by department
//     if (req.query.department) {
//       filters.push(`department = ?`);
//       params.push(req.query.department);
//     }

//     // Filter by rank
//     if (req.query.rank) {
//       filters.push(`rank = ?`);
//       params.push(req.query.rank);
//     }

//     // // Filter by join date range
//     // if (req.query.joinDateStart) {
//     //   filters.push(`join_date >= ?`);
//     //   params.push(req.query.joinDateStart);
//     // }

//     // if (req.query.joinDateEnd) {
//     //   filters.push(`join_date <= ?`);
//     //   params.push(req.query.joinDateEnd);
//     // }

//     // Build query
//     const whereClause = filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";
//     const sql = `SELECT * FROM officers ${whereClause}`;

//     const officers = await query(sql, params);

//     if (officers.length === 0) {
//       return res.status(404).json({
//         errors: [{ msg: "No officers found" }],
//       });
//     }

//     // Optional: filter out officers who joined in the future
//     const validOfficers = officers.filter(
//       (officer) => moment(officer.join_date).isBefore(now)
//     );

//     return res.status(200).json(validOfficers);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ err: err.message });
//   }
// }

    



    
    }



module.exports = PastOfficerController;