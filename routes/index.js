const express = require("express");
const router = express.Router();
const fs = require("node:fs");
const path = require("node:path");

// Path to save the JSON file
const dataPath = path.join(__dirname, "../data/teachers.json");

const timetablePath = path.join(__dirname, "../data/timetable.json");
const timetable = timetablePath;

// Ensure the data directory exists
if (!fs.existsSync(path.join(__dirname, "../data"))) {
  fs.mkdirSync(path.join(__dirname, "../data"));
}

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

//saving the timetable created
router.post("/saveTimetable", (req, res) => {
  const timetable = res.body.timetable;
  if (timetable) {
    saveTimetable(timetable);
    res.redirect("/timetable");
  } else {
    res.redirect("/");
  }
});

router.get("/timetable", (req, res) => {
  res.render("timetable", { timetable, teachers });
});

function validTimetable(timetable) {
  // initialize the hours of all the subjects to be 0 hrs
  const subjectHours = { Languages: 0, Sciences: 0, Arts: 0, Sports: 0 };
  const teacherBookings = {};

  for (const time in timetable) {
    for (const day in timetable[time]) {
      const subject = timetable[time][day];
      if (subject) {
        subjectHours[subject] += 1;

        // Check teacher double-booking
        const teacher = getTeacherForSubject(subject);
        if (!teacherBookings[teacher]) {
          teacherBookings[teacher] = [];
        }
        if (teacherBookings[teacher].includes(time)) {
          return false; // Teacher double-booked
        }
        teacherBookings[teacher].push(time);
      }
    }
  }

  // returning the hours that are to be done by the subjects individually
  return (
    subjectHours.Languages === 10 &&
    subjectHours.Sciences === 10 &&
    subjectHours.Arts === 5 &&
    subjectHours.Sports === 5
  );
}

function getTeacherForSubject(subject) {
  // Assuming a mapping of subject to teacher
  const teacherMap = {
    Languages: "Teacher A",
    Sciences: "Teacher C",
    Arts: "Teacher E",
    Sports: "Teacher F",
  };
  return teacherMap[subject];
}

//function for passing the timetable created to be saved in a csv formart
function saveTimetable(timetable) {
  fs.writeFile(timetablePath, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      return res.status(500).send("An error occurred while saving the data.");
    }
    res.redirect("/");
  });
}

function initialTimetable() {
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
      timetable[time][day] = ""; // Empty initially
    });
  });

  return timetable;
}

function loadTimetable() {
  if (fs.existsSync("timetable.json")) {
    return JSON.parse(fs.readFileSync("timetable.json"));
  }
  return initialTimetable();
}

module.exports = router;
