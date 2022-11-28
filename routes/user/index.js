const {Router, json} = require('express')
const router = Router()

const profile = require('./profile')
const classes = require('./classes')
const account = require('./account')

const jwt = require("jsonwebtoken");
const ReqError = require("../../modules/ReqError");


router.use((req, res, next)=>{
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
        if (payload.role !== 'user') return next(new ReqError(107, 'token is not user token'), 401)
        req.user_id = payload.user_id
        next()
    })
})

router.use('/profile', profile)
router.use('/classes', classes)
router.use('/account', account)


router.use((req, res, next) => {
    next(new ReqError(108, 'This path does not exist for base /user', 404))
})

module.exports = router