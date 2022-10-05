const db = require('./index')

const schema = new db.Schema({
        owner: {
            type: Number,
            required: true
        },
        reviewer: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: false
        },
        text: {
            type: String,
            required: false
        },
        advantages: {
            type: String,
            required: false
        },
        disadvantages: {
            type: String,
            required: false
        },
        stars: {
            type: Number,
            max: 5,
            required: true
        }
    },
    {

    })

module.exports = db.model('review', schema)