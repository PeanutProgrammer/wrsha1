const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class UnitController {


       static async getAllInUnit(req, res) {
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
            const all = await query(`SELECT mil_id, officers.rank, name, department, join_date, in_unit, 'officer' AS role
                                    FROM officers
                                    WHERE in_unit = 1

                                    UNION

                                    SELECT mil_id, ncos.rank, name, department, join_date, in_unit, 'nco' AS role
                                    FROM ncos
                                    WHERE in_unit = 1

                                    UNION

                                    SELECT mil_id, soldiers.rank, name, department, join_date, in_unit, 'soldier' AS role
                                    FROM soldiers
                                    WHERE in_unit = 1;
                                                        `)

            if (all.length == 0) {
                return res.status(404).json({
                    msg: "no one found"
                })
            }

    
        


            

            
  
            return res.status(200).json(all);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }






}


module.exports = UnitController;