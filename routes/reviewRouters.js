const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressErrors = require('../utils/ExpressErrors');
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const {isLoggedin, validateReview, isReviewAuthor} = require('../middleware')

//post review
router.post('/', isLoggedin, validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash('success', 'Create a new review')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete review
router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId }})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;