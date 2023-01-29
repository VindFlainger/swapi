const db = require("../index");

module.exports = new db.Schema({
    name: {
        type: String,
        required: false
    },
    file: {
        type: String,
        required: false,
        transform: v => `http://localhost:3000/static/documents/${v}`,
    },
    _id: false,
})