const multer = require('multer')
const filter = require('./filter')
const crypto = require("crypto");

const exts = [
    'png',
    'jpg',
    'gif',
    'jpeg',
    'bmp',
    'tif'
]

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "static\\images");
    },
    filename: (req, file, cb) => {
        cb(null, crypto.randomBytes(8).toString('hex') + "." + file.originalname.split('.').pop());
    },
});


const upload = multer(
    {
        fileFilter: filter(exts),
        storage: storageConfig,
        limits: {
            fileSize: 10000000
        }
    })

module.exports = upload