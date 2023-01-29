const {Router, json} = require('express')
const router = Router()

const shortinfo = require('./shortinfo')
const sessions = require('./sessions')
const chats = require('./chats')
const notifications = require('./notifications')

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
        req.role = payload.role
        req.user_id = payload.user_id
        next()
    })
})

router.use('/shortinfo', shortinfo)
router.use('/sessions', sessions)
router.use('/chats', chats)
router.use('/notifications', notifications)



router.use((req, res, next)=>{
    next(createError(404, 'This path does not exist'))
})

router.use((err, req, res, next)=>{
    res.json({error: err.message, code: err.code})
})


module.exports = router