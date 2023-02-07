class ReqError {
    constructor(code, message, status = 200, path = '') {
        this.code = code
        this.message = message
        this.status = status
        this.path = path
    }
}

module.exports = ReqError