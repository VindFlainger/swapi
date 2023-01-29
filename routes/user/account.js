const {Router} = require('express')

const router = Router()
const User = require('../../db/User')


router.get('', (req, res, next) => {
    User.findOne({_id: req.user_id})
        .select({
            name: 1,
            surname: 1,
            role: 1,
            number: 1,
            avatar: 1,
            sex: 1,
            email: '$registration.email',
            statistic: 1,
        })
        .populate('avatar')
        .then(
            data => {
                res.json(data)
            }
        )
})

module.exports = router
