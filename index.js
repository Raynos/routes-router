var RoutesRouter = require("routes")
var url = require("url")
var methods = require("http-methods")
var sendError = require("send-data/error")
var extend = require("xtend")

module.exports = Router

function Router(opts) {
    opts = opts || {}

    var notFound = opts.notFound || defaultNotFound
    var errorHandler = opts.errorHandler || defaultErrorHandler
    var teardown = opts.teardown || noop
    var useDomains = opts.useDomains
    var domain
    var router = new RoutesRouter()

    if (useDomains) {
        domain = require("domain")
    }

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
    handleRequest.notFound = notFound
    handleRequest.handleError = errorHandler
    return handleRequest

    function handleRequest(req, res, opts, done) {
        if (typeof opts === 'function') {
            done = opts
            opts = null
        }

        var self
        if (done) {
            self = Object.create(handleRequest)
            self.handleError = function(req, res, err) {
                done(err)
            }
        } else {
            self = handleRequest
        }

        if (useDomains) {
            var d = domain.create()
            d.add(req)
            d.add(res)
            d.on("error", function (err) {
                self.handleError(req, res, err)
                teardown(req, res, err)
            })
            d.run(runRoute)
        } else {
            runRoute()
        }

        function runRoute() {
            var route = router.match(url.parse(req.url).pathname)
            if (!route) return self.notFound(req, res, {}, callback)
            var params = extend(route.params, {
                params: route.params,
                splats: route.splats
            })
            route.fn(req, res, params, callback)
            function callback(err) {
                if (err) self.handleError(req, res, err, {}, done)
            }
        }
    }
}

function defaultErrorHandler(req, res, err) {
    if (err.statusCode === 404) {
        return this.notFound(req, res)
    }

    sendError(req, res, {
        body: err,
        statusCode: err.statusCode || 500
    })
}

function defaultNotFound(req, res) {
    res.statusCode = 404
    res.end("404 Not Found")
}

function noop() {}
