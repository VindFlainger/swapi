const {Router} = require('express')
const router = Router()
const Material = require('../../db/Material')
const {notExistIdError, materialsNoReader, reactionsAlreadyExist, reactionsNotExist} = require("../../utils/errors");
const {successModified} = require("../../utils/statuses");
const {body, query} = require("express-validator");
const {idValidator} = require("../../utils/customValidators");
const {validationHandler} = require("../../utils/validationHandler");


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
        Material.getReaderMaterials(req.user_id,req.query.limit,req.query.offset)
            .then(([materials, totalCount]) => {
                res.json(
                    {
                        materials,
                        totalCount,
                        offset: req.query.offset,
                        limit: req.query.limit
                    })
            })
            .catch(err => next(err))
    })

router.post('/unsubscribeMaterial',
    body('materialId')
        .custom(idValidator)
        .custom(async v => {
            if (!await Material.isExists(v)) throw notExistIdError
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Material.deleteReader(req.body.materialId, req.user_id)
            .then(data => {
                data ? next(successModified) : next(materialsNoReader)
            })
            .catch(err => next(err))
    })

router.post('/setLikeMaterial',
    body('materialId')
        .custom(idValidator)
        .custom(async v => {
            if (!await Material.isExists(v)) throw notExistIdError
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Material.setLike(req.body.materialId, req.user_id)
            .then(data => {
                data ? next(successModified) : next(reactionsAlreadyExist)
            })
            .catch(err => next(err))
    })

router.post('/delLikeMaterial',
    body('materialId')
        .custom(idValidator)
        .custom(async v => {
            if (!await Material.isExists(v)) throw notExistIdError
            return true
        })
    ,
    validationHandler,
    (req, res, next) => {
        Material.delLike(req.body.materialId, req.user_id)
            .then(data => {
                data ? next(successModified) : next(reactionsNotExist)
            })
            .catch(err => next(err))
    })


module.exports = router
