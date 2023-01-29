const {Router} = require('express')
const documentUploader = require("../uploader/multer_documents");
const imagesUploader = require("../uploader/multer_images");
const File = require("../db/File");
const Img = require("../db/Img");
const Avatar = require("../db/Avatar");
const router = Router()
const sharp = require('sharp')

router.post('/document', documentUploader.single('file'), (req, res, next) => {
    File.create({file: req.file.filename, name: req.file.originalname, size: req.file.size})
        .then((fb) => {
            res.status(201).json({id: fb._id, url: `${process.env.BASE_PATH}/static/documents/${fb.file}`})
        })
        .catch(err => next(err))
})

router.post('/image', imagesUploader.single('image'), (req, res, next) => {
    Img.create({file: req.file.filename, name: req.file.originalname, size: req.file.size})
        .then((fb) => {
            res.status(201).json({id: fb._id, url: `${process.env.BASE_PATH}/static/images/${fb.file}`})
        })
        .catch(err => next(err))
})

router.post('/avatar', imagesUploader.single('image'), (req, res, next) => {
    Promise.all([
        ...[64, 256, 512].map(size => sharp(req.file.path)
            .resize(size, size)
            .toFile(`${req.file.destination}\\${size}_${req.file.filename}`))
    ])
        .then(() => {
            return Avatar.create({
                images:
                    [64, 256, 512].map(size => ({
                        img: `${size}_${req.file.filename}`,
                        height: size,
                        width: size
                    }))

            })
        })
        .then(data => {
            console.log(data)
            res.status(201).json({
                    id: data._id,
                    images: data.images.map(img => ({...img.toObject(), img: undefined, url:`${process.env.BASE_PATH}/static/images/${img.img}`}))
                }
            )
        })
        .catch(err => next(err))


})

module.exports = router

