/************************************************************************************
 * WEB322 â€“ Project (Winter 2022)
 * I declare that this assignment is my own work in accordance with Seneca Academic
 * Policy. No part of this assignment has been copied manually or electronically from
 * any other source (including web sites) or distributed to other students.
 *
 * Name: Yavuz Alper Yigitoglu
 * Student ID: 127785186
 * Course/Section: WEB322/NDD
 *
 ************************************************************************************/

const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: String,
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", function (next) {
  let user = this;

  bcrypt
    .genSalt(10)
    .then((salt) => {
      //hash the password using generated salt.
      bcrypt
        .hash(user.password, salt)
        .then((hashedPwd) => {
          //pw has been hashed
          user.password = hashedPwd;

          next();
        })
        .catch((err) => {
          console.log(`Error occurred when hashing ... ${err}`);
        });
    })
    .catch((err) => {
      console.log(`Error occurred when hashing ... ${err}`);
    });
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
