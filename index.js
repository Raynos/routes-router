var RoutesRouter = require("routes");
var url = require("url");
var methods = require("http-methods");
var extend = require("xtend");
var TypedError = require("error/typed")

var createDefaultHandler = require("./default-handler.js")

var NotFound = TypedError({
    statusCode: 404,
    message: "resource not found {url}",
    notFound: true
})

module.exports = Router;

function Router(opts) {
    opts = opts || {};

    var defaultHandler = createDefaultHandler(opts)
    var router = RoutesRouter();

    handleRequest.defaultHandler = defaultHandler
    handleRequest.addRoute = function addRoute(uri, fn) {
        if (typeof fn === "object") {
            fn = methods(fn);
        }

        router.addRoute(uri, fn);
    };
    handleRequest.routes = router.routes;
    handleRequest.routeMap = router.routeMap;
    handleRequest.match = router.match.bind(router);
    return handleRequest;

    function handleRequest(req, res, opts, callback) {
        if (typeof opts === "function") {
            callback = opts;
            opts = null;
        }

        opts = opts || {}
        callback = callback ||
            defaultHandler.createHandler(req, res)

        runRoute();

        function runRoute() {
            var pathname

            opts.params = opts.params || {}
            opts.splats = opts.splats || []

            if (opts.splats && opts.splats.length) {
                pathname = opts.splats.pop()
            } else {
                pathname = url.parse(req.url).pathname
            }

            var route = router.match(pathname);

            if (!route) {
                return callback(NotFound({
                    url: req.url
                }));
            }

            var params = extend(opts, route.params, {
                params: extend(opts.params, route.params),
                splats: opts.splats.concat(route.splats)
            });

            route.fn(req, res, params, callback);
        }
    }
}
