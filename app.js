const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');

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

//middleware for joi -->campground
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
//middleware of joi -->review
//this is done to prevent it's data extraction from postman
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
//routers
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });//we find the 
    //campgrounds and then pass it through the ejs file to render them
}))

// for making a new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//for saving new values
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data');
    const campground = new Campground(req.body.campground);
    await campground.save()
    res.redirect(`campgrounds/${campground._id}`);
}))

//for individual campgrounds
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');//populate is used to show reviws on main page
    res.render('campgrounds/show', { campground });
}))
//editing a campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))
//put request to update the campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`${campground._id}`); // res.redirect('/campgrounds/${campground._id}) is not working;
}))
//to delete the campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))
//for submitting reviews of campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
//for deleting the reviews of campground
//pull operator is to delete the review of that campground
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))
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