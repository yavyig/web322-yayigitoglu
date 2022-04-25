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
const router = express.Router();
const userModel = require("../models/user");
const mealKitModel = require("../models/mealkit-db");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const path = require("path");
const dotenv=require('dotenv');
const { redirect } = require("express/lib/response");
const { stringify } = require("querystring");

dotenv.config({path:"./config/keys.env"});

router.post("/deleteDash", (req, res) => {
  const { _id, title } = req.body;
  mealKitModel
    .deleteOne({ _id: req.body._id })
    .exec()
    .then(() => {
      console.log(`Mealkit '${title}' is successfully deleted`);
      mealKitModel.populate();
      res.redirect("/user/clerkDash");
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
      mealKitModel.populate();
      res.redirect("/user/clerkDash");
    });
});

//////////////////// update quantity
router.get("/updateQuantity", (req, res) => {
  res.redirect("/user/userDash");
});

router.post("/updateQuantity", (req, res) => {
  let cart = req.session.cart;
  let cartTotalPrice = parseFloat(0);
  let updated = false;
  let isEmpty = true;
  const { title, quantity, id } = req.body;

  cart.forEach((element) => {
    if (element.id == req.body.id) {
      element.qty = parseInt(req.body.quantity);
      updated = true;
    }
  });

  cart.forEach((element) => {
    cartTotalPrice += parseFloat(
      (element.totalPrice = parseFloat(element.currentMeal.price * element.qty))
    );
    let makeItInt = parseInt(element.qty);
    if (makeItInt > 0) isEmpty = false;
  });
  cartTotalPrice = cartTotalPrice.toFixed(2);

  if (updated && !parseInt(req.body.quantity)) {
    console.log(`${req.body.title} has been removed from the cart!`);

    res.render("user/userDash", {
      title: "User Dash",
      cart,
      cartTotalPrice,
      isEmpty,
    });
  } else if (updated) {
    console.log(
      `${req.body.title}'s quantity has been updated to ${req.body.quantity}`
    );

    res.render("user/userDash", {
      title: "User Dash",
      cart,
      cartTotalPrice,
      isEmpty,
    });
  }
});

/////////////////////place order
router.get("/placeOrder", (req, res) => {
  res.redirect("/user/userDash");
});

router.post("/placeOrder", (req, res) => {
  let cartTotalPrice = parseFloat(0);

  const cart = req.session.cart;
  cart.forEach((element) => {
    cartTotalPrice += parseFloat(
      (element.totalPrice = parseFloat(element.currentMeal.price * element.qty))
    );
  });
  cartTotalPrice = cartTotalPrice.toFixed(2);

  const myMessage = req.body.myMessage;

  const msg = {
    to: req.session.user.email,
    from: process.env.FROM_EMAIL,
    subject: "Order Confirmation - Toothsome Express",
    html: `
Greetings, <b>${req.session.user.firstname} ${req.session.user.lastname}!</b> <br><br>
<u> Your order has been placed! Thanks for using Toothsome Express! </u><br><br>

Your order includes:<br>
${myMessage}<br>

Your order total is: <b>$${cartTotalPrice}</b><br><br>

My name is Yavuz Alper Yigitoglu, I am the designer of this website.<br>
<br>`,
  };

  //sendgrid
  sgMail
    .send(msg)
    .then(() => {
      let cart = req.session.cart;
      while (cart[0]) {
        cart.pop();
      }
      console.log("Order has been placed!");
      res.render("load-data/meal-kits", {
        title: "Success! Your order has been placed!",
        message:
          "Success! Your order has been placed! Please check your e-mail for the receipt.",
        success: 1,
      });
    })
    .catch((err) => {
      res.render("load-data/meal-kits", {
        title: "Error 0x0",
        message: `Something went wrong, the order could not be placed. Error: ${err}`,
        success: 0,
      });
    });

  //end sendgrid
});

router.post("/updateDash", (req, res) => {
  const {
    title,
    whatsIncluded,
    description,
    category,
    price,
    cookingTime,
    servings,
    caloriesPerServing,
    isTopMeal,
    // mealPic,
  } = req.body;
  if (req.body.isTopMeal !== "true") req.body.isTopMeal = false;

  mealKitModel
    .updateOne(
      { _id: req.body._id },
      {
        $set: {
          title: req.body.title,
          whatsIncluded: req.body.whatsIncluded,
          description: req.body.description,
          category: req.body.category,
          price: req.body.price,
          cookingTime: req.body.cookingTime,
          servings: req.body.servings,
          caloriesPerServing: req.body.caloriesPerServing,
          isTopMeal: req.body.isTopMeal,
          // mealPic: req.body.mealPic
        },
      }
    )
    .exec()
    .then(() => {
      console.log("Successfully updated the " + req.body.title);
      mealKitModel.populate();
      //
      let ext = path.parse(req.files.mealPic.name).ext;
      if (ext != ".jpg" && ext != ".png" && ext != ".jpeg" && ext != ".gif") {
        console.log(
          `Could not update the picture for '${req.body.title}', Please use one of the following extensions; (.jpg, .jpeg, .png, .gif)`
        );
        res.redirect("/user/clerkDash");
      } else {
        let uniqueName = `mealkit-pic-${req.body._id}${
          path.parse(req.files.mealPic.name).ext
        }`;
        req.files.mealPic
          .mv(`public/images/mealKitPics/` + uniqueName)
          .then((mealKitSaved) => {
            // console.log(uniqueName);
            mealKitModel
              .updateOne(
                { _id: req.body._id },
                { $set: { mealPic: "/images/mealKitPics/" + uniqueName } }
              )
              .then(() => {
                console.log(
                  "Mealkit document has been updated with the meal picture."
                );
                mealKitModel.populate();
              })
              .catch(() => console.log("Could not update the pic"));
            res.redirect("/user/clerkDash");
          });
      }
    })

    .catch((err) => {
      mealKitModel.populate();
      res.redirect("/user/clerkDash");
      //
    });
  //devamini getir

  // let success;
});

