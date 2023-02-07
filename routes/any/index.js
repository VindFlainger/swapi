const {Router} = require('express')
const router = Router()

const shortinfo = require('./shortinfo')
const sessions = require('./sessions')
const chats = require('./chats')
const notifications = require('./notifications')

const jwt = require("jsonwebtoken");
const {authNoSessionToken, authSessionTokenExpired, routeNotExistAuthed} = require("../../utils/errors");

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
        req.role = payload.role
        req.user_id = payload.user_id
        next()
    })
})

router.use('/shortinfo', shortinfo)
router.use('/sessions', sessions)
router.use('/chats', chats)
router.use('/notifications', notifications)


router.use((req, res, next) => {
    next(routeNotExistAuthed)
})

router.use((err, req, res, next) => {
    res.json({error: err.message, code: err.code})
})


module.exports = router