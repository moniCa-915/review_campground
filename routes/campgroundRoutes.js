const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressErrors = require('../utils/ExpressErrors');
const Campground = require('../models/campground');
const {isLoggedin, isAuthor, validateCampground} = require('../middleware')

//Read
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

//Create
router.get('/new', isLoggedin, (req, res, next) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedin, validateCampground, catchAsync(async (req, res, next) => {
    //to check what is sent back
    // console.log(error);
    // create new data
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'successfully make a new campground')
    res.redirect(`campgrounds/${campground._id}`); 
}))

//Read
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find the campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}))

//Update
router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find the campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}))

router.patch('/:id', isLoggedin, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { runValidators: true, new: true });
    req.flash('success', 'successfully update a campground')
    res.redirect(`/campgrounds/${updatedCamp._id}`);
}))

//Delete
router.delete('/:id', isLoggedin, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted')
    res.redirect('/campgrounds');
}))

module.exports = router;