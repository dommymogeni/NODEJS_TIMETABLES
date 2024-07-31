const express = require("express");
const router = express.Router();
const fs = require("node:fs");
const path = require("node:path");

// Path to save the JSON file
const dataPath = path.join(__dirname, "../data/teachers.json");

const timetablePath = path.join(__dirname, "../data/timetable.json");
const timetables = timetablePath;

// Ensure the data directory exists
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"));
}

router.get("/teachers", (req, res) => {
  res.render("teachers");
});

// saving teachers of different subjecs
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

// Load timetable
function loadTimetable() {
  if (fs.existsSync(path.join(__dirname, "timetable.json"))) {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, "timetable.json"), "utf8")
    );
  }
  return generateInitialTimetable();
}

// Save timetable
function saveTimetable(timetable) {
  fs.writeFileSync("timetable.json", JSON.stringify(timetable, null, 2));
}

// Validate timetable
function isValidTimetable(timetable) {
  const subjectHours = {
    Languages: 0,
    Sciences: 0,
    Arts: 0,
    Sports: 0,
  };

  const teacherBookings = {};

  for (const time in timetable) {
    for (const day in timetable[time]) {
      const subject = timetable[time][day];
      if (subject) {
        subjectHours[subject] += 1;

        const teacher = getTeacherForSubject(subject);
        if (!teacherBookings[teacher]) {
          teacherBookings[teacher] = [];
        }
        if (teacherBookings[teacher].includes(time)) {
          return false;
        }
        teacherBookings[teacher].push(time);
      }
    }
  }

  return (
    subjectHours["Languages"] === 10 &&
    subjectHours["Sciences"] === 10 &&
    subjectHours["Arts"] === 5 &&
    subjectHours["Sports"] === 5
  );
}

// Map subjects to teachers
function getTeacherForSubject(subject) {
  const teacherMap = {
    Languages: "Teacher A",
    Sciences: "Teacher C",
    Arts: "Teacher E",
    Sports: "Teacher F",
  };
  return teacherMap[subject];
}

// Generate initial timetable
function generateInitialTimetable() {
  const timetable = {};
  const times = [
    "8:00-9:00",
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "13:00-14:00",
    "14:00-15:00",
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  times.forEach((time) => {
    timetable[time] = {};
    days.forEach((day) => {
      timetable[time][day] = "";
    });
  });

  return timetable;
}

// GET route to render the timetable page
router.get("/", (req, res) => {
  res.render("index", {
    subjects: ["Languages", "Sciences", "Arts", "Sports"],
    teachers: {
      Languages: ["Teacher A", "Teacher B"],
      Sciences: ["Teacher C", "Teacher D"],
      Arts: ["Teacher E"],
      Sports: ["Teacher F"],
    },
    timetable: loadTimetable(),
  });
});

// POST route to save the timetable
router.post("/saveTimetable", (req, res) => {
  const timetable = req.body.timetable;
  if (timetable) {
    saveTimetable(timetable);
    res.redirect("/");
  } else {
    res.status(400).send("no timetable. Constraints violated.");
  }
});

module.exports = router;
