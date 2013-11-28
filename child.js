var Router = require("./index.js")

module.exports = ChildRouter

function ChildRouter(opts) {
    opts = opts || {}

    opts.notFound = function (req, res, opts, cb) {
        var err = new Error("404 Not Found")
        err.statusCode = 404
        cb(err)
    }
    opts.errorHandler = function (req, res, err, opts, cb) {
        cb(err)
    }

    return Router(opts)
}
