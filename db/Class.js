const db = require('./index')



const schema = new db.Schema(
    {
        owner: {
            type: Number,
            required: true
        },
        participants: [Number],
        create_date: {
            type: Number,
            default: Date.now()
        },
        start_date: {
            type: Number,
            required: true
        },
        is_completed: {
            type: Number,
            default: false
        },
        is_private: {
            type: Number,
            required: true
        },
        link: {
            type: String,
            maxlenght: 256,
            required: true
        },
        description: {
            type: String,
            maxlenght: 1000,
            required: false
        },
        form: {
            type: Number,
            enum: ['online', 'internal'],
            required: true
        },
    }
  )


module.exports = db.model('class', schema, 'classes')