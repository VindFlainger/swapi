const {Router} = require('express')
const router = Router()

const Review = require('../../db/Review')
const User = require("../../db/User");

router.get('/account', (req, res) => {
    User
        .find({id: req.spec_id})
        .then(
            data => res.json(data)
        )
})

router.post('/documents', (req, res) => {

})

router.get('/reviews', (req, res) => {
    Review.aggregate([
        {
            $match: {
                owner: req.spec_id
            }
        },
        {
            $lookup:
                {
                    from: 'users',
                    localField: 'reviewer',
                    foreignField: 'id',
                    as: 'reviewer_info'
                }
        },
        {
            $project: {'reviewer': 0}
        },
        {
            $addFields: {
                'reviewer.id': {$first: '$reviewer_info.id'},
                'reviewer.name': {$first: '$reviewer_info.name'},
                'reviewer.surname': {$first: '$reviewer_info.surname'},
                'reviewer.avatar': {$first: '$reviewer_info.avatar'}
            }
        },
        {
            $project: {'reviewer_info': 0}
        }
    ])
        .then(data => {
            res.json(data)
        })

})


module.exports = router