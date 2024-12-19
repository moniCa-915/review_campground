//to make the seeds self-contained, include the following
// separate from app when seeding database

//setup
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {descriptors, places} = require('./seedHelpers');
const cities = require('./cities');

//database connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then( ()=> {console.log("MongoDB connected")})
.catch((err) => {console.log(err)});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection erro:"));
db.once('open', () => {
    console.log("database connected")
})

//generate seed campground data

const titleSample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    //create 50 campground with title and location
    for (let i = 0; i < 50; i ++) {
        const random1000 = Math.floor(Math.random() * 1000); // randomly select a city
        const price = Math.floor(Math.random() * 30) + 10;
        const newCamp = new Campground({
            title: `${titleSample(descriptors)} ${titleSample(places)}`,
            price,
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            author: '67630db0e33064693cfe2362',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, rerum voluptate explicabo in ipsam doloribus quibusdam deserunt est itaque odit cumque nobis fugit magni perferendis molestias, iste amet mollitia quod.',
            })
        await newCamp.save(); 
    }
}

seedDB().then(() => {
    mongoose.connection.close(); //close after generate seed data
}) //return a Promise because it's an async function

