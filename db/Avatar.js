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
            virtuals: true
        }
    })


const schema = new db.Schema({
        images: [img],
        date: {
            type: Number,
            default: Date.now()
        },
    }
)

module.exports = db.model('avatar', schema, 'avatars')