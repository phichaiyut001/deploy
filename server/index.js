const app = require("../server");

module.exports = async (req, res) => {
  await app(req, res);
};
