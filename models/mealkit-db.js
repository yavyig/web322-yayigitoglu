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

var mealkits = [];

const mealKitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  whatsIncluded: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  cookingTime: {
    type: String,
    required: true,
  },
  servings: {
    type: String,
    required: true,
  },
  caloriesPerServing: {
    type: String,
    required: true,
  },
  isTopMeal: {
    type: Boolean,
    required: true,
  },
  mealPic: {
    type: String,
    require: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

const mealKitModel = mongoose.model("meal-kits", mealKitSchema);

mealKitModel
  .find({})
  .exec()
  .then((allMeals) => {
    mealkits = allMeals.map((value) => value.toObject());
  });

module.exports = mealKitModel;

module.exports.populate = function () {
  mealKitModel
    .find({})
    .exec()
    .then((allMeals) => {
      mealkits = allMeals.map((value) => value.toObject());
    });
};

module.exports.getTopMeals = function () {
  let arr = [];
  for (let i = 0; i < mealkits.length; i++)
    if (mealkits[i].isTopMeal) arr.push(mealkits[i]);
  return arr;
};

module.exports.getMealsByCategory = function () {
  let arr = [];
  for (let i = 0; i < mealkits.length; i++) {
    const currentMealKit = mealkits[i];
    const categoryName = currentMealKit.category;

    let category = arr.find((c) => c.category == categoryName);
    if (!category) {
      category = {
        category: categoryName,
        items: [],
      };
      arr.push(category);
    }
    category.items.push(currentMealKit);
  }
  return arr;
};

module.exports.getMealsByID = function (paramID) {
  let arr = [];
  for (let i = 0; i < mealkits.length; i++) {
    const currentMealKit = mealkits[i];
    const mealkitID = currentMealKit._id;

    if (mealkitID == paramID) arr.push(currentMealKit);
  }
  return arr;
};
