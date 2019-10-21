const request = require("request");
const cheerio = require("cheerio");

class Scraper {
  constructor(request, cheerio) {
    this.SOC_URL = {
      CORE: "https://app.testudo.umd.edu/soc/",
      GEN: "https://app.testudo.umd.edu/soc/gen-ed/"
    };
    this.PLANET_TERP_URL = "https://planetterp.com/course/";
    this.request = request;
    this.cheerio = cheerio;
  }

  makeUrl(semester, year, genOrCore, deparetment) {
    if (
      !Number(year) ||
      semester === undefined ||
      this.SOC_URL[genOrCore] == undefined
    ) {
      return false;
    }
    return this.SOC_URL[genOrCore] + year + semester + "/" + deparetment;
  }

  getGenClassList($, semester, year, department) {
    const classList = [];
    $(".courses-container")
      .children()
      .each((index, element) => {
        const courseObj = this.getGenClassObj(
          $,
          element,
          semester,
          year,
          department
        );
        if (courseObj["Id"].length > 4) {
          classList.push(courseObj);
        }
      });

    return classList;
  }

  getGenClassObj($, course, semester, year, department) {
    const courseObj = {};
    courseObj["Id"] = $(course)
      .find(".course-id")
      .text();
    courseObj["Name"] = $(course)
      .find(".course-title")
      .text();
    courseObj["Credits"] = $(course)
      .find(".course-min-credits")
      .text();
    courseObj["GenEds"] = [];
    $(course)
      .find(".gen-ed-codes-group a")
      .each((index, element) => {
        courseObj["GenEds"].push($(element).text());
      });
    courseObj["Semester"] = semester;
    courseObj["Year"] = year;
    courseObj["Department"] = department;
    return courseObj;
  }
  getCoreClassList($) {
    return "Not implemented yet.";
  }
  addGradesToCourseObj(classObject, html) {
    const $ = this.cheerio.load(html);
    const grades = $("#course-grades")
      .find(".center-text")
      .text();
    const regex = /[+-]?\d+(\.\d+)?/g;
    const grade = parseFloat(grades.match(regex));
    classObject["Grades"] = { Average: grade, Description: grades };
    return classObject;
  }
  getPlanetTerpPromises(classList) {
    const promises = [];
    for (const course of classList) {
      const planetTerpUrl = scraper.PLANET_TERP_URL + course.Id;
      promises.push(
        new Promise((resolve, reject) => {
          this.request(planetTerpUrl, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
              reject(`Invalid status code: ${response.statusCode}`);
            }
            resolve(body);
          });
        })
      );
    }
    return promises;
  }
}

const scraper = new Scraper(request, cheerio);
module.exports = scraper;
