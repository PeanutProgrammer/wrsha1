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
        
        // --- Pagination params ---
        const page = parseInt(req.query.page) || 1; // default to page 1
        const limit = parseInt(req.query.limit) || 20; // default 20 rows per page
        const offset = (page - 1) * limit;

        // --- Search params ---
        let officerSearchClause = "";
        let ncoSearchClause = "";
        let soldierSearchClause = "";
        const params = [];
        
        if (req.query.search) {
            const searchValue = `%${req.query.search}%`;
            // Add the search condition for each table individually
            officerSearchClause = `
                AND (o.name LIKE ? OR o.department LIKE ? OR o.mil_id LIKE ? OR o.rank LIKE ?)
            `;
            ncoSearchClause = `
                AND (n.name LIKE ? OR n.department LIKE ? OR n.mil_id LIKE ? OR n.rank LIKE ?)
            `;
            soldierSearchClause = `
                AND (s.name LIKE ? OR s.department LIKE ? OR s.mil_id LIKE ? OR s.rank LIKE ?)
            `;
            // Push the search term into the params array for each table (4 times per table)
            for (let i = 0; i < 12; i++) {
                params.push(searchValue); // 4 params for each table
            }
        }

        // --- Total count for pagination ---
        const countQuery = `
            SELECT COUNT(*) AS total FROM (
                SELECT 1 FROM officers o
                WHERE o.in_unit = 1 ${officerSearchClause}
                
                UNION ALL
                
                SELECT 1 FROM ncos n
                WHERE n.in_unit = 1 ${ncoSearchClause}
                
                UNION ALL
                
                SELECT 1 FROM soldiers s
                WHERE s.in_unit = 1 ${soldierSearchClause}
            ) AS combined
        `;
        
        // If there's no search, don't use the search parameters, use a query without search conditions
        const countResult = await query(countQuery, params.length ? params : []);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // --- Main data query (with UNION and pagination) ---
        const all = await query(`
            SELECT 
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
                ) l2 ON l1.officerID = l2.officerID
                    AND l1.event_time = l2.latest_event
            ) ol ON ol.officerID = o.id
            WHERE o.in_unit = 1 ${officerSearchClause}
            
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
                ) l2 ON l1.ncoID = l2.ncoID
                    AND l1.event_time = l2.latest_event
            ) nl ON nl.ncoID = n.id
            WHERE n.in_unit = 1 ${ncoSearchClause}
            
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
                ) l2 ON l1.soldierID = l2.soldierID
                    AND l1.event_time = l2.latest_event
            ) sl ON sl.soldierID = s.id
            WHERE s.in_unit = 1 ${soldierSearchClause}
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        if (all.length === 0) {
            return res.status(404).json({
                msg: "No one found"
            });
        }

        return res.status(200).json({
            page,
            limit,
            total,
            totalPages,
            data: all,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "An unexpected error occurred",
            error: err.message,
        });
    }
}















}


module.exports = UnitController;