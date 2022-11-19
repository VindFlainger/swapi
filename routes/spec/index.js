const {Router, json} = require('express')
const router = Router()

const profile = require('./profile')
const timetable = require('./timetable')
const sessions = require('./sessions')
const methods = require('./methods')
const specializations = require('./specializations')
const opportunities = require('./opportunities')
const classes = require('./classes')
const materials = require('./materials')
const account = require('./account')
const qualification = require('./qualification')

const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const ReqError = require("../../modules/ReqError");


router.use((req, res, next) => {
    if (!req.cookies.s_token && !req.body.s_token) {
        return next(new ReqError(106, 'session token not received'), 401)
    }

    jwt.verify(req.cookies.s_token || req.body.s_token, process.env.SECRET_KEY, {}, (err, payload) => {
        if (err) {
            switch (err) {
                case jwt.TokenExpiredError:
                    next(new ReqError(105, 'the lifetime of the session token has expired'), 401)
            }
            return
        }
        if (payload.role !== 'spec') return next(new ReqError(107, 'token is not spec token'), 401)
        req.user_id = payload.user_id
        next()
    })
})

router.use('/profile', profile)
router.use('/timetable', timetable)
router.use('/sessions', sessions)
router.use('/specializations', specializations)
router.use('/methods', methods)
router.use('/opportunities', opportunities)
router.use('/classes', classes)
router.use('/materials', materials)
router.use('/account', account)
router.use('/qualification', qualification)


router.use((req, res, next) => {
    next(createError(404, 'This path does not exist for base /spec'))
})

module.exports = router