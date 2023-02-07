const {Router} = require('express')
const router = Router()

const Notification = require('../../db/Notification')
const {query, body} = require("express-validator");
const {validationHandler} = require("../../utils/validationHandler");
const {idValidator} = require("../../utils/customValidators");
const {noData} = require("../../utils/errors");


router.get('/getNotifications',
    query('limit')
        .default(30)
        .isInt({min: 1, max: 100})
        .toInt()
    ,
    query('offset')
        .default(0)
        .isInt({min: 0})
        .toInt(),
    validationHandler,
    (req, res, next) => {
        Notification.getAll(req.user_id, req.role, {limit: req.query.limit, offset: req.query.offset})
            .then(data => res.json(data))
            .catch(err => next(err))
    })

router.post('/setReadState',
    body('notificationId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Notification.markAsRead(req.body.notificationId, req.user_id, req.role)
            .then(data => {
                if (data.modifiedCount) return res.json({success: true})
                next(noData)
            })
            .catch(err => next(err))
    })

router.get('/getNewCount', (req, res, next) => {
    Notification.getNewCount(req.user_id, req.role)
        .then(data => res.json(data))
        .catch(err => next(err))
})


module.exports = router