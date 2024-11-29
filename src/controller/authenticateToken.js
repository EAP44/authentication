const  jwt  = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY ;

function authenticateToken(req, res, next) {
  const token = req.body.token;
  console.log(token);
  if (!token) {
    return res.status(401).send("Token d'authentification manquant");
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send("Token invalide");
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;