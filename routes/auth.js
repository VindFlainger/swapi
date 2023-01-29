const {Router} = require('express')

const router = Router()
const User = require('../db/User')

const bcrypt = require('bcrypt')
const {body, validationResult} = require("express-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")
const ReqError = require("../modules/ReqError");


router.post('/login',
    body(['email', 'password', 'device'], 'field is required')
        .not()
        .isEmpty()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true})), 400)
        }

        const token = crypto.randomBytes(32).toString('hex')
        User.getPasswordRole(req.body.email)
            .then(pr => {
                if (!pr?.password)
                    throw new ReqError(102, 'there is no account with such an email', 401)
                if (!bcrypt.compareSync(req.body.password, pr.password))
                    throw new ReqError(103, 'the password is not correct', 401)
                req.role = pr.role
                req.id = pr.id

                return User.addSession(req.body.email, req.body.device, req.ip, token)
            })
            .then(() => {
                return res.json({token, email: req.body.email, role: req.role, id: req.id})
            })
            .catch(err => next(err))
    })

router.post('/session',
    body(['email', 'token'], 'field is required')
        .not()
        .isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true})), 400)
        }


        User.checkToken(req.body.email, req.body.token)
            .then(data => {
                if (!data) throw new ReqError(104, 'invalid long-live token', 401)
                const sessionToken = jwt.sign({
                    role: data.role,
                    user_id: data._id
                }, process.env.SECRET_KEY, {expiresIn: '1d'})
                res.cookie('s_token', sessionToken, {maxAge: 1000 * 60 * 5, httpOnly: true})

                res.json({success: true, role: data.role, s_token: sessionToken})
            })
            .catch(err => {
                next(err)
            })
    })

router.post('/changePassword',
    body(['email', 'password', 'newPassword'], 'field is required')
        .not()
        .isEmpty()
    ,
    body('newPassword')
        .custom(v => {
            if (!/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[!#$%&? "]).*$/.test(v)) throw new Error('new password is not valid')
            return true
        })
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true})), 400)
        }

        User.getPasswordRole(req.body.email)
            .then(pr => {
                if (!pr?.password)
                    throw new ReqError(102, 'there is no account with such an email', 401)
                if (!bcrypt.compareSync(req.body.password, pr.password))
                    throw new ReqError(103, 'the password is not correct', 401)
                req.role = pr.role

                return User.changePassword(req.body.email, bcrypt.hashSync(req.body.newPassword, 10))
            })
            .then(() => {
                return User.deleteAllSessions(req.body.email)
            })
            .then(() => {
                res.json({success: true})
            })
            .catch(err => next(err))
    })

router.post('/recover',
    body(['email'], 'field is required')
        .not()
        .isEmpty()
    ,
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new ReqError(1, errors.array({onlyFirstError: true})), 400)
        }

        User.getEmails()
            .then(emails => {
                if (!emails.includes(req.body.email)) throw new ReqError(102, 'there is no account with such an email', 401)
                res.json({success: true})
            })
            .catch(err => next(err))
    })


module.exports = router