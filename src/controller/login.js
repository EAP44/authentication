require("../database/mongoose");
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY ;

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("L'utilisateur n'existe pas");
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).send("Mot de passe incorrect");
    }
    const token = jwt.sign({ userId: user._id },SECRET_KEY, { expiresIn: "24h" });
    res.send({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = login;