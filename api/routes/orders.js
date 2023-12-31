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
        `INSERT INTO orders (user_id, amount, createdAt) VALUES (${req.body.id}, ${req.body.amount}, NOW())`,
        (err, rows, fields) => {

          const Id_commande = rows.insertId;

          for (let pizzaId of req.body.pizzas) {
            connection.query(
                `INSERT INTO orders_pizzas (order_id, pizza_id, quantity) VALUES (${Id_commande},${pizzaId},1)`
            );
          }
        }
    );
  });
});

//READ ALL
router.get("/", function (req, res) {
  //FILTER BY USER ID
  if (req.query.user_id) {
    const query = 'SELECT * FROM orders WHERE user_id = ?';
    const userId = req.query.user_id;

    connection.query(query, [userId], (err, rows, fields) => {
      if (err) {
        // Gérer l'erreur, par exemple en renvoyant une réponse d'erreur
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la requête.' });
      }

      res.json(rows);
    });
  } else if (req.query.status) {
    const query = 'SELECT * FROM orders WHERE status = ?';
    const status = req.query.status;

    connection.query(query, [status], (err, rows, fields) => {
      if (err) {
        // Gérer l'erreur, par exemple en renvoyant une réponse d'erreur
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la requête.' });
      }

      res.json(rows);
    });
  } else {
    connection.query("SELECT * FROM orders", (err, rows, fields) => {

      res.json(rows);
    });
  }
});

//UPDATE ONE BY ID
router.put("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    const query = `UPDATE orders SET id = ${req.body.id}, user_id=${req.body.user_id} status = "${req.body.status}", amount = ${req.body.amount}, updatedAt=NOW() WHERE id = ${req.body.id}`;

    connection.query(query, (err, rows, fields) => {

      res.json("updated");
    });
  });
});

//UPDATE STATUS BY ID
router.patch("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    const query = `UPDATE orders SET id = ${req.params.id}, status = "${req.body.status}", updatedAt=NOW() WHERE id = ${req.params.id}`;

    if (req.body.status == "validated") {
      /* 
      TODO:vérifier qu'il y a bien du stock
      */

      const query2 = `SELECT * FROM orders WHERE id = ${req.params.id}`;

      connection.query(query2, (err, rows, fields) => {

        let amount = rows[0].amount;
        let user_id = rows[0].user_id;

        const query3 = `SELECT * FROM users WHERE id = ${user_id}`;

        connection.query(query3, (err, rows, fields) => {

          let loyaltyPoints = rows[0].loyaltyPoints;

          if (amount < 10) {
            loyaltyPoints += 10;
          } else if (amount <= 20) {
            loyaltyPoints += 20;
          } else {
            loyaltyPoints += 30;
          }

          const query4 = `UPDATE users SET loyaltyPoints=${loyaltyPoints} WHERE id = ${user_id}`;

          connection.query(query4, (err, rows, fields) => {

            res.json("updated");
          });
        });
      });
      try {
        let query_PizzasInOrder =
            "SELECT * FROM orders_pizzas WHERE order_id=" + req.params.id;

        connection.query(query_PizzasInOrder, (err, rows, fields) => {
          if (err) throw err;

          let pizzas = rows;
          rows.forEach((element) => {
            const queryIngredients = `SELECT * FROM ingredients as ig INNER JOIN pizzas_ingredients as pi ON pi.ingredient_id = ig.id AND pi.pizza_id = ${element.pizza_id};`;

            connection.query(queryIngredients, (err, rows, fields) => {

              for (let element of rows) {

                let requete_Mise_A_jour_Stock_Ingredient = `UPDATE ingredients SET stock=${
                    element.stock - 10
                } WHERE id = ${element.id}`;
                connection.query(
                    requete_Mise_A_jour_Stock_Ingredient,
                    (err, rows, fields) => {}
                );
              }
            });
          });
        });
      } catch (error) {
      }
    } else {
      connection.query(query, (err, rows, fields) => {

        res.json("updated");
      });
    }
  });
});

//READ ONE BY ID
router.get("/:id", function (req, res) {
  const query = 'SELECT * FROM orders WHERE id = ?';
  const orderId = req.params.id;

  connection.query(query, [orderId], (err, rows, fields) => {
    if (err) {
      // Gérer l'erreur, par exemple en renvoyant une réponse d'erreur
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la requête.' });
    }

    res.json(rows);
  });
});

module.exports = router;
