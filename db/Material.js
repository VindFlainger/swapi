const db = require('./index')



const schema = new db.Schema(
    {
        owner: {
            type: Number,
            required: true
        },
        readers: [Number],
        name: {
            type: String,
            maxlenght: 256,
            required: true
        },
        description: {
            type: String,
            maxlenght: 1000,
            required: false
        },
        links: [{
            url: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        }],
    }
)


module.exports = db.model('material', schema, 'materials')