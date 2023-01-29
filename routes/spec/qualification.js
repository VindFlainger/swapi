const {Router, json} = require('express')

const router = Router()
const User = require('../../db/User')
const {body, query} = require("express-validator");
const {validationHandler} = require("../../modules/validationHandler")
const ReqError = require("../../modules/ReqError");
const {idValidator, textValidator} = require("../../modules/customValidators");


router.get('/category', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({
            'qualification.category': 1
        })
        .populate({
            path: 'qualification.category.documents',
            select: {date: 0, _id: 0, __v: 0}
        })
        .then(data => res.json(data?.qualification?.category))
        .catch(err => next(err))
})


router.put('/category',
    body('name')
        .isLength({max: 20})
        .custom(textValidator)
    ,
    body('documents')
        .isArray({max: 3})
    ,
    body('documents.*')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        User
            .updateOne({_id: req.user_id}, {
                $set: {
                    'qualification.category': {
                        name: req.body.name,
                        documents: req.body.documents,
                    }
                }
            })
            .then(data => {
                if (!data.modifiedCount) next(new ReqError(3, 'no data', 202))
                else res.json({success: true})
            })
            .catch(err => next(err))
    })


router.get('/education', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({
            'qualification.education': 1
        })
        .populate({
            path: 'qualification.education.documents',
            select: {date: 0, __v: 0}
        })
        .then(data => res.json(data?.qualification?.education))
        .catch(err => next(err))
})

router.put('/education',
    body('institution')
        .isLength({max: 20})
        .custom(textValidator)
    ,
    body('graduation')
        .isInt({min: 0})
    ,
    body('documents')
        .isArray({max: 3})
    ,
    body('documents.*')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        User
            .updateOne({_id: req.user_id, 'qualification.education.5': {$exists: 0}}, {
                $addToSet: {
                    'qualification.education': {
                        institution: req.body.institution,
                        graduation: req.body.graduation,
                        documents: req.body.documents
                    }
                }
            })
            .then(data => {
                if (!data.modifiedCount) next(new ReqError(3, 'no data', 202))
                else res.json({success: true})
            })
            .catch(err => next(err))
    })

router.delete('/education',
    query('id')
        .custom(idValidator)
    ,
    (req, res, next) => {
    User
        .updateOne({_id: req.user_id}, {
            $pull: {
                'qualification.education': {
                    _id: req.query.id
                }
            }
        })
        .then(data => res.json(data?.qualification?.education))
        .catch(err => next(err))
})


module.exports = router