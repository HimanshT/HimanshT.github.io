//Since this file seeds the data into database therefore we need complete mongoose connection
//so we are using same code as app for mongoose connection
const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

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

//function to return random element from an array
const sample = array => array[Math.floor(Math.random() * array.length)];

//trying to delete the rest and then add new data

const seedDb = async () => {
    await Campground.deleteMany({});//every schema fn has curly brackets inside
    for (let i = 0; i < 200; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: "61bae5ee900091534a600ed9",
            location: `${cities[random].city},${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description: 'it is a good place',
            geometry: {
                type: 'Point',
                coordinates: [cities[random].longitude, cities[random].latitude]
            },
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dk9ewlfhn/image/upload/v1640789579/yourTrip/nnhfmlaqrcopzax6z0yt.jpg',
                    filename: 'yourTrip/nnhfmlaqrcopzax6z0yt',
                },
                {
                    url: 'https://res.cloudinary.com/dk9ewlfhn/image/upload/v1640781088/yourTrip/lzku2ekoj13nsnyxi1py.jpg',
                    filename: 'yourTrip/lzku2ekoj13nsnyxi1py',
                }
            ]
        })
        await camp.save();
    }
}

//this function adds new data
seedDb().then(() => {
    mongoose.connection.close();
});



// Through this file we populate our database by seperately running the file
//through index
//everytime you want new data you can click here;