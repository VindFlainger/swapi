const {Router} = require('express')

const router = Router()
const Material = require('../../db/Material')
const {query, body} = require("express-validator");
const ReqError = require("../../utils/ReqError");
const {validationHandler} = require("../../utils/validationHandler")
const {idValidator, userValidator} = require('../../utils/customValidators')
const {
    validationFieldRequired,
    materialsIdNotExist,
    authNotUsers,
    materialsNoReader,
    materialsReaderExists
} = require("../../utils/errors");
const {successModified} = require("../../utils/statuses");


router.get('/getMaterials',
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
        Material.getSpecMaterials(req.user_id, req.query.offset, req.query.limit)
            .then(data => {
                res.json(data)
            })
            .catch(err => next(err))
    })


router.post('/addMaterial',
    body(['name', 'documents'], validationFieldRequired)
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
        .optional()
        .isLength({max: 250})
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
                res.json(successModified)
            })
            .catch(err => next(err))
    }
)

router.delete('/delMaterial',
    query(['materialId'], validationFieldRequired)
        .not()
        .isEmpty()
    ,
    query('materialId')
        .custom(idValidator)
        .custom(async (v, {req}) => {
            const material = await Material.findOne({_id: v})
            if (!material) throw materialsIdNotExist
            if (material.owner?.toString() !== req.user_id) throw authNotUsers
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Material
            .deleteOne({owner: req.user_id, _id: req.query.materialId})
            .then(() => res.json(successModified))
            .catch(err => next(err))
    }
)


router.delete('/delReader',
    query(['readerId', 'materialId'], validationFieldRequired),
    query(['readerId', 'materialId'])
        .custom(idValidator)
    ,
    query('readerId')
        .custom(userValidator)
    ,
    query('materialId')
        .custom(async (v, {req}) => {
            const material = await Material.findOne({_id: v})
            if (!material) throw materialsIdNotExist
            if (material.owner?.toString() !== req.user_id) throw authNotUsers
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Material.deleteReader(req.query.materialId, req.query.readerId)
            .then(data => {
                data ? next(successModified) : next(materialsNoReader)
            })
            .catch(err => next(err))

    }
)

router.post('/addReader',
    body(['readerId', 'materialId'], validationFieldRequired),
    body(['readerId', 'materialId'])
        .custom(idValidator)
    ,
    body('materialId')
        .custom(async (v, {req}) => {
            const material = await Material.findOne({_id: v})
            if (!material) throw materialsIdNotExist
            if (material.readers.some(el => el.toString() === req.body.readerId)) throw materialsReaderExists
            if (material.owner?.toString() !== req.user_id) throw authNotUsers
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Material
            .updateOne({owner: req.user_id, _id: req.body.materialId}, {$addToSet: {readers: req.body.readerId}})
            .then(() => res.json(successModified))
            .catch(err => next(err))
    }
)

module.exports = router