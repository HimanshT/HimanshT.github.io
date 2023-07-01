const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams is used to merge the params of campground and reviews
const catchAsync = require('../utils/catchAsync');//for async funtion
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');
//middleware of joi -->review
//this is done to prevent it's data extraction from postman
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))
//pull operator is to delete the review of that campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;