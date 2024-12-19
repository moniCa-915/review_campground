const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressErrors = require('../utils/ExpressErrors');
const reviews = require('../controller/reviews')
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const {isLoggedin, validateReview, isReviewAuthor} = require('../middleware')

//post review
router.post('/', isLoggedin, validateReview, catchAsync(reviews.post))

//delete review
router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync(reviews.delete))

module.exports = router;