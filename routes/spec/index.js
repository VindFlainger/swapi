const {Router} = require('express')
const router = Router()

const profile = require('./profile')
const timetable = require('./timetable')
const methods = require('./methods')
const specializations = require('./specializations')
const opportunities = require('./opportunities')
const classes = require('./classes')
const materials = require('./materials')
const account = require('./account')
const qualification = require('./qualification')

const jwt = require("jsonwebtoken");
const {
    authNoSessionToken,
    authSessionTokenExpired,
    routeNotExistSpec,
    authNotSpecSession
} = require("../../utils/errors");


router.use((req, res, next) => {
    if (!req.cookies.s_token && !req.body.s_token) {
        return next(authNoSessionToken)
    }

    jwt.verify(req.cookies.s_token || req.body.s_token, process.env.SECRET_KEY, {}, (err, payload) => {
        if (err) {
            switch (err) {
                case jwt.TokenExpiredError:
                    next(authSessionTokenExpired)
            }
            return
        }
        if (payload.role !== 'spec') return next(authNotSpecSession)
        req.user_id = payload.user_id
        next()
    })
})

router.use('/profile', profile)
router.use('/timetable', timetable)
router.use('/specializations', specializations)
router.use('/methods', methods)
router.use('/opportunities', opportunities)
router.use('/classes', classes)
router.use('/materials', materials)
router.use('/account', account)
router.use('/qualification', qualification)


router.use((req, res, next) => {
    next(routeNotExistSpec)
})

module.exports = router