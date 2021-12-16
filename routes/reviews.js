const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');//for async funtion
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn } = require('../middleware');
//middleware of joi -->review
//this is done to prevent it's data extraction from postman

//for submitting reviews of campground
router.post('/', validateReview, isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review');
    res.redirect(`/campgrounds/${campground._id}`);
}))
//for deleting the reviews of campground
//pull operator is to delete the review of that campground
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', ' Review Deleted')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;