router.get("/clerkDash", (req, res) => {
  mealKitModel.populate();
  let mealKitData = mealKitModel.getMealsByCategory();
  if (!req.session.isClerk && !req.session.isCustomer)
    res.redirect("/user/login");
  else res.render("user/clerkDash", { title: "Clerk Dash", mealKitData });
});

router.post("/clerkDash", (req, res) => {
  const {
    title,
    whatsIncluded,
    description,
    category,
    price,
    cookingTime,
    servings,
    caloriesPerServing,
    isTopMeal,
    mealPic,
  } = req.body;

  if (req.body.isTopMeal !== "true") req.body.isTopMeal = false;

  const mealKit = new mealKitModel({
    title: req.body.title,
    whatsIncluded: req.body.whatsIncluded,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    cookingTime: req.body.cookingTime,
    servings: req.body.servings,
    caloriesPerServing: req.body.caloriesPerServing,
    isTopMeal: req.body.isTopMeal,
  });
  let success;
  let ext = path.parse(req.files.mealPic.name).ext;
  if (ext != ".jpg" && ext != ".png" && ext != ".jpeg" && ext != ".gif") {
    success = 0;
    validationMessage =
      "Please use one of the following extensions; (.jpg, .jpeg, .png, .gif)";
    res.render("user/clerkDash", {
      title: "Clerk Dash",
      values: req.body,
      validationMessage,
      success,
    });
  } else {
    mealKit
      .save()
      .then((mealKitSaved) => {
        success = 1;
        let uniqueName = `mealkit-pic-${mealKitSaved._id}${
          path.parse(req.files.mealPic.name).ext
        }`;
        req.files.mealPic
          .mv(`public/images/mealKitPics/` + uniqueName)
          .then(() => {
            mealKitModel
              .updateOne(
                { _id: mealKitSaved._id },
                { mealPic: "/images/mealKitPics/" + uniqueName }
              )
              .then(() => {
                console.log(
                  "Mealkit document has been updated with the meal picture."
                );
                mealKitModel.populate();
              })
              .catch((err) => {
                success = 0;
                console.log("Mealkit document CANNOT be updated! " + err);
                validationMessage = "Error1: " + err;
                res.render("user/clerkDash", {
                  title: "Clerk Dash",
                  values: req.body,
                  validationMessage,
                  success,
                });
              });
          })
          .catch((err) => {
            success = 0;
            console.log(err);
            validationMessage = "Error2: " + err;
            res.render("user/clerkDash", {
              title: "Clerk Dash",
              values: req.body,
              validationMessage,
              success,
            });
          });
        validationMessage =
          "Mealkit " + mealKitSaved.title + " has been added to the database.";
        console.log(
          `Mealkit ${mealKitSaved.title} has been added to the database.`
        );
        res.render("user/clerkDash", {
          title: "Clerk Dash",
          values: req.body,
          validationMessage,
          success,
        });
      })
      .catch((err) => {
        success = 0;
        console.log(err);
        validationMessage = "Error3: " + err;
        res.render("user/clerkDash", {
          title: "Clerk Dash",
          values: req.body,
          validationMessage,
          success,
        });
      });
  } //else
});

router.get("/userDash", (req, res) => {
  let cart = (req.session.cart = req.session.cart || []);
  let isEmpty = true;
  let cartTotalPrice = parseFloat(0);

  cart.forEach((element) => {
    cartTotalPrice += parseFloat(
      (element.totalPrice = parseFloat(element.currentMeal.price * element.qty))
    );
    let makeItInt = parseInt(element.qty);
    if (makeItInt > 0) isEmpty = false;
  });
  cartTotalPrice = cartTotalPrice.toFixed(2);

  if (!req.session.isClerk && !req.session.isCustomer)
    res.redirect("/user/login");
  else
    res.render("user/userDash", {
      title: "User Dash",
      cart,
      cartTotalPrice,
      isEmpty,
    });
});

router.get("/signup", (req, res) => {
  res.render("user/signup", { title: "Sign Up" });
});

