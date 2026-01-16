const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");

class UnitController {
  static async getAllInUnit(req, res) {
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
      let officerSearchClause = "";
      let ncoSearchClause = "";
      let soldierSearchClause = "";
      const params = [];

      if (req.query.search) {
        const searchValue = `%${req.query.search}%`;
        // Add the search condition for each table individually
        officerSearchClause = `
                AND (o.name LIKE ? OR o.department LIKE ? OR o.mil_id LIKE ? OR o.rank LIKE ?)
            `;
        ncoSearchClause = `
                AND (n.name LIKE ? OR n.department LIKE ? OR n.mil_id LIKE ? OR n.rank LIKE ?)
            `;
        soldierSearchClause = `
                AND (s.name LIKE ? OR s.department LIKE ? OR s.mil_id LIKE ? OR s.rank LIKE ?)
            `;
        // Push the search term into the params array for each table (4 times per table)
        for (let i = 0; i < 12; i++) {
          params.push(searchValue); // 4 params for each table
        }
      }

      // --- Total count for pagination ---
      const countQuery = `
            SELECT COUNT(*) AS total FROM (
                SELECT 1 FROM officers o
                WHERE o.in_unit = 1 ${officerSearchClause}
                
                UNION ALL
                
                SELECT 1 FROM ncos n
                WHERE n.in_unit = 1 ${ncoSearchClause}
                
                UNION ALL
                
                SELECT 1 FROM soldiers s
                WHERE s.in_unit = 1 ${soldierSearchClause}
            ) AS combined
        `;

      // If there's no search, don't use the search parameters, use a query without search conditions
      const countResult = await query(countQuery, params.length ? params : []);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Main data query (with UNION and pagination) ---
      const all = await query(
        `
            SELECT 
                o.mil_id,
                o.rank,
                o.name,
                o.department,
                ol.event_type,
                ol.event_time,
                o.in_unit,
                'officer' AS role
            FROM officers o
            LEFT JOIN (
                SELECT l1.* 
                FROM officer_log l1
                INNER JOIN (
                    SELECT officerID, MAX(event_time) AS latest_event
                    FROM officer_log
                    WHERE event_type = 'دخول'
                    GROUP BY officerID
                ) l2 ON l1.officerID = l2.officerID
                    AND l1.event_time = l2.latest_event
            ) ol ON ol.officerID = o.id
            WHERE o.in_unit = 1 ${officerSearchClause}
            
            UNION ALL

            SELECT 
                n.mil_id,
                n.rank,
                n.name,
                n.department,
                nl.event_type,
                nl.event_time,
                n.in_unit,
                'nco' AS role
            FROM ncos n
            LEFT JOIN (
                SELECT l1.* 
                FROM nco_log l1
                INNER JOIN (
                    SELECT ncoID, MAX(event_time) AS latest_event
                    FROM nco_log
                    WHERE event_type = 'دخول'
                    GROUP BY ncoID
                ) l2 ON l1.ncoID = l2.ncoID
                    AND l1.event_time = l2.latest_event
            ) nl ON nl.ncoID = n.id
            WHERE n.in_unit = 1 ${ncoSearchClause}
            
            UNION ALL

            SELECT 
                s.mil_id,
                s.rank,
                s.name,
                s.department,
                sl.event_type,
                sl.event_time,
                s.in_unit,
                'soldier' AS role
            FROM soldiers s
            LEFT JOIN (
                SELECT l1.* 
                FROM soldier_log l1
                INNER JOIN (
                    SELECT soldierID, MAX(event_time) AS latest_event
                    FROM soldier_log
                    WHERE event_type = 'دخول'
                    GROUP BY soldierID
                ) l2 ON l1.soldierID = l2.soldierID
                    AND l1.event_time = l2.latest_event
            ) sl ON sl.soldierID = s.id
            WHERE s.in_unit = 1 ${soldierSearchClause}
            LIMIT ? OFFSET ?
        `,
        [...params, limit, offset]
      );

      if (all.length === 0) {
        return res.status(404).json({
          msg: "No one found",
        });
      }

      return res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: all,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getDailySummary(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // Query all soldiers' data for the summary calculation
      const units = await query(`
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
FROM officers o
LEFT JOIN officer_leave_details old
    ON old.id = (
        SELECT id
        FROM officer_leave_details
        WHERE officerID = o.id
        ORDER BY id DESC
        LIMIT 1
    )
LEFT JOIN leave_type lt
    ON lt.id = old.leaveTypeID
    
    UNION ALL 
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
    ON lt.id = old.leaveTypeID
    
    UNION ALL 
    
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

      if (!units.length) {
        return res.status(404).json({ msg: "No units found" });
      }

      // Calculate the summary
      const totalUnits = units.length;
      const totalAttached = units.filter((unit) => unit.attached).length;
      const available = units.filter((unit) => unit.in_unit).length;
      const missing = totalUnits - available;
      const fixedMission = units.filter(
        (unit) => unit.tmam === "مأمورية ثابتة" && !unit.in_unit
      ).length;
      const course = units.filter(
        (unit) => unit.tmam === "فرقة / دورة" && !unit.in_unit
      ).length;

      // Breakdown for اجازة types
      const normalLeave = units.filter(
        (unit) => unit.tmam === "راحة" && !unit.in_unit
      ).length;
      
      const fieldLeave = units.filter(
        (unit) => unit.tmam === "اجازة ميدانية" && !unit.in_unit
      ).length;
      const grantLeave = units.filter(
        (unit) => unit.tmam === "منحة" && !unit.in_unit
      ).length;
      const compensatoryLeave = units.filter(
        (unit) => unit.tmam === "بدل راحة" && !unit.in_unit
      ).length;
      const casualLeave = units.filter(
        (unit) => unit.tmam === "عارضة" && !unit.in_unit
      ).length;

      // Other categories
      const annualLeave = units.filter(
        (unit) => unit.tmam === "اجازة سنوية" && !unit.in_unit
      ).length;

      const sickLeave = units.filter(
        (unit) => unit.tmam === "اجازة مرضية" && !unit.in_unit
      ).length;
      const mission = units.filter(
        (unit) =>
          (unit.tmam === "مأمورية" ||
            unit.tmam === "مأمورية جهاز الخدمات العامة") &&
          !unit.in_unit
      ).length;
      const hospital = units.filter(
        (unit) => unit.tmam === "عيادة" && !unit.in_unit
      ).length;

      // Calculating total exits (اجمالي الخوارج)
      const totalExits =
        fixedMission +
        normalLeave +
        fieldLeave +
        grantLeave +
        sickLeave +
        mission +
        hospital + 
        annualLeave +
        casualLeave +
        compensatoryLeave +
        course;

      // Calculate the percentage of available units
      const percentageAvailable = totalUnits
        ? ((missing / totalUnits) * 100).toFixed(2)
        : 0;

      // Return the daily summary response
      return res.status(200).json({
        total: totalUnits,
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
          اجازة_سنوية: annualLeave,
          عارضة: casualLeave,
          بدل_راحة: compensatoryLeave,
          فرقة_دورة: course,
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
  }

  static async getRankSummary(req, res) {
  try {
    const query = util.promisify(connection.query).bind(connection);

    const results = await query(`
      SELECT 
          \`rank\`,
          COUNT(*) AS total,
          SUM(CASE WHEN in_unit = 1 THEN 1 ELSE 0 END) AS available,
          SUM(CASE WHEN in_unit = 0 THEN 1 ELSE 0 END) AS missing,
          SUM(CASE WHEN attached = 1 THEN 1 ELSE 0 END) AS attached
      FROM (
          SELECT \`rank\`, in_unit, attached FROM officers
          UNION ALL
          SELECT \`rank\`, in_unit, attached FROM ncos
          UNION ALL
          SELECT \`rank\`, in_unit, attached FROM soldiers
      ) all_units
      GROUP BY \`rank\`;
    `);

    if (!results.length) {
      return res.status(404).json({ msg: "No data found" });
    }
    const RANK_ORDER = [
  "عميد",
  "عقيد",
  "مقدم",
    "مقدم أ ح",
  "رائد",
  "نقيب",
  "ملازم أول",
  "ملازم",
    "مساعد أول",
    "ملاحظ فني",
  "مساعد",
  "ملاحظ",
    "رقيب أول",
    "صانع ممتاز",
    "صانع دقيق",
  "رقيب",
  "عريف",
  "جندي"
];


    // ترتيب النتائج بداية من عميد
    const sorted = RANK_ORDER.map(rank => {
      const row = results.find(r => r.rank === rank);
      return row || {
        rank,
        total: 0,
        available: 0,
        missing: 0,
        attached: 0
      };
    });

    // إجماليات عامة
    const totals = sorted.reduce(
      (acc, r) => {
        acc.total += r.total;
        acc.available += r.available;
        acc.missing += r.missing;
        acc.attached += r.attached;
        return acc;
      },
      { total: 0, available: 0, missing: 0, attached: 0 }
    );

    return res.status(200).json({
      starting_from: "عميد",
      ranks: sorted,
      totals
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
}

}

module.exports = UnitController;
