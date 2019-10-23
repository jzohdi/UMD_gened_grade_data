window.classList = [];

const writeDataToPage = dataArray => {
  if (dataArray.length === 0) {
    $("error-message").html(
      "No course data available. Check that the year, semester, and department are correct."
    );
    return;
  }
  let htmlToInsert = `<p style='color:#bf0000; font-size:20px;'>Click on "Counts For" or "Grade"to sort list.</p>`;
  htmlToInsert += `<table class='table'>
                        <thead>
                            <tr><th scope='col'>ID</th>
                                <th scope='col'>Name</th>
                                <th id='counts-for' scope='col'>Counts For</th>
                                <th id='grade' scope='col'>Grade</th>
                                <th id='credits' scope='col'>Credits</th>
                            </tr>
                        </thead>
                        <tbody>`;
  for (const course of dataArray) {
    htmlToInsert += getHtmlForSingeCourse(course);
  }
  $("#courses-table").html(htmlToInsert + `</tbody></table>`);
  addControlsToTable();
};

const addControlsToTable = () => {
  $("#counts-for").on("click", function() {
    const sortedCoursesByGens = window.classList.sort(function(o1, o2) {
      return o2.GenEds.length - o1.GenEds.length;
    });
    writeDataToPage(sortedCoursesByGens);
  });

  $("#grade").on("click", function() {
    const sortedCoursesByGrade = window.classList.sort(function(o1, o2) {
      const gradeO1 = o1.Grades.Average !== undefined ? o1.Grades.Average : 0;
      const gradeO2 = o2.Grades.Average !== undefined ? o2.Grades.Average : 0;
      return gradeO2 - gradeO1;
    });
    writeDataToPage(sortedCoursesByGrade);
  });
};

const getHtmlForSingeCourse = courseObject => {
  const grade =
    courseObject.Grades.Average !== undefined
      ? courseObject.Grades.Average
      : "N/A";
  let htmlForCourse = `<tr><td>${courseObject.Id}</td><td>${courseObject.Name}</td><td>${courseObject.GenEds}</td><td>${grade}</td><td>${courseObject.Credits}</td>`;
  return htmlForCourse + "</tr>";
};

$("#search-courses").on("click", () => {
  $("#courses-table").empty();
  $("#search-courses").prop("disabled", true);
  $("#error-message").empty();
  const year = $("#year")
    .val()
    .trim();
  const semester = $("#semester")
    .val()
    .toLowerCase()
    .trim();
  const department = $("#department")
    .val()
    .toUpperCase()
    .trim();
  const possibleSemesters = new Set(["fall", "winter", "spring", "summer"]);
  if (
    year === "" ||
    semester === "" ||
    department === "" ||
    !Number(year) ||
    year.length < 4 ||
    !possibleSemesters.has(semester)
  ) {
    $("#error-message").html("Invalid search input.");
    return;
  }
  const URL = `https://umd-courses.herokuapp.com/api/classes/${semester}/${year}/GEN/${department}`;
  fetch(URL)
    .then(response => {
      return response.json();
    })
    .then(data => {
      $("#search-courses").prop("disabled", false);
      if (data.Status !== "Success") {
        $("#error-message").html("Something went wrong.");
      } else {
      }
      window.classList = data.ClassList;
      writeDataToPage(data.ClassList);
    })
    .catch(error => {
      console.log(error);
      $("#search-courses").prop("disabled", false);
      $("#error-message").html("Something went wrong. Please try once more.");
    });
});
