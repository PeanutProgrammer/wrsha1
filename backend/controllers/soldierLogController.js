const { validationResult } = require("express-validator");
const util = require("util");
const connection = require("../db/dbConnection");
const SoldierLog = require("../models/soldierLog");
const withTransaction = require("../utils/withTransaction");

class SoldierLogController {
  // ============================================================
  // GET Soldiers Log
  // ============================================================
  static async getSoldiersLog(req, res) {
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
          "WHERE soldiers.name LIKE ? OR soldiers.department LIKE ? OR soldiers.mil_id LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM soldiers ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Data query with pagination ---
      const dataQuery = `SELECT soldiers.mil_id, soldiers.rank, soldiers.name, soldiers.department, soldier_log.event_type, soldier_log.event_time, leave_type.name AS reason, soldier_log.notes
                                          FROM soldiers
                                          LEFT JOIN soldier_log
                                          ON soldier_log.soldierID = soldiers.id
                                          LEFT JOIN soldier_leave_details
                                          ON soldier_leave_details.movementID = soldier_log.id
                                          LEFT JOIN leave_type
                                          ON soldier_leave_details.leaveTypeID = leave_type.id
                                          ${searchClause}
                                          order by soldier_log.event_time DESC
                                          LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const soldiers = await query(dataQuery, params);

      if (!soldiers.length) {
        return res.status(404).json({ msg: "no soldiers found" });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: soldiers,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: err.message });
    }
  }

  // ============================================================
  // CREATE ARRIVAL  (Safe, Atomic)
  // ============================================================
  static async createArrival(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const soldierObject = new SoldierLog(
        req.body.event_type,
        req.body.event_time,
        req.body.soldierID,
        req.body.leaveTypeID,
        req.body.notes,
        req.body.loggerID
      );

      await withTransaction(async (query) => {
        // 1) LOCK soldier row to prevent race conditions
        const [soldier] = await query(
          "SELECT in_unit FROM soldiers WHERE id = ? FOR UPDATE",
          [soldierObject.getSoldierID()]
        );

        if (!soldier) throw new Error("Soldier not found");

        // 2) Prevent double arrival
        if (soldier.in_unit === 1) {
          throw new Error(
            "Soldier already inside the unit (duplicate arrival prevented)"
          );
        }

        // 3) Insert movement log
        const soldierLogResult = await query(
          `INSERT INTO soldier_log SET event_type=?, event_time=?, soldierID=?, notes=?, loggerID=?`,
          [
            soldierObject.getEventType(),
            soldierObject.getEventTime(),
            soldierObject.getSoldierID(),
            soldierObject.getNotes(),
            soldierObject.getLoggerID(),
          ]
        );
          
          const soldierLogID = soldierLogResult.insertId;

        // 4) Update status
        await query("UPDATE soldiers SET in_unit = 1 WHERE id = ?", [
          soldierObject.getSoldierID(),
        ]);
          
              await query(
                "insert into soldier_leave_details set movementID = ?, leaveTypeID = ?, soldierID = ?, start_date = ?, end_date = ?, destination = ?",
                [
                  soldierLogID,
                  req.body.leaveTypeID,
                  req.body.soldierID,
                  req.body.start_date,
                  req.body.end_date,
                  req.body.destination,
                ]
              );
      });

      req.app.get("io").emit("soldiersUpdated");
      return res.status(200).json(soldierObject.toJSON());
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ============================================================
  // CREATE DEPARTURE  (Safe, Atomic)
  // ============================================================
  static async createDeparture(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const soldierObject = new SoldierLog(
        req.body.event_type,
        req.body.event_time,
        req.body.soldierID,
        req.body.leaveTypeID,
        req.body.notes,
        req.body.loggerID
      );

      await withTransaction(async (query) => {
        // 1) LOCK soldier row
        const [soldier] = await query(
          "SELECT in_unit FROM soldiers WHERE id = ? FOR UPDATE",
          [soldierObject.getSoldierID()]
        );

        if (!soldier) throw new Error("Soldier not found");

        // 2) Prevent leaving if already outside
        if (soldier.in_unit === 0) {
          throw new Error(
            "Soldier is already outside (duplicate departure prevented)"
          );
        }

        // 3) Insert departure log
        const result = await query(
          `INSERT INTO soldier_log SET event_type=?, event_time=?, soldierID=?, notes=?, loggerID=?`,
          [
            soldierObject.getEventType(),
            soldierObject.getEventTime(),
            soldierObject.getSoldierID(),
            soldierObject.getNotes(),
            soldierObject.getLoggerID(),
          ]
        );

        const movementID = result.insertId;

        // 4) Mark soldier as outside
        await query("UPDATE soldiers SET in_unit = 0 WHERE id = ?", [
          soldierObject.getSoldierID(),
        ]);

        // 5) Insert leave data
        await query(
          `INSERT INTO soldier_leave_details SET movementID=?, leaveTypeID = ?, soldierID = ?, start_date=?, end_date=?, destination=?`,
          [
              movementID,
              req.body.leaveTypeID,
              req.body.soldierID,
            req.body.start_date,
            req.body.end_date,
            req.body.destination,
          ]
        );
      });

      req.app.get("io").emit("soldiersUpdated");
      return res.status(200).json(soldierObject.toJSON());
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }


    static async createTmam(req,res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array()); // Log errors
                return res.status(400).json({ errors: errors.array() });
            }
            const { soldierID, leaveTypeID, start_date, end_date, destination } = req.body;

            const query = util.promisify(connection.query).bind(connection);

            const result = await query(
                `INSERT INTO soldier_leave_details (soldierID, leaveTypeID, start_date, end_date, destination)
                 VALUES (?, ?, ?, ?, ?)`,
                [soldierID, leaveTypeID, start_date, end_date, destination]
            );

            return res.status(201).json({ msg: "تمت الإضافة بنجاح", id: result.insertId });
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
    const {  leaveTypeID, start_date, end_date, destination } = req.body;
    const leaveID = req.params.id;

        const query = util.promisify(connection.query).bind(connection);

        const existing = await query(
            `SELECT * FROM soldier_leave_details WHERE id = ?`,
            [leaveID]
        );

        if (existing.length === 0) {
            return res.status(404).json({ msg: "Record not found" });
        }

        await query(
            `UPDATE soldier_leave_details
             SET leaveTypeID = ?, start_date = ?, end_date = ?, destination = ?
             WHERE id = ?`,
            [leaveTypeID || null, start_date || null, end_date || null, destination || null, leaveID]
        );

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
                soldier.name AS soldierName,
                soldier.rank AS soldierRank,
                soldier.id AS soldierID
            FROM soldier_leave_details old
            LEFT JOIN soldiers AS soldier
                ON soldier.id = old.soldierID
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

module.exports = SoldierLogController;
