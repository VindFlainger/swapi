const {Router} = require('express')
const router = Router()

const User = require('../../db/User')
const createError = require("http-errors");


router.get('/', (req, res, next) => {
    User.findOne({_id: req.user_id})
        .select({
            name: 1,
            surname: 1,
            email: '$registration.email',
            role: 1,
            sex: 1,
            avatar: 1,
        })
        .then(data => {
            res.json(data)
        })
        .catch(err => next(createError(err)))
})

router.post('/', (req, res, next) => {

})

module.exports = router