const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport")
const {saveRedirect} = require("../middleware.js");
const userController = require('../controllers/user');
const user = require("../models/user.js");



//signup: 

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(saveRedirect,wrapAsync(userController.signup))






router
    .route("/login")
    .get(userController.renderLoginForm)
    .post( saveRedirect, passport.authenticate("local",{failureRedirect: '/login', failureFlash: true}) ,userController.login)



router.get('/logout', userController.logout)

module.exports = router; 