const NCO = require("../models/nco");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class NCOController {
  static async createOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkOfficer = await query("SELECT * from ncos where mil_id = ?", [
        req.body.mil_id,
      ]);

      if (checkOfficer.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Military ID already exists",
            },
          ],
        });
      }

      const officerObject = new NCO(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.address,

        req.body.dob,
        true, // in_unit defaults to true on creation
        req.body.attached
      );

      await query(
        "insert into ncos set name =?, join_date = ?, department = ?, mil_id = ?, `rank` = ?, address = ?, dob = ?, attached = ? ",
        [
          officerObject.getName(),
          officerObject.getJoinDate(),
          officerObject.getDepartment(),
          officerObject.getMilID(),
          officerObject.getRank(),
          officerObject.getAddress(),
          officerObject.getDOB(),
          officerObject.getAttached(),
        ]
      );

      return res.status(200).json(officerObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: "error" });
    }
  }

  static async updateOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkOfficer = await query("SELECT * from ncos where id = ?", [
        req.params.id,
      ]);

      if (checkOfficer.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "NCO does not exist",
            },
          ],
        });
      }

      const officerObject = new NCO(
        req.body.name,
        req.body.join_date,
        req.body.department,
        req.body.mil_id,
        req.body.rank,
        req.body.address,
        req.body.dob,
        checkOfficer[0].in_unit,
        req.body.attached
      );

      console.log("hello");

      await query(
        "update ncos set name =?, join_date = ?, department = ?, `rank` = ?, address = ?, dob = ?, attached = ? where id = ?",
        [
          officerObject.getName(),
          officerObject.getJoinDate(),
          officerObject.getDepartment(),
          officerObject.getRank(),
          officerObject.getAddress(),
          officerObject.getDOB(),
          officerObject.getAttached(),
          checkOfficer[0].id,
        ]
      );

      console.log("Name:", officerObject.getName());
      console.log("Join Date:", officerObject.getJoinDate());
      console.log("Department:", officerObject.getDepartment());
      console.log("Mil ID:", officerObject.getMilID());
      console.log("Rank:", officerObject.getRank());

      console.log(req.body.department);

      return res.status(200).json({ msg: "NCO updated!" });
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

      
      const checkOfficer = await query("SELECT * from ncos where mil_id = ?", [
        req.params.mil_id,
      ]);
      

      if (checkOfficer.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "NCO does not exist",
            },
          ],
        });
      }

      // Create a PastOfficer object with the officer's data
      const PastNCOObject = {
        mil_id: checkOfficer[0].mil_id,
        rank: checkOfficer[0].rank,
        name: checkOfficer[0].name,
        join_date: checkOfficer[0].join_date,
        address: checkOfficer[0].address,
        dob: checkOfficer[0].dob,
        // If you have additional fields such as 'end_date', 'transferID', etc.
        end_date: req.body.end_date || new Date().toISOString(),
        transferID: req.body.transferID || null,
        transferred_to: req.body.transferred_to || null,
      };

      // Insert the officer data into the past_officers table
      await query(
        "INSERT INTO past_ncos (mil_id, `rank`, name, join_date, address, dob, end_date, transferID, transferred_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          PastNCOObject.mil_id,
          PastNCOObject.rank,
          PastNCOObject.name,
          PastNCOObject.join_date,
          PastNCOObject.address,

          PastNCOObject.dob,
          PastNCOObject.end_date,
          PastNCOObject.transferID,
          PastNCOObject.transferred_to,
        ]
      );

      await query("delete from ncos where mil_id = ?", [
        checkOfficer[0].mil_id,
      ]);

      return res.status(200).json({
        msg: "NCO deleted!",
      });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getOfficers(req, res) {
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
          "WHERE ncos.name LIKE ? OR ncos.department LIKE ? OR ncos.mil_id LIKE ? OR ncos.rank LIKE ?";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `SELECT COUNT(*) AS total FROM ncos ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const ncos = await query(
        `select * from ncos ${searchClause} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

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
  static async getOfficer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const nco = await query("select * from ncos where id = ?", [
        req.params.id,
      ]);

      if (nco.length == 0) {
        return res.status(404).json({
          msg: "no ncos found blah",
        });
      }

      // user.map((user) => {
      // });

      console.log(nco[0]);

      const officerObject = new NCO(
        nco[0].name,
        nco[0].join_date,
        nco[0].department,
        nco[0].mil_id,
        nco[0].rank,
        nco[0].address,
        nco[0].dob,
        nco[0].in_unit,
        nco[0].attached
      );
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
      const countQuery = `SELECT COUNT(*) AS total FROM ncos o ${searchClause}`;
      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      console.log("hey");

      const ncos = await query(
        `
SELECT 
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.in_unit,

    -- Last departure
    (
        SELECT ol.event_time
        FROM nco_log ol
        WHERE ol.ncoID = o.id AND ol.event_type = 'خروج'
        ORDER BY ol.event_time DESC
        LIMIT 1
    ) AS latest_departure,

    -- Last arrival
    (
        SELECT ol.event_time
        FROM nco_log ol
        WHERE ol.ncoID = o.id AND ol.event_type = 'دخول'
        ORDER BY ol.event_time DESC
        LIMIT 1
    ) AS latest_arrival,

        -- Latest leave ID
    (
        SELECT id
        FROM nco_leave_details old
        WHERE old.ncoID = o.id
        ORDER BY old.id DESC
        LIMIT 1
    ) AS latest_leave_id,

    lt.name AS tmam
FROM ncos o
LEFT JOIN nco_leave_details old
    ON old.id = (
        SELECT id
        FROM nco_leave_details
        WHERE ncoID = o.id
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

      console.log(ncos[0]);
      console.log("hello");

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
      const nco = await query("select * from ncos where mil_id = ?", [
        req.params.id,
      ]);
      console.log("hey");
      if (nco.length == 0) {
        return res.status(404).json({
          msg: "no ncos found blah",
        });
      }

      const officerObject = new NCO(
        nco[0].name,
        nco[0].join_date,
        nco[0].department,
        nco[0].mil_id,
        nco[0].rank,
        nco[0].address,
        nco[0].dob,
        nco[0].in_unit,
        nco[0].attached
      );
      const officerTmam = await query(
        `SELECT ncos.mil_id ,ncos.rank,ncos.name, ncos.department, ncos.in_unit, ncos.join_date, leave_type.name AS 'tmam', nco_leave_details.start_date, nco_leave_details.end_date, nco_leave_details.destination, nco_log.notes, nco_log.event_type, nco_log.event_time
                                          FROM ncos
                                          LEFT JOIN nco_leave_details
                                          ON ncos.id = nco_leave_details.ncoID
                                          LEFT JOIN nco_log
                                          ON nco_leave_details.MovementID = nco_log.id
                                          LEFT JOIN leave_type
                                          on leave_type.id = nco_leave_details.leaveTypeID

                                          WHERE ncos.mil_id = ?
                                          ORDER BY nco_log.id DESC
                                          `,
        [officerObject.getMilID()]
      );

      console.log(officerTmam[0]);
      
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
      const sql = `SELECT * FROM ncos ${whereClause}`;

      const ncos = await query(sql, params);

      if (ncos.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "No ncos found" }],
        });
      }

      // Optional: filter out officers who joined in the future
      const validOfficers = ncos.filter((nco) =>
        moment(nco.join_date).isBefore(now)
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
      const ncos = await query(`select * from ncos where in_unit = 1`);

      if (ncos.length == 0) {
        return res.status(404).json({
          msg: "no ncos found hey",
        });
      }

      return res.status(200).json(ncos);
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
      const ncos = await query(`SELECT
    o.id,
    o.mil_id,
    o.rank,
    o.name,
    o.department,
    o.in_unit,
    old.leaveTypeID,
    lt.name AS leave_type_name,
    ol.event_time
FROM ncos o

-- latest log for other purposes (unchanged)
LEFT JOIN (
    SELECT ncoID, MAX(event_time) AS latest_event
    FROM nco_log
    GROUP BY ncoID
) lastLog
    ON lastLog.ncoID = o.id

LEFT JOIN nco_log ol
    ON ol.ncoID = o.id 
    AND ol.event_time = lastLog.latest_event

-- 🔥 Get the LATEST leave_details row for each officer
LEFT JOIN nco_leave_details old
    ON old.id = (
        SELECT id
        FROM nco_leave_details
        WHERE ncoID = o.id
        ORDER BY id DESC
        LIMIT 1
    )

LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID

WHERE o.in_unit = 0; `);
      
      
      if (ncos.length == 0) {
        return res.status(404).json({
          msg: "no ncos found hey",
        });
      }

      return res.status(200).json(ncos);
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

    // Query all officers' data for the summary calculation
    const officers = await query(`
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
        FROM officer_leave_details old
        WHERE old.officerID = o.id
        ORDER BY old.id DESC
        LIMIT 1
    ) AS latest_leave_id,

    lt.name AS tmam
FROM ncos o
LEFT JOIN nco_leave_details old
    ON old.id = (
        SELECT id
        FROM nco_leave_details
        WHERE ncoID = o.id
        ORDER BY id DESC
        LIMIT 1
    )
LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID;
    `);

    if (!officers.length) {
      return res.status(404).json({ msg: "No officers found" });
    }

    // Calculate the summary
    const totalOfficers = officers.length;
    const totalAttached = officers.filter((officer) => officer.attached).length;
    const available = officers.filter((officer) => officer.in_unit).length;
    const missing = totalOfficers - available;
    const fixedMission = officers.filter((officer) => officer.tmam === "مأمورية ثابتة" && !officer.in_unit).length;
    const course = officers.filter((officer) => officer.tmam === "فرقة / دورة"  && !officer.in_unit).length;

    // Breakdown for اجازة types
    const normalLeave = officers.filter((officer) => officer.tmam === "راحة"  && !officer.in_unit).length;
    const compensatoryLeave = officers.filter((officer) => officer.tmam === "بدل راحة"  && !officer.in_unit).length;
    const casualLeave = officers.filter((officer) => officer.tmam === "عارضة" && !officer.in_unit).length;
    const fieldLeave = officers.filter((officer) => officer.tmam === "اجازة ميدانية" && !officer.in_unit).length;
    const grantLeave = officers.filter((officer) => officer.tmam === "منحة" && !officer.in_unit).length;

    // Other categories
    const annualLeave = officers.filter((officer) => officer.tmam === "اجازة سنوية"  && !officer.in_unit).length;
    const sickLeave = officers.filter((officer) => officer.tmam === "اجازة مرضية" && !officer.in_unit).length;
    const travel = officers.filter((officer) => officer.tmam === "سفر" && !officer.in_unit).length;
    const mission = officers.filter((officer) => (officer.tmam === "مأمورية" || officer.tmam === "مأمورية جهاز الخدمات العامة") && !officer.in_unit).length;
    const hospital = officers.filter((officer) => officer.tmam === "عيادة" && !officer.in_unit).length;

    // Calculating total exits (اجمالي الخوارج)
    const totalExits = fixedMission + course + normalLeave + compensatoryLeave + casualLeave + fieldLeave + grantLeave + annualLeave + sickLeave + travel + mission + hospital;

    // Calculate the percentage of available officers
    const percentageAvailable = totalOfficers ? ((missing / totalOfficers) * 100).toFixed(2) : 0;

    // Return the daily summary response
    return res.status(200).json({
      total: totalOfficers,
      available: available,
      attached: totalAttached,
      missing: missing,
      تمام_الخوارج: {
        ثابتة: fixedMission,
        فرقة_دورة: course,
        راحة: normalLeave,
        بدل_راحة: compensatoryLeave,
        عارضة: casualLeave,
        اجازة_ميدانية: fieldLeave,
        منحة: grantLeave,
        اجازة_سنوية: annualLeave,
        اجازة_مرضية: sickLeave,
        سفر: travel,
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



module.exports = NCOController;