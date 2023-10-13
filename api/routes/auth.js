const jwt = require("jsonwebtoken");
const md5 = require("md5");

const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_DATABASE,
    database: process.env.DB_DATABASE
});

connection.connect();

router.use(express.json());

//SIGNUP
router.post("/signup", (req, res) => {
    let pwd = md5(req.body.password);

    const insertUserQuery =
        "INSERT INTO users (firstname, lastname, email, role, password) VALUES (?, ?, ?, ?, ?)";

    connection.query(
        insertUserQuery,
        [req.body.firstname, req.body.lastname, req.body.email, req.body.role, pwd],
        (err, rows, fields) => {
            let token = jwt.sign({ id: rows.insertId }, process.env.JWT_KEY);
            res.json({ token: token });
        }
    );
});

//SIGNIN
router.post("/signin", (req, res) => {
    let pwd = md5(req.body.password);

    const selectUserQuery = "SELECT * FROM users WHERE email = ?";

    connection.query(selectUserQuery, [req.body.email], (err, rows, fields) => {
        if (err) {
            res.json("error");
        } else {
            if (rows.length > 0 && pwd == rows[0].password) {
                let token = jwt.sign({ id: rows.insertId }, process.env.JWT_KEY);
                res.json({ token: token });
            } else {
                res.status(401).json("E-mail ou mot de passe incorrect");
            }
        }
    });
});

module.exports = router;