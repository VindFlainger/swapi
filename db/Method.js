const db = require('./index')


const schema = new db.Schema({
        text: {
            type: String,
            maxlenght: 30,
            required: true
        },
        value: {
            type: String,
            maxlenght: 30,
            required: true
        }
    },
    {
        statics: {
            getMethods(){
                return this
                    .distinct('_id')
            }
        }
    })

module.exports = db.model('method', schema)