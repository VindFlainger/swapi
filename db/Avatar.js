const db = require('./index')


const img = new db.Schema({
        height: Number,
        width: Number,
        img: String,
        _id: false
    },
    {
        virtuals: {
            url: {
                get() {
                    return `${process.env.BASE_PATH}/static/images/${this.img}`
                }
            }
        },
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
            transform(doc, ret){
                delete ret._id
            }
        },
    })


const schema = new db.Schema({
        images: [img],
    },
    {
        timestamps: {
            createdAt: true
        },
        toJSON: {
            versionKey: false,
            transform(doc, ret){
                delete ret._id
            }
        }
    }
)

module.exports = db.model('avatar', schema, 'avatars')