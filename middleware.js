const {campgroundSchema, reviewSchema} = require('./schema.js');
const Campground = require('./models/campground');
const Review = require('./models/reviews');

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl)
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must log in first')
        return res.redirect('/login')
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//define Joi schema
//Joi schema as validate middleware
//validate campground input
module.exports.validateCampground = (req, res, next) => {
    
    //if use postman or Hoppscotch to post data (since post nothing is prohibitted thru control by Bootrap)
    // if (!req.body.campground) {throw new ExpressErrors('Invalid campground input', 400)};
    //use Joi validation tool to validate before mongo and monggose to handle errors
    //validate on server side (client side validation: new.ejs file)
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(message, 400);
    } else {
        next();
    }
}

//validate if authorized to make change
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', "You are not authorized!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();    
}

//validate campground review
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(message, 400);
    } else {
        next();
    }
}

//validate if authorized to make change
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You are not authorized!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();    
}