const Campground = require('../models/campground');
const Review = require('../models/reviews');

module.exports.post = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash('success', 'Create a new review')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.delete = async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId }})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted')
    res.redirect(`/campgrounds/${id}`)
}