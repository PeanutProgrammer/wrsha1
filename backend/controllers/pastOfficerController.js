const PastOfficer = require("../models/pastOfficer");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");
const moment = require("moment");


class PastOfficerController {


    static async getOfficers(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
            let search = ""
            if (req.query.search) {
                search =  `where name LIKE '%${req.query.search}%'`
            }
            const officers = await query(`select * from past_officers ${search}`)

            if (officers.length == 0) {
                return res.status(404).json({
                    msg: "no officers found hey"
                })
            }

    
        


            

            
  
            return res.status(200).json(officers);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }

    static async getOfficer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
           
            const officer = await query("select * from past_officers where id = ?",[req.params.id])

            if (officer.length == 0) {
                return res.status(404).json({
                    msg: "no officers found blah"
                })
            }

            // user.map((user) => {
            // });

            console.log(officer[0]); 

            const officerObject = new PastOfficer(officer[0].name, officer[0].join_date,  officer[0].mil_id, officer[0].rank, officer[0].address, officer[0].height, officer[0].weight, officer[0].dob, officer[0].seniority_number, officer[0].end_date, officer[0].transferID, officer[0].transferred_to);
            return res.status(200).json(officerObject.toJSON());


 
        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }





 static async filterOfficersAndNCOs(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = util.promisify(connection.query).bind(connection);
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    let filters = [];
    let params = [];

    console.log("Filtering officers and NCOs");

    // Handle search by military ID (common for both tables)
    if (req.query.mil_id) {
      filters.push(`(mil_id = ?)`);
      params.push(`${req.query.mil_id}`);
    }

    // Handle search by name (common for both tables)
    if (req.query.name) {
      filters.push(`(name = ?)`);
      params.push(`${req.query.name}`);
    }

    // Handle filter by end date (common for both tables)
    if (req.query.end_date) {
      filters.push(`end_date = ?`);
      params.push(req.query.end_date);
    }

    // Filter by rank (common for both tables)
    if (req.query.rank) {
      filters.push("`rank` = ?");
      params.push(req.query.rank);
    }

    // Combine filters to apply to both tables
    const whereClause = filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";

    // SQL queries for both `past_officers` and `past_ncos`
    const sqlOfficers = `SELECT * FROM past_officers ${whereClause}`;
    const sqlNCOs = `SELECT * FROM past_ncos ${whereClause}`;

    // Execute both queries in parallel
    const officersPromise = query(sqlOfficers, params);
    const ncosPromise = query(sqlNCOs, params);

    const [officers, ncos] = await Promise.all([officersPromise, ncosPromise]);

    // Combine the results from both tables
    const combinedResults = [...officers, ...ncos];

    if (combinedResults.length === 0) {
      return res.status(404).json({
        errors: [{ msg: "No officers or NCOs found matching the criteria" }],
      });
    }

    // Optional: filter out entries that are not valid (e.g., future join dates)
    const validResults = combinedResults.filter(
      (item) => moment(item.join_date).isBefore(now)
    );

    return res.status(200).json(validResults);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: err.message });
  }

  // Additional filtering logic can be added here if needed

};
}
module.exports = PastOfficerController;