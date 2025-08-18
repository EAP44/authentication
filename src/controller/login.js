require("../database/mongoose");
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in environment variables.");
}

// Rate limiting storage (in-memory - consider Redis for production)
const loginAttempts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = loginAttempts.get(ip) || [];

  // Filter attempts within the time window
  const recentAttempts = attempts.filter((time) => now - time < windowMs);
  recentAttempts.push(now);

  loginAttempts.set(ip, recentAttempts);

  return recentAttempts.length > maxAttempts;
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe sont requis." });
    }

    // Rate limiting
    if (isRateLimited(ip)) {
      return res
        .status(429)
        .json({ error: "Trop de tentatives de connexion. Veuillez réessayer plus tard." });
    }

    // User lookup
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect." });
    }

    // Password check
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect." });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "24h" });

    // Send token in HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in production
      sameSite: "strict", // prevent CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Une erreur interne s'est produite." });
  }
}

module.exports = login;
