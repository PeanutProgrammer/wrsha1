const mysql = require("mysql");  // Use require for CommonJS

// Load environment variables if dotenv is available (optional)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional; if it's not installed just continue and rely on process.env
}

// Use a pool instead of a single connection. Pools are safer and more resilient.
const pool = mysql.createPool({
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "", 
    database: process.env.DB_NAME || "wrsha1",
    port: process.env.DB_PORT || "3306",
});

// Verify a connection on startup but don't throw — just log the error so the app can handle it.
pool.getConnection((err, connection) => {
    if (err) {
        console.error("DB connection error:", err); 
        return;
    }
    console.log("DB connected"); 
    connection.release();
});

module.exports = pool;
