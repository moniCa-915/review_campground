const mongoose = require('mongoose');
const { campgroundSchema } = require('../schema');
const Review = require('./reviews')
const Schema = mongoose.Schema;

const CampgorundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
})
CampgorundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgorundSchema);