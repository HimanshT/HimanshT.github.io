const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dk9ewlfhn',
    api_key: '248982496654456',
    api_secret: 'Ye6W3iohep2ThvzjQFuuuWQkUHE'
});

const storage = new CloudinaryStorage({
    cloudinary,
    folder: 'yourTrip',
    allowedFormats: ['jpg', 'jpeg', 'png']
})

module.exports = {
    cloudinary,
    storage
}

