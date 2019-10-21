var express = require("express");
var router = express.Router();
var scraper = require("../services/classesScraper");
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://${process.env.MONOG_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@cluster0-advdq.mongodb.net/test?retryWrites=true&w=majority`,
  { useNewUrlParser: true }
);
let db = mongoose.connection;

db.once("open", function() {
  console.log("connected to mongodb...");
});

db.on("error", function(err) {
  console.log(err);
});

const Course = require("../Models/course");

const runScraper = (
  url,
  scraper,
  semester,
  year,
  department,
  genOrCore,
  response
) => {
  scraper.request(url, (error, res, html) => {
    if (!error && res.statusCode == 200) {
      const $ = scraper.cheerio.load(html);
      if (genOrCore === "GEN") {
        classList = scraper.getGenClassList($, semester, year, department);
        const promises = scraper.getPlanetTerpPromises(classList);
        Promise.all(promises)
          .then(data => {
            for (let index = 0; index < data.length; index++) {
              const html = data[index];
              classList[index] = scraper.addGradesToCourseObj(
                classList[index],
                html
              );
            }
            Course.collection.insertMany(classList, function(err, docs) {
              if (err) {
                console.log("Error inserting into db");
              } else {
                console.log("Courses insterted into collection");
              }
            });
            response.json({ Status: "Success", ClassList: classList });
            response.end();
            return;
          })
          .catch(error => {
            console.log("error in gen planet terp promise.");
            console.log(error);
          });
      } else if (genOrCore == "CORE") {
        classList = scraper.getCoreClassList($);
        response.json({ Status: "Success", ClassList: classList });
        response.end();
        return;
      }
      return;
    }
  });
};

/* GET home page. */
router.get("/:semester/:year/:genOrCore/:department", function(
  request,
  response
) {
  const semesters = { fall: "08", spring: "01", winter: "12", summer: "05" };
  const semester = request.params.semester;
  const year = request.params.year;
  const department = request.params.department;
  const genOrCore = request.params.genOrCore;
  const url = scraper.makeUrl(semesters[semester], year, genOrCore, department);
  if (!url) {
    response.json({
      Status: "Failed",
      Error: "One of the parameters passed was invalid",
      semester: semester,
      year: year,
      type: genOrCore,
      department: department
    });
    response.end();
    return;
  }
  let classList = [];
  Course.find(
    { Year: year, Semester: semester, Department: department },
    { _id: 0 },
    function(err, courses) {
      if (err) {
        console.log(err);
        return;
      }
      if (courses.length > 0) {
        response.json({ Status: "Success", ClassList: courses });
        response.end();
        return;
      }
      runScraper(url, scraper, semester, year, department, genOrCore, response);
      return;
    }
  );
});

["/", "/:s", "/:s/:y", "/:s/:y/:gc"].forEach(function(path) {
  router.get(path, function(request, response) {
    response.json({
      Status: "Failed",
      Error:
        "Missing url parameters. Usage: /api/classes/{semester}/{year}/{department}"
    });
  });
});

module.exports = router;
