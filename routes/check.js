const {Router} = require('express')
const router = Router()


const User = require('../db/User')

router.get('/email', (req, res, next) => {
    User.getEmails()
        .then(data => {
            res.json(data.includes(req.query.email))
        })
        .catch(err => next(err))
})


module.exports = router

