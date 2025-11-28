const Delegate = require("../models/delegate");
const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");

class DelegateController {
  static async createDelegate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

    //   // Check if the delegate already exists by name (assuming 'name' is unique)
    //   const checkDelegate = await query(
    //     "SELECT * from delegates where id = ?",
    //     [req.body.id]
    //   );

    //   if (checkDelegate.length > 0) {
    //     return res.status(400).json({
    //       errors: [{ msg: "Delegate with this name already exists" }],
    //     });
    //   }

      // Ensure visit_start is set to current date and time if not provided
      const visitStart = req.body.visit_start || new Date().toISOString(); // Use current time if missing
      const visitEnd = req.body.visit_end || null; // Use null if visit_end is missing

      // Correctly instantiate the Delegate object with the proper order of parameters
      const delegateObject = new Delegate(
        null, // id is null, assuming auto-increment
        req.body.rank,
        req.body.name,
        req.body.unit,
        visitStart,
        visitEnd,
        req.body.notes
      );

      // Log the delegate data you're trying to insert into the database
      console.log("Executing query with data:", [
        delegateObject.getName(),
        delegateObject.getVisitStart(),
        delegateObject.getVisitEnd(),
        delegateObject.getUnit(),
        delegateObject.getNotes(),
      ]);

      // Now insert the delegate into the database
      await query(
        "INSERT INTO delegates SET `rank` = ?, name = ?, unit = ?, visit_start = ?, visit_end = ?, notes = ?",
        [
          delegateObject.getRank(),
          delegateObject.getName(),
          delegateObject.getUnit(),
          delegateObject.getVisitStart(),
          delegateObject.getVisitEnd(),
          delegateObject.getNotes(),
        ]
      );

      // Emit the update to other clients via socket (if required)
      req.app.get("io").emit("delegatesUpdated");

      // Log the delegate object
      console.log(delegateObject.toJSON());

      // Return the successfully created delegate object
      return res.status(200).json(delegateObject.toJSON());
    } catch (err) {
      // Log the actual error to see what went wrong
      console.error("Error occurred in createDelegate:", err);

      // Respond with a 500 error and the error details for easier debugging
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message || err, // Provide the error message for easier debugging
      });
    }
  }

  static async updateDelegate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkDelegate = await query("SELECT * from delegates where id = ?", [
        req.params.id,
      ]);

      if (checkDelegate.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Delegate does not exist",
            },
          ],
        });
      }

      const delegateObject = new Delegate(
        req.body.rank,
        req.body.name,
        req.body.unit,
        req.body.visit_start,
        req.body.visit_end,
        req.body.notes
      );

      console.log("Executing query with data:", [
        delegateObject.getRank(),
        delegateObject.getName(),
        delegateObject.getUnit(),
        delegateObject.getVisitStart(),
        delegateObject.getVisitEnd(),
        delegateObject.getNotes(),
      ]);

      await query(
        "update delegates SET `rank` = ?, name = ?, unit = ?, visit_start = ?, visit_end = ?, notes = ? where id = ?",
        [
          delegateObject.getRank(),
          delegateObject.getName(),
          delegateObject.getUnit(),
          delegateObject.getVisitStart(),
          delegateObject.getVisitEnd(),
          delegateObject.getNotes(),
          req.params.id,
        ]
      );

      req.app.get("io").emit("delegatesUpdated");

      return res.status(200).json({ msg: "Delegate updated!" });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async deleteDelegate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      const checkDelegate = await query("SELECT * from delegates where id = ?", [
        req.params.id,
      ]);

      if (checkDelegate.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Delegate does not exist",
            },
          ],
        });
      }

      await query("delete from delegates where id = ?", [checkDelegate[0].id]);

      req.app.get("io").emit("delegatesUpdated");

      return res.status(200).json({
        msg: "Delegate deleted!",
      });
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getDelegates(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      const delegates =
        await query(`select  delegates.id, delegates.rank, delegates.name, delegates.unit, delegates.visit_start, delegates.visit_end, delegates.notes 
                from delegates`);

      if (delegates.length == 0) {
        return res.status(404).json({
          msg: "no delegates found hey",
        });
      }

      // // Map delegates to Delegate objects
      // const guestObjects = delegates.map(delegate => new Delegate(
      //     delegate.name,
      //     delegate.visit_start,
      //     delegate.visit_end,
      //     delegate.visit_to,
      //     delegate.reason
      // ));

      return res.status(200).json(delegates);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async getDelegate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);
      console.log(req.params.id);

      const delegate = await query("select * from delegates where id = ?", [
        req.params.id,
      ]);

      if (delegate.length == 0) {
        return res.status(404).json({
          msg: "no delegates found blah",
        });
      }

      // user.map((user) => {
      // });

      console.log(delegate[0]);

        const delegateObject = new Delegate(
          delegate[0].rank,
            delegate[0].name,
        delegate[0].unit,
        delegate[0].visit_start,
        delegate[0].visit_end,
        delegate[0].notes
      );
      return res.status(200).json(delegateObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async endVisit(req, res) {
    try {
      // Validate delegate ID
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // Check if the delegate exists
      const checkDelegate = await query("SELECT * from delegates where id = ?", [
        req.params.id,
      ]);

      if (checkDelegate.length == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "Delegate does not exist",
            },
          ],
        });
      }

      // Get the current time to set as visit_end
      const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss");

      // Update the visit_end field in the database
      await query("UPDATE delegates SET visit_end = ? WHERE id = ?", [
        visitEnd,
        req.params.id,
      ]);

      // Emit the update via socket if needed
      req.app.get("io").emit("delegatesUpdated");

      // Respond with a success message
      return res.status(200).json({
        msg: "Visit ended successfully!",
        visit_end: visitEnd, // Return the new visit_end time
      });
    } catch (err) {
      // Handle error and return a response
      return res.status(500).json({ err: err });
    }
  }

  static async getCurrentDelegates(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // SQL query to fetch delegates with null end_date in expert_record
      const delegates = await query(`
                SELECT delegates.id , delegates.rank, delegates.name, delegates.unit, delegates.visit_start, delegates.visit_end, delegates.notes
                FROM delegates
                 WHERE delegates.visit_end IS NULL AND delegates.visit_start IS NOT NULL
            `);

      if (delegates.length === 0) {
        return res.status(404).json({
          msg: "No delegates with null visit_end found",
        });
      }

      return res.status(200).json(delegates);
    } catch (err) {
      console.error(err); // Log error for debugging
      return res.status(500).json({ err: err.message });
    }
  }
}

module.exports = DelegateController;
