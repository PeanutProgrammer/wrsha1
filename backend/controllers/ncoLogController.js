const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const NCOLog = require("../models/ncoLog");
const NCO = require("../models/nco");
const withTransaction = require("../utils/withTransaction");

class NCOLogController {
  static async createTmam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        ncoID,
        leaveTypeID,
        start_date,
        end_date,
        destination,
        remaining,
        duration,
        notes,
      } = req.body;

      const query = util.promisify(connection.query).bind(connection);

      // 🔴 STEP 1: overlap check (BUSINESS LOGIC)
      const overlap = await query(
        `
      SELECT id
      FROM nco_leave_details
      WHERE ncoID = ?
        AND start_date <= ?
        AND end_date >= ?
      LIMIT 1
      `,
        [ncoID, end_date, start_date]
      );

      if (overlap.length > 0) {
        return res.status(409).json({
          msg: "يوجد تمام متداخل مع هذه الفترة لهذا الصف ضابط",
        });
      }

      // 🟢 STEP 2: insert tmam
      const result = await query(
        `
      INSERT INTO nco_leave_details
      (ncoID, leaveTypeID, start_date, end_date, destination, remaining, duration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          ncoID,
          leaveTypeID,
          start_date,
          end_date,
          destination,
          remaining,
          duration,
          notes,
        ]
      );

      req.app.get("io").emit("ncosUpdated");

      return res.status(201).json({
        msg: "تمت الإضافة بنجاح",
        id: result.insertId,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: `Server error: ${err.message}` });
    }
  }

  static async updateTmam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        leaveTypeID,
        start_date,
        end_date,
        destination,
        remaining,
        duration,
        notes,
      } = req.body;

      const leaveID = req.params.id;
      const query = util.promisify(connection.query).bind(connection);

      // 1️⃣ Get existing record
      const existing = await query(
        `SELECT * FROM nco_leave_details WHERE id = ?`,
        [leaveID]
      );

      if (existing.length === 0) {
        return res.status(404).json({ msg: "Record not found" });
      }

      const today = new Date().toISOString().slice(0, 10);

      if (existing[0].end_date < today) {
        return res.status(403).json({
          msg: "لا يمكن تعديل تمام منتهي",
        });
      }

      const ncoID = existing[0].ncoID;

      // 2️⃣ Check for overlapping tmam (exclude current record)
      const overlap = await query(
        `
      SELECT id FROM nco_leave_details
      WHERE ncoID = ?
        AND id != ?
        AND (
          (? <= end_date AND ? >= start_date)
        )
      `,
        [ncoID, leaveID, start_date, end_date]
      );

      if (overlap.length > 0) {
        return res.status(409).json({
          msg: "يوجد تمام متداخل مع هذه الفترة لنفس الصف ضابط",
        });
      }

      // 3️⃣ Safe update
      await query(
        `
      UPDATE nco_leave_details
      SET
        leaveTypeID = ?,
        start_date  = ?,
        end_date    = ?,
        destination = ?,
        remaining = ?,
        duration = ?,
        notes       = ?
      WHERE id = ?
      `,
        [
          leaveTypeID ?? null,
          start_date,
          end_date,
          destination ?? null,
          remaining ?? null,
          duration ?? null,
          notes ?? null,
          leaveID,
        ]
      );

      req.app.get("io").emit("ncosUpdated");

      return res.status(200).json({ msg: "تم التحديث بنجاح" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server error" });
    }
  }

  static async getNCOsLog(req, res) {
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
          "WHERE ncos.name LIKE ? OR ncos.department LIKE ? OR ncos.mil_id LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM ncos ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Data query with pagination ---
      const dataQuery = `SELECT ncos.mil_id, ncos.rank, ncos.name, ncos.department, nco_log.event_type, nco_log.event_time, nco_log.notes
                                          FROM ncos
                                          LEFT JOIN nco_log
                                          ON nco_log.ncoID = ncos.id
                                          ${searchClause}
                                          order by nco_log.event_time DESC
                                          LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      const ncos = await query(dataQuery, params);

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

  static async getLatestTmam(req, res) {
    try {
      const ncoID = req.params.id;
      const query = util.promisify(connection.query).bind(connection);

      const result = await query(
        `
      SELECT
        tmam.id AS leaveID,
        tmam.leaveTypeID,
        tmam.start_date,
        tmam.end_date,
        tmam.destination,
        tmam.notes,
        lt.name AS leaveTypeName,
        o.id AS ncoID,
        o.name AS ncoName,
        o.rank AS ncoRank
      FROM nco_leave_details tmam
      INNER JOIN ncos o
        ON o.id = tmam.ncoID
      LEFT JOIN leave_type lt
        ON lt.id = tmam.leaveTypeID
      WHERE tmam.ncoID = ?
        AND CURDATE() BETWEEN tmam.start_date AND tmam.end_date
      ORDER BY tmam.start_date DESC
      LIMIT 1
      `,
        [ncoID]
      );

      if (result.length === 0) {
        return res.status(404).json({
          msg: "No active Tmam for today",
        });
      }

      return res.status(200).json(result[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server error" });
    }
  }

  static async createArrival(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ncoObject = new NCOLog(
        req.body.event_type,
        req.body.event_time,
        req.body.ncoID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(ncoObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK nco row to prevent race conditions
        const [nco] = await query(
          "SELECT in_unit FROM ncos WHERE id = ? FOR UPDATE",
          [ncoObject.getNcoID()]
        );
        // 2) Validate nco is not already in unit
        if (nco.in_unit === 1) {
          return res.status(400).json({
            errors: [
              {
                msg: "NCO is already in unit",
              },
            ],
          });
        }

        console.log(ncoObject.getLoggerID());
        

        const ncoLogResult = await query(
          "insert into nco_log set event_type = ?, event_time = ?, ncoID = ?, notes = ?, loggerID = ?",
          [
            ncoObject.getEventType(),
            ncoObject.getEventTime(),
            ncoObject.getNcoID(),
            ncoObject.getNotes(),
            ncoObject.getLoggerID(),
          ]
        );

        const ncoLogId = ncoLogResult.insertId;

        await query("update ncos set in_unit = 1 where id = ?", [
          ncoObject.getNcoID(),
        ]);
      });

      req.app.get("io").emit("ncosUpdated");
      return res.status(200).json(ncoObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err.message });
    }
  }

  static async createDeparture(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
      }

      const ncoObject = new NCOLog(
        req.body.event_type,
        req.body.event_time,
        req.body.ncoID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(ncoObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK nco row to prevent race conditions
        const [nco] = await query(
          "SELECT in_unit FROM ncos WHERE id = ? FOR UPDATE",
          [ncoObject.getNcoID()]
        );
        // 2) Validate nco is not already in unit
        if (nco.in_unit === 0) {
          return res.status(400).json({
            errors: [
              {
                msg: "NCO is already outside",
              },
            ],
          });
        }

        const ncoLogResult = await query(
          "insert into nco_log set event_type = ?, event_time = ?, ncoID = ?, notes = ?, loggerID = ?",
          [
            ncoObject.getEventType(),
            ncoObject.getEventTime(),
            ncoObject.getNcoID(),
            ncoObject.getNotes(),
            ncoObject.getLoggerID(),
          ]
        );

        const ncoLogId = ncoLogResult.insertId;

        await query("update ncos set in_unit = 0 where id = ?", [
          ncoObject.getNcoID(),
        ]);
      });
      req.app.get("io").emit("ncosUpdated");
      return res.status(200).json(ncoObject.toJSON());
    } catch (err) {
      console.error(err); // Log the error
      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: err.message });
    }
  }

  static async getOneTmam(req, res) {
    try {
      const leaveID = req.params.id;
      const query = util.promisify(connection.query).bind(connection);

      const result = await query(
        `SELECT 
                old.id AS leaveID,
                old.leaveTypeID,
                old.start_date,
                old.end_date,
                old.destination,
                nco.name AS ncoName,
                nco.rank AS ncoRank,
                nco.id AS ncoID
            FROM nco_leave_details old
            LEFT JOIN ncos AS nco
                ON nco.id = old.ncoID
            WHERE old.id = ?`,
        [leaveID]
      );

      if (result.length === 0) {
        return res.status(404).json({ msg: "Record not found" });
      }

      return res.status(200).json(result[0]);
    } catch (err) {
      return res.status(500).json({ err });
    }
  }

  static async getNCOVacationLog(req, res) {
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
      const nco = await query("select * from ncos where mil_id = ?", [
        req.params.id,
      ]);
      console.log("hey");
      if (nco.length == 0) {
        return res.status(404).json({
          msg: "no ncos found blah",
        });
      }

      const ncoObject = new NCO(
        nco[0].name,
        nco[0].join_date,
        nco[0].department,
        nco[0].mil_id,
        nco[0].rank,
        nco[0].in_unit
      );
      const ncoTmam = await query(
        `SELECT ncos.mil_id ,ncos.rank,ncos.name, ncos.in_unit, nco_log.event_type, nco_log.event_time, ncos.department, leave_type.name AS 'tmam', nco_leave_details.start_date, nco_leave_details.end_date, nco_leave_details.destination, nco_log.notes
                                          FROM ncos
                                          LEFT JOIN nco_leave_details
                                          ON nco_leave_details.ncoID = ncos.id
                                          LEFT JOIN leave_type
                                          on leave_type.id = nco_leave_details.leaveTypeID
                                          LEFT JOIN nco_log
                                          ON nco_log.id = nco_leave_details.movementID
                                          WHERE ncos.mil_id = ?
                                          AND leave_type.id IN (1,2,3,5,6,7,11,12,13)
                                          ORDER BY nco_leave_details.id DESC
                                          `,
        [ncoObject.getMilID()]
      );

      return res.status(200).json(ncoTmam);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }
}

module.exports = NCOLogController;