router.post("/signup", (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  let passedValidation = true;
  let validationMessage = {};
  let digit = false,
    lowerCase = false,
    upperCase = false,
    symbol = false;

  if (typeof firstname != "string" || firstname.trim().length == 0) {
    passedValidation = false;
    validationMessage.firstname = "Please enter your first name.";
  }

  if (typeof lastname != "string" || lastname.trim().length == 0) {
    passedValidation = false;
    validationMessage.lastname = "Please enter your last name.";
  }

  // https://www.w3resource.com/javascript/form/email-validation.php
  if (
    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ||
    typeof email != "string" ||
    email.trim().length == 0
  ) {
    passedValidation = false;
    validationMessage.email = "Please enter a valid email address.";
  }

  for (let i = 0; i < password.length; i++) {
    if ("0123456789".search(password[i]) != -1) digit = true;
    if ("qwertyuiopasdfghjklzxcvbnm".search(password[i]) != -1)
      lowerCase = true;
    if ("QWERTYUIOPASDFGHJKLZXCVBNM".search(password[i]) != -1)
      upperCase = true;
    if ("!`@#$ %^&*()+=-[]\\';,./{}|\":<>? ~_".search(password[i]) != -1)
      symbol = true;
  }

  if (typeof password != "string" || password.trim().length < 8) {
    passedValidation = false;
    validationMessage.password = "Password must be at least 8 characters.";
  } else if (typeof password != "string" || password.trim().length > 12) {
    passedValidation = false;
    validationMessage.password = "Password cannot exceed 12 characters.";
  } else if (typeof password != "string" || !digit) {
    passedValidation = false;
    validationMessage.password = "Password must contain at least one digit.";
  } else if (!lowerCase) {
    passedValidation = false;
    validationMessage.password =
      "Password must contain at least one lower-case.";
  } else if (!upperCase) {
    passedValidation = false;
    validationMessage.password =
      "Password must contain at least one upper-case.";
  } else if (!symbol) {
    passedValidation = false;
    validationMessage.password = "Password must contain at least one symbol.";
  }

  if (passedValidation) {
    //
    const user = new userModel({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
    });
    user
      .save()
      .then((userSaved) => {
        console.log(
          `User ${userSaved.firstname} has been added to the database.`
        );

        //sendgrid
        let registration = true;
        if (passedValidation) {
          sgMail
            .send(msg)
            .then(() => {
              res.render("main/welcome", {
                registration,
                firstname,
                lastname,
                title: "Welcome " + firstname + " " + lastname,
              });
            })
            .catch((err) => {
              // console.log("Error: " + err);
              res.render("user/signup", {
                title: "Sign Up",
                values: req.body,
                validationMessage,
              });
            });
        }
        //end sendgrid

        res.render("main/welcome", {
          registration,
          firstname,
          lastname,
          title: "Welcome " + firstname + " " + lastname,
        });
      })
      .catch((err) => {
        passedValidation = false;
        console.log(`Error adding user to the database ${err}`);
        validationMessage.email =
          "Error! This email address is already in use.";
        res.render("user/signup", {
          title: "Sign Up",
          values: req.body,
          validationMessage,
        });
      });
    //

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "New Registration - Toothsome Express",
      html: `
   <u> Welcome to Toothsome Express! </u><br><br><br>
   Greetings, <b>${firstname} ${lastname}!</b> <br>
   My name is Yavuz Alper Yigitoglu, and I hope you will enjoy your stay!<br>
  `,
    };
  } else {
    res.render("user/signup", {
      title: "Sign Up",
      values: req.body,
      validationMessage,
    });
  }
});

// LOGIN V

router.get("/login", (req, res) => {
  res.render("user/login", { title: "Login" });
});

router.post("/login", (req, res) => {
  const { email, password, radio } = req.body;
  let passedValidation = true;
  let validationMessage = {};

  if (typeof email != "string" || email.trim().length == 0) {
    passedValidation = false;
    validationMessage.email = "Please enter an email address.";
  }
  if (typeof password != "string" || password.trim().length == 0) {
    passedValidation = false;
    validationMessage.password = "Please enter a password";
  }

  if (passedValidation) {
    //search mongo db database

    userModel
      .findOne({
        email: req.body.email,
      })
      .then((user) => {
        if (user) {
          //user is found
          bcrypt.compare(req.body.password, user.password).then((isMatched) => {
            //done comparing the password
            if (isMatched) {
              //passwords match
              req.session.user = user;
              req.session.isClerk = req.body.clerk === "clerk";
              req.session.isCustomer = req.body.clerk === "customer";
              if (req.session.isClerk) {
                res.redirect("/user/clerkDash");
              } else {
                res.redirect("/user/userDash");
              }
            } else {
              //passwords dont match
              console.log(
                "User with this email/password combination could not be found."
              );
              validationMessage.password = "Password is wrong!";
              res.render("user/login", {
                title: "Login",
                values: req.body,
                validationMessage,
              });
            }
          });
        } else {
          //user could not be found
          console.log("User with this email could not be found.");
          validationMessage.email = "User with this email could not be found.";
          res.render("user/login", {
            title: "Login",
            values: req.body,
            validationMessage,
          });
        }
      });
  } else {
    res.render("user/login", {
      title: "Login",
      values: req.body,
      validationMessage,
    });
  }
});

module.exports = router;
