const db = require('./index')

const schema = new db.Schema({
        file: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        date: {
            type: Number,
            default: Date.now()
        },
    },

    {
        virtuals: {
            url: {
                get() {
                    return `${process.env.BASE_PATH}/static/images/${this.file}`
                }
            }
        },
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        },
    })

module.exports = db.model('img', schema, 'images')