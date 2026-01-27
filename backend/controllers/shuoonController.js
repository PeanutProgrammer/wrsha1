const Soldier = require("../models/soldier");
const NCO = require("../models/nco");
const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");

class shuoonController {
  static async getVacations(req, res) {
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
      let ncoSearchClause = "";
      let soldierSearchClause = "";
      const params = [];

      if (req.query.search) {
        const searchValue = `%${req.query.search}%`;
        // Add the search condition for each table individually
        ncoSearchClause = `
        AND (n.name LIKE ? OR n.department LIKE ? OR n.mil_id LIKE ? OR n.rank LIKE ?)
      `;
        soldierSearchClause = `
        AND (s.name LIKE ? OR s.department LIKE ? OR s.mil_id LIKE ? OR s.rank LIKE ?)
      `;
        // Push the search term into the params array for each table (4 times per table)
        for (let i = 0; i < 8; i++) {
          params.push(searchValue); // 4 params for each table
        }
      }

      // --- Type filter (soldiers, ncos, both) ---
      const type = req.query.type || "both"; // Default to 'both' if no type is provided

      let typeCondition = "";
      if (type === "soldiers") {
        typeCondition = "AND s.mil_id IS NOT NULL"; // Filter for soldiers
      } else if (type === "ncos") {
        typeCondition = "AND n.mil_id IS NOT NULL"; // Filter for NCOs
      }

      // --- Filter for 'Returning Today' ---
      const filterReturningToday = req.query.filterReturningToday === "true"; // Get the parameter from query string

      let soldiersReturningTodayCondition = "";
      let ncosReturningTodayCondition = "";
      if (filterReturningToday) {
        const today = moment().format("YYYY-MM-DD"); // Get today's date

        // Separate returning today condition for soldiers and NCOs
        soldiersReturningTodayCondition = `
        AND sl.end_date = ?  -- Filter for soldiers' returning today
      `;
        ncosReturningTodayCondition = `
        AND nl.end_date = ?  -- Filter for NCOs' returning today
      `;

        // Add today's date to the params for filtering
        params.push(today, today);
      }

      // --- Total count for pagination ---
      const countQuery = `
      SELECT COUNT(*) AS total FROM (   
        SELECT 1 FROM ncos n
        JOIN 
          nco_leave_details nl ON n.id = nl.ncoID
        JOIN 
          leave_type lt ON nl.leaveTypeID = lt.id
        WHERE 
          nl.leaveTypeID IN (1, 2, 3, 5, 6, 7, 11, 12, 13)  -- filter by leave types
          AND n.in_unit = 0  -- filter for NCOs not in unit
            AND CURDATE() BETWEEN nl.start_date AND nl.end_date

          AND nl.id = (
            -- Subquery to get the latest leave record for each NCO
            SELECT MAX(id) 
            FROM nco_leave_details 
            WHERE ncoID = n.id
          )
          ${ncoSearchClause}
          ${
            type === "soldiers" ? "AND 1=0" : ""
          } -- If filtering for soldiers, exclude NCOs
          ${ncosReturningTodayCondition}  -- Apply the returning today filter for NCOs if active

        UNION ALL

        SELECT 1 FROM soldiers s
        JOIN 
          soldier_leave_details sl ON s.id = sl.soldierID
        JOIN 
          leave_type lt ON sl.leaveTypeID = lt.id
        WHERE 
          sl.leaveTypeID IN (1, 2, 3, 5, 6, 7, 11, 12, 13)  -- filter by leave types
          AND s.in_unit = 0  -- filter for soldiers not in unit
            AND CURDATE() BETWEEN sl.start_date AND sl.end_date

          AND sl.id = (
            -- Subquery to get the latest leave record for each soldier
            SELECT MAX(id) 
            FROM soldier_leave_details 
            WHERE soldierID = s.id
          )
          ${soldierSearchClause}
          ${
            type === "ncos" ? "AND 1=0" : ""
          } -- If filtering for NCOs, exclude soldiers
          ${soldiersReturningTodayCondition}  -- Apply the returning today filter for soldiers if active
      ) AS combined
    `;

      // Execute the count query
      const countResult = await query(countQuery, params.length ? params : []);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Main query ---
      const allQuery = `
      SELECT 
        s.mil_id, 
        s.name, 
        s.rank, 
        s.department,
        sl.leaveTypeID,
        sl.start_date,
        sl.end_date,
        lt.name AS leave_type_name
      FROM 
        soldiers s
      JOIN 
        soldier_leave_details sl ON s.id = sl.soldierID
      JOIN 
        leave_type lt ON sl.leaveTypeID = lt.id
      WHERE 
        sl.leaveTypeID IN (1, 2, 3, 5, 6, 7, 11, 12, 13)  -- filter by leave types
        AND s.in_unit = 0  -- filter for soldiers not in unit
            AND CURDATE() BETWEEN sl.start_date AND sl.end_date  -- leave is ongoing today

        AND sl.id = (
          -- Subquery to get the latest leave record for each soldier
          SELECT MAX(id) 
          FROM soldier_leave_details 
          WHERE soldierID = s.id
        )
        ${soldierSearchClause}
        ${
          type === "ncos" ? "AND 1=0" : ""
        } -- If filtering for NCOs, exclude soldiers
        ${soldiersReturningTodayCondition}  -- Apply the returning today filter for soldiers if active

      UNION

      SELECT 
        n.mil_id, 
        n.name, 
        n.rank, 
        n.department,
        nl.leaveTypeID,
        nl.start_date,
        nl.end_date,
        lt.name AS leave_type_name
      FROM 
        ncos n
      JOIN 
        nco_leave_details nl ON n.id = nl.ncoID
      JOIN 
        leave_type lt ON nl.leaveTypeID = lt.id
      WHERE 
        nl.leaveTypeID IN (1, 2, 3, 5, 6, 7, 11, 12, 13)  -- filter by leave types
        AND n.in_unit = 0  -- filter for NCOs not in unit
            AND CURDATE() BETWEEN nl.start_date AND nl.end_date  -- leave is ongoing today

        AND nl.id = (
          -- Subquery to get the latest leave record for each NCO
          SELECT MAX(id) 
          FROM nco_leave_details 
          WHERE ncoID = n.id
        )
        ${ncoSearchClause}
        ${
          type === "soldiers" ? "AND 1=0" : ""
        } -- If filtering for soldiers, exclude NCOs
        ${ncosReturningTodayCondition}  -- Apply the returning today filter for NCOs if active

      LIMIT ? OFFSET ?
    `;

      // Execute the main query with pagination and filtering
      const result = await query(allQuery, [...params, limit, offset]);

      if (!result.length) {
        return res.status(404).json({ msg: "No one found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getMissions(req, res) {
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
      let ncoSearchClause = "";
      let soldierSearchClause = "";
      const params = [];

      if (req.query.search) {
        const searchValue = `%${req.query.search}%`;
        // Add the search condition for each table individually
        ncoSearchClause = `
        AND (n.name LIKE ? OR n.department LIKE ? OR n.mil_id LIKE ? OR n.rank LIKE ?)
      `;
        soldierSearchClause = `
        AND (s.name LIKE ? OR s.department LIKE ? OR s.mil_id LIKE ? OR s.rank LIKE ?)
      `;
        // Push the search term into the params array for each table (4 times per table)
        for (let i = 0; i < 8; i++) {
          params.push(searchValue); // 4 params for each table
        }
      }

      // --- Type filter (soldiers, ncos, both) ---
      const type = req.query.type || "both"; // Default to 'both' if no type is provided

      let typeCondition = "";
      if (type === "soldiers") {
        typeCondition = "AND s.mil_id IS NOT NULL"; // Filter for soldiers
      } else if (type === "ncos") {
        typeCondition = "AND n.mil_id IS NOT NULL"; // Filter for NCOs
      }

      // --- Filter for 'Returning Today' ---
      const filterFixedMission = req.query.filterFixedMission === "true"; // Get the parameter from query string

      // Filter for Fixed Mission (Leave Type ID 15)
      let soldiersFixedMissionCondition = "";
      let ncosFixedMissionCondition = "";
      if (filterFixedMission) {
        soldiersFixedMissionCondition = `AND sl.leaveTypeID = 15`; // Filter soldiers with leaveTypeID 15
        ncosFixedMissionCondition = `AND nl.leaveTypeID = 15`; // Filter NCOs with leaveTypeID 15
      }

      // --- Total count for pagination ---
      const countQuery = `
      SELECT COUNT(*) AS total FROM (   
        SELECT 1 FROM ncos n
        JOIN 
          nco_leave_details nl ON n.id = nl.ncoID
        JOIN 
          leave_type lt ON nl.leaveTypeID = lt.id
        WHERE 
          nl.leaveTypeID IN (4, 15, 19)  -- filter by leave types
          AND n.in_unit = 0  -- filter for NCOs not in unit
              AND CURDATE() BETWEEN nl.start_date AND nl.end_date  -- leave is ongoing today

          AND nl.id = (
            -- Subquery to get the latest leave record for each NCO
            SELECT MAX(id) 
            FROM nco_leave_details 
            WHERE ncoID = n.id
          )
          ${ncoSearchClause}
          ${
            type === "soldiers" ? "AND 1=0" : ""
          } -- If filtering for soldiers, exclude NCOs
          ${ncosFixedMissionCondition}  -- Apply the fixed mission filter for NCOs if active

        UNION ALL

        SELECT 1 FROM soldiers s
        JOIN 
          soldier_leave_details sl ON s.id = sl.soldierID
        JOIN 
          leave_type lt ON sl.leaveTypeID = lt.id
        WHERE 
          sl.leaveTypeID IN (4,15,19)  -- filter by leave types
          AND s.in_unit = 0  -- filter for soldiers not in unit
              AND CURDATE() BETWEEN sl.start_date AND sl.end_date  -- leave is ongoing today

          AND sl.id = (
            -- Subquery to get the latest leave record for each soldier
            SELECT MAX(id) 
            FROM soldier_leave_details 
            WHERE soldierID = s.id
          )
          ${soldierSearchClause}
          ${
            type === "ncos" ? "AND 1=0" : ""
          } -- If filtering for NCOs, exclude soldiers
          ${soldiersFixedMissionCondition}  -- Apply the fixed mission filter for soldiers if active
      ) AS combined
    `;

      // Execute the count query
      const countResult = await query(countQuery, params.length ? params : []);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Main query for soldiers and NCOs
      const allQuery = `
  SELECT 
    s.mil_id, 
    s.name, 
    s.rank, 
    s.department,
    sl.leaveTypeID,
    sl.start_date,
    sl.end_date,
    sl.destination,
    lt.name AS leave_type_name
  FROM 
    soldiers s
  JOIN 
    soldier_leave_details sl ON s.id = sl.soldierID
  JOIN 
    leave_type lt ON sl.leaveTypeID = lt.id
  WHERE 
    sl.leaveTypeID IN (4, 15, 19)  -- filter by leave types
    AND s.in_unit = 0  -- filter for soldiers not in unit
        AND CURDATE() BETWEEN sl.start_date AND sl.end_date  -- leave is ongoing today

    AND sl.id = (
      -- Subquery to get the latest leave record for each soldier
      SELECT MAX(id) 
      FROM soldier_leave_details 
      WHERE soldierID = s.id
    )
    ${soldierSearchClause}
    ${
      type === "ncos" ? "AND 1=0" : ""
    } -- If filtering for NCOs, exclude soldiers
    ${soldiersFixedMissionCondition}  -- Apply the fixed mission filter for soldiers if active

  UNION

  SELECT 
    n.mil_id, 
    n.name, 
    n.rank, 
    n.department,
    nl.leaveTypeID,
    nl.start_date,
    nl.end_date,
    nl.destination,
    lt.name AS leave_type_name
  FROM 
    ncos n
  JOIN 
    nco_leave_details nl ON n.id = nl.ncoID
  JOIN 
    leave_type lt ON nl.leaveTypeID = lt.id
  WHERE 
    nl.leaveTypeID IN (4, 15, 19)  -- filter by leave types
    AND n.in_unit = 0  -- filter for NCOs not in unit
        AND CURDATE() BETWEEN nl.start_date AND nl.end_date  -- leave is ongoing today

    AND nl.id = (
      -- Subquery to get the latest leave record for each NCO
      SELECT MAX(id) 
      FROM nco_leave_details 
      WHERE ncoID = n.id
    )
    ${ncoSearchClause}
    ${
      type === "soldiers" ? "AND 1=0" : ""
    } -- If filtering for soldiers, exclude NCOs
    ${ncosFixedMissionCondition}  -- Apply the fixed mission filter for NCOs if active

  LIMIT ? OFFSET ?
`;

      // Execute the main query with pagination and filtering
      const result = await query(allQuery, [...params, limit, offset]);

      if (!result.length) {
        return res.status(404).json({ msg: "No one found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getCourses(req, res) {
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
          "AND (o.name LIKE ? OR o.department LIKE ? OR o.mil_id LIKE ? OR o.rank LIKE ?)";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM ncos o WHERE 1 ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Main query ---
      const officersQuery = `
      SELECT 
        o.mil_id, 
        o.name, 
        o.rank, 
        o.department,
        old.leaveTypeID,
        old.start_date,
        old.end_date,
        old.destination,
        lt.name AS leave_type_name
      FROM 
        ncos o
      JOIN 
        nco_leave_details old ON o.id = old.ncoID
      JOIN 
        leave_type lt ON old.leaveTypeID = lt.id
      WHERE 
        old.leaveTypeID IN (8)
        AND o.in_unit = 0
        AND CURDATE() BETWEEN old.start_date AND old.end_date
        ${searchClause}
      LIMIT ? OFFSET ?`;

      // --- Execute the query ---
      const officers = await query(officersQuery, [...params, limit, offset]);

      if (!officers.length) {
        return res.status(404).json({ msg: "No officers found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: officers,
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

module.exports = shuoonController;
