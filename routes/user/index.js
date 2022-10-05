const {Router, json} = require('express')
const router = Router()

const profile = require('./profile')
const specialists = require('./specialists')
const createError = require("http-errors");


router.use((req, res, next)=>{
    req.user_id = 200000005
    next()
})

router.use('/profile', profile)
router.use('/specialists', specialists)


router.use((req, res, next)=>{
   next(createError(404, 'This path does not exist for base /user'))
})

router.use((err, req, res, next)=>{
    res.json({error: err.message, code: err.code})
})


module.exports = router