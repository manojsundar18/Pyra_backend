const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;
app.use(bodyParser.json());

const db = mysql.createPool({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "",
  database: "finance",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

// Enable CORS for all routes
app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const getUserQuery = "SELECT * FROM user WHERE email = ?";
  db.query(getUserQuery, [email], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
      return;
    }
    console.log(results);
    if (results.length > 0) {
      const user = results[0];
      console.log(user, "user", "password", password);
      if (user.password === password) {
        res.status(200).json({ userId: user.id, message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const checkQuery = "SELECT * FROM untitled WHERE email = ?";
  db.query(checkQuery, [email], async (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({ error: "Email already registered" });
    } else {
      const insertQuery =
        "INSERT INTO untitled (email, password, created_at, updated_at, is_deleted) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)";
      db.query(insertQuery, [email, password, 0], (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Database error" });
          return;
        }
        res.status(201).json({ message: "User registered successfully" });
      });
    }
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
