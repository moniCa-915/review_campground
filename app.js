//setup
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressErrors = require('./utils/ExpressErrors');
const session = require('express-session');
const flash = require('connect-flash')

//database connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then( ()=> {console.log("MongoDB connected")})
.catch((err) => {console.log(err)});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection erro:"));
db.once('open', () => {
    console.log("database connected")
})

//express
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'toSaveConfig',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // to prevent log in status last forever
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

//set up flash
app.use(flash())
app.use((req, res, next) => { // the middleware setup so I don't need to do: res.render('index', { messages: req.flash('info') });
    // access to the template without passing thru on every request
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

//set up routes
const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRouters')

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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

