var Router = require("./index.js")

module.exports = ChildRouter

function ChildRouter(opts) {
    opts = opts || {}

    var prefix = opts.prefix

    opts.notFound = function (req, res, opts, cb) {
        var err = new Error("404 Not Found")
        err.statusCode = 404
        cb(err)
    }
    opts.errorHandler = function (req, res, err, opts, cb) {
        cb(err)
    }

    var router = Router(opts)

    if (prefix) {
        var addRoute = router.addRoute
        router.addRoute = function (uri, fn) {
            addRoute(prefix + uri, fn)
        }
    }

    return router
}
