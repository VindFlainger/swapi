const db = require('./index')

const schema = new db.Schema({
    file: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        default: Date.now()
    }
},)

module.exports = db.model('img', schema, 'images')