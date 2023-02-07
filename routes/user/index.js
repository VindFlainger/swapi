const {Router, json} = require('express')
const router = Router()

const profile = require('./profile')
const classes = require('./classes')
const account = require('./account')
const materials = require('./materials')

const jwt = require("jsonwebtoken");
const {
    authNoSessionToken,
    authSessionTokenExpired,
    authNotUserSession,
    routeNotExistUser
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
        if (payload.role !== 'user') return next(authNotUserSession)
        req.user_id = payload.user_id
        next()
    })
})

router.use('/profile', profile)
router.use('/classes', classes)
router.use('/account', account)
router.use('/materials', materials)


router.use((req, res, next) => {
    next(routeNotExistUser)
})

module.exports = router