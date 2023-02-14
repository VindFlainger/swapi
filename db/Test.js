const db = require('./index')
const ReqError = require("../utils/ReqError");

const checkboxSchema = new db.Schema({
    answers: [
        {
            value: {
                type: [String, Number],
                required: true
            },
            points: {
                type: Number,
                required: false
            }
        }
    ],
    answersCount: {
        type: Number,
        required: false
    }
})

const radioSchema = new db.Schema({
    answers: [
        {
            value: {
                type: [String, Number],
                required: true
            },
            points: {
                type: Number,
                required: false
            }
        }
    ],
})

const schema = new db.Schema({
    questions: {
        type: [
            {

                type: {
                    _id: false,
                    inputType: {
                        type: String,
                        required: true,
                        enum: ['radio', 'checkbox', 'input']
                    },
                    radio: {
                        type: radioSchema,
                        required: false
                    },
                    checkbox: {
                        type: radioSchema,
                        required: false
                    },
                    question: {
                        type: String,
                        required: true
                    }
                },
            },
        ],
        validate: [v => {
            return v.every(el => {
                switch (el.inputType) {
                    case 'radio':
                        return !!el.radio
                    case 'checkbox':
                        return !!el.checkbox
                    case 'input':
                        return !el.radio && !el.checkbox
                    default:
                        return false
                }
            })
        },
           'invalid'
        ]
    },
    afterwords: {
        type: String,
        required: true
    },
    cleverAfterwords: [
        {
            value: {
                type: String,
                required: true
            },
            minPoints: {
                type: Number,
                required: true
            }
        }
    ]
}, {
    statics: {
        createTest(questions, afterwords, cleverAfterwords) {
            return this.create({
                questions,
                afterwords,
                cleverAfterwords
            })
        }
    }
})

module.exports = db.model('Test', schema, 'tests')

