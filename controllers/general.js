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
const { redirect } = require("express/lib/response");
const router = express.Router();
const mealkit = require("../models/mealkit-db");
const { type } = require("express/lib/response");
const mongoose = require("mongoose");

router.get("/", (req, res) => {
  mealkit.populate();
  let topMeals = mealkit.getTopMeals();
  let getCategory = mealkit.getMealsByCategory();
  res.render("main/home", {
    getCategory,
    topMeals,
    title: "Home Page",
  });
});

router.get("/onthemenu", (req, res) => {
  mealkit.populate();
  let topMeals = mealkit.getTopMeals();
  let getCategory = mealkit.getMealsByCategory();
  res.render("main/onthemenu", {
    getCategory,
    topMeals,
    title: "On the Menu",
  });
});

router.get("/welcome", (req, res) => {
  let firstname = "",
    lastname = "";
  let registration = false;
  res.render("main/welcome", {
    registration,
    firstname,
    lastname,
    title: "Welcome " + firstname + " " + lastname,
  });
});

router.get("/contentTable", (req, res) => {
  res.render("contentTable", { title: "ContentTable" });
});

router.get("/home", (req, res) => {
  res.render("main/home", { title: "Home" });
});

/////////////////////// add cart
router.get("/addCart/:id", (req, res) => {
  let id = req.params.id;
  let getMealbyID = mealkit.getMealsByID(id);
  let currentMeal = getMealbyID[0];
  let cart = (req.session.cart = req.session.cart || []);

  if (req.session.isCustomer) {
    let found = false;
    cart.forEach((element) => {
      if (req.params.id == element.id) {
        //mealkit already is in the cart
        element.qty++;
        element.totalPrice += parseFloat(currentMeal.price).toFixed(2);
        console.log(
          `${getMealbyID[0].title} Quantity Incremented!, Total Price updated!`
        );
        found = true;
        res.render("load-data/meal-kits", {
          title: "Item Updated",
          message: `${getMealbyID[0].title} Quantity Incremented!, Total Price updated!`,
          success: 1,
        });
      }
    });
    if (!found) {
      //mealkit is not in the cart
      cart.push({
        totalPrice: parseFloat(currentMeal.price).toFixed(2),
        qty: 1,
        id: req.params.id,
        currentMeal,
      });
      console.log(
        `${getMealbyID[0].title} has been added to the shopping cart!`
      );
      res.render("load-data/meal-kits", {
        title: "Item added",
        message: `${getMealbyID[0].title} has been added to the shopping cart!. You can see the shopping cart in the dashboard.`,
        success: 1,
      });
    }
  } else {
    //it's not customer, don't add to the cart
    console.log(
      "You are not authorized to add items to the shopping cart. Reason: You are not logged in as customer"
    );
    res.render("load-data/meal-kits", {
      title: "Error 401 Not Authorized",
      message:
        "You are not authorized to add items to the shopping cart. Reason: You are not logged in as customer",
      success: 0,
    });
  }
});

router.get("/mealKitDesc/:id", (req, res) => {
  let id = req.params.id;
  let getMealbyID = mealkit.getMealsByID(id);

  // if (req.session.isClerk) {
  //   console.log(
  //     "You are not authorized to see this page. Reason: You are logged in as clerk"
  //   );
  //   res.render("load-data/meal-kits", {
  //     title: "Load Mealkit Data",
  //     message:
  //       "You are not authorized to see this page. Reason: You are logged in as clerk",
  //     success: 0,
  //   });
  // } else {
  //if (req.session.isCustomer) {
  res.render("user/mealKitDesc", {
    getMealbyID,
    title: "Mealkit Description",
  });
  // }
});

router.get("/logoff", (req, res) => {
  req.session.destroy();
  res.redirect("/user/login");
});

router.get("/clerkDash", (req, res) => {
  if (req.session.isClerk) {
    res.render("main/clerkDash", { title: "Clerk Dashboard" });
  } else if (req.session.isCustomer) {
    res.render("main/userDash", { title: "User Dashboard" });
  } else {
    res.redirect("/user/login");
  }
});

router.get("/userDash", (req, res) => {
  if (req.session.isCustomer)
    res.render("main/userDash", { title: "User Dashboard" });
  else if (req.session.isClerk)
    res.render("main/clerkDash", { title: "Clerk Dashboard" });
  else res.redirect("/user/login");
});

//\\\\\\\\\\\\\\\\\\  <- BELOW IS NOT SET YET -> ////////////////\\

router.get("/headers", (req, res) => {
  const headers = req.headers;
  res.json(headers);
});

router.get("/pricing", (req, res) => {
  const pricing = req.pricing;
  res.send("Our Pricing Policy");
});

router.get("/joinus", (req, res) => {
  const joinus = req.joinus;
  res.send("Join Us!");
});

router.get("/faq", (req, res) => {
  const faq = req.faq;
  res.send("faq");
});

router.get("/ingredients", (req, res) => {
  const ingredients = req.ingredients;
  res.send("ingredients");
});

router.get("/giftcards", (req, res) => {
  const giftcards = req.giftcards;
  res.send("gift cards");
});

router.get("/commitment", (req, res) => {
  const commitment = req.commitment;
  res.send("commitment");
});

module.exports = router;
