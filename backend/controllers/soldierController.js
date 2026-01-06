const Soldier = require("../models/soldier");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class SoldierController {
  static async createSoldier(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkSoldier = await query(
        "SELECT * from soldiers where mil_id = ?",
        [req.body.mil_id]
      );

      if (checkSoldier.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Military ID already exists",
            },
          ],
        });
      }

      const soldierObject = new Soldier(
        req.body.name,
        req.body.join_date,
        req.body.end_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.telephone_number,
        req.body.guardian_name,
        req.body.guardian_telephone_number,
        true,
        req.body.attached
      );

      await query(
        "insert into soldiers set name =?, join_date = ?, end_date = ?, department = ?, mil_id = ?, `rank` = ?, telephone_number =?, guardian_name = ?, guardian_telephone_number =?, attached = ?",
        [
          soldierObject.getName(),
          soldierObject.getJoinDate(),
          soldierObject.getEndDate(),
          soldierObject.getDepartment(),
          soldierObject.getMilID(),
          soldierObject.getRank(),
          soldierObject.getTelephoneNumber(),
          soldierObject.getGuardianName(),
          soldierObject.getGuardianTelephoneNumber(),
          soldierObject.getAttached(),
        ]
      );

      req.app.get("io").emit("soldiersUpdated");
      return res.status(200).json(soldierObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: "error" });
    }
  }

  static async updateSoldier(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkSoldier = await query("SELECT * from soldiers where id = ?", [
        req.params.id,
      ]);

      if (checkSoldier.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Soldier does not exist",
            },
          ],
        });
      }

      const soldierObject = new Soldier(
        req.body.name,
        req.body.join_date,
        req.body.end_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.telephone_number,
        req.body.guardian_name,
        req.body.guardian_telephone_number,
        checkSoldier[0].in_unit,
        req.body.attached
      );

      console.log("hello");

      await query(
        "update soldiers set name =?, join_date = ?, end_date = ?, department = ?, `rank` = ?, telephone_number =?, guardian_name = ?, guardian_telephone_number =?, attached = ? where id = ?",
        [
          soldierObject.getName(),
          soldierObject.getJoinDate(),
          soldierObject.getEndDate(),
          soldierObject.getDepartment(),
          soldierObject.getRank(),
          soldierObject.getTelephoneNumber(),
          soldierObject.getGuardianName(),
          soldierObject.getGuardianTelephoneNumber(),
          soldierObject.getAttached(),
          req.params.id,
        ]
      );

      console.log("Name:", soldierObject.getName());
      console.log("Join Date:", soldierObject.getJoinDate());
      console.log("Department:", soldierObject.getDepartment());
      console.log("Mil ID:", soldierObject.getMilID());
      console.log("Rank:", soldierObject.getRank());

      console.log(req.body.department);

      req.app.get("io").emit("soldiersUpdated");

      return res.status(200).json({ msg: "Soldier updated!" });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async deleteSoldier(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkSoldier = await query(
        "SELECT * from soldiers where mil_id = ?",
        [req.params.mil_id]
      );

      if (checkSoldier.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Soldier does not exist",
            },
          ],
        });
      }

      await query("delete from soldiers where mil_id = ?", [
        checkSoldier[0].mil_id,
      ]);

      req.app.get("io").emit("soldiersUpdated");

      return res.status(200).json({
        msg: "Soldier deleted!",
      });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getSoldiers(req, res) {
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
          "WHERE soldiers.name LIKE ? OR soldiers.department LIKE ? OR soldiers.mil_id LIKE ? OR soldiers.end_date LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM soldiers ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const soldiers = await query(
        `select * from soldiers ${searchClause} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      if (!soldiers.length) {
        return res.status(404).json({ msg: "No soldiers found" });
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
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getSoldier(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const soldier = await query("select * from soldiers where id = ?", [
        req.params.id,
      ]);

      if (soldier.length == 0) {
        return res.status(404).json({
          msg: "no soldiers found blah",
        });
      }

      // user.map((user) => {
      // });

      console.log(soldier[0]);

      const soldierObject = new Soldier(
        soldier[0].name,
        soldier[0].join_date,
        soldier[0].end_date,
        soldier[0].department,
        soldier[0].mil_id,
        soldier[0].rank,
        soldier[0].telephone_number,
        soldier[0].guardian_name,
        soldier[0].guardian_telephone_number,
        soldier[0].in_unit,
        soldier[0].attached
      );
      console.log(soldierObject.toJSON());

      return res.status(200).json(soldierObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getSoldiersTmam(req, res) {
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
      const countQuery = `SELECT COUNT(*) AS total FROM soldiers o ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      console.log("hey");

      const soldiers = await query(
        `
SELECT 
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.end_date,
    o.in_unit,

    -- Last departure
    (
        SELECT ol.event_time
        FROM soldier_log ol
        WHERE ol.soldierID = o.id AND ol.event_type = 'خروج'
        ORDER BY ol.event_time DESC
        LIMIT 1
    ) AS latest_departure,

    -- Last arrival
    (
        SELECT ol.event_time
        FROM soldier_log ol
        WHERE ol.soldierID = o.id AND ol.event_type = 'دخول'
        ORDER BY ol.event_time DESC
        LIMIT 1
    ) AS latest_arrival,

        -- Latest leave ID
    (
        SELECT id
        FROM soldier_leave_details old
        WHERE old.soldierID = o.id
        ORDER BY old.id DESC
        LIMIT 1
    ) AS latest_leave_id,

    lt.name AS tmam
FROM soldiers o
LEFT JOIN soldier_leave_details old
    ON old.id = (
        SELECT id
        FROM soldier_leave_details
        WHERE soldierID = o.id
        ORDER BY id DESC
        LIMIT 1
    )
LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID
    ${searchClause}
ORDER BY o.id
  LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      console.log(soldiers[0]);
      console.log("hello");

      if (!soldiers.length) {
        return res.status(404).json({ msg: "No soldiers found" });
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
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getSoldierTmamDetails(req, res) {
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
      const soldier = await query("select * from soldiers where mil_id = ?", [
        req.params.id,
      ]);
      console.log("hey");
      if (soldier.length == 0) {
        return res.status(404).json({
          msg: "no soldiers found blah",
        });
      }

      const soldierObject = new Soldier(
        soldier[0].name,
        soldier[0].join_date,
        soldier[0].end_date,
        soldier[0].department,
        soldier[0].mil_id,
        soldier[0].rank,
        soldier[0].telephone_number,
        soldier[0].guardian_name,
        soldier[0].guardian_telephone_number,
        soldier[0].in_unit,
        soldier[0].attached
      );
      const soldierTmam = await query(
        `SELECT soldiers.mil_id ,soldiers.rank,soldiers.name, soldiers.department, soldiers.in_unit,  soldiers.join_date, leave_type.name AS 'tmam', soldier_leave_details.start_date, soldier_leave_details.end_date, soldier_leave_details.destination, soldier_log.notes, soldier_log.event_type, soldier_log.event_time
                                          FROM soldiers
                                          LEFT JOIN soldier_leave_details
                                          ON soldiers.id = soldier_leave_details.soldierID
                                          LEFT JOIN leave_type
                                          ON leave_type.id = soldier_leave_details.leaveTypeID
                                          LEFT JOIN soldier_log
                                          ON soldier_leave_details.movementID = soldier_log.id
                                          
                                          WHERE soldiers.mil_id = ?
                                          ORDER BY soldier_leave_details.id DESC
                                          `,
        [soldierObject.getMilID()]
      );

      console.log(soldierObject.getMilID());

      return res.status(200).json(soldierTmam);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async filterSoldiers(req, res) {
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
        filters.push(`(name LIKE ?)`);
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
      const sql = `SELECT * FROM soldiers ${whereClause}`;

      const soldiers = await query(sql, params);

      if (soldiers.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "No soldiers found" }],
        });
      }

      // Optional: filter out soldiers who joined in the future
      const validSoldiers = soldiers.filter((soldier) =>
        moment(soldier.join_date).isBefore(now)
      );

      return res.status(200).json(validSoldiers);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: err.message });
    }
  }

  static async getCurrentSoldiers(req, res) {
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
      const soldiers = await query(`select * from soldiers where in_unit = 1 `);

      if (soldiers.length == 0) {
        return res.status(404).json({
          msg: "no soldiers found hey",
        });
      }

      return res.status(200).json(soldiers);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getAbsentSoldiers(req, res) {
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
      const soldiers = await query(`SELECT
    o.id,
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.in_unit,
    old.leaveTypeID,
    lt.name AS leave_type_name,
    ol.event_time
FROM soldiers o

-- latest log for other purposes (unchanged)
LEFT JOIN (
    SELECT soldierID, MAX(event_time) AS latest_event
    FROM soldier_log
    GROUP BY soldierID
) lastLog
    ON lastLog.soldierID = o.id

LEFT JOIN soldier_log ol
    ON ol.soldierID = o.id 
    AND ol.event_time = lastLog.latest_event

-- 🔥 Get the LATEST leave_details row for each soldier
LEFT JOIN soldier_leave_details old
    ON old.id = (
        SELECT id
        FROM soldier_leave_details
        WHERE soldierID = o.id
        ORDER BY id DESC
        LIMIT 1
    )

LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID

WHERE o.in_unit = 0;`);

      if (soldiers.length == 0) {
        return res.status(404).json({
          msg: "no soldiers found hey",
        });
      }

      return res.status(200).json(soldiers);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

    static async getDailySummary(req, res)  {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = util.promisify(connection.query).bind(connection);

    // Query all soldiers' data for the summary calculation
    const soldiers = await query(`
SELECT 
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.in_unit,
    o.attached,


    -- Latest leave ID
    (
        SELECT id
        FROM soldier_leave_details old
        WHERE old.soldierID = o.id
        ORDER BY old.id DESC
        LIMIT 1
    ) AS latest_leave_id,

    lt.name AS tmam
FROM soldiers o
LEFT JOIN soldier_leave_details old
    ON old.id = (
        SELECT id
        FROM soldier_leave_details
        WHERE soldierID = o.id
        ORDER BY id DESC
        LIMIT 1
    )
LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID;
    `);

    if (!soldiers.length) {
      return res.status(404).json({ msg: "No soldiers found" });
    }

    // Calculate the summary
    const totalSoldiers = soldiers.length;
    const totalAttached = soldiers.filter((soldier) => soldier.attached).length;
    const available = soldiers.filter((soldier) => soldier.in_unit).length;
    const missing = totalSoldiers - available;
    const fixedMission = soldiers.filter((soldier) => soldier.tmam === "مأمورية ثابتة" && !soldier.in_unit).length;

    // Breakdown for اجازة types
    const normalLeave = soldiers.filter((soldier) => soldier.tmam === "راحة"  && !soldier.in_unit).length;
    const fieldLeave = soldiers.filter((soldier) => soldier.tmam === "اجازة ميدانية" && !soldier.in_unit).length;
    const grantLeave = soldiers.filter((soldier) => soldier.tmam === "منحة" && !soldier.in_unit).length;

    // Other categories
    const sickLeave = soldiers.filter((soldier) => soldier.tmam === "اجازة مرضية" && !soldier.in_unit).length;
    const mission = soldiers.filter((soldier) => (soldier.tmam === "مأمورية" || soldier.tmam === "مأمورية جهاز الخدمات العامة") && !soldier.in_unit).length;
    const hospital = soldiers.filter((soldier) => soldier.tmam === "عيادة" && !soldier.in_unit).length;

    // Calculating total exits (اجمالي الخوارج)
    const totalExits = fixedMission + normalLeave + fieldLeave + grantLeave + sickLeave + mission + hospital;

    // Calculate the percentage of available soldiers
    const percentageAvailable = totalSoldiers ? ((missing / totalSoldiers) * 100).toFixed(2) : 0;

    // Return the daily summary response
    return res.status(200).json({
      total: totalSoldiers,
      available: available,
      attached: totalAttached,
      missing: missing,
      تمام_الخوارج: {
        ثابتة: fixedMission,
        راحة: normalLeave,
        اجازة_ميدانية: fieldLeave,
        منحة: grantLeave,
        اجازة_مرضية: sickLeave,
        مأمورية: mission,
        مستشفى: hospital,
      },
      اجمالي_الخوارج: totalExits,
      percentageAvailable: percentageAvailable,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
};

  
}



module.exports = SoldierController;