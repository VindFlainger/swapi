const db = require('./index')

const schema = new db.Schema({
        owner: {
            type: db.Schema.Types.ObjectId,
            required: true,
        },
        reviewer: {
            type: db.Schema.Types.ObjectId,
            ref: 'user',
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
        },

    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    })

module.exports = db.model('review', schema)