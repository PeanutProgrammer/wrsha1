const connection = require("../db/dbConnection");
const util = require("util");
const adminType = 5;
const shuoonOfficersType = 3;

const shuoonOfficers = async (req, res,next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers; 
        console.log(token);

    const userData = await query("select * from users where token = ?", [token]);
    console.log(userData[0]);
    if(userData[0].type == 5)
        console.log("yes");
    else
        console.log("no");
        
        
    
    if (userData[0] && (userData[0].type == "شؤون ضباط" || userData[0].type == "admin" )) { 
        next();
    } else {
        res.status(403).json({
            msg: "you are not authorized to access this route "
        })
    }
    

}


module.exports = shuoonOfficers; 