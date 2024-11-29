const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const PORT = process.env.PORT || 3000;
//-----------------------------------------------------------------------------//
const signup = require("./src/controller/signup");
const login = require("./src/controller/login");
const authenticateToken = require("./src/controller/authenticateToken");
//-----------------------------------------------------------------------------//
app.get("/profile", authenticateToken, (req, res) => {res.send(req.user)});
app.post("/signup", signup);
app.post("/login", login);
//-----------------------------------------------------------------------------//
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
