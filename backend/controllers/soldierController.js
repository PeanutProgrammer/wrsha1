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
        req.body.guardian_telephone_number
      );

      await query(
        "insert into soldiers set name =?, join_date = ?, end_date = ?, department = ?, mil_id = ?, rank = ?, telephone_number =?, guardian_name = ?, guardian_telephone_number =?",
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
        req.body.guardian_telephone_number
      );

      console.log("hello");

      await query(
        `update soldiers set name =?, join_date = ?, end_date = ?, department = ?, rank = ?, telephone_number =?, guardian_name = ?, guardian_telephone_number =? where id = ?`,
        [
          soldierObject.getName(),
          soldierObject.getJoinDate(),
          soldierObject.getEndDate(),
          soldierObject.getDepartment(),
          soldierObject.getRank(),
          soldierObject.getTelephoneNumber(),
          soldierObject.getGuardianName(),
          soldierObject.getGuardianTelephoneNumber(),
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
      let search = "";
      if (req.query.search) {
        search = `where name LIKE '%${req.query.search}%'`;
      }
      const soldiers = await query(`select * from soldiers ${search}`);

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
        soldier[0].in_unit
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
      // let search = ""
      // if (req.query.search) {
      //     search =  `where name LIKE '%${req.query.search}%'`
      // }

      console.log("hey");

      const soldiers =
        await query(`SELECT soldiers.mil_id ,soldiers.rank,soldiers.name, soldiers.department, leave_type.name AS 'tmam'
                                          FROM soldiers
                                          LEFT JOIN soldier_log
                                          ON soldiers.id = soldier_log.soldierID
                                          LEFT JOIN leave_type
                                          on leave_type.id = soldier_log.leaveTypeID`);

      console.log(soldiers[0]);
      console.log("hello");

      if (soldiers.length == 0) {
        return res.status(404).json({
          msg: "no soldiers found now",
        });
      }

      return res.status(200).json(soldiers);
    } catch (err) {
      return res.status(500).json({ err: err });
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
        soldier[0].in_unit
      );
      const soldierTmam = await query(
        `SELECT soldiers.mil_id ,soldiers.rank,soldiers.name, soldiers.department, soldiers.join_date, leave_type.name AS 'tmam', soldier_leave_details.start_date, soldier_leave_details.end_date, soldier_leave_details.destination, soldier_log.notes
                                          FROM soldiers
                                          LEFT JOIN soldier_log
                                          ON soldiers.id = soldier_log.soldierID
                                          LEFT JOIN leave_type
                                          on leave_type.id = soldier_log.leaveTypeID
                                          LEFT JOIN soldier_leave_details
                                          ON soldier_leave_details.MovementID = soldier_log.id
                                          WHERE soldiers.mil_id = ?
                                          ORDER BY soldier_log.id DESC
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
        filters.push(`(name = ?)`);
        params.push(`${req.query.name}`);
      }

      // Filter by department
      if (req.query.department) {
        filters.push(`department = ?`);
        params.push(req.query.department);
      }

      // Filter by rank
      if (req.query.rank) {
        filters.push(`rank = ?`);
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
      const soldiers = await query(`select * from soldiers where in_unit = 0 `);

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
}



module.exports = SoldierController;