// this function is used to catch the error and pass it to next middleware
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}