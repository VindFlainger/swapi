const {Router} = require('express')
const router = Router()

const User = require("../../db/User");
const createError = require("http-errors");

router.get('/', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({'sessions.token': 0})
        .then(data => {
            res.json(data.sessions.sort((a, b) => b.activity - a.activity))
        })
        .catch(err => next(createError(err)))
})

router.delete('/', (req, res, next) => {
    User
        .updateOne({_id: req.user_id}, {$pull: {'sessions': {device: req.query.device}}})
        .then(data => {
            if (!data.modifiedCount) res.json({error: 'Not found'})
            else res.json({success: true})
        })
        .catch(err => next(createError(err)))
})


module.exports = router