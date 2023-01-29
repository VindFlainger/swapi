const {Router} = require('express')
const router = Router()
const Material = require('../../db/Material')
const {notExistIdError, materialsNoReader, reactionsAlreadyExist, reactionsNotExist} = require("../../modules/errors");
const {successModified} = require("../../modules/statuses");
const {body} = require("express-validator");
const {idValidator} = require("../../modules/customValidators");
const {validationHandler} = require("../../modules/validationHandler");


router.get('/getMaterials',
    (req, res, next) => {
        Material.getReaderMaterials(req.user_id)
            .then(data => {
                res.json(data)
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