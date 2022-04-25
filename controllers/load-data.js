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

const express = require("express");
const router2 = express.Router();
const userModel = require("../models/user");
const mealKitModel = require("../models/mealkit-db");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const path = require("path");

router2.get("/meal-kits", (req, res) => {
  const initialMealKits = [
    {
      //mealkits[0]
      title: "Iskender Kebap",
      whatsIncluded: "Tomato, Hot Pepper, and Yogurt",
      description: "Iskender kebap is a Turkish dish that consists of sliced döner kebab meat topped with hot tomato sauce over pieces of pita bread (sometimes croutons) and generously slathered with melted special sheep's milk butter and yogurt. It can be prepared from thinly and carefully cut grilled lamb or chicken. Tomato sauce and melted butter are generally poured over the dish live at the table, for the customer's amusement. ",
      category: "Kebap",
      price: "25",
      cookingTime: "5",
      servings: "1",
      caloriesPerServing: "900",
      mealPic: "/images/mealKitPics/iskender_mealOne.jpg",
      isTopMeal: true,
    },
    {
      //mealkits[1]
      title: "Beyti Kebap",
      whatsIncluded: "Hot Pepper, Tomato, Rice, and Lettuce",
      description: "Beyti is a Turkish dish consisting of ground beef or lamb, grilled on a skewer and served wrapped in lavash and topped with tomato sauce and yogurt. ",
      category: "Kebap",
      price: "19",
      cookingTime: "7",
      servings: "2",
      caloriesPerServing: "1200",
      mealPic: "/images/mealKitPics/beyti_mealTwo.jpg",
      isTopMeal: true,
    },
    {
      //mealkits[2]
      title: "Lahmacun",
      whatsIncluded: "Onion, Lemon, and Parsley",
      description: "Lahmacun is a round, thin piece of dough topped with minced meat (beef), minced vegetables, and herbs including onions, garlic, tomatoes, red peppers, and parsley, flavored with spices such as chili pepper and paprika, then baked. Lahmacun is often wrapped around vegetables, including pickles, tomatoes, peppers, onions, lettuce, parsley, and roasted eggplant.",
      category: "Pide",
      price: "15",
      cookingTime: "15",
      servings: "1",
      caloriesPerServing: "650",
      mealPic: "/images/mealKitPics/lahmacun_mealThree.jpg",
      isTopMeal: true,
    },

    {
      //mealkits[3]
      title: "Ciger Sis",
      whatsIncluded: "Special Spices, and Flat Bread",
      description: "Ciğer kebabı (English: liver kebab) is a common type of skewered meat served in Anatolian cuisine, usually eaten with sliced onions, salad and bread.",
      category: "Kebap",
      price: "10",
      cookingTime: "7",
      servings: "2",
      caloriesPerServing: "450",
      mealPic: "/images/mealKitPics/cigersis.jpg",
      isTopMeal: false,
    },
    {
      //mealkits[4]
      title: "Adana Kebap",
      whatsIncluded: "Tomato, Hot Pepper, Parsley, and Flat Bread",
      description: "Adana kebabı is a Turkish dish that consists of long, hand-minced meat kebab mounted on a wide iron skewer and grilled on an open mangal filled with burning charcoal.",
      category: "Kebap",
      price: "18",
      cookingTime: "12",
      servings: "1",
      caloriesPerServing: "1050",
      mealPic: "/images/mealKitPics/adanakebap.jpg",
      isTopMeal: false,
    },
    {
      //mealkits[5]
      title: "Kusbasi Pide",
      whatsIncluded: "Lemon, and Parsley",
      description: "Kusbasi Pide is a savory dish consisting of a usually round, flattened base of leavened wheat-based dough topped with chopped meat, tomatoes, cheese, and often various other ingredients (such as, kaşar, beyaz peynir etc.), which is then baked at a high temperature, in a wood-fired oven.",
      category: "Pide",
      price: "17",
      cookingTime: "18",
      servings: "1",
      caloriesPerServing: "950",
      mealPic: "/images/mealKitPics/kusbasipide.jpg",
      isTopMeal: false,
    },
  ];
  mealKitModel
    .findOne({ title: initialMealKits[0].title })
    .then((mealKitSaved) => {
      if (req.session.isClerk) {
        //if clerk
        if (mealKitSaved === null) {
          //if not found
          const mealKit = mealKitModel
            .insertMany(initialMealKits)
            .then((mealKitSaved) => {
              let success = 1;
              console.log("Added mealkits to the database.");
              let message = "Added mealkits to the database.";

              mealKitModel.populate();

              res.render("load-data/meal-kits", {
                title: "Load Mealkit Data",
                message,
                success,
              });
            })
            .catch((err) => {
              console.log(err);
              let success = 0;
              let message = "Something went wrong";
              res.render("load-data/meal-kits", {
                title: "Load Mealkit Data",
                message,
                success,
              });
            });
        } else {
          //if found
          let success = 0;
          let maybeSuccess = 1;
          console.log("Mealkits have already been added to the database");
          let message = "Mealkits have already been added to the database";
          res.render("load-data/meal-kits", {
            title: "Load Mealkit Data",
            message,
            success,
            maybeSuccess,
          });
        }
      } //if clerk
      else {
        //if not clerk
        let success = 0;
        console.log("You are not authorized to add to the database");
        let message = "You are not authorized to add to the database";
        res.render("load-data/meal-kits", {
          title: "Load Mealkit Data",
          message,
          success,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});

module.exports = router2;
