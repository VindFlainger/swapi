const {Schema} = require("mongoose");

module.exports = new Schema({
    count: {
        type: Number
    },
    voters: [{
        date: {
            type: Date,
            default: () => new Date()
        },
        voter: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        }
    }]
}, {
    _id: false
})