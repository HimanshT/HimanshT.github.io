
//`ExpressError` is a subclass of `Error` that we use to throw errors in our async functions.
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;