var RoutesRouter = require("routes").Router
var url = require("url")

module.exports = Router

function Router(opts) {
    if (typeof opts === "function") {
        opts = { notFound: opts }
    }

    var notFound = opts && opts.notFound || defaultNotFound
    var router = new RoutesRouter()

    handleRequest.addRoute = function addRoute(uri, fn) {
        router.addRoute(uri, fn)
    }

    return handleRequest

    function handleRequest(req, res) {
        var route = router.match(url.parse(req.url).pathname)

        if (!route) {
            return notFound(req, res)
        }

        route.fn(req, res, route.params, route.splats)
    }
}

function defaultNotFound(req, res) {
    res.statusCode = 404
    res.end("404 Not Found")
}
