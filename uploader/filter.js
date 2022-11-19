const wrapper = (exts, maxsize = 2000000) => {
    return  (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
        );
        const _ext = file.originalname.split('.').pop()

        if (!exts.some(ext => _ext === ext)) cb(new Error('File ext not allowed'))

        cb(null, true)
    }
}


module.exports = wrapper