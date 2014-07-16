var RoutesRouter = require("routes")
var url = require("url")
var methods = require("http-methods")
var extend = require("xtend")
var TypedError = require("error/typed")
var mutableExtend = require("xtend/mutable")

var createDefaultHandler = require("./default-handler.js")

var NotFound = TypedError({
    statusCode: 404,
    message: "resource not found {url}",
    notFound: true
})

function Router(opts) {
    if (!(this instanceof Router)) {
        return new Router(opts)
    }

    opts = opts || {};

    this.defaultHandler = createDefaultHandler(opts)
    var router = this.router = RoutesRouter()
    this.routes = router.routes
    this.routeMap = router.routeMap
    this.match = router.match.bind(router)
}

Router.prototype.addRoute = function addRoute(uri, fn) {
    if (typeof fn === "object") {
        fn = methods(fn)
    }

    this.router.addRoute(uri, fn)
}

Router.prototype.prefix = function prefix(uri, fn) {
    var pattern = uri + "/*?";

    this.router.addRoute(uri, normalizeSplatsFromUri);
    this.router.addRoute(pattern, normalizeSplatsFromPattern);

    function normalizeSplatsFromUri(req, res, opts) {
        var last = opts.splats.length ?
            opts.splats.length - 1 : 0;
        if (opts.splats[last] === undefined) {
            opts.splats[last] = "/";
        }
        fn.apply(this, arguments);
    }

    function normalizeSplatsFromPattern(req, res, opts) {
        var last = opts.splats.length ?
            opts.splats.length - 1 : 0;
        if (typeof opts.splats[last] === "string") {
            opts.splats[last] = "/" + opts.splats[last];
        }
        fn.apply(this, arguments);
    }
}

Router.prototype.handleRequest =
    function handleRequest(req, res, opts, callback) {
        if (typeof opts === "function") {
            callback = opts
            opts = null
        }

        opts = opts || {}
        callback = callback ||
            this.defaultHandler.bind(null, req, res)

        var pathname

        opts.params = opts.params || {}
        opts.splats = opts.splats || []

        var uri

        if (opts.splats && opts.splats.length) {
            pathname = opts.splats.pop();
        } else {
            uri = url.parse(req.url);
            pathname = uri.pathname;
        }

        var route = this.router.match(pathname)

        if (!route) {
            return callback(NotFound({
                url: req.url
            }))
        }

        var params = extend(opts, {
            params: extend(opts.params, route.params),
            splats: opts.splats.concat(route.splats)
        })

        if (uri) {
            params.parsedUrl = uri
        }

        route.fn(req, res, params, callback)
    }

createRouter.Router = Router

module.exports = createRouter

function createRouter(opts) {
    var router = Router(opts)

    var handleRequest = router.handleRequest.bind(router)
    return mutableExtend(handleRequest, router, {
        addRoute: router.addRoute,
        prefix: router.prefix,
        handleRequest: router.handleRequest
    })
}
