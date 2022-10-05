const {Router} = require('express')
const router = Router()

const User = require('../../db/User')

router.get('/account', (req, res) => {
    User
        .find({id: req.user_id})
        .then(
            data => res.json(data)
        )
})

router.get('/reviews', (req, res) => {
    User
        .find({id: req.user_id})
        .then(
            data => res.json(data)
        )
})



module.exports = router