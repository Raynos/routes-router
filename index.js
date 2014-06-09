var RoutesRouter = require("routes");
var url = require("url");
var methods = require("http-methods");
var sendError = require("send-data/error");
var extend = require("xtend");
var TypedError = require("error/typed")

var NotFound = TypedError({
    statusCode: 404,
    message: "resource not found {url}",
    notFound: true
})

module.exports = Router;

function Router(opts) {
    opts = opts || {};

    var notFound = opts.notFound || defaultNotFound
    var errorHandler = opts.errorHandler || defaultErrorHandler
    var teardown = opts.teardown || rethrow;
    var useDomains = opts.useDomains;
    var domain;
    var router = RoutesRouter();

    if (useDomains) {
        domain = require("domain");
    }

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
        callback = callback || defaultHandler

        if (useDomains) {
            runDomain();
        } else {
            runRoute();
        }

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

        function runDomain() {
            var d = domain.create();
            d.add(req);
            d.add(res);
            d.on("error", function (err) {
                err.handlingError = null
                try {
                    callback(err);
                } catch (error) {
                    err.handlingError = error
                    if (!res.finished) {
                        res.end()
                    }
                }
                d.exit();
                teardown(err);
            });
            try {
                d.run(runRoute);
            } catch (error) {
                d.exit()
                d.emit("error", error)
            }
        }

        function defaultHandler(err) {
            if (err) {
                if (err.statusCode === 404) {
                    return notFound(req, res)
                }

                errorHandler(req, res, err)
            }
        }
    }
}

function defaultErrorHandler(req, res, err) {
    sendError(req, res, {
        body: err,
        statusCode: err.statusCode || 500
    });
}

function defaultNotFound(req, res) {
    res.statusCode = 404;
    res.end("404 Not Found");
}

function rethrow(err) {
    process.nextTick(function () {
        // fix the process.domain stack
        if (process.domain) {
            process.domain.exit()
        }
        throw err
    })
}
