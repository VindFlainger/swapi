const {Router} = require('express')
const router = Router()

const User = require('../db/User')
const Method = require('../db/Method')
const Specialization = require('../db/Specialization')
const {body, validationResult} = require("express-validator");
const bcrypt = require('bcrypt')

const registerData = new Map()
const crypto = require('crypto')
const createError = require("http-errors");
const {sendEmailAuth} = require("../email/confirmation");
const ReqError = require("../modules/ReqError");


router.get('/', (req, res, next) => {
    const data = registerData.get(req.query.token)
    if (data) {
        if (data.date < Date.now() + 1000 * 60 * 60) {
            User.create({
                name: data.payload.name,
                surname: data.payload.surname,
                number: data.payload.number,
                sex: data.payload.sex,
                email: data.payload.email,
                role: data.role,
                registration: {
                    email: data.payload.email,
                    password: bcrypt.hashSync(data.payload.password, 10),
                    date: Date.now()
                },
                statistic: {
                    sessions: {
                        confirmed: 0,
                        cancelled: 0,
                        missed: 0
                    }
                },
                ...data.role === 'spec' ? {
                    methods: data.payload.methods,
                    specializations: data.payload.specializations,
                    opportunities: {
                        internal: data.payload.opportunities.includes('internal'),
                        children: data.payload.opportunities.includes('children'),
                        teens: data.payload.opportunities.includes('teens'),
                        family: data.payload.opportunities.includes('family')
                    },
                    price: {
                        internal: {
                            min: data.payload.price.internal.min,
                            max: data.payload.price.internal.max,
                        },
                        online: {
                            min: data.payload.price.online.min,
                            max: data.payload.price.online.max,
                        },
                    },
                    timetable: [],
                    privileges: {
                        premium: 0,
                        medals: []
                    },
                    contacts: {
                        phone: data.payload.number,
                        address: '',
                        connection: '',
                        messengers: [],
                        links: []
                    },
                    qualification: {
                        education: [],
                    },
                    about: {
                        full: '',
                        short: ''
                    }
                } : undefined

            })
                .then(() => {
                    res.json({success: true})
                })
                .catch(err => {
                    next(createError(err))
                })
        } else {
            registerData.delete(req.query.token)
        }

    }
})


const registration = (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new ReqError(1, errors.array({onlyFirstError: true})))
    }


    User.getEmails()
        .then(emails => {
            if (emails.includes(req.body.email)) throw new ReqError(101, 'This email is already in use')

            const token = crypto.randomBytes(10).toString('hex')
            registerData.set(token, {payload: req.body, date: Date.now(), role: req.path.replaceAll('/', '')})

            return sendEmailAuth(req.body.email, token)
        })
        .then(() => {
            res.json({success: true})
        })
        .catch(err => {
            next(err)
        })
}


router.post('/user',
    body(['name', 'surname', 'sex', 'number', 'password', 'email'], 'field is required')
        .not()
        .isEmpty()
    ,
    body(['name', 'surname'])
        .isAlpha('ru-RU')
        .withMessage('only cyrillic letters are allowed')
        .isLength({max: 20})
        .withMessage('max length is 20')
    ,
    body('sex')
        .isIn(['male', 'female'])
        .withMessage('allowed values male/female')
    ,
    body('email')
        .isEmail()
        .withMessage('email is not valid')
    ,
    body('password')
        .custom(v => {
            if (!/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[!#$%&? "]).*$/.test(v)) throw new Error('password is not valid')
            return true
        })
    ,
    body('number')
        .custom(v => {
            if (!/375[(33)(29)(44)(25)]{2}\d{7}/.test(v)) throw new Error('number is not valid')
            return true
        })
    ,
    registration
)


router.post('/spec',
    body(['name', 'surname', 'sex', 'number',
        'password', 'email', 'methods', 'specializations', 'price'], 'field is required')
        .not()
        .isEmpty()
    ,
    body(['name', 'surname'])
        .isAlpha('ru-RU')
        .withMessage('only cyrillic letters are allowed')
        .isLength({max: 20})
        .withMessage('max length is 20')
    ,
    body('sex')
        .isIn(['male', 'female'])
        .withMessage('allowed values male/female')
    ,
    body('email')
        .isEmail()
        .withMessage('email is not valid')
    ,
    body('password')
        .custom(v => {
            if (!/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[!#$%&? "]).*$/.test(v)) throw new Error('password is not valid')
            return true
        })
    ,
    body('number')
        .custom(v => {
            if (!/375[(33)(29)(44)(25)]{2}\d{7}/.test(v)) throw new Error('number is not valid')
            return true
        })
    ,
    body('opportunities.*')
        .isIn(['internal', 'teens', 'family', 'children'])
        .withMessage('allowed values internal/female')
    ,
    body('methods')
        .custom(async v => {
            const methods = await Method.getMethods()
            if (!v.every(el => methods.some(method => method.toString() === el))) throw new Error('unknown methods')
            return true
        })
    ,
    body('specializations')
        .custom(async v => {
            const specializations = await Specialization.getSpecializations()
            if (!v.every(el => specializations.some(specialization => specialization.toString() === el))) throw new Error('unknown specializations')
            return true
        })
    ,
    body(['price.online.min', 'price.internal.min', 'price.internal.max', 'price.online.max'])
        .isInt({max: 10000, min: 0})
        .toInt()
    ,
    registration
)


module.exports = router