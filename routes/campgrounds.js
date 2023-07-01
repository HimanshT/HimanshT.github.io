const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');//for async funtion
const Campground = require('../models/campground');
const Joi = require('joi');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
//controller routes
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage: storage });
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm) //this route should be above the route with id as it will be treated as a id if it is below the route with id

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


// By chaining these middleware functions together, 
// the request will only reach the campgrounds.deleteCampground handler if the user is logged in, 
// is authorized to delete the campground, and no errors occur during the deletion process. 


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;