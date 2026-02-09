const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const OfficerLog = require("../models/officerLog");
const Officer = require("../models/officer");
const withTransaction = require("../utils/withTransaction");

class OfficerLogController {
  static async createTmam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        officerID,
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
      FROM officer_leave_details
      WHERE officerID = ?
        AND start_date <= ?
        AND end_date >= ?
      LIMIT 1
      `,
        [officerID, end_date, start_date]
      );

      if (overlap.length > 0) {
        return res.status(409).json({
          msg: "يوجد تمام متداخل مع هذه الفترة لهذا الضابط",
        });
      }

      // 🟢 STEP 2: insert tmam
      const result = await query(
        `
      INSERT INTO officer_leave_details
      (officerID, leaveTypeID, start_date, end_date, destination, remaining, duration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          officerID,
          leaveTypeID,
          start_date,
          end_date,
          destination,
          remaining,
          duration,
          notes,
        ]
      );

      req.app.get("io").emit("officersUpdated");

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
        `SELECT * FROM officer_leave_details WHERE id = ?`,
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

      const officerID = existing[0].officerID;

      // 2️⃣ Check for overlapping tmam (exclude current record)
      const overlap = await query(
        `
      SELECT id FROM officer_leave_details
      WHERE officerID = ?
        AND id != ?
        AND (
          (? <= end_date AND ? >= start_date)
        )
      `,
        [officerID, leaveID, start_date, end_date]
      );

      if (overlap.length > 0) {
        return res.status(409).json({
          msg: "يوجد تمام متداخل مع هذه الفترة لنفس الضابط",
        });
      }

      // 3️⃣ Safe update
      await query(
        `
      UPDATE officer_leave_details
      SET
        leaveTypeID = ?,
        start_date  = ?,
        end_date    = ?,
        destination = ?,
        remaining   = ?,
        duration    = ?,
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

      req.app.get("io").emit("officersUpdated");

      return res.status(200).json({ msg: "تم التحديث بنجاح" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server error" });
    }
  }

  static async getOfficersLog(req, res) {
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
          "WHERE officers.name LIKE ? OR officers.department LIKE ? OR officers.mil_id LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM officers ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Data query with pagination ---
      const dataQuery = `SELECT officers.mil_id, officers.rank, officers.name, officers.department, officer_log.event_type, officer_log.event_time, officer_log.notes
                                          FROM officers
                                          LEFT JOIN officer_log
                                          ON officer_log.officerID = officers.id
                                          ${searchClause}
                                          order by officer_log.event_time DESC
                                          LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      const officers = await query(dataQuery, params);

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

  static async getLatestTmam(req, res) {
    try {
      const officerID = req.params.id;
      const query = util.promisify(connection.query).bind(connection);

      const result = await query(
        `
      SELECT
        tmam.id AS leaveID,
        tmam.leaveTypeID,
        tmam.start_date,
        tmam.end_date,
        tmam.destination,
        tmam.remaining,
        tmam.duration,
        tmam.notes,
        lt.name AS leaveTypeName,
        o.id AS officerID,
        o.name AS officerName,
        o.rank AS officerRank
      FROM officer_leave_details tmam
      INNER JOIN officers o
        ON o.id = tmam.officerID
      LEFT JOIN leave_type lt
        ON lt.id = tmam.leaveTypeID
      WHERE tmam.officerID = ?
        AND CURDATE() BETWEEN tmam.start_date AND tmam.end_date
      ORDER BY tmam.start_date DESC
      LIMIT 1
      `,
        [officerID]
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

      const officerObject = new OfficerLog(
        req.body.event_type,
        req.body.event_time,
        req.body.officerID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(officerObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK officer row to prevent race conditions
        const [officer] = await query(
          "SELECT in_unit FROM officers WHERE id = ? FOR UPDATE",
          [officerObject.getOfficerID()]
        );
        // 2) Validate officer is not already in unit
        if (officer.in_unit === 1) {
          return res.status(400).json({
            errors: [
              {
                msg: "Officer is already in unit",
              },
            ],
          });
        }

        const officerLogResult = await query(
          "insert into officer_log set event_type = ?, event_time = ?, officerID = ?, notes = ?, loggerID = ?",
          [
            officerObject.getEventType(),
            officerObject.getEventTime(),
            officerObject.getOfficerID(),
            officerObject.getNotes(),
            officerObject.getLoggerID(),
          ]
        );

        const officerLogId = officerLogResult.insertId;

        await query("update officers set in_unit = 1 where id = ?", [
          officerObject.getOfficerID(),
        ]);
      });

      req.app.get("io").emit("officersUpdated");
      return res.status(200).json(officerObject.toJSON());
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

      const officerObject = new OfficerLog(
        req.body.event_type,
        req.body.event_time,
        req.body.officerID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(officerObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK officer row to prevent race conditions
        const [officer] = await query(
          "SELECT in_unit FROM officers WHERE id = ? FOR UPDATE",
          [officerObject.getOfficerID()]
        );
        // 2) Validate officer is not already in unit
        if (officer.in_unit === 0) {
          return res.status(400).json({
            errors: [
              {
                msg: "Officer is already outside",
              },
            ],
          });
        }

        const officerLogResult = await query(
          "insert into officer_log set event_type = ?, event_time = ?, officerID = ?, notes = ?, loggerID = ?",
          [
            officerObject.getEventType(),
            officerObject.getEventTime(),
            officerObject.getOfficerID(),
            officerObject.getNotes(),
            officerObject.getLoggerID(),
          ]
        );

        const officerLogId = officerLogResult.insertId;

        await query("update officers set in_unit = 0 where id = ?", [
          officerObject.getOfficerID(),
        ]);
      });
      req.app.get("io").emit("officersUpdated");
      return res.status(200).json(officerObject.toJSON());
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
                old.remaining,
                old.duration,
                officer.name AS officerName,
                officer.rank AS officerRank,
                officer.id AS officerID
            FROM officer_leave_details old
            LEFT JOIN officers AS officer
                ON officer.id = old.officerID
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

 static async getOfficerVacationLog(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = util.promisify(connection.query).bind(connection);

    // 1️⃣ Get officer
    const officer = await query(
      "SELECT id, mil_id, name, rank, department FROM officers WHERE mil_id = ?",
      [req.params.id]
    );

    if (officer.length === 0) {
      return res.status(404).json({ msg: "Officer not found" });
    }

    const officerID = officer[0].id;

    // 2️⃣ Get vacation history (Shuoon only)
    const vacationLog = await query(
      `
      SELECT 
        o.mil_id,
        o.name,
        o.rank,
        o.department,

        old.id AS leave_id,
        lt.name AS tmam,
        old.start_date,
        old.end_date,
        old.destination,
        old.duration,
        old.remaining,
        old.notes


      FROM officer_leave_details old
      JOIN leave_type lt ON lt.id = old.leaveTypeID
      JOIN officers o ON o.id = old.officerID

      WHERE old.officerID = ?
        AND old.leaveTypeID IN (1,2,3,5,6,7,11,12,13)

      ORDER BY old.start_date DESC
      `,
      [officerID]
    );

    return res.status(200).json(vacationLog);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
}

}

module.exports = OfficerLogController;
