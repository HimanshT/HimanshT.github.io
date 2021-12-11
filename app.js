const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//routers
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/check', async (req, res) => {
    const camp = new Campground({ title: 'My hoste' });
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log('serving on port 3000');
})