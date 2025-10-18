const bcrypt = require('bcrypt');

(async () => {
  const hashedString = await bcrypt.hash("User#12345.", 10);
  console.log(hashedString);
})();
