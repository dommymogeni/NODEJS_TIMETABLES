const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const fs = require("node:fs");

//providing utilities for working with file and directory paths
const path = require("node:path");
const index = require("./routes/index");

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/", index);

// instanciating the listening port for the project
const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`server is ready ${PORT}`);
});
