//setup
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressErrors = require('./utils/ExpressErrors');
const {campgroundSchema, reviewSchema} = require('./schema.js');
const Review = require('./models/reviews')

//database connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then( ()=> {console.log("MongoDB connected")})
.catch((err) => {console.log(err)});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection erro:"));
db.once('open', () => {
    console.log("database connected")
})

//define Joi schema
//Joi schema as validate middleware
//validate campground input
const validateCampground = (req, res, next) => {
    
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

//validate campground review
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(message, 400);
    } else {
        next();
    }
}

//express
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}))


app.get('/', (req, res) => {
    res.render('home');
})

//Read
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

//Create
app.get('/campgrounds/new', (req, res, next) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {

    //to check what is sent back
    // console.log(error);
    // create new data
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`); 
}))

//Read
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {campground});
}))

//Update
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

app.patch('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${updatedCamp._id}`);
}))

//Delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//post review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId }})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))


//error handling
app.all('*', (req, res, next) => {
    next(new ExpressErrors('Page Not Found', 404));
})


//define error handling middleware
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render('error',{err});
    //can define how to handle the handle logic
    // first test
    // res.send("Error occurs");
})

app.listen(3000, () => {
    console.log("port 3000 connected")
})

