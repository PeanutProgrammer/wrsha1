const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const OfficerLog = require("../models/ncoLog");
const withTransaction = require("../utils/withTransaction");

class NcoLogController {
  static async getNcosLog(req, res) {
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
      const dataQuery = `SELECT ncos.mil_id, ncos.rank, ncos.name, ncos.department, nco_log.event_type, nco_log.event_time, leave_type.name AS reason, nco_log.notes
                                          FROM ncos
                                          LEFT JOIN nco_log
                                          ON nco_log.ncoID = ncos.id
                                          LEFT JOIN nco_leave_details
                                          ON nco_leave_details.movementID = nco_log.id
                                          LEFT JOIN leave_type
                                          ON nco_leave_details.leaveTypeID = leave_type.id
                ${searchClause}
                ORDER BY nco_log.event_time DESC
                LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      const ncos = await query(dataQuery, params);

      if (ncos.length == 0) {
        return res.status(404).json({
          msg: "no ncos found",
        });
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

  static async createArrival(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const officerObject = new OfficerLog(
        req.body.event_type,
        req.body.event_time,
        req.body.ncoID,
        req.body.leaveTypeID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(officerObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK nco row to prevent race conditions
        const [nco] = await query(
          "SELECT in_unit FROM ncos WHERE id = ? FOR UPDATE",
          [officerObject.getNcoID()]

          // 2) Validate nco is not already in unit
        );
        if (nco.in_unit === 1) {
          return res.status(400).json({
            errors: [
              {
                msg: "هذا العريف موجود بالفعل في الوحدة",
              },
            ],
          });
        }

        const officerLogResult = await query(
          "insert into nco_log set event_type = ?, event_time = ?, ncoID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
          [
            officerObject.getEventType(),
            officerObject.getEventTime(),
            officerObject.getNcoID(),
            officerObject.getLeaveTypeID(),
            officerObject.getNotes(),
            officerObject.getLoggerID(),
          ]
        );

        const officerLogId = officerLogResult.insertId;

        await query("update ncos set in_unit = 1 where id = ?", [
          officerObject.getNcoID(),
        ]);

        await query(
          "insert into nco_leave_details set movementID = ?, leaveTypeID = ?, ncoID = ?, start_date = ?, end_date = ?, destination = ?",
          [
            officerLogId,
            req.body.leaveTypeID,
            req.body.ncoID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ]
        );
      });

      req.app.get("io").emit("ncosUpdated");
      return res.status(200).json(officerObject.toJSON());
    } catch (err) {
      console.error(err); // Log the error
      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: err.message });
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
        req.body.ncoID,
        req.body.leaveTypeID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(officerObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK nco row to prevent race conditions
        const [nco] = await query(
          "SELECT in_unit FROM ncos WHERE id = ? FOR UPDATE",
          [officerObject.getNcoID()]

          // 2) Validate nco is currently in unit
        );
        if (nco.in_unit === 0) {
          return res.status(400).json({
            errors: [
              {
                msg: "هذا العريف غير موجود في الوحدة حالياً",
              },
            ],
          });
        }

        const officerLogResult = await query(
          "insert into nco_log set event_type = ?, event_time = ?, ncoID = ?,  notes = ?, loggerID = ?",
          [
            officerObject.getEventType(),
            officerObject.getEventTime(),
            officerObject.getNcoID(),
            officerObject.getNotes(),
            officerObject.getLoggerID(),
          ]
        );

        const officerLogId = officerLogResult.insertId;

        await query("update ncos set in_unit = 0 where id = ?", [
          officerObject.getNcoID(),
        ]);

        await query(
          "insert into nco_leave_details set movementID = ?, ncoID = ?, leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?",
          [
            officerLogId,
            req.body.ncoID,
            req.body.leaveTypeID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ]
        );
      });
      req.app.get("io").emit("ncosUpdated");
      return res.status(200).json(officerObject.toJSON());
    } catch (err) {
      console.error(err); // Log the error
      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: err.message });
    }
  }

  static async createTmam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
      }
      const { ncoID, leaveTypeID, start_date, end_date, destination } =
        req.body;

      const query = util.promisify(connection.query).bind(connection);

      const result = await query(
        `INSERT INTO nco_leave_details (ncoID, leaveTypeID, start_date, end_date, destination)
                 VALUES (?, ?, ?, ?, ?)`,
        [ncoID, leaveTypeID, start_date, end_date, destination]
      );

      return res
        .status(201)
        .json({ msg: "تمت الإضافة بنجاح", id: result.insertId });
    } catch (err) {
      return res.status(500).json({ err });
    }
  }

  static async updateTmam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
      }
      const { leaveTypeID, start_date, end_date, destination } = req.body;
      const leaveID = req.params.id;

      const query = util.promisify(connection.query).bind(connection);

      const existing = await query(
        `SELECT * FROM nco_leave_details WHERE id = ?`,
        [leaveID]
      );

      if (existing.length === 0) {
        return res.status(404).json({ msg: "Record not found" });
      }

      await query(
        `UPDATE nco_leave_details
             SET leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?
             WHERE id = ?`,
        [
          leaveTypeID || null,
          start_date || null,
          end_date || null,
          destination || null,
          leaveID,
        ]
      );
      req.app.get("io").emit("ncosUpdated");

      return res.status(200).json({ msg: "تم التحديث بنجاح" });
    } catch (err) {
      return res.status(500).json({ err });
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
}

module.exports = NcoLogController;
