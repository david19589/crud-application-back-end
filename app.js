import express from "express";
import bodyParser from "body-parser";
import pool from "./sqlDb.js";

const app = express();
app.use(bodyParser.json());

app.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM cars");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.post("/", async (req, res, next) => {
  const newCar = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM cars WHERE id = $1", [
      newCar.id,
    ]);

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO cars (id, car, Production) VALUES ($1, $2, $3)",
        [newCar.id, newCar.car, newCar.Production]
      );
      res.send(`new car added. ID: ${newCar.id}`);
    } else {
      res.status(409).send("Duplicated ID found. No entries added");
    }
  } catch (err) {
    console.error("Error adding car:", err);
    next(err);
  }
});

app.delete("/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const { rowCount } = await pool.query("DELETE FROM cars WHERE id = $1", [
      id,
    ]);

    if (rowCount > 0) {
      res.send(`Car with ID ${id} has been deleted.`);
    } else {
      res.status(404).send(`Car with id ${id} not found.`);
    }
  } catch (err) {
    console.error("Error deleting car:", err);
    next(err);
  }
});

app.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const { car, Production } = req.body;

  try {
    const { rowCount } = await pool.query(
      "UPDATE cars SET id = $1, car = $2, production = $3",
      [id, car, Production]
    );

    if (rowCount > 0) {
      res.send(`Car with ID ${id} updated!.`);
    } else {
      res.status(404).send(`Car with id ${id} not found`);
    }
  } catch (err) {
    console.error("Error updating car:", err);
    next(err);
  }
});

app.listen(4001, () => {
  console.log("started server on port 4001");
});
