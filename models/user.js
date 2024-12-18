const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    }
})

userSchema.plugin(passportLocalMongoose); //set up username and password so don't need to add in schema at first

module.exports = mongoose.model('User', userSchema);