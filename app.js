//setup
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressErrors = require('./utils/ExpressErrors');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

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

//set up authentication
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate())); //local strategy: store username and password
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //how to get data or store a user in the session
passport.deserializeUser(User.deserializeUser()); //get user out of session

//set up flash
app.use(flash())
app.use((req, res, next) => { // the middleware setup so I don't need to do: res.render('index', { messages: req.flash('info') });
    // access to the template without passing thru on every request
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; // set up glocal things to all the templates, to have current user 
    next();
})

app.get('/fakeuser', async(req, res) => {
    const user = new User({email: "test@gmail.com", username: 'test'});
    const newUser = await User.register(user, 'test_password');
    res.send(newUser);
})

//set up routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRouters')


app.get('/', (req, res) => {
    res.render('home');
})

app.use('/', userRoutes);
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

