const connection = require("../db/dbConnection");
const util = require("util");


const gate = async (req, res,next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers; 
        console.log(token);

    const userData = await query("select * from users where token = ?", [token]);
 
    
    if (userData[0] && (userData[0].type == "بوابة" || userData[0].type == "admin" )) { 
        next();
    } else {
        res.status(403).json({
            msg: "you are not authorized to access this route "
        })
    }
    

}


module.exports = gate; 