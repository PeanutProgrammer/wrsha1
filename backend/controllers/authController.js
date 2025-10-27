const User = require("../models/user");
const { validationResult } = require('express-validator');
const connection = require("../db/dbConnection");
const util = require("util"); 
// const session = require("express-session");



class authController { 
    static  async login(req, res) {
        try {

        //validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        console.log("ok");
        

        //check email
        const query = util.promisify(connection.query).bind(connection);
                console.log("ok");

        const checkUsername =   await query(
            "SELECT * from users where username = ?",
            [req.body.username]
        );
                console.log("ok");

            
            console.log(checkUsername);
            
            

        if (checkUsername.length == 0) {
            return res.status(404).json({
                errors: [
                    {
                        msg: "Username or Password does not exist"
                    }
                ],
            }); 
        }

        const userData = checkUsername[0];

            
                  
            
            
             
            
            console.log(userData);
      console.log("userData is:", userData);
        console.log("userData.name:", userData.name);
        console.log("userData.username:", userData.username);
        console.log("userData.password:", userData.password);

            
            const user = new User(userData.name, userData.username, userData.token, userData.type, userData.password);
            

            

        //compare password


            const checkPassword = await user.checkPassword(req.body.password);
            console.log(userData.id);

            


            if (checkPassword) {
                // req.session.userId = userData.id;
                // console.log(req.sessionID);
                delete userData.password;
                return res.status(200).json(userData);
             } else {
                return res.status(404).json({
                    errors: [
                    {
                        msg: "Password Incorrect!"
                    }
                ],
            }); 

        }

            
    } catch (err) {
        return res.status(500).json({ err: err });
    }   
    }

    static async logout(req, res) {
        try {
              //validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

            const query = util.promisify(connection.query).bind(connection);

            const { token } = req.headers
            console.log(token);

            // await query("update users set status = ? where token = ?", [0,token]);

            
            return res.status(200).json({
                msg: "Logged Out Successfully"
            })

        } catch (err) {
            return res.status(500).json({
                err: err
            })
        }
    }
}


module.exports = authController; 