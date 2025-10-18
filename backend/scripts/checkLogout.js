const axios = require('axios');

(async () => {
  try {
    const base = process.env.BACKEND_BASE_URL || 'http://localhost:4001';
    const token = process.env.AUTH_TEST_TOKEN || null;

    const headers = {};
    if (token) headers.token = token;

    const resp = await axios.post(`${base}/auth/logout`, {}, {
      headers,
      timeout: 5000
    });

    console.log('Logout endpoint responded with status:', resp.status);
    console.log('Body:', resp.data);
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('Logout endpoint returned error status:', err.response.status, err.response.data);
    } else {
      console.error('Logout check failed:', err && err.message ? err.message : err);
    }
    process.exit(2);
  }
})();