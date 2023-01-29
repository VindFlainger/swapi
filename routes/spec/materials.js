const {Router} = require('express')

const router = Router()
const Material = require('../../db/Material')
const {query, body} = require("express-validator");
const ReqError = require("../../modules/ReqError");
const {validationHandler} = require("../../modules/validationHandler")
const {idValidator} = require('../../modules/customValidators')


router.get('',
    query('limit')
        .default(10)
        .isInt({min: 1})
        .toInt(),
    query('offset')
        .default(0)
        .isInt({min: 0})
        .toInt(),
    validationHandler,
    (req, res, next) => {
        Promise.all([
            Material.find({owner: req.user_id})
                .sort({date: 1, _id: 1})
                .skip(req.query.offset)
                .limit(req.query.limit)
                .populate(
                    {
                        path: 'readers',
                        select: {
                            name: 1,
                            surname: 1,
                            avatar: 1
                        },
                        populate: {path: 'avatar'}
                    })
                .populate('documents')
                .populate('previewImage')
            ,
            Material.count({owner: req.user_id})
        ])
            .then(([data, count]) =>
                res.json({
                    materials: data,
                    limit: req.query.limit,
                    offset: req.query.offset,
                    totalCount: count
                })
            )
            .catch(err => next(err))
    })


router.put('',
    body(['name', 'documents'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('name')
        .isLength({max: 30})
    ,
    body('documents')
        .isArray({min: 1, max: 9})
    ,
    body('documents.*')
        .custom(idValidator)
    ,
    body('previewImage')
        .optional()
        .custom(idValidator)
    ,
    body('description')
        .isLength({max: 250})
        .optional()
    ,
    validationHandler,
    (req, res, next) => {
        Material.create({
            owner: req.user_id,
            name: req.body.name,
            previewImage: req.body.previewImage,
            description: req.body.description,
            documents: req.body.documents
        })
            .then(() => {
                res.json({success: true})
            })
            .catch(err => next(err))
    }
)

router.delete('',
    query('materialId')
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Material
            .deleteOne({owner: req.user_id, _id: req.query.materialId})
            .then(data => {
                if (!data.deletedCount) next(new ReqError(3, 'no data', 202))
                else res.json({success: true})
            })
            .catch(err => next(err))

    }
)


router.delete('/reader',
    query(['readerId', 'materialId'], 'field is required'),
    query(['readerId', 'materialId'])
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Material
            .updateOne({owner: req.user_id, _id: req.query.materialId}, {$pull: {readers: req.query.readerId}})
            .then(data => {
                if (!data.modifiedCount) next(new ReqError(3, 'no data', 202))
                else res.json({success: true})
            })
            .catch(err => next(err))

    }
)

router.put('/reader',
    body(['readerId', 'materialId'], 'field is required'),
    body(['readerId', 'materialId'])
        .custom(idValidator)
    ,
    validationHandler,
    (req, res, next) => {
        Material
            .updateOne({owner: req.user_id, _id: req.body.materialId}, {$addToSet: {readers: req.body.readerId}})
            .then(data => {
                if (!data.modifiedCount) next(new ReqError(3, 'no data', 202))
                else res.json({success: true})
            })
            .catch(err => next(err))

    }
)


module.exports = router