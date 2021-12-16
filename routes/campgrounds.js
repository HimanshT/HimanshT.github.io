const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');//for async funtion
const Campground = require('../models/campground');
const Joi = require('joi');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

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
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//for individual campgrounds
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');//populate is used to show reviws on main page
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Sorry,campground not available');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))
//editing a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'sorry! couldnt find it');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
//put request to update the campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', "Successfully Updated");
    res.redirect(`/campgrounds/${campground._id}`); // res.redirect('/campgrounds/${campground._id}) is not working;
}))
//to delete the campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', ' Campground Deleted')
    res.redirect('/campgrounds');
}))

module.exports = router;