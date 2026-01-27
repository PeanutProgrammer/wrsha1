const Event = require("../models/event");
const { validationResult } = require("express-validator");
const connection = require("../db/dbConnection");
const util = require("util");

class EventController {
  static async getEvents(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);

      // --- Search params ---
      let searchClause = "";
      const params = [];
      if (req.query.search) {
        searchClause = "AND (events.name LIKE ? OR events.date LIKE ? OR events.description LIKE ? OR events.location LIKE ?)";
        const searchValue = `%${req.query.search}%`;
        params.push(searchValue, searchValue, searchValue, searchValue);
      }

      const events = await query(
        `select * from events ${searchClause} order by events.date asc`,
        params
      );

      if (events.length == 0) {
        return res.status(404).json({
          msg: "no events found",
        });
      }

      return res.status(200).json(events);
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }

  static async createEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(connection.query).bind(connection);


      const eventObject = new Event(
        req.body.name,
        req.body.date,
        req.body.description,
        req.body.location
      );

      await query(
        "insert into events set name = ?, date = ?, description = ?, location = ?",
        [
          eventObject.getName(),
          eventObject.getDate(),
          eventObject.getDescription(),
          eventObject.getLocation()
        ]
      );

      req.app.get("io").emit("eventsUpdated");
      return res.status(200).json(eventObject.toJSON());
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }


  
    static async deleteEvent(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
              const checkEvent = await query(
            "SELECT * from events where id = ?",
            [req.params.id]
             );


             if (checkEvent.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Event does not exist"
                        }
                    ],
                }); 
             }





            await query("delete from events where id = ?", [checkEvent[0].id])

             req.app.get("io").emit("eventsUpdated");

            return res.status(200).json({
                msg: "Event deleted!"
            })



        } catch (err) {

            return res.status(500).json({ err: err });

        }
    }
}

module.exports = EventController;
