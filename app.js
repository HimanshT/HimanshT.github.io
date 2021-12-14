const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');

//routes
const campgrounds = require('./routes/campground');
const reviews = require('./routes/reviews');
// Mongoose Connection
mongoose.connect('mongodb://localhost:27017/yourTrip',
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
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));//for adding external js and css
const sessionConfig = {
    secret: 'himanshu',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //milleseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// using routes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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

app.listen(3000, () => {
    console.log('serving on port 3000');
})