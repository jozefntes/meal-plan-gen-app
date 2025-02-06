const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");

// connect to db
let db;
(async () => {
  db = await open({
    filename: "db/data.sqlite",
    driver: sqlite3.Database,
  });
})();

app = express();
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const name = process.env.NAME || "World";
  res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => console.log(`Server listening on port ${port}`));
