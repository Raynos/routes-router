var RoutesRouter = require("routes")
var url = require("url")
var methods = require("http-methods")
var sendError = require("send-data/error")
var extend = require("xtend")

module.exports = Router

function Router(opts) {
    opts = opts || {}

    var notFound = opts.notFound || defaultNotFound
    var errorHandler = opts.errorHandler || sendError
    var router = new RoutesRouter()

    handleRequest.addRoute = function addRoute(uri, fn) {
        if (typeof fn === "object") {
            fn = methods(fn)
        }

        router.addRoute(uri, fn)
    }
    handleRequest.routes = router.routes
    handleRequest.routeMap = router.routeMap
    handleRequest.match = function match(uri) {
        return router.match(uri)
    }

    return handleRequest

    function handleRequest(req, res) {
        var route = router.match(url.parse(req.url).pathname)

        if (!route) {
            return notFound(req, res)
        }

        var opts = extend(route.params, {
            params: route.params,
            splats: route.splats
        })

        route.fn(req, res, opts, function (err) {
            if (err) {
                errorHandler(req, res, err)
            }
        })
    }
}

function defaultNotFound(req, res) {
    res.statusCode = 404
    res.end("404 Not Found")
}
