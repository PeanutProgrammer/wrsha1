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
            const all = await query(`SELECT 
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    ol.event_type,
    ol.event_time,
    o.in_unit,
    'officer' AS role
FROM officers o
LEFT JOIN (
    SELECT l1.*
    FROM officer_log l1
    INNER JOIN (
        SELECT officerID, MAX(event_time) AS latest_event
        FROM officer_log
        WHERE event_type = 'دخول'
        GROUP BY officerID
    ) l2
        ON l1.officerID = l2.officerID
       AND l1.event_time = l2.latest_event
) ol ON ol.officerID = o.id
WHERE o.in_unit = 1

UNION ALL

SELECT 
    n.mil_id,
    n.rank,
    n.name,
    n.department,
    nl.event_type,
    nl.event_time,
    n.in_unit,
    'nco' AS role
FROM ncos n
LEFT JOIN (
    SELECT l1.*
    FROM nco_log l1
    INNER JOIN (
        SELECT ncoID, MAX(event_time) AS latest_event
        FROM nco_log
        WHERE event_type = 'دخول'
        GROUP BY ncoID
    ) l2
        ON l1.ncoID = l2.ncoID
       AND l1.event_time = l2.latest_event
) nl ON nl.ncoID = n.id
WHERE n.in_unit = 1

UNION ALL

SELECT 
    s.mil_id,
    s.rank,
    s.name,
    s.department,
    sl.event_type,
    sl.event_time,
    s.in_unit,
    'soldier' AS role
FROM soldiers s
LEFT JOIN (
    SELECT l1.*
    FROM soldier_log l1
    INNER JOIN (
        SELECT soldierID, MAX(event_time) AS latest_event
        FROM soldier_log
        WHERE event_type = 'دخول'
        GROUP BY soldierID
    ) l2
        ON l1.soldierID = l2.soldierID
       AND l1.event_time = l2.latest_event
) sl ON sl.soldierID = s.id
WHERE s.in_unit = 1;

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