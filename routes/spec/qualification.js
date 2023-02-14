const {Router, json} = require('express')

const router = Router()
const User = require('../../db/User')
const {body, query} = require("express-validator");
const {validationHandler} = require("../../utils/validationHandler")
const {idValidator} = require("../../utils/customValidators");
const {validationFieldRequired, qualificationMaxLength} = require("../../utils/errors");
const {successModified} = require("../../utils/statuses");


router.get('/getCategory', (req, res, next) => {
    User
        .findOne({_id: req.user_id})
        .select({
            'qualification.category': 1
        })
        .populate({
            path: 'qualification.category.documents',
            select: {date: 0}
        })
        .then(data => res.json(data?.qualification?.category))
        .catch(err => next(err))
})


router.post('/setCategory',
    body(['name', 'documents'], validationFieldRequired)
        .not()
        .notEmpty()
    ,
    body('name')
        .isLength({min: 3, max: 20})
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
            .then(() => res.json(successModified))
            .catch(err => next(err))
    })


router.get('/getEducation', (req, res, next) => {
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

router.post('/addEducation',
    body(['institution', 'graduation', 'documents'], validationFieldRequired)
        .not()
        .notEmpty()
    ,
    body('institution')
        .isLength({min: 3, max: 20})
    ,
    body('graduation')
        .isISO8601()
    ,
    body('documents')
        .isArray({max: 3})
    ,
    body('documents.*')
        .custom(idValidator)
    ,
    body('')
        .custom(async (_, {req}) => {
            const education = await User.getEducation(req.user_id)
            if (education.length >= 5) throw qualificationMaxLength
            return true
        }),
    validationHandler,
    (req, res, next) => {
        User
            .updateOne({_id: req.user_id, 'qualification.education.5': {$exists: 0}}, {
                $push: {
                    'qualification.education': {
                        institution: req.body.institution,
                        graduation: req.body.graduation,
                        documents: req.body.documents
                    }
                }
            })
            .then(() => res.json(successModified))
            .catch(err => next(err))
    })

router.delete('/delEducation',
    query(['institutionId'], validationFieldRequired)
        .not()
        .notEmpty()
    ,
    query('institutionId')
        .custom(idValidator)
    ,
    (req, res, next) => {
        User
            .updateOne({_id: req.user_id}, {
                $pull: {
                    'qualification.education': {
                        _id: req.query.institutionId
                    }
                }
            })
            .then(() => res.json(successModified))
            .catch(err => next(err))
    })


module.exports = router