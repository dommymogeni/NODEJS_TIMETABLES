const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Path to save the JSON file
const dataPath = path.join(__dirname, "../data/teachers.json");

const teachersPath = path.join(__dirname, '../data/teachers.json');
let teachers = require(teachersPath);

// Define days and times arrays
const days = ['time','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00'];


// Ensure the data directory exists
if (!fs.existsSync(path.join(__dirname, "../data"))) {
  fs.mkdirSync(path.join(__dirname, "../data"));
}

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/teachers", (req, res) => {
  res.render("teachers");
});

router.post("/save-teachers", (req, res) => {
  const formData = req.body;

  // Read existing data
  fs.readFile(dataPath, (err, data) => {
    if (err && err.code !== "ENOENT") {
      return res.status(500).send("An error occurred while reading the data.");
    }

    let users = [];
    if (data) {
      users = JSON.parse(data);
    }

    // Add new user data
    users.push(formData);

    // Write updated data to the file
    fs.writeFile(dataPath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send("An error occurred while saving the data.");
      }
      res.redirect("/");
    });
  });
});

router.post("/generate-timetable", (req, res) => {
  const subjects = Object.keys(teachers);

  // Clear the current timetable
  days.forEach((day) => {
    timetable[day] = [];
  });

  // Populate the timetable
  days.forEach((day) => {
    times.forEach((time, index) => {
      const subject = subjects[index % subjects.length];
      timetable[day].push({ time, subject, teacher: teachers[subject] });
    });
  });

  // Save the updated timetable to the JSON file
  fs.writeFile(timetablePath, JSON.stringify(timetable, null, 2), (err) => {
    if (err) {
      console.error("Error saving timetable:", err);
      return res.status(500).send("Error saving timetable.");
    }
    res.redirect("/timetable");
  });
});

router.get("/timetable", (req, res) => {
  res.render("timetable", { timetable, teachers });
});

module.exports = router;
