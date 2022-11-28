const {Router} = require('express')

const router = Router()
const User = require('../../db/User')
const {body} = require("express-validator");
const validationHandler = require('../../modules/validationHandler')
const {idValidator, textValidator} = require('../../modules/customValidators')
const ReqError = require('../../modules/ReqError')
const Method = require("../../db/Method");
const Specialization = require("../../db/Specialization");
const Review = require("../../db/Review");


router.get('', (req, res, next) => {
    User.findOne({_id: req.user_id})
        .select({
            name: 1,
            surname: 1,
            role: 1,
            number: 1,
            avatar: 1,
            sex: 1,
            email: '$registration.email',
            statistic: 1,
        })
        .populate('avatar')
        .then(
            data => {
                res.json(data)
            }
        )
})


/*

router.put('/avatar',
    body(['avatarId'], 'field is required'),
    body('avatarId')
        .custom(idValidator),
    validationHandler,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {$set: {avatar: req.body.avatarId}})
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })

router.put('/person',
    body(['name', 'surname'])
        .isLength({max: 20})
        .isAlpha('ru-RU').withMessage(new ReqError(200, 'incorrect param language', 400))
        .optional()
    ,
    validationHandler
    ,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {
            $set: {
                name: req.body.name,
                surname: req.body.surname
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })

router.put('/about',
    body('shortAbout')
        .isLength({max: 400})
        .custom(textValidator)
        .optional()
    ,
    body('fullAbout')
        .isLength({max: 1000})
        .custom(textValidator)
        .optional()
    ,
    validationHandler
    ,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {
            $set: {
                'about.short': req.body.shortAbout,
                'about.full': req.body.fullAbout
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })


router.put('/connection',
    body('connection')
        .isLength({max: 50})
        .custom(textValidator)
        .optional()
    ,
    body('address')
        .isLength({max: 50})
        .custom(textValidator)
        .optional()
    ,
    validationHandler
    ,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {
            $set: {
                'contacts.connection': req.body.connection,
                'contacts.address': req.body.address
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })


router.put('/price',
    body('minOnline')
        .isInt({min: 0})
        .toInt()
        .optional()
    ,
    body('minInternal')
        .isInt({min: 0})
        .toInt()
        .optional()
    ,
    body('maxOnline')
        .isInt({max: 1000})
        .toInt()
        .optional()
    ,
    body('maxInternal')
        .isInt({max: 1000})
        .toInt()
        .optional()
    ,
    validationHandler
    ,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {
            $set: {
                'price.online.min': req.body.minOnline,
                'price.internal.min': req.body.minInternal,
                'price.online.max': req.body.maxOnline,
                'price.internal.max': req.body.maxInternal,
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })

router.put('/contacts',
    body('messengers')
        .isArray()
        .bail()
        .customSanitizer(v => {
            return v.filter((el, index) => v.indexOf(el) === index)
        })
        .optional()
    ,
    body('messengers.*')
        .isIn(['vk', 'viber', 'telegram', 'instagram', 'whatsapp', 'facebook'])
        .isAlphanumeric()
    ,
    body('phone')
        .isMobilePhone('be-BY')
        .optional()
    ,
    body('email')
        .isEmail()
        .optional()
    ,
    validationHandler
    ,
    (req, res, next) => {
        console.log(req.body.email)
        User.updateOne({_id: req.user_id}, {
            $set: {
                'contacts.messengers': req.body.messengers,
                'contacts.phone': req.body.phone,
                'email': req.body.email
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })

router.put('/links',
    body('links')
        .isArray()
        .bail()
        .customSanitizer(v => {
            return v.filter((el, index) => v.findIndex(el_ => el_.name === el.name) === index)
        })
        .optional()
    ,
    body('links.*.name')
        .isIn(['vk', 'viber', 'telegram', 'instagram', 'whatsapp', 'facebook'])
        .isAlphanumeric()
    ,
    body('links.*.link')
        .isAlphanumeric()
    ,
    validationHandler
    ,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {
            $set: {
                'contacts.links': req.body.links
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })

router.put('/services',
    body('methods')
        .optional()
        .isArray({min: 1})
        .custom(async v => {
            const methods = await Method.getMethods()
            if (!v.every(el => methods.some(method => method.toString() === el))) throw new ReqError(201, 'invalid method id', 400)
            return true
        })
    ,
    body('specializations')
        .optional()
        .isArray({min: 1})
        .custom(async v => {
            const specializations = await Specialization.getSpecializations()
            if (!v.every(el => specializations.some(specialization => specialization.toString() === el))) throw new ReqError(202, 'invalid specialization id', 400)
            return true
        })
    ,
    body('opportunities')
        .isArray()
    ,
    body('opportunities.*')
        .isIn(['internal', 'children', 'teens', 'family'])
    ,
    validationHandler,
    (req, res, next) => {
        const opportunities = Object.assign(
            {},
            ...['internal', 'children', 'teens', 'family'].map(el => ({[el]: false})),
            ...req.body.opportunities.map(el => ({[el]: true}))
        )
        User.updateOne({_id: req.user_id}, {
            $set: {
                opportunities,
                specializations: req.body.specializations,
                methods: req.body.methods
            }
        })
            .then(() => res.json({success: true}))
            .catch(err => next(err))
    })


router.get('/reviews', (req, res, next) => {
    Review
        .find({owner: req.user_id})
        .populate(
            {
                path: 'reviewer',
                select: {name: 1, avatar: 1, surname: 1},
                populate: {path: 'avatar'}
            })
        .then(data => {
            res.json(data)
        })
})
*/


module.exports = router

