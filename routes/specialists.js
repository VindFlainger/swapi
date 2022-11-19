const {Router} = require('express')
const router = Router()

const User = require('../db/User')

const sortParams = (id, form) => {
    switch (Number(id)) {
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

const validate = (...validators) => {
    return validators.every(v => v())
}

const notEmptyArrayValidator = arr => () => Array.isArray(arr) && arr.length
const formValidator = form => () => form === 'online' || form === 'internal'


router.get('/', (req, res) => {
    const offset = req.query.offset || 0
    const limit = req.query.limit || 10

    const methods = validate(notEmptyArrayValidator(req.query.methods)) ? req.query.methods : undefined
    const specializations = validate(notEmptyArrayValidator(req.query.methods)) ? req.query.specializations : undefined
    const form = validate(formValidator(req.query.form)) ? req.query.form : 'online'
    const max_price = Number(req.query.price?.split(':')?.pop())
    const min_price = Number(req.query.price?.split(':')?.shift())


    Promise.all([
        User
            .countDocuments({
                role: 'spec',
                ...methods ? {'methods': {$all: methods}} : undefined,
                ...specializations ? {'specializations': {$all: specializations}} : undefined,
                ...req.query.teens ? {'opportunities.teens': Boolean(req.query.teens)} : undefined,
                ...req.query.family ? {'opportunities.family': Boolean(req.query.family)} : undefined,
                ...req.query.children ? {'opportunities.children': Boolean(req.query.children)} : undefined,
                ...form === 'internal'?{'opportunities.internal': true} : undefined,
                ...max_price?{ $or: [{'price.online.min': {$lt: max_price }},{'price.internal.min': {$lt: max_price }}]}:undefined,
                ...min_price?{$or: [{'price.online.max': {$gt: min_price }}, {'price.internal.max': {$gt: min_price }}]}:undefined
            }),
        User

            .find(
                {
                    role: 'spec',
                    ...methods ? {'methods': {$all: methods}} : undefined,
                    ...specializations ? {'specializations': {$all: specializations}} : undefined,
                    ...req.query.teens ? {'opportunities.teens': Boolean(req.query.teens)} : undefined,
                    ...req.query.family ? {'opportunities.family': Boolean(req.query.family)} : undefined,
                    ...req.query.children ? {'opportunities.children': Boolean(req.query.children)} : undefined,
                    ...form === 'internal'?{'opportunities.internal': true} : undefined,
                    ...max_price?{ $or: [{'price.online.min': {$lt: max_price }},{'price.internal.min': {$lt: max_price }}]}:undefined,
                    ...min_price?{$or: [{'price.online.max': {$gt: min_price }}, {'price.internal.max': {$gt: min_price }}]}:undefined
                }
            )
            .populate('reviews')
            .sort(sortParams(req.query.sort || 1, form)
            )
            .skip(offset)
            .limit(limit)
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
                    'active': {$max: '$sessions.date'}
                }
            ),
    ])
        .then(
            data => res.json({count: data[0], specialists: data[1], offset, limit})
        )
        .catch()
})

module.exports = router