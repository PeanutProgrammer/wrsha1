const Civillian = require("../models/civillian");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class CivillianController {
  static async createCivillian(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkCivillian = await query(
        "SELECT * from civillians where nationalID = ?",
        [req.body.nationalID]
      );

      if (checkCivillian.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "National ID already exists",
            },
          ],
        });
      }

      const civillianObject = new Civillian(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.nationalID,
        req.body.telephone_number,
        req.body.address,
        req.body.dob,
        req.body.security_clearance_number,
        req.body.valid_from,
        req.body.valid_through
      );

      await query(
        "insert into civillians set name =?, join_date = ?, department = ?, nationalID = ?, telephone_number = ?, address = ?, dob = ?, security_clearance_number = ?, valid_from = ?, valid_through = ?",
        [
          civillianObject.getName(),
          civillianObject.getJoinDate(),
          civillianObject.getDepartment(),
          civillianObject.getNationalID(),
          civillianObject.getTelephoneNumber(),
          civillianObject.getAddress(),
          civillianObject.getDOB(),
          civillianObject.getSecurityClearanceNumber(),
          civillianObject.getValidFrom(),
          civillianObject.getValidThrough(),
        ]
      );

      req.app.get("io").emit("civilliansUpdated");
      return res.status(200).json(civillianObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: "error" });
    }
  }

  static async updateCivillian(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkCivillian = await query(
        "SELECT * from civillians where id = ?",
        [req.params.id]
      );

      if (checkCivillian.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Civillian does not exist",
            },
          ],
        });
      }

      const civillianObject = new Civillian(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.nationalID,
        req.body.telephone_number,
        req.body.address,
        req.body.dob,
        req.body.security_clearance_number,
        req.body.valid_from,
        req.body.valid_through
      );

      console.log("hello");

      await query(
        `update civillians set name =?, join_date = ?, department = ?, nationalID = ?, telephone_number = ?, address = ?, dob = ?, security_clearance_number = ?, valid_from = ?, valid_through = ? where id = ?`,
        [
          civillianObject.getName(),
          civillianObject.getJoinDate(),
          civillianObject.getDepartment(),
          civillianObject.getNationalID(),
          civillianObject.getTelephoneNumber(),
          civillianObject.getAddress(),
          civillianObject.getDOB(),
          civillianObject.getSecurityClearanceNumber(),
          civillianObject.getValidFrom(),
          civillianObject.getValidThrough(),
          req.params.id,
        ]
      );

      console.log(req.body.department);

      req.app.get("io").emit("civilliansUpdated");

      return res.status(200).json({ msg: "Civillian updated!" });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async deleteCivillian(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkCivillian = await query(
        "SELECT * from civillians where nationalID = ?",
        [req.params.nationalID]
      );

      if (checkCivillian.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Civillian does not exist",
            },
          ],
        });
      }

      await query("delete from civillians where nationalID = ?", [
        checkCivillian[0].nationalID,
      ]);

      req.app.get("io").emit("civilliansUpdated");

      return res.status(200).json({
        msg: "Civillian deleted!",
      });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getCivillians(req, res) {
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
      const civillians = await query(`select * from civillians ${search}`);

      if (civillians.length == 0) {
        return res.status(404).json({
          msg: "no civillians found hey",
        });
      }

      return res.status(200).json(civillians);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getCivillian(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const civillian = await query("select * from civillians where id = ?", [
        req.params.id,
      ]);

      console.log(civillian);

      if (civillian.length == 0) {
        return res.status(404).json({
          msg: "no civillians found blah",
        });
      }

      // user.map((user) => {
      // });

      console.log(civillian[0]);

      const civillianObject = new Civillian(
        civillian[0].name,
        civillian[0].join_date,
        civillian[0].department,
        civillian[0].nationalID,
        civillian[0].telephone_number,
        civillian[0].address,
        civillian[0].dob,
        civillian[0].security_clearance_number,
        civillian[0].valid_from,
        civillian[0].valid_through,
        civillian[0].in_unit
      );

      console.log(civillianObject);

      return res.status(200).json(civillianObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getCivilliansTmam(req, res) {
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

      const civillians =
        await query(`SELECT civillians.nationalID,civillians.name, civillians.department, leave_type.name AS 'tmam'
                                          FROM civillians
                                          LEFT JOIN civillian_log
                                          ON civillians.id = civillian_log.civillianID
                                          LEFT JOIN leave_type
                                          on leave_type.id = civillian_log.leaveTypeID`);

      console.log(civillians[0]);
      console.log("hello");

      if (civillians.length == 0) {
        return res.status(404).json({
          msg: "no civillians found now",
        });
      }

      return res.status(200).json(civillians);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getCivillianTmamDetails(req, res) {
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
      const civillian = await query(
        "select * from civillians where nationalID = ?",
        [req.params.id]
      );
      console.log("hey");
      if (civillian.length == 0) {
        return res.status(404).json({
          msg: "no civillians found blah",
        });
      }

      const civillianObject = new Civillian(
        civillian[0].name,
        civillian[0].join_date,
        civillian[0].department,
        civillian[0].nationalID,
        civillian[0].telephone_number,
        civillian[0].address,
        civillian[0].dob,
        civillian[0].security_clearance_number,
        civillian[0].valid_from,
        civillian[0].valid_through
      );
      const civillianTmam = await query(
        `SELECT civillians.nationalID,civillians.name, civillians.department, civillians.security_clearance_number, civillians.join_date, leave_type.name AS 'tmam', civillian_leave_details.start_date, civillian_leave_details.end_date, civillian_leave_details.destination, civillian_log.notes
                                          FROM civillians
                                          LEFT JOIN civillian_log
                                          ON civillians.id = civillian_log.civillianID
                                          LEFT JOIN leave_type
                                          on leave_type.id = civillian_log.leaveTypeID
                                          LEFT JOIN civillian_leave_details
                                          ON civillian_leave_details.MovementID = civillian_log.id
                                          WHERE civillians.nationalID = ?
                                          ORDER BY civillian_log.id DESC
                                          `,
        [civillianObject.getNationalID()]
      );

      return res.status(200).json(civillianTmam);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async filterCivillians(req, res) {
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

      // Handle search by name or national ID
      if (req.query.nationalID) {
        filters.push(`(nationalID = ?)`);
        params.push(`${req.query.nationalID}`);
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

      // // Filter by join date range
      // if (req.query.join_date) {
      //   filters.push(`join_date >= ?`);
      //   params.push(req.query.joinDateStart);
      // }

      // if (req.query.join_date) {
      //   filters.push(`join_date <= ?`);
      //   params.push(req.query.joinDateEnd);
      // }

      // Build query
      const whereClause =
        filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";
      const sql = `SELECT * FROM civillians ${whereClause}`;

      const civillians = await query(sql, params);

      if (civillians.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "No civillians found" }],
        });
      }

      // Optional: filter out civillians who joined in the future
      const validCivillians = civillians.filter((civillian) =>
        moment(civillian.join_date).isBefore(now)
      );

      return res.status(200).json(validCivillians);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: err.message });
    }
  }

  static async getCurrentCivillians(req, res) {
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
      const civillians = await query(
        `select * from civillians where in_unit = 1`
      );

      if (civillians.length == 0) {
        return res.status(404).json({
          msg: "no civillians found hey",
        });
      }

      return res.status(200).json(civillians);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getAbsentCivillians(req, res) {
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
      const civillians = await query(
        `select * from civillians where in_unit = 0`
      );

      if (civillians.length == 0) {
        return res.status(404).json({
          msg: "no civillians found hey",
        });
      }

      return res.status(200).json(civillians);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }
}



module.exports = CivillianController;