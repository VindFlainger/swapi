const {Router, json} = require('express')
const router = Router()

const shortinfo = require('./shortinfo')
const sessions = require('./sessions')
const chats = require('./chats')

const createError = require("http-errors");
const jwt = require("jsonwebtoken");


router.use((req, res, next)=>{
    jwt.verify(req.cookies.s_token || req.body.s_token, process.env.SECRET_KEY, {},(err, payload)=>{
        if (err){
            switch (err){
                case jwt.TokenExpiredError: return res.status(400).json({error: err.message, code: 102})
            }
            return
        }
        req.user_id = payload.user_id
        next()
    })
})

router.use('/shortinfo', shortinfo)
router.use('/sessions', sessions)
router.use('/chats', chats)



router.use((req, res, next)=>{
    next(createError(404, 'This path does not exist'))
})

router.use((err, req, res, next)=>{
    res.json({error: err.message, code: err.code})
})


module.exports = router