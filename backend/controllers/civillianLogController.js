const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const CivillianLog = require("../models/civillianLog");
const withTransaction = require("../utils/withTransaction");



class CivillianLogController {
  static async getCivilliansLog(req, res) {
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
          "WHERE civillians.name LIKE ? OR civillians.department LIKE ? OR civillians.nationalID LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM civillians ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Data query with pagination ---
      const dataQuery = `
            SELECT 
                civillians.nationalID, civillians.name, civillians.department,
                civillian_log.event_type, civillian_log.event_time,
                leave_type.name AS reason
            FROM civillians
            LEFT JOIN civillian_log ON civillian_log.civillianID = civillians.id
            LEFT JOIN civillian_leave_details ON civillian_leave_details.movementID = civillian_log.id
            LEFT JOIN leave_type ON civillian_leave_details.leaveTypeID = leave_type.id
            ${searchClause}
            ORDER BY civillians.name ASC
            LIMIT ? OFFSET ?
        `;
      params.push(limit, offset);
      const civillians = await query(dataQuery, params);

      if (!civillians.length) {
        return res.status(404).json({ msg: "No civillians found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: civillians,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: err.message });
    }
  }

  static async createArrival(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const civillianObject = new CivillianLog(
        req.body.event_type,
        req.body.event_time,
        req.body.civillianID,
        req.body.leaveTypeID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(civillianObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK civillian row to prevent race conditions
        const [civillian] = await query(
          "SELECT in_unit FROM civillians WHERE id = ? FOR UPDATE",
          [civillianObject.getCivillianID()]
        );

        if (!civillian) throw new Error("Civillian not found");

        // 2) Prevent double arrival
        if (civillian.in_unit === 1) {
          throw new Error(
            "Civillian already inside the unit (duplicate arrival prevented)"
          );
        }

        const civillianLogResult = await query(
          "insert into civillian_log set event_type = ?, event_time = ?, civillianID = ?, leaveTypeID = ?, notes = ?, loggerID = ?",
          [
            civillianObject.getEventType(),
            civillianObject.getEventTime(),
            civillianObject.getCivillianID(),
            civillianObject.getLeaveTypeID(),
            civillianObject.getNotes(),
            civillianObject.getLoggerID(),
          ]
        );

        const civillianLogId = civillianLogResult.insertId;

        await query("update civillians set in_unit = 1 where id = ?", [
          civillianObject.getCivillianID(),
        ]);

        await query(
          "insert into civillian_leave_details set movementID = ?, civillianID = ?, leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?",
          [
            civillianLogId,
            civillianObject.getCivillianID(),
            req.body.leaveTypeID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ]
        );
      });

      req.app.get("io").emit("civilliansUpdated");
      return res.status(200).json(civillianObject.toJSON());
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

      const civillianObject = new CivillianLog(
        req.body.event_type,
        req.body.event_time,
        req.body.civillianID,
        req.body.leaveTypeID,
        req.body.notes,
        req.body.loggerID
      );

      console.log(civillianObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK civillian row
        const [civillian] = await query(
          "SELECT in_unit FROM civillians WHERE id = ? FOR UPDATE",
          [civillianObject.getCivillianID()]
        );

        if (!civillian) throw new Error("Civillian not found");

        // 2) Prevent double departure
        if (civillian.in_unit === 0) {
          throw new Error(
            "Civillian already outside the unit (duplicate departure prevented)"
          );
        }

        const civillianLogResult = await query(
          "insert into civillian_log set event_type = ?, event_time = ?, civillianID = ?,  notes = ?, loggerID = ?",
          [
            civillianObject.getEventType(),
            civillianObject.getEventTime(),
            civillianObject.getCivillianID(),
            civillianObject.getNotes(),
            civillianObject.getLoggerID(),
          ]
        );

        const civillianLogId = civillianLogResult.insertId;

        await query("update civillians set in_unit = 0 where id = ?", [
          civillianObject.getCivillianID(),
        ]);

        await query(
          "insert into civillian_leave_details set movementID = ?, civillianID = ?, leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?",
          [
            civillianLogId,
            civillianObject.getCivillianID(),
            req.body.leaveTypeID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ]
        );
      });

      req.app.get("io").emit("civilliansUpdated");
      return res.status(200).json(civillianObject.toJSON());
    } catch (err) {
      console.error(err); // Log the error
      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: err.message });
    }
  }
}



module.exports = CivillianLogController;