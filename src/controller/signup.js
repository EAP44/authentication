require("../database/mongoose");
const User = require("../database/models/User");
const bcrypt = require("bcrypt");

async function signup(req, res) {
  try {
    const { nom, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nom, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send("Utilisateur créé avec succès");
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = signup;