const basicAuth = require("express-basic-auth");

const adminAuth = basicAuth({
  users: {
    [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD,
  },
  challenge: true,
  unauthorizedResponse: {
    error: "Admin access required",
  },
});

module.exports = adminAuth;