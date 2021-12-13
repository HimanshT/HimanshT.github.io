const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

// Mongoose Connection
mongoose.connect('mongodb://localhost:27017/yourTrip',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, ("connection error")));
db.once("open", () => {
    console.log("database connected");
});

//views connection
app.engine('ejs', ejsMate) //we are telling express to use ejsMate
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//to parse the body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//routers
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });//we find the 
    //campgrounds and then pass it through the ejs file to render them
})

// for making a new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//for saving new values
app.post('/campgrounds', async (req, res, next) => {
    try {
        const campground = new Campground(req.body.campground);
        await campground.save()
        res.redirect(`campgrounds/${campground._id}`);
    } catch (e) {
        next(e);
    }
})

//for individual campgrounds
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})
//editing a campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})
//put request to update the campground
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`${campground._id}`); // res.redirect('/campgrounds/${campground._id}) is not working;
})
//to delete the campground
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})
//error handling
app.use((err, req, res, next) => {
    res.send("You made a mistake");
})
app.listen(3000, () => {
    console.log('serving on port 3000');
})