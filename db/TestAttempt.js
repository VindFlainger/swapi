const db = require('./index')
const {Schema} = require("mongoose");

const schema = new db.Schema({
    testId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Test'
    },
    questions: [
        {
            answers: [{
                value: {
                    type: [Number, String],
                    required: true
                },
                points: {
                    type: Number,
                    required: false
                }
            }]
        }
    ],
    totalPoints: {
        type: Number,
        required: false
    }
})


module.exports = db.model('TestAttempts', schema, 'tests.attempts')