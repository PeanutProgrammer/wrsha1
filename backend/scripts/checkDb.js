const pool = require('../db/dbConnection');

(async () => {
  try {
    const query = (sql, params) =>
      new Promise((resolve, reject) =>
        pool.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
      );

    const res = await query('SELECT 1 as ok');
    console.log('DB check OK:', res);
    process.exit(0);
  } catch (err) {
    console.error('DB check failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();