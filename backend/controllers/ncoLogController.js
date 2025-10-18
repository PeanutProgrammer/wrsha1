const Officer = require("../models/officerLog");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class ncoLogController {
    // static async createOfficer(req, res) {
    //     try {

    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }
            
 
    //         const query = util.promisify(connection.query).bind(connection);
    //          const checkOfficer = await query(
    //         "SELECT * from officers where mil_id = ?",
    //         [req.body.mil_id]
    //          );
            
         
            
    //          if (checkOfficer.length > 0) {
    //             return res.status(400).json({
    //                 errors: [
    //                     {
    //                         msg: "Military ID already exists"
    //                     }
    //                 ],
    //             }); 
    //          }

            


           


            
    //         const officerObject = new Officer(
    //             req.body.name,
    //             req.body.join_date,
    //             req.body.department,
    //             req.body.mil_id,
    //             req.body.rank               )
            

            


    //         await query("insert into officers set name =?, join_date = ?, department = ?, mil_id = ?, rank = ?",
    //             [officerObject.getName(),officerObject.getJoinDate(), officerObject.getDepartment(), officerObject.getMilID(), officerObject.getRank()]);
            
        
    //         return res.status(200).json(officerObject.toJSON() );


    //     } catch (err) {  
    //         return res.status(500).json({ err: "error" });
    //     }
    // }



    // static async updateOfficer(req, res) {
    //     try {
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);
    //          const checkOfficer = await query(
    //         "SELECT * from officers where mil_id = ?",
    //         [req.body.mil_id]
    //          );
            
            
    //          if (checkOfficer.length == 0) {
    //             return res.status(400).json({
    //                 errors: [
    //                     {
    //                         msg: "Officer does not exist"
    //                     }
    //                 ],
    //             }); 
    //          }
            

            
    //          const officerObject = new Officer(
    //             req.body.name,
    //             req.body.join_date,
    //             req.body.department,
    //             req.body.mil_id,
    //             req.body.rank               )
            
    //              console.log("hello");

            
            

             
           
            
            

    //         await query("update  into officers set name =?, join_date = ?, department = ?, mil_id = ?, rank = ?",
    //             [officerObject.getName(),officerObject.getJoinDate(), officerObject.getDepartment(), officerObject.getMilID(), officerObject.getRank()]);
            


    //          return res.status(200).json( {msg: "Officer updated!"});







    //     } catch (err) {
    //         return res.status(500).json({ err: err });

    //     }
    // }


    // static async deleteOfficer(req, res) {
    //     try {

    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);
    //           const checkOfficer = await query(
    //         "SELECT * from officers where mil_id = ?",
    //         [req.params.mil_id]
    //          );
            
            
    //          if (checkOfficer.length == 0) {
    //             return res.status(400).json({
    //                 errors: [
    //                     {
    //                         msg: "Officer does not exist"
    //                     }
    //                 ],
    //             }); 
    //          }
            

    //         await query("delete from officers where mil_id = ?", [checkOfficer[0].mil_id])

    //         return res.status(200).json({
    //             msg: "Officer deleted!"
    //         })



    //     } catch (err) {

    //         return res.status(500).json({ err: err });

    //     }
    // }


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
            const officers = await query(`SELECT ncos.mil_id, ncos.rank, ncos.name, ncos.department, nco_log.event_type, nco_log.event_time, leave_type.name AS reason
                                          FROM ncos
                                          LEFT JOIN nco_log
                                          ON nco_log.ncoID = ncos.id
                                          LEFT JOIN leave_type
                                          ON nco_log.leaveTypeID = leave_type.id`)

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

    // static async getOfficer(req, res) {
    //     try {
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);
           
    //         const officer = await query("select * from officers where id = ?",[req.params.id])

    //         if (officer.length == 0) {
    //             return res.status(404).json({
    //                 msg: "no officers found blah"
    //             })
    //         }

    //         // user.map((user) => {
    //         // });

    //         console.log(officer[0]); 

    //         const officerObject = new Officer(officer[0].name, officer[0].join_date, officer[0].department, officer[0].mil_id, officer[0].rank, officer[0].in_unit);
    //         return res.status(200).json(officerObject.toJSON());


 
    //     } catch (err) {
    //         return res.status(500).json({ err: err });
            
    //     }
    // }

    // static async getOfficersTmam(req, res) {
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
            
    //         const officers = await query(`SELECT officers.mil_id ,officers.rank,officers.name, officers.department, leave_type.name AS 'tmam'
    //                                       FROM officers
    //                                       LEFT JOIN officer_log
    //                                       ON officers.id = officer_log.officerID
    //                                       LEFT JOIN leave_type
    //                                       on leave_type.id = officer_log.leaveTypeID`)

            


                                          
    //         console.log(officers[0]);
    //         console.log("hello");
            
            

    //         if (officers.length == 0) {
    //             return res.status(404).json({
    //                 msg: "no officers found now"
    //             })
    //         }

    
        


            

            
  
    //         return res.status(200).json(officers);



    //     } catch (err) { 
    //         return res.status(500).json({ err: err });
            
    //     }
    // }

    




    // static async getSearchHistory(req, res) {
    //     try {
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);

    //         const { token } = req.headers;

    //         const user = await query("select * from users where token = ?",[token] )

    //         const history = await query("select * from search_history where user_id = ?", [user[0].id]);


 
    //         if (history.length == 0) {
    //             return res.status(404).json({
    //                 msg: "No history found"
    //             })
    //         }

    //         return res.status(200).json(history)




    //     } catch (err) {
    //         return res.status(500).json({ err: err });
    //     }
    // }


    // static async deleteHistory(req, res) {
    //     try {
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //         }

    //         const query = util.promisify(connection.query).bind(connection);



    //          await query("delete from search_history where id = ?", [req.params.id]);


 
            

    //         return res.status(200).json({
    //             msg: "History Cleared!"
    //         })




    //     } catch (err) {
    //         return res.status(500).json({ err: err });
    //     }
    // }

    
    }



module.exports = ncoLogController;