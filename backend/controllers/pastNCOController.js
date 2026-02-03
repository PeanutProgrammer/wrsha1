const PastNCO = require("../models/pastNCO");
const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");

class PastNCOController {
  static async getNCO(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const officer = await query("select * from past_ncos where id = ?", [
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

      const officerObject = new PastNCO(
        officer[0].name,
        officer[0].join_date,
        officer[0].mil_id,
        officer[0].rank,
        officer[0].address,
        officer[0].dob,
        officer[0].end_date,
        officer[0].transferID,
        officer[0].transferred_to
      );
      return res.status(200).json(officerObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getNCOs(req, res) {
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
      const officers = await query(`select * from past_ncos ${search}`);

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

module.exports = PastNCOController;
