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
        console.log(errors.array()); // Log errors
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
      } = req.body;

      const query = util.promisify(connection.query).bind(connection);

      const result = await query(
        `INSERT INTO officer_leave_details (officerID, leaveTypeID, start_date, end_date, destination, remaining, duration)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [officerID, leaveTypeID, start_date, end_date, destination, remaining, duration],
      );

      req.app.get("io").emit("officersUpdated");

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
      const { leaveTypeID, start_date, end_date, destination, remaining, duration } =
        req.body;
      const leaveID = req.params.id;

      const query = util.promisify(connection.query).bind(connection);

      const existing = await query(
        `SELECT * FROM officer_leave_details WHERE id = ?`,
        [leaveID],
      );

      if (existing.length === 0) {
        return res.status(404).json({ msg: "Record not found" });
      }

      await query(
        `UPDATE officer_leave_details 
             SET leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?, remaining = ?, duration = ?
             WHERE id = ?`,
        [
          leaveTypeID || null,
          start_date || null,
          end_date || null,
          destination || null,
          remaining || null,
          duration || null,
          leaveID,
        ],
      );
      req.app.get("io").emit("officersUpdated");
      return res.status(200).json({ msg: "تم التحديث بنجاح" });
    } catch (err) {
      return res.status(500).json({ err });
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
      const dataQuery = `SELECT officers.mil_id, officers.rank, officers.name, officers.department, officer_log.event_type, officer_log.event_time, leave_type.name AS reason, officer_log.notes
                                          FROM officers
                                          LEFT JOIN officer_log
                                          ON officer_log.officerID = officers.id
                                          LEFT JOIN officer_leave_details
                                          ON officer_leave_details.movementID = officer_log.id
                                          LEFT JOIN leave_type
                                          ON officer_leave_details.leaveTypeID = leave_type.id
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
        `SELECT 
                officer_log.id AS movementID,
                officer_leave_details.id AS leaveID,
                officer_leave_details.leaveTypeID,
                officer_leave_details.start_date,
                officer_leave_details.end_date,
                officer_leave_details.destination,
                officer_leave_details.remaining,
                officer_leave_details.duration,
                leave_type.name AS leaveTypeName,
                officer.name AS officerName,
                officer.rank AS officerRank,
                officer_log.event_time
            FROM officer_log
            LEFT JOIN officers AS officer
            LEFT JOIN officer_leave_details
                ON officer_leave_details.movementID = officer_log.id
            LEFT JOIN leave_type
                ON leave_type.id = officer_leave_details.leaveTypeID
            WHERE officer_log.officerID = ?
            ORDER BY officer_log.event_time DESC
            LIMIT 1`,
        [officerID],
      );

      if (result.length === 0) {
        return res
          .status(404)
          .json({ msg: "No Tmam records found for this officer" });
      }

      return res.status(200).json(result[0]);
    } catch (err) {
      return res.status(500).json({ err });
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
        req.body.loggerID,
      );

      console.log(officerObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK officer row to prevent race conditions
        const [officer] = await query(
          "SELECT in_unit FROM officers WHERE id = ? FOR UPDATE",
          [officerObject.getOfficerID()],
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
          ],
        );

        const officerLogId = officerLogResult.insertId;

        await query("update officers set in_unit = 1 where id = ?", [
          officerObject.getOfficerID(),
        ]);

        await query(
          "insert into officer_leave_details set movementID = ?, leaveTypeID = ?, officerID = ?, start_date = ?, end_date = ?, destination = ?",
          [
            officerLogId,
            req.body.leaveTypeID,
            req.body.officerID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ],
        );
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
        req.body.loggerID,
      );

      console.log(officerObject.toJSON());

      await withTransaction(async (query) => {
        // 1) LOCK officer row to prevent race conditions
        const [officer] = await query(
          "SELECT in_unit FROM officers WHERE id = ? FOR UPDATE",
          [officerObject.getOfficerID()],
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
          ],
        );

        const officerLogId = officerLogResult.insertId;

        await query("update officers set in_unit = 0 where id = ?", [
          officerObject.getOfficerID(),
        ]);

        await query(
          "insert into officer_leave_details set movementID = ?, leaveTypeID = ?, officerID = ?, start_date = ?, end_date = ?, destination = ?",
          [
            officerLogId,
            req.body.leaveTypeID,
            req.body.officerID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ],
        );
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
        [leaveID],
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
      // let search = ""
      // if (req.query.search) {
      //     search =  `where name LIKE '%${req.query.search}%'`
      // }
      const officer = await query("select * from officers where mil_id = ?", [
        req.params.id,
      ]);
      console.log("hey");
      if (officer.length == 0) {
        return res.status(404).json({
          msg: "no officers found blah",
        });
      }

      const officerObject = new Officer(
        officer[0].name,
        officer[0].join_date,
        officer[0].department,
        officer[0].mil_id,
        officer[0].rank,
        officer[0].in_unit,
      );
      const officerTmam = await query(
        `SELECT officers.mil_id ,officers.rank,officers.name, officers.in_unit, officer_log.event_type, officer_log.event_time, officers.department, leave_type.name AS 'tmam', officer_leave_details.start_date, officer_leave_details.end_date, officer_leave_details.destination, officer_log.notes
                                          FROM officers
                                          LEFT JOIN officer_leave_details
                                          ON officer_leave_details.officerID = officers.id
                                          LEFT JOIN leave_type
                                          on leave_type.id = officer_leave_details.leaveTypeID
                                          LEFT JOIN officer_log
                                          ON officer_log.id = officer_leave_details.movementID
                                          WHERE officers.mil_id = ?
                                          AND leave_type.id IN (1,2,3,5,6,7,11,12,13)
                                          ORDER BY officer_leave_details.id DESC
                                          `,
        [officerObject.getMilID()],
      );

      return res.status(200).json(officerTmam);
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
