const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
    trim: true
  },
  Department: {
    type: String,
    required: true
  },
  Year: { type: String, required: true },
  Semester: { type: String, required: true },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Credits: {
    type: String,
    required: true,
    trim: true
  },
  GenEds: {
    type: [String],
    required: true,
    trim: true
  },
  Grades: { Average: Number, Descripton: String }
});

const Course = (module.exports = mongoose.model("Course", CourseSchema));
