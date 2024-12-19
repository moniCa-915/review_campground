// MVC (Model-View-Controller) frameworks => put the (req, res) function in controller files for better organization and readability

const Campground = require('../models/campground');
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.campgroundForm = (req, res, next) => {
    res.render('campgrounds/new');
}

module.exports.postCampgrounds = async (req, res, next) => {
    //to check what is sent back
    // console.log(error);
    // create new data
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'successfully make a new campground')
    res.redirect(`campgrounds/${campground._id}`); 
}

module.exports.show = async (req, res) => {
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
}

module.exports.updateForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find the campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.update = async (req, res) => {
    const {id} = req.params;
    const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { runValidators: true, new: true });
    req.flash('success', 'successfully update a campground')
    res.redirect(`/campgrounds/${updatedCamp._id}`);
}

module.exports.delete = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted')
    res.redirect('/campgrounds');
}