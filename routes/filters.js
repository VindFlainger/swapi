const {Router} = require('express')
const router = Router()

const Specialization = require('../db/Specialization')
const Method = require('../db/Method')
const User = require('../db/User')

router.get('/', (req, res, next) => {
    Promise.all(
        [
            Specialization.find().select('text value'),
            Method.find().select('text value'),
            User.aggregate(
                [
                    {$group: {_id: null, max_online: {$max: '$price.online.max'}, max_internal: {$max: '$price.internal.max'}, min_online: {$min: '$price.online.min'}, min_internal: {$min: '$price.internal.min'}}},
                    {$project: {max: {$max: ['$max_online', '$max_internal']},min: {$min: ['$min_online', '$min_internal']}, '_id': 0}}
                ])
        ])
        .then(data => {
            res.send({
                specializations: data[0],
                methods: data[1],
                price: data[2][0]
            })
        })
        .catch(err => next(err))
})


module.exports = router

