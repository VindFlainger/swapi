const {Router} = require('express')
const router = Router()

const User = require('../../db/User')

router.get('/', (req, res) => {
    User
        .find({role: 'spec'})
        .sort({[req.query.sort]: [req.query.desc]})
        .skip(req.query.offset)
        .limit(req.query.limit)
        .select({
            id: 1,
            name: 1,
            surname: 1,
            email: 1,
            sex: 1,
            avatar: 1,
            price: 1
        })
        .then(
            data => res.json(data)
        )
        .catch()
})

module.exports = router