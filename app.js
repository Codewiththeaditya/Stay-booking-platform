const express = require('express');
const MongoStore = require("connect-mongo").default;
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
require("dotenv").config();

const store =  MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",(err)=>{
    console.log("ERROR IN MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly: true,
    }
}



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
.then(()=>{
    console.log("connect to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(process.env.MONGO_URL);
    
}

app.use(express.static(path.join(__dirname,'public')))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);





app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings", listingRouter);
app.use("/", userRouter);

// app.get('/', (req,res)=>{
//     res.send("this is root !");
// });





//Custom error handeler :

app.all(/.*/, (req,res,next)=>{
    next(new ExpressError(404,"Page Not Found !"))

})

app.use((err,req,res,next) => {
    let {status=400,message} = err;
    res.render("error.ejs", {message})
    //res.status(status).send(message);
})

app.listen(8080, ()=>{
    console.log("server is listening at port 8080 !");
});