if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express(); //creating an instance of express
const path = require('path');//for joining the path
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');//for using put and delete
const ExpressError = require('./utils/ExpressError');//for showing error
const Joi = require('joi'); //for validating
const session = require('express-session'); //for session
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
//routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize'); //`express-mongo-sanitize` will strip out any keys in objects that begin with '$' or contain a '.'.
const helmet = require('helmet'); //`helmet` will set a variety of headers to help secure your app
const MongoStore = require('connect-mongo'); //`connect-mongo` is a middleware which allows us to store our session data in MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yourTrip';
// Mongoose Connection
mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, ("connection error")));
db.once("open", () => {
    console.log("database connected");
});

//views connection
app.engine('ejs', ejsMate) //we are telling express to use ejsMate
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//to parse the body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));//for using put and delete
app.use(express.static(path.join(__dirname, 'public')));//for adding external js and css
app.use(mongoSanitize());
app.use(helmet({
    contentSecurityPolicy: false,
}));

const secret = process.env.SECRET;

const store = new MongoStore({   //```MongoStore``` is used to store the session cookie in the database instead of storing it on the server.
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("mongostore error");
})

const sessionConfig = { //
    store,
    name: 'good',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //milleseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser()); //for storing user in session
passport.deserializeUser(User.deserializeUser());// for un storing user in session

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// using routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


//routers
app.get('/', (req, res) => {
    res.render('home');
})

// for showing 404
// if i am passing to next it will pass to below function
app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404));
})

//error handling
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log('Server connected');
})
