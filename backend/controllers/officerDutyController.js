const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const Officer = require("../models/officer");
const withTransaction = require("../utils/withTransaction");

class OfficerDutyController {
  static async createDuty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        commander_officer,
        operations_officer,
        duty_officer,
        lightweight_officer,
        food_officer,
        date,
      } = req.body;

      const query = util.promisify(connection.query).bind(connection);

      const result = await query(
        `INSERT INTO officer_duty (commander_officer, operations_officer, duty_officer, lightweight_officer, food_officer, date)
                 VALUES (?, ?, ?, ?, ?, ?)`,
        [
          commander_officer,
          operations_officer,
          duty_officer,
          lightweight_officer,
          food_officer,
          date,
        ]
      );

      req.app.get("io").emit("officersUpdated");

      return res
        .status(201)
        .json({ msg: "تمت الإضافة بنجاح", id: result.insertId });
    } catch (err) {
      return res.status(500).json({ err });
    }
  }

  static async updateDuty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array()); // Log errors
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        commander_officer,
        operations_officer,
        duty_officer,
        lightweight_officer,
        food_officer,
        date,
      } = req.body;

      const query = util.promisify(connection.query).bind(connection);

      const existing = await query(
        `SELECT * FROM officer_duty WHERE date = ?`,
        [date]
      );

      if (existing.length === 0) {
        return res.status(404).json({ msg: "Record not found" });
      }

      await query(
        `UPDATE officer_duty
             SET commander_officer = ?, operations_officer = ?, duty_officer = ?, lightweight_officer = ?, food_officer = ?
             WHERE date = ?`,
        [
          commander_officer || null,
          operations_officer || null,
          duty_officer || null,
          lightweight_officer || null,
          food_officer || null,
          date || null,
        ]
      );
      req.app.get("io").emit("officersUpdated");
      return res.status(200).json({ msg: "تم التحديث بنجاح" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getDuties(req, res) {
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
        searchClause = `
    WHERE (
      CONCAT_WS(' ',
        cmd.name, ops.name, dut.name, lw.name, food.name,
        cmd.department, ops.department, dut.department, lw.department, food.department,
        cmd.rank, ops.rank, dut.rank, lw.rank, food.rank
      ) LIKE ?
      OR od.date LIKE ?
    )
  `;
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue);
      }

      // --- Total count for pagination ---
      const countQuery = `
  SELECT COUNT(*) AS total
  FROM officer_duty od
  LEFT JOIN officers cmd  ON od.commander_officer   = cmd.id
  LEFT JOIN officers ops  ON od.operations_officer  = ops.id
  LEFT JOIN officers dut  ON od.duty_officer        = dut.id
  LEFT JOIN officers lw   ON od.lightweight_officer = lw.id
  LEFT JOIN officers food ON od.food_officer        = food.id
  ${searchClause}
`;

      const countResult = await query(countQuery, params);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Data query with pagination ---
      const dataQuery = `
SELECT
  od.date,

  cmd.rank    AS commander_rank,
  cmd.name    AS commander_name,
  cmd.department AS commander_department,
  cmd.telephone_number AS commander_telephone_number,

  ops.rank    AS operations_rank,
  ops.name    AS operations_name,
  ops.department AS operations_department,
  ops.telephone_number AS operations_telephone_number,

  dut.rank    AS duty_rank,
  dut.name    AS duty_name,
  dut.department AS duty_department,
  dut.telephone_number AS duty_telephone_number,

  lw.rank     AS lightweight_rank,
  lw.name     AS lightweight_name,
  lw.department AS lightweight_department,
  lw.telephone_number AS lightweight_telephone_number,

  food.rank   AS food_rank,
  food.name   AS food_name,
  food.department AS food_department,
  food.telephone_number AS food_telephone_number

FROM officer_duty od
LEFT JOIN officers cmd  ON od.commander_officer   = cmd.id
LEFT JOIN officers ops  ON od.operations_officer  = ops.id
LEFT JOIN officers dut  ON od.duty_officer        = dut.id
LEFT JOIN officers lw   ON od.lightweight_officer = lw.id
LEFT JOIN officers food ON od.food_officer        = food.id

${searchClause}

ORDER BY od.date DESC
LIMIT ? OFFSET ?;
`;

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

  static async viewDuties(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const { date } = req.query;

      const dataQuery = `
      SELECT
        cmd.rank  AS commander_rank,
        cmd.name  AS commander_name,
        cmd.department AS commander_department,
        cmd.telephone_number AS commander_telephone_number,

        ops.rank  AS operations_rank,
        ops.name  AS operations_name,
        ops.department AS operations_department,
        ops.telephone_number AS operations_telephone_number,

        dut.rank  AS duty_rank,
        dut.name  AS duty_name,
        dut.department AS duty_department,
        dut.telephone_number AS duty_telephone_number,

        lw.rank   AS lightweight_rank,
        lw.name   AS lightweight_name,
        lw.department AS lightweight_department,
        lw.telephone_number AS lightweight_telephone_number,

        food.rank AS food_rank,
        food.name AS food_name,
        food.department AS food_department,
        food.telephone_number AS food_telephone_number

      FROM officer_duty od
      LEFT JOIN officers cmd  ON od.commander_officer   = cmd.id
      LEFT JOIN officers ops  ON od.operations_officer  = ops.id
      LEFT JOIN officers dut  ON od.duty_officer        = dut.id
      LEFT JOIN officers lw   ON od.lightweight_officer = lw.id
      LEFT JOIN officers food ON od.food_officer        = food.id
      WHERE od.date = ?
    `;

      const officers = await query(dataQuery, [date]);

      if (!officers.length) {
        return res.status(404).json({ msg: "No officers found for this date" });
      }

      return res.status(200).json({ data: officers });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }

  static async getDutyByDate(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          message: "date is required",
        });
      }

      const query = util.promisify(connection.query).bind(connection);

      const sql = `
        SELECT
        officer_duty.id,
        date,
        commander_officer,
        operations_officer,
        duty_officer,
        lightweight_officer,
        food_officer,
        commander_officer.telephone_number AS commander_telephone_number,
        operations_officer.telephone_number AS operations_telephone_number,
        duty_officer.telephone_number AS duty_telephone_number,
        lightweight_officer.telephone_number AS lightweight_telephone_number,
        food_officer.telephone_number AS food_telephone_number
      FROM officer_duty
      LEFT JOIN officers commander_officer ON officer_duty.commander_officer = commander_officer.id
      LEFT JOIN officers operations_officer ON officer_duty.operations_officer = operations_officer.id
      LEFT JOIN officers duty_officer ON officer_duty.duty_officer = duty_officer.id
      LEFT JOIN officers lightweight_officer ON officer_duty.lightweight_officer = lightweight_officer.id
      LEFT JOIN officers food_officer ON officer_duty.food_officer = food_officer.id
      WHERE date = ?
      LIMIT 1
    `;

      const result = await query(sql, [date]);

      if (!result.length) {
        // IMPORTANT: return 200 with null (frontend-friendly)
        return res.status(200).json(null);
      }

      return res.status(200).json(result[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "An unexpected error occurred",
        error: err.message,
      });
    }
  }
}

module.exports = OfficerDutyController;
