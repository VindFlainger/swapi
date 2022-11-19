const db = require('./index')
const {Schema} = require("mongoose");


const schema = new db.Schema({
        file: {
            type: String,
            required: true,
            alias: 'url'
        },
        name: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        date: {
            type: Number,
            default: Date.now(),
        },
    },
    {
        virtuals: {
            url: {
                get() {
                    return `${process.env.BASE_PATH}/static/documents/${this.file}`
                }
            }
        },
        id: false,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        },
    }
)

module.exports = db.model('file', schema, 'files')