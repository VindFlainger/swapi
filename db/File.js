const db = require('./index')


const schema = new db.Schema({
        file: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            maxLength: 256
        },
        size: {
            type: Number,
            required: true
        },
    },
    {
        id: false,
        timestamps: {
            createdAt: true,
            updatedAt: false
        },
        virtuals: {
            url: {
                get() {
                    return `${process.env.BASE_PATH}/static/documents/${this.file}`
                }
            }
        },
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                delete ret._id
                delete ret.createdAt
                delete ret.file
            }
        }
    }
)

module.exports = db.model('file', schema, 'files')