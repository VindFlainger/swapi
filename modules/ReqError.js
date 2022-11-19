class ReqError {
    constructor(code, message, status = 200) {
        this.code = code
        this.message = message
        this.status = status
    }
}

module.exports = ReqError