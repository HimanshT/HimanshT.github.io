const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');//for async funtion
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const Joi = require('joi');
const { isLoggedIn } = require('../middleware');

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

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });//we find the 
    //campgrounds and then pass it through the ejs file to render them
}))


// for making a new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//for saving new values
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data');
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//for individual campgrounds
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');//populate is used to show reviws on main page
    if (!campground) {
        req.flash('error', 'Sorry,campground not available');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))
//editing a campground
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))
//put request to update the campground
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', "Successfully Updated");
    res.redirect(`/campgrounds/${campground._id}`); // res.redirect('/campgrounds/${campground._id}) is not working;
}))
//to delete the campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', ' Campground Deleted')
    res.redirect('/campgrounds');
}))

module.exports = router;