const multer = require('multer')

const exts = [
    'png',
    'jpg',
    'docx',
    'pdf'
]

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "static\\documents");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const filter = (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
    );
    const _ext = file.originalname.split('.').pop()

    if (!exts.some(ext => _ext === ext))  cb(new Error('File ext not allowed'))

    cb(null, true)
}

const upload = multer(
    {
        fileFilter: filter,
        storage: storageConfig,
    })

module.exports = upload