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
             const checkGuest = await query(
            "SELECT * from guests where id = ?",
            [req.body.id]
             );


             if (checkGuest.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Guest with this ID already exists"
                        }
                    ],
                }); 
             }

            


           


            const guestObject = new Guest(
                req.body.name,
                req.body.visit_start,
                req.body.visit_end,
                req.body.visit_to,
                req.body.reason
              )
            


            await query("insert into guests set  name =?, visit_start = ?, visit_end = ?, visit_to = ?, reason = ?",
                [guestObject.getName(), guestObject.getVisitStart(), guestObject.getVisitEnd(), guestObject.getVisitTo(), guestObject.getReason()]);

            req.app.get("io").emit("guestsUpdated");
            return res.status(200).json(guestObject.toJSON() );


        } catch (err) {  
            return res.status(500).json({ err: "error" });
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
                req.body.name,
                req.body.visit_start,
                req.body.visit_end,
                req.body.visit_to,
                req.body.reason
            );

              console.log('Executing query with data:', [
    guestObject.getName(),
    guestObject.getVisitStart(),
    guestObject.getVisitEnd(),
    guestObject.getVisitTo(),
    guestObject.getReason()
]);

            
            

             


            await query(`update guests set  name =?, visit_start = ?, visit_end = ?, visit_to = ?, reason = ? where id = ?`,
                [guestObject.getName(), guestObject.getVisitStart(), guestObject.getVisitEnd(), guestObject.getVisitTo(), guestObject.getReason(), req.params.id]);



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

            const guests = await query(`select  guests.id, guests.name, guests.visit_start, guests.visit_end, guests.visit_to, guests.reason, officers.rank, officers.name as officer_name 
                from guests
                left join officers on guests.visit_to = officers.id`)

            if (guests.length == 0) {
                return res.status(404).json({
                    msg: "no guests found hey"
                })
            }

            // // Map guests to Guest objects
            // const guestObjects = guests.map(guest => new Guest(
            //     guest.name,
            //     guest.visit_start,
            //     guest.visit_end,
            //     guest.visit_to,
            //     guest.reason
            // ));

            return res.status(200).json(guests);

        } catch (err) {
            return res.status(500).json({ err: err });
            
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

   

    





    
    }



module.exports = GuestController;