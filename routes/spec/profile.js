const {Router} = require('express')
const router = Router()
const Review = require('../../db/Review')
const User = require("../../db/User");
const {body} = require("express-validator");
const {successModified} = require("../../utils/statuses");
const {validationHandler} = require("../../utils/validationHandler");
const {phoneValidator} = require("../../utils/customValidators");

router.get('/account', (req, res) => {
    User
        .findOne({_id: req.user_id})
        .select({
            name: 1,
            surname: 1,
            number: 1,
            avatar: 1,
            sex: 1,
            email: '$registration.email',
            about: 1,
            contacts: 1,
            statistic: 1,
            privileges: 1
        })
        .populate('methods')
        .populate('specializations')
        .populate({
            path: 'reviews',
            transform: doc => {
                return {stars: doc.stars}
            }
        })
        .populate('avatar')
        .then(
            data => res.json({
                ...data.toObject(),
                reviews: undefined,
                rating:
                    {
                        avgStars: data.reviews ? data.reviews.reduce((acc, el) => acc + el.stars, 0) / data?.reviews?.length : 0,
                        count: data.reviews ? data.reviews.length : 0
                    }

            })
        )
})

router.get('/reviews', (req, res, next) => {
    Review
        .find({owner: req.user_id})
        .populate('reviewer', {name: 1, avatar: 1, surname: 1})
        .then(data => {
            res.json(data)
        })
})



router.post('/personal',
    body('aboutShort')
        .optional()
        .isLength({max: 500})
        .escape()
    ,
    body('aboutFull')
        .optional()
        .isLength({max: 2000})
        .escape()
    ,
    body('address')
        .optional()
        .isLength({max: 80})
        .escape()
    ,
    body('connection')
        .optional()
        .isLength({max: 80})
        .escape()
    ,
    body('phone')
        .optional()
        .custom(phoneValidator),
    body('messengers')
        .optional()
        .isArray({max: 10})
        .customSanitizer(v => v.filter((el, index) => v.indexOf(el) === index))
    ,
    body('messengers.*')
        .isIn(['vk', 'viber', 'telegram', 'whatsapp', 'instagram', 'facebooka'])
    ,
    body('links')
        .optional()
        .isArray({max: 10})
        .customSanitizer(v => v.filter((el, index) => v.findIndex(el_ => el.name === el_.name) === index))
    ,
    body('links.*.name')
        .isIn(['vk', 'viber', 'telegram', 'whatsapp', 'instagram', 'facebook'])
    ,
    body('links.*.link')
        .isLength({max: 30})
        .isAlphanumeric()
    ,
    validationHandler,
    (req, res, next) => {
        User.updateOne({_id: req.user_id}, {
            $set: {
                'about.full': req.body.aboutFull,
                'about.short': req.body.aboutShort,
                'contacts.address': req.body.address,
                'contacts.connection': req.body.connection,
                'contacts.phone': req.body.phone,
                'contacts.messengers': req.body.messengers,
                'contacts.links': req.body.links
            }
        })
            .then(() => {
                res.json(successModified)
            })
            .catch(err => next(err))
    })


module.exports = router