/**
 * 🚨 Attention, le code présent dans ce fichier contient volontairement de nombreuses imperfections :
 * 🚨 erreurs de conception, mauvaises pratiques de développement logiciel, failles de sécurité et de performance.
 * 🚨 Ce code servira de support à un exercice de refactoring.
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_DATABASE,
  database: process.env.DB_DATABASE
});

connection.connect();

router.use(express.json());

//CREATE
router.post("/", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");
    connection.query(
        `INSERT INTO pizzas (name, price, available) VALUES ("${req.body.name}", ${req.body.price}, ${req.body.available})`,
        (err, rows, fields) => {

          res.json("created");
        }
    );
  });
});

//READ ALL
router.get("/", function (req, res) {
  //FILTER BY NAME
  if (req.query.name) {
    const query = `SELECT * FROM pizzas WHERE name = "${req.query.name}"`;

    connection.query(query, (err, rows, fields) => {

      res.json(rows);
    });
  } else if (req.query.available) {
    const query = `SELECT * FROM pizzas WHERE available = ${req.query.available}`;

    connection.query(query, (err, rows, fields) => {

      res.json(rows);
    });
  } else {
    connection.query(
        "SELECT * FROM pizzas WHERE available = 1",
        (err, rows, fields) => {

          res.json(rows);
        }
    );
  }
});

//UPDATE ONE BY ID
router.put("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    const query = `UPDATE pizzas SET id = ${req.body.id}, name = "${req.body.name}", price = ${req.body.price}, available = ${req.body.available} WHERE id = ${req.body.id}`;

    connection.query(query, (err, rows, fields) => {

      res.json("updated");
    });
  });
});

//READ ONE BY ID
router.get("/:id", function (req, res) {
  const query = `SELECT * FROM pizzas WHERE available = 1 AND id =${req.params.id}`;

  connection.query(query, (err, rows, fields) => {

    res.json(rows);
  });
});

//DELETE
router.delete("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    connection.query(
        `DELETE FROM pizzas WHERE id = ${req.params.id}`,
        (err, rows, fields) => {

          res.json("deleted");
        }
    );
  });
});

module.exports = router;
