// utils/withTransaction.js
const getTransactionConnection  = require("../db/dbTransaction");
const util = require("util");

async function withTransaction(callback) {
  const conn = await getTransactionConnection();
  const query = util.promisify(conn.query).bind(conn);

  try {
    await conn.beginTransaction();

    const result = await callback(query);

    await conn.commit();
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = withTransaction;
