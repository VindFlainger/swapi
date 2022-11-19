const {Router} = require('express')
const router = Router()


const User = require('../db/User')
const createError = require("http-errors");

router.get('/email', (req, res, next) => {
    User.getEmails()
        .then(data => {
            res.json(data.includes(req.query.email))
        })
        .catch(err => next(createError(err)))
})


module.exports = router

