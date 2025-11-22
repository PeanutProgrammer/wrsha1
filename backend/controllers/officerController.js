const Officer = require("../models/officer");
const PastOfficer = require("../models/pastOfficer");
const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");

class OfficerController {
  static async createOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkOfficer = await query(
        "SELECT * from officers where mil_id = ?",
        [req.body.mil_id]
      );

      if (checkOfficer.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Military ID already exists",
            },
          ],
        });
      }

      const officerObject = new Officer(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.address,
        req.body.height,
        req.body.weight,
        req.body.dob,
        req.body.seniority_number
      );

      await query(
        "insert into officers set name =?, join_date = ?, department = ?, mil_id = ?, `rank` = ?, address = ?, height = ?, weight = ?, dob = ?, seniority_number = ?",
        [
          officerObject.getName(),
          officerObject.getJoinDate(),
          officerObject.getDepartment(),
          officerObject.getMilID(),
          officerObject.getRank(),
          officerObject.getAddress(),
          officerObject.getHeight(),
          officerObject.getWeight(),
          officerObject.getDOB(),
          officerObject.getSeniorityNumber(),
        ]
      );

      req.app.get("io").emit("officersUpdated");
      return res.status(200).json(officerObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async updateOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkOfficer = await query("SELECT * from officers where id = ?", [
        req.params.id,
      ]);

      if (checkOfficer.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Officer does not exist",
            },
          ],
        });
      }

      const officerObject = new Officer(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.address,
        req.body.height,
        req.body.weight,
        req.body.dob,
        req.body.seniority_number
      );

      console.log("hello");

      await query(
        "update officers set name =?, join_date = ?, department = ?, `rank` = ?, address = ?,  height = ?, weight = ?, dob = ?, seniority_number = ? where id = ?",
        [
          officerObject.getName(),
          officerObject.getJoinDate(),
          officerObject.getDepartment(),
          officerObject.getRank(),
          officerObject.getAddress(),
          officerObject.getHeight(),
          officerObject.getWeight(),
          officerObject.getDOB(),
          officerObject.getSeniorityNumber(),
          checkOfficer[0].id,
        ]
      );

      console.log("Name:", officerObject.getName());
      console.log("Join Date:", officerObject.getJoinDate());
      console.log("Department:", officerObject.getDepartment());
      console.log("Mil ID:", officerObject.getMilID());
      console.log("Rank:", officerObject.getRank());

      console.log(req.body.department);

      req.app.get("io").emit("officersUpdated");

      return res.status(200).json({ msg: "Officer updated!" });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async deleteOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // Check if the officer exists
      const checkOfficer = await query(
        "SELECT * FROM officers WHERE mil_id = ?",
        [req.params.mil_id]
      );

      if (checkOfficer.length === 0) {
        return res.status(400).json({
          errors: [{ msg: "Officer does not exist" }],
        });
      }

      // Create a PastOfficer object with the officer's data
      const PastOfficerObject = {
        mil_id: checkOfficer[0].mil_id,
        rank: checkOfficer[0].rank,
        name: checkOfficer[0].name,
        join_date: checkOfficer[0].join_date,
        address: checkOfficer[0].address,
        height: checkOfficer[0].height,
        weight: checkOfficer[0].weight,
        dob: checkOfficer[0].dob,
        seniority_number: checkOfficer[0].seniority_number,
        // If you have additional fields such as 'end_date', 'transferID', etc.
        end_date: req.body.end_date || new Date().toISOString(),
        transferID: req.body.transferID || null,
        transferred_to: req.body.transferred_to || null,
      };

      // Insert the officer data into the past_officers table
      await query(
        "INSERT INTO past_officers (mil_id, `rank`, name, join_date, address, height, weight, dob, seniority_number, end_date, transferID, transferred_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          PastOfficerObject.mil_id,
          PastOfficerObject.rank,
          PastOfficerObject.name,
          PastOfficerObject.join_date,
          PastOfficerObject.address,
          PastOfficerObject.height,
          PastOfficerObject.weight,
          PastOfficerObject.dob,
          PastOfficerObject.seniority_number,
          PastOfficerObject.end_date,
          PastOfficerObject.transferID,
          PastOfficerObject.transferred_to,
        ]
      );

      // Now delete the officer from the officers table
      await query("DELETE FROM officers WHERE mil_id = ?", [
        checkOfficer[0].mil_id,
      ]);

      // Emit the update (if you're using socket.io or any real-time system)
      req.app.get("io").emit("officersUpdated");

      return res.status(200).json({
        msg: "Officer deleted and moved to past_officers!",
      });
    } catch (err) {
      console.error("Error in deleting officer:", err);
      return res.status(500).json({ err: err.message || err });
    }
  }

  static async getOfficers(req, res) {
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
      const officers = await query(`select * from officers ${search}`);

      if (officers.length == 0) {
        return res.status(404).json({
          msg: "no officers found hey",
        });
      }

      return res.status(200).json(officers);
    } catch (err) {
      return res.status(500).json({ err: err.message || err });
    }
  }

  static async getOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const officer = await query("select * from officers where id = ?", [
        req.params.id,
      ]);

      if (officer.length == 0) {
        return res.status(404).json({
          msg: "no officers found blah",
        });
      }

      // user.map((user) => {
      // });

      console.log(officer[0]);

      const officerObject = new Officer(
        officer[0].name,
        officer[0].join_date,
        officer[0].department,
        officer[0].mil_id,
        officer[0].rank,
        officer[0].address,
        officer[0].height,
        officer[0].weight,
        officer[0].dob,
        officer[0].seniority_number,
        officer[0].in_unit
      );
      console.log(officerObject.toJSON());
      return res.status(200).json(officerObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getOfficersTmam(req, res) {
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

      const officers = await query(`
SELECT 
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.in_unit,
    lt.name AS tmam,
    old.id AS latest_leave_id   
FROM officers o
LEFT JOIN (
    SELECT officerID, MAX(event_time) AS latest_event
    FROM officer_log
    GROUP BY officerID
) lastLog
    ON lastLog.officerID = o.id
LEFT JOIN officer_log ol
    ON ol.officerID = o.id AND ol.event_time = lastLog.latest_event
LEFT JOIN officer_leave_details old
    ON old.movementID = ol.id
LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID
`);

      console.log(officers[0]);
      console.log("hello");

      if (officers.length == 0) {
        return res.status(404).json({
          msg: "no officers found now",
        });
      }

      return res.status(200).json(officers);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getOfficerTmamDetails(req, res) {
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
        officer[0].in_unit
      );
      const officerTmam = await query(
        `SELECT officers.mil_id ,officers.rank,officers.name, officers.department, officers.join_date, officer_log.event_type, leave_type.name AS 'tmam', officer_leave_details.start_date, officer_leave_details.end_date, officer_leave_details.destination, officer_log.notes
                                          FROM officers
                                          LEFT JOIN officer_log
                                          ON officers.id = officer_log.officerID
                                          LEFT JOIN officer_leave_details
                                          ON officer_leave_details.officerID = officer_log.officerID
                                          LEFT JOIN leave_type
                                          on leave_type.id = officer_leave_details.leaveTypeID
                                          WHERE officers.mil_id = ?
                                          ORDER BY officer_log.id DESC
                                          `,
        [officerObject.getMilID()]
      );

      return res.status(200).json(officerTmam);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async filterOfficers(req, res) {
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
      const sql = `SELECT * FROM officers ${whereClause}`;

      const officers = await query(sql, params);

      if (officers.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "No officers found" }],
        });
      }

      // Optional: filter out officers who joined in the future
      const validOfficers = officers.filter((officer) =>
        moment(officer.join_date).isBefore(now)
      );

      return res.status(200).json(validOfficers);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: err.message });
    }
  }

  static async getCurrentOfficers(req, res) {
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
      const officers = await query(`select * from officers where in_unit = 1 `);

      if (officers.length == 0) {
        return res.status(404).json({
          msg: "no officers found hey",
        });
      }

      return res.status(200).json(officers);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getAbsentOfficers(req, res) {
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
      const officers = await query(`
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
FROM officers o
LEFT JOIN (
    SELECT officerID, MAX(event_time) AS latest_event
    FROM officer_log
    GROUP BY officerID
) lastLog
    ON lastLog.officerID = o.id
LEFT JOIN officer_log ol
    ON ol.officerID = o.id AND ol.event_time = lastLog.latest_event
LEFT JOIN leave_type lt
    ON lt.id = ol.leaveTypeID
LEFT JOIN officer_leave_details old
    ON old.movementID = ol.id
WHERE o.in_unit = 0;
`);
      if (officers.length == 0) {
        return res.status(404).json({
          msg: "no officers found hey",
        });
      }

      return res.status(200).json(officers);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }
}

module.exports = OfficerController;
