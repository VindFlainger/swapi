const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'soulworks2022@gmail.com',
        pass: 'kgmhqlsuhvkezmpd',
    }
})



