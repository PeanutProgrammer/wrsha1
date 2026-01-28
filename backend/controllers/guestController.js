const Guest = require("../models/guest");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class GuestController {
   static async createGuest(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const query = util.promisify(connection.query).bind(connection);

        // // Check if the guest already exists by name (assuming 'name' is unique)
        // const checkGuest = await query(
        //     "SELECT * from guests where name = ?",  // Adjust to use 'name' or another unique identifier
        //     [req.body.name]
        // );

        // if (checkGuest.length > 0) {
        //     return res.status(400).json({
        //         errors: [
        //             { msg: "Guest with this name already exists" }
        //         ],
        //     });
        // }

        // Ensure visit_start is set to current date and time if not provided
        const visitStart = req.body.visit_start || new Date().toISOString();  // Use current time if missing
        const visitEnd = req.body.visit_end || null;  // Use null if visit_end is missing

        // Correctly instantiate the Guest object with the proper order of parameters
        const guestObject = new Guest(
            null,  // id is null, assuming auto-increment
            req.body.rank,
            req.body.name,
            req.body.unit,
            visitStart,
            visitEnd,
            req.body.visit_to,
            req.body.reason
        );

        // Log the guest data you're trying to insert into the database
        console.log('Executing query with data:', [
            guestObject.getRank(),
            guestObject.getName(),
            guestObject.getUnit(),
            guestObject.getVisitStart(),
            guestObject.getVisitEnd(),
            guestObject.getVisitTo(),
            guestObject.getReason(),
        ]);

        // Now insert the guest into the database
        await query(
            "INSERT INTO guests SET guests.rank = ?, name = ?, unit = ?, visit_start = ?, visit_end = ?, visit_to = ?, reason = ?",
            [
                guestObject.getRank(),
                guestObject.getName(),
                guestObject.getUnit(),
                guestObject.getVisitStart(),
                guestObject.getVisitEnd(),
                guestObject.getVisitTo(),
                guestObject.getReason()
            ]
        );

        // Emit the update to other clients via socket (if required)
        req.app.get("io").emit("guestsUpdated");

        // Log the guest object
        console.log(guestObject.toJSON());

        // Return the successfully created guest object
        return res.status(200).json(guestObject.toJSON());

    } catch (err) {
        // Log the actual error to see what went wrong
        console.error('Error occurred in createGuest:', err);

        // Respond with a 500 error and the error details for easier debugging
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message || err,  // Provide the error message for easier debugging
        });
    }
}




    static async updateGuest(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
             const checkGuest = await query(
            "SELECT * from guests where id = ?",
            [req.params.id]
             );


             if (checkGuest.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Guest does not exist"
                        }
                    ],
                }); 
             }
            

            const guestObject = new Guest(
                req.body.rank,
                req.body.name,
                req.body.unit,
                req.body.visit_start,
                req.body.visit_end,
                req.body.visit_to,
                req.body.reason
            );

              console.log('Executing query with data:', [
                guestObject.getRank(),
                guestObject.getName(),
                guestObject.getUnit(),
                guestObject.getVisitStart(),
                guestObject.getVisitEnd(),
                guestObject.getVisitTo(),
                guestObject.getReason()
]);

            await query(`update guests set  guests.rank =?, name =?, unit = ?, visit_start = ?, visit_end = ?, visit_to = ?, reason = ? where id = ?`,
                [guestObject.getRank(), guestObject.getName(), guestObject.getUnit(), guestObject.getVisitStart(), guestObject.getVisitEnd(), guestObject.getVisitTo(), guestObject.getReason(), req.params.id]);



             req.app.get("io").emit("guestsUpdated");


             return res.status(200).json( {msg: "Guest updated!"});







        } catch (err) {
            return res.status(500).json({ err: err });

        }
    }

    static async deleteGuest(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
              const checkGuest = await query(
            "SELECT * from guests where id = ?",
            [req.params.id]
             );


             if (checkGuest.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Guest does not exist"
                        }
                    ],
                }); 
             }



            await query("delete from guests where id = ?", [checkGuest[0].id])



             req.app.get("io").emit("guestsUpdated");

            return res.status(200).json({
                msg: "Guest deleted!"
            })



        } catch (err) {

            return res.status(500).json({ err: err });

        }
    }


    static async getGuests(req, res) {
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
            "WHERE guests.name LIKE ? OR guests.visit_to LIKE ? OR guests.reason LIKE ? OR guests.unit LIKE ? OR guests.rank LIKE ?";
          const searchValue = `%${req.query.search}%`;
          params.push(searchValue, searchValue, searchValue, searchValue, searchValue);
        }

        // --- Total count for pagination ---
        const countQuery = `SELECT COUNT(*) AS total FROM guests ${searchClause}`;
        const countResult = await query(countQuery, params);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);


            const guests = await query(`select guests.id, guests.rank, guests.name, guests.unit, guests.visit_start, guests.visit_end, guests.visit_to, guests.reason, officers.rank as officer_rank, officers.name as officer_name 
                from guests
                left join officers on guests.visit_to = officers.id
                ${searchClause}
                order by guests.id DESC
                LIMIT ? OFFSET ?`, [...params, limit, offset]);

           if (!guests.length) {
          return res.status(404).json({ msg: "No guests found" });
        }

        return res.status(200).json({
          page,
          limit,
          total,
          totalPages,
          data: guests,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({
          message: "An unexpected error occurred",
          error: err.message,
        });
      }
    }

    static async getGuest(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
           console.log(req.params.id);

            const guest = await query("select * from guests where id = ?",[req.params.id])

            if (guest.length == 0) {
                return res.status(404).json({
                    msg: "no guests found blah"
                })
            }

            // user.map((user) => {
            // });

            console.log(guest[0]);

            const guestObject = new Guest(guest[0].name, guest[0].visit_start, guest[0].visit_end, guest[0].visit_to, guest[0].reason);
            return res.status(200).json(guestObject.toJSON());


 
        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }

        static async endVisit(req, res) {
        try {
            // Validate guest ID
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);

            // Check if the guest exists
            const checkGuest = await query(
                "SELECT * from guests where id = ?",
                [req.params.id]
            );

            if (checkGuest.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Guest does not exist"
                        }
                    ],
                });
            }

            // Get the current time to set as visit_end
            const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss");

            // Update the visit_end field in the database
            await query(
                "UPDATE guests SET visit_end = ? WHERE id = ?",
                [visitEnd, req.params.id]
            );

            // Emit the update via socket if needed
            req.app.get("io").emit("guestsUpdated");

            // Respond with a success message
            return res.status(200).json({
                msg: "Visit ended successfully!",
                visit_end: visitEnd // Return the new visit_end time
            });

        } catch (err) {
            // Handle error and return a response
            return res.status(500).json({ err: err });
        }
    }


     static async getCurrentGuests(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);

            // SQL query to fetch guests with null end_date in expert_record
            const guests = await query(`
                SELECT guests.id , guests.rank, guests.name, guests.unit, guests.visit_start, guests.visit_end, guests.visit_to, guests.reason, officers.rank as officer_rank, officers.name as officer_name
                FROM officers
                RIGHT JOIN guests ON guests.visit_to = officers.id
                 WHERE guests.visit_end IS NULL AND guests.visit_start IS NOT NULL
            `);

            if (guests.length === 0) {
                return res.status(404).json({
                    msg: "No guests with null visit_end found"
                });
            }

            return res.status(200).json(guests);
        } catch (err) {
            console.error(err);  // Log error for debugging
            return res.status(500).json({ err: err.message });
        }
    }


   

    





    
    }



module.exports = GuestController;