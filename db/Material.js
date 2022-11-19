const db = require('./index')


const schema = new db.Schema(
    {
        owner: {
            type: db.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        readers: [{
            type: db.Schema.Types.ObjectId,
            ref: 'user'
        }],
        date: {
            type: Number,
            default: Date.now()
        },
        name: {
            type: String,
            maxlenght: 50,
            required: true
        },
        description: {
            type: String,
            maxlenght: 300,
            required: false
        },
        previewImage: {
            type: db.Schema.Types.ObjectId,
            required: false,
            ref: 'img'
        },
        documents: {
            type: [db.Schema.Types.ObjectId],
            ref: 'file'
        },
    },

)

module.exports = db.model('material', schema, 'materials')