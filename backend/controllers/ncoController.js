const NCO = require("../models/nco");
const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");

class NCOController {
  static async createNCO(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkNCO = await query(
        "SELECT * from ncos where mil_id = ?",
        [req.body.mil_id]
      );

      if (checkNCO.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Military ID already exists",
            },
          ],
        });
      }

      const ncoObject = new NCO(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.address,
        req.body.dob,
        true,
        req.body.attached || false
      );

      await query(
        "insert into ncos set name =?, join_date = ?, department = ?, mil_id = ?, `rank` = ?, address = ?, dob = ?, attached = ?",
        [
          ncoObject.getName(),
          ncoObject.getJoinDate(),
          ncoObject.getDepartment(),
          ncoObject.getMilID(),
          ncoObject.getRank(),
          ncoObject.getAddress(),
          ncoObject.getDOB(),
          ncoObject.getAttached(),
        ]
      );

      req.app.get("io").emit("ncosUpdated");
      return res.status(200).json(ncoObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async updateNCO(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkNCO = await query("SELECT * from ncos where id = ?", [
        req.params.id,
      ]);

      if (checkNCO.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "NCO does not exist",
            },
          ],
        });
      }

      const ncoObject = new NCO(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.address,
        req.body.dob,
        checkNCO[0].in_unit,
        req.body.attached || false
      );

      console.log("hello");

      await query(
        "update ncos set name =?, join_date = ?, department = ?, `rank` = ?, address = ?, dob = ?, attached = ? where id = ?",
        [
          ncoObject.getName(),
          ncoObject.getJoinDate(),
          ncoObject.getDepartment(),
          ncoObject.getRank(),
          ncoObject.getAddress(),
          ncoObject.getDOB(),
          ncoObject.getAttached(),
          checkNCO[0].id,
        ]
      );

      console.log("Name:", ncoObject.getName());
      console.log("Join Date:", ncoObject.getJoinDate());
      console.log("Department:", ncoObject.getDepartment());
      console.log("Mil ID:", ncoObject.getMilID());
      console.log("Rank:", ncoObject.getRank());

      console.log(req.body.department);

      req.app.get("io").emit("ncosUpdated");

      return res.status(200).json({ msg: "NCO updated!" });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async deleteNCO(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // Check if the nco exists
      const checkNCO = await query(
        "SELECT * FROM ncos WHERE mil_id = ?",
        [req.params.mil_id]
      );

      if (checkNCO.length === 0) {
        return res.status(400).json({
          errors: [{ msg: "NCO does not exist" }],
        });
      }

      // Create a PastNCO object with the nco's data
      const PastNCOObject = {
        mil_id: checkNCO[0].mil_id,
        rank: checkNCO[0].rank,
        name: checkNCO[0].name,
        join_date: checkNCO[0].join_date,
        address: checkNCO[0].address,
        dob: checkNCO[0].dob,
        // If you have additional fields such as 'end_date', 'transferID', etc.
        end_date: req.body.end_date || new Date().toISOString(),
        transferID: req.body.transferID || null,
        transferred_to: req.body.transferred_to || null,
      };

      // Insert the nco data into the past_ncos table
      await query(
        "INSERT INTO past_ncos (mil_id, `rank`, name, join_date, address, dob, end_date, transferID, transferred_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          PastNCOObject.mil_id,
          PastNCOObject.rank,
          PastNCOObject.name,
          PastNCOObject.join_date,
          PastNCOObject.address,
          PastNCOObject.dob,
          PastNCOObject.end_date,
          PastNCOObject.transferID,
          PastNCOObject.transferred_to,
        ]
      );

      // Now delete the nco from the ncos table
      await query("DELETE FROM ncos WHERE mil_id = ?", [
        checkNCO[0].mil_id,
      ]);

      // Emit the update (if you're using socket.io or any real-time system)
      req.app.get("io").emit("ncosUpdated");

      return res.status(200).json({
        msg: "NCO deleted and moved to past_ncos!",
      });
    } catch (err) {
      console.error("Error in deleting nco:", err);
      return res.status(500).json({ err: err.message || err });
    }
  }

  static async getNCOs(req, res) {
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
          "WHERE ncos.name LIKE ? OR ncos.department LIKE ? OR ncos.mil_id LIKE ? OR ncos.rank LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM ncos ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const ncos = await query(
        `select * from ncos ${searchClause} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      if (!ncos.length) {
        return res.status(404).json({ msg: "No ncos found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: ncos,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getNCO(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const nco = await query("select * from ncos where id = ?", [
        req.params.id,
      ]);

      if (nco.length == 0) {
        return res.status(404).json({
          msg: "no ncos found blah",
        });
      }

      // user.map((user) => {
      // });

      console.log(nco[0]);

      const ncoObject = new NCO(
        nco[0].name,
        nco[0].join_date,
        nco[0].department,
        nco[0].mil_id,
        nco[0].rank,
        nco[0].address,
        nco[0].dob,
        nco[0].in_unit,
        nco[0].attached
      );
      console.log(ncoObject.toJSON());
      return res.status(200).json(ncoObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getNCOsTmam(req, res) {
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
          "WHERE o.name LIKE ? OR o.department LIKE ? OR o.mil_id LIKE ? OR o.rank LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM ncos o ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const ncos = await query(
        `
SELECT 
  o.mil_id,
  o.rank,
  o.name,
  o.department,
  o.in_unit,

  (
    SELECT ol.event_time
    FROM nco_log ol
    WHERE ol.ncoID = o.id AND ol.event_type = 'خروج'
    ORDER BY ol.event_time DESC
    LIMIT 1
  ) AS latest_departure,

  (
    SELECT ol.event_time
    FROM nco_log ol
    WHERE ol.ncoID = o.id AND ol.event_type = 'دخول'
    ORDER BY ol.event_time DESC
    LIMIT 1
  ) AS latest_arrival,

  (
    SELECT old.id
    FROM nco_leave_details old
    WHERE old.ncoID = o.id
      AND CURDATE() BETWEEN old.start_date AND old.end_date
    LIMIT 1
  ) AS active_tmam_id,

  (
    SELECT lt.name
    FROM nco_leave_details old
    JOIN leave_type lt ON lt.id = old.leaveTypeID
    WHERE old.ncoID = o.id
      AND CURDATE() BETWEEN old.start_date AND old.end_date
    LIMIT 1
  ) AS active_tmam

FROM ncos o
${searchClause}
ORDER BY o.id
LIMIT ? OFFSET ?

`,
        [...params, limit, offset]
      );

      console.log(ncos[0]);
      console.log("hello");

      if (!ncos.length) {
        return res.status(404).json({ msg: "No ncos found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: ncos,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getNCOTmamDetails(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // Ensure nco exists
      const nco = await query("SELECT id FROM ncos WHERE mil_id = ?", [
        req.params.id,
      ]);

      if (nco.length === 0) {
        return res.status(404).json({
          msg: "NCO not found",
        });
      }

      // Past TMAMs (Shuoon only)
      const tmamHistory = await query(
        `
      SELECT
          o.mil_id,
          o.rank,
          o.name,
          o.department,

          old.id AS tmam_id,
          lt.name AS tmam,
          old.start_date,
          old.end_date,
          old.destination,
          old.duration,
          old.remaining

      FROM ncos o
      JOIN nco_leave_details old
          ON old.ncoID = o.id
      JOIN leave_type lt
          ON lt.id = old.leaveTypeID

      WHERE o.mil_id = ?
        AND old.end_date < CURDATE()
        AND lt.id IN (1,2,3,4,5,6,7,8,10,11,12,13,14,22)

      ORDER BY old.start_date DESC
      `,
        [req.params.id]
      );

      return res.status(200).json({
        ncoMilId: req.params.id,
        total: tmamHistory.length,
        data: tmamHistory,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async filterNCOs(req, res) {
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
        filters.push(`name LIKE ?`);
        params.push(`%${req.query.name}%`);
      }

      // Filter by department
      if (req.query.department) {
        filters.push(`department = ?`);
        params.push(req.query.department);
      }

      // Filter by rank
      if (req.query.rank) {
        filters.push("`rank` = ?");
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
      const whereClause =
        filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";
      const sql = `SELECT * FROM ncos ${whereClause}`;

      const ncos = await query(sql, params);

      if (ncos.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "No ncos found" }],
        });
      }

      // Optional: filter out ncos who joined in the future
      const validNCOs = ncos.filter((nco) =>
        moment(nco.join_date).isBefore(now)
      );

      return res.status(200).json(validNCOs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: err.message });
    }
  }

  static async getCurrentNCOs(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      let search = "";
      if (req.query.search) {
        search = `where name LIKE '%${req.query.search}%'`;
      }
      const ncos = await query(`select * from ncos where in_unit = 1 `);

      if (ncos.length == 0) {
        return res.status(404).json({
          msg: "no ncos found hey",
        });
      }

      return res.status(200).json(ncos);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getAbsentNCOs(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      let search = "";
      if (req.query.search) {
        search = `where name LIKE '%${req.query.search}%'`;
      }
      const ncos = await query(`
SELECT
    o.id,
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.in_unit,
    old.leaveTypeID,
    lt.name AS leave_type_name,
    ol.event_time
FROM ncos o

-- latest log for other purposes (unchanged)
LEFT JOIN (
    SELECT ncoID, MAX(event_time) AS latest_event
    FROM nco_log
    GROUP BY ncoID
) lastLog
    ON lastLog.ncoID = o.id

LEFT JOIN nco_log ol
    ON ol.ncoID = o.id 
    AND ol.event_time = lastLog.latest_event

-- 🔥 Get the LATEST leave_details row for each nco
LEFT JOIN nco_leave_details old
    ON old.id = (
        SELECT id
        FROM nco_leave_details
        WHERE ncoID = o.id
        ORDER BY id DESC
        LIMIT 1
    )

-- 🔥 Get leave type from nco_leave_details, not nco_log
LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID

WHERE o.in_unit = 0;

`);
      if (ncos.length == 0) {
        return res.status(404).json({
          msg: "no ncos found hey",
        });
      }

      return res.status(200).json(ncos);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getVacationingNCOs(req, res) {
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
      const countQuery = `SELECT COUNT(*) AS total FROM ncos o JOIN 
    nco_leave_details old ON o.id = old.ncoID
JOIN 
    leave_type lt ON old.leaveTypeID = lt.id
WHERE 
    old.leaveTypeID IN (1, 2, 3, 5, 6, 7, 11, 12, 13)  -- filter by leave types
    AND o.in_unit = 0  -- filter for ncos not in unit
    AND old.id = (
        -- Subquery to get the latest leave record for each nco
        SELECT MAX(id) 
        FROM nco_leave_details 
        WHERE ncoID = o.id
    )  ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Main query ---
      const ncosQuery = `
      SELECT 
    o.mil_id, 
    o.name, 
    o.rank, 
    o.department,
    old.leaveTypeID,
    old.start_date,
    old.end_date,
    old.remaining,
    old.duration,
    lt.name AS leave_type_name
FROM 
    ncos o
JOIN 
    nco_leave_details old ON o.id = old.ncoID
JOIN 
    leave_type lt ON old.leaveTypeID = lt.id
WHERE 
    old.leaveTypeID IN (1, 2, 3, 5, 6, 7, 11, 12, 13)  -- filter by leave types
    AND old.id = (
        -- Subquery to get the latest leave record for each nco
        SELECT MAX(id) 
        FROM nco_leave_details 
        WHERE ncoID = o.id
    )
         AND CURRENT_DATE() BETWEEN old.start_date AND old.end_date
    ${searchClause}  -- for any additional search filters
LIMIT ? OFFSET ?
`;

      // --- Execute the query ---
      const ncos = await query(ncosQuery, [...params, limit, offset]);

      if (!ncos.length) {
        return res.status(404).json({ msg: "No ncos found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: ncos,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getMissionNCOs(req, res) {
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
      const countQuery = `SELECT COUNT(*) AS total FROM ncos o JOIN nco_leave_details old ON o.id = old.ncoID
  WHERE o.in_unit = 0
    AND old.leaveTypeID IN (4, 15, 19)
    AND CURDATE() BETWEEN old.start_date AND old.end_date
    AND old.id = (
        -- Subquery to get the latest mission leave for each nco
        SELECT MAX(id) 
        FROM nco_leave_details 
        WHERE ncoID = o.id 
        AND leaveTypeID IN (4, 15, 19)  -- filter by mission leave types
    ) ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Main query ---
      const ncosQuery = `
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
    old.leaveTypeID IN (4, 15, 19)  -- filter for mission leave types
    AND o.in_unit = 0  -- ncos not in unit
    AND CURDATE() BETWEEN old.start_date AND old.end_date  -- leave is ongoing today
    AND old.id = (
        -- Subquery to get the latest mission leave for each nco
        SELECT MAX(id) 
        FROM nco_leave_details 
        WHERE ncoID = o.id 
        AND leaveTypeID IN (4, 15, 19)  -- filter by mission leave types
    )

        ${searchClause}
      LIMIT ? OFFSET ?`;

      // --- Execute the query ---
      const ncos = await query(ncosQuery, [...params, limit, offset]);

      if (!ncos.length) {
        return res.status(404).json({ msg: "No ncos found" });
      }

      console.log(ncosQuery);
      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: ncos,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getCourseNCOs(req, res) {
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
      const countQuery = `SELECT COUNT(*) AS total FROM ncos o JOIN 
        nco_leave_details old ON o.id = old.ncoID
      JOIN 
        leave_type lt ON old.leaveTypeID = lt.id
      WHERE 
        old.leaveTypeID IN (8)
        AND CURDATE() BETWEEN old.start_date AND old.end_date ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Main query ---
      const ncosQuery = `
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
        AND CURDATE() BETWEEN old.start_date AND old.end_date
        ${searchClause}
      LIMIT ? OFFSET ?`;

      // --- Execute the query ---
      const ncos = await query(ncosQuery, [...params, limit, offset]);

      if (!ncos.length) {
        return res.status(404).json({ msg: "No ncos found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: ncos,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getDailySummary(req, res) {
    try {
      const query = util.promisify(connection.query).bind(connection);
      const today = moment().format("YYYY-MM-DD"); // today

      // Fetch all ncos
      const ncos = await query(`
            SELECT 
        o.id,
        o.mil_id,
        o.rank,
        o.name,
        o.department,
        o.attached,

        -- Active leave for today
        old.id AS active_tmam_id,
        lt.name AS tmam
      FROM ncos o
      LEFT JOIN nco_leave_details old
        ON old.ncoID = o.id
      AND CURDATE() BETWEEN old.start_date AND old.end_date

      LEFT JOIN leave_type lt
        ON lt.id = old.leaveTypeID;

    `);

      if (!ncos.length) {
        return res.status(404).json({ msg: "No ncos found" });
      }

      // Total attached ncos
      const totalAttached = ncos.filter((o) => o.attached).length;
      const totalNCOs = ncos.length - totalAttached;

      // Available = ncos who have **no active tmam today**
      const available = ncos.filter((o) => !o.active_tmam_id).length;
      const missing = totalNCOs + totalAttached - available;

      const keyMap = {
        "فرقة / دورة": "فرقة_دورة",
        "بدل راحة": "بدل_راحة",
        "اجازة ميدانية": "اجازة_ميدانية",
        "اجازة سنوية": "اجازة_سنوية",
        "اجازة مرضية": "اجازة_مرضية",
      };
      // Count each tmam type
      const tmamCounts = {
        ثابتة: 0,
        فرقة_دورة: 0,
        راحة: 0,
        بدل_راحة: 0,
        عارضة: 0,
        اجازة_ميدانية: 0,
        منحة: 0,
        اجازة_سنوية: 0,
        اجازة_مرضية: 0,
        سفر: 0,
        مأمورية: 0,
        عيادة: 0,
      };

      ncos.forEach((nco) => {
        if (nco.tmam) {
          const key = keyMap[nco.tmam] || nco.tmam.replace(/\s/g, "_");
          if (tmamCounts.hasOwnProperty(key)) {
            tmamCounts[key]++;
          }
        }
      });

      const totalExits = Object.values(tmamCounts).reduce((a, b) => a + b, 0);
      const percentageAvailable = totalNCOs
        ? ((missing / (totalNCOs + totalAttached)) * 100).toFixed(2)
        : 0;

      return res.status(200).json({
        total: totalNCOs,
        available,
        attached: totalAttached,
        missing,
        تمام_الخوارج: tmamCounts,
        اجمالي_الخوارج: totalExits,
        percentageAvailable,
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

module.exports = NCOController;
