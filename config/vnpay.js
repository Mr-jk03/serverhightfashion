require("dotenv").config();

module.exports = {
  tmnCode: process.env.VNP_TMNCODE,
  hashSecret: process.env.VNP_HASHSECRET,
  vnpUrl: process.env.VNP_URL,
  returnUrl: process.env.VNP_RETURNURL,
};
