class ExpressError extends Error {
    constructor(message, status) {
        super()
        this.message = message
        this.status = status
    }
}

const asyncError = func => {
    return function (req, res, next) {
        func(req, res, next).catch(e => next(e))
    }
}

module.exports.ExpressError = ExpressError
module.exports.asyncError = asyncError