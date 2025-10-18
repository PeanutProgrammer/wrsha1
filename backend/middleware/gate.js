const connection = require("../db/dbConnection");
const util = require("util");

const gateType = 1;

const gate = async (req, res,next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers; 
    const gateData = await query("select * from users where token = ?", [token]);
    if (gateData[0] && gateData[0].type == gateType) { 
        next();
    } else {
        res.status(403).json({
            msg: "you are not authorized to access this route "
        })
    }
    

}


module.exports = gate; 