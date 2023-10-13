/**
 * 🚨 Attention, le code présent dans ce fichier contient volontairement de nombreuses imperfections :
 * 🚨 erreurs de conception, mauvaises pratiques de développement logiciel, failles de sécurité et de performance.
 * 🚨 Ce code servira de support à un exercice de refactoring.
 */

const jwt = require("jsonwebtoken");
const md5 = require("md5");

const express = require("express");
const router = express.Router();

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "db",
  user: "rps",
  password: "azerty",
  database: "rps"
});

connection.connect();

router.use(express.json());

//SIGNUP
router.post("/signup", (req, res) => {
  let pwd = md5(req.body.password);

  connection.query(
    `INSERT INTO users (firstname, lastname, email, role, password) VALUES ("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.role}","${pwd}")`,
    function (err, rows, fields) {

      let token = jwt.sign({ id: rows.insertId }, process.env.JWT_KEY);

      res.json({ token: token });
    }
  );
});

//SIGNIN
router.post("/signin", (req, res) => {
  let pwd = md5(req.body.password);

  connection.query(
    `SELECT * FROM users WHERE email = "${req.body.email}"`,
    function (err, rows, fields) {

      if (pwd == rows[0].password) {
        let token = jwt.sign({ id: rows.insertId }, process.env.JWT_KEY);

        res.json({ token: token });
      } else {
        res.json("error");
      }
    }
  );
});

module.exports = router;
