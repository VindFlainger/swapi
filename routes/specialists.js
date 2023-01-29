const {Router} = require('express')
const router = Router()
const User = require('../db/User')
const {validationHandler} = require('../modules/validationHandler')
const {body} = require("express-validator");
const {specializationValidator, methodValidator} = require("../modules/customValidators");

const sortParams = (id, form) => {
    switch (id) {
        case 1:
            return {'statistic.sessions.confirmed': -1}
        case 2:
            return {[`price.${form}.max`]: -1}
        case 3:
            return {[`price.${form}.min`]: 1}
        case 4:
            return {'registration.date': 1}
    }
}

router.post('/',
    body(['specializations', 'methods', 'opportunities'])
        .optional()
        .isArray()
    ,
    body('specializations')
        .optional()
        .custom(specializationValidator)
    ,
    body('methods')
        .optional()
        .custom(methodValidator)
    ,
    body('opportunities.*')
        .isIn(['family', 'internal', 'teens', 'children'])
    ,
    body('maxPrice')
        .default(1000)
        .isInt({min: 0, max: 1000})
        .toInt()
    ,
    body('minPrice')
        .default(0)
        .isInt({min: 0, max: 1000})
        .toInt()
    ,
    body('limit')
        .default(30)
        .isInt({min: 1})
        .toInt()
    ,
    body('offset')
        .default(0)
        .isInt({min: 0})
        .toInt()
    ,
    body('sort')
        .default(1)
        .isInt({min: 1, max: 4})
        .toInt()
    ,
    validationHandler,
    (req, res, next) => {
        const match = {
            role: 'spec',
            ...req.body.methods && req.body.methods.length ? {'methods': {$all: req.body.methods}} : undefined,
            ...req.body.specializations && req.body.specializations.length ? {'specializations': {$all: req.body.specializations}} : undefined,
            ...req.body.opportunities?.includes('teens') ? {'opportunities.teens': true} : undefined,
            ...req.body.opportunities?.includes('family') ? {'opportunities.family': true} : undefined,
            ...req.body.opportunities?.includes('children') ? {'opportunities.children': true} : undefined,
            ...req.body.opportunities?.includes('internal') ? {'opportunities.internal': true} : undefined,
            ...req.body.maxPrice ? {$or: [{'price.online.min': {$lt: req.body.maxPrice}}, {'price.internal.min': {$lt: req.body.maxPrice}}]} : undefined,
            ...req.body.minPrice ? {$or: [{'price.online.max': {$gt: req.body.minPrice}}, {'price.internal.max': {$gt: req.body.minPrice}}]} : undefined
        }

        Promise.all([
            User
                .countDocuments(match),
            User
                .find(match)
                .populate('reviews')
                .sort(sortParams(req.body.sort, req.body.opportunities?.includes('internal') ? 'internal' : 'online'))
                .skip(req.body.offset)
                .limit(req.body.limit)
                .select({
                    sessions: 1,
                    registration: 1,
                    id: 1,
                    name: 1,
                    surname: 1,
                    email: 1,
                    sex: 1,
                    avatar: 1,
                    price: 1,
                    contacts: 1,
                    opportunities: 1,
                    about: 1,
                    privileges: 1,
                    statistic: 1,
                    'qualification.category': 1
                })
                .select({
                        'statistic': 0,
                        'qualification': 0,
                        'registration': 0,
                        'sessions': 0,
                        'stats': '$statistic.sessions',
                        'degree.name': '$qualification.category.name',
                        'degree.approve': '$qualification.category.approve',
                        'registered': '$registration.date',
                        'active': {$max: '$sessions.activity'}
                    }
                )
                .populate('avatar')
            ,
        ])
            .then(
                data => res.json({
                        count: data[0],
                        specialists: data[1],
                        offset: req.body.offset,
                        limit: req.body.limit
                    }
                )
            )
            .catch(err => next(err))
    }
)

module.exports = router