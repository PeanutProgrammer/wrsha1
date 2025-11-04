const LeaveType = require("../models/leaveType");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class LeaveTypeController {





    static async getLeaveTypes(req, res) {
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
            const leaveTypes = await query(`select * from leave_type ${search}`)

            if (leaveTypes.length == 0) {
                return res.status(404).json({
                    msg: "no leave types found"
                })
            }

            return res.status(200).json(leaveTypes);

        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }


}


module.exports = LeaveTypeController;