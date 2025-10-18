const Department = require("../models/department");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util");


class DepartmentController {
    static async createDepartment(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }
            
 
            const query = util.promisify(connection.query).bind(connection);
             const checkDepartmentName = await query(
            "SELECT * from department where name = ?",
            [req.body.name]
             );
            
         
            
             if (checkDepartmentName.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Department already exists"
                        }
                    ],
                }); 
             }

            


           


            
            const departmentObject = new Department(
                req.body.name,
                )
                        


            await query("insert into department set name =?",
                [departmentObject.getName()]);
            
        
            return res.status(200).json(departmentObject.toJSON() );


        } catch (err) {  
            return res.status(500).json({ err: "error" });
        }
    }



    static async updateDepartment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
             const checkUser = await query(
            "SELECT * from users where id = ?",
            [req.params.id]
             );
            
            
             if (checkUser.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "User does not exist"
                        }
                    ],
                }); 
             }
            

            
             const userObject = new User(
                req.body.name,
                 req.body.username, 
                "",
                "",)
            
                 console.log("hello");

            
             await userObject.setPassword(req.body.password)
            

             
           
            
            

            await query("update  users set name = ?, username = ?, password = ?, where id = ?",
            [userObject.getName(),userObject.getUsername(),userObject.getPassword(),req.params.id]);
            


             return res.status(200).json( {msg: "User updated!"});







        } catch (err) {
            return res.status(500).json({ err: err });

        }
    }


    static async deleteUser(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
             const checkUser = await query(
            "SELECT * from users where id = ?",
            [req.params.id]
             );
            
            
             if (checkUser.length == 0) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "User does not exist"
                        }
                    ],
                }); 
             }
            

            await query("delete from users where id = ?", [checkUser[0].id])

            return res.status(200).json({
                msg: "User deleted!"
            })



        } catch (err) {

            return res.status(500).json({ err: err });

        }
    }


    static async getDepartments(req, res) {
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
            const depts = await query(`select * from departments ${search}`)

            if (depts.length == 0) {
                return res.status(404).json({
                    msg: "no departments found"
                })
            }

           

            


        
            
  
            return res.status(200).json(depts);



        } catch (err) { 
            return res.status(500).json({ err: err });
            
        }
    }

    static async getUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const query = util.promisify(connection.query).bind(connection);
           
            const user = await query("select * from users where id = ?",[req.params.id])

            if (user.length == 0) {
                return res.status(404).json({
                    msg: "no users found"
                })
            }

            // user.map((user) => {
            // });

            console.log(user[0]); 

            const userObject = new User(user[0].name, user[0].username, user[0].token, user[0].type, user[0].password);
            return res.status(200).json(userObject.toJSON());


 
        } catch (err) {
            return res.status(500).json({ err: err });
            
        }
    }

    
    }



module.exports = DepartmentController;