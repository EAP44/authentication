require("../database/mongoose");
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const loginAttempts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];
  const filteredAttempts = attempts.filter(attempt => now - attempt < 15 * 60 * 1000); // Fenêtre de 15 minutes
  loginAttempts.set(ip, filteredAttempts);

  if (filteredAttempts.length >= 5) {
    return true;
  }
  filteredAttempts.push(now);
  loginAttempts.set(ip, filteredAttempts);
  return false;
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    // Rate limiting
    if (isRateLimited(ip)) {
      return res.status(429).send("Trop de tentatives de connexion. Veuillez réessayer plus tard.");
    }

    // Input validation
    if (!email || !password) {
      return res.status(400).send("L'email et le mot de passe sont requis.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Email ou mot de passe incorrect."); // Message générique
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).send("Email ou mot de passe incorrect."); // Message générique
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "24h" });

    // Send token in HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Sécurisé en production
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    });

    res.send({ message: "Connexion réussie" });
  } catch (error) {
    res.status(500).send("Une erreur s'est produite. Veuillez réessayer plus tard.");
  }
}

module.exports = login;
