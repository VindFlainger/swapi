const {Router, json} = require('express')

const router = Router()
const User = require('../db/User')
const {query} = require("express-validator");
const ReqError = require("../utils/ReqError");
const {idValidator} = require("../utils/customValidators");
const {validationHandler} = require("../utils/validationHandler");

router.get('/findUser',
    query('row')
        .customSanitizer(v => {
            return v?.split(' ') || []
        })
    , (req, res, next) => {
        if (!req.query.row.length) return res.json('')
        else if (req.query.row.length === 1 && /^[0-9a-fA-F]{24}$/.test(req.query.row[0].replace('@', ''))) {
            User.find({
                _id: req.query.row[0].replace('@', '')
            })
                .limit(5)
                .select(
                    {
                        name: 1,
                        surname: 1,
                        avatar: 1,
                        email: 1
                    }
                )
                .populate('avatar')
                .then(data => res.json(data))
                .catch(err => next(err))
        } else {
            User.aggregate()
                .addFields({fullName: {$concat: ['$name', ' ', '$surname']}})
                .match({fullName: new RegExp(`(${req.query.row[0]})|(${req.query.row[1]})`, 'i')})
                .project(
                    {
                        name: 1,
                        surname: 1,
                        avatar: 1,
                        email: 1
                    }
                )
                .limit(5)
                .then(data => {
                    return User.populate(data, {path: 'avatar'})
                })
                .then(data => {
                    res.json(data)
                })
                .catch(err => next(err))
        }
    })

router.get('/short',
    query(['userId'], 'field is required'),
    query('userId')
        .custom(idValidator),
    validationHandler,
    (req, res, next) => {
        User.findById(req.query.userId)
            .select({
                name: 1,
                surname: 1,
                avatar: 1
            })
            .populate('avatar')
            .then(data => res.json(data))
            .catch(err => next(err))
    }
)


router.get('/about',
    query(['userId'], 'field is required'),
    query('userId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        User.findById(req.query.userId)
            .select({
                role: 1,
                name: 1,
                surname: 1,
                sex: 1,
                number: 1,
                avatar: 1,
                email: 1,
                price: 1,
                statistic: 1,
                registrationDate: '$registration.date',
                activityDate: {$max: '$sessions.date'},
                specializations: 1,
                methods: 1,
                opportunities: 1,
                qualification: 1,
                privileges: 1,
                about: 1,
                contacts: 1,
            })
            .populate('methods specializations avatar')
            .then(data => {
                if (data) res.json(data)
                else return next(new ReqError(3, 'no data', 404))
            })
            .catch(err => next(err))
    })

module.exports = router