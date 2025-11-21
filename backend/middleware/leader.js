const connection = require("../db/dbConnection");
const util = require("util");

const leaderType = 2;

const leader = async (req, res, next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers;
    const leaderData = await query("select * from users where token = ?", [token]);
    if (leaderData[0] && leaderData[0].type == leaderType) {
        next();
    }

    throw new Error("leader");
    

};


module.exports = leader; 