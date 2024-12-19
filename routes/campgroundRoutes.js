const express = require('express');
const router = express.Router();
const campgrounds = require('../controller/campgrounds')
const catchAsync = require('../utils/catchAsync');
const ExpressErrors = require('../utils/ExpressErrors');
const Campground = require('../models/campground');
const {isLoggedin, isAuthor, validateCampground} = require('../middleware')

// MVC (Model-View-Controller) frameworks => put the (req, res) function in controller files for better organization and readability

//Read
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedin, validateCampground, catchAsync(campgrounds.postCampgrounds))

//Create
router.get('/new', isLoggedin, campgrounds.campgroundForm)


router.route('/:id')
    .get(catchAsync(campgrounds.show)) //Read
    .patch(isLoggedin, isAuthor, validateCampground, catchAsync(campgrounds.update)) //update
    .delete(isLoggedin, isAuthor, catchAsync(campgrounds.delete)) //Delete

//Update form
router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(campgrounds.updateForm))


module.exports = router;