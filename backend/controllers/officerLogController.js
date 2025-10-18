const Officer = require("../models/officerLog");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


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
            const officers = await query(`SELECT officers.mil_id, officers.rank, officers.name, officers.department, officer_log.event_type, officer_log.event_time, leave_type.name AS reason
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



module.exports = OfficerLogController